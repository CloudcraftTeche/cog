"use client";
import React, { useState } from "react";
import { FileCheck, Clock, Users, AlertCircle, AlertTriangle } from "lucide-react";
import { PendingAssignment, Submission } from "@/types/teacher/teacherDashboard.types";
import { formatDate, formatDateTime, getDaysOverdue } from "@/utils/teacher/dashboard.utils";
import { usePendingGradings } from "@/hooks/teacher/useTeacherDashboard";

const LoadingSkeleton: React.FC = () => (
  <div className="bg-white rounded-2xl shadow-lg p-6 animate-pulse">
    <div className="h-8 w-48 bg-gray-200 rounded mb-4"></div>
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-24 bg-gray-100 rounded-xl" />
      ))}
    </div>
  </div>
);

const ErrorDisplay: React.FC<{ message: string }> = ({ message }) => (
  <div className="bg-white rounded-2xl shadow-lg p-6">
    <div className="flex items-center gap-3 text-red-600">
      <AlertCircle className="w-6 h-6" />
      <span className="font-semibold">Error loading pending gradings</span>
    </div>
    <p className="text-gray-600 mt-2">{message}</p>
  </div>
);

const EmptyState: React.FC = () => (
  <div className="text-center py-8">
    <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
      <FileCheck className="w-8 h-8 text-green-600" />
    </div>
    <p className="text-gray-600 font-medium">All caught up!</p>
    <p className="text-sm text-gray-500 mt-1">No pending submissions to grade</p>
  </div>
);

interface SubmissionItemProps {
  submission: Submission;
}

const SubmissionItem: React.FC<SubmissionItemProps> = ({ submission }) => {
  const initials = submission.studentName.charAt(0);

  return (
    <div className="bg-white rounded-lg p-3 border border-purple-100 hover:border-purple-300 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white font-bold">
            {initials}
          </div>
          <div>
            <div className="font-semibold text-gray-800">{submission.studentName}</div>
            <div className="text-sm text-gray-600">{submission.rollNumber}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-600 mb-1">Submitted</div>
          <div className="text-sm font-medium text-gray-800">
            {formatDateTime(submission.submittedAt)}
          </div>
        </div>
      </div>
    </div>
  );
};

interface AssignmentCardProps {
  assignment: PendingAssignment;
  isExpanded: boolean;
  onToggle: () => void;
}

const AssignmentCard: React.FC<AssignmentCardProps> = ({ assignment, isExpanded, onToggle }) => {
  const daysOverdue = getDaysOverdue(assignment.endDate);

  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300">
      <div className="p-4 cursor-pointer" onClick={onToggle}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h4 className="font-bold text-gray-800 text-lg mb-1">
              {assignment.assignmentTitle}
            </h4>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>Due: {formatDate(assignment.endDate.toString())}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="font-medium">{assignment.totalMarks ?? 0} marks</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
              {assignment.pendingCount ?? 0} pending
            </div>
            {daysOverdue > 0 && (
              <div className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs font-medium">
                {daysOverdue}d overdue
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-purple-600">
            <Users className="w-4 h-4" />
            <span className="font-medium">
              {assignment.submissions?.length ?? 0} submission
              {assignment.submissions?.length !== 1 ? "s" : ""}
            </span>
          </div>
          <button 
            className="text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
            type="button"
          >
            {isExpanded ? "Hide" : "Show"} Details
            <span className={`transition-transform ${isExpanded ? "rotate-180" : ""}`}>
              ▼
            </span>
          </button>
        </div>
      </div>

      {isExpanded && assignment.submissions && assignment.submissions.length > 0 && (
        <div className="border-t border-purple-200 bg-white/50 p-4">
          <div className="space-y-2">
            {assignment.submissions.map((submission, idx) => (
              <SubmissionItem key={idx} submission={submission} />
            ))}
          </div>
          <button 
            className="w-full mt-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-medium py-2 px-4 rounded-lg hover:from-purple-600 hover:to-pink-700 transition-all duration-300 flex items-center justify-center gap-2"
            type="button"
          >
            <FileCheck className="w-4 h-4" />
            Grade Submissions
          </button>
        </div>
      )}
    </div>
  );
};

export const PendingGradings: React.FC = () => {
  const { data: assignments = [], isLoading, error } = usePendingGradings();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const totalPending = assignments.reduce((sum, a) => sum + (a.pendingCount ?? 0), 0);

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return <ErrorDisplay message={error.message || "Failed to load pending gradings"} />;
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-3 rounded-xl text-white">
            <FileCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800">Pending Gradings</h3>
            <p className="text-sm text-gray-600">Submissions waiting for review</p>
          </div>
        </div>
        {totalPending > 0 && (
          <div className="bg-red-100 text-red-700 px-4 py-2 rounded-full font-bold text-lg">
            {totalPending}
          </div>
        )}
      </div>

      {assignments.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {assignments.map((assignment) => (
              <AssignmentCard
                key={assignment.assignmentId}
                assignment={assignment}
                isExpanded={expandedId === assignment.assignmentId}
                onToggle={() => setExpandedId(
                  expandedId === assignment.assignmentId ? null : assignment.assignmentId
                )}
              />
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                <span className="font-bold text-purple-600">{totalPending}</span>{" "}
                total submission{totalPending !== 1 ? "s" : ""} pending
              </div>
              <button 
                className="text-sm font-medium text-purple-600 hover:text-purple-700 hover:underline"
                type="button"
              >
                View All Assignments
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};