"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Play,
  Search,
  ChevronDown,
  ChevronUp,
  BookOpen,
  GraduationCap,
  Sparkles,
  CheckCircle,
  Clock,
  Award,
  ArrowRight,
  Video,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface Chapter {
  _id: string;
  title: string;
  description: string;
  chapterNumber: number;
  contentType: "video" | "text";
  videoUrl?: string;
  textContent?: string;
  gradeId: {
    _id: string;
    grade: string;
  };
  unitId: string;
  unit: string;
  isCompleted: boolean;
  isAccessible: boolean;
  isInProgress: boolean;
  isLocked: boolean;
  createdAt: Date;
  questions?: Array<any>;
}

interface Grade {
  _id: string;
  grade: string;
  units?: Array<{
    _id: string;
    name: string;
    description?: string;
    orderIndex: number;
  }>;
}

export default function TeacherChaptersPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedGrades, setExpandedGrades] = useState<Set<string>>(new Set());
  const [expandedUnits, setExpandedUnits] = useState<Set<string>>(new Set());

  const fetchChapters = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const gradeRes = await api.get("/auth/me");
      const gradeId = gradeRes.data.data.gradeId._id;

      const res = await api.get(`/teacher-chapters/teacher/${gradeId}`, {
        params: {
          query: searchTerm || "",
        },
      });

      setChapters(res.data.data || []);
    } catch (error) {
      toast.error("Failed to fetch chapters");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGrades = async () => {
    try {
      const gradesRes = await api.get("/grades/all");
      const gradesData = gradesRes.data.data || [];

      const sortedGrades = gradesData.sort((a: Grade, b: Grade) => {
        const gradeA = parseInt(a.grade.replace(/\D/g, "")) || 0;
        const gradeB = parseInt(b.grade.replace(/\D/g, "")) || 0;
        return gradeA - gradeB;
      });

      setGrades(sortedGrades);
    } catch (error) {
      toast.error("Failed to fetch grades");
      console.error(error);
    }
  };

  useEffect(() => {
    if (!user?.id) return;
    fetchGrades();
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) return;
    fetchChapters();
  }, [user?.id, searchTerm]);

  const toggleGrade = (gradeId: string) => {
    const newExpanded = new Set(expandedGrades);
    if (newExpanded.has(gradeId)) {
      newExpanded.delete(gradeId);
    } else {
      newExpanded.add(gradeId);
    }
    setExpandedGrades(newExpanded);
  };

  const toggleUnit = (unitKey: string) => {
    const newExpanded = new Set(expandedUnits);
    if (newExpanded.has(unitKey)) {
      newExpanded.delete(unitKey);
    } else {
      newExpanded.add(unitKey);
    }
    setExpandedUnits(newExpanded);
  };

  const gradeColors = [
    "from-violet-500 via-purple-500 to-fuchsia-500",
    "from-blue-500 via-cyan-500 to-teal-500",
    "from-emerald-500 via-green-500 to-lime-500",
    "from-amber-500 via-orange-500 to-red-500",
    "from-pink-500 via-rose-500 to-red-500",
    "from-indigo-500 via-blue-500 to-cyan-500",
  ];

  const unitColors = [
    "from-purple-400 to-pink-400",
    "from-blue-400 to-cyan-400",
    "from-green-400 to-emerald-400",
    "from-orange-400 to-red-400",
    "from-rose-400 to-pink-400",
    "from-indigo-400 to-purple-400",
  ];

  const filteredChapters = searchTerm
    ? chapters.filter(
        (ch) =>
          ch.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ch.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : chapters;

  const groupedData = grades
    .map((grade) => {
      const gradeChapters = filteredChapters.filter(
        (ch) => ch.gradeId._id === grade._id
      );

      const unitGroups = (grade.units || []).map((unit) => {
        const unitChapters = gradeChapters
          .filter((ch) => {
            const chapterUnitId =
              typeof ch.unitId === "string" ? ch.unitId : ch.unitId;
            const unitIdStr = unit._id
              ? typeof unit._id === "string"
                ? unit._id
                : unit._id
              : "";
            return chapterUnitId === unitIdStr;
          })
          .sort((a, b) => a.chapterNumber - b.chapterNumber);

        return {
          unit,
          chapters: unitChapters,
        };
      });

      return {
        grade,
        unitGroups: unitGroups.filter((ug) => ug.chapters.length > 0),
        totalChapters: gradeChapters.length,
      };
    })
    .filter((g) => g.totalChapters > 0);

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
                Professional Development
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                Teacher Chapters
              </h1>
              <p className="text-blue-100 text-lg font-medium">
                Explore professional development chapters organized by grade and
                unit
              </p>
            </div>
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
          {groupedData.length === 0 ? (
            <Card className="border-0 shadow-2xl bg-gradient-to-br from-white to-gray-50 rounded-3xl overflow-hidden">
              <CardContent className="p-12 text-center">
                <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 rounded-full flex items-center justify-center shadow-2xl">
                  <BookOpen className="h-16 w-16 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  No chapters found
                </h3>
                <p className="text-gray-600 text-lg">
                  {searchTerm
                    ? "Try adjusting your search terms"
                    : "No chapters available at the moment"}
                </p>
              </CardContent>
            </Card>
          ) : (
            groupedData.map((gradeData, gradeIndex) => {
              const isGradeExpanded = expandedGrades.has(gradeData.grade._id);
              const colorClass = gradeColors[gradeIndex % gradeColors.length];

              return (
                <div key={gradeData.grade._id} className="group">
                  <button
                    onClick={() => toggleGrade(gradeData.grade._id)}
                    className="w-full bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 mb-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div
                          className={`w-16 h-16 rounded-xl bg-gradient-to-br ${colorClass} flex items-center justify-center shadow-lg`}
                        >
                          <GraduationCap className="h-8 w-8 text-white" />
                        </div>
                        <div className="text-left flex-1">
                          <h2
                            className={`text-3xl font-bold bg-gradient-to-r ${colorClass} bg-clip-text text-transparent mb-1`}
                          >
                            Grade {gradeData.grade.grade}
                          </h2>
                          <p className="text-gray-600 text-sm">
                            {gradeData.totalChapters} chapter
                            {gradeData.totalChapters !== 1
                              ? "s"
                              : ""} across {gradeData.unitGroups.length} unit
                            {gradeData.unitGroups.length !== 1 ? "s" : ""}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge
                          className={`bg-gradient-to-r ${colorClass} text-white border-0 px-4 py-1`}
                        >
                          {gradeData.totalChapters} Total
                        </Badge>
                        {isGradeExpanded ? (
                          <ChevronUp className="h-6 w-6 text-gray-400" />
                        ) : (
                          <ChevronDown className="h-6 w-6 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </button>

                  {isGradeExpanded && (
                    <div className="ml-4 space-y-4 mb-6 animate-in fade-in slide-in-from-top-4 duration-300">
                      {gradeData.unitGroups.map((unitGroup, unitIndex) => {
                        const unitKey = `${gradeData.grade._id}-${unitGroup.unit._id}`;
                        const isUnitExpanded = expandedUnits.has(unitKey);
                        const unitColor =
                          unitColors[unitIndex % unitColors.length];

                        const completedCount = unitGroup.chapters.filter(
                          (ch) => ch.isCompleted
                        ).length;
                        const totalCount = unitGroup.chapters.length;
                        const progressPercentage =
                          (completedCount / totalCount) * 100;

                        return (
                          <div key={unitKey} className="ml-4">
                            <button
                              onClick={() => toggleUnit(unitKey)}
                              className="w-full bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-5 mb-3"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3 flex-1">
                                  <div
                                    className={`w-12 h-12 rounded-lg bg-gradient-to-br ${unitColor} flex items-center justify-center shadow-md`}
                                  >
                                    <BookOpen className="h-6 w-6 text-white" />
                                  </div>
                                  <div className="text-left flex-1">
                                    <h3
                                      className={`text-xl font-bold bg-gradient-to-r ${unitColor} bg-clip-text text-transparent`}
                                    >
                                      {unitGroup.unit.name}
                                    </h3>
                                    <div className="flex items-center gap-4 mt-1">
                                      <p className="text-gray-600 text-xs">
                                        {totalCount} chapter
                                        {totalCount !== 1 ? "s" : ""}
                                      </p>
                                      <div className="flex items-center gap-2">
                                        <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                                          <div
                                            className={`h-full bg-gradient-to-r ${unitColor} transition-all duration-500`}
                                            style={{
                                              width: `${progressPercentage}%`,
                                            }}
                                          ></div>
                                        </div>
                                        <span className="text-xs font-semibold text-gray-600">
                                          {completedCount}/{totalCount}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <Badge
                                    className={`bg-gradient-to-r ${unitColor} text-white border-0 px-3 py-1 text-xs`}
                                  >
                                    {Math.round(progressPercentage)}%
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
                                {unitGroup.chapters.map(
                                  (chapter, chapterIndex) => {
                                    const statusIcon = chapter.isCompleted ? (
                                      <CheckCircle className="h-5 w-5 text-white" />
                                    ) : chapter.isInProgress ? (
                                      <Play className="h-5 w-5 text-white" />
                                    ) : (
                                      <Clock className="h-5 w-5 text-white" />
                                    );

                                    const gradientClass = chapter.isCompleted
                                      ? "from-green-400 via-emerald-500 to-teal-500"
                                      : chapter.isInProgress
                                        ? "from-orange-400 via-amber-500 to-yellow-500"
                                        : chapter.isAccessible
                                          ? unitColor
                                          : "from-gray-300 via-gray-400 to-gray-500";

                                    return (
                                      <Card
                                        key={chapter._id}
                                        className={`border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:scale-105 bg-white overflow-hidden rounded-3xl group ${
                                          !chapter.isAccessible
                                            ? "opacity-60"
                                            : ""
                                        }`}
                                      >
                                        <CardContent className="p-0">
                                          <div
                                            className={`h-3 bg-gradient-to-r ${
                                              chapter.contentType === "video"
                                                ? "from-red-400 via-pink-500 to-purple-500"
                                                : "from-blue-400 via-indigo-500 to-purple-500"
                                            }`}
                                          />
                                          <div className="p-8 space-y-6">
                                            <div className="flex items-start gap-5">
                                              <div
                                                className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-xl transform group-hover:scale-110 transition-transform duration-300 bg-gradient-to-br ${gradientClass}`}
                                              >
                                                {chapter.contentType ===
                                                "video" ? (
                                                  <Video className="h-8 w-8 text-white" />
                                                ) : (
                                                  <FileText className="h-8 w-8 text-white" />
                                                )}
                                              </div>
                                              <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-3 mb-3">
                                                  <h3 className="text-xl font-bold text-gray-900 truncate">
                                                    {chapter.title}
                                                  </h3>
                                                  <Badge
                                                    className={`capitalize text-sm font-semibold px-3 py-1 rounded-full ${
                                                      chapter.contentType ===
                                                      "video"
                                                        ? "bg-gradient-to-r from-red-100 to-pink-100 text-red-700 border-red-200"
                                                        : "bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 border-blue-200"
                                                    }`}
                                                  >
                                                    {chapter.contentType}
                                                  </Badge>
                                                </div>
                                                <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">
                                                  {chapter.description}
                                                </p>
                                              </div>
                                            </div>

                                            <div className="bg-gradient-to-r from-gray-50 to-blue-50/50 rounded-2xl p-4 space-y-2 text-sm border border-gray-100">
                                              <div className="flex items-center justify-between">
                                                <span className="text-gray-600 font-medium">
                                                  Chapter:
                                                </span>
                                                <span className="font-bold text-gray-900">
                                                  {chapter.chapterNumber}
                                                </span>
                                              </div>
                                              <div className="flex items-center justify-between">
                                                <span className="text-gray-600 font-medium">
                                                  Status:
                                                </span>
                                                <span className="font-bold text-gray-900">
                                                  {chapter.isCompleted
                                                    ? "Completed"
                                                    : chapter.isInProgress
                                                      ? "In Progress"
                                                      : chapter.isAccessible
                                                        ? "Available"
                                                        : "Locked"}
                                                </span>
                                              </div>
                                              <div className="flex items-center justify-between">
                                                <span className="text-gray-600 font-medium">
                                                  Created:
                                                </span>
                                                <span className="font-bold text-gray-900">
                                                  {new Date(
                                                    chapter.createdAt
                                                  ).toLocaleDateString()}
                                                </span>
                                              </div>
                                            </div>

                                            <div className="pt-2">
                                              {chapter.isAccessible ? (
                                                <Button
                                                  className={`w-full bg-gradient-to-r ${gradientClass} hover:shadow-lg transform hover:scale-105 transition-all duration-200 text-white font-semibold py-3 rounded-xl`}
                                                  onClick={() =>
                                                    router.push(
                                                      `/dashboard/teacher/my-chapters/${chapter._id}`
                                                    )
                                                  }
                                                >
                                                  {chapter.isCompleted ? (
                                                    <>
                                                      <Award className="h-4 w-4 mr-2" />
                                                      Review Chapter
                                                    </>
                                                  ) : (
                                                    <>
                                                      <Play className="h-4 w-4 mr-2" />
                                                      Start Learning
                                                    </>
                                                  )}
                                                  <ArrowRight className="h-4 w-4 ml-2" />
                                                </Button>
                                              ) : (
                                                <Button
                                                  disabled
                                                  variant="outline"
                                                  className="w-full bg-gray-50 border-gray-300 text-gray-500 py-3 rounded-xl cursor-not-allowed"
                                                >
                                                  <Clock className="h-4 w-4 mr-2" />
                                                  Complete Previous First
                                                </Button>
                                              )}
                                            </div>
                                          </div>
                                        </CardContent>
                                      </Card>
                                    );
                                  }
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
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
