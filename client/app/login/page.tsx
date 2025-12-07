"use client";

import { GraduationCap } from "lucide-react";
import LoginForm from "@/components/auth/login-form";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-400 via-orange-500 to-red-500">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="h-screen overflow-y-auto">
      <div className="min-h-screen flex flex-col lg:flex-row flex-1">
        <div className="lg:flex-1 bg-gradient-to-br from-orange-400 via-orange-500 to-red-500 relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-20 left-20 w-32 h-32 border border-white/20 rounded-full"></div>
            <div className="absolute top-40 right-32 w-24 h-24 border border-white/20 rounded-full"></div>
            <div className="absolute bottom-32 left-16 w-40 h-40 border border-white/20 rounded-full"></div>
            <div className="absolute bottom-20 right-20 w-20 h-20 border border-white/20 rounded-full"></div>
          </div>

          <div className="relative z-10 flex flex-col items-center justify-center h-full min-h-screen lg:min-h-0 p-8 text-center text-white">
            <div className="mb-8 lg:mb-12">
              <div className="h-[10vh] w-full my-5">
                <Image
                  src="/logo2.png"
                  alt="Scripture School Logo"
                  width={200}
                  height={200}
                  className="w-full h-full object-contain"
                  priority
                />
              </div>
              <h1 className="text-3xl lg:text-4xl xl:text-5xl font-bold mb-4">
                Scripture School LMS
              </h1>
              <p className="text-lg lg:text-xl opacity-90 mb-8">
                Growing in Faith, Learning Together
              </p>
            </div>

            <div className="relative">
              <div className="w-64 h-64 lg:w-80 lg:h-80 bg-white rounded-full flex items-center justify-center overflow-hidden">
                <div className="w-48 h-48 lg:w-60 lg:h-60 relative">
                  <div className="w-full h-full bg-gradient-to-t from-gray-200 to-gray-100 rounded-full flex items-center justify-center p-5">
                    <Image
                      src="/logo.png"
                      alt="Scripture School Emblem"
                      width={400}
                      height={400}
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          className="lg:flex-1 relative bg-cover bg-center bg-no-repeat min-h-screen lg:min-h-0"
          style={{
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('./jesus.jpg')`,
          }}
        >
          <div className="absolute inset-0 bg-black/30"></div>

          <div className="relative z-10 flex items-center justify-center min-h-screen lg:min-h-0 p-4 sm:p-6 lg:p-8">
            <div className="w-full max-w-sm sm:max-w-md lg:max-w-lg xl:max-w-md py-8">
              <div className="lg:hidden text-center mb-6 sm:mb-8">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <GraduationCap className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white">
                  Scripture School LMS
                </h2>
              </div>

              <div className="bg-transparent rounded-lg sm:rounded-xl p-4 sm:p-6 lg:p-8">
                <LoginForm />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}