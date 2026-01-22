// components/admin/chapters/ChaptersList.tsx
"use client";

import { ChevronDown, ChevronUp, GraduationCap, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import ChapterCard from "./ChapterCard";
import { Chapter, Grade, Unit } from "@/types/admin/chapter.types";
import { getGradeColor, getUnitColor } from "@/utils/admin/chapter.utils";

interface UnitGroup {
  unit: Unit;
  chapters: Chapter[];
}

interface GroupedData {
  grade: Grade;
  unitGroups: UnitGroup[];
  totalChapters: number;
}

interface ChaptersListProps {
  groupedData: GroupedData[];
  expandedGrades: Set<string>;
  expandedUnits: Set<string>;
  onToggleGrade: (gradeId: string) => void;
  onToggleUnit: (unitKey: string) => void;
  onViewScores: (chapterId: string) => void;
  onEdit: (chapterId: string) => void;
  onDelete: (chapterId: string) => void;
  onViewSubmissions: (chapterId: string) => void;
}

export default function ChaptersList({
  groupedData,
  expandedGrades,
  expandedUnits,
  onToggleGrade,
  onToggleUnit,
  onViewScores,
  onEdit,
  onDelete,
  onViewSubmissions,
}: ChaptersListProps) {
  return (
    <div className="space-y-6">
      {groupedData.map((gradeData, gradeIndex) => {
        const isGradeExpanded = expandedGrades.has(gradeData.grade._id);
        const colorClass = getGradeColor(gradeIndex);

        return (
          <div key={gradeData.grade._id} className="group">
            <button
              onClick={() => onToggleGrade(gradeData.grade._id)}
              className="w-full bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 mb-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div
                    className={`w-16 h-16 rounded-xl bg-gradient-to-br ${colorClass} flex items-center justify-center shadow-lg`}
                  >
                    <GraduationCap className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-left flex-1">
                    <h2
                      className={`text-3xl font-bold bg-gradient-to-r ${colorClass} bg-clip-text text-transparent mb-1`}
                    >
                      Grade {gradeData.grade.grade}
                    </h2>
                    <p className="text-gray-600 text-sm">
                      {gradeData.totalChapters} chapter
                      {gradeData.totalChapters !== 1 ? "s" : ""} across{" "}
                      {gradeData.unitGroups.length} unit
                      {gradeData.unitGroups.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge
                    className={`bg-gradient-to-r ${colorClass} text-white border-0 px-4 py-1`}
                  >
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
                  const unitColor = getUnitColor(unitIndex);

                  return (
                    <div key={unitKey} className="ml-4">
                      <button
                        onClick={() => onToggleUnit(unitKey)}
                        className="w-full bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-5 mb-3"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 flex-1">
                            <div
                              className={`w-12 h-12 rounded-lg bg-gradient-to-br ${unitColor} flex items-center justify-center shadow-md`}
                            >
                              <BookOpen className="h-6 w-6 text-white" />
                            </div>
                            <div className="text-left flex-1">
                              <h3
                                className={`text-xl font-bold bg-gradient-to-r ${unitColor} bg-clip-text text-transparent`}
                              >
                                {unitGroup.unit.name}
                              </h3>
                              <p className="text-gray-600 text-xs">
                                {unitGroup.chapters.length} chapter
                                {unitGroup.chapters.length !== 1 ? "s" : ""}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge
                              className={`bg-gradient-to-r ${unitColor} text-white border-0 px-3 py-1 text-xs`}
                            >
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
                            <ChapterCard
                              key={chapter._id}
                              chapter={chapter}
                              index={chapterIndex}
                              unitName={unitGroup.unit.name}
                              onViewScores={onViewScores}
                              onEdit={onEdit}
                              onDelete={onDelete}
                              onViewSubmissions={onViewSubmissions}
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