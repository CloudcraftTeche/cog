"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TrendingUp, Trophy, Users, User, Mail, Calendar } from "lucide-react";
interface StudentScore {
  studentId: string;
  name: string;
  email: string;
  rollNumber: string;
  profilePictureUrl?: string;
  completedAt: string | null;
  score: number;
}
interface CompletedStudentsTabProps {
  students: StudentScore[];
  questionsCount: number;
  highestScore: number;
}
export default function CompletedStudentsTab({ students, questionsCount, highestScore }: CompletedStudentsTabProps) {
  const getScoreColor = (score: number, maxScore: number) => {
    if (maxScore === 0) return "text-gray-600 bg-gray-100";
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return "text-green-600 bg-green-100";
    if (percentage >= 60) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };
  const getGradeEmoji = (score: number, maxScore: number) => {
    if (maxScore === 0) return "📚";
    const percentage = (score / maxScore) * 100;
    if (percentage >= 90) return "🏆";
    if (percentage >= 80) return "🥇";
    if (percentage >= 70) return "🥈";
    if (percentage >= 60) return "🥉";
    return "📚";
  };
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  return (
    <Card className="border-0 shadow-2xl rounded-3xl overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-8">
        <CardTitle className="flex flex-wrap items-center gap-3 text-2xl">
          <TrendingUp className="h-6 w-6" />
          Student Performance
          <Badge className="bg-white/20 text-white border-white/30 px-4 py-1 rounded-full">
            {students.length} completed
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {students.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full flex items-center justify-center">
              <Users className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold mb-3">No Completions Yet</h3>
            <p className="text-lg">No students have completed this chapter yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {students.map((student, index) => (
              <div
                key={student.studentId}
                className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-8 hover:bg-gray-50 transition-colors ${
                  index === 0
                    ? "bg-gradient-to-r from-yellow-50 via-orange-50 to-red-50"
                    : index === 1
                      ? "bg-gradient-to-r from-gray-50 to-slate-50"
                      : index === 2
                        ? "bg-gradient-to-r from-orange-50 to-amber-50"
                        : ""
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex items-center gap-4">
                    <div
                      className={`text-3xl font-bold w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg ${
                        index === 0
                          ? "bg-gradient-to-r from-yellow-500 to-orange-500"
                          : index === 1
                            ? "bg-gradient-to-r from-gray-400 to-gray-600"
                            : index === 2
                              ? "bg-gradient-to-r from-orange-500 to-red-500"
                              : "bg-gradient-to-r from-blue-400 to-indigo-500"
                      }`}
                    >
                      #{index + 1}
                    </div>
                    <Avatar className="h-16 w-16 border-4 border-white shadow-lg">
                      <AvatarImage src={student.profilePictureUrl} />
                      <AvatarFallback className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-xl font-bold">
                        {student.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center flex-wrap gap-3">
                      <h3 className="font-bold text-xl text-gray-900">{student.name}</h3>
                      {index === 0 && (
                        <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 px-3 py-1 rounded-full font-semibold">
                          <Trophy className="h-4 w-4 mr-1" />
                          Top Score
                        </Badge>
                      )}
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
                      <span className="flex items-center gap-2 bg-purple-50 px-3 py-1 rounded-full">
                        <Calendar className="h-4 w-4 text-purple-500" />
                        {formatDate(student.completedAt)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right space-y-2">
                  <div className="flex items-center justify-end gap-3">
                    <span className="text-4xl">{getGradeEmoji(student.score, questionsCount)}</span>
                    <Badge className={`text-2xl font-bold px-4 py-2 rounded-2xl shadow-lg ${getScoreColor(student.score, questionsCount)}`}>
                      {student.score}/{questionsCount}
                    </Badge>
                  </div>
                  {student.score === highestScore && highestScore > 0 && student.score === questionsCount && (
                    <div className="text-sm bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full font-bold">
                      🎯 Perfect Score!
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
