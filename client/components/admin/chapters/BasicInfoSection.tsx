"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, AlertCircle, GraduationCap, X } from "lucide-react";

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

interface BasicInfoSectionProps {
  title: string;
  setTitle: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  selectedGrades: string[];
  setSelectedGrades: (value: string[]) => void;
  selectedUnit: string;
  setSelectedUnit: (value: string) => void;
  chapter: number;
  setChapter: (value: number) => void;
  grades: Grade[];
  units: Unit[];
  errors?: {
    title?: string;
    description?: string;
    gradeIds?: string;
    unitId?: string;
    chapterNumber?: string;
  };
}

const chapters = Array.from({ length: 50 }, (_, i) => ({
  id: (i + 1).toString(),
  title: `Chapter ${i + 1}`,
}));

export default function BasicInfoSection({
  title,
  setTitle,
  description,
  setDescription,
  selectedGrades,
  setSelectedGrades,
  selectedUnit,
  setSelectedUnit,
  chapter,
  setChapter,
  grades,
  units,
  errors = {},
}: BasicInfoSectionProps) {
  const [gradeSearchTerm, setGradeSearchTerm] = useState("");
  const hasUnitsAvailable = units && units.length > 0;
  const hasGradesSelected = selectedGrades.length > 0;

  const toggleGrade = (gradeId: string) => {
    setSelectedGrades(
      selectedGrades.includes(gradeId)
        ? selectedGrades.filter((id) => id !== gradeId)
        : [...selectedGrades, gradeId]
    );
  };

  const removeGrade = (gradeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedGrades(selectedGrades.filter((id) => id !== gradeId));
  };

  const filteredGrades = grades?.filter((g) =>
    g.grade.toLowerCase().includes(gradeSearchTerm.toLowerCase())
  );

  return (
    <Card className="shadow-2xl border-0 bg-white rounded-3xl overflow-hidden">
      <div className="h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
      <CardHeader className="pb-4 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <Badge variant="secondary" className="bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 border-0 px-4 py-1 rounded-full">
            Basic Info
          </Badge>
        </div>
        <CardTitle className="text-2xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Content Details
        </CardTitle>
        <CardDescription className="text-slate-600 text-base">
          Basic information about your educational content
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 p-8">
        <div className="space-y-3">
          <Label htmlFor="title" className="text-sm font-semibold text-slate-700 flex items-center">
            <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mr-2"></div>
            Content Title <span className="text-red-500 ml-1">*</span>
          </Label>
          <Input
            id="title"
            placeholder="Enter a descriptive title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={`h-12 border-2 rounded-xl transition-all duration-300 ${
              errors.title 
                ? "border-red-300 focus:border-red-500 focus:ring-red-100" 
                : "border-slate-200 focus:border-blue-500 focus:ring-blue-100"
            }`}
            required
          />
          {errors.title && <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {errors.title}
          </p>}
        </div>

        <div className="space-y-3">
          <Label htmlFor="description" className="text-sm font-semibold text-slate-700 flex items-center">
            <div className="w-2 h-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full mr-2"></div>
            Description <span className="text-red-500 ml-1">*</span>
          </Label>
          <Textarea
            id="description"
            placeholder="Describe what students will learn from this content..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className={`border-2 rounded-xl resize-none transition-all duration-300 ${
              errors.description
                ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                : "border-slate-200 focus:border-cyan-500 focus:ring-cyan-100"
            }`}
            required
          />
          {errors.description && <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {errors.description}
          </p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Modern Grade Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-slate-700 flex items-center">
              <div className="w-2 h-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full mr-2"></div>
              Grade Level <span className="text-red-500 ml-1">*</span>
            </Label>
            
            {/* Search Input */}
            <div className="relative">
              <Input
                placeholder="Search grades..."
                value={gradeSearchTerm}
                onChange={(e) => setGradeSearchTerm(e.target.value)}
                className={`h-12 border-2 rounded-xl pl-10 transition-all duration-300 ${
                  errors.gradeIds 
                    ? "border-red-300 focus:border-red-500"
                    : "border-slate-200 focus:border-emerald-500"
                }`}
              />
              <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-emerald-500" />
            </div>

            {/* Selected Grades Pills */}
            {selectedGrades.length > 0 && (
              <div className="flex flex-wrap gap-2 p-3 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border-2 border-emerald-100">
                {selectedGrades.map((gradeId) => {
                  const grade = grades.find((g) => g._id === gradeId);
                  return (
                    <div
                      key={gradeId}
                      className="group flex items-center gap-2 bg-white border-2 border-emerald-200 hover:border-emerald-400 rounded-full px-3 py-1.5 shadow-sm hover:shadow-md transition-all duration-200"
                    >
                      <span className="text-sm font-medium text-emerald-700">
                        Grade {grade?.grade}
                      </span>
                      <button
                        onClick={(e) => removeGrade(gradeId, e)}
                        className="flex items-center justify-center w-4 h-4 rounded-full bg-emerald-100 group-hover:bg-emerald-200 text-emerald-600 hover:text-emerald-800 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Grade Grid Selection */}
            <div className={`max-h-64 overflow-y-auto rounded-xl border-2 transition-all duration-300 ${
              errors.gradeIds 
                ? "border-red-300"
                : "border-slate-200"
            }`}>
              <div className="grid grid-cols-2 gap-2 p-3">
                {filteredGrades?.map(({ _id, grade: g }) => {
                  const isSelected = selectedGrades.includes(_id);
                  return (
                    <button
                      key={_id}
                      type="button"
                      onClick={() => toggleGrade(_id)}
                      className={`group relative overflow-hidden rounded-xl p-4 text-center font-semibold transition-all duration-300 transform hover:scale-105 ${
                        isSelected
                          ? "bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-200"
                          : "bg-gradient-to-br from-slate-50 to-slate-100 text-slate-700 hover:from-emerald-50 hover:to-teal-50 border-2 border-slate-200 hover:border-emerald-300"
                      }`}
                    >
                      <div className="relative z-10 flex flex-col items-center gap-1">
                        <GraduationCap className={`w-5 h-5 transition-all ${
                          isSelected ? "text-white" : "text-emerald-500"
                        }`} />
                        <span className="text-sm">Grade {g}</span>
                      </div>
                      {isSelected && (
                        <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                      )}
                    </button>
                  );
                })}
              </div>
              {filteredGrades?.length === 0 && (
                <div className="p-8 text-center text-slate-500">
                  <GraduationCap className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No grades found</p>
                </div>
              )}
            </div>

            {errors.gradeIds && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.gradeIds}
              </p>
            )}
          </div>

          <div className="space-y-3">
            <Label htmlFor="unit" className="text-sm font-semibold text-slate-700 flex items-center">
              <div className="w-2 h-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-full mr-2"></div>
              Unit <span className="text-red-500 ml-1">*</span>
            </Label>
            <Select 
              onValueChange={setSelectedUnit} 
              value={selectedUnit}
              disabled={!hasGradesSelected || !hasUnitsAvailable}
            >
              <SelectTrigger
                id="unit"
                className={`h-12 border-2 rounded-xl transition-all duration-300 ${
                  errors.unitId
                    ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                    : "border-slate-200 focus:border-orange-500 focus:ring-orange-100"
                } ${!hasGradesSelected || !hasUnitsAvailable ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <SelectValue placeholder={
                  !hasGradesSelected 
                    ? "Select grade first" 
                    : !hasUnitsAvailable 
                      ? "No units available" 
                      : "Select unit"
                } />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {units?.map((unit) => (
                  <SelectItem key={unit._id} value={unit._id} className="rounded-lg">
                    {unit.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.unitId && <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors.unitId}
            </p>}
            {!hasGradesSelected && (
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Select a grade to view units
              </p>
            )}
            {hasGradesSelected && !hasUnitsAvailable && (
              <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Selected grade has no units. Please add units first.
              </p>
            )}
          </div>

          <div className="space-y-3">
            <Label htmlFor="chapter" className="text-sm font-semibold text-slate-700 flex items-center">
              <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mr-2"></div>
              Chapter Number <span className="text-red-500 ml-1">*</span>
            </Label>
            <Select onValueChange={(val) => setChapter(Number(val))} value={String(chapter)}>
              <SelectTrigger
                id="chapter"
                className={`h-12 border-2 rounded-xl transition-all duration-300 ${
                  errors.chapterNumber
                    ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                    : "border-slate-200 focus:border-purple-500 focus:ring-purple-100"
                }`}
              >
                <SelectValue placeholder="Select Chapter" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {chapters?.map(({ id, title }) => (
                  <SelectItem key={id} value={id} className="rounded-lg">
                    {title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.chapterNumber && <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors.chapterNumber}
            </p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}