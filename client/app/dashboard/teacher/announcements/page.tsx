"use client";
import { useState, useEffect } from "react";
import {
  Bell,
  Pin,
  Calendar,
  Users,
  X,
  Search,
  AlertCircle,
  RefreshCw,
  Image,
  Video,
  FileText,
  Filter,
  ChevronDown,
  SlidersHorizontal,
} from "lucide-react";
import api from "@/lib/api";
export interface Announcement {
  _id: string;
  title: string;
  content: string;
  type: "text" | "image" | "video";
  mediaUrl?: string;
  accentColor: string;
  isPinned: boolean;
  targetAudience: "all" | "specific";
  targetGrades: Array<{ _id: string; grade: string }>;
  createdBy?: { _id: string; name: string };
  createdAt: string;
  updatedAt: string;
}
export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? "s" : ""} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
};
const AnnouncementCard = ({
  announcement,
  onClick,
}: {
  announcement: Announcement;
  onClick: () => void;
}) => {
  const getTypeIcon = () => {
    switch (announcement.type) {
      case "image":
        return <Image className="w-4 h-4" />;
      case "video":
        return <Video className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer transform hover:-translate-y-1 border-2 border-gray-100 group"
      style={{
        borderLeftWidth: "6px",
        borderLeftColor: announcement.accentColor,
      }}
    >
      {announcement.mediaUrl && announcement.type === "image" && (
        <div className="relative h-48 overflow-hidden">
          <img
            src={announcement.mediaUrl}
            alt={announcement.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          {announcement.isPinned && (
            <div className="absolute top-3 right-3 p-2 bg-amber-500 rounded-lg shadow-lg">
              <Pin className="w-4 h-4 text-white fill-current" />
            </div>
          )}
        </div>
      )}
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div
              className="p-2 rounded-lg transition-all"
              style={{ backgroundColor: `${announcement.accentColor}20` }}
            >
              <div style={{ color: announcement.accentColor }}>
                {getTypeIcon()}
              </div>
            </div>
            {announcement.isPinned && announcement.type !== "image" && (
              <div className="flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-semibold shadow-sm">
                <Pin className="w-3 h-3 fill-current" />
                Pinned
              </div>
            )}
          </div>
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2 group-hover:text-emerald-600 transition-colors">
          {announcement.title}
        </h3>
        <p className="text-gray-600 mb-4 line-clamp-3 text-sm leading-relaxed">
          {announcement.content}
        </p>
        <div className="flex items-center justify-between text-sm pt-4 border-t border-gray-100">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-gray-500">
              <Calendar className="w-4 h-4" />
              <span className="text-xs">
                {formatDate(announcement.createdAt)}
              </span>
            </div>
            {announcement.targetAudience === "specific" &&
              announcement.targetGrades.length > 0 && (
                <div className="flex items-center gap-1 text-emerald-600 font-medium">
                  <Users className="w-4 h-4" />
                  <span className="text-xs">
                    {announcement.targetGrades.map((g) => g.grade).join(", ")}
                  </span>
                </div>
              )}
            {announcement.targetAudience === "all" && (
              <div className="flex items-center gap-1 text-purple-600 font-medium">
                <Users className="w-4 h-4" />
                <span className="text-xs">All Grades</span>
              </div>
            )}
          </div>
          {announcement.createdBy && (
            <span className="text-xs text-gray-400 italic">
              by {announcement.createdBy.name}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
const AnnouncementModal = ({
  announcement,
  onClose,
}: {
  announcement: Announcement | null;
  onClose: () => void;
}) => {
  if (!announcement) return null;
  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="sticky top-0 p-6 border-b border-gray-200 flex items-center justify-between z-10 backdrop-blur-sm"
          style={{
            background: `linear-gradient(135deg, ${announcement.accentColor}15, white)`,
          }}
        >
          <div className="flex items-center gap-3 flex-1">
            {announcement.isPinned && (
              <div className="p-2 bg-amber-100 text-amber-700 rounded-xl">
                <Pin className="w-5 h-5 fill-current" />
              </div>
            )}
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-gray-800 mb-1">
                {announcement.title}
              </h2>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(announcement.createdAt).toLocaleDateString(
                    "en-US",
                    {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    }
                  )}
                </span>
                {announcement.createdBy && (
                  <span className="flex items-center gap-1">
                    Posted by <strong>{announcement.createdBy.name}</strong>
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-xl transition-colors ml-4"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="p-8">
          {announcement.mediaUrl && (
            <div className="mb-8 rounded-2xl overflow-hidden shadow-lg">
              {announcement.type === "image" && (
                <img
                  src={announcement.mediaUrl}
                  alt={announcement.title}
                  className="w-full h-auto"
                />
              )}
              {announcement.type === "video" && (
                <video
                  src={announcement.mediaUrl}
                  controls
                  className="w-full h-auto"
                />
              )}
            </div>
          )}
          <div className="prose max-w-none mb-6">
            <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-wrap">
              {announcement.content}
            </p>
          </div>
          {announcement.targetAudience === "specific" &&
            announcement.targetGrades.length > 0 && (
              <div className="mt-6 p-5 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border-2 border-emerald-100">
                <div className="flex items-center gap-3 text-gray-700">
                  <div className="p-2 bg-white rounded-lg">
                    <Users className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <span className="font-semibold text-gray-800 block mb-1">
                      Target Grades
                    </span>
                    <span className="text-emerald-700 font-medium">
                      {announcement.targetGrades.map((g) => g.grade).join(", ")}
                    </span>
                  </div>
                </div>
              </div>
            )}
          {announcement.targetAudience === "all" && (
            <div className="mt-6 p-5 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border-2 border-purple-100">
              <div className="flex items-center gap-3 text-gray-700">
                <div className="p-2 bg-white rounded-lg">
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <span className="font-semibold text-gray-800 block mb-1">
                    Target Audience
                  </span>
                  <span className="text-purple-700 font-medium">
                    All Grades
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
const AnnouncementSkeleton = () => {
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border-2 border-gray-100 animate-pulse">
      <div className="h-48 bg-gray-200"></div>
      <div className="p-6">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
          <div className="w-20 h-6 bg-gray-200 rounded-full"></div>
        </div>
        <div className="h-6 bg-gray-200 rounded mb-2 w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded mb-1 w-full"></div>
        <div className="h-4 bg-gray-200 rounded mb-4 w-5/6"></div>
        <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
          <div className="h-4 bg-gray-200 rounded w-24"></div>
          <div className="h-4 bg-gray-200 rounded w-20"></div>
        </div>
      </div>
    </div>
  );
};
const TeacherAnnouncementsPage = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [filteredAnnouncements, setFilteredAnnouncements] = useState<
    Announcement[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAnnouncement, setSelectedAnnouncement] =
    useState<Announcement | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<
    "all" | "pinned" | "text" | "image" | "video"
  >("all");
  const [showFilters, setShowFilters] = useState(false);
  useEffect(() => {
    fetchAnnouncements();
  }, []);
  useEffect(() => {
    filterAnnouncements();
  }, [announcements, searchQuery, filterType]);
  const fetchAnnouncements = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/announcements");
      const data = await response.data.data;
      setAnnouncements(data || []);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "An error occurred while fetching announcements"
      );
    } finally {
      setLoading(false);
    }
  };
  const filterAnnouncements = () => {
    let filtered = [...announcements];
    if (searchQuery) {
      filtered = filtered.filter(
        (a) =>
          a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (filterType === "pinned") {
      filtered = filtered.filter((a) => a.isPinned);
    } else if (filterType !== "all") {
      filtered = filtered.filter((a) => a.type === filterType);
    }
    setFilteredAnnouncements(filtered);
  };
  const pinnedAnnouncements = filteredAnnouncements.filter((a) => a.isPinned);
  const regularAnnouncements = filteredAnnouncements.filter((a) => !a.isPinned);
  const filterOptions = [
    { value: "all", label: "All", icon: SlidersHorizontal },
    { value: "pinned", label: "Pinned", icon: Pin },
    { value: "text", label: "Text", icon: FileText },
    { value: "image", label: "Image", icon: Image },
    { value: "video", label: "Video", icon: Video },
  ];
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      {}
      <div className="bg-white shadow-xl border-b-4 border-emerald-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg">
                <Bell className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-800 mb-1">
                  School Announcements
                </h1>
                <p className="text-gray-600 text-lg">
                  View all announcements for your grade and school
                </p>
              </div>
            </div>
            <button
              onClick={fetchAnnouncements}
              disabled={loading}
              className="flex items-center gap-2 px-5 py-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              <RefreshCw
                className={`w-5 h-5 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>
          {}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search announcements by title or content..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 focus:outline-none transition-all text-gray-700 placeholder:text-gray-400"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="sm:hidden flex items-center justify-center gap-2 px-5 py-3.5 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-medium"
              >
                <Filter className="w-5 h-5" />
                Filters
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                    showFilters ? "rotate-180" : ""
                  }`}
                />
              </button>
            </div>
            <div
              className={`flex gap-2 flex-wrap ${
                showFilters ? "block" : "hidden sm:flex"
              }`}
            >
              {filterOptions.map((option) => {
                const IconComponent = option.icon;
                return (
                  <button
                    key={option.value}
                    onClick={() => setFilterType(option.value as any)}
                    className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold transition-all ${
                      filterType === option.value
                        ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg scale-105"
                        : "bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    {option.label}
                  </button>
                );
              })}
            </div>
            {}
            <div className="flex items-center gap-4 text-sm text-gray-600 bg-gray-50 rounded-lg px-4 py-2">
              <span className="font-medium">
                Total:{" "}
                <span className="text-emerald-600">{announcements.length}</span>
              </span>
              <span className="text-gray-300">|</span>
              <span className="font-medium">
                Showing:{" "}
                <span className="text-emerald-600">
                  {filteredAnnouncements.length}
                </span>
              </span>
              {pinnedAnnouncements.length > 0 && (
                <>
                  <span className="text-gray-300">|</span>
                  <span className="font-medium flex items-center gap-1">
                    <Pin className="w-4 h-4 text-amber-600" />
                    <span className="text-amber-600">
                      {pinnedAnnouncements.length}
                    </span>
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      {}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <AnnouncementSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-10 h-10 text-red-600" />
            </div>
            <h3 className="text-2xl font-bold text-red-800 mb-2">
              Error Loading Announcements
            </h3>
            <p className="text-red-600 mb-6 text-lg">{error}</p>
            <button
              onClick={fetchAnnouncements}
              className="px-8 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-semibold shadow-lg"
            >
              Try Again
            </button>
          </div>
        ) : filteredAnnouncements.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-16 text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <Bell className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-3xl font-bold text-gray-800 mb-3">
              No Announcements Found
            </h3>
            <p className="text-gray-600 text-lg mb-6">
              {searchQuery || filterType !== "all"
                ? "No announcements match your search criteria. Try adjusting your filters."
                : "There are no announcements available at the moment. Check back later!"}
            </p>
            {(searchQuery || filterType !== "all") && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setFilterType("all");
                }}
                className="px-6 py-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors font-semibold"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <>
            {}
            {pinnedAnnouncements.length > 0 && (
              <div className="mb-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-amber-100 rounded-xl">
                    <Pin className="w-6 h-6 text-amber-600 fill-current" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-800">
                    Pinned Announcements
                  </h2>
                  <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-semibold">
                    {pinnedAnnouncements.length}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pinnedAnnouncements.map((announcement) => (
                    <AnnouncementCard
                      key={announcement._id}
                      announcement={announcement}
                      onClick={() => setSelectedAnnouncement(announcement)}
                    />
                  ))}
                </div>
              </div>
            )}
            {}
            {regularAnnouncements.length > 0 && (
              <div>
                {pinnedAnnouncements.length > 0 && (
                  <div className="flex items-center gap-3 mb-6">
                    <h2 className="text-3xl font-bold text-gray-800">
                      All Announcements
                    </h2>
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-semibold">
                      {regularAnnouncements.length}
                    </span>
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {regularAnnouncements.map((announcement) => (
                    <AnnouncementCard
                      key={announcement._id}
                      announcement={announcement}
                      onClick={() => setSelectedAnnouncement(announcement)}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
      {}
      <AnnouncementModal
        announcement={selectedAnnouncement}
        onClose={() => setSelectedAnnouncement(null)}
      />
    </div>
  );
};
export default TeacherAnnouncementsPage;
