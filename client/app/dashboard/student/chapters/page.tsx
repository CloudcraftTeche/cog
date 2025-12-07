"use client";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Search,
  Sparkles,
  FileText,
  ChevronDown,
  ChevronRight,
  BookOpen,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { Chapter, chapterService } from "@/utils/studentChapter.service";
import LoadingState from "@/components/student/chapter/LoadingState";
import ErrorState from "@/components/student/chapter/ErrorState";
import ChapterCardItem from "@/components/student/chapter/ChapterCardItem";
const ITEMS_PER_PAGE = 100;
const unitColors = [
  "from-purple-400 to-pink-400",
  "from-blue-400 to-cyan-400",
  "from-green-400 to-emerald-400",
  "from-orange-400 to-red-400",
  "from-rose-400 to-pink-400",
  "from-indigo-400 to-purple-400",
  "from-violet-400 to-fuchsia-400",
  "from-teal-400 to-emerald-400",
];
interface UnitGroup {
  unitId: string;
  unitName: string;
  unitDescription?: string;
  grade: string;
  chapters: Chapter[];
}
export default function StudentChaptersPage() {
  const { user } = useAuth();
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedUnits, setExpandedUnits] = useState<Set<string>>(new Set());
  const fetchChapters = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      setError(null);
      const params: any = {
        page: 1,
        limit: ITEMS_PER_PAGE,
      };
      if (searchTerm) params.search = searchTerm;
      const response = await chapterService.getChapters(params);
      setChapters(response.data || []);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Failed to fetch chapters";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchChapters();
  }, [user?.id, searchTerm]);
  const toggleUnit = (unitId: string) => {
    const newExpanded = new Set(expandedUnits);
    if (newExpanded.has(unitId)) {
      newExpanded.delete(unitId);
    } else {
      newExpanded.add(unitId);
    }
    setExpandedUnits(newExpanded);
  };
  const filteredChapters = searchTerm
    ? chapters.filter(
        (ch) =>
          ch.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ch.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : chapters;
  const groupedByUnit: UnitGroup[] = (() => {
    const unitMap = new Map<string, UnitGroup>();
    filteredChapters.forEach((chapter) => {
      const unitId = chapter.unitId;
      if (!unitId) return;
      if (!unitMap.has(unitId)) {
        unitMap.set(unitId, {
          unitId: unitId,
          unitName: chapter.unitName || "Unnamed Unit",
          unitDescription: chapter.unitDescription,
          grade: chapter.gradeId?.grade || "N/A",
          chapters: [],
        });
      }
      unitMap.get(unitId)!.chapters.push(chapter);
    });
    unitMap.forEach((unitGroup) => {
      unitGroup.chapters.sort((a, b) => a.chapterNumber - b.chapterNumber);
    });
    return Array.from(unitMap.values());
  })();
  if (loading) {
    return <LoadingState message="Loading chapters..." />;
  }
  if (error) {
    return <ErrorState message={error} />;
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full animate-float blur-xl" />
        <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full animate-float-delayed blur-xl" />
        <div className="absolute bottom-40 left-1/4 w-20 h-20 bg-gradient-to-br from-green-400/20 to-emerald-400/20 rounded-full animate-float blur-xl" />
      </div>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 relative z-10">
        <div className="mb-6 sm:mb-8 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-white shadow-2xl">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium mb-2">
              <Sparkles className="h-3 w-3 sm:h-4 sm:w-4" />
              Student Dashboard
            </div>
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
              My Chapters
            </h1>
            <p className="text-blue-100 text-sm sm:text-lg font-medium">
              Track your learning progress through organized chapters
            </p>
          </div>
        </div>
        <div className="max-w-xl mx-auto mb-6 sm:mb-8">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 sm:h-5 sm:w-5 group-hover:text-purple-500 transition-colors" />
            <Input
              placeholder="Search chapters..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 sm:pl-12 pr-4 py-4 sm:py-6 rounded-2xl border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all shadow-lg bg-white text-sm sm:text-base"
            />
          </div>
        </div>
        <div className="space-y-4 sm:space-y-6">
          {groupedByUnit.length === 0 ? (
            <div className="border-0 shadow-2xl bg-gradient-to-br from-white to-gray-50 rounded-2xl sm:rounded-3xl overflow-hidden p-8 sm:p-12 text-center">
              <div className="w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 rounded-full flex items-center justify-center shadow-2xl">
                <FileText className="h-12 w-12 sm:h-16 sm:w-16 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
                No chapters found
              </h3>
              <p className="text-gray-600 text-sm sm:text-lg">
                {searchTerm
                  ? "Try adjusting your search terms"
                  : "No chapters are available yet"}
              </p>
            </div>
          ) : (
            groupedByUnit.map((unitGroup, index) => {
              const isExpanded = expandedUnits.has(unitGroup.unitId);
              const colorClass = unitColors[index % unitColors.length];
              return (
                <div key={unitGroup.unitId} className="group">
                  <div
                    onClick={() => toggleUnit(unitGroup.unitId)}
                    className="cursor-pointer bg-white rounded-xl sm:rounded-2xl border-2 border-gray-200 hover:border-purple-300 transition-all duration-300 shadow-lg hover:shadow-2xl overflow-hidden"
                  >
                    <div
                      className={`bg-gradient-to-r ${colorClass} p-4 sm:p-6`}
                    >
                      <div className="flex items-center justify-between gap-3 sm:gap-4">
                        <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                          <div className="bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl p-2 sm:p-3 flex-shrink-0">
                            <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs sm:text-sm font-semibold text-white/90 bg-white/20 px-2 sm:px-3 py-1 rounded-full">
                                Grade {unitGroup.grade}
                              </span>
                            </div>
                            <h2 className="text-lg sm:text-2xl font-bold text-white truncate">
                              {unitGroup.unitName}
                            </h2>
                            {unitGroup.unitDescription && (
                              <p className="text-xs sm:text-sm text-white/90 mt-1 line-clamp-1">
                                {unitGroup.unitDescription}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
                          <div className="text-right">
                            <div className="text-xl sm:text-2xl font-bold text-white">
                              {unitGroup.chapters.length}
                            </div>
                            <div className="text-xs sm:text-sm text-white/90 font-medium">
                              {unitGroup.chapters.length === 1
                                ? "Chapter"
                                : "Chapters"}
                            </div>
                          </div>
                          <div className="bg-white/20 backdrop-blur-sm rounded-full p-1.5 sm:p-2">
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                            ) : (
                              <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {isExpanded && (
                    <div className="ml-2 sm:ml-4 mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-4 animate-in fade-in slide-in-from-top-4 duration-300">
                      {unitGroup.chapters.map((chapter, chapterIndex) => (
                        <ChapterCardItem
                          key={chapter._id}
                          chapter={chapter}
                          index={chapterIndex}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
      <style jsx global>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        @keyframes float-delayed {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-15px);
          }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 8s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
