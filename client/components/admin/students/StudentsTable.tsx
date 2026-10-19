"use client";
import { MoreHorizontal, TrendingUp, Edit, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Grade } from "@/types/admin/student.types";
import { getInitials, getCardGradient } from "@/utils/admin/student.utils";

interface StudentRow {
  _id: string;
  name: string;
  email: string;
  rollNumber?: string;
  parentContact?: string;
  gradeId?: string;
  profilePictureUrl?: string;
}

interface StudentsTableProps<T extends StudentRow> {
  students: T[];
  /** Omit to hide the Grade column (e.g. teachers, who only see their own grade). */
  grades?: Grade[];
  startIndex: number;
  onViewProgress: (student: T) => void;
  onEdit: (student: T) => void;
  onDelete: (student: T) => void;
}

export function StudentsTable<T extends StudentRow>({
  students,
  grades,
  startIndex,
  onViewProgress,
  onEdit,
  onDelete,
}: StudentsTableProps<T>) {
  const gradeName = (gradeId?: string) =>
    gradeId ? grades?.find((g) => g._id === gradeId)?.grade || gradeId : "—";

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-50 hover:to-pink-50">
            <TableHead className="w-12 pl-6 text-purple-900">#</TableHead>
            <TableHead className="text-purple-900">Student</TableHead>
            <TableHead className="text-purple-900">Roll No.</TableHead>
            <TableHead className="text-purple-900">Email</TableHead>
            <TableHead className="text-purple-900">Parent Contact</TableHead>
            {grades && <TableHead className="text-purple-900">Grade</TableHead>}
            <TableHead className="pr-6 text-right text-purple-900">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.map((student, index) => (
            <TableRow key={student._id} className="hover:bg-purple-50/50">
              <TableCell className="pl-6 text-gray-500">{startIndex + index + 1}</TableCell>
              <TableCell>
                <div className="flex items-center gap-3">
                  {student.profilePictureUrl ? (
                    <img
                      src={student.profilePictureUrl}
                      alt={student.name}
                      className="h-9 w-9 rounded-lg object-cover"
                    />
                  ) : (
                    <div
                      className={`h-9 w-9 rounded-lg bg-gradient-to-br ${getCardGradient(index)} flex items-center justify-center text-white text-sm font-bold`}
                    >
                      {getInitials(student.name)}
                    </div>
                  )}
                  <span className="font-medium text-gray-900">{student.name}</span>
                </div>
              </TableCell>
              <TableCell className="text-gray-700">{student.rollNumber || "—"}</TableCell>
              <TableCell className="text-gray-700">{student.email}</TableCell>
              <TableCell className="text-gray-700">{student.parentContact || "—"}</TableCell>
              {grades && (
                <TableCell>
                  <span className="inline-block px-2.5 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                    {gradeName(student.gradeId)}
                  </span>
                </TableCell>
              )}
              <TableCell className="pr-6 text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className="h-8 w-8 inline-flex items-center justify-center rounded-lg hover:bg-purple-100 transition-colors"
                      aria-label={`Actions for ${student.name}`}
                    >
                      <MoreHorizontal className="h-4 w-4 text-gray-600" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44">
                    <DropdownMenuItem onClick={() => onViewProgress(student)}>
                      <TrendingUp className="h-4 w-4 text-purple-500" />
                      View Progress
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEdit(student)}>
                      <Edit className="h-4 w-4 text-green-500" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem variant="destructive" onClick={() => onDelete(student)}>
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
