"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
export interface EditQuestion {
  id: string;
  questionText: string;
  options: string[];
  correctAnswer: string;
}
interface EditQuestionsSectionProps {
  questions: EditQuestion[];
  setQuestions: React.Dispatch<React.SetStateAction<EditQuestion[]>>;
  errors?: {
    questions?: string;
  };
}
const OPTION_LABELS = ["A", "B", "C", "D"];
export default function EditQuestionsSection({ questions, setQuestions, errors = {} }: EditQuestionsSectionProps) {
  const addQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        questionText: "",
        options: ["", "", "", ""],
        correctAnswer: "",
      },
    ]);
    toast.success("New question added");
  };
  const removeQuestion = (id: string) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((q) => q.id !== id));
      toast.success("Question removed");
    } else {
      toast.warning("Cannot remove last question", {
        description: "At least one question is required",
      });
    }
  };
  const updateQuestion = (id: string, field: keyof EditQuestion, value: any) => {
    setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, [field]: value } : q)));
  };
  const updateOption = (qId: string, optionIndex: number, text: string) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id === qId) {
          const newOptions = [...q.options];
          newOptions[optionIndex] = text;
          return { ...q, options: newOptions };
        }
        return q;
      })
    );
  };
  return (
    <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm rounded-3xl overflow-hidden">
      <CardHeader className="pb-6 bg-gradient-to-r from-purple-500 to-pink-600 text-white p-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center space-x-3 mb-3">
              <Badge className="bg-white/20 text-white border-white/30 px-4 py-2 rounded-full font-semibold">
                Quiz Questions
              </Badge>
            </div>
            <CardTitle className="text-2xl font-bold">Assessment Questions</CardTitle>
            <p className="text-purple-100 text-lg font-medium mt-2">
              Edit questions to test student understanding
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={addQuestion}
            className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-white/30 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border-2 rounded-xl px-6 py-3"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Question
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-8 p-8">
        {errors.questions && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-sm text-red-600">{errors.questions}</p>
          </div>
        )}
        {questions.map((question, questionIndex) => (
          <div
            key={question.id}
            className="border-2 border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6 bg-gradient-to-r from-slate-50/50 to-blue-50/30 shadow-lg"
          >
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-xl text-slate-800 flex items-center">
                <span className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl flex items-center justify-center text-lg mr-3 shadow-lg">
                  {questionIndex + 1}
                </span>
                Question {questionIndex + 1}
              </h4>
              {questions.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeQuestion(question.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl p-3"
                >
                  <Trash2 className="w-5 h-5" />
                </Button>
              )}
            </div>
            <div className="space-y-3">
              <Label className="text-lg font-semibold text-slate-700">
                Question <span className="text-red-500">*</span>
              </Label>
              <Input
                placeholder="Enter your question..."
                value={question.questionText}
                onChange={(e) => updateQuestion(question.id, "questionText", e.target.value)}
                className="h-12 border-2 border-slate-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl text-lg"
                required
              />
            </div>
            <div className="space-y-4">
              <Label className="text-lg font-semibold text-slate-700">
                Answer Options <span className="text-red-500">*</span>
              </Label>
              <RadioGroup
                value={question.correctAnswer}
                onValueChange={(value: string) => updateQuestion(question.id, "correctAnswer", value)}
              >
                {question.options.map((option, optionIndex) => (
                  <div
                    key={optionIndex}
                    className={`flex items-center space-x-4 p-4 rounded-2xl border-2 transition-all duration-300 ${
                      option && question.correctAnswer === option
                        ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-300 shadow-lg"
                        : "bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                    }`}
                  >
                    <RadioGroupItem
                      value={option}
                      id={`${question.id}-${optionIndex}`}
                      className="text-blue-600 w-5 h-5"
                      disabled={!option || !option.trim()}
                    />
                    <div className="flex items-center gap-3 flex-1">
                      <span className="font-semibold text-gray-600 min-w-[30px]">
                        {OPTION_LABELS[optionIndex]}.
                      </span>
                      <Input
                        placeholder={`Option ${OPTION_LABELS[optionIndex]}`}
                        value={option}
                        onChange={(e) => updateOption(question.id, optionIndex, e.target.value)}
                        className="flex-1 border-0 bg-transparent focus:ring-0 focus:border-0 text-lg"
                        required
                      />
                    </div>
                    {option && question.correctAnswer === option && (
                      <Badge className="bg-gradient-to-r from-green-400 to-emerald-500 text-white px-3 py-1 rounded-full font-semibold">
                        Correct Answer
                      </Badge>
                    )}
                  </div>
                ))}
              </RadioGroup>
              <p className="text-sm text-gray-500 mt-2">
                Fill in all options and select the correct answer by clicking the radio button
              </p>
            </div>
          </div>
        ))}
        {questions.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No questions added yet</p>
            <Button
              type="button"
              onClick={addQuestion}
              className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add First Question
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}