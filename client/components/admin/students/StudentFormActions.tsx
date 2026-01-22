"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { UserPlus, Save, Loader2 } from "lucide-react";

interface StudentFormActionsProps {
  mode: "create" | "edit";
  isLoading: boolean;
  onSubmit: () => void;
  onCancel: () => void;
}

export const StudentFormActions = ({
  mode,
  isLoading,
  onSubmit,
  onCancel,
}: StudentFormActionsProps) => {
  const isCreate = mode === "create";

  return (
    <>
      <Separator className="my-8 bg-gradient-to-r from-transparent via-gray-300 to-transparent h-px" />

      <div className="flex justify-end space-x-6">
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
          className="px-8 py-3 rounded-2xl border-2 border-gray-300 hover:border-gray-400 bg-white hover:bg-gray-50 text-gray-700 font-medium transition-all duration-200"
        >
          Cancel
        </Button>

        <Button
          onClick={onSubmit}
          disabled={isLoading}
          className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-8 py-3 rounded-2xl font-bold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200 min-w-[160px]"
        >
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>{isCreate ? "Creating..." : "Updating..."}</span>
            </div>
          ) : (
            <>
              {isCreate ? (
                <>
                  <UserPlus className="h-5 w-5 mr-2" /> Create Student
                </>
              ) : (
                <>
                  <Save className="h-5 w-5 mr-2" /> Update Student
                </>
              )}
            </>
          )}
        </Button>
      </div>
    </>
  );
};