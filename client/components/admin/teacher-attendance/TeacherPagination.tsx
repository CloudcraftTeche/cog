"use client";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface TeacherPaginationProps {
  meta: any;
  onPageChange: (page: number) => void;
  isFetching?: boolean;
}


export default function TeacherPagination({
  meta,
  onPageChange,
  isFetching = false,
}: TeacherPaginationProps) {
  const { page, totalPages, total, limit, hasNextPage, hasPrevPage } = meta;

  const buildPageNumbers = (): (number | "…")[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | "…")[] = [1];

    if (page > 3) pages.push("…");

    const start = Math.max(2, page - 1);
    const end = Math.min(totalPages - 1, page + 1);
    for (let i = start; i <= end; i++) pages.push(i);

    if (page < totalPages - 2) pages.push("…");

    pages.push(totalPages);
    return pages;
  };

  const firstItem = total === 0 ? 0 : (page - 1) * limit + 1;
  const lastItem = Math.min(page * limit, total);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-1">
      <p
        className={`text-sm transition-opacity ${isFetching ? "opacity-40" : "opacity-100"} text-gray-600`}
      >
        Showing{" "}
        <span className="font-semibold text-gray-800">
          {firstItem}–{lastItem}
        </span>{" "}
        of{" "}
        <span className="font-semibold text-gray-800">{total}</span> teachers
      </p>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={!hasPrevPage || isFetching}
          aria-label="Previous page"
          className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {buildPageNumbers().map((p, idx) =>
          p === "…" ? (
            <span
              key={`ellipsis-${idx}`}
              className="px-2 py-1 text-sm text-gray-400 select-none"
            >
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              disabled={isFetching}
              aria-label={`Page ${p}`}
              aria-current={p === page ? "page" : undefined}
              className={`min-w-[36px] h-9 px-2 rounded-lg text-sm font-medium transition-colors disabled:cursor-not-allowed
                ${
                  p === page
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
            >
              {p}
            </button>
          )
        )}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={!hasNextPage || isFetching}
          aria-label="Next page"
          className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}