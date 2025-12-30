"use client";
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Video, BookOpen } from "lucide-react";
interface ContentUploadSectionProps {
  contentType: "video" | "text";
  videoUrl: string;
  setVideoUrl: (value: string) => void;
  textContent: string;
  setTextContent: (value: string) => void;
  errors?: {
    videoUrl?: string;
    textContent?: string;
  };
}
export default function TeacherContentUploadSection({
  contentType,
  videoUrl,
  setVideoUrl,
  textContent,
  setTextContent,
  errors = {},
}: ContentUploadSectionProps) {
  if (contentType === "video") {
    return (
      <Card className="shadow-2xl border-0 bg-white rounded-3xl overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-purple-500 to-pink-500"></div>
        <CardHeader className="pb-4 bg-gradient-to-br from-purple-50 to-pink-50">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <Video className="w-5 h-5 text-white" />
            </div>
            <Badge variant="secondary" className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border-0 px-4 py-1 rounded-full">
              Video Content
            </Badge>
          </div>
          <CardTitle className="text-2xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Video Upload
          </CardTitle>
          <CardDescription className="text-slate-600 text-base">
            Provide the URL for your video lesson
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          <div className="space-y-3">
            <Label htmlFor="video" className="text-sm font-semibold text-slate-700 flex items-center">
              <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mr-2"></div>
              Video URL <span className="text-red-500 ml-1">*</span>
            </Label>
            <Input
              id="videoUrl"
              placeholder="https://example.com/video.mp4"
              value={videoUrl}
              type="url"
              onChange={(e) => setVideoUrl(e.target.value)}
              className={`h-12 border-2 rounded-xl transition-all duration-300 ${
                errors.videoUrl
                  ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                  : "border-slate-200 focus:border-purple-500 focus:ring-purple-100"
              }`}
              required
            />
            {errors.videoUrl && <p className="text-sm text-red-600 mt-1">{errors.videoUrl}</p>}
            <p className="text-xs text-slate-500 mt-2">
              Supported formats: MP4, WebM, YouTube embeds, Vimeo links
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
  return (
    <Card className="shadow-2xl border-0 bg-white rounded-3xl overflow-hidden">
      <div className="h-2 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
      <CardHeader className="pb-4 bg-gradient-to-br from-emerald-50 to-teal-50">
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <Badge variant="secondary" className="bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 border-0 px-4 py-1 rounded-full">
            Text Content
          </Badge>
        </div>
        <CardTitle className="text-2xl bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
          Text Content
        </CardTitle>
        <CardDescription className="text-slate-600 text-base">
          Add educational text content for study
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 p-8">
        <div className="space-y-4">
          <div className="space-y-3">
            <Label htmlFor="textContent" className="text-sm font-semibold text-slate-700 flex items-center">
              <div className="w-2 h-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full mr-2"></div>
              Content <span className="text-red-500 ml-1">*</span>
            </Label>
            <Textarea
              id="textContent"
              placeholder="Enter or paste the educational text here..."
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              rows={12}
              className={`border-2 rounded-xl resize-none font-serif text-sm leading-relaxed min-h-[400px] transition-all duration-300 ${
                errors.textContent
                  ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                  : "border-slate-200 focus:border-emerald-500 focus:ring-emerald-100"
              }`}
              required
            />
            {errors.textContent && <p className="text-sm text-red-600 mt-1">{errors.textContent}</p>}
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-500">{textContent.length} characters</p>
              {textContent.length > 0 && (
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  <span className="text-xs text-emerald-600 font-medium">Ready for students</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}