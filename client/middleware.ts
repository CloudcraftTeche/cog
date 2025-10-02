import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ROLE_ROUTES: any = {
  student: "/dashboard/student",
  teacher: "/dashboard/teacher",
  admin: "/dashboard/admin",
  superAdmin: "/dashboard/super-admin",
};

type UserRole = keyof typeof ROLE_ROUTES;

interface VerifyResponse {
  success: boolean;
  userType: any;
  data?: {
    accessToken: string;
    user: {
      id: string;
      role: UserRole;
      name: string;
      email: string;
    };
  };
  accessToken: string;
  message?: string;
}

function redirectToLogin(
  request: NextRequest,
  clearCookies = false
): NextResponse {
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("redirect", request.nextUrl.pathname);

  const response = NextResponse.redirect(loginUrl);

  if (clearCookies) {
    response.cookies.delete("refreshToken");
    response.cookies.delete("accessToken");
  }

  return response;
}

function redirectToDashboard(
  request: NextRequest,
  role: UserRole
): NextResponse {
  const correctDashboard = ROLE_ROUTES[role];
  return NextResponse.redirect(new URL(correctDashboard, request.url));
}

function isDashboardRoute(pathname: string): boolean {
  return Object.values(ROLE_ROUTES).some((route: any) =>
    pathname.startsWith(route)
  );
}

async function verifyToken(
  refreshToken: string
): Promise<VerifyResponse | null> {
  try {
    const verifyResponse = await fetch(
      `${process.env.NEXT_PUBLIC_SERVERURL}/auth/verify`,
      {
        method: "GET",
        headers: {
          Cookie: `refreshToken=${refreshToken}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
        cache: "no-store",
      }
    );

    if (!verifyResponse.ok) {
      console.error("Token verification failed:", verifyResponse.status);
      return null;
    }

    const data: VerifyResponse = await verifyResponse.json();
    return data;
  } catch (error) {
    console.error("Token verification error:", error);
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith("/dashboard")) {
    return NextResponse.next();
  }

  const refreshToken = request.cookies.get("refreshToken")?.value;
  const accessToken = request.cookies.get("accessToken")?.value;

  if (!refreshToken && !accessToken) {
    console.log("No authentication tokens found");
    return redirectToLogin(request);
  }

  const verificationData = await verifyToken(refreshToken || accessToken || "");

  if (!verificationData || !verificationData.success) {
    console.log("Token verification failed");
    return redirectToLogin(request, true);
  }

  const userRole: string = verificationData?.userType;

  if (!userRole || !ROLE_ROUTES[userRole]) {
    console.error("Invalid or missing user role:", userRole);
    return redirectToLogin(request, true);
  }

  const response = NextResponse.next();

  if (verificationData?.accessToken) {
    response.cookies.set("accessToken", verificationData?.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      maxAge: 15 * 60,
      path: "/",
    });
  }

  const correctDashboard = ROLE_ROUTES[userRole];

  if (pathname === "/dashboard" || pathname === "/dashboard/") {
    return redirectToDashboard(request, userRole);
  }

  if (isDashboardRoute(pathname) && !pathname.startsWith(correctDashboard)) {
    console.log(
      `Unauthorized access attempt: ${pathname} by role: ${userRole}`
    );
    return redirectToDashboard(request, userRole);
  }

  return response;
}

export const config = {
  matcher: ["/dashboard/:path*"],
};

export function isValidUserRole(role: string): role is string {
  return role in ROLE_ROUTES;
}

export function getDashboardRoute(role: UserRole): string {
  return ROLE_ROUTES[role];
}
