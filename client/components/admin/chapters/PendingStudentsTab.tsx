"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Clock, Trophy, User, Mail } from "lucide-react";

interface NotCompletedStudent {
  studentId: string;
  name: string;
  email: string;
  rollNumber: string;
  profilePictureUrl?: string;
}

interface PendingStudentsTabProps {
  students: NotCompletedStudent[];
  onSendReminder: (studentId: string) => void;
}

export default function PendingStudentsTab({
  students,
  onSendReminder,
}: PendingStudentsTabProps) {
  return (
    <Card className="border-0 shadow-2xl rounded-3xl overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-orange-500 to-red-600 text-white p-8">
        <CardTitle className="flex flex-wrap items-center gap-3 text-2xl">
          <Clock className="h-6 w-6" />
          Pending Students
          <Badge className="bg-white/20 text-white border-white/30 px-4 py-1 rounded-full">
            {students.length} pending
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {students.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
              <Trophy className="h-12 w-12 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-3">All Students Completed!</h3>
            <p className="text-lg">
              Every student in the class has completed this chapter.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {students.map((student) => (
              <Card
                key={student.studentId || student?.rollNumber}
                className="shadow-lg hover:shadow-xl transition-shadow duration-300 border-0 rounded-2xl m-4"
              >
                <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-8">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-16 w-16 border-4 border-orange-200 shadow-lg">
                        <AvatarImage
                          src={student.profilePictureUrl}
                          alt={`Avatar of ${student.name}`}
                        />
                        <AvatarFallback className="bg-gradient-to-r from-orange-400 to-red-500 text-white text-xl font-bold">
                          {student.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center flex-wrap gap-3">
                        <h3 className="font-bold text-xl text-gray-900">
                          {student.name}
                        </h3>
                        <Badge className="bg-gradient-to-r from-orange-100 to-red-100 text-orange-700 border-orange-200 px-3 py-1 rounded-full font-semibold">
                          <Clock className="h-4 w-4 mr-1" />
                          Pending
                        </Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-full">
                          <User className="h-4 w-4 text-blue-500" />
                          {student.rollNumber}
                        </span>
                        <span className="flex items-center gap-2 bg-green-50 px-3 py-1 rounded-full">
                          <Mail className="h-4 w-4 text-green-500" />
                          {student.email}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 self-end sm:self-center">
                    <Badge className="bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 border-gray-300 px-4 py-2 rounded-full font-semibold">
                      Not Started
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200 hover:border-orange-400 text-orange-700 hover:bg-gradient-to-r hover:from-orange-100 hover:to-red-100 rounded-xl px-6 py-2 font-semibold transition-all duration-300"
                      onClick={() => onSendReminder(student.studentId)}
                    >
                      Remind
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
