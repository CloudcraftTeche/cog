import * as XLSX from "xlsx";
import { IAssignment } from "@/types/admin/assignment.types";

export const generateAssignmentsReport = (
  assignments: IAssignment[],
  gradeLabel?: string
) => {
  const wb = XLSX.utils.book_new();

  const overviewRows = assignments.map((a) => ({
    "Assignment ID": a._id,
    Title: a.title,
    Description: a.description,
    Grade: a.gradeName || a.gradeId?.grade || "",
    "Content Type": a.contentType,
    Status: a.status,
    "Total Marks": a.totalMarks ?? "",
    "Passing Marks": a.passingMarks ?? "",
    "Total Questions": a.questions?.length ?? 0,
    "Submitted Students": a.submittedStudents?.length ?? 0,
    "Start Date": a.startDate ? new Date(a.startDate).toLocaleDateString() : "",
    "End Date": a.endDate ? new Date(a.endDate).toLocaleDateString() : "",
    "Created At": a.createdAt ? new Date(a.createdAt).toLocaleDateString() : "",
  }));

  const overviewSheet = XLSX.utils.json_to_sheet(overviewRows);

  overviewSheet["!cols"] = [
    { wch: 26 },
    { wch: 32 },
    { wch: 40 },
    { wch: 16 },
    { wch: 14 },
    { wch: 12 },
    { wch: 14 },
    { wch: 14 },
    { wch: 18 },
    { wch: 20 },
    { wch: 14 },
    { wch: 14 },
    { wch: 14 },
  ];

  XLSX.utils.book_append_sheet(wb, overviewSheet, "Assignments Overview");

  const questionRows: Record<string, string | number>[] = [];
  assignments.forEach((a) => {
    (a.questions || []).forEach((q, idx) => {
      questionRows.push({
        "Assignment Title": a.title,
        Grade: a.gradeName || a.gradeId?.grade || "",
        "Q#": idx + 1,
        "Question Text": q.questionText,
        "Option A": q.options?.[0] ?? "",
        "Option B": q.options?.[1] ?? "",
        "Option C": q.options?.[2] ?? "",
        "Option D": q.options?.[3] ?? "",
        "Correct Answer": q.correctAnswer,
      });
    });
  });

  if (questionRows.length > 0) {
    const questionsSheet = XLSX.utils.json_to_sheet(questionRows);
    questionsSheet["!cols"] = [
      { wch: 32 },
      { wch: 16 },
      { wch: 5  },
      { wch: 48 },
      { wch: 22 },
      { wch: 22 },
      { wch: 22 },
      { wch: 22 },
      { wch: 20 },
    ];
    XLSX.utils.book_append_sheet(wb, questionsSheet, "Questions");
  }

  const total = assignments.length;
  const now = new Date();
  const active = assignments.filter((a) => {
    const s = new Date(a.startDate), e = new Date(a.endDate);
    return now >= s && now <= e;
  }).length;
  const ended = assignments.filter((a) => new Date(a.endDate) < now).length;
  const scheduled = assignments.filter((a) => new Date(a.startDate) > now).length;
  const totalSubmissions = assignments.reduce(
    (sum, a) => sum + (a.submittedStudents?.length ?? 0), 0
  );

  const summaryData = [
    ["Report Generated", new Date().toLocaleString()],
    ["Grade Filter", gradeLabel || "All Grades"],
    ["", ""],
    ["Metric", "Value"],
    ["Total Assignments", total],
    ["Active Assignments", active],
    ["Ended Assignments", ended],
    ["Scheduled Assignments", scheduled],
    ["Total Submissions", totalSubmissions],
    ["Avg Submissions / Assignment", total > 0 ? (totalSubmissions / total).toFixed(1) : 0],
    ["", ""],
    ["By Content Type", ""],
    ["Video", assignments.filter((a) => a.contentType === "video").length],
    ["PDF", assignments.filter((a) => a.contentType === "pdf").length],
    ["Text", assignments.filter((a) => a.contentType === "text").length],
  ];

  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  summarySheet["!cols"] = [{ wch: 32 }, { wch: 20 }];
  XLSX.utils.book_append_sheet(wb, summarySheet, "Summary");

  const timestamp = new Date().toISOString().slice(0, 10);
  const filename = `assignments-report-${timestamp}.xlsx`;
  XLSX.writeFile(wb, filename);
};