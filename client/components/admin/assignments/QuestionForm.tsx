"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Trash2, Plus, FileUp } from "lucide-react";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import { IQuestion } from "@/lib/assignmentValidation";
interface QuestionFormProps {
  questions: IQuestion[];
  onQuestionsChange: (questions: IQuestion[]) => void;
  errors?: Record<string, string>;
}
export const QuestionForm: React.FC<QuestionFormProps> = ({
  questions,
  onQuestionsChange,
  errors = {},
}) => {
  const labels = ["A", "B", "C", "D"];
  const addQuestion = () => {
    const newQuestion: IQuestion = {
      questionText: "",
      options: ["", "", "", ""],
      correctAnswer: "A",
    };
    onQuestionsChange([...questions, newQuestion]);
  };
  const removeQuestion = (index: number) => {
    if (questions.length <= 1) {
      toast.warning("Cannot remove last question");
      return;
    }
    onQuestionsChange(questions.filter((_, i) => i !== index));
  };
  const updateQuestion = (index: number, field: keyof IQuestion, value: any) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    onQuestionsChange(updated);
  };
  const updateOption = (qIndex: number, optIndex: number, text: string) => {
    const updated = [...questions];
    const newOptions = [...updated[qIndex].options];
    newOptions[optIndex] = text;
    updated[qIndex].options = newOptions;
    onQuestionsChange(updated);
  };
  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as string[][];
      if (rows.length < 2) {
        toast.error("No data found in Excel file");
        return;
      }
      const headers = rows[0];
      const qIndex = headers.indexOf("Question");
      const ansIndex = headers.indexOf("Correct Answer");
      if (qIndex === -1 || ansIndex === -1) {
        toast.error("Excel must have 'Question' and 'Correct Answer' columns");
        return;
      }
      const newQuestions: IQuestion[] = [];
      const labels = ["A", "B", "C", "D"];
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        const questionText = row[qIndex]?.toString().trim();
        const correctAnswer = row[ansIndex]?.toString().trim().toUpperCase();
        if (!questionText) continue;
        const options: string[] = [];
        for (let j = qIndex + 1; j < ansIndex && j < row.length; j++) {
          const text = row[j]?.toString()?.trim();
          if (text) {
            options.push(text);
          }
        }
        while (options.length < 4) {
          options.push("");
        }
        const answerLabel = labels.includes(correctAnswer) ? correctAnswer : "A";
        newQuestions.push({
          questionText,
          options: options.slice(0, 4),
          correctAnswer: answerLabel,
        });
      }
      if (newQuestions.length > 0) {
        onQuestionsChange(newQuestions);
        toast.success(`Imported ${newQuestions.length} questions from Excel`);
      } else {
        toast.warning("No valid questions found in Excel file");
      }
    } catch (error) {
      console.error("Excel import error:", error);
      toast.error("Failed to import Excel file");
    }
    e.target.value = "";
  };
  return (
    <div className="space-y-6">
      {}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border-2 border-blue-200">
        <Label htmlFor="excel-upload" className="flex items-center gap-2 text-sm font-semibold text-blue-900 mb-2">
          <FileUp className="h-5 w-5" />
          Import Questions from Excel
        </Label>
        <Input
          id="excel-upload"
          type="file"
          accept=".xlsx,.xls"
          onChange={handleExcelUpload}
          className="bg-white cursor-pointer"
        />
        <p className="text-xs text-blue-700 mt-2">
          Excel should have columns: Question, Option A, Option B, Option C, Option D, Correct Answer
        </p>
      </div>
      {}
      <div className="space-y-4">
        {questions.map((question, qIndex) => (
          <div
            key={qIndex}
            className="border-2 border-gray-200 rounded-xl p-6 bg-white shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-md">
                  {qIndex + 1}
                </span>
                <h4 className="font-semibold text-gray-900">Question {qIndex + 1}</h4>
              </div>
              {questions.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeQuestion(qIndex)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
            {}
            <div className="space-y-2 mb-4">
              <Label className="text-sm font-semibold text-gray-700">
                Question Text *
              </Label>
              <Input
                value={question.questionText}
                onChange={(e) => updateQuestion(qIndex, "questionText", e.target.value)}
                placeholder="Enter your question..."
                className={`${
                  errors[`questions[${qIndex}].questionText`]
                    ? "border-red-500 focus:border-red-500"
                    : ""
                }`}
              />
              {errors[`questions[${qIndex}].questionText`] && (
                <p className="text-xs text-red-600">
                  {errors[`questions[${qIndex}].questionText`]}
                </p>
              )}
            </div>
            {}
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-gray-700">
                Answer Options *
              </Label>
              <RadioGroup
                value={question.correctAnswer}
                onValueChange={(value) => updateQuestion(qIndex, "correctAnswer", value)}
              >
                {question.options.map((optionText, optIndex) => (
                  <div
                    key={optIndex}
                    className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                      labels[optIndex] === question.correctAnswer
                        ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-300"
                        : "bg-white border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <RadioGroupItem value={labels[optIndex]} className="text-blue-600" />
                    <div className="flex-1 flex items-center gap-2">
                      <span className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-semibold text-gray-700">
                        {labels[optIndex]}
                      </span>
                      <Input
                        value={optionText}
                        onChange={(e) => updateOption(qIndex, optIndex, e.target.value)}
                        placeholder={`Option ${labels[optIndex]}`}
                        className="border-0 bg-transparent focus:ring-0"
                      />
                    </div>
                    {labels[optIndex] === question.correctAnswer && (
                      <Badge className="bg-green-100 text-green-700 border-green-200">
                        Correct
                      </Badge>
                    )}
                  </div>
                ))}
              </RadioGroup>
              {errors[`questions[${qIndex}].options`] && (
                <p className="text-xs text-red-600">
                  {errors[`questions[${qIndex}].options`]}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
      {}
      <div className="flex justify-center">
        <Button
          type="button"
          variant="outline"
          onClick={addQuestion}
          className="border-2 border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Another Question
        </Button>
      </div>
      {errors.questions && (
        <p className="text-sm text-red-600 text-center">{errors.questions}</p>
      )}
    </div>
  );
};