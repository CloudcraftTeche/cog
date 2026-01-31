// components/chapters/QuizResults.tsx
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface QuizResultsProps {
  score: number;
  totalQuestions: number;
  hasNextChapter: boolean;
  onRetake: () => void;
  onNextChapter: () => void;
}

export const QuizResults: React.FC<QuizResultsProps> = ({
  score,
  totalQuestions,
  hasNextChapter,
  onRetake,
  onNextChapter,
}) => {
  const correctAnswers = Math.round((score / 100) * totalQuestions);

  return (
    <div className="flex flex-col gap-4 sm:gap-6 mt-4 sm:mt-6">
      {/* Score Display */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 border-2 border-indigo-200">
        <div className="flex flex-col items-center gap-4">
          <h3 className="text-lg font-semibold text-gray-800">Your Results</h3>
          <div
            className={`px-6 sm:px-8 py-3 sm:py-4 rounded-xl border-2 text-xl sm:text-2xl font-bold shadow-lg ${
              score >= 70
                ? 'bg-green-50 border-green-400 text-green-800 shadow-green-100'
                : score >= 50
                ? 'bg-yellow-50 border-yellow-400 text-yellow-800 shadow-yellow-100'
                : 'bg-red-50 border-red-400 text-red-800 shadow-red-100'
            }`}
          >
            Score: {score}%
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">
              You answered{' '}
              <span className="font-semibold text-gray-800">
                {correctAnswers}
              </span>{' '}
              out of{' '}
              <span className="font-semibold text-gray-800">
                {totalQuestions}
              </span>{' '}
              questions correctly
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
        <Button
          variant="outline"
          onClick={onRetake}
          className="w-full sm:w-auto bg-white border-2 border-gray-300 hover:border-purple-400 hover:bg-purple-50 text-gray-700 font-medium px-4 sm:px-6 py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
        >
          <span className="text-sm sm:text-base">Retake Quiz</span>
        </Button>
        <Button
          onClick={onNextChapter}
          className="w-full sm:w-auto bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white font-medium px-4 sm:px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
        >
          <span className="text-sm sm:text-base">
            {hasNextChapter ? 'Next Chapter' : 'View All Chapters'}
          </span>
          <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            window.location.href = '/dashboard/student/assignments';
          }}
          className="w-full sm:w-auto bg-white border-2 border-gray-300 hover:border-purple-400 hover:bg-purple-50 text-gray-700 font-medium px-4 sm:px-6 py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
        >
          <span className="text-sm sm:text-base">Assignments</span>
        </Button>
      </div>
    </div>
  );
};