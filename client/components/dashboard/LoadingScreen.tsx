"use client";
import { GraduationCap } from "lucide-react";

export function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl flex items-center justify-center mb-4 animate-pulse">
          <GraduationCap className="h-8 w-8 text-white" />
        </div>
        <p className="text-xl font-bold text-gray-700">Loading...</p>
      </div>
    </div>
  );
}