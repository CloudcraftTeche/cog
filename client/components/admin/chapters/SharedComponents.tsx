// components/admin/chapters/SharedComponents.tsx
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileCheck, AlertCircle } from "lucide-react";
import { ContentItem } from "@/types/admin/chapter.types";

// Error Display Component
interface ErrorDisplayProps {
  title: string;
  message: string;
  onRetry: () => void;
}

export function ErrorDisplay({ title, message, onRetry }: ErrorDisplayProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-purple-50/30 to-pink-50/30">
      <Card className="w-full max-w-md mx-4 shadow-2xl rounded-3xl">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold mb-2">{title}</h3>
          <p className="text-gray-600 mb-4">{message}</p>
          <Button
            onClick={onRetry}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white"
          >
            Go Back
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// Chapter Header Component
interface ChapterHeaderProps {
  title: string;
  description: string;
  gradeNumber: string;
  chapterNumber: number;
  questionsCount: number;
  contentItems?: ContentItem[];
  submissionsCount?: number;
  variant?: "scores" | "submissions";
}

export function ChapterHeader({
  title,
  description,
  gradeNumber,
  chapterNumber,
  questionsCount,
  contentItems,
  submissionsCount,
  variant = "scores",
}: ChapterHeaderProps) {
  const getContentTypeBadges = () => {
    if (!contentItems || contentItems.length === 0) {
      return (
        <Badge className="bg-white/20 px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
          📚 Text Content
        </Badge>
      );
    }

    const types = contentItems.map((item) => item.type);
    const uniqueTypes = [...new Set(types)];

    return (
      <>
        {uniqueTypes.includes("mixed") && (
          <Badge className="bg-white/20 px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
            🎬 Mixed Content
          </Badge>
        )}
        {uniqueTypes.includes("video") && !uniqueTypes.includes("mixed") && (
          <Badge className="bg-white/20 px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
            📹 Video
          </Badge>
        )}
        {uniqueTypes.includes("text") && !uniqueTypes.includes("mixed") && (
          <Badge className="bg-white/20 px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
            📚 Text
          </Badge>
        )}
        {uniqueTypes.includes("pdf") && (
          <Badge className="bg-white/20 px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
            📄 PDF
          </Badge>
        )}
        {contentItems.length > 1 && (
          <Badge className="bg-white/20 px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
            📦 {contentItems.length} Items
          </Badge>
        )}
      </>
    );
  };

  const gradientClass =
    variant === "submissions"
      ? "from-purple-600 via-pink-600 to-red-600"
      : "from-indigo-600 via-purple-600 to-pink-600";

  return (
    <div className={`mb-8 bg-gradient-to-r ${gradientClass} rounded-3xl p-8 text-white shadow-2xl`}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
          <FileCheck className="h-8 w-8" />
        </div>
        <div>
          <h1 className="text-4xl font-bold">{title}</h1>
          <p className={`${variant === "submissions" ? "text-purple" : "text-indigo"}-100 text-lg mt-1`}>
            {variant === "submissions" ? "Student Submissions" : description}
          </p>
        </div>
      </div>
      <div className="flex flex-wrap gap-3">
        {getContentTypeBadges()}
        <Badge className="bg-white/20 px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
          📝 {questionsCount} Questions
        </Badge>
        <Badge className="bg-white/20 px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
          🎓 Grade {gradeNumber}
        </Badge>
        <Badge className="bg-white/20 px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
          📖 Chapter {chapterNumber}
        </Badge>
        {submissionsCount !== undefined && (
          <Badge className="bg-white/20 px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
            📝 {submissionsCount} Submissions
          </Badge>
        )}
      </div>
    </div>
  );
}

// Empty Submissions Component
export function EmptySubmissions() {
  return (
    <Card className="shadow-xl rounded-3xl border-0">
      <CardContent className="p-12 text-center">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileCheck className="h-10 w-10 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          No Submissions Yet
        </h3>
        <p className="text-gray-600">
          Students haven't submitted their work for this chapter yet.
        </p>
      </CardContent>
    </Card>
  );
}