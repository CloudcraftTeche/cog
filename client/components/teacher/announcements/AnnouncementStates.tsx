// components/announcements/AnnouncementStates.tsx
"use client";

import { Bell, AlertCircle } from "lucide-react";

interface EmptyStateProps {
  hasSearch: boolean;
  hasFilters: boolean;
  onClearFilters: () => void;
}

export const EmptyState = ({
  hasSearch,
  hasFilters,
  onClearFilters,
}: EmptyStateProps) => {
  const shouldShowClearButton = hasSearch || hasFilters;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-16 text-center">
      <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
        <Bell className="w-12 h-12 text-gray-400" />
      </div>
      <h3 className="text-3xl font-bold text-gray-800 mb-3">
        No Announcements Found
      </h3>
      <p className="text-gray-600 text-lg mb-6">
        {shouldShowClearButton
          ? "No announcements match your search criteria. Try adjusting your filters."
          : "There are no announcements available at the moment. Check back later!"}
      </p>
      {shouldShowClearButton && (
        <button
          onClick={onClearFilters}
          className="px-6 py-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors font-semibold"
        >
          Clear Filters
        </button>
      )}
    </div>
  );
};

interface ErrorStateProps {
  error: Error | null;
  onRetry: () => void;
}

export const ErrorState = ({ error, onRetry }: ErrorStateProps) => {
  return (
    <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 text-center">
      <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <AlertCircle className="w-10 h-10 text-red-600" />
      </div>
      <h3 className="text-2xl font-bold text-red-800 mb-2">
        Error Loading Announcements
      </h3>
      <p className="text-red-600 mb-6 text-lg">
        {error?.message || "An unexpected error occurred"}
      </p>
      <button
        onClick={onRetry}
        className="px-8 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-semibold shadow-lg"
      >
        Try Again
      </button>
    </div>
  );
};