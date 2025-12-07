
import { Megaphone, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NoAnnouncementsStateProps {
  onCreateClick: () => void;
}

export const NoAnnouncementsState = ({
  onCreateClick,
}: NoAnnouncementsStateProps) => {
  return (
    <div className="text-center py-12 sm:py-16">
      <div className="bg-blue-100 rounded-full w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center mx-auto mb-4 sm:mb-6">
        <Megaphone className="h-8 w-8 sm:h-10 sm:w-10 text-blue-500" />
      </div>
      <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2 sm:mb-3">
        No announcements yet
      </h3>
      <p className="text-gray-500 text-sm sm:text-base mb-4">
        Create your first announcement to get started
      </p>
      <Button
        onClick={onCreateClick}
        className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
      >
        Create Announcement
      </Button>
    </div>
  );
};

export const NoSearchResultsState = () => {
  return (
    <div className="text-center py-12 sm:py-16">
      <div className="bg-blue-100 rounded-full w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center mx-auto mb-4 sm:mb-6">
        <Search className="h-8 w-8 sm:h-10 sm:w-10 text-blue-500" />
      </div>
      <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2 sm:mb-3">
        No announcements found
      </h3>
      <p className="text-gray-500 text-sm sm:text-base">
        Try searching with a different term
      </p>
    </div>
  );
};