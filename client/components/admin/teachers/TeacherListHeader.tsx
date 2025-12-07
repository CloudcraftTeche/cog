"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Users, Search } from "lucide-react";

interface TeacherListHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onAddNew: () => void;
}

export function TeacherListHeader({ searchQuery, onSearchChange, onAddNew }: TeacherListHeaderProps) {
  return (
    <>
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 p-8 text-white shadow-2xl">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                <Users className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-purple-100 bg-clip-text text-transparent">
                  Teachers
                </h1>
                <p className="text-purple-100 text-lg">Manage your teaching staff</p>
              </div>
            </div>
          </div>
          <Button
            className="bg-gradient-to-r from-orange-400 via-pink-500 to-red-500 hover:from-orange-500 hover:via-pink-600 hover:to-red-600 border-0 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 text-white font-semibold px-8 py-3 rounded-2xl"
            onClick={onAddNew}
          >
            <Plus className="h-5 w-5 mr-2" />
            Add New Teacher
          </Button>
        </div>
      </div>

      <div className="max-w-md mx-auto">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-purple-400" />
          <Input
            placeholder="Search by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-12 pr-4 py-3 rounded-2xl border-2 border-purple-200 focus:border-purple-400 focus:ring-4 focus:ring-purple-100 bg-white/80 backdrop-blur-sm shadow-lg text-gray-700 placeholder:text-purple-300"
          />
        </div>
      </div>
    </>
  );
}