"use client"
import { useState, useEffect } from "react";
import api from "@/lib/api";
import { toast } from "sonner";

interface UseSubmissionsParams {
  assignmentId: string;
  limit?: number;
}

export const useSubmissions = ({ assignmentId, limit = 10 }: UseSubmissionsParams) => {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchSubmissions = async () => {
    try {
      setLoading(true);

      const response = await api.get(`/assignments/${assignmentId}/submissions`, {
        params: {
          page: currentPage,
          limit,
          search: searchTerm.trim() || undefined,
        },
      });

      if (response.data.success) {
        setSubmissions(response.data.data || []);
        setTotalPages(response.data.pagination?.totalPages || 1);
      }
    } catch (error: any) {
      console.error("Error fetching submissions:", error);
      toast.error(
        error.response?.data?.message || "Failed to load submissions"
      );
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  useEffect(() => {
    if (assignmentId) {
      fetchSubmissions();
    }
  }, [assignmentId, currentPage, searchTerm]);

  const gradeSubmission = async (
    submissionId: string,
    score: number,
    feedback: string,
  ) => {
    try {
      const response = await api.put(`/submissions/${submissionId}/grade`, {
        score,
        feedback,
      });

      if (response.data.success) {
        toast.success("Submission graded successfully");
        setSubmissions((prev) =>
          prev.map((sub) =>
            sub._id === submissionId
              ? { ...sub, score, feedback, gradedAt: new Date() }
              : sub
          )
        );
      }
    } catch (error: any) {
      console.error("Error grading submission:", error);
      toast.error(
        error.response?.data?.message || "Failed to grade submission"
      );
      throw error;
    }
  };

  return {
    submissions,
    loading,
    currentPage,
    totalPages,
    searchTerm,
    setSearchTerm,
    setCurrentPage,
    gradeSubmission,
    refetch: fetchSubmissions,
  };
};


