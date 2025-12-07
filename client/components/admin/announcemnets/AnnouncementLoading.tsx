
import { Loader2 } from "lucide-react";

export const AnnouncementLoading = () => {
  return (
    <div className="flex items-center justify-center py-12 sm:py-16">
      <div className="text-center">
        <Loader2 className="h-10 w-10 sm:h-12 sm:w-12 animate-spin text-blue-500 mx-auto mb-3 sm:mb-4" />
        <p className="text-gray-600 text-base sm:text-lg">
          Loading announcements...
        </p>
      </div>
    </div>
  );
};