"use client";
import { useState, useEffect } from "react";
import {
  Download,
  FileSpreadsheet,
  Loader2,
  GraduationCap,
  Users,
  BookOpen,
  CheckCircle,
  AlertCircle,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import * as XLSX from "xlsx";
import api from "@/lib/api";
import { toast } from "sonner";
interface Teacher {
  _id: string;
  name: string;
  email: string;
}
interface StudentProgress {
  studentId: string;
  status: "locked" | "accessible" | "in_progress" | "completed";
  startedAt?: Date;
  completedAt?: Date;
  score?: number;
}
interface Chapter {
  _id: string;
  title: string;
  chapterNumber: number;
  studentProgress?: StudentProgress[];
}
interface GradeData {
  _id: string;
  grade: string;
  description?: string;
  academicYear?: string;
  isActive: boolean;
  students?: string[];
  teachers?: (Teacher | string)[];
  createdAt: string;
  updatedAt: string;
  totalChapters: number;
  completedChapters: number;
  completionPercentage: number;
}
interface ExcelExportData {
  Grade: string;
  "Academic Year": string;
  "Teacher(s)": string;
  "Total Students": number;
  "Total Chapters": number;
  "Completed Chapters": number;
  "Pending Chapters": number;
  "Completion %": string;
  Status: string;
}
interface CompletionStatus {
  text: string;
  color: string;
}
export default function GradeCompletionReport() {
  const [grades, setGrades] = useState<GradeData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [exporting, setExporting] = useState<boolean>(false);
  useEffect(() => {
    fetchGradesWithCompletionData();
  }, []);
  const fetchGradesWithCompletionData = async (): Promise<void> => {
    setLoading(true);
    try {
      const gradesResponse = await api.get("/grades", {
        params: { limit: 1000 },
      });
      const gradesData: GradeData[] = gradesResponse.data.data;
      const gradesWithCompletion: GradeData[] = await Promise.all(
        gradesData.map(async (grade): Promise<GradeData> => {
          try {
            const chaptersCountResponse = await api.get(
              `/chapters/${grade._id}/chapters/count`
            );
            const totalChapters: number =
              chaptersCountResponse.data.totalChapters || 0;
            const chaptersResponse = await api.get(
              `/chapters/${grade._id}/chapters`,
              {
                params: { limit: 100 },
              }
            );
            const chapters: Chapter[] = chaptersResponse.data.data || [];
            let completedChapters = 0;
            const studentCount: number = grade.students?.length || 0;
            chapters.forEach((chapter: Chapter) => {
              const completedStudents: number =
                chapter.studentProgress?.filter(
                  (p: StudentProgress) => p.status === "completed"
                ).length || 0;
              if (completedStudents > 0) {
                completedChapters++;
              }
            });
            return {
              ...grade,
              totalChapters,
              completedChapters,
              completionPercentage:
                totalChapters > 0
                  ? Math.round((completedChapters / totalChapters) * 100)
                  : 0,
            };
          } catch (error) {
            console.error(
              `Error fetching data for grade ${grade.grade}:`,
              error
            );
            return {
              ...grade,
              totalChapters: 0,
              completedChapters: 0,
              completionPercentage: 0,
            };
          }
        })
      );
      setGrades(gradesWithCompletion);
    } catch (error) {
      console.error("Error fetching grades:", error);
      toast.error("Failed to fetch grades data");
    } finally {
      setLoading(false);
    }
  };
  const exportToExcel = async (
    singleGrade: GradeData | null = null
  ): Promise<void> => {
    setExporting(true);
    try {
      const gradesToExport: GradeData[] = singleGrade
        ? [singleGrade]
        : filteredGrades;
      if (gradesToExport.length === 0) {
        toast.error("No data to export");
        return;
      }
      const excelData: ExcelExportData[] = [];
      for (const grade of gradesToExport) {
        let teacherNames: string = "N/A";
        if (grade.teachers && grade.teachers.length > 0) {
          if (
            typeof grade.teachers[0] === "object" &&
            grade.teachers[0] !== null &&
            "name" in grade.teachers[0]
          ) {
            teacherNames = (grade.teachers as Teacher[])
              .map((t: Teacher) => t.name)
              .join(", ");
          } else {
            teacherNames = `${grade.teachers.length} teacher(s)`;
          }
        }
        excelData.push({
          Grade: grade.grade,
          "Academic Year": grade.academicYear || "N/A",
          "Teacher(s)": teacherNames,
          "Total Students": grade.students?.length || 0,
          "Total Chapters": grade.totalChapters,
          "Completed Chapters": grade.completedChapters,
          "Pending Chapters": grade.totalChapters - grade.completedChapters,
          "Completion %": `${grade.completionPercentage}%`,
          Status: grade.isActive ? "Active" : "Inactive",
        });
      }
      const ws = XLSX.utils.json_to_sheet(excelData);
      ws["!cols"] = [
        { wch: 10 },
        { wch: 15 },
        { wch: 30 },
        { wch: 15 },
        { wch: 15 },
        { wch: 18 },
        { wch: 16 },
        { wch: 13 },
        { wch: 10 },
      ];
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Grade Completion Report");
      const fileName: string = singleGrade
        ? `Grade_${singleGrade.grade}_Completion_Report_${new Date().toISOString().split("T")[0]}.xlsx`
        : `All_Grades_Completion_Report_${new Date().toISOString().split("T")[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);
      toast.success(`Report exported successfully: ${fileName}`);
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      toast.error("Failed to export report");
    } finally {
      setExporting(false);
    }
  };
  const filteredGrades: GradeData[] = grades.filter(
    (grade: GradeData) =>
      grade.grade.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (grade.academicYear &&
        grade.academicYear.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  const getCompletionColor = (percentage: number): string => {
    if (percentage >= 80) return "from-green-500 to-emerald-500";
    if (percentage >= 50) return "from-yellow-500 to-orange-500";
    return "from-red-500 to-pink-500";
  };
  const getCompletionStatus = (percentage: number): CompletionStatus => {
    if (percentage >= 80) return { text: "Excellent", color: "text-green-600" };
    if (percentage >= 50) return { text: "Good", color: "text-yellow-600" };
    return { text: "Needs Attention", color: "text-red-600" };
  };
  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      
      <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white py-8 mb-8 rounded-3xl shadow-2xl">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center mb-4">
            <FileSpreadsheet className="h-12 w-12 mr-4" />
            <h1 className="text-5xl font-bold">Grade Completion Report</h1>
          </div>
          <p className="text-indigo-100 text-lg">
            Track chapter completion progress across all grades
          </p>
        </div>
      </div>
      <div className="container mx-auto px-4 md:px-6 pb-8">
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
          <div className="relative w-full md:max-w-md">
            <Input
              type="text"
              placeholder="Search by grade or academic year..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-4 py-3 h-12 border-2 border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 rounded-xl"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          </div>
          <Button
            onClick={() => exportToExcel()}
            disabled={exporting || loading || filteredGrades.length === 0}
            className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 h-12 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
          >
            {exporting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="mr-2 h-5 w-5" />
                Export All to Excel
              </>
            )}
          </Button>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-12 w-12 animate-spin text-indigo-500" />
          </div>
        ) : filteredGrades.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
            <GraduationCap className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 text-xl">No grades found</p>
            <p className="text-slate-400 text-sm mt-2">
              {searchQuery
                ? "Try adjusting your search criteria"
                : "Create grades to see completion reports"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredGrades.map((grade: GradeData, index: number) => {
              const status: CompletionStatus = getCompletionStatus(
                grade.completionPercentage
              );
              const gradient: string = [
                "from-indigo-500 to-purple-500",
                "from-purple-500 to-pink-500",
                "from-blue-500 to-cyan-500",
                "from-teal-500 to-emerald-500",
              ][index % 4];
              return (
                <div
                  key={grade._id}
                  className="bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden"
                >
                  <div className={`h-2 bg-gradient-to-r ${gradient}`} />
                  <div className="p-6">
                    
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <div
                          className={`w-14 h-14 bg-gradient-to-r ${gradient} rounded-2xl flex items-center justify-center mr-4 shadow-lg`}
                        >
                          <GraduationCap className="h-7 w-7 text-white" />
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-slate-800">
                            Grade {grade.grade}
                          </h2>
                          {grade.academicYear && (
                            <p className="text-sm text-slate-500">
                              {grade.academicYear}
                            </p>
                          )}
                        </div>
                      </div>
                      <Button
                        onClick={() => exportToExcel(grade)}
                        disabled={exporting}
                        size="sm"
                        variant="outline"
                        className="border-2 border-green-200 text-green-600 hover:bg-green-50"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Export
                      </Button>
                    </div>
                    
                    <div className="mb-4 p-3 bg-slate-50 rounded-xl">
                      <p className="text-sm font-medium text-slate-600 mb-1">
                        Teachers:
                      </p>
                      <p className="text-slate-800">
                        {grade.teachers && grade.teachers.length > 0
                          ? typeof grade.teachers[0] === "object" &&
                            grade.teachers[0] !== null &&
                            "name" in grade.teachers[0]
                            ? (grade.teachers as Teacher[])
                                .map((t: Teacher) => t.name)
                                .join(", ")
                            : `${grade.teachers.length} assigned`
                          : "No teachers assigned"}
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="p-4 bg-blue-50 rounded-xl">
                        <div className="flex items-center mb-2">
                          <Users className="h-5 w-5 text-blue-600 mr-2" />
                          <p className="text-sm font-medium text-blue-900">
                            Students
                          </p>
                        </div>
                        <p className="text-2xl font-bold text-blue-600">
                          {grade.students?.length || 0}
                        </p>
                      </div>
                      <div className="p-4 bg-purple-50 rounded-xl">
                        <div className="flex items-center mb-2">
                          <BookOpen className="h-5 w-5 text-purple-600 mr-2" />
                          <p className="text-sm font-medium text-purple-900">
                            Total Chapters
                          </p>
                        </div>
                        <p className="text-2xl font-bold text-purple-600">
                          {grade.totalChapters}
                        </p>
                      </div>
                      <div className="p-4 bg-green-50 rounded-xl">
                        <div className="flex items-center mb-2">
                          <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                          <p className="text-sm font-medium text-green-900">
                            Completed
                          </p>
                        </div>
                        <p className="text-2xl font-bold text-green-600">
                          {grade.completedChapters}
                        </p>
                      </div>
                      <div className="p-4 bg-orange-50 rounded-xl">
                        <div className="flex items-center mb-2">
                          <AlertCircle className="h-5 w-5 text-orange-600 mr-2" />
                          <p className="text-sm font-medium text-orange-900">
                            Pending
                          </p>
                        </div>
                        <p className="text-2xl font-bold text-orange-600">
                          {grade.totalChapters - grade.completedChapters}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-slate-700">
                          Completion Progress
                        </span>
                        <span className={`text-sm font-bold ${status.color}`}>
                          {grade.completionPercentage}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${getCompletionColor(grade.completionPercentage)} transition-all duration-500 rounded-full`}
                          style={{ width: `${grade.completionPercentage}%` }}
                        />
                      </div>
                      <p className={`text-xs ${status.color} mt-1 font-medium`}>
                        {status.text}
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          grade.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {grade.isActive ? "Active" : "Inactive"}
                      </span>
                      <span className="text-xs text-slate-500">
                        Updated:{" "}
                        {new Date(grade.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
