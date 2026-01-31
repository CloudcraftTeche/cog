"use client";
import { Loader2 } from "lucide-react";

export function TeacherLoadingState() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-cyan-600 rounded-full blur-2xl opacity-20 animate-pulse"></div>
        <Loader2 className="relative animate-spin w-12 h-12 text-emerald-600" />
      </div>
    </div>
  );
}