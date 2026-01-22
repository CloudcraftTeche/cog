"use client";

import { Plus, Search, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface TeacherListHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onAddNew: () => void;
  totalTeachers?: number;
}

export function TeacherListHeader({
  searchQuery,
  onSearchChange,
  onAddNew,
  totalTeachers = 0,
}: TeacherListHeaderProps) {
  return (
    <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 rounded-3xl shadow-2xl p-8 text-white">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
            <Users className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-4xl font-bold">Teachers</h1>
            <p className="text-purple-100 text-lg mt-1">
              Manage your teaching staff ({totalTeachers} total)
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-purple-300" />
            <Input
              type="text"
              placeholder="Search teachers..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-11 pr-4 py-3 bg-white/10 border-2 border-white/20 text-white placeholder:text-purple-200 rounded-xl focus:bg-white/20 focus:border-white/40 backdrop-blur-sm w-full sm:w-64"
            />
          </div>
          <Button
            onClick={onAddNew}
            className="bg-white text-purple-600 hover:bg-purple-50 rounded-xl px-6 py-3 font-bold shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Teacher
          </Button>
        </div>
      </div>
    </div>
  );
}