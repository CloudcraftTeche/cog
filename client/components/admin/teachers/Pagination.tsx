"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center items-center gap-4 pt-6">
      <Button
        variant="outline"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="rounded-xl border-2 border-purple-200 hover:border-purple-400 hover:bg-purple-50 disabled:opacity-50"
      >
        <ChevronLeft className="h-4 w-4 mr-2" />
        Previous
      </Button>

      <span className="px-6 py-3 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 font-semibold rounded-xl shadow-sm">
        Page {currentPage} of {totalPages}
      </span>

      <Button
        variant="outline"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="rounded-xl border-2 border-purple-200 hover:border-purple-400 hover:bg-purple-50 disabled:opacity-50"
      >
        Next
        <ChevronRight className="h-4 w-4 ml-2" />
      </Button>
    </div>
  );
}