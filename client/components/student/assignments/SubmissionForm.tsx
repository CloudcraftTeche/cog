"use client";
import { useState, useRef, ChangeEvent } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileText,
  Video,
  File,
  Upload,
  X,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import {
  SubmissionContent,
  SubmissionType,
} from "@/types/student/assignment.types";
interface ExistingSubmission {
  submissionType: SubmissionType;
  textContent?: string;
  videoUrl?: string;
  pdfUrl?: string;
}
interface SubmissionFormProps {
  value: SubmissionContent;
  onChange: (content: SubmissionContent) => void;
  disabled?: boolean;
  existingSubmission?: ExistingSubmission | null;
}
const MAX_VIDEO_SIZE = 100 * 1024 * 1024;
const MAX_PDF_SIZE = 10 * 1024 * 1024;
export function SubmissionForm({
  value,
  onChange,
  disabled = false,
  existingSubmission = null,
}: SubmissionFormProps) {
  const [uploadError, setUploadError] = useState<string | null>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const handleTypeChange = (type: string) => {
    const newType = type as SubmissionType;
    onChange({
      type: newType,
      textContent: newType === "text" ? value.textContent : undefined,
      videoFile: newType === "video" ? value.videoFile : undefined,
      pdfFile: newType === "pdf" ? value.pdfFile : undefined,
    });
    setUploadError(null);
  };
  const handleTextChange = (text: string) => {
    onChange({ ...value, textContent: text });
  };
  const handleVideoSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("video/")) {
      setUploadError("Please select a video file");
      return;
    }
    if (file.size > MAX_VIDEO_SIZE) {
      setUploadError("Video file size must be less than 100MB");
      return;
    }
    setUploadError(null);
    onChange({ ...value, videoFile: file });
  };
  const handlePdfSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      setUploadError("Please select a PDF file");
      return;
    }
    if (file.size > MAX_PDF_SIZE) {
      setUploadError("PDF file size must be less than 10MB");
      return;
    }
    setUploadError(null);
    onChange({ ...value, pdfFile: file });
  };
  const clearPdf = () => {
    onChange({ ...value, pdfFile: undefined });
    if (pdfInputRef.current) {
      pdfInputRef.current.value = "";
    }
  };
  const clearVideo = () => {
    onChange({ ...value, videoFile: undefined });
    if (videoInputRef.current) {
      videoInputRef.current.value = "";
    }
  };
  const isValid = (): boolean => {
    switch (value.type) {
      case "text":
        return !!value.textContent?.trim();
      case "video":
        return !!value.videoFile;
      case "pdf":
        return !!value.pdfFile;
      default:
        return false;
    }
  };
  if (existingSubmission && disabled) {
    return (
      <Card className="shadow-lg border-success/30 overflow-hidden">
        <CardHeader className="pb-4 bg-gradient-to-r from-success/10 to-transparent">
          <CardTitle className="text-lg flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-success to-primary text-white shadow-md">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            Your Submission
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-5">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50">
              <span className="text-sm text-muted-foreground font-medium">
                Type:
              </span>
              <span className="text-sm font-bold capitalize flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-primary/10 to-info/10 text-primary">
                {existingSubmission.submissionType === "video" && (
                  <Video className="w-4 h-4" />
                )}
                {existingSubmission.submissionType === "text" && (
                  <FileText className="w-4 h-4" />
                )}
                {existingSubmission.submissionType === "pdf" && (
                  <File className="w-4 h-4" />
                )}
                {existingSubmission.submissionType}
              </span>
            </div>
            {existingSubmission.submissionType === "text" &&
              existingSubmission.textContent && (
                <div className="p-5 rounded-xl bg-muted/30 border-2 border-border/50">
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">
                    {existingSubmission.textContent}
                  </p>
                </div>
              )}
            {existingSubmission.submissionType === "video" &&
              existingSubmission.videoUrl && (
                <div className="rounded-xl overflow-hidden border-2 border-border/50 shadow-lg">
                  <video
                    src={existingSubmission.videoUrl}
                    controls
                    className="w-full aspect-video"
                  />
                </div>
              )}
            {existingSubmission.submissionType === "pdf" &&
              existingSubmission.pdfUrl && (
                <div className="flex items-center gap-4 p-5 rounded-xl bg-gradient-to-r from-destructive/5 to-warning/5 border-2 border-destructive/20">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-destructive to-warning text-white shadow-md">
                    <File className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate text-foreground">
                      Submitted PDF
                    </p>
                    <a
                      href={existingSubmission.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline font-medium"
                    >
                      View PDF
                    </a>
                  </div>
                </div>
              )}
          </div>
        </CardContent>
      </Card>
    );
  }
  return (
    <Card className="shadow-lg border-border/50 overflow-hidden">
      <CardHeader className="pb-4 bg-gradient-to-r from-info/10 to-transparent">
        <CardTitle className="text-lg flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-info to-primary text-white shadow-md">
            <Upload className="w-5 h-5" />
          </div>
          Your Submission
          {isValid() && (
            <span className="ml-auto flex items-center gap-2 text-sm font-medium text-success">
              <CheckCircle2 className="w-5 h-5" />
              Ready
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs
          value={value.type}
          onValueChange={handleTypeChange}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-3 mb-6 h-14 rounded-xl bg-muted/50 p-1.5">
            <TabsTrigger
              value="text"
              disabled={disabled}
              className="gap-2 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-success data-[state=active]:to-primary data-[state=active]:text-white data-[state=active]:shadow-md transition-all"
            >
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline font-semibold">Text</span>
            </TabsTrigger>
            <TabsTrigger
              value="video"
              disabled={disabled}
              className="gap-2 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-info data-[state=active]:text-white data-[state=active]:shadow-md transition-all"
            >
              <Video className="w-4 h-4" />
              <span className="hidden sm:inline font-semibold">Video</span>
            </TabsTrigger>
            <TabsTrigger
              value="pdf"
              disabled={disabled}
              className="gap-2 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-destructive data-[state=active]:to-warning data-[state=active]:text-white data-[state=active]:shadow-md transition-all"
            >
              <File className="w-4 h-4" />
              <span className="hidden sm:inline font-semibold">PDF</span>
            </TabsTrigger>
          </TabsList>
          {}
          <TabsContent value="text" className="mt-0">
            <div className="space-y-3">
              <Label
                htmlFor="textContent"
                className="text-sm font-semibold flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-success" />
                Write your answer
              </Label>
              <Textarea
                id="textContent"
                placeholder="Type your answer here..."
                value={value.textContent ?? ""}
                onChange={(e) => handleTextChange(e.target.value)}
                disabled={disabled}
                className="min-h-[200px] resize-y rounded-xl border-2 border-border/50 focus:border-success/50 transition-colors"
              />
              <p className="text-xs text-muted-foreground font-medium">
                {value.textContent?.length ?? 0} characters
              </p>
            </div>
          </TabsContent>
          {}
          <TabsContent value="video" className="mt-0">
            <div className="space-y-5">
              {!value.videoFile && (
                <div
                  onClick={() => !disabled && videoInputRef.current?.click()}
                  className={`border-3 border-dashed rounded-2xl p-10 text-center transition-all ${
                    disabled
                      ? "opacity-50 cursor-not-allowed border-border"
                      : "cursor-pointer border-primary/30 hover:border-primary hover:bg-primary/5"
                  }`}
                >
                  <input
                    ref={videoInputRef}
                    type="file"
                    accept="video/*"
                    onChange={handleVideoSelect}
                    disabled={disabled}
                    className="hidden"
                  />
                  <div className="flex flex-col items-center gap-3">
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-primary to-info text-white shadow-lg">
                      <Upload className="w-8 h-8" />
                    </div>
                    <p className="text-base font-bold text-foreground">
                      Click to select Video
                    </p>
                    <p className="text-xs text-muted-foreground">
                      MP4, WebM, MOV - Max 100MB
                    </p>
                  </div>
                </div>
              )}
              {value.videoFile && (
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-5 rounded-xl bg-gradient-to-r from-success/5 to-primary/5 border-2 border-success/30">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-info text-white shadow-md">
                      <Video className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate text-foreground">
                        {value.videoFile.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {(value.videoFile.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                    {!disabled && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={clearVideo}
                        className="shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl"
                      >
                        <X className="w-5 h-5" />
                      </Button>
                    )}
                  </div>
                  <div className="rounded-xl overflow-hidden border-2 border-primary/30 shadow-lg">
                    <video
                      src={URL.createObjectURL(value.videoFile)}
                      controls
                      className="w-full aspect-video"
                    />
                  </div>
                </div>
              )}
              {uploadError && (
                <p className="text-sm text-destructive font-medium">
                  {uploadError}
                </p>
              )}
            </div>
          </TabsContent>
          {}
          <TabsContent value="pdf" className="mt-0">
            <div className="space-y-5">
              {!value.pdfFile && (
                <div
                  onClick={() => !disabled && pdfInputRef.current?.click()}
                  className={`border-3 border-dashed rounded-2xl p-10 text-center transition-all ${
                    disabled
                      ? "opacity-50 cursor-not-allowed border-border"
                      : "cursor-pointer border-destructive/30 hover:border-destructive hover:bg-destructive/5"
                  }`}
                >
                  <input
                    ref={pdfInputRef}
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handlePdfSelect}
                    disabled={disabled}
                    className="hidden"
                  />
                  <div className="flex flex-col items-center gap-3">
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-destructive to-warning text-white shadow-lg">
                      <Upload className="w-8 h-8" />
                    </div>
                    <p className="text-base font-bold text-foreground">
                      Click to select PDF
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Max file size: 10MB
                    </p>
                  </div>
                </div>
              )}
              {value.pdfFile && (
                <div className="flex items-center gap-4 p-5 rounded-xl bg-gradient-to-r from-success/5 to-primary/5 border-2 border-success/30">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-destructive to-warning text-white shadow-md">
                    <File className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate text-foreground">
                      {value.pdfFile.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {(value.pdfFile.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                  {!disabled && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={clearPdf}
                      className="shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl"
                    >
                      <X className="w-5 h-5" />
                    </Button>
                  )}
                </div>
              )}
              {uploadError && (
                <p className="text-sm text-destructive font-medium">
                  {uploadError}
                </p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
