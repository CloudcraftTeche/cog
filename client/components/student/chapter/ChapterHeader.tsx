// components/chapters/ChapterHeader.tsx
import React from 'react';
import { CheckCircle, BookOpen, Play, FileText, Award } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import type { Chapter } from '@/types/student/chapter.types';

interface ChapterHeaderProps {
  chapter: Chapter;
}

export const ChapterHeader: React.FC<ChapterHeaderProps> = ({ chapter }) => {
  const hasVideo = chapter.contentItems?.some((item) => item.type === 'video') ?? false;
  const isCompleted = chapter.isCompleted || chapter.status === 'completed';
  const isInProgress = chapter.isInProgress || chapter.status === 'in_progress';

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6 sm:mb-8">
        <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
          <div
            className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center bg-gradient-to-br shadow-lg flex-shrink-0 ${
              isCompleted
                ? 'from-green-400 to-emerald-500'
                : 'from-purple-400 to-pink-500'
            }`}
          >
            {isCompleted ? (
              <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            ) : (
              <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Badge
                variant="outline"
                className="text-gray-600 border-gray-300 text-xs"
              >
                Chapter {chapter.chapterNumber}
              </Badge>
              {chapter.gradeId && (
                <Badge
                  variant="outline"
                  className="text-gray-600 border-gray-300 text-xs"
                >
                  Grade {chapter.gradeId.grade}
                </Badge>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 break-words mb-2">
              {chapter.title}
            </h1>
            <div className="flex flex-wrap items-center gap-2">
              {isCompleted && (
                <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">
                  <Award className="h-3 w-3 mr-1" />
                  Completed
                </Badge>
              )}
              {isInProgress && (
                <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-xs">
                  In Progress
                </Badge>
              )}
              <Badge
                variant="outline"
                className="text-gray-600 border-gray-300 text-xs"
              >
                {hasVideo ? (
                  <Play className="h-3 w-3 mr-1" />
                ) : (
                  <FileText className="h-3 w-3 mr-1" />
                )}
                {chapter.contentItems?.length ?? 0} Content Item
                {(chapter.contentItems?.length ?? 0) !== 1 ? 's' : ''}
              </Badge>
              <Badge
                variant="outline"
                className="text-gray-600 border-gray-300 text-xs"
              >
                {chapter.questions?.length ?? 0} Question
                {(chapter.questions?.length ?? 0) !== 1 ? 's' : ''}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {chapter.totalChapters !== undefined &&
        chapter.chapterIndex !== undefined && (
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

      {chapter.unitName && (
        <div className="mb-6 sm:mb-8 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
          <h2 className="text-sm font-semibold text-purple-800 mb-1">
            Unit: {chapter.unitName}
          </h2>
          {chapter.unitDescription && (
            <p className="text-xs text-purple-600">{chapter.unitDescription}</p>
          )}
        </div>
      )}
    </>
  );
};