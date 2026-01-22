// components/admin/teacher-chapters/EditTeacherChapterForm.tsx

"use client";

import { FormEvent } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, BookOpen, Video } from "lucide-react";
import { Grade, Unit, EditQuestion, ValidationErrors } from "@/types/admin/teacher-chapter.types";
import EditTeacherContentSection from "../chapters/EditTeacherContentSection";
import EditQuestionsSection from "../chapters/EditQuestionsSection";

interface EditTeacherChapterFormProps {
  activeTab: string;
  setActiveTab: (value: string) => void;
  title: string;
  setTitle: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  contentType: "video" | "text";
  setContentType: (value: "video" | "text") => void;
  videoUrl: string;
  setVideoUrl: (value: string) => void;
  textContent: string;
  setTextContent: (value: string) => void;
  selectedGradeId: string;
  setSelectedGradeId: (value: string) => void;
  selectedUnitId: string;
  setSelectedUnitId: (value: string) => void;
  chapterNumber: number;
  setChapterNumber: (value: number) => void;
  questions: EditQuestion[];
  setQuestions: React.Dispatch<React.SetStateAction<EditQuestion[]>>;
  errors: ValidationErrors;
  grades: Grade[];
  units: Unit[];
  isLoading: boolean;
  fetchLoading: boolean;
  onSubmit: (e: FormEvent) => void;
  onCancel: () => void;
}

export function EditTeacherChapterForm({
  activeTab,
  setActiveTab,
  title,
  setTitle,
  description,
  setDescription,
  contentType,
  setContentType,
  videoUrl,
  setVideoUrl,
  textContent,
  setTextContent,
  selectedGradeId,
  setSelectedGradeId,
  selectedUnitId,
  setSelectedUnitId,
  chapterNumber,
  setChapterNumber,
  questions,
  setQuestions,
  errors,
  grades,
  units,
  isLoading,
  fetchLoading,
  onSubmit,
  onCancel,
}: EditTeacherChapterFormProps) {
  if (fetchLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30">
        <div className="container mx-auto px-4 py-8">
          <Card className="border-0 shadow-lg rounded-3xl">
            <CardContent className="p-12">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                <p className="ml-4 text-lg text-gray-600">Loading chapter details...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 p-4">
      <div className="max-w-5xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-8">
        <div className="mb-8 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-8 text-white shadow-2xl">
          <h1 className="text-4xl font-bold mb-2">Edit Chapter</h1>
          <p className="text-indigo-100 text-lg">
            Update chapter content and assessment questions
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <div className="flex justify-center">
            <TabsList className="grid w-full max-w-md grid-cols-2 h-16 bg-white rounded-2xl shadow-xl border-0 p-2">
              <TabsTrigger
                value="content"
                className="flex items-center space-x-3 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white font-semibold transition-all duration-300 text-lg"
              >
                <BookOpen className="w-5 h-5" /> <span>Content</span>
              </TabsTrigger>
              <TabsTrigger
                value="questions"
                className="flex items-center space-x-3 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-600 data-[state=active]:text-white font-semibold transition-all duration-300 text-lg"
              >
                <Video className="w-5 h-5" /> <span>Questions</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <form onSubmit={onSubmit} className="space-y-8">
            <TabsContent value="content" className="space-y-8">
              <EditTeacherContentSection
                title={title}
                setTitle={setTitle}
                description={description}
                setDescription={setDescription}
                contentType={contentType}
                setContentType={setContentType}
                videoUrl={videoUrl}
                setVideoUrl={setVideoUrl}
                textContent={textContent}
                setTextContent={setTextContent}
                selectedGradeId={selectedGradeId}
                setSelectedGradeId={setSelectedGradeId}
                selectedUnitId={selectedUnitId}
                setSelectedUnitId={setSelectedUnitId}
                chapterNumber={chapterNumber}
                setChapterNumber={setChapterNumber}
                grades={grades}
                units={units}
                errors={errors}
              />
            </TabsContent>

            <TabsContent value="questions" className="space-y-8">
              <EditQuestionsSection
                questions={questions}
                setQuestions={setQuestions}
                errors={errors}
              />
            </TabsContent>

            <div className="flex justify-end gap-6">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
                className="bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-700 hover:bg-gray-50 rounded-xl px-8 py-3 font-semibold transition-all duration-300"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 rounded-xl px-8 py-3 font-semibold disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5 mr-2" />
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