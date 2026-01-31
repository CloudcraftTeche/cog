"use client";

import { useAuth } from "@/hooks/auth/useAuth";import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import SuperAdminDashboard from "@/components/admin-dashboard";
import StudentDashboard from "@/components/student-dashboard";
import TeacherDashboard from "@/components/teacher-dashboard";
import AdminDashboard from "@/components/admin-dashboard";

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl flex items-center justify-center mb-4 animate-pulse">
            <Loader2 className="h-8 w-8 text-white animate-spin" />
          </div>
          <p className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Loading Dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }
  if (user.role === "admin" && user.name === "Pastor") {
    return <SuperAdminDashboard />;
  }

  const renderDashboard = () => {
    switch (user.role) {
      case "admin":
        return <AdminDashboard />;
      case "superAdmin":
        return <SuperAdminDashboard />;
      case "teacher":
        return <TeacherDashboard />;
      case "student":
        return <StudentDashboard />;
      default:
        return (
          <div className="h-full flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-3xl flex items-center justify-center mb-4">
                <AlertCircle className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Invalid Role
              </h2>
              <p className="text-gray-600 mb-4">
                Your account role is not recognized. Please contact support.
              </p>
              <button
                onClick={() => router.replace("/login")}
                className="px-6 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-semibold hover:scale-105 transition-transform"
              >
                Go to Login
              </button>
            </div>
          </div>
        );
    }
  };

  return <>{renderDashboard()}</>;
}
