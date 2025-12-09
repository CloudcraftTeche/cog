"use client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Sparkles } from "lucide-react";
import { IQuestion } from "@/types/assignment.types";

interface QuestionFormProps {
  questions: IQuestion[];
  answers: Record<number, string>;
  onAnswerChange: (questionIndex: number, answer: string) => void;
  disabled?: boolean;
  showResults?: boolean;
}

export function QuestionForm({
  questions,
  answers,
  onAnswerChange,
  disabled = false,
  showResults = false,
}: QuestionFormProps) {
  const answeredCount = Object.keys(answers).length;
  const totalQuestions = questions.length;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-muted/50 to-transparent">
        <div className="flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-primary" />
          <span className="font-semibold text-foreground">Progress</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-32 h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-success transition-all duration-500"
              style={{ width: `${(answeredCount / totalQuestions) * 100}%` }}
            />
          </div>
          <Badge className="bg-gradient-to-r from-primary to-info text-white border-0 px-3">
            {answeredCount} / {totalQuestions}
          </Badge>
        </div>
      </div>

      <div className="space-y-5">
        {questions.map((question, index) => {
          const selectedAnswer = answers[index];
          const isAnswered = !!selectedAnswer;
          const isCorrect =
            showResults && selectedAnswer === question.correctAnswer;
          const isIncorrect =
            showResults &&
            selectedAnswer &&
            selectedAnswer !== question.correctAnswer;

          return (
            <Card
              key={index}
              className={`transition-all duration-300 border-2 overflow-hidden ${
                isAnswered && !showResults
                  ? "border-primary/30 shadow-lg shadow-primary/5"
                  : "border-border/50"
              } ${showResults && isCorrect ? "border-success/50 shadow-lg shadow-success/10" : ""} ${
                showResults && isIncorrect
                  ? "border-destructive/50 shadow-lg shadow-destructive/10"
                  : ""
              }`}
            >
              <CardHeader
                className={`pb-4 ${
                  isAnswered && !showResults
                    ? "bg-gradient-to-r from-primary/5 to-transparent"
                    : showResults && isCorrect
                      ? "bg-gradient-to-r from-success/10 to-transparent"
                      : showResults && isIncorrect
                        ? "bg-gradient-to-r from-destructive/10 to-transparent"
                        : ""
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-xl text-sm font-bold shrink-0 transition-all ${
                      isAnswered && !showResults
                        ? "bg-gradient-to-br from-primary to-info text-white shadow-md"
                        : showResults && isCorrect
                          ? "bg-gradient-to-br from-success to-primary text-white shadow-md"
                          : showResults && isIncorrect
                            ? "bg-gradient-to-br from-destructive to-warning text-white shadow-md"
                            : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {index + 1}
                  </div>
                  <p className="text-base font-semibold leading-relaxed text-foreground pt-1.5">
                    {question.questionText}
                  </p>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <RadioGroup
                  value={selectedAnswer}
                  onValueChange={(value) => onAnswerChange(index, value)}
                  disabled={disabled}
                  className="space-y-3"
                >
                  {question.options.map((option, optionIndex) => {
                    const optionLetter = String.fromCharCode(65 + optionIndex);
                    const isSelected = selectedAnswer === option;
                    const isCorrectOption =
                      showResults && option === question.correctAnswer;
                    const isWrongSelected =
                      showResults &&
                      isSelected &&
                      option !== question.correctAnswer;

                    return (
                      <div
                        key={optionIndex}
                        className={`flex items-center space-x-4 p-4 rounded-xl border-2 transition-all cursor-pointer ${
                          disabled
                            ? "cursor-not-allowed opacity-70"
                            : "hover:bg-accent/50 hover:border-primary/30"
                        } ${isSelected && !showResults ? "border-primary bg-primary/5 shadow-md" : "border-border/50"} ${
                          isCorrectOption
                            ? "border-success bg-success/10 shadow-md"
                            : ""
                        } ${isWrongSelected ? "border-destructive bg-destructive/10 shadow-md" : ""}`}
                      >
                        <RadioGroupItem
                          value={option}
                          id={`q${index}-opt${optionIndex}`}
                          className="shrink-0"
                        />
                        <Label
                          htmlFor={`q${index}-opt${optionIndex}`}
                          className="flex items-center gap-3 cursor-pointer flex-1"
                        >
                          <span
                            className={`w-8 h-8 rounded-lg text-sm font-bold flex items-center justify-center shrink-0 transition-all ${
                              isSelected && !showResults
                                ? "bg-gradient-to-br from-primary to-info text-white"
                                : isCorrectOption
                                  ? "bg-gradient-to-br from-success to-primary text-white"
                                  : isWrongSelected
                                    ? "bg-gradient-to-br from-destructive to-warning text-white"
                                    : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {optionLetter}
                          </span>
                          <span className="text-sm font-medium">{option}</span>
                          {isCorrectOption && (
                            <CheckCircle2 className="w-5 h-5 text-success ml-auto shrink-0" />
                          )}
                          {isWrongSelected && (
                            <XCircle className="w-5 h-5 text-destructive ml-auto shrink-0" />
                          )}
                        </Label>
                      </div>
                    );
                  })}
                </RadioGroup>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
