import { useState } from "react";
import { Download, UserCheck, UserX, Clock } from "lucide-react";
import api from "@/lib/api";
import { format } from "date-fns";

export const ExportSection = () => {
  const [exporting, setExporting] = useState(false);

  const convertToCSV = (data: any) => {
    if (!data || data.length === 0) {
      return "No data available\n";
    }

    const header = '"Student Name","Email","Class","Teacher","Date","Status"\n';

    const rows = data
      .map((item: any) => {
        let formattedDate = "N/A";
        if (item.date) {
          try {
            const dateObj = new Date(item.date);
            const year = dateObj.getFullYear();
            const month = String(dateObj.getMonth() + 1).padStart(2, "0");
            const day = String(dateObj.getDate()).padStart(2, "0");
            formattedDate = `${year}-${month}-${day}`;
          } catch (e) {
            formattedDate = "N/A";
          }
        }

        const studentName = item.studentId?.name || "N/A";
        const email = item.studentId?.email || "N/A";
        const studentClass = item.studentId?.class || "N/A";
        const teacherName = item.teacherId?.name || "N/A";
        const status = item.status || "N/A";

        const escapeQuotes = (str: string) => str.replace(/"/g, '""');

        return `"${escapeQuotes(studentName)}","${escapeQuotes(email)}","${escapeQuotes(studentClass)}","${escapeQuotes(teacherName)}","${formattedDate}","${escapeQuotes(status)}"`;
      })
      .join("\n");

    return header + rows;
  };

  const downloadCSV = (csvData: string, filename: string) => {
    const BOM = "\uFEFF";
    const blob = new Blob([BOM + csvData], {
      type: "text/csv;charset=utf-8;",
    });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const exportData = async (status = "all") => {
    try {
      setExporting(true);
      const response = await api.get(`/export/attendance?status=${status}`);

      const csvData = convertToCSV(response.data);
      downloadCSV(
        csvData,
        `attendance-${status}-${format(new Date(), "yyyy-MM-dd")}.csv`
      );
    } catch (error) {
      console.error("Error exporting data:", error);
    } finally {
      setExporting(false);
    }
  };

  const exportButtons = [
    {
      label: "Export All",
      status: "all",
      icon: Download,
      gradient: "from-purple-500 via-indigo-600 to-blue-600",
      hoverShadow: "hover:shadow-purple-500/25",
    },
    {
      label: "Export Present",
      status: "present",
      icon: UserCheck,
      gradient: "from-emerald-500 via-green-600 to-teal-600",
      hoverShadow: "hover:shadow-emerald-500/25",
    },
    {
      label: "Export Absent",
      status: "absent",
      icon: UserX,
      gradient: "from-red-500 via-pink-600 to-rose-600",
      hoverShadow: "hover:shadow-red-500/25",
    },
    {
      label: "Export Late",
      status: "late",
      icon: Clock,
      gradient: "from-amber-500 via-orange-600 to-red-600",
      hoverShadow: "hover:shadow-amber-500/25",
    },
  ];

  return (
    <div className="relative group mb-10">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-200/50 to-purple-200/50 rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-300"></div>
      <div className="relative bg-white/95 backdrop-blur-xl p-10 rounded-3xl shadow-2xl border border-indigo-100/50">
        <div className="flex items-center space-x-4 mb-8">
          <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-3xl flex items-center justify-center shadow-lg">
            <Download className="h-7 w-7 text-white" />
          </div>
          <div>
            <h3 className="text-3xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Export Attendance Data
            </h3>
            <p className="text-gray-500 font-medium">
              Download comprehensive reports in CSV format
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {exportButtons.map((button, index) => (
            <button
              key={index}
              onClick={() => exportData(button.status)}
              disabled={exporting}
              className={`group relative overflow-hidden bg-gradient-to-br ${button.gradient} text-white px-8 py-6 rounded-2xl ${button.hoverShadow} hover:shadow-2xl transition-all duration-500 hover:scale-105 flex items-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <button.icon
                className={`h-6 w-6 relative z-10 ${
                  exporting ? "animate-bounce" : ""
                }`}
              />
              <span className="font-bold text-lg relative z-10">
                {button.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};