import { GraduationCap, ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { GroupedChapterData } from "@/utils/teacherChapter.service";
interface GradeHeaderProps {
  gradeData: GroupedChapterData;
  isExpanded: boolean;
  colorClass: string;
  onToggle: () => void;
}
export default function GradeHeader({
  gradeData,
  isExpanded,
  colorClass,
  onToggle,
}: GradeHeaderProps) {
  return (
    <button
      onClick={onToggle}
      className="w-full bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-4 sm:p-6 mb-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
          <div
            className={`w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br ${colorClass} flex items-center justify-center shadow-lg flex-shrink-0`}
          >
            <GraduationCap className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
          </div>
          <div className="text-left flex-1 min-w-0">
            <h2
              className={`text-xl sm:text-3xl font-bold bg-gradient-to-r ${colorClass} bg-clip-text text-transparent mb-1 truncate`}
            >
              Grade {gradeData.grade.grade}
            </h2>
            <p className="text-gray-600 text-xs sm:text-sm">
              {gradeData.totalChapters} chapter{gradeData.totalChapters !== 1 ? "s" : ""} across{" "}
              {gradeData.unitGroups.length} unit{gradeData.unitGroups.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <Badge className={`bg-gradient-to-r ${colorClass} text-white border-0 px-2 sm:px-4 py-1 text-xs sm:text-sm`}>
            {gradeData.totalChapters}
          </Badge>
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400" />
          ) : (
            <ChevronDown className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400" />
          )}
        </div>
      </div>
    </button>
  );
}