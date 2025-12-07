"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Save } from "lucide-react";

interface FormActionsProps {
  isLoading: boolean;
  onCancel: () => void;
  onSave: () => void;
}

export const FormActions: React.FC<FormActionsProps> = ({
  isLoading,
  onCancel,
  onSave,
}) => {
  return (
    <div className="mt-12 pt-8 border-t border-gray-200">
      <div className="flex justify-end space-x-4">
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
          className="px-8 py-3 border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all duration-200"
        >
          Cancel
        </Button>
        <Button
          onClick={onSave}
          disabled={isLoading}
          className="px-8 py-3 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 hover:from-purple-600 hover:via-pink-600 hover:to-orange-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 min-w-[160px]"
        >
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Updating...</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Save className="h-5 w-5" />
              <span>Update Profile</span>
            </div>
          )}
        </Button>
      </div>
    </div>
  );
};