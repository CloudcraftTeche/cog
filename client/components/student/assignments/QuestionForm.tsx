"use client"

import { CheckCircle2, X, Target } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { IQuestion } from "@/types/assignment.types";

interface QuestionFormProps {
  questions: IQuestion[];
  answers: Record<number, string>;
  onAnswerChange: (index: number, answer: string) => void;
  disabled?: boolean;
  showResults?: boolean;
}

export function QuestionForm({ 
  questions, 
  answers, 
  onAnswerChange, 
  disabled = false,
  showResults = false
}: QuestionFormProps) {
  return (
    <div className="space-y-6 sm:space-y-8">
      {questions.map((question, index) => (
        <div 
          key={index} 
          className="relative bg-gradient-to-br from-white via-indigo-50/30 to-purple-50/30 rounded-2xl p-5 sm:p-6 md:p-8 border-2 border-gray-100 shadow-lg hover:shadow-2xl transition-all duration-300"
        >
          {/* Decorative gradient overlay */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-400/10 to-purple-400/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-pink-400/10 to-purple-400/10 rounded-full blur-3xl pointer-events-none" />
          
          {/* Question Header */}
          <div className="flex items-start gap-3 sm:gap-4 mb-4 sm:mb-6 relative z-10">
            <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 text-white rounded-2xl flex items-center justify-center font-bold text-base sm:text-lg shadow-lg shadow-indigo-500/30">
              {index + 1}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-gray-900 text-base sm:text-lg md:text-xl leading-relaxed">
                Q{index + 1}: {question.questionText}
              </p>
            </div>
          </div>

          {/* Options */}
          <div className="relative z-10">
            <RadioGroup
              value={answers[index] || ""}
              onValueChange={(val) => !disabled && onAnswerChange(index, val)}
              className="space-y-3 sm:space-y-4"
            >
              {question.options.map((option, optIndex) => {
                const optionLabel = String.fromCharCode(65 + optIndex);
                const isSelected = answers[index] === option;
                const isCorrect = showResults && option === question.correctAnswer;
                const isWrong = showResults && isSelected && option !== question.correctAnswer;

                let optionClasses =
                  "flex items-center gap-3 sm:gap-4 border-2 p-3 sm:p-4 md:p-5 rounded-xl transition-all duration-200";

                if (showResults) {
                  if (isCorrect) {
                    optionClasses += " border-green-400 bg-gradient-to-r from-green-50 to-emerald-50 shadow-lg shadow-green-100";
                  } else if (isWrong) {
                    optionClasses += " border-red-400 bg-gradient-to-r from-red-50 to-rose-50 shadow-lg shadow-red-100";
                  } else {
                    optionClasses += " border-gray-200 bg-white/50";
                  }
                } else {
                  if (isSelected) {
                    optionClasses += " border-purple-400 bg-gradient-to-r from-purple-50 to-pink-50 shadow-lg shadow-purple-100 ring-2 ring-purple-300 ring-offset-2";
                  } else {
                    optionClasses += " border-gray-200 bg-white hover:border-purple-300 hover:shadow-md cursor-pointer";
                  }
                }

                if (disabled) {
                  optionClasses += " cursor-not-allowed opacity-75";
                } else if (!showResults) {
                  optionClasses += " hover:scale-[1.01]";
                }

                const optionId = `question-${index}-option-${optionLabel}`;

                return (
                  <div key={option} className={optionClasses}>
                    <RadioGroupItem
                      value={option}
                      id={optionId}
                      disabled={disabled}
                      className="text-purple-600 border-2 w-5 h-5 flex-shrink-0"
                    />
                    <label
                      htmlFor={optionId}
                      className={`flex-1 font-medium w-full text-sm sm:text-base ${
                        disabled ? 'cursor-not-allowed' : 'cursor-pointer'
                      }`}
                    >
                      <span className="font-bold text-purple-600 mr-2">
                        {optionLabel}.
                      </span>
                      <span className={isSelected && !showResults ? 'text-gray-900' : 'text-gray-700'}>
                        {option}
                      </span>
                    </label>
                    
                    {/* Result Badges */}
                    {showResults && isCorrect && (
                      <div className="flex items-center gap-2 bg-green-100 px-3 py-1.5 rounded-full border border-green-300 flex-shrink-0">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        <span className="text-xs font-bold text-green-700 hidden sm:inline">Correct</span>
                      </div>
                    )}
                    {showResults && isWrong && (
                      <div className="flex items-center gap-2 bg-red-100 px-3 py-1.5 rounded-full border border-red-300 flex-shrink-0">
                        <X className="w-4 h-4 text-red-600" />
                        <span className="text-xs font-bold text-red-700 hidden sm:inline">Wrong</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </RadioGroup>
          </div>

          {/* Correct Answer Display */}
          {showResults && (
            <div className={`mt-4 sm:mt-6 p-4 sm:p-5 rounded-xl border-2 ${
              answers[index] === question.correctAnswer 
                ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-300 shadow-lg shadow-green-100' 
                : 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-300 shadow-lg shadow-amber-100'
            }`}>
              <div className="flex items-center gap-2 sm:gap-3">
                <Target className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" />
                <p className="text-sm sm:text-base font-bold text-gray-900">
                  Correct Answer: 
                  <span className="ml-2 text-green-700 bg-green-100 px-3 py-1 rounded-lg border border-green-200">
                    {question.correctAnswer}
                  </span>
                </p>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}