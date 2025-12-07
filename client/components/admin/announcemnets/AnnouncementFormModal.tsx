import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Upload, X, Loader2 } from "lucide-react";
import { ACCENT_COLORS, IAnnouncement, IGrade } from "@/utils/announcement.utils";
interface AnnouncementFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FormData) => Promise<void>;
  announcement?: IAnnouncement | null;
  grades: IGrade[];
}
export const AnnouncementFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  announcement,
  grades,
}: AnnouncementFormModalProps) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState<"text" | "image" | "video">("text");
  const [accentColor, setAccentColor] = useState("#15803d");
  const [isPinned, setIsPinned] = useState(false);
  const [targetAudience, setTargetAudience] = useState<"all" | "specific">("all");
  const [selectedGrades, setSelectedGrades] = useState<string[]>([]);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  useEffect(() => {
    if (announcement) {
      setTitle(announcement.title);
      setContent(announcement.content);
      setType(announcement.type);
      setAccentColor(announcement.accentColor);
      setIsPinned(announcement.isPinned);
      setTargetAudience(announcement.targetAudience);
      setSelectedGrades(announcement.targetGrades.map((g) => g._id));
      setMediaPreview(announcement.mediaUrl || null);
    } else {
      resetForm();
    }
  }, [announcement, isOpen]);
  const resetForm = () => {
    setTitle("");
    setContent("");
    setType("text");
    setAccentColor("#15803d");
    setIsPinned(false);
    setTargetAudience("all");
    setSelectedGrades([]);
    setMediaFile(null);
    setMediaPreview(null);
  };
  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMediaFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setMediaPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  const toggleGrade = (gradeId: string) => {
    setSelectedGrades((prev) =>
      prev.includes(gradeId)
        ? prev.filter((id) => id !== gradeId)
        : [...prev, gradeId]
    );
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("content", content);
      formData.append("type", type);
      formData.append("accentColor", accentColor);
      formData.append("isPinned", isPinned ? "true" : "false");
      formData.append("targetAudience", targetAudience);
      if (targetAudience === "specific" && selectedGrades.length > 0) {
        formData.append("targetGrades", JSON.stringify(selectedGrades));
      } else {
        formData.append("targetGrades", JSON.stringify([]));
      }
      if (mediaFile) {
        formData.append("file", mediaFile);
      } else if (announcement?.mediaUrl && !mediaFile) {
        formData.append("mediaUrl", announcement.mediaUrl);
      }
      console.log("FormData contents:");
      for (let pair of formData.entries()) {
        console.log(pair[0], pair[1]);
      }
      await onSubmit(formData);
      onClose();
      resetForm();
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {announcement ? "Edit Announcement" : "Create Announcement"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter announcement title"
              required
            />
          </div>
          <div>
            <Label htmlFor="content">Content *</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter announcement content"
              rows={4}
              required
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="type">Type</Label>
              <Select value={type} onValueChange={(val: any) => setType(val)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text Only</SelectItem>
                  <SelectItem value="image">With Image</SelectItem>
                  <SelectItem value="video">With Video</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="accentColor">Accent Color</Label>
              <Select
                value={accentColor}
                onValueChange={(val) => setAccentColor(val)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ACCENT_COLORS.map((color) => (
                    <SelectItem key={color.value} value={color.value}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded border"
                          style={{ backgroundColor: color.value }}
                        />
                        {color.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {(type === "image" || type === "video") && (
            <div>
              <Label>Media Upload</Label>
              <div className="border-2 border-dashed rounded-lg p-4 text-center">
                {mediaPreview ? (
                  <div className="relative">
                    {type === "image" ? (
                      <img
                        src={mediaPreview}
                        alt="Preview"
                        className="max-h-48 mx-auto rounded"
                      />
                    ) : (
                      <video
                        src={mediaPreview}
                        controls
                        className="max-h-48 mx-auto rounded"
                      />
                    )}
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => {
                        setMediaFile(null);
                        setMediaPreview(null);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <label className="cursor-pointer">
                    <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600">
                      Click to upload {type}
                    </p>
                    <input
                      type="file"
                      accept={type === "image" ? "image/*" : "video/*"}
                      onChange={handleMediaChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>
          )}
          <div>
            <Label>Target Audience</Label>
            <Select
              value={targetAudience}
              onValueChange={(val: any) => setTargetAudience(val)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Students</SelectItem>
                <SelectItem value="specific">Specific Grades</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {targetAudience === "specific" && (
            <div>
              <Label>Select Grades</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {grades.map((grade) => (
                  <Badge
                    key={grade._id}
                    variant={
                      selectedGrades.includes(grade._id) ? "default" : "outline"
                    }
                    className="cursor-pointer"
                    onClick={() => toggleGrade(grade._id)}
                  >
                    {grade.grade}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          <div className="flex items-center justify-between">
            <Label htmlFor="isPinned">Pin Announcement</Label>
            <Switch
              id="isPinned"
              checked={isPinned}
              onCheckedChange={setIsPinned}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : announcement ? (
                "Update"
              ) : (
                "Create"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};