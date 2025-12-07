"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Users, TrendingUp, Trophy, AlertCircle } from "lucide-react";

interface StatisticsCardsProps {
  totalStudents: number;
  completionRate: number;
  averageScore: number;
  passRate: number;
}

export default function StatisticsCards({
  totalStudents,
  completionRate,
  averageScore,
  passRate,
}: StatisticsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card className="border-0 shadow-xl rounded-3xl overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
              <Users className="h-8 w-8 text-white" />
            </div>
            <div>
              <p className="text-blue-100 font-medium">Total Students</p>
              <p className="text-3xl font-bold">{totalStudents}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-xl rounded-3xl overflow-hidden bg-gradient-to-br from-green-500 to-emerald-600 text-white">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
              <TrendingUp className="h-8 w-8 text-white" />
            </div>
            <div>
              <p className="text-green-100 font-medium">Completion Rate</p>
              <p className="text-3xl font-bold">{completionRate}%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-xl rounded-3xl overflow-hidden bg-gradient-to-br from-yellow-500 to-orange-600 text-white">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
              <Trophy className="h-8 w-8 text-white" />
            </div>
            <div>
              <p className="text-yellow-100 font-medium">Average Score</p>
              <p className="text-3xl font-bold">{averageScore.toFixed(1)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-xl rounded-3xl overflow-hidden bg-gradient-to-br from-purple-500 to-pink-600 text-white">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
              <AlertCircle className="h-8 w-8 text-white" />
            </div>
            <div>
              <p className="text-purple-100 font-medium">Pass Rate</p>
              <p className="text-3xl font-bold">{passRate}%</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
