import React, { useEffect, useState } from "react";
import { Users, BookOpen, GraduationCap, CheckCircle } from "lucide-react";
import api from "@/lib/api";
interface Teacher {
  name: string;
  email: string;
}
interface CoverageData {
  gradeId: string;
  grade: string;
  totalChapters: number;
  totalStudents: number;
  coveragePercentage: number;
  teachers: Teacher[];
  completedChapters: number;
}
export const SyllabusCoverage: React.FC = () => {
  const [coverageData, setCoverageData] = useState<CoverageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    fetchData();
  }, []);
  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await api.get("/dashboard/admin");
      setCoverageData(response.data.data.charts?.syllabusCoverage || []);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };
  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return "from-green-500 to-emerald-600";
    if (percentage >= 60) return "from-blue-500 to-cyan-600";
    if (percentage >= 40) return "from-yellow-500 to-orange-600";
    return "from-red-500 to-pink-600";
  };
  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 animate-pulse">
        <div className="h-8 w-48 bg-gray-200 rounded mb-4"></div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-gray-100 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center gap-3 text-red-600">
          <BookOpen className="w-6 h-6" />
          <span className="font-semibold">Error loading syllabus coverage</span>
        </div>
        <p className="text-gray-600 mt-2">{error}</p>
      </div>
    );
  }
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 my-3">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-3 rounded-xl text-white">
          <BookOpen className="w-6 h-6" />
        </div>
        <h3 className="text-xl font-bold text-gray-800">Syllabus Coverage</h3>
      </div>
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {coverageData.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No coverage data available</p>
          </div>
        ) : (
          coverageData.map((grade) => (
            <div
              key={grade.gradeId}
              className={`bg-gradient-to-br ${getProgressColor(grade.coveragePercentage)} rounded-xl p-5 text-white`}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="text-lg font-bold mb-1">
                    Grade {grade.grade}
                  </h4>
                  <div className="flex items-center gap-4 text-sm text-white/90">
                    <div className="flex items-center gap-1">
                      <GraduationCap className="w-4 h-4" />
                      <span>{grade.totalStudents} students</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      <span>
                        {grade.completedChapters}/{grade.totalChapters} chapters
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold">
                    {grade.coveragePercentage}%
                  </div>
                  <div className="text-xs text-white/80">Coverage</div>
                </div>
              </div>
              <div className="mb-4">
                <div className="flex justify-between text-xs text-white/80 mb-1">
                  <span>Progress</span>
                  <span>
                    {grade.completedChapters} / {grade.totalChapters}
                  </span>
                </div>
                <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white rounded-full transition-all duration-1000"
                    style={{ width: `${grade.coveragePercentage}%` }}
                  ></div>
                </div>
              </div>
              {grade.teachers.length > 0 && (
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4" />
                    <span className="text-sm font-semibold">
                      Teachers ({grade.teachers.length})
                    </span>
                  </div>
                  <div className="space-y-1">
                    {grade.teachers.map((teacher, idx) => (
                      <div
                        key={idx}
                        className="text-sm text-white/90 flex items-center gap-2"
                      >
                        <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-xs font-bold">
                          {teacher.name.charAt(0)}
                        </div>
                        <span>{teacher.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
