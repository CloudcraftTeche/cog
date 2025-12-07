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
} from "lucide-react";
import { TeacherChapter } from "./chapterApiAndTypes";
interface TeacherChapterCardProps {
  chapter: TeacherChapter;
  index: number;
  unitName?: string;
  onViewScores: (chapterId: string) => void;
  onEdit: (chapterId: string) => void;
  onDelete: (chapterId: string) => void;
}
export default function TeacherChapterCard({
  chapter,
  index,
  unitName,
  onViewScores,
  onEdit,
  onDelete,
}: TeacherChapterCardProps) {
  const completedCount =
    chapter.studentProgress?.filter((p) => p.status === "completed").length || 0;
  const displayUnitName = unitName || chapter.unitName || "N/A";
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
              {chapter.contentType === "video" ? (
                <Video className="h-8 w-8 text-white" />
              ) : (
                <FileText className="h-8 w-8 text-white" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-3 flex-wrap">
                <h3 className="text-xl font-bold text-gray-900 truncate">
                  {chapter.title}
                </h3>
                <Badge
                  className={`capitalize text-sm font-semibold px-3 py-1 rounded-full bg-gradient-to-r ${bgGradient} border-0`}
                >
                  {chapter.contentType}
                </Badge>
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
          </div>
          <div className="flex items-center gap-3 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewScores(chapter._id)}
              className="flex-1 bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 border-green-200 hover:border-green-300 text-green-700 hover:text-green-800 font-semibold rounded-xl transition-all duration-300"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              View Scores
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(chapter._id)}
              className="flex-1 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border-blue-200 hover:border-blue-300 text-blue-700 hover:text-blue-800 font-semibold rounded-xl transition-all duration-300"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="px-4 bg-gradient-to-r from-gray-50 to-slate-50 hover:from-gray-100 hover:to-slate-100 border-gray-200 hover:border-gray-300 rounded-xl transition-all duration-300"
                >
                  <MoreVertical className="h-4 w-4" />
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