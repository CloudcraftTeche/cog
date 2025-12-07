import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Megaphone, Plus, Search } from "lucide-react";
interface AnnouncementHeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onCreateClick: () => void;
}
export const AnnouncementHeader = ({
  searchTerm,
  onSearchChange,
  onCreateClick,
}: AnnouncementHeaderProps) => {
  return (
    <div className="mb-6 sm:mb-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="p-2 sm:p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg sm:rounded-xl shadow-lg">
            <Megaphone className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Announcements
            </h1>
            <p className="text-gray-600 text-sm sm:text-base lg:text-lg mt-1">
              Manage and broadcast important updates
            </p>
          </div>
        </div>
        <Button
          onClick={onCreateClick}
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg w-full sm:w-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Announcement
        </Button>
      </div>
      <div className="w-full max-w-full sm:max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 sm:h-5 sm:w-5" />
          <Input
            placeholder="Search announcements..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 sm:pl-10 bg-white border-gray-200 focus:border-blue-400 focus:ring-blue-200 h-10 sm:h-12 text-sm sm:text-base shadow-sm w-full"
          />
        </div>
      </div>
    </div>
  );
};