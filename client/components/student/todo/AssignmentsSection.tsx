// components/dashboard/AssignmentsSection.tsx
import React from 'react';
import type { Assignment, AssignmentFilterStatus } from '@/types/student/todo.types';

interface AssignmentsSectionProps {
  assignments: Assignment[];
  filterStatus: AssignmentFilterStatus;
  onFilterChange: (status: AssignmentFilterStatus) => void;
}

const FILTER_OPTIONS: AssignmentFilterStatus[] = ['all', 'pending', 'submitted', 'overdue'];

export const AssignmentsSection: React.FC<AssignmentsSectionProps> = ({
  assignments,
  filterStatus,
  onFilterChange,
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <span>📋</span> All Assignments
        </h3>
        <span className="bg-purple-100 text-purple-600 px-3 py-1 rounded-full text-sm font-semibold">
          {assignments.length} assignments
        </span>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        {FILTER_OPTIONS.map((status) => (
          <button
            key={status}
            onClick={() => onFilterChange(status)}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              filterStatus === status
                ? 'bg-purple-500 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
        {assignments.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-4xl mb-2">🎯</p>
            <p className="text-lg font-semibold">No assignments found</p>
            <p className="text-sm mt-1">Try changing the filter</p>
          </div>
        ) : (
          assignments.map((assignment) => (
            <AssignmentCard key={assignment._id} assignment={assignment} />
          ))
        )}
      </div>
    </div>
  );
};

const AssignmentCard: React.FC<{ assignment: Assignment }> = ({ assignment }) => {
  const getCardStyle = () => {
    if (assignment.isPastDue) {
      return 'border-red-300 bg-red-50 hover:bg-red-100';
    }
    if (assignment.isSubmitted) {
      return 'border-green-300 bg-green-50 hover:bg-green-100';
    }
    if (assignment.daysLeft <= 2) {
      return 'border-orange-300 bg-orange-50 hover:bg-orange-100';
    }
    return 'border-blue-300 bg-blue-50 hover:bg-blue-100';
  };

  return (
    <div
      className={`p-4 rounded-xl border-2 transition-all duration-300 hover:shadow-md cursor-pointer ${getCardStyle()}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h4 className="font-semibold text-gray-800 text-lg">
              {assignment.title}
            </h4>
            {assignment.isSubmitted && (
              <span className="bg-green-500 text-white px-2 py-1 rounded text-xs font-bold">
                Submitted
              </span>
            )}
            {assignment.isPastDue && !assignment.isSubmitted && (
              <span className="bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                Overdue
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600 mb-2">{assignment.description}</p>
          <div className="flex flex-wrap gap-4 text-xs text-gray-500">
            <span>📅 Due: {new Date(assignment.endDate).toLocaleDateString()}</span>
            {!assignment.isSubmitted && (
              <span>⏰ {assignment.daysLeft} days left</span>
            )}
            {assignment.isSubmitted && assignment.submittedAt && (
              <span>
                ✅ Submitted: {new Date(assignment.submittedAt).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
        {assignment.score !== null && assignment.score !== undefined && (
          <div className="ml-4 bg-gradient-to-br from-green-400 to-emerald-500 text-white rounded-xl p-3 text-center flex-shrink-0">
            <div className="text-2xl font-bold">{assignment.score}</div>
            <div className="text-xs">Score</div>
          </div>
        )}
      </div>
      {assignment.feedback && (
        <div className="mt-3 bg-blue-50 border-l-4 border-blue-400 p-3 rounded">
          <p className="text-xs text-gray-700">
            <strong>Feedback:</strong> {assignment.feedback}
          </p>
        </div>
      )}
    </div>
  );
};