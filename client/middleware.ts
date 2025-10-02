import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ROLE_ROUTES: Record<string, string> = {
  student: "/dashboard/student",
  teacher: "/dashboard/teacher",
  admin: "/dashboard/admin",
  superAdmin: "/dashboard/super-admin",
};

type UserRole = keyof typeof ROLE_ROUTES;

interface VerifyResponse {
  success: boolean;
  userType: UserRole;
  accessToken: string;
  user?: {
    id: string;
    role: UserRole;
    name: string;
    email: string;
  };
}

function redirectToLogin(request: NextRequest, clearCookies = false): NextResponse {
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("redirect", request.nextUrl.pathname);

  const response = NextResponse.redirect(loginUrl);
  if (clearCookies) {
    response.cookies.delete("refreshToken");
    response.cookies.delete("accessToken");
  }
  return response;
}

function redirectToDashboard(request: NextRequest, role: UserRole): NextResponse {
  const correctDashboard = ROLE_ROUTES[role];
  return NextResponse.redirect(new URL(correctDashboard, request.url));
}

async function verifyToken(refreshToken: string): Promise<VerifyResponse | null> {
  try {
    const verifyResponse = await fetch(
      `${process.env.NEXT_PUBLIC_SERVERURL}/auth/verify`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${refreshToken}`, // ✅ fallback to header
        },
        cache: "no-store",
      }
    );

    if (!verifyResponse.ok) return null;
    return (await verifyResponse.json()) as VerifyResponse;
  } catch (error) {
    console.error("❌ Middleware token verify error:", error);
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
    return redirectToLogin(request);
  }

  const verificationData = await verifyToken(refreshToken || accessToken || "");

  if (!verificationData || !verificationData.success) {
    return redirectToLogin(request, true);
  }

  const userRole: UserRole = verificationData.userType;

  if (!userRole || !ROLE_ROUTES[userRole]) {
    return redirectToLogin(request, true);
  }

  const response = NextResponse.next();

  if (verificationData.accessToken) {
    response.cookies.set("accessToken", verificationData.accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 15 * 60,
    });
  }

  const correctDashboard = ROLE_ROUTES[userRole];

  if (pathname === "/dashboard" || pathname === "/dashboard/") {
    return redirectToDashboard(request, userRole);
  }

  if (!pathname.startsWith(correctDashboard)) {
    return redirectToDashboard(request, userRole);
  }

  return response;
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
