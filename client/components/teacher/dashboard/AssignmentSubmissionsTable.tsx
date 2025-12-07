import React from 'react';
import { FileText, CheckCircle, Clock, AlertCircle, TrendingUp } from 'lucide-react';

interface AssignmentSubmission {
  title: string;
  status: string;
  totalStudents: number;
  submitted: number;
  graded: number;
  pending: number;
  pendingGrading: number;
}

interface AssignmentSubmissionsTableProps {
  data: AssignmentSubmission[];
}

export const AssignmentSubmissionsTable: React.FC<AssignmentSubmissionsTableProps> = ({ data }) => {
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { 
        gradient: 'from-green-500 to-emerald-500', 
        text: 'text-white', 
        label: 'Active',
        shadow: 'shadow-green-200'
      },
      completed: { 
        gradient: 'from-blue-500 to-cyan-500', 
        text: 'text-white', 
        label: 'Completed',
        shadow: 'shadow-blue-200'
      },
      draft: { 
        gradient: 'from-gray-500 to-slate-500', 
        text: 'text-white', 
        label: 'Draft',
        shadow: 'shadow-gray-200'
      },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    
    return (
      <span className={`px-4 py-2 rounded-full text-xs font-black bg-gradient-to-r ${config.gradient} ${config.text} shadow-lg ${config.shadow}`}>
        {config.label}
      </span>
    );
  };

  const getProgressPercentage = (submitted: number, total: number) => {
    return total > 0 ? Math.round((submitted / total) * 100) : 0;
  };

  return (
    <div className="bg-gradient-to-br from-white to-pink-50 rounded-2xl shadow-xl border border-pink-100 p-6 hover:shadow-2xl transition-shadow duration-300">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <div className="p-2 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl shadow-lg">
              <FileText className="w-6 h-6 text-white" />
            </div>
            Assignment Submissions
          </h2>
          <p className="text-sm text-gray-600 mt-2 ml-12">Track submission and grading progress</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y-2 divide-gray-200">
          <thead className="bg-gradient-to-r from-gray-50 to-slate-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-black text-gray-700 uppercase tracking-wider">
                Assignment
              </th>
              <th className="px-6 py-4 text-left text-xs font-black text-gray-700 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-center text-xs font-black text-gray-700 uppercase tracking-wider">
                Submitted
              </th>
              <th className="px-6 py-4 text-center text-xs font-black text-gray-700 uppercase tracking-wider">
                Graded
              </th>
              <th className="px-6 py-4 text-center text-xs font-black text-gray-700 uppercase tracking-wider">
                Pending
              </th>
              <th className="px-6 py-4 text-left text-xs font-black text-gray-700 uppercase tracking-wider">
                Progress
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y-2 divide-gray-100">
            {data.map((assignment, index) => {
              const submissionProgress = getProgressPercentage(assignment.submitted, assignment.totalStudents);
              const gradingProgress = assignment.submitted > 0 
                ? getProgressPercentage(assignment.graded, assignment.submitted) 
                : 0;

              return (
                <tr key={index} className="hover:bg-gradient-to-r hover:from-pink-50 hover:to-rose-50 transition-all duration-200">
                  <td className="px-6 py-5">
                    <div className="flex items-center">
                      <div className="text-sm font-bold text-gray-900">{assignment.title}</div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    {getStatusBadge(assignment.status)}
                  </td>
                  <td className="px-6 py-5 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="p-1.5 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg">
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-sm font-black text-gray-900">
                        {assignment.submitted}/{assignment.totalStudents}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="p-1.5 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-sm font-black text-gray-900">
                        {assignment.graded}/{assignment.submitted}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg">
                          <Clock className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-sm font-bold text-gray-900">{assignment.pending}</span>
                      </div>
                      {assignment.pendingGrading > 0 && (
                        <div className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-pink-500 px-3 py-1 rounded-full shadow-lg">
                          <AlertCircle className="w-3 h-3 text-white" />
                          <span className="text-xs font-black text-white">{assignment.pendingGrading} to grade</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-gray-700">Submission</span>
                          <span className="text-xs font-black text-green-600">{submissionProgress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
                          <div 
                            className="bg-gradient-to-r from-green-400 to-emerald-500 h-3 rounded-full transition-all duration-500 shadow-lg"
                            style={{ width: `${submissionProgress}%` }}
                          />
                        </div>
                      </div>
                      {assignment.submitted > 0 && (
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-gray-700">Grading</span>
                            <span className="text-xs font-black text-blue-600">{gradingProgress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
                            <div 
                              className="bg-gradient-to-r from-blue-400 to-cyan-500 h-3 rounded-full transition-all duration-500 shadow-lg"
                              style={{ width: `${gradingProgress}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {data.length === 0 && (
        <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-slate-50 rounded-2xl border-2 border-dashed border-gray-300">
          <div className="w-20 h-20 bg-gradient-to-br from-gray-400 to-slate-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <FileText className="w-10 h-10 text-white" />
          </div>
          <p className="text-gray-600 font-semibold text-lg">No assignments found</p>
          <p className="text-gray-500 text-sm mt-2">Create your first assignment</p>
        </div>
      )}
    </div>
  );
};