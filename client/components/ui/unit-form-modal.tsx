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

interface unitFormModalProps {
  title: string;
  initialData?: { _id: string; unit: string } | null;
  onSubmit: (unit: string) => Promise<void>;
  onClose: () => void;
}

export default function UnitFormModal({
  title,
  initialData,
  onSubmit,
  onClose,
}: unitFormModalProps) {
  const [unit, setUnit] = useState(initialData?.unit || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setUnit(initialData?.unit || "");
    setError(null);
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!unit.trim()) {
      setError("unit cannot be empty.");
      return;
    }
    setIsSubmitting(true);
    try {
      await onSubmit(unit.trim());
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
            <Label htmlFor="unit" className="text-right">
              unit
            </Label>
            <Input
              id="unit"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
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
            {initialData ? "Save changes" : "Add unit"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
