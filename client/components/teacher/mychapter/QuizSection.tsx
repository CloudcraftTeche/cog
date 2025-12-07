import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2, Target, ArrowRight } from "lucide-react";
import { Question, TeacherChapter } from "@/utils/teacherChapter.service";
interface QuizSectionProps {
  chapter: TeacherChapter;
  selectedAnswers: Record<number, string>;
  submitted: boolean;
  submitting: boolean;
  currentScore: number;
  onAnswerChange: (questionIndex: number, answer: string) => void;
  onSubmit: () => void;
  onRetake: () => void;
  onNextChapter: () => void;
}
export default function QuizSection({
  chapter,
  selectedAnswers,
  submitted,
  submitting,
  currentScore,
  onAnswerChange,
  onSubmit,
  onRetake,
  onNextChapter,
}: QuizSectionProps) {
  const allAnswered = chapter.questions?.every(
    (_, i) => selectedAnswers[i] !== undefined
  );
  return (
    <Card className="border-0 shadow-lg rounded-2xl overflow-hidden bg-white/70 backdrop-blur-sm">
      <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-100 p-4 sm:p-6">
        <CardTitle className="text-lg sm:text-xl md:text-2xl flex items-center gap-2 sm:gap-3 text-gray-800">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center flex-shrink-0">
            <Target className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <span>Quiz</span>
        </CardTitle>
        <CardDescription className="text-gray-600 text-sm sm:text-base">
          Answer the questions below to complete this chapter.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8">
        {chapter.questions.map((q: Question, index: number) => (
          <div key={index} className="space-y-3 sm:space-y-4">
            <p className="font-semibold text-base sm:text-lg text-gray-800">
              Q{index + 1}: {q.questionText}
            </p>
            <RadioGroup
              value={selectedAnswers[index] || ""}
              onValueChange={(val) => onAnswerChange(index, val)}
              className="space-y-2 sm:space-y-3"
            >
              {q.options.map((opt: string, optIndex: number) => {
                const optionLabel = String.fromCharCode(65 + optIndex);
                const isSelected = selectedAnswers[index] === opt;
                const isCorrectOption = opt === q.correctAnswer;
                let optionClasses =
                  "flex items-center gap-2 sm:gap-3 border-2 p-3 sm:p-4 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md";
                if (submitted) {
                  if (isCorrectOption) {
                    optionClasses += " border-green-400 bg-green-50 shadow-green-100";
                  } else if (isSelected && !isCorrectOption) {
                    optionClasses += " border-red-400 bg-red-50 shadow-red-100";
                  } else {
                    optionClasses += " border-gray-200 bg-gray-50";
                  }
                } else {
                  if (isSelected) {
                    optionClasses += " border-purple-400 bg-purple-50 shadow-purple-100";
                  } else {
                    optionClasses += " border-gray-200 bg-white hover:border-purple-300";
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
        {!submitted ? (
          <Button
            className="w-full sm:w-auto bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium px-6 sm:px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            disabled={!allAnswered || submitting}
            onClick={onSubmit}
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin mr-2" />
            ) : (
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            )}
            <span className="text-sm sm:text-base">Submit Quiz</span>
          </Button>
        ) : (
          <div className="flex flex-col gap-4 sm:gap-6 mt-4 sm:mt-6">
            <div className="flex justify-center">
              <div
                className={`px-4 sm:px-6 py-2 sm:py-3 rounded-xl border-2 text-base sm:text-lg font-bold shadow-lg ${
                  currentScore >= 70
                    ? "bg-green-50 border-green-300 text-green-800 shadow-green-100"
                    : currentScore >= 50
                    ? "bg-yellow-50 border-yellow-300 text-yellow-800 shadow-yellow-100"
                    : "bg-red-50 border-red-300 text-red-800 shadow-red-100"
                }`}
              >
                Score: {currentScore}%
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Button
                variant="outline"
                onClick={onRetake}
                className="w-full sm:w-auto bg-white border-2 border-gray-300 hover:border-purple-400 hover:bg-purple-50 text-gray-700 font-medium px-4 sm:px-6 py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
              >
                <span className="text-sm sm:text-base">Retake Quiz</span>
              </Button>
              {chapter.isCompleted && (
                <Button
                  onClick={onNextChapter}
                  className="w-full sm:w-auto bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white font-medium px-4 sm:px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  <span className="text-sm sm:text-base">Next Chapter</span>
                  <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}