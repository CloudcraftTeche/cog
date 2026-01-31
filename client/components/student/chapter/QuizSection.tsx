import React from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import type { Question } from '@/types/student/chapter.types';

interface QuizSectionProps {
  questions: Question[];
  selectedAnswers: Record<number, string>;
  submitted: boolean;
  onAnswerChange: (questionIndex: number, answer: string) => void;
}

export const QuizSection: React.FC<QuizSectionProps> = ({
  questions,
  selectedAnswers,
  submitted,
  onAnswerChange,
}) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-800">Quiz Questions</h3>
      {questions.map((q, index) => (
        <div key={index} className="space-y-3 sm:space-y-4">
          <p className="font-semibold text-base sm:text-lg text-gray-800">
            Q{index + 1}: {q.questionText}
          </p>
          <RadioGroup
            value={selectedAnswers[index] || ''}
            onValueChange={(val) => onAnswerChange(index, val)}
            className="space-y-2 sm:space-y-3"
          >
            {q.options.map((opt, optIndex) => {
              const optionLabel = String.fromCharCode(65 + optIndex);
              const isSelected = selectedAnswers[index] === opt;
              const isCorrectOption = opt === q.correctAnswer;

              let optionClasses =
                'flex items-center gap-2 sm:gap-3 border-2 p-3 sm:p-4 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md';

              if (submitted) {
                if (isCorrectOption) {
                  optionClasses +=
                    ' border-green-400 bg-green-50 shadow-green-100';
                } else if (isSelected && !isCorrectOption) {
                  optionClasses += ' border-red-400 bg-red-50 shadow-red-100';
                } else {
                  optionClasses += ' border-gray-200 bg-gray-50';
                }
              } else {
                if (isSelected) {
                  optionClasses +=
                    ' border-purple-400 bg-purple-50 shadow-purple-100';
                } else {
                  optionClasses +=
                    ' border-gray-200 bg-white hover:border-purple-300';
                }
              }

              const optionId = `question-${index}-option-${optionLabel}`;

              return (
                <div key={opt} className={optionClasses}>
                  <RadioGroupItem
                    value={opt}
                    id={optionId}
                    disabled={submitted}
                    className="text-purple-600 flex-shrink-0"
                  />
                  <label
                    htmlFor={optionId}
                    className="text-gray-700 font-medium w-full cursor-pointer text-sm sm:text-base"
                  >
                    <span className="font-bold text-purple-600 mr-2">
                      {optionLabel}.
                    </span>
                    {opt}
                  </label>
                </div>
              );
            })}
          </RadioGroup>
        </div>
      ))}
    </div>
  );
};