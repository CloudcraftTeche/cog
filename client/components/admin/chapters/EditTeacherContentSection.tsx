"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle } from "lucide-react";
interface Grade {
  _id: string;
  grade: string;
  units?: Array<{
    _id: string;
    name: string;
    description?: string;
    orderIndex: number;
  }>;
}
interface Unit {
  _id: string;
  name: string;
  description?: string;
  orderIndex: number;
}
interface EditContentSectionProps {
  title: string;
  setTitle: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  contentType: "video" | "text";
  setContentType: (value: "video" | "text") => void;
  videoUrl: string;
  setVideoUrl: (value: string) => void;
  textContent: string;
  setTextContent: (value: string) => void;
  selectedGradeId: string;
  setSelectedGradeId: (value: string) => void;
  selectedUnitId: string;
  setSelectedUnitId: (value: string) => void;
  chapterNumber: number;
  setChapterNumber: (value: number) => void;
  grades: Grade[];
  units: Unit[];
  errors?: {
    title?: string;
    description?: string;
    videoUrl?: string;
    textContent?: string;
    gradeId?: string;
    unitId?: string;
    chapterNumber?: string;
  };
}
const chapters = Array.from({ length: 50 }, (_, i) => ({
  id: (i + 1).toString(),
  title: `Chapter ${i + 1}`,
}));
export default function EditTeacherContentSection({
  title,
  setTitle,
  description,
  setDescription,
  contentType,
  setContentType,
  videoUrl,
  setVideoUrl,
  textContent,
  setTextContent,
  selectedGradeId,
  setSelectedGradeId,
  selectedUnitId,
  setSelectedUnitId,
  chapterNumber,
  setChapterNumber,
  grades,
  units,
  errors = {},
}: EditContentSectionProps) {
  const hasUnitsAvailable = units && units.length > 0;
  const hasGradeSelected = !!selectedGradeId;
  React.useEffect(() => {
    if (selectedGradeId && selectedUnitId && units.length > 0) {
      const isUnitInGrade = units.some(u => u._id === selectedUnitId);
      if (!isUnitInGrade) {
        setSelectedUnitId("");
      }
    }
  }, [selectedGradeId, units, selectedUnitId, setSelectedUnitId]);
  return (
    <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm rounded-3xl overflow-hidden">
      <CardHeader className="pb-6 bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-8">
        <div className="flex items-center space-x-3">
          <Badge className="bg-white/20 text-white border-white/30 px-4 py-2 rounded-full font-semibold">
            Basic Info
          </Badge>
        </div>
        <CardTitle className="text-2xl font-bold">Chapter Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-8 p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <Label htmlFor="title" className="text-lg font-semibold text-gray-700">
              Chapter Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter chapter title"
              className={`h-12 border-2 rounded-xl text-lg ${
                errors.title
                  ? "border-red-300 focus:border-red-500"
                  : "border-blue-200 focus:border-blue-500"
              }`}
              required
            />
            {errors.title && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.title}
              </p>
            )}
          </div>
          <div className="space-y-3">
            <Label htmlFor="grade" className="text-lg font-semibold text-gray-700">
              Grade <span className="text-red-500">*</span>
            </Label>
            <Select value={selectedGradeId} onValueChange={setSelectedGradeId}>
              <SelectTrigger
                className={`h-12 border-2 rounded-xl ${
                  errors.gradeId
                    ? "border-red-300 focus:border-red-500"
                    : "border-green-200 focus:border-green-500"
                }`}
              >
                <SelectValue placeholder="Select Grade" />
              </SelectTrigger>
              <SelectContent>
                {grades?.map(({ _id, grade }) => (
                  <SelectItem key={_id} value={_id}>
                    Grade {grade}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.gradeId && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.gradeId}
              </p>
            )}
          </div>
          <div className="space-y-3">
            <Label htmlFor="unit" className="text-lg font-semibold text-gray-700">
              Unit <span className="text-red-500">*</span>
            </Label>
            <Select
              value={selectedUnitId}
              onValueChange={setSelectedUnitId}
              disabled={!hasGradeSelected || !hasUnitsAvailable}
            >
              <SelectTrigger
                className={`h-12 border-2 rounded-xl ${
                  !hasGradeSelected || !hasUnitsAvailable
                    ? "opacity-50 cursor-not-allowed"
                    : errors.unitId
                      ? "border-red-300 focus:border-red-500"
                      : "border-orange-200 focus:border-orange-500"
                }`}
              >
                <SelectValue 
                  placeholder={
                    !hasGradeSelected 
                      ? "Select grade first" 
                      : !hasUnitsAvailable 
                        ? "No units available" 
                        : "Select Unit"
                  } 
                />
              </SelectTrigger>
              <SelectContent>
                {units?.map((unit) => (
                  <SelectItem key={unit._id} value={unit._id}>
                    {unit.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.unitId && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.unitId}
              </p>
            )}
            {!hasGradeSelected && (
              <p className="text-xs text-slate-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Select a grade to view units
              </p>
            )}
            {hasGradeSelected && !hasUnitsAvailable && (
              <p className="text-xs text-amber-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Selected grade has no units. Please add units first.
              </p>
            )}
          </div>
          <div className="space-y-3">
            <Label htmlFor="chapterNumber" className="text-lg font-semibold text-gray-700">
              Chapter Number <span className="text-red-500">*</span>
            </Label>
            <Select value={String(chapterNumber)} onValueChange={(val) => setChapterNumber(Number(val))}>
              <SelectTrigger
                className={`h-12 border-2 rounded-xl ${
                  errors.chapterNumber
                    ? "border-red-300 focus:border-red-500"
                    : "border-purple-200 focus:border-purple-500"
                }`}
              >
                <SelectValue placeholder="Select Chapter" />
              </SelectTrigger>
              <SelectContent>
                {chapters?.map(({ id, title }) => (
                  <SelectItem key={id} value={id}>
                    {title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.chapterNumber && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.chapterNumber}
              </p>
            )}
          </div>
        </div>
        <div className="space-y-3">
          <Label htmlFor="description" className="text-lg font-semibold text-gray-700">
            Description <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter chapter description"
            rows={4}
            className={`border-2 rounded-xl text-lg ${
              errors.description
                ? "border-red-300 focus:border-red-500"
                : "border-purple-200 focus:border-purple-500"
            }`}
            required
          />
          {errors.description && (
            <p className="text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors.description}
            </p>
          )}
        </div>
        <div className="space-y-3">
          <Label htmlFor="contentType" className="text-lg font-semibold text-gray-700">
            Content Type <span className="text-red-500">*</span>
          </Label>
          <Select value={contentType} onValueChange={(value: "video" | "text") => setContentType(value)}>
            <SelectTrigger className="h-12 border-2 border-orange-200 focus:border-orange-500 rounded-xl">
              <SelectValue placeholder="Select content type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="text">Text Content</SelectItem>
              <SelectItem value="video">Video Upload</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {contentType === "video" ? (
          <div className="space-y-3">
            <Label htmlFor="videoUrl" className="text-lg font-semibold text-gray-700">
              Video URL <span className="text-red-500">*</span>
            </Label>
            <Input
              id="videoUrl"
              type="url"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://example.com/video.mp4"
              className={`h-12 border-2 rounded-xl text-lg ${
                errors.videoUrl
                  ? "border-red-300 focus:border-red-500"
                  : "border-red-200 focus:border-red-500"
              }`}
              required={contentType === "video"}
            />
            {errors.videoUrl && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.videoUrl}
              </p>
            )}
            <p className="text-sm text-gray-500 bg-gray-50 p-3 rounded-xl">
              Supported formats: MP4, WebM, YouTube embeds, Vimeo links
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <Label htmlFor="textContent" className="text-lg font-semibold text-gray-700">
              Text Content <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="textContent"
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              placeholder="Enter text content"
              rows={10}
              className={`border-2 rounded-xl text-lg font-serif ${
                errors.textContent
                  ? "border-red-300 focus:border-red-500"
                  : "border-teal-200 focus:border-teal-500"
              }`}
              required={contentType === "text"}
            />
            {errors.textContent && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.textContent}
              </p>
            )}
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-500">{textContent.length} characters</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}