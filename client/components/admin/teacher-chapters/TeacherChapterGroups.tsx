// components/admin/teacher-chapters/TeacherChapterGroups.tsx

import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, GraduationCap, BookOpen } from "lucide-react";
import { Grade, TeacherChapter } from "@/types/admin/teacher-chapter.types";
import TeacherChapterCard from "./TeacherChapterCard";
import { TeacherChapterEmptyState } from "./TeacherChapterListHeader";

interface TeacherChapterGroupsProps {
  grades: Grade[];
  chapters: TeacherChapter[];
  searchTerm: string;
  expandedGrades: Set<string>;
  expandedUnits: Set<string>;
  onToggleGrade: (gradeId: string) => void;
  onToggleUnit: (unitKey: string) => void;
  onEdit: (chapterId: string) => void;
  onDelete: (chapterId: string) => void;
  onViewStatistics: (chapterId: string) => void;
  onCreateClick: () => void;
}

const gradeColors = [
  "from-violet-500 via-purple-500 to-fuchsia-500",
  "from-blue-500 via-cyan-500 to-teal-500",
  "from-emerald-500 via-green-500 to-lime-500",
  "from-amber-500 via-orange-500 to-red-500",
  "from-pink-500 via-rose-500 to-red-500",
  "from-indigo-500 via-blue-500 to-cyan-500",
];

const unitColors = [
  "from-purple-400 to-pink-400",
  "from-blue-400 to-cyan-400",
  "from-green-400 to-emerald-400",
  "from-orange-400 to-red-400",
  "from-rose-400 to-pink-400",
  "from-indigo-400 to-purple-400",
];

export function TeacherChapterGroups({
  grades,
  chapters,
  searchTerm,
  expandedGrades,
  expandedUnits,
  onToggleGrade,
  onToggleUnit,
  onEdit,
  onDelete,
  onViewStatistics,
  onCreateClick,
}: TeacherChapterGroupsProps) {
  const filteredChapters = searchTerm
    ? chapters.filter(
        (ch) =>
          ch.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ch.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : chapters;

  const groupedData = grades
    .map((grade) => {
      const gradeChapters = filteredChapters.filter(
        (ch) => ch.gradeId._id === grade._id
      );
      
      const unitGroups = (grade.units || []).map((unit) => {
        const unitChapters = gradeChapters
          .filter((ch) => {
            const chapterUnitId = typeof ch.unitId === "string" ? ch.unitId : ch.unitId;
            const unitIdStr = unit._id ? (typeof unit._id === "string" ? unit._id : unit._id) : "";
            return chapterUnitId === unitIdStr;
          })
          .sort((a, b) => a.chapterNumber - b.chapterNumber);
        
        return {
          unit,
          chapters: unitChapters,
        };
      });
      
      return {
        grade,
        unitGroups: unitGroups.filter((ug) => ug.chapters.length > 0),
        totalChapters: gradeChapters.length,
      };
    })
    .filter((g) => g.totalChapters > 0);

  if (groupedData.length === 0) {
    return <TeacherChapterEmptyState searchTerm={searchTerm} onCreateClick={onCreateClick} />;
  }

  return (
    <div className="space-y-6">
      {groupedData.map((gradeData, gradeIndex) => {
        const isGradeExpanded = expandedGrades.has(gradeData.grade._id);
        const colorClass = gradeColors[gradeIndex % gradeColors.length];
        
        return (
          <div key={gradeData.grade._id} className="group">
            <button
              onClick={() => onToggleGrade(gradeData.grade._id)}
              className="w-full bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 mb-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${colorClass} flex items-center justify-center shadow-lg`}>
                    <GraduationCap className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-left flex-1">
                    <h2 className={`text-3xl font-bold bg-gradient-to-r ${colorClass} bg-clip-text text-transparent mb-1`}>
                      Grade {gradeData.grade.grade}
                    </h2>
                    <p className="text-gray-600 text-sm">
                      {gradeData.totalChapters} chapter{gradeData.totalChapters !== 1 ? "s" : ""} across{" "}
                      {gradeData.unitGroups.length} unit{gradeData.unitGroups.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={`bg-gradient-to-r ${colorClass} text-white border-0 px-4 py-1`}>
                    {gradeData.totalChapters} Total
                  </Badge>
                  {isGradeExpanded ? (
                    <ChevronUp className="h-6 w-6 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-6 w-6 text-gray-400" />
                  )}
                </div>
              </div>
            </button>
            
            {isGradeExpanded && (
              <div className="ml-4 space-y-4 mb-6 animate-in fade-in slide-in-from-top-4 duration-300">
                {gradeData.unitGroups.map((unitGroup, unitIndex) => {
                  const unitKey = `${gradeData.grade._id}-${unitGroup.unit._id}`;
                  const isUnitExpanded = expandedUnits.has(unitKey);
                  const unitColor = unitColors[unitIndex % unitColors.length];
                  
                  return (
                    <div key={unitKey} className="ml-4">
                      <button
                        onClick={() => onToggleUnit(unitKey)}
                        className="w-full bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-5 mb-3"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 flex-1">
                            <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${unitColor} flex items-center justify-center shadow-md`}>
                              <BookOpen className="h-6 w-6 text-white" />
                            </div>
                            <div className="text-left flex-1">
                              <h3 className={`text-xl font-bold bg-gradient-to-r ${unitColor} bg-clip-text text-transparent`}>
                                {unitGroup.unit.name}
                              </h3>
                              <p className="text-gray-600 text-xs">
                                {unitGroup.chapters.length} chapter{unitGroup.chapters.length !== 1 ? "s" : ""}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge className={`bg-gradient-to-r ${unitColor} text-white border-0 px-3 py-1 text-xs`}>
                              {unitGroup.chapters.length}
                            </Badge>
                            {isUnitExpanded ? (
                              <ChevronUp className="h-5 w-5 text-gray-400" />
                            ) : (
                              <ChevronDown className="h-5 w-5 text-gray-400" />
                            )}
                          </div>
                        </div>
                      </button>
                      
                      {isUnitExpanded && (
                        <div className="ml-4 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-4 animate-in fade-in slide-in-from-top-4 duration-300">
                          {unitGroup.chapters.map((chapter, chapterIndex) => (
                            <TeacherChapterCard
                              key={chapter._id}
                              chapter={chapter}
                              index={chapterIndex}
                              unitName={unitGroup.unit.name}
                              onViewStatistics={onViewStatistics}
                              onEdit={onEdit}
                              onDelete={onDelete}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}