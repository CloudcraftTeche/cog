"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";

interface StudentScore {
  studentId: string;
  name: string;
   gradeId: {
    _id: string;
    grade: string;
  };
  email: string;
  rollNumber: string;
  completedAt: string | null;
  score: number;
}

interface NotCompletedStudent {
  studentId: string;
  name: string;
   gradeId: {
    _id: string;
    grade: string;
  };
  email: string;
  rollNumber: string;
}

interface Statistics {
  totalCompletedStudents: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  passRate: number;
}

interface ExportButtonsProps {
  chapterTitle: string;
  questionsCount: number;
  completedStudents: StudentScore[];
  notCompletedStudents: NotCompletedStudent[];
  statistics: Statistics;
}

export default function ExportButtons({
  chapterTitle,
  questionsCount,
  completedStudents,
  notCompletedStudents,
  statistics,
}: ExportButtonsProps) {
  const [exporting, setExporting] = React.useState(false);

  const formatDateForExcel = (dateString: string | null) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(date.getDate()).padStart(2, "0")}`;
  };

  const escapeCSV = (str: string): string =>
    String(str || "").replace(/"/g, '""');

  const exportToExcel = (type: "all" | "completed" | "pending") => {
    setExporting(true);

    try {
      let csvData = "";
      const sanitizedTitle = chapterTitle.replace(/[,"/]/g, "");

      if (type === "all" || type === "completed") {
        csvData += '"Chapter Score Report - Completed Students"\n';
        csvData += `"Chapter:","${escapeCSV(chapterTitle)}"\n`;
        csvData += `"Total Questions:","${questionsCount}"\n`;
        csvData += `"Average Score:","${statistics.averageScore}"\n`;
        csvData += `"Highest Score:","${statistics.highestScore}"\n`;
        csvData += `"Lowest Score:","${statistics.lowestScore}"\n`;
        csvData += `"Pass Rate:","${statistics.passRate}%"\n\n`;

        csvData += `"Rank","Name","Roll Number","Email","Score","Percentage","Completed Date","Status"\n`;

        completedStudents.forEach((student, index) => {
          const percentage =
            questionsCount > 0
              ? ((student.score / questionsCount) * 100).toFixed(2)
              : "0";

          const status = parseFloat(percentage) >= 60 ? "Pass" : "Fail";

          csvData += `"${index + 1}","${escapeCSV(student.name)}","${escapeCSV(student.gradeId?.grade)}","${escapeCSV(
            student.rollNumber
          )}","${escapeCSV(student.email)}","${
            student.score
          }","${percentage}%","${formatDateForExcel(
            student.completedAt
          )}","${status}"\n`;
        });

        if (type === "all") csvData += "\n\n";
      }

      if (type === "all" || type === "pending") {
        csvData += type === "all"
          ? '"Pending Students"\n'
          : '"Chapter Score Report - Pending Students"\n\n';

        csvData += '"Name","Grade","Roll Number","Email","Status"\n';

        notCompletedStudents.forEach((student) => {
          csvData += `"${escapeCSV(student.name)}","${escapeCSV(student.gradeId?.grade)}","${escapeCSV(
            student.rollNumber
          )}","${escapeCSV(student.email)}","Not Started"\n`;
        });
      }

      const BOM = "\uFEFF";
      const blob = new Blob([BOM + csvData], {
        type: "text/csv;charset=utf-8;",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `${sanitizedTitle}-${type}-${new Date()
          .toISOString()
          .split("T")[0]}.csv`
      );

      link.click();
      window.URL.revokeObjectURL(url);

      toast.success(
        `${type.charAt(0).toUpperCase() + type.slice(1)} data exported successfully!`
      );
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export data");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="mb-8">
      <Card className="border-0 shadow-xl rounded-3xl overflow-hidden bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                <FileSpreadsheet className="h-8 w-8 text-white" />
              </div>
              <div className="text-white">
                <h3 className="text-xl font-bold mb-1">Export Chapter Reports</h3>
                <p className="text-indigo-100 text-sm">
                  Download student performance data in Excel format
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => exportToExcel("completed")}
                disabled={exporting || completedStudents.length === 0}
                className="bg-white/20 hover:bg-white/30 text-white border border-white/30 rounded-xl px-6 py-2 font-semibold transition-all duration-300 hover:scale-105 disabled:opacity-50"
              >
                <Download className={`h-4 w-4 mr-2 ${exporting ? "animate-bounce" : ""}`} />
                Export Completed
              </Button>

              <Button
                onClick={() => exportToExcel("pending")}
                disabled={exporting || notCompletedStudents.length === 0}
                className="bg-white/20 hover:bg-white/30 text-white border border-white/30 rounded-xl px-6 py-2 font-semibold transition-all duration-300 hover:scale-105 disabled:opacity-50"
              >
                <Download className={`h-4 w-4 mr-2 ${exporting ? "animate-bounce" : ""}`} />
                Export Pending
              </Button>

              <Button
                onClick={() => exportToExcel("all")}
                disabled={exporting}
                className="bg-white hover:bg-white/90 text-indigo-600 rounded-xl px-6 py-2 font-semibold transition-all duration-300 hover:scale-105"
              >
                <Download className={`h-4 w-4 mr-2 ${exporting ? "animate-bounce" : ""}`} />
                Export All
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
