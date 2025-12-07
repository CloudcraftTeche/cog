"use client";
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Sparkles, Plus, Trash2, FileUp } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
export interface Question {
  id: string;
  questionText: string;
  options: string[];
  correctAnswer: string;
}
interface QuestionsSectionProps {
  questions: Question[];
  setQuestions: React.Dispatch<React.SetStateAction<Question[]>>;
  errors?: {
    questions?: string;
  };
}
const OPTION_LABELS = ["A", "B", "C", "D"];
export default function QuestionsSection({ questions, setQuestions, errors = {} }: QuestionsSectionProps) {
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
  };
  const removeQuestion = (id: string) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((q) => q.id !== id));
    } else {
      toast.warning("Cannot remove last question", {
        description: "You must have at least one question.",
      });
    }
  };
  const updateQuestion = (id: string, field: keyof Question, value: any) => {
    setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, [field]: value } : q)));
  };
  const updateOption = (qId: string, idx: number, value: string) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id === qId) {
          const newOptions = [...q.options];
          newOptions[idx] = value;
          return { ...q, options: newOptions };
        }
        return q;
      })
    );
  };
  const handleExcelUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as string[][];
        if (json.length < 2) {
          toast.error("Excel Import Error", {
            description: "No data found in the Excel file.",
          });
          return;
        }
        const headerRow = json[0];
        const questionColIndex = headerRow.findIndex((h) => h?.toLowerCase().includes("question"));
        const correctAnswerColIndex = headerRow.findIndex((h) => h?.toLowerCase().includes("correct"));
        if (questionColIndex === -1 || correctAnswerColIndex === -1) {
          toast.error("Excel Format Error", {
            description: "Missing 'Question' or 'Correct Answer' column.",
          });
          return;
        }
        const newQuestions: Question[] = [];
        json.slice(1).forEach((row, rowIndex) => {
          const questionText = row[questionColIndex]?.toString().trim() || "";
          const correctAnswerLabel = row[correctAnswerColIndex]?.toString().trim().toUpperCase() || "";
          const optionsFromExcel: string[] = [];
          for (let i = questionColIndex + 1; i < correctAnswerColIndex; i++) {
            if (row[i] !== undefined && row[i] !== null && row[i].toString().trim() !== "") {
              optionsFromExcel.push(row[i].toString().trim());
            }
          }
          const fixedOptions: string[] = Array(4).fill("");
          optionsFromExcel.slice(0, 4).forEach((opt, idx) => {
            fixedOptions[idx] = opt;
          });
          if (!questionText || fixedOptions.filter(Boolean).length < 2 || !correctAnswerLabel) {
            toast.warning("Skipping Row", {
              description: `Row ${rowIndex + 2} was skipped.`,
            });
            return;
          }
          const labelIndex = OPTION_LABELS.indexOf(correctAnswerLabel);
          let correctAnswer = "";
          if (labelIndex !== -1 && fixedOptions[labelIndex]) {
            correctAnswer = fixedOptions[labelIndex];
          } else {
            toast.warning("Invalid Correct Answer", {
              description: `Row ${rowIndex + 2}: Using first option as correct answer.`,
            });
            correctAnswer = fixedOptions.find(opt => opt) || "";
          }
          newQuestions.push({
            id: Date.now().toString() + rowIndex,
            questionText,
            options: fixedOptions,
            correctAnswer,
          });
        });
        if (newQuestions.length > 0) {
          setQuestions(newQuestions);
          toast.success("Excel Imported", {
            description: `${newQuestions.length} questions loaded.`,
          });
        }
      } catch (error) {
        toast.error("Excel Import Error", {
          description: "Failed to read Excel file.",
        });
      }
    };
    reader.readAsArrayBuffer(file);
  };
  return (
    <Card className="shadow-lg border-0 bg-white rounded-3xl overflow-hidden">
      <div className="h-2 bg-gradient-to-r from-orange-500 to-red-500"></div>
      <CardHeader className="pb-4 bg-gradient-to-br from-orange-50 to-red-50">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <Badge variant="secondary" className="bg-gradient-to-r from-orange-100 to-red-100 text-orange-700 border-0 px-4 py-1 rounded-full">
                Quiz
              </Badge>
            </div>
            <CardTitle className="text-2xl bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Assessment Questions
            </CardTitle>
            <CardDescription className="text-slate-600 text-base">
              Create questions to test student understanding
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 p-8">
        <div className="grid gap-2 mb-4">
          <Label htmlFor="excel-upload" className="text-sm font-semibold text-slate-700 flex items-center">
            <FileUp className="w-5 h-5 mr-2" /> Import Questions from Excel
          </Label>
          <Input
            id="excel-upload"
            type="file"
            accept=".xlsx, .xls"
            onChange={handleExcelUpload}
            className="cursor-pointer h-12 border-2 border-slate-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-100 rounded-xl transition-all duration-300"
          />
        </div>
        {errors.questions && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
            <p className="text-sm text-red-600 font-medium">{errors.questions}</p>
          </div>
        )}
        {questions.map((question, questionIndex) => (
          <div
            key={question.id}
            className="border border-slate-200 rounded-xl p-4 sm:p-6 space-y-4 bg-slate-50/30"
          >
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-slate-800 flex items-center">
                <span className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-sm mr-2">
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
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700">
                Question <span className="text-red-500">*</span>
              </Label>
              <Input
                placeholder="Enter your question..."
                value={question.questionText}
                onChange={(e) => updateQuestion(question.id, "questionText", e.target.value)}
                className="h-10 sm:h-11 border-slate-200 focus:border-blue-500 focus:ring-blue-100 rounded-lg transition-all duration-300"
              />
            </div>
            <div className="space-y-3">
              <Label className="text-sm font-medium text-slate-700">
                Answer Options <span className="text-red-500">*</span>
              </Label>
              <RadioGroup
                value={question.correctAnswer}
                onValueChange={(value: string) => updateQuestion(question.id, "correctAnswer", value)}
              >
                {question.options.map((option, optionIndex) => {
                  const label = OPTION_LABELS[optionIndex];
                  return (
                    <div
                      key={optionIndex}
                      className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors ${
                        option && question.correctAnswer === option
                          ? "bg-green-50 border-green-200"
                          : "bg-white border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <RadioGroupItem
                        value={option}
                        id={`${question.id}-${optionIndex}`}
                        className="text-blue-600"
                        disabled={!option || !option.trim()}
                      />
                      <div className="flex items-center gap-2 flex-1">
                        <span className="font-semibold text-gray-600 min-w-[25px]">{label}.</span>
                        <Input
                          placeholder={`Option ${label}`}
                          value={option}
                          onChange={(e) => updateOption(question.id, optionIndex, e.target.value)}
                          className="flex-1 border-0 bg-transparent focus:ring-0 focus:border-0"
                        />
                      </div>
                      {option && question.correctAnswer === option && (
                        <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
                          Correct
                        </Badge>
                      )}
                    </div>
                  );
                })}
              </RadioGroup>
              <p className="text-xs text-gray-500 mt-1">
                Fill in all options and select the correct answer by clicking the radio button
              </p>
            </div>
          </div>
        ))}
        <div className="w-full flex sm:justify-end justify-center">
          <Button
            type="button"
            variant="outline"
            onClick={addQuestion}
            className="border-blue-200 text-blue-700 hover:bg-blue-50 bg-transparent rounded-lg px-6 py-3 transition-all duration-300"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Question
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}