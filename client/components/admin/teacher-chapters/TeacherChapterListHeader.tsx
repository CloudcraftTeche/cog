// components/admin/teacher-chapters/TeacherChapterEmptyState.tsx

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Plus } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Search, Users } from "lucide-react";

interface TeacherChapterListHeaderProps {
  onCreateClick: () => void;
}

export function TeacherChapterListHeader({ onCreateClick }: TeacherChapterListHeaderProps) {
  return (
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
          onClick={onCreateClick}
          size="lg"
        >
          <Plus className="h-5 w-5 mr-2" />
          Create Teacher Chapter
        </Button>
      </div>
    </div>
  );
}

// components/admin/teacher-chapters/TeacherChapterSearch.tsx


interface TeacherChapterSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export function TeacherChapterSearch({ searchTerm, onSearchChange }: TeacherChapterSearchProps) {
  return (
    <div className="max-w-xl mx-auto mb-8">
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 group-hover:text-blue-500 transition-colors" />
        <Input
          placeholder="Search teacher chapters..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-12 pr-4 py-6 rounded-2xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all shadow-lg bg-white"
        />
      </div>
    </div>
  );
}

// components/admin/teacher-chapters/TeacherChapterLoading.tsx

export function TeacherChapterLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium">Loading teacher chapters...</p>
      </div>
    </div>
  );
}



interface TeacherChapterEmptyStateProps {
  searchTerm?: string;
  onCreateClick: () => void;
}

export function TeacherChapterEmptyState({ searchTerm, onCreateClick }: TeacherChapterEmptyStateProps) {
  return (
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
          onClick={onCreateClick}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 rounded-2xl px-8 py-3"
        >
          <Plus className="h-5 w-5 mr-2" />
          Create First Chapter
        </Button>
      </CardContent>
    </Card>
  );
}