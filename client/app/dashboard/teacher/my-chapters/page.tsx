"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Award,
  CheckCircle,
  Clock,
  Play,
  Search,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import api from "@/lib/api";
import { toast } from "sonner";

interface Chapter {
  _id: string;
  title: string;
  description: string;
  contentType: "video" | "text";
  videoUrl?: string;
  textContent?: string;
  isCompleted: boolean;
  isAccessible: boolean;
  isInProgress: boolean;
  isLocked: boolean;
  createdAt: Date;
  unit: string;
  chapterNumber: number;
}

const TeacherChaptersPage = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [expandedUnits, setExpandedUnits] = useState<Set<string>>(new Set());

  const fetchChapters = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const res = await api.get(`/teacher-chapter/teacher/${user.id}`, {
        params: {
          query: query || "",
        },
      });
      const data = res.data;
      setChapters(data.data || []);
    } catch (err: any) {
      setError("Failed to load chapters. Please try again later.");
      toast.error("Failed to load chapters");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChapters();
  }, [user?.id, query]);

  const toggleUnit = (unitName: string) => {
    const newExpanded = new Set(expandedUnits);
    if (newExpanded.has(unitName)) {
      newExpanded.delete(unitName);
    } else {
      newExpanded.add(unitName);
    }
    setExpandedUnits(newExpanded);
  };

  const groupedChapters = chapters.reduce((acc, chapter) => {
    const unit = chapter.unit || "Other";
    if (!acc[unit]) {
      acc[unit] = [];
    }
    acc[unit].push(chapter);
    return acc;
  }, {} as Record<string, Chapter[]>);

  Object.keys(groupedChapters).forEach((unit) => {
    groupedChapters[unit].sort((a, b) => a.chapterNumber - b.chapterNumber);
  });

  const unitColors = [
    "from-violet-500 via-purple-500 to-fuchsia-500",
    "from-blue-500 via-cyan-500 to-teal-500",
    "from-emerald-500 via-green-500 to-lime-500",
    "from-amber-500 via-orange-500 to-red-500",
    "from-pink-500 via-rose-500 to-red-500",
    "from-indigo-500 via-blue-500 to-cyan-500",
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading chapters...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl shadow-xl p-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">⚠️</span>
          </div>
          <p className="text-red-600 font-semibold">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full animate-float blur-xl"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full animate-float-delayed blur-xl"></div>
        <div className="absolute bottom-40 left-1/4 w-20 h-20 bg-gradient-to-br from-green-400/20 to-emerald-400/20 rounded-full animate-float blur-xl"></div>
        <div className="absolute bottom-20 right-1/3 w-28 h-28 bg-gradient-to-br from-orange-400/20 to-red-400/20 rounded-full animate-float-delayed blur-xl"></div>
      </div>

      <div className="container mx-auto px-4 py-6 relative z-10 max-w-7xl">
        <header className="mb-12">
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent mb-4 py-3">
              Training Chapters
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Explore professional development chapters organized by units. Click on a unit to expand and view all available chapters
            </p>
          </div>

          <div className="max-w-xl mx-auto mb-8">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 group-hover:text-purple-500 transition-colors" />
              <Input
                placeholder="Search chapters..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-12 pr-4 py-6 rounded-2xl border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all shadow-lg"
              />
            </div>
          </div>
        </header>

        <section className="space-y-6">
          {Object.keys(groupedChapters).length === 0 ? (
            <div className="text-center py-20">
              <div className="bg-white rounded-3xl p-12 max-w-md mx-auto shadow-2xl">
                <div className="w-20 h-20 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full mx-auto mb-6 flex items-center justify-center">
                  <Search className="h-10 w-10 text-white" />
                </div>
                <p className="text-gray-800 font-bold text-xl mb-2">
                  No chapters found
                </p>
                <p className="text-gray-500">Try adjusting your search terms</p>
              </div>
            </div>
          ) : (
            Object.entries(groupedChapters).map(
              ([unitName, unitChapters], unitIndex) => {
                const isExpanded = expandedUnits.has(unitName);
                const completedCount = unitChapters.filter(
                  (ch) => ch.isCompleted
                ).length;
                const totalCount = unitChapters.length;
                const progressPercentage = (completedCount / totalCount) * 100;
                const colorClass = unitColors[unitIndex % unitColors.length];

                return (
                  <div key={unitName} className="group">
                    <button
                      onClick={() => toggleUnit(unitName)}
                      className="w-full bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 mb-4"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          <div
                            className={`w-14 h-14 rounded-xl bg-gradient-to-br ${colorClass} flex items-center justify-center shadow-lg`}
                          >
                            <BookOpen className="h-7 w-7 text-white" />
                          </div>
                          <div className="text-left flex-1">
                            <h2
                              className={`text-2xl font-bold bg-gradient-to-r ${colorClass} bg-clip-text text-transparent mb-1`}
                            >
                              {unitName}
                            </h2>
                            <div className="flex items-center gap-4">
                              <p className="text-gray-600 text-sm">
                                {totalCount} chapter
                                {totalCount !== 1 ? "s" : ""}
                              </p>
                              <div className="flex items-center gap-2">
                                <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full bg-gradient-to-r ${colorClass} transition-all duration-500`}
                                    style={{ width: `${progressPercentage}%` }}
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
                            className={`bg-gradient-to-r ${colorClass} text-white border-0 px-4 py-1`}
                          >
                            {Math.round(progressPercentage)}% Complete
                          </Badge>
                          {isExpanded ? (
                            <ChevronUp className="h-6 w-6 text-gray-400" />
                          ) : (
                            <ChevronDown className="h-6 w-6 text-gray-400" />
                          )}
                        </div>
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 animate-in fade-in slide-in-from-top-4 duration-300">
                        {unitChapters.map((chapter) => {
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
                            ? colorClass
                            : "from-gray-300 via-gray-400 to-gray-500";

                          return (
                            <Card
                              key={chapter._id}
                              className={`group border-0 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 bg-gradient-to-br ${gradientClass} p-[3px] rounded-2xl ${
                                chapter.isAccessible
                                  ? "cursor-pointer"
                                  : "opacity-60"
                              }`}
                            >
                              <CardContent className="bg-white rounded-2xl p-6 h-full">
                                <div className="space-y-4">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                      <Badge
                                        className={`bg-gradient-to-r ${gradientClass} text-white border-0 text-xs px-3 py-1`}
                                      >
                                        Ch. {chapter.chapterNumber}
                                      </Badge>
                                      <div
                                        className={`w-11 h-11 rounded-xl flex items-center justify-center bg-gradient-to-br ${gradientClass} shadow-lg transform group-hover:scale-110 transition-transform`}
                                      >
                                        {statusIcon}
                                      </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      {chapter.isCompleted && (
                                        <Badge className="bg-green-100 text-green-700 border-green-200 text-xs px-2 py-1">
                                          ✓ Done
                                        </Badge>
                                      )}
                                      {chapter.isInProgress && (
                                        <Badge className="bg-orange-100 text-orange-700 border-orange-200 text-xs px-2 py-1">
                                          ▶ Active
                                        </Badge>
                                      )}
                                      {chapter.isLocked && (
                                        <Badge className="bg-gray-100 text-gray-700 border-gray-200 text-xs px-2 py-1">
                                          🔒 Locked
                                        </Badge>
                                      )}
                                    </div>
                                  </div>

                                  <div className="space-y-2">
                                    <h3 className="text-lg font-bold text-gray-800 line-clamp-2 group-hover:text-gray-900 transition-colors leading-tight">
                                      {chapter.title}
                                    </h3>
                                    <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed">
                                      {chapter.description}
                                    </p>
                                  </div>

                                  <div className="pt-3">
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
                        })}
                      </div>
                    )}
                  </div>
                );
              }
            )
          )}
        </section>
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
};

export default TeacherChaptersPage;