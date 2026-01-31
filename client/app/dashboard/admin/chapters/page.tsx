"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, FileText, Search, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  useChapters,
  useGrades,
  useDeleteChapter,
} from "@/hooks/admin/useChapter";
import {
  filterChaptersBySearch,
  groupChaptersByGradeAndUnit,
} from "@/utils/admin/chapter.utils";
import { LoadingState } from "@/components/shared/LoadingComponent";
import ChaptersList from "@/components/admin/chapters/ChaptersList";
const ITEMS_PER_PAGE = 100;
export default function AdminChaptersPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedGrades, setExpandedGrades] = useState<Set<string>>(new Set());
  const [expandedUnits, setExpandedUnits] = useState<Set<string>>(new Set());
  const { data: chapters = [], isLoading: chaptersLoading } = useChapters({
    page: 1,
    limit: ITEMS_PER_PAGE,
    search: searchTerm,
  });
  const { data: grades = [], isLoading: gradesLoading } = useGrades();
  const deleteChapterMutation = useDeleteChapter();
  const handleDeleteChapter = async (chapterId: string) => {
    const chapter = chapters.find((c) => c._id === chapterId);
    if (!chapter) return;
    const confirmed = window.confirm(
      `Are you sure you want to delete "${chapter.title}"? This action cannot be undone.`,
    );
    if (confirmed) {
      deleteChapterMutation.mutate({
        gradeId: chapter.gradeId._id,
        chapterId,
      });
    }
  };
  const handleViewScores = (chapterId: string) => {
    router.push(`/dashboard/admin/chapters/scores/${chapterId}`);
  };
  const handleEdit = (chapterId: string) => {
    router.push(`/dashboard/admin/chapters/edit/${chapterId}`);
  };
  const handleViewSubmissions = (chapterId: string) => {
    router.push(`/dashboard/admin/chapters/submissions/${chapterId}`);
  };
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
  const filteredChapters = filterChaptersBySearch(chapters, searchTerm);
  const groupedData = groupChaptersByGradeAndUnit(filteredChapters, grades);
  if (chaptersLoading || gradesLoading) {
    return <LoadingState text=" chapters" />;
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
                Admin Dashboard
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                Chapter Management
              </h1>
              <p className="text-blue-100 text-lg font-medium">
                Organize chapters by grade and unit. Expand to view and manage
                content
              </p>
            </div>
            <Button
              className="w-full lg:w-auto bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-white/30 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border-2"
              onClick={() => router.push("/dashboard/admin/chapters/upload")}
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
        {groupedData.length === 0 ? (
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
                  : "Get started by creating your first chapter"}
              </p>
              <Button
                onClick={() => router.push("/dashboard/admin/chapters/upload")}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 rounded-2xl px-8 py-3"
              >
                <Plus className="h-5 w-5 mr-2" />
                Create Chapter
              </Button>
            </CardContent>
          </Card>
        ) : (
          <ChaptersList
            groupedData={groupedData}
            expandedGrades={expandedGrades}
            expandedUnits={expandedUnits}
            onToggleGrade={toggleGrade}
            onToggleUnit={toggleUnit}
            onViewScores={handleViewScores}
            onEdit={handleEdit}
            onDelete={handleDeleteChapter}
            onViewSubmissions={handleViewSubmissions}
          />
        )}
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
