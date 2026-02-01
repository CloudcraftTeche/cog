"use client";
import React from "react";
import {
  AlertTriangle,
  TrendingDown,
  FileX,
  Calendar,
  Award,
  CheckCircle,
} from "lucide-react";
import { Student } from "@/types/teacher/teacherDashboard.types";
import { useStrugglingStudents } from "@/hooks/teacher/useTeacherDashboard";

const LoadingSkeleton: React.FC = () => (
  <div className="bg-white rounded-2xl shadow-lg p-6 animate-pulse">
    <div className="h-8 w-48 bg-gray-200 rounded mb-4"></div>
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-32 bg-gray-100 rounded-xl" />
      ))}
    </div>
  </div>
);

const ErrorDisplay: React.FC<{ message: string }> = ({ message }) => (
  <div className="bg-white rounded-2xl shadow-lg p-6">
    <div className="flex items-center gap-3 text-red-600">
      <AlertTriangle className="w-6 h-6" />
      <span className="font-semibold">Error loading struggling students</span>
    </div>
    <p className="text-gray-600 mt-2">{message}</p>
  </div>
);

const EmptyState: React.FC = () => (
  <div className="text-center py-8">
    <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
      <CheckCircle className="w-8 h-8 text-green-600" />
    </div>
    <p className="text-gray-600 font-medium">No struggling students</p>
    <p className="text-sm text-gray-500 mt-1">All students are doing well!</p>
  </div>
);

const getIssueIcon = (issue: string) => {
  if (issue.includes("Attendance")) return <Calendar className="w-4 h-4" />;
  if (issue.includes("Score")) return <Award className="w-4 h-4" />;
  if (issue.includes("Submission")) return <FileX className="w-4 h-4" />;
  return <AlertTriangle className="w-4 h-4" />;
};

const getIssueColor = (issue: string): string => {
  if (issue.includes("Attendance")) return "bg-orange-100 text-orange-700 border-orange-200";
  if (issue.includes("Score")) return "bg-red-100 text-red-700 border-red-200";
  if (issue.includes("Submission")) return "bg-yellow-100 text-yellow-700 border-yellow-200";
  return "bg-gray-100 text-gray-700 border-gray-200";
};

interface StudentCardProps {
  student: Student;
}

const StudentCard: React.FC<StudentCardProps> = ({ student }) => {
  const initials = student.name.charAt(0);

  return (
    <div className="bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 rounded-xl p-4 hover:shadow-lg transition-all duration-300 hover:border-orange-300">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          {student.profilePictureUrl ? (
            <img
              src={student.profilePictureUrl}
              alt={student.name}
              className="w-14 h-14 rounded-full object-cover border-2 border-orange-200"
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-bold text-xl">
              {initials}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h4 className="font-bold text-gray-800 text-lg">{student.name}</h4>
              <p className="text-sm text-gray-600">{student.rollNumber}</p>
            </div>
            <TrendingDown className="w-5 h-5 text-red-500" />
          </div>

          <div className="grid grid-cols-3 gap-3 mb-3">
            <div className="bg-orange-50 rounded-lg p-2 text-center border border-orange-100">
              <Calendar className="w-3 h-3 text-orange-600 mx-auto mb-1" />
              <div className="text-lg font-bold text-orange-600">{student.attendanceRate ?? 0}%</div>
              <div className="text-xs text-gray-600">Attendance</div>
            </div>
            <div className="bg-red-50 rounded-lg p-2 text-center border border-red-100">
              <Award className="w-3 h-3 text-red-600 mx-auto mb-1" />
              <div className="text-lg font-bold text-red-600">{student.avgScore ?? 0}%</div>
              <div className="text-xs text-gray-600">Avg Score</div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-2 text-center border border-yellow-100">
              <FileX className="w-3 h-3 text-yellow-600 mx-auto mb-1" />
              <div className="text-lg font-bold text-yellow-600">{student.missingSubmissions ?? 0}</div>
              <div className="text-xs text-gray-600">Missing</div>
            </div>
          </div>

          {student.issues && student.issues.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {student.issues.map((issue, idx) => (
                <div
                  key={idx}
                  className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getIssueColor(issue)}`}
                >
                  {getIssueIcon(issue)}
                  <span>{issue}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between">
        <p className="text-xs text-gray-600">{student.email}</p>
      </div>
    </div>
  );
};

export const StrugglingStudents: React.FC = () => {
  const { data: students = [], isLoading, error } = useStrugglingStudents();

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return <ErrorDisplay message={error.message || "Failed to load struggling students"} />;
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-gradient-to-br from-orange-500 to-red-600 p-3 rounded-xl text-white">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-800">Struggling Students</h3>
          <p className="text-sm text-gray-600">Students who need attention</p>
        </div>
      </div>

      {students.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {students.map((student) => (
              <StudentCard key={student.studentId} student={student} />
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                <span className="font-bold text-orange-600">{students.length}</span>{" "}
                student{students.length !== 1 ? "s" : ""} need{students.length === 1 ? "s" : ""} attention
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};