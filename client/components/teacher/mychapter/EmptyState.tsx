
import { FileText, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  showAction?: boolean;
}

export default function EmptyState({
  title = "No chapters found",
  description = "No chapters are available yet",
  actionLabel = "Refresh",
  onAction,
  showAction = false,
}: EmptyStateProps) {
  return (
    <Card className="border-0 shadow-2xl bg-gradient-to-br from-white to-gray-50 rounded-2xl sm:rounded-3xl overflow-hidden">
      <CardContent className="p-8 sm:p-12 text-center">
        <div className="w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 rounded-full flex items-center justify-center shadow-2xl">
          <FileText className="h-12 w-12 sm:h-16 sm:w-16 text-white" />
        </div>
        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
          {title}
        </h3>
        <p className="text-gray-600 mb-8 text-sm sm:text-lg">{description}</p>
        {showAction && onAction && (
          <Button
            onClick={onAction}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 rounded-2xl px-6 sm:px-8 py-3"
          >
            <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
            {actionLabel}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}