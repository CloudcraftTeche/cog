"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Chapter, ContentItem } from "@/utils/studentChapter.service";
import { FileText, Film, File } from "lucide-react";

interface ChapterContentProps {
  chapter: Chapter;
}

const getYouTubeEmbedUrl = (url?: string): string | null => {
  if (!url) return null;

  let videoId: string | undefined;

  if (url.includes("watch?v=")) {
    videoId = url.split("watch?v=")[1]?.split("&")[0];
  } else if (url.includes("youtu.be/")) {
    videoId = url.split("youtu.be/")[1]?.split("?")[0];
  }

  if (!videoId) return null;

  return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&controls=1&fs=1&iv_load_policy=3`;
};

const ContentItemRenderer = ({ item, index }: { item: ContentItem; index: number }) => {
  const isYouTubeUrl = (url?: string) => {
    if (!url) return false;
    return url.includes("youtube.com") || url.includes("youtu.be");
  };

  switch (item.type) {
    case "video":
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

    case "text":
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
              dangerouslySetInnerHTML={{ __html: item.textContent || "" }}
            />
          </div>
        </div>
      );

    case "pdf":
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

    case "mixed":
      const mixedEmbedUrl = isYouTubeUrl(item.url) ? getYouTubeEmbedUrl(item.url) : null;
      
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

export default function ChapterContent({ chapter }: ChapterContentProps) {
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
              <ContentItemRenderer item={item} index={index} />
            </div>
          ))
        ) : (
          <div className="text-center py-8 sm:py-12 text-gray-500">
            <p className="text-sm sm:text-base">No content available for this chapter.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}