"use client";

import { useState, useEffect } from "react";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2Icon } from "lucide-react";

interface GradeFormModalProps {
  title: string;
  initialData?: { _id: string; grade: string } | null;
  onSubmit: (grade: string) => Promise<void>;
  onClose: () => void;
}

export default function GradeFormModal({
  title,
  initialData,
  onSubmit,
  onClose,
}: GradeFormModalProps) {
  const [grade, setGrade] = useState(initialData?.grade || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setGrade(initialData?.grade || "");
    setError(null);
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!grade.trim()) {
      setError("Grade cannot be empty.");
      return;
    }
    setIsSubmitting(true);
    try {
      await onSubmit(grade.trim());
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit}>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="grade" className="text-right">
              Grade
            </Label>
            <Input
              id="grade"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="col-span-3"
              disabled={isSubmitting}
              required
            />
          </div>
          {error && (
            <p className="text-destructive text-sm text-center mt-2">{error}</p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && (
              <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
            )}
            {initialData ? "Save changes" : "Add Grade"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
