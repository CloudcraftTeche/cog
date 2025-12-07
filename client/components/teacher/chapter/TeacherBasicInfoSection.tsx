"use client";
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, AlertCircle, GraduationCap } from "lucide-react";
import { TeacherGrade, ValidationErrors } from "./chapterApiAndTypes";
interface TeacherBasicInfoSectionProps {
  title: string;
  setTitle: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  selectedUnit: string;
  setSelectedUnit: (value: string) => void;
  chapter: number;
  setChapter: (value: number) => void;
  grade: TeacherGrade;
  errors?: ValidationErrors;
}
const chapters = Array.from({ length: 50 }, (_, i) => ({
  id: (i + 1).toString(),
  title: `Chapter ${i + 1}`,
}));
export default function TeacherBasicInfoSection({
  title,
  setTitle,
  description,
  setDescription,
  selectedUnit,
  setSelectedUnit,
  chapter,
  setChapter,
  grade,
  errors = {},
}: TeacherBasicInfoSectionProps) {
  const hasUnitsAvailable = grade.units && grade.units.length > 0;
  const sortedUnits = grade.units 
    ? [...grade.units].sort((a, b) => a.orderIndex - b.orderIndex)
    : [];
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
          Basic information about your educational content for Grade {grade.grade}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 p-8">
        {}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-indigo-600 font-medium">Assigned Grade</p>
              <p className="text-lg font-bold text-indigo-900">Grade {grade.grade}</p>
            </div>
          </div>
        </div>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <Label htmlFor="unit" className="text-sm font-semibold text-slate-700 flex items-center">
              <div className="w-2 h-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-full mr-2"></div>
              Unit <span className="text-red-500 ml-1">*</span>
            </Label>
            <Select 
              onValueChange={setSelectedUnit} 
              value={selectedUnit}
              disabled={!hasUnitsAvailable}
            >
              <SelectTrigger
                id="unit"
                className={`h-12 border-2 rounded-xl transition-all duration-300 ${
                  errors.unitId
                    ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                    : "border-slate-200 focus:border-orange-500 focus:ring-orange-100"
                } ${!hasUnitsAvailable ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <SelectValue placeholder={
                  !hasUnitsAvailable 
                    ? "No units available" 
                    : "Select unit"
                } />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {sortedUnits.map((unit) => (
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
            {!hasUnitsAvailable && (
              <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                No units available for Grade {grade.grade}. Please add units first.
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
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-4 mt-6">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-blue-900 mb-1">Creating Content for Grade {grade.grade}</h4>
              <p className="text-sm text-blue-700">
                Select the unit and chapter number for this content. This chapter will be visible to all students in Grade {grade.grade}.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}