"use client";

import { BookOpen, Loader2 } from "lucide-react";
import { useChapterLesson } from "@/hooks/admin/useChapterGames";

// The textbook lesson a chapter's games are checked against. Copyrighted: shown to staff only.
export function LessonPanel({ chapterId }: { chapterId: string }) {
  const { data: lesson, isLoading, isError } = useChapterLesson(chapterId);

  return (
    <aside className="rounded-2xl border border-amber-100 bg-amber-50/60 p-5 lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto">
      <h2 className="mb-1 flex items-center gap-2 text-lg font-bold text-gray-900">
        <BookOpen className="h-5 w-5 text-amber-600" /> Textbook lesson
      </h2>
      <p className="mb-4 text-xs text-gray-500">For checking games only. Please don&apos;t copy or share the textbook text.</p>
      {isLoading ? (
        <Loader2 className="animate-spin text-amber-600" />
      ) : isError ? (
        <p className="text-sm text-red-700">The lesson could not be loaded.</p>
      ) : !lesson ? (
        <p className="text-sm text-gray-600">This chapter has no textbook lesson.</p>
      ) : (
        <div className="space-y-4 text-sm leading-relaxed text-gray-800">
          <div>
            <p className="text-xs font-semibold uppercase text-amber-700">Lesson {lesson.lessonNumber}</p>
            <h3 className="text-base font-bold">{lesson.title}</h3>
            {lesson.readingPortion && <p className="text-gray-600">Reading: {lesson.readingPortion}</p>}
          </div>
          <div className="rounded-xl bg-white p-3">
            <p className="text-xs font-semibold uppercase text-amber-700">Memory verse</p>
            <p className="font-semibold">{lesson.memoryVerse.text}</p>
            <p className="text-gray-600">{lesson.memoryVerse.reference}</p>
          </div>
          {lesson.introduction && <p>{lesson.introduction}</p>}
          <div className="space-y-2 whitespace-pre-line">{lesson.story}</div>
          {lesson.questions.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase text-amber-700">Questions in the book</p>
              <ol className="ml-5 list-decimal space-y-1">
                {lesson.questions.map((question, index) => (
                  <li key={index}>{question}</li>
                ))}
              </ol>
            </div>
          )}
        </div>
      )}
    </aside>
  );
}
