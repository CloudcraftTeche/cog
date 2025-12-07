"use client";
import { AssignmentsGrid } from "@/components/student/assignments/AssignmentGrid";
import React from "react";

const StudentAssignments = () => {
  return (
    <div className=" p-6">
      <AssignmentsGrid userRole="student" />
    </div>
  );
};

export default StudentAssignments;
