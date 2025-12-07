"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Plus,
  FileText,
  Search,
  ChevronDown,
  ChevronUp,
  BookOpen,
  GraduationCap,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import TeacherChapterCard from "@/components/admin/teacher-chapters/TeacherChapterCard";
interface TeacherChapter {
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
  unitName?: string;
  createdAt: Date;
  isPublished: boolean;
  requiresPreviousChapter: boolean;
  hasQuestions: boolean;
  questionsCount: number;
  teacherProgress?: Array<{
    teacherId: string;
    status: string;
  }>;
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
const ITEMS_PER_PAGE = 100;
export default function AdminTeacherChaptersPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [chapters, setChapters] = useState<TeacherChapter[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedGrades, setExpandedGrades] = useState<Set<string>>(new Set());
  const [expandedUnits, setExpandedUnits] = useState<Set<string>>(new Set());
  const fetchChapters = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: 1,
        limit: ITEMS_PER_PAGE,
      };
      if (searchTerm) params.search = searchTerm;
      const { data } = await api.get("/teacher-chapters", { params });
      const { data: chaptersData = [] } = data;
      setChapters(chaptersData);
    } catch (error) {
      toast.error("Failed to fetch teacher chapters");
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
  const handleDeleteChapter = async (chapterId: string) => {
    const chapter = chapters.find((c) => c._id === chapterId);
    if (!chapter) return;
    const confirmed = window.confirm(
      `Are you sure you want to delete "${chapter.title}"? This action cannot be undone.`
    );
    if (!confirmed) return;
    try {
      await api.delete(`/teacher-chapters/${chapterId}`);
      toast.success("Teacher chapter deleted successfully");
      fetchChapters();
    } catch (error) {
      toast.error("Failed to delete chapter");
      console.error(error);
    }
  };
  const handleViewStatistics = (chapterId: string) => {
    router.push(`/dashboard/admin/teacher-chapters/${chapterId}/statistics`);
  };
  const handleEdit = (chapterId: string) => {
    router.push(`/dashboard/admin/teacher-chapters/edit/${chapterId}`);
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
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">
            Loading teacher chapters...
          </p>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <div className="mb-8 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-8 text-white shadow-2xl">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium mb-2">
                <Users className="h-4 w-4" />
                Teacher Training
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                Teacher Chapter Management
              </h1>
              <p className="text-blue-100 text-lg font-medium">
                Manage training content and assessments for teachers
              </p>
            </div>
            <Button
              className="w-full lg:w-auto bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-white/30 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border-2"
              onClick={() =>
                router.push("/dashboard/admin/teacher-chapters/upload")
              }
              size="lg"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create Teacher Chapter
            </Button>
          </div>
        </div>
        <div className="max-w-xl mx-auto mb-8">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 group-hover:text-blue-500 transition-colors" />
            <Input
              placeholder="Search teacher chapters..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-4 py-6 rounded-2xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all shadow-lg bg-white"
            />
          </div>
        </div>
        <div className="space-y-6">
          {groupedData.length === 0 ? (
            <Card className="border-0 shadow-2xl bg-gradient-to-br from-white to-gray-50 rounded-3xl overflow-hidden">
              <CardContent className="p-12 text-center">
                <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 rounded-full flex items-center justify-center shadow-2xl">
                  <FileText className="h-16 w-16 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  No teacher chapters found
                </h3>
                <p className="text-gray-600 mb-8 text-lg">
                  {searchTerm
                    ? "Try adjusting your search terms"
                    : "Get started by creating your first teacher training chapter"}
                </p>
                <Button
                  onClick={() =>
                    router.push("/dashboard/admin/teacher-chapters/upload")
                  }
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 rounded-2xl px-8 py-3"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Create First Chapter
                </Button>
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
                            {gradeData.totalChapters !== 1 ? "s" : ""} across{" "}
                            {gradeData.unitGroups.length} unit
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
                                    <p className="text-gray-600 text-xs">
                                      {unitGroup.chapters.length} chapter
                                      {unitGroup.chapters.length !== 1
                                        ? "s"
                                        : ""}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <Badge
                                    className={`bg-gradient-to-r ${unitColor} text-white border-0 px-3 py-1 text-xs`}
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
                                {unitGroup.chapters.map(
                                  (chapter, chapterIndex) => (
                                    <TeacherChapterCard
                                      key={chapter._id}
                                      chapter={chapter}
                                      index={chapterIndex}
                                      unitName={unitGroup.unit.name}
                                      onViewStatistics={handleViewStatistics}
                                      onEdit={handleEdit}
                                      onDelete={handleDeleteChapter}
                                    />
                                  )
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
    </div>
  );
}
