"use client";

import { AssignmentsGrid } from "@/components/student/assignments/AssignmentGrid";


export default function StudentAssignmentsPage() {
  return (
    <div className="p-6">
      <AssignmentsGrid userRole="student" />
    </div>
  );
}