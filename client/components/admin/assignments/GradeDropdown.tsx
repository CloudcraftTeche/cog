"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight, BookOpen, GraduationCap } from "lucide-react";
import { AssignmentCard } from "./AssignmentCard";
import { IAssignment, IGrade } from "@/lib/assignmentValidation";
interface GradeDropdownProps {
  grade: IGrade;
  assignments: IAssignment[];
  onDeleteAssignment: (id: string) => void;
  onViewSubmissions: (gradeId: string, assignmentId: string) => void;
  isLoading?: boolean;
}
export const GradeDropdown: React.FC<GradeDropdownProps> = ({
  grade,
  assignments,
  onDeleteAssignment,
  onViewSubmissions,
  isLoading = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const gradeAssignments = assignments.filter(a => a.gradeId === grade._id);
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="border-2 border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-all duration-300 py-3">
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="w-full p-6 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-300"
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <GraduationCap className="h-6 w-6 text-white" />
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-3 mb-1 ">
                    <h3 className="text-xl font-bold text-gray-900">
                      Grade {grade.grade}
                    </h3>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                      {gradeAssignments.length} Assignment{gradeAssignments.length !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                  {grade.description && (
                    <p className="text-sm text-gray-600">{grade.description}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="hidden sm:flex items-center gap-2 text-sm text-gray-600">
                  <BookOpen className="h-4 w-4" />
                  <span>{gradeAssignments.length} total</span>
                </div>
                {isOpen ? (
                  <ChevronDown className="h-5 w-5 text-gray-600 transition-transform" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-gray-600 transition-transform" />
                )}
              </div>
            </div>
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="border-t-2 border-gray-100 p-6 bg-gradient-to-br from-gray-50 to-blue-50">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl p-6 animate-pulse">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-14 h-14 bg-gray-200 rounded-xl" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4" />
                        <div className="h-3 bg-gray-200 rounded w-1/2" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded" />
                      <div className="h-3 bg-gray-200 rounded w-5/6" />
                    </div>
                  </div>
                ))}
              </div>
            ) : gradeAssignments.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="h-10 w-10 text-gray-400" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  No assignments yet
                </h4>
                <p className="text-gray-600 mb-4">
                  Create your first assignment for Grade {grade.grade}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {gradeAssignments.map((assignment) => (
                  <AssignmentCard
                    key={assignment._id}
                    assignment={assignment}
                    onDelete={onDeleteAssignment}
                    onViewSubmissions={(id) => onViewSubmissions(grade._id, id)}
                  />
                ))}
              </div>
            )}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};