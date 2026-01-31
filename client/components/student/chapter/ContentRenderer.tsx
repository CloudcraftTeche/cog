// components/chapters/ContentRenderer.tsx
import React from 'react';
import { FileText, Film, File } from 'lucide-react';
import type { ContentItem } from '@/types/student/chapter.types';
import { getYouTubeEmbedUrl, isYouTubeUrl } from '@/utils/student/chapterUtils';

interface ContentRendererProps {
  item: ContentItem;
  index: number;
}

export const ContentRenderer: React.FC<ContentRendererProps> = ({ item, index }) => {
  switch (item.type) {
    case 'video':
      const embedUrl = isYouTubeUrl(item.url) ? getYouTubeEmbedUrl(item.url) : null;

      return (
        <div className="space-y-3">
          {item.title && (
            <div className="flex items-center gap-2">
              <Film className="w-5 h-5 text-purple-600" />
              <h3 className="text-base sm:text-lg font-semibold text-gray-800">
                {item.title}
              </h3>
            </div>
          )}
          <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden shadow-md">
            {embedUrl ? (
              <iframe
                className="w-full h-full"
                src={embedUrl}
                title={item.title || `Video ${index + 1}`}
                allow="accelerometer; autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
              />
            ) : item.url ? (
              <video
                src={item.url}
                controls
                className="w-full h-full"
                controlsList="nodownload"
              >
                Your browser does not support the video tag.
              </video>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                No video available
              </div>
            )}
          </div>
        </div>
      );

    case 'text':
      return (
        <div className="space-y-3">
          {item.title && (
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <h3 className="text-base sm:text-lg font-semibold text-gray-800">
                {item.title}
              </h3>
            </div>
          )}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 sm:p-6 shadow-sm">
            <div
              className="text-gray-700 leading-relaxed whitespace-pre-wrap text-sm sm:text-base"
              dangerouslySetInnerHTML={{ __html: item.textContent || '' }}
            />
          </div>
        </div>
      );

    case 'pdf':
      return (
        <div className="space-y-3">
          {item.title && (
            <div className="flex items-center gap-2">
              <File className="w-5 h-5 text-red-600" />
              <h3 className="text-base sm:text-lg font-semibold text-gray-800">
                {item.title}
              </h3>
            </div>
          )}
          <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col items-center justify-center gap-4">
              <File className="w-12 h-12 text-red-500" />
              <p className="text-gray-600 text-sm sm:text-base text-center">
                PDF Document
              </p>
              {item.url && (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-red-500 to-red-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-md hover:shadow-lg text-sm sm:text-base"
                >
                  Open PDF
                </a>
              )}
            </div>
          </div>
        </div>
      );

    case 'mixed':
      const mixedEmbedUrl = isYouTubeUrl(item.url)
        ? getYouTubeEmbedUrl(item.url)
        : null;

      return (
        <div className="space-y-4">
          {item.title && (
            <div className="flex items-center gap-2">
              <Film className="w-5 h-5 text-purple-600" />
              <h3 className="text-base sm:text-lg font-semibold text-gray-800">
                {item.title}
              </h3>
            </div>
          )}

          {item.url && (
            <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden shadow-md">
              {mixedEmbedUrl ? (
                <iframe
                  className="w-full h-full"
                  src={mixedEmbedUrl}
                  title={item.title || `Video ${index + 1}`}
                  allow="accelerometer; autoplay; encrypted-media; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video
                  src={item.url}
                  controls
                  className="w-full h-full"
                  controlsList="nodownload"
                >
                  Your browser does not support the video tag.
                </video>
              )}
            </div>
          )}

          {item.textContent && (
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 sm:p-6 shadow-sm">
              <div
                className="text-gray-700 leading-relaxed whitespace-pre-wrap text-sm sm:text-base"
                dangerouslySetInnerHTML={{ __html: item.textContent }}
              />
            </div>
          )}
        </div>
      );

    default:
      return null;
  }
};