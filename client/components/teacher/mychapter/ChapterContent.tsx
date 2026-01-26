import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TeacherChapter } from "@/utils/teacherChapter.service";
interface ChapterContentProps {
  chapter: TeacherChapter;
}
export default function ChapterContent({ chapter }: ChapterContentProps) {
  return (
    <Card className="border-0 shadow-lg rounded-2xl overflow-hidden bg-white/70 backdrop-blur-sm">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-gray-100 p-4 sm:p-6">
        <CardTitle className="text-lg sm:text-xl md:text-2xl text-gray-800">
          {chapter.title}
        </CardTitle>
        <CardDescription className="text-gray-600 text-sm sm:text-base">
          {chapter.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {chapter.contentType === "video" && chapter.videoUrl && (
          <div className="aspect-video bg-gray-900">
            {chapter.videoUrl.includes("youtube.com") ||
            chapter.videoUrl.includes("youtu.be") ? (
              <iframe
                className="w-full h-full"
                src={`https:
                  chapter.videoUrl.includes("watch?v=")
                    ? chapter.videoUrl.split("watch?v=")[1].split("&")[0]
                    : chapter.videoUrl.split("/").pop()
                }`}
                title="YouTube Video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <video
                src={chapter.videoUrl}
                controls
                className="w-full h-full"
              />
            )}
          </div>
        )}
        {chapter.contentType === "text" && chapter.textContent && (
          <div className="p-4 sm:p-6 md:p-8">
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 sm:p-6">
              <div
                className="text-gray-700 leading-relaxed text-sm sm:text-base"
                style={{ whiteSpace: "pre-wrap", wordWrap: "break-word" }}
                dangerouslySetInnerHTML={{ __html: chapter.textContent }}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
