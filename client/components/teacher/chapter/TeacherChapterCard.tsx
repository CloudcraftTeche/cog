"use client";
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Video,
  FileText,
  Edit,
  MoreVertical,
  BarChart3,
  Trash2,
  FileCheck,
  BookOpen,
  FilePlus2,
} from "lucide-react";
import { TeacherChapter } from "./chapterApiAndTypes";

interface TeacherChapterCardProps {
  chapter: TeacherChapter;
  index: number;
  unitName?: string;
  onViewScores: (chapterId: string) => void;
  onViewSubmissions: (chapterId: string) => void;
  onEdit: (chapterId: string) => void;
  onDelete: (chapterId: string) => void;
}

export default function TeacherChapterCard({
  chapter,
  index,
  unitName,
  onViewScores,
  onViewSubmissions,
  onEdit,
  onDelete,
}: TeacherChapterCardProps) {
  const completedCount =
    chapter.studentProgress?.filter((p) => p.status === "completed").length || 0;
  
  const submissionCount = chapter.studentProgress?.filter(
    (p) => p.submissions && p.submissions.length > 0
  ).length || 0;

  const displayUnitName = unitName || chapter.unitName || "N/A";

  // Get content type info from contentItems or fallback to old contentType
  const getContentTypeInfo = () => {
    if (chapter.contentItems && chapter.contentItems.length > 0) {
      const types = chapter.contentItems.map(item => item.type);
      const uniqueTypes = [...new Set(types)];
      
      if (uniqueTypes.includes("mixed")) {
        return { label: "Mixed", color: "indigo" };
      } else if (uniqueTypes.length > 1) {
        return { label: "Multiple", color: "purple" };
      } else {
        switch (uniqueTypes[0]) {
          case "video":
            return { label: "Video", color: "red" };
          case "text":
            return { label: "Text", color: "blue" };
          case "pdf":
            return { label: "PDF", color: "orange" };
          default:
            return { label: "Content", color: "gray" };
        }
      }
    }
    // Fallback to old contentType
    return chapter.contentType === "video" 
      ? { label: "Video", color: "red" }
      : { label: "Text", color: "blue" };
  };

  const contentInfo = getContentTypeInfo();

  const getContentIcon = () => {
    if (chapter.contentItems && chapter.contentItems.length > 1) {
      return <FilePlus2 className="h-8 w-8 text-white" />;
    }
    
    const type = chapter.contentItems?.[0]?.type || chapter.contentType;
    switch (type) {
      case "video":
        return <Video className="h-8 w-8 text-white" />;
      case "pdf":
        return <FileText className="h-8 w-8 text-white" />;
      case "mixed":
        return <FilePlus2 className="h-8 w-8 text-white" />;
      default:
        return <BookOpen className="h-8 w-8 text-white" />;
    }
  };

  const gradientColors = [
    "from-red-500 via-pink-500 to-purple-600",
    "from-blue-500 via-indigo-500 to-purple-600",
    "from-green-500 via-teal-500 to-blue-600",
    "from-orange-500 via-red-500 to-pink-600",
  ];
  
  const bgColors = [
    "from-red-100 to-pink-100",
    "from-blue-100 to-indigo-100",
    "from-green-100 to-teal-100",
    "from-orange-100 to-red-100",
  ];
  
  const gradient = gradientColors[index % 4];
  const bgGradient = bgColors[index % 4];

  return (
    <Card className="border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:scale-105 bg-white overflow-hidden rounded-3xl group">
      <CardContent className="p-0">
        <div className={`h-3 bg-gradient-to-r ${gradient}`} />
        <div className="p-8 space-y-6">
          <div className="flex items-start gap-5">
            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-xl transform group-hover:scale-110 transition-transform duration-300 bg-gradient-to-br ${gradient}`}
            >
              {getContentIcon()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-3 flex-wrap">
                <h3 className="text-xl font-bold text-gray-900 truncate">
                  {chapter.title}
                </h3>
                <Badge
                  className={`capitalize text-sm font-semibold px-3 py-1 rounded-full bg-gradient-to-r ${bgGradient} border-0`}
                >
                  {contentInfo.label}
                </Badge>
                {chapter.contentItems && chapter.contentItems.length > 1 && (
                  <Badge
                    variant="outline"
                    className="text-xs bg-white border-gray-300"
                  >
                    {chapter.contentItems.length} items
                  </Badge>
                )}
              </div>
              <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">
                {chapter.description}
              </p>
            </div>
          </div>

          <div className={`bg-gradient-to-r ${bgGradient} rounded-2xl p-4 space-y-2 text-sm border border-gray-100`}>
            <InfoRow label="Chapter" value={chapter.chapterNumber} />
            <InfoRow label="Unit" value={displayUnitName} />
            <InfoRow
              label="Created"
              value={new Date(chapter.createdAt).toLocaleDateString()}
            />
            <InfoRow label="Completed" value={`${completedCount} students`} />
            <InfoRow label="Submissions" value={`${submissionCount} students`} />
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewScores(chapter._id)}
              className="bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 border-green-200 hover:border-green-300 text-green-700 hover:text-green-800 font-semibold rounded-xl transition-all duration-300"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Scores
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewSubmissions(chapter._id)}
              className="bg-gradient-to-r from-purple-50 to-fuchsia-50 hover:from-purple-100 hover:to-fuchsia-100 border-purple-200 hover:border-purple-300 text-purple-700 hover:text-purple-800 font-semibold rounded-xl transition-all duration-300"
            >
              <FileCheck className="h-4 w-4 mr-2" />
              Submissions
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(chapter._id)}
              className="bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border-blue-200 hover:border-blue-300 text-blue-700 hover:text-blue-800 font-semibold rounded-xl transition-all duration-300"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-gradient-to-r from-gray-50 to-slate-50 hover:from-gray-100 hover:to-slate-100 border-gray-200 hover:border-gray-300 rounded-xl transition-all duration-300"
                >
                  <MoreVertical className="h-4 w-4 mr-2" />
                  More
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-48 rounded-xl shadow-xl border-0"
              >
                <DropdownMenuItem
                  onClick={() => onDelete(chapter._id)}
                  className="text-red-600 focus:text-red-600 cursor-pointer hover:bg-red-50 rounded-lg"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Chapter
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function InfoRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-600 font-medium">{label}:</span>
      <span className="font-bold text-gray-900">{value}</span>
    </div>
  );
}