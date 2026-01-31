"use client";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TeacherErrorStateProps {
  error: Error | null;
  onRetry: () => void;
}

export function TeacherErrorState({ error, onRetry }: TeacherErrorStateProps) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 px-4">
      <div className="text-center max-w-md">
        <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Failed to Load Profile
        </h2>
        <p className="text-gray-600 mb-6">
          {error?.message || "An unexpected error occurred"}
        </p>
        <Button
          onClick={onRetry}
          className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
        >
          Try Again
        </Button>
      </div>
    </div>
  );
}