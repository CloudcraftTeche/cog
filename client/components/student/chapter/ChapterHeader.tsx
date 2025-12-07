import { CheckCircle, BookOpen, Play, FileText, Award } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Chapter } from "@/utils/studentChapter.service";
interface ChapterHeaderProps {
  chapter: Chapter & {
    chapterIndex?: number;
    totalChapters?: number;
  };
}
export default function ChapterHeader({ chapter }: ChapterHeaderProps) {
  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6 sm:mb-8">
        <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
          <div
            className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center bg-gradient-to-br shadow-lg flex-shrink-0 ${
              chapter.isCompleted
                ? "from-green-400 to-emerald-500"
                : "from-purple-400 to-pink-500"
            }`}
          >
            {chapter.isCompleted ? (
              <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            ) : (
              <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 break-words">
              {chapter.title}
            </h1>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              {chapter.isCompleted && (
                <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">
                  <Award className="h-3 w-3 mr-1" />
                  Completed
                </Badge>
              )}
              <Badge variant="outline" className="text-gray-600 border-gray-300 text-xs">
                {chapter.contentType === "video" ? (
                  <Play className="h-3 w-3 mr-1" />
                ) : (
                  <FileText className="h-3 w-3 mr-1" />
                )}
                {chapter.contentType}
              </Badge>
            </div>
          </div>
        </div>
      </div>
      {chapter.totalChapters && chapter.chapterIndex !== undefined && (
        <div className="space-y-2 mb-6 sm:mb-8">
          <div className="flex justify-between text-xs sm:text-sm text-gray-600">
            <span>Chapter Progress</span>
            <span>
              {chapter.chapterIndex + 1} of {chapter.totalChapters}
            </span>
          </div>
          <Progress
            value={((chapter.chapterIndex + 1) / chapter.totalChapters) * 100}
            className="h-2 bg-gray-200"
          />
        </div>
      )}
    </>
  );
}