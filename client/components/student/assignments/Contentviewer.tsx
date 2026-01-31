// components/student/assignments/ContentViewer.tsx
"use client";

import { useState } from "react";
import {
  Video,
  FileText,
  File,
  ExternalLink,
  Download,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { IAssignment } from "@/types/student/assignment.types";

interface ContentViewerProps {
  assignment: IAssignment;
}

type ViewerType = "google" | "office" | "direct";

export function ContentViewer({ assignment }: ContentViewerProps) {
  const [pdfError, setPdfError] = useState(false);
  const [viewerType, setViewerType] = useState<ViewerType>("google");

  // Video Content
  if (assignment.contentType === "video" && assignment.videoUrl) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Video className="w-4 h-4 text-primary" />
          Video Content
        </div>
        <div className="relative aspect-video rounded-xl overflow-hidden bg-secondary border border-border">
          <video
            src={assignment.videoUrl}
            controls
            className="w-full h-full object-contain"
            crossOrigin="anonymous"
          >
            Your browser does not support the video tag.
          </video>
        </div>
      </div>
    );
  }

  // PDF Content
  if (assignment.contentType === "pdf" && assignment.pdfUrl) {
    const pdfUrl = assignment.pdfUrl;
    const googleDocsUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(pdfUrl)}&embedded=true`;
    const officeViewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(pdfUrl)}`;

    const getViewerUrl = (): string => {
      switch (viewerType) {
        case "google":
          return googleDocsUrl;
        case "office":
          return officeViewerUrl;
        case "direct":
          return pdfUrl;
        default:
          return googleDocsUrl;
      }
    };

    const handleError = () => {
      if (viewerType === "google") {
        setViewerType("office");
        setPdfError(false);
      } else if (viewerType === "office") {
        setViewerType("direct");
        setPdfError(false);
      } else {
        setPdfError(true);
      }
    };

    const handleRetry = () => {
      setPdfError(false);
      setViewerType("google");
    };

    return (
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <File className="w-4 h-4 text-rose-500" />
            PDF Document
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="outline" size="sm" asChild>
              <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-2" />
                Open
              </a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href={pdfUrl} download>
                <Download className="w-4 h-4 mr-2" />
                Download
              </a>
            </Button>
          </div>
        </div>

        <div className="relative aspect-[4/3] sm:aspect-[16/10] rounded-xl overflow-hidden bg-secondary border border-border">
          {pdfError ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center">
              <div className="p-4 rounded-full bg-muted">
                <AlertTriangle className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium text-foreground mb-1">
                  Unable to preview PDF
                </p>
                <p className="text-sm text-muted-foreground">
                  The PDF couldn&apos;t be loaded in the viewer. Please use the
                  buttons above to open or download it.
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={handleRetry}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </div>
          ) : (
            <iframe
              src={getViewerUrl()}
              className="w-full h-full"
              title="PDF Viewer"
              onError={handleError}
              sandbox="allow-scripts allow-same-origin allow-popups"
            />
          )}
        </div>

        <p className="text-xs text-muted-foreground text-center">
          {!pdfError && (
            <>
              Viewing with{" "}
              {viewerType === "google"
                ? "Google Docs"
                : viewerType === "office"
                  ? "Microsoft Office"
                  : "Direct embed"}
              {viewerType !== "direct" && (
                <button
                  className="ml-2 text-primary hover:underline"
                  onClick={() =>
                    setViewerType(viewerType === "google" ? "office" : "google")
                  }
                >
                  Switch viewer
                </button>
              )}
            </>
          )}
        </p>
      </div>
    );
  }

  // Text Content
  if (assignment.contentType === "text" && assignment.textContent) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <FileText className="w-4 h-4 text-emerald-500" />
          Reading Material
        </div>
        <div className="p-4 sm:p-6 rounded-xl bg-secondary/50 border border-border">
          <div className="whitespace-pre-wrap text-foreground leading-relaxed text-sm sm:text-base">
            {assignment.textContent}
          </div>
        </div>
      </div>
    );
  }

  // No Content
  return (
    <div className="flex items-center justify-center p-8 rounded-xl bg-muted/30 border border-dashed border-border">
      <p className="text-muted-foreground">No content available</p>
    </div>
  );
}