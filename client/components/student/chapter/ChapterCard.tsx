import React from "react";
import { useRouter } from "next/navigation";
import { Play, FileText, Lock, CheckCircle, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { Chapter } from "@/types/student/chapter.types";
import { isChapterAccessible } from "@/utils/student/chapterUtils";
interface ChapterCardProps {
  chapter: Chapter;
  index: number;
}
export const ChapterCard: React.FC<ChapterCardProps> = ({ chapter, index }) => {
  const router = useRouter();
  const getStatusBadge = () => {
    if (chapter.isCompleted || chapter.status === "completed") {
      return (
        <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">
          <CheckCircle className="h-3 w-3 mr-1" />
          Completed
        </Badge>
      );
    }
    if (chapter.isInProgress || chapter.status === "in_progress") {
      return (
        <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-xs">
          <Clock className="h-3 w-3 mr-1" />
          In Progress
        </Badge>
      );
    }
    if (chapter.isLocked || chapter.status === "locked") {
      return (
        <Badge className="bg-gray-100 text-gray-600 border-gray-200 text-xs">
          <Lock className="h-3 w-3 mr-1" />
          Locked
        </Badge>
      );
    }
    return (
      <Badge className="bg-purple-100 text-purple-700 border-purple-200 text-xs">
        Available
      </Badge>
    );
  };
  const handleClick = () => {
    if (isChapterAccessible(chapter)) {
      router.push(`/dashboard/student/chapters/${chapter._id}`);
    }
  };
  const clickable = isChapterAccessible(chapter);
  const hasVideo =
    chapter.contentItems?.some((item) => item.type === "video") ?? false;
  const getCardStyle = () => {
    if (chapter.isCompleted || chapter.status === "completed") {
      return "from-green-400 to-emerald-500";
    }
    if (chapter.isInProgress || chapter.status === "in_progress") {
      return "from-blue-400 to-cyan-500";
    }
    if (chapter.isLocked || chapter.status === "locked") {
      return "from-gray-300 to-gray-400";
    }
    return "from-purple-400 to-pink-500";
  };
  return (
    <Card
      onClick={handleClick}
      className={`border-0 shadow-lg rounded-2xl overflow-hidden bg-white transition-all duration-300 ${
        clickable
          ? "cursor-pointer hover:shadow-2xl hover:scale-105"
          : "opacity-60 cursor-not-allowed"
      }`}
    >
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-start justify-between mb-3 gap-2">
          <div className="flex items-center gap-2">
            <div
              className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shadow-md bg-gradient-to-br ${getCardStyle()}`}
            >
              {hasVideo ? (
                <Play className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              ) : (
                <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              )}
            </div>
            <div className="text-left min-w-0 flex-1">
              <p className="text-xs text-gray-500 font-medium">
                Chapter {chapter.chapterNumber}
              </p>
            </div>
          </div>
          {getStatusBadge()}
        </div>
        <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 line-clamp-2">
          {chapter.title}
        </h3>
        <p className="text-xs sm:text-sm text-gray-600 mb-4 line-clamp-2">
          {chapter.description}
        </p>
        <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
          <span className="flex items-center gap-1">
            {hasVideo ? (
              <Play className="h-3 w-3" />
            ) : (
              <FileText className="h-3 w-3" />
            )}
            {chapter.contentItems?.length ?? 0} Content{" "}
            {(chapter.contentItems?.length ?? 0) !== 1 ? "Items" : "Item"}
          </span>
          <span>{chapter.questions?.length ?? 0} Questions</span>
        </div>
        {chapter.score !== undefined && chapter.score > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600">Score:</span>
              <span
                className={`font-bold ${
                  chapter.score >= 70
                    ? "text-green-600"
                    : chapter.score >= 50
                      ? "text-yellow-600"
                      : "text-red-600"
                }`}
              >
                {chapter.score}%
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
