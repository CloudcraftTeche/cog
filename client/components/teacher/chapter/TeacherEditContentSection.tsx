"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, Video, BookOpen, FileText, Plus, Trash2, Upload as UploadIcon, GraduationCap } from "lucide-react";
import { toast } from "sonner";
import { TeacherGrade } from "./chapterApiAndTypes";

interface Unit {
  _id: string;
  name: string;
  description?: string;
  orderIndex: number;
}

interface ContentItem {
  type: "video" | "text" | "pdf" | "mixed";
  order: number;
  title?: string;
  textContent?: string;
  videoUrl?: string;
  url?: string;
  publicId?: string | null;
  file?: File;
}

interface TeacherEditContentSectionProps {
  title: string;
  setTitle: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  selectedUnitId: string;
  setSelectedUnitId: (value: string) => void;
  chapterNumber: number;
  setChapterNumber: (value: number) => void;
  grade: TeacherGrade;
  units: Unit[];
  contentItems: ContentItem[];
  setContentItems: (items: ContentItem[]) => void;
  errors?: Record<string, string>;
}

const chapters = Array.from({ length: 50 }, (_, i) => ({
  id: (i + 1).toString(),
  title: `Chapter ${i + 1}`,
}));

export default function TeacherEditContentSection({
  title,
  setTitle,
  description,
  setDescription,
  selectedUnitId,
  setSelectedUnitId,
  chapterNumber,
  setChapterNumber,
  grade,
  units,
  contentItems,
  setContentItems,
  errors = {},
}: TeacherEditContentSectionProps) {
  const hasUnitsAvailable = units && units.length > 0;

  const addContentItem = () => {
    const newItem: ContentItem = {
      type: "video",
      order: contentItems.length,
      title: ""
    };
    setContentItems([...contentItems, newItem]);
    toast.success("Content item added");
  };

  const removeContentItem = (index: number) => {
    if (contentItems.length > 1) {
      const updated = contentItems.filter((_, i) => i !== index);
      updated.forEach((item, i) => item.order = i);
      setContentItems(updated);
      toast.success("Content item removed");
    } else {
      toast.warning("At least one content item is required");
    }
  };

  const updateContentItem = (index: number, field: keyof ContentItem, value: any) => {
    const updated = [...contentItems];
    updated[index] = { ...updated[index], [field]: value };
    
    if (field === "type") {
      updated[index].textContent = undefined;
      updated[index].videoUrl = undefined;
      updated[index].file = undefined;
    }
    
    setContentItems(updated);
  };

  const handleFileChange = (index: number, file: File | null) => {
    if (file) {
      const updated = [...contentItems];
      updated[index].file = file;
      setContentItems(updated);
    }
  };

  return (
    <>
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
          {/* Grade Display */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-indigo-600 font-medium">Assigned Grade</p>
                <p className="text-lg font-bold text-indigo-900">Grade {grade.grade}</p>
              </div>
            </div>
          </div>

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
            <Label htmlFor="unit" className="text-lg font-semibold text-gray-700">
              Unit <span className="text-red-500">*</span>
            </Label>
            <Select
              value={selectedUnitId}
              onValueChange={setSelectedUnitId}
              disabled={!hasUnitsAvailable}
            >
              <SelectTrigger
                className={`h-12 border-2 rounded-xl ${
                  !hasUnitsAvailable
                    ? "opacity-50 cursor-not-allowed"
                    : errors.unitId
                      ? "border-red-300 focus:border-red-500"
                      : "border-orange-200 focus:border-orange-500"
                }`}
              >
                <SelectValue 
                  placeholder={
                    !hasUnitsAvailable 
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
            {!hasUnitsAvailable && (
              <p className="text-xs text-amber-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                No units available for Grade {grade.grade}. Please add units first.
              </p>
            )}
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
        </CardContent>
      </Card>

      {/* Content Items Section */}
      <Card className="shadow-2xl border-0 bg-white rounded-3xl overflow-hidden">
        <CardHeader className="pb-4 bg-gradient-to-br from-slate-50 to-gray-50">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <Badge variant="secondary" className="bg-gradient-to-r from-blue-100 to-indigo-100 text-slate-700 border-0 px-4 py-1 rounded-full">
                  Content Items
                </Badge>
              </div>
              <CardTitle className="text-2xl bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent">
                Chapter Content
              </CardTitle>
            </div>
            <Button
              type="button"
              onClick={addContentItem}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl px-6 py-3"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Content
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-8 space-y-6">
          {contentItems.map((item, index) => (
            <div
              key={index}
              className="border-2 border-slate-200 rounded-2xl p-6 space-y-4 bg-gradient-to-br from-slate-50/50 to-blue-50/30"
            >
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-slate-800 flex items-center">
                  <span className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full flex items-center justify-center text-sm mr-2">
                    {index + 1}
                  </span>
                  Content Item {index + 1}
                </h4>
                {contentItems.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeContentItem(index)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Content Type <span className="text-red-500">*</span></Label>
                  <Select
                    value={item.type}
                    onValueChange={(value: "video" | "text" | "pdf" | "mixed") => 
                      updateContentItem(index, "type", value)
                    }
                  >
                    <SelectTrigger className="h-11 border-2 border-slate-200 focus:border-blue-500 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="video">
                        <div className="flex items-center gap-2">
                          <Video className="w-4 h-4" /> Video Only
                        </div>
                      </SelectItem>
                      <SelectItem value="text">
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4" /> Text Only
                        </div>
                      </SelectItem>
                      <SelectItem value="pdf">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4" /> PDF Only
                        </div>
                      </SelectItem>
                      <SelectItem value="mixed">
                        <div className="flex items-center gap-2">
                          <Video className="w-4 h-4" />
                          <BookOpen className="w-4 h-4" /> Video + Text
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Title (Optional)</Label>
                  <Input
                    placeholder="Content title"
                    value={item.title || ""}
                    onChange={(e) => updateContentItem(index, "title", e.target.value)}
                    className="h-11 border-2 border-slate-200 focus:border-blue-500 rounded-xl"
                  />
                </div>
              </div>

              {item.type === "video" && (
                <div className="space-y-3">
                  <Label>Video URL (Optional)</Label>
                  <Input
                    type="url"
                    placeholder="https://youtube.com/... (optional)"
                    value={item.videoUrl || ""}
                    onChange={(e) => updateContentItem(index, "videoUrl", e.target.value)}
                    className="h-11 border-2 border-slate-200 focus:border-purple-500 rounded-xl"
                  />
                  {item.url && !item.file && (
                    <p className="text-sm text-blue-600">Current: {item.url}</p>
                  )}
                  <div className="relative">
                    <Input
                      type="file"
                      accept="video/*"
                      onChange={(e) => handleFileChange(index, e.target.files?.[0] || null)}
                      className="h-11 border-2 border-slate-200 focus:border-purple-500 rounded-xl cursor-pointer"
                    />
                    {item.file && (
                      <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                        <UploadIcon className="h-3 w-3" />
                        {item.file.name}
                      </p>
                    )}
                  </div>
                  {errors[`content_${index}`] && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors[`content_${index}`]}
                    </p>
                  )}
                </div>
              )}

              {item.type === "text" && (
                <div className="space-y-3">
                  <Label>Text Content (Optional)</Label>
                  <Textarea
                    placeholder="Enter educational text content... (optional)"
                    value={item.textContent || ""}
                    onChange={(e) => updateContentItem(index, "textContent", e.target.value)}
                    rows={8}
                    className="border-2 border-slate-200 focus:border-emerald-500 rounded-xl resize-none font-serif"
                  />
                  {errors[`content_${index}`] && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors[`content_${index}`]}
                    </p>
                  )}
                </div>
              )}

              {item.type === "pdf" && (
                <div className="space-y-3">
                  <Label>PDF File (Optional)</Label>
                  {item.url && !item.file && (
                    <p className="text-sm text-blue-600">Current PDF uploaded</p>
                  )}
                  <Input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => handleFileChange(index, e.target.files?.[0] || null)}
                    className="h-11 border-2 border-slate-200 focus:border-orange-500 rounded-xl cursor-pointer"
                  />
                  {item.file && (
                    <p className="text-sm text-green-600 flex items-center gap-1">
                      <UploadIcon className="h-3 w-3" />
                      {item.file.name}
                    </p>
                  )}
                  {errors[`content_${index}`] && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors[`content_${index}`]}
                    </p>
                  )}
                </div>
              )}

              {item.type === "mixed" && (
                <div className="space-y-4">
                  <div className="space-y-3">
                    <Label>Video URL or File Upload (Optional)</Label>
                    <Input
                      type="url"
                      placeholder="https://youtube.com/... (optional)"
                      value={item.videoUrl || ""}
                      onChange={(e) => updateContentItem(index, "videoUrl", e.target.value)}
                      className="h-11 border-2 border-slate-200 focus:border-purple-500 rounded-xl"
                    />
                    {item.url && !item.file && (
                      <p className="text-sm text-blue-600">Current: {item.url}</p>
                    )}
                    <div className="relative">
                      <Input
                        type="file"
                        accept="video/*"
                        onChange={(e) => handleFileChange(index, e.target.files?.[0] || null)}
                        className="h-11 border-2 border-slate-200 focus:border-purple-500 rounded-xl cursor-pointer"
                      />
                      {item.file && (
                        <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                          <UploadIcon className="h-3 w-3" />
                          {item.file.name}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="border-t pt-4 space-y-3">
                    <Label>Text Content (Optional)</Label>
                    <Textarea
                      placeholder="Enter educational text content... (optional)"
                      value={item.textContent || ""}
                      onChange={(e) => updateContentItem(index, "textContent", e.target.value)}
                      rows={8}
                      className="border-2 border-slate-200 focus:border-emerald-500 rounded-xl resize-none font-serif"
                    />
                    <p className="text-xs text-slate-500">
                      {item.textContent?.length || 0} characters
                    </p>
                  </div>

                  {errors[`content_${index}`] && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors[`content_${index}`]}
                    </p>
                  )}
                  <p className="text-xs text-slate-500">
                    Combine video and text content - both are optional, but provide at least one
                  </p>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </>
  );
}