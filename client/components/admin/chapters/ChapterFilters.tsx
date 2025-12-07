"use client";
import React, { useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
interface Grade {
  _id: string;
  grade: string;
  units?: Array<{
    _id: string;
    name: string;
    description?: string;
    orderIndex: number;
  }>;
}
interface Unit {
  _id: string;
  name: string;
  description?: string;
  orderIndex: number;
}
interface ChapterFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  selectedGrade: string;
  setSelectedGrade: (value: string) => void;
  selectedUnit: string;
  setSelectedUnit: (value: string) => void;
  chapter: number | "";
  setChapter: (value: number | "") => void;
  grades: Grade[];
  units: Unit[];
}
const chaptersDown = Array.from({ length: 50 }, (_, i) => ({
  id: String(i + 1),
  title: `Chapter ${i + 1}`,
}));
export default function ChapterFilters({
  searchTerm,
  setSearchTerm,
  selectedGrade,
  setSelectedGrade,
  selectedUnit,
  setSelectedUnit,
  chapter,
  setChapter,
  grades,
  units,
}: ChapterFiltersProps) {
  const displayUnits = units;
  useEffect(() => {
    setSelectedUnit("");
    setChapter("");
  }, [selectedGrade, setSelectedUnit, setChapter]);
  useEffect(() => {
    setChapter("");
  }, [selectedUnit, setChapter]);
  const handleGradeChange = (value: string) => {
    if (value === "all-grades") {
      setSelectedGrade("");
    } else {
      setSelectedGrade(value);
    }
  };
  const handleUnitChange = (value: string) => {
    if (value === "all-units") {
      setSelectedUnit("");
    } else {
      setSelectedUnit(value);
    }
  };
  const handleChapterChange = (value: string) => {
    if (value === "all-chapters") {
      setChapter("");
    } else {
      setChapter(Number(value));
    }
  };
  return (
    <div className="flex flex-col gap-6 mb-8">
      <div className="max-w-md flex items-center gap-3 bg-white rounded-2xl p-4 shadow-lg border border-gray-100">
        <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl">
          <Search className="text-white h-5 w-5" />
        </div>
        <Input
          placeholder="Search chapters..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border-0 bg-transparent focus:ring-0 text-lg"
        />
      </div>
      <div className="flex flex-wrap gap-4">
        <div className="space-y-2 flex-1 min-w-[200px]">
          <Label htmlFor="grade" className="text-sm font-semibold text-gray-700">
            Grade
          </Label>
          <Select 
            value={selectedGrade || "all-grades"} 
            onValueChange={handleGradeChange}
          >
            <SelectTrigger className="bg-white border-2 border-purple-200 focus:border-purple-400 rounded-xl shadow-md">
              <SelectValue placeholder="All Grades" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-grades">All Grades</SelectItem>
              {grades.map(({ _id, grade }) => (
                <SelectItem key={_id} value={_id}>
                  Grade {grade}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2 flex-1 min-w-[200px]">
          <Label htmlFor="unit" className="text-sm font-semibold text-gray-700">
            Unit
          </Label>
          <Select 
            value={selectedUnit || "all-units"} 
            onValueChange={handleUnitChange}
            disabled={!selectedGrade}
          >
            <SelectTrigger 
              className={`bg-white border-2 border-green-200 focus:border-green-400 rounded-xl shadow-md ${
                !selectedGrade ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <SelectValue placeholder={selectedGrade ? "All Units" : "Select grade first"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-units">All Units</SelectItem>
              {displayUnits.map((unit) => (
                <SelectItem key={unit._id} value={unit._id}>
                  {unit.name || `Unit ${unit._id}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {!selectedGrade && (
            <p className="text-xs text-gray-500 mt-1">Select a grade to filter by unit</p>
          )}
        </div>
        <div className="space-y-2 flex-1 min-w-[200px]">
          <Label htmlFor="chapter" className="text-sm font-semibold text-gray-700">
            Chapter Number
          </Label>
          <Select 
            value={chapter ? String(chapter) : "all-chapters"} 
            onValueChange={handleChapterChange}
            disabled={!selectedUnit && !selectedGrade}
          >
            <SelectTrigger 
              className={`bg-white border-2 border-orange-200 focus:border-orange-400 rounded-xl shadow-md ${
                !selectedUnit && !selectedGrade ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <SelectValue placeholder={selectedUnit || selectedGrade ? "All Chapters" : "Select unit/grade first"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-chapters">All Chapters</SelectItem>
              {chaptersDown.map(({ id, title }) => (
                <SelectItem key={id} value={id}>
                  {title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {!selectedUnit && !selectedGrade && (
            <p className="text-xs text-gray-500 mt-1">Select grade or unit to filter by chapter</p>
          )}
        </div>
      </div>
    </div>
  );
}