// components/chapters/ChapterContent.tsx
import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { Chapter } from '@/types/student/chapter.types';
import { ContentRenderer } from './ContentRenderer';

interface ChapterContentProps {
  chapter: Chapter;
}

export const ChapterContent: React.FC<ChapterContentProps> = ({ chapter }) => {
  const sortedContentItems = [...(chapter.contentItems || [])].sort(
    (a, b) => a.order - b.order
  );

  return (
    <Card className="border-0 shadow-lg rounded-2xl overflow-hidden bg-white/70 backdrop-blur-sm">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-gray-100 p-4 sm:p-6">
        <CardTitle className="text-lg sm:text-xl md:text-2xl text-gray-800">
          {chapter.title}
        </CardTitle>
        <CardDescription className="text-gray-600 text-sm sm:text-base mt-2">
          {chapter.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8">
        {sortedContentItems.length > 0 ? (
          sortedContentItems.map((item, index) => (
            <div
              key={index}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <ContentRenderer item={item} index={index} />
            </div>
          ))
        ) : (
          <div className="text-center py-8 sm:py-12 text-gray-500">
            <p className="text-sm sm:text-base">
              No content available for this chapter.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};