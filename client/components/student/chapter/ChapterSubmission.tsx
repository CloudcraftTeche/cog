// components/chapters/ChapterSubmission.tsx
import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, Loader2, Target, XCircle } from 'lucide-react';
import type { Chapter, SubmissionType, Answer } from '@/types/student/chapter.types';
import { QuizSection } from './QuizSection';
import { SubmissionForm } from './SubmissionForm';
import { QuizResults } from './QuizResults';
import { useSubmitChapter, useCurrentGrade } from '@/hooks/student/useChapters';
import { calculateQuizScore } from '@/utils/student/chapterUtils';
import { toast } from 'sonner';

interface ChapterSubmissionProps {
  chapter: Chapter;
  selectedAnswers: Record<number, string>;
  submitted: boolean;
  currentScore: number;
  hasNextChapter: boolean;
  onAnswerChange: (questionIndex: number, answer: string) => void;
  onSubmitSuccess: (result: { score: number }) => void;
  onRetake: () => void;
  onNextChapter: () => void;
}

export const ChapterSubmission: React.FC<ChapterSubmissionProps> = ({
  chapter,
  selectedAnswers,
  submitted,
  currentScore,
  hasNextChapter,
  onAnswerChange,
  onSubmitSuccess,
  onRetake,
  onNextChapter,
}) => {
  const [submissionType, setSubmissionType] = useState<SubmissionType>('text');
  const [textContent, setTextContent] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data: gradeData } = useCurrentGrade();
  const submitMutation = useSubmitChapter();

  const allAnswered = chapter.questions?.every(
    (_, i) => selectedAnswers[i] !== undefined
  ) ?? false;

  const handleSubmit = async () => {
    if (!allAnswered) {
      const unansweredCount = chapter.questions.filter(
        (_, i) => !selectedAnswers[i]
      ).length;
      setError(
        `Please answer all questions before submitting. ${unansweredCount} question(s) remaining.`
      );
      return;
    }

    if (submissionType === 'text' && !textContent.trim()) {
      setError('Please provide text content for your submission');
      return;
    }

    if (
      (submissionType === 'video' || submissionType === 'pdf') &&
      !selectedFile
    ) {
      setError(`Please select a ${submissionType} file`);
      return;
    }

    if (submissionType === 'text' && textContent.trim().length < 10) {
      setError('Text submission must be at least 10 characters');
      return;
    }

    if (!gradeData) {
      setError('Unable to get grade information');
      return;
    }

    setError(null);

    try {
      const score = calculateQuizScore(chapter.questions, selectedAnswers);

      const answers: Answer[] = chapter.questions.map((q, i) => ({
        questionText: q.questionText,
        selectedAnswer: selectedAnswers[i] || '',
      }));

      await submitMutation.mutateAsync({
        chapterId: chapter._id,
        gradeId: gradeData._id,
        answers,
        submissionType,
        submissionFile: selectedFile ?? undefined,
        submissionContent: submissionType === 'text' ? textContent : undefined,
      });

      onSubmitSuccess({ score });
      toast.success(`Chapter submitted successfully! Your score: ${score}%`, {
        duration: 5000,
      });
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        'Failed to submit chapter';
      setError(errorMessage);
      console.error('Submission error:', err.response?.data || err);
    }
  };

  return (
    <Card className="border-0 shadow-lg rounded-2xl overflow-hidden bg-white/70 backdrop-blur-sm">
      <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-100 p-4 sm:p-6">
        <CardTitle className="text-lg sm:text-xl md:text-2xl flex items-center gap-2 sm:gap-3 text-gray-800">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center flex-shrink-0">
            <Target className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <span>Quiz & Submission</span>
        </CardTitle>
        <CardDescription className="text-gray-600 text-sm sm:text-base">
          Answer all questions and provide your submission to complete this
          chapter.
        </CardDescription>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8">
        {/* Quiz Questions */}
        <QuizSection
          questions={chapter.questions}
          selectedAnswers={selectedAnswers}
          submitted={submitted}
          onAnswerChange={onAnswerChange}
        />

        {/* Submission Section - Only show if not submitted */}
        {!submitted && (
          <SubmissionForm
            submissionType={submissionType}
            textContent={textContent}
            selectedFile={selectedFile}
            loading={submitMutation.isPending}
            onTypeChange={setSubmissionType}
            onTextChange={setTextContent}
            onFileSelect={setSelectedFile}
            onError={setError}
          />
        )}

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Submit Button or Results */}
        {!submitted ? (
          <Button
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium px-6 sm:px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            disabled={submitMutation.isPending}
            onClick={handleSubmit}
          >
            {submitMutation.isPending ? (
              <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin mr-2" />
            ) : (
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            )}
            <span className="text-sm sm:text-base">Submit Chapter</span>
          </Button>
        ) : (
          <QuizResults
            score={currentScore}
            totalQuestions={chapter.questions.length}
            hasNextChapter={hasNextChapter}
            onRetake={onRetake}
            onNextChapter={onNextChapter}
          />
        )}
      </CardContent>
    </Card>
  );
};