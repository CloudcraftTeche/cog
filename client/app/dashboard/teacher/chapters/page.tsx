"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  FileText,
  Search,
  ChevronDown,
  ChevronUp,
  BookOpen,
  GraduationCap,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/auth/useAuth";import {
  TeacherChapter,
  TeacherChapterService,
  TeacherGrade,
} from "@/components/teacher/chapter/chapterApiAndTypes";
import TeacherChapterCard from "@/components/teacher/chapter/TeacherChapterCard";

const ITEMS_PER_PAGE = 100;

export default function TeacherChaptersPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [chapters, setChapters] = useState<TeacherChapter[]>([]);
  const [grade, setGrade] = useState<TeacherGrade | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedUnits, setExpandedUnits] = useState<Set<string>>(new Set());

  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchData = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);

      const [gradeData, chaptersResponse] = await Promise.all([
        TeacherChapterService.getTeacherGrade(user.id),
        TeacherChapterService.getChapters({
          page: 1,
          limit: ITEMS_PER_PAGE,
          search: debouncedSearch || undefined,
        }),
      ]);

      setGrade(gradeData);
      setChapters(chaptersResponse.chapters);
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to fetch chapters");
    } finally {
      setLoading(false);
    }
  }, [user?.id, debouncedSearch]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const toggleUnit = useCallback((unitId: string) => {
    setExpandedUnits((prev) => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(unitId)) {
        newExpanded.delete(unitId);
      } else {
        newExpanded.add(unitId);
      }
      return newExpanded;
    });
  }, []);

  const handleDeleteChapter = useCallback(
    async (chapterId: string) => {
      const chapter = chapters.find((c) => c._id === chapterId);
      if (!chapter) return;

      const confirmed = window.confirm(
        `Are you sure you want to delete "${chapter.title}"? This action cannot be undone.`
      );

      if (!confirmed) return;

      try {
        await TeacherChapterService.deleteChapter(chapterId);
        toast.success("Chapter deleted successfully");
        fetchData();
      } catch (error) {
        toast.error("Failed to delete chapter");
        console.error(error);
      }
    },
    [chapters, fetchData]
  );

  const handleViewScores = useCallback(
    (chapterId: string) => {
      router.push(`/dashboard/teacher/chapters/scores/${chapterId}`);
    },
    [router]
  );

  const handleEdit = useCallback(
    (chapterId: string) => {
      router.push(`/dashboard/teacher/chapters/edit/${chapterId}`);
    },
    [router]
  );

  const unitColors = useMemo(
    () => [
      "from-purple-400 to-pink-400",
      "from-blue-400 to-cyan-400",
      "from-green-400 to-emerald-400",
      "from-orange-400 to-red-400",
      "from-rose-400 to-pink-400",
      "from-indigo-400 to-purple-400",
    ],
    []
  );

  const unitGroups = useMemo(() => {
    if (!grade?.units || !Array.isArray(grade.units)) return [];

    return grade.units
      .map((unit, index) => {
        const unitChapters = chapters
          .filter((ch) => {
            const chapterUnitId =
              typeof ch.unitId === "string" ? ch.unitId : ch.unitId;
            const unitIdStr =
              typeof unit._id === "string" ? unit._id : unit._id;
            return chapterUnitId === unitIdStr;
          })
          .sort((a, b) => a.chapterNumber - b.chapterNumber);

        return {
          unit,
          chapters: unitChapters,
          color: unitColors[index % unitColors.length],
        };
      })
      .filter((ug) => ug.chapters.length > 0);
  }, [grade?.units, chapters, unitColors]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading chapters...</p>
        </div>
      </div>
    );
  }

  if (!grade) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 flex items-center justify-center p-4">
        <Card className="max-w-md w-full shadow-2xl rounded-3xl">
          <CardContent className="p-12 text-center">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-red-400 to-pink-400 rounded-full flex items-center justify-center">
              <GraduationCap className="h-12 w-12 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              No Grade Assigned
            </h3>
            <p className="text-gray-600 text-lg">
              Please contact an administrator to assign you to a grade.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

    
  const handleViewSubmissions = (chapterId: string) => {
    router.push(`/dashboard/teacher/chapters/submissions/${chapterId}`);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full animate-float blur-xl"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full animate-float-delayed blur-xl"></div>
        <div className="absolute bottom-40 left-1/4 w-20 h-20 bg-gradient-to-br from-green-400/20 to-emerald-400/20 rounded-full animate-float blur-xl"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <div className="mb-8 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-8 text-white shadow-2xl">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium mb-2">
                <Sparkles className="h-4 w-4" />
                Teacher Dashboard
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                My Chapters - Grade {grade.grade}
              </h1>
              <p className="text-blue-100 text-lg font-medium">
                Manage chapters and track student progress for your assigned
                grade
              </p>
            </div>
            <Button
              className="w-full lg:w-auto bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-white/30 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border-2"
              onClick={() => router.push("/dashboard/teacher/chapters/create")}
              size="lg"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add New Chapter
            </Button>
          </div>
        </div>

        <div className="max-w-xl mx-auto mb-8">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 group-hover:text-purple-500 transition-colors" />
            <Input
              placeholder="Search chapters..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-4 py-6 rounded-2xl border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all shadow-lg bg-white"
            />
          </div>
        </div>

        <div className="space-y-6">
          {unitGroups.length === 0 ? (
            <Card className="border-0 shadow-2xl bg-gradient-to-br from-white to-gray-50 rounded-3xl overflow-hidden">
              <CardContent className="p-12 text-center">
                <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 rounded-full flex items-center justify-center shadow-2xl">
                  <FileText className="h-16 w-16 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  No chapters found
                </h3>
                <p className="text-gray-600 mb-8 text-lg">
                  {searchTerm
                    ? "Try adjusting your search terms"
                    : "Get started by creating your first chapter for Grade " +
                      grade.grade}
                </p>
                <Button
                  onClick={() =>
                    router.push("/dashboard/teacher/chapters/create")
                  }
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 rounded-2xl px-8 py-3"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Create Chapter
                </Button>
              </CardContent>
            </Card>
          ) : (
            unitGroups.map((unitGroup) => {
              const isUnitExpanded = expandedUnits.has(unitGroup.unit._id);

              return (
                <div key={unitGroup.unit._id}>
                  <button
                    onClick={() => toggleUnit(unitGroup.unit._id)}
                    className="w-full bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-5 mb-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div
                          className={`w-12 h-12 rounded-lg bg-gradient-to-br ${unitGroup.color} flex items-center justify-center shadow-md`}
                        >
                          <BookOpen className="h-6 w-6 text-white" />
                        </div>
                        <div className="text-left flex-1">
                          <h3
                            className={`text-xl font-bold bg-gradient-to-r ${unitGroup.color} bg-clip-text text-transparent`}
                          >
                            {unitGroup.unit.name}
                          </h3>
                          <p className="text-gray-600 text-xs">
                            {unitGroup.chapters.length} chapter
                            {unitGroup.chapters.length !== 1 ? "s" : ""}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge
                          className={`bg-gradient-to-r ${unitGroup.color} text-white border-0 px-3 py-1 text-xs`}
                        >
                          {unitGroup.chapters.length}
                        </Badge>
                        {isUnitExpanded ? (
                          <ChevronUp className="h-5 w-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </button>

                  {isUnitExpanded && (
                    <div className="ml-4 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-4 animate-in fade-in slide-in-from-top-4 duration-300">
                      {unitGroup.chapters.map((chapter, chapterIndex) => (
                        <TeacherChapterCard
                          key={chapter._id}
                          chapter={chapter}
                          index={chapterIndex}
                          unitName={unitGroup.unit.name}
                          onViewScores={handleViewScores}
                          onEdit={handleEdit}
                          onViewSubmissions={handleViewSubmissions}
                          onDelete={handleDeleteChapter}
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
