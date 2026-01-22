// components/admin/teacher-chapters/CreateTeacherChapterForm.tsx

"use client";

import { FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {  Upload, Video, BookOpen, Sparkles, Users } from "lucide-react";
import Link from "next/link";
import { Grade, Unit, Question, ValidationErrors } from "@/types/admin/teacher-chapter.types";
import TeacherContentUploadSection from "./TeacherContentUploadSection";
import BasicInfoSection from "./BasicInfoSection";
import QuestionsSection from "./QuestionsSection";

interface CreateTeacherChapterFormProps {
  contentType: "video" | "text";
  setContentType: (value: "video" | "text") => void;
  title: string;
  setTitle: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  selectedGrades: string[];
  setSelectedGrades: (value: string[]) => void;
  chapter: number;
  setChapter: (value: number) => void;
  videoUrl: string;
  setVideoUrl: (value: string) => void;
  textContent: string;
  setTextContent: (value: string) => void;
  selectedUnit: string;
  setSelectedUnit: (value: string) => void;
  isPublished: boolean;
  setIsPublished: (value: boolean) => void;
  requiresPreviousChapter: boolean;
  setRequiresPreviousChapter: (value: boolean) => void;
  questions: Question[];
  setQuestions: React.Dispatch<React.SetStateAction<Question[]>>;
  errors: ValidationErrors;
  grades: Grade[];
  units: Unit[];
  isLoading: boolean;
  gradesLoading: boolean;
  unitsLoading: boolean;
  onSubmit: (e: FormEvent) => void;
}

export function CreateTeacherChapterForm({
  contentType,
  setContentType,
  title,
  setTitle,
  description,
  setDescription,
  selectedGrades,
  setSelectedGrades,
  chapter,
  setChapter,
  videoUrl,
  setVideoUrl,
  textContent,
  setTextContent,
  selectedUnit,
  setSelectedUnit,
  isPublished,
  setIsPublished,
  requiresPreviousChapter,
  setRequiresPreviousChapter,
  questions,
  setQuestions,
  errors,
  grades,
  units,
  isLoading,
  onSubmit,
}: CreateTeacherChapterFormProps) {
  return (
    <div className="p-6 relative">
      <div className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 text-white py-8 mb-8 rounded-3xl">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center mb-4">
            <Users className="h-8 w-8 mr-3" />
            <h1 className="text-3xl font-bold">Create Teacher Training Chapter</h1>
          </div>
          <p className="text-indigo-100 text-lg">
            Assign educational content and assessments for teacher development
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 pb-8">
        <Tabs
          value={contentType}
          onValueChange={(val: string) => setContentType(val as "video" | "text")}
          className="space-y-8"
        >
          <div className="flex justify-center">
            <TabsList className="grid w-full max-w-md grid-cols-2 h-14 bg-gradient-to-r from-slate-100 to-slate-200 rounded-2xl p-2">
              <TabsTrigger
                value="video"
                className="flex items-center space-x-2 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300"
              >
                <Video className="w-5 h-5" />
                <span className="font-medium">Video Content</span>
              </TabsTrigger>
              <TabsTrigger
                value="text"
                className="flex items-center space-x-2 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300"
              >
                <BookOpen className="w-5 h-5" />
                <span className="font-medium">Text Content</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <form onSubmit={onSubmit} className="space-y-8">
            <BasicInfoSection
              title={title}
              setTitle={setTitle}
              description={description}
              setDescription={setDescription}
              selectedGrades={selectedGrades}
              setSelectedGrades={setSelectedGrades}
              selectedUnit={selectedUnit}
              setSelectedUnit={setSelectedUnit}
              chapter={chapter}
              setChapter={setChapter}
              grades={grades}
              units={units}
              errors={errors}
            />

            <div className="bg-white rounded-3xl shadow-2xl p-8 border-0">
              <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Chapter Settings
              </h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                  <div className="space-y-1">
                    <Label htmlFor="isPublished" className="text-base font-semibold text-gray-700">
                      Publish Chapter
                    </Label>
                    <p className="text-sm text-gray-600">
                      Make this chapter visible to teachers in selected grades
                    </p>
                  </div>
                  <Switch id="isPublished" checked={isPublished} onCheckedChange={setIsPublished} />
                </div>
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                  <div className="space-y-1">
                    <Label htmlFor="requiresPrevious" className="text-base font-semibold text-gray-700">
                      Require Previous Chapter
                    </Label>
                    <p className="text-sm text-gray-600">
                      Teachers must complete previous chapter before accessing this one
                    </p>
                  </div>
                  <Switch
                    id="requiresPrevious"
                    checked={requiresPreviousChapter}
                    onCheckedChange={setRequiresPreviousChapter}
                  />
                </div>
              </div>
            </div>

            <TabsContent value="video" className="space-y-8 mt-0">
              <TeacherContentUploadSection
                contentType="video"
                videoUrl={videoUrl}
                setVideoUrl={setVideoUrl}
                textContent=""
                setTextContent={() => {}}
                errors={errors}
              />
            </TabsContent>

            <TabsContent value="text" className="space-y-8 mt-0">
              <TeacherContentUploadSection
                contentType="text"
                videoUrl=""
                setVideoUrl={() => {}}
                textContent={textContent}
                setTextContent={setTextContent}
                errors={errors}
              />
            </TabsContent>

            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-3xl p-6 border-2 border-amber-200">
              <div className="flex items-start gap-3">
                <Sparkles className="h-6 w-6 text-amber-600 mt-1" />
                <div>
                  <h4 className="font-semibold text-amber-900 mb-2">Optional Assessment</h4>
                  <p className="text-sm text-amber-700">
                    Questions are optional for teacher chapters. Add them only if you want to assess
                    teacher understanding. Leave questions empty if this is informational content only.
                  </p>
                </div>
              </div>
            </div>

            <QuestionsSection questions={questions} setQuestions={setQuestions} errors={errors} />

            <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-4">
              <Button
                type="button"
                variant="outline"
                asChild
                className="px-6 sm:px-8 h-12 bg-white border-2 border-slate-300 hover:bg-slate-50 hover:border-slate-400 rounded-xl w-full sm:w-auto transition-all duration-300"
              >
                <Link href="/dashboard/admin/teacher-chapters">Cancel</Link>
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="px-8 sm:px-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-xl w-full sm:w-auto shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5 mr-3" />
                    Create Teacher Chapter
                  </>
                )}
              </Button>
            </div>
          </form>
        </Tabs>
      </div>
    </div>
  );
}