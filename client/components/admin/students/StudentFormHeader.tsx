"use client";

import { UserPlus, Sparkles } from "lucide-react";

interface StudentFormHeaderProps {
  mode: "create" | "edit";
}

export const StudentFormHeader = ({ mode }: StudentFormHeaderProps) => {
  const isCreate = mode === "create";

  return (
    <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl p-8 text-white shadow-2xl">
      <div className="flex items-center space-x-4 mb-4">
        <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
          {isCreate ? (
            <UserPlus className="h-8 w-8" />
          ) : (
            <Sparkles className="h-8 w-8" />
          )}
        </div>
        <div>
          <h1 className="text-3xl font-bold text-balance">
            {isCreate ? "Add New Student" : "Edit Student Profile"}
          </h1>
          <p className="text-indigo-100 text-lg">
            {isCreate
              ? "Create a comprehensive student profile"
              : "Update student information and details"}
          </p>
        </div>
      </div>
    </div>
  );
};