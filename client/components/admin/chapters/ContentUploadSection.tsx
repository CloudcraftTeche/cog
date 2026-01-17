"use client";
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Video, BookOpen, FileText, Plus, Trash2, Upload as UploadIcon, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface ContentItem {
  type: "video" | "text" | "pdf"|"mixed";
  order: number;
  title?: string;
  textContent?: string;
  videoUrl?: string;
  file?: File;
}

interface ContentUploadSectionProps {
  contentItems: ContentItem[];
  setContentItems: (items: ContentItem[]) => void;
  errors?: Record<string, string>;
}

export default function ContentUploadSection({
  contentItems,
  setContentItems,
  errors = {},
}: ContentUploadSectionProps) {
  
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
    
    // Clear previous content when changing type
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
      
      // Validate file type
      const item = updated[index];
      if (item.type === "video") {
        if (!file.type.startsWith("video/")) {
          toast.error("Please upload a valid video file");
          return;
        }
      } else if (item.type === "pdf") {
        if (file.type !== "application/pdf") {
          toast.error("Please upload a valid PDF file");
          return;
        }
      }
      
      // Validate file size (100MB max)
      const maxSize = 100 * 1024 * 1024; // 100MB in bytes
      if (file.size > maxSize) {
        toast.error("File size must be less than 100MB");
        return;
      }
      
      updated[index].file = file;
      // Clear videoUrl if file is uploaded
      updated[index].videoUrl = undefined;
      setContentItems(updated);
      toast.success(`File "${file.name}" attached`);
    }
  };

  const getContentIcon = (type: string) => {
    switch (type) {
      case "video": return <Video className="w-5 h-5 text-white" />;
      case "text": return <BookOpen className="w-5 h-5 text-white" />;
      case "pdf": return <FileText className="w-5 h-5 text-white" />;
      default: return <BookOpen className="w-5 h-5 text-white" />;
    }
  };

  const getGradientClass = (type: string) => {
    switch (type) {
      case "video": return "from-purple-500 to-pink-500";
      case "text": return "from-emerald-500 to-teal-500";
      case "pdf": return "from-orange-500 to-red-500";
      default: return "from-blue-500 to-indigo-500";
    }
  };

  return (
    <Card className="shadow-2xl border-0 bg-white rounded-3xl overflow-hidden">
      <div className={`h-2 bg-gradient-to-r ${getGradientClass(contentItems[0]?.type || "video")}`}></div>
      <CardHeader className="pb-4 bg-gradient-to-br from-slate-50 to-gray-50">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <div className={`w-10 h-10 bg-gradient-to-r ${getGradientClass(contentItems[0]?.type || "video")} rounded-full flex items-center justify-center`}>
                {getContentIcon(contentItems[0]?.type || "video")}
              </div>
              <Badge variant="secondary" className={`bg-gradient-to-r ${getGradientClass(contentItems[0]?.type || "video")}/10 text-slate-700 border-0 px-4 py-1 rounded-full`}>
                Content Items
              </Badge>
            </div>
            <CardTitle className="text-2xl bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent">
              Chapter Content
            </CardTitle>
            <CardDescription className="text-slate-600 text-base">
              Add multiple content items (video, text, or PDF)
            </CardDescription>
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
                  onValueChange={(value: "video" | "text" | "pdf") => 
                    updateContentItem(index, "type", value)
                  }
                >
                  <SelectTrigger className="h-11 border-2 border-slate-200 focus:border-blue-500 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="video">
                      <div className="flex items-center gap-2">
                        <Video className="w-4 h-4" /> Video
                      </div>
                    </SelectItem>
                    <SelectItem value="text">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4" /> Text
                      </div>
                    </SelectItem>
                    <SelectItem value="pdf">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4" /> PDF
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
                <Label>
                  Video URL or File Upload <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="url"
                  placeholder="https://youtube.com/... or https://vimeo.com/..."
                  value={item.videoUrl || ""}
                  onChange={(e) => updateContentItem(index, "videoUrl", e.target.value)}
                  className={`h-11 border-2 rounded-xl ${
                    errors[`content_${index}`]
                      ? "border-red-300 focus:border-red-500"
                      : "border-slate-200 focus:border-purple-500"
                  }`}
                  disabled={!!item.file}
                />
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-px bg-slate-300"></div>
                  <span className="text-xs text-slate-500">OR</span>
                  <div className="flex-1 h-px bg-slate-300"></div>
                </div>
                <div className="relative">
                  <Input
                    type="file"
                    accept="video/*"
                    onChange={(e) => handleFileChange(index, e.target.files?.[0] || null)}
                    className="h-11 border-2 border-slate-200 focus:border-purple-500 rounded-xl cursor-pointer"
                    disabled={!!item.videoUrl}
                  />
                  {item.file && (
                    <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                      <UploadIcon className="h-3 w-3" />
                      {item.file.name} ({(item.file.size / (1024 * 1024)).toFixed(2)} MB)
                    </p>
                  )}
                </div>
                {errors[`content_${index}`] && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors[`content_${index}`]}
                  </p>
                )}
                <p className="text-xs text-slate-500">
                  Provide a YouTube/Vimeo URL or upload a video file (MP4, WebM, max 100MB)
                </p>
              </div>
            )}

            {item.type === "text" && (
              <div className="space-y-3">
                <Label>
                  Text Content <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  placeholder="Enter educational text content..."
                  value={item.textContent || ""}
                  onChange={(e) => updateContentItem(index, "textContent", e.target.value)}
                  rows={8}
                  className={`border-2 rounded-xl resize-none font-serif ${
                    errors[`content_${index}`]
                      ? "border-red-300 focus:border-red-500"
                      : "border-slate-200 focus:border-emerald-500"
                  }`}
                />
                {errors[`content_${index}`] && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors[`content_${index}`]}
                  </p>
                )}
                <p className="text-xs text-slate-500">
                  {item.textContent?.length || 0} characters
                </p>
              </div>
            )}

            {item.type === "pdf" && (
              <div className="space-y-3">
                <Label>
                  PDF File <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={(e) => handleFileChange(index, e.target.files?.[0] || null)}
                  className={`h-11 border-2 rounded-xl cursor-pointer ${
                    errors[`content_${index}`]
                      ? "border-red-300 focus:border-red-500"
                      : "border-slate-200 focus:border-orange-500"
                  }`}
                />
                {item.file && (
                  <p className="text-sm text-green-600 flex items-center gap-1">
                    <UploadIcon className="h-3 w-3" />
                    {item.file.name} ({(item.file.size / (1024 * 1024)).toFixed(2)} MB)
                  </p>
                )}
                {errors[`content_${index}`] && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors[`content_${index}`]}
                  </p>
                )}
                <p className="text-xs text-slate-500">
                  Upload a PDF document (max 100MB)
                </p>
              </div>
            )}
          </div>
        ))}

        {contentItems.length === 0 && (
          <div className="text-center py-12 border-2 border-dashed border-slate-300 rounded-2xl">
            <p className="text-slate-500 mb-4">No content items added yet</p>
            <Button
              type="button"
              onClick={addContentItem}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add First Content Item
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}