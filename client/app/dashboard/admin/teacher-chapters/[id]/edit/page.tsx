"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, Plus, Trash2, Video, FileUp, Sparkles, BookOpen, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { Checkbox } from "@/components/ui/checkbox";

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

interface Grade {
  grade: string;
  _id: string;
}

interface Unit {
  unit: string;
  _id: string;
}

const chapters = Array.from({ length: 50 }, (_, i) => ({
  id: (i + 1).toString(),
  title: `Chapter ${i + 1}`,
}));

export default function EditTeacherChapter() {
  const router = useRouter();
  const { id } = useParams() as { id: string };
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [success, setSuccess] = useState(false);
  const [contentType, setContentType] = useState<"video" | "text">("video");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedGrade, setSelectedGrade] = useState<string>("");
  const [chapter, setChapter] = useState<number>(1);
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [textContent, setTextContent] = useState("");
  const [grades, setGrades] = useState<Grade[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [selectedUnit, setSelectedUnit] = useState("");
  const [includeQuiz, setIncludeQuiz] = useState(false);

  const [questions, setQuestions] = useState<Question[]>([
    { id: "1", question: "", options: ["", "", "", ""], correctAnswer: 0 },
  ]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setFetchingData(true);
        const [gradesRes, unitsRes, chapterRes] = await Promise.all([
          api.get("/grades/all"),
          api.get("/units/all"),
          api.get(`/teacher-chapter/chapter/${id}`),
        ]);

        setGrades(gradesRes.data.data || []);
        setUnits(unitsRes.data.data || []);

        const chapterData = chapterRes.data.data;
        if (chapterData) {
          setTitle(chapterData.title || "");
          setDescription(chapterData.description || "");
          setSelectedGrade(chapterData.grade || "");
          setSelectedUnit(chapterData.unit || "");
          setChapter(chapterData.chapterNumber || 1);
          setContentType(chapterData.contentType || "video");
          setVideoUrl(chapterData.videoUrl || "");
          setTextContent(chapterData.textContent || "");

          if (chapterData.questions && chapterData.questions.length > 0) {
            setIncludeQuiz(true);
            const labels = ["A", "B", "C", "D"];
            const formattedQuestions = chapterData.questions.map((q: any, index: number) => ({
              id: Date.now().toString() + index,
              question: q.questionText || "",
              options: q.options.map((opt: any) => opt.text || ""),
              correctAnswer: labels.indexOf(q.correctAnswer),
            }));
            setQuestions(formattedQuestions);
          }
        }
      } catch (error) {
        toast.error("Failed to load chapter data");
        router.push("/dashboard/admin/teacher-chapters");
      } finally {
        setFetchingData(false);
      }
    };
    fetchData();
  }, [id, router]);

  const addQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        question: "",
        options: ["", "", "", ""],
        correctAnswer: 0,
      },
    ]);
  };

  const removeQuestion = (qId: string) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((q) => q.id !== qId));
    } else {
      toast.warning("Cannot remove last question", {
        description: "You must have at least one question.",
      });
    }
  };

  const updateQuestion = (qId: string, field: keyof Question, value: any) => {
    setQuestions((prev) => prev.map((q) => (q.id === qId ? { ...q, [field]: value } : q)));
  };

  const updateOption = (qId: string, idx: number, value: string) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === qId
          ? {
              ...q,
              options: q.options.map((opt, i) => (i === idx ? value : opt)),
            }
          : q
      )
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
        const json = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
        }) as string[][];

        if (json.length < 2) {
          toast.error("Excel Import Error", {
            description: "No data found in the Excel file.",
          });
          return;
        }

        const headerRow = json[0];
        const questionColIndex = headerRow.indexOf("Question");
        const correctAnswerColIndex = headerRow.indexOf("Correct Answer");

        if (questionColIndex === -1 || correctAnswerColIndex === -1) {
          toast.error("Excel Format Error", {
            description: "Missing 'Question' or 'Correct Answer' column.",
          });
          return;
        }

        const newQuestions: Question[] = [];
        const labels = ["A", "B", "C", "D"];

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

          if (!questionText || fixedOptions.filter(Boolean).length < 1 || !correctAnswerLabel) {
            return;
          }

          let correctAnswerIndex = labels.indexOf(correctAnswerLabel);
          if (correctAnswerIndex === -1 || correctAnswerIndex >= fixedOptions.length) {
            correctAnswerIndex = 0;
          }

          newQuestions.push({
            id: Date.now().toString() + rowIndex,
            question: questionText,
            options: fixedOptions,
            correctAnswer: correctAnswerIndex,
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    const labels = ["A", "B", "C", "D"];
    const formattedQuestions = includeQuiz
      ? questions
          .map((q) => {
            const trimmedOptions = q.options.filter((opt) => opt.trim() !== "");
            if (
              !q.question.trim() ||
              trimmedOptions.length < 1 ||
              q.correctAnswer === undefined ||
              q.correctAnswer < 0 ||
              q.correctAnswer >= trimmedOptions.length
            ) {
              return null;
            }
            return {
              questionText: q.question.trim(),
              options: trimmedOptions.map((text, i) => ({
                label: labels[i],
                text: text,
              })),
              correctAnswer: labels[q.correctAnswer],
            };
          })
          .filter(Boolean)
      : [];

    if (includeQuiz && formattedQuestions.length === 0) {
      toast.error("Validation Error", {
        description: "Please add at least one valid question.",
      });
      setLoading(false);
      return;
    }

    const payload = {
      title,
      description,
      grade: selectedGrade,
      contentType,
      unit: selectedUnit,
      chapterNumber: chapter,
      videoUrl: contentType === "video" ? videoUrl : undefined,
      textContent: contentType === "text" ? textContent : undefined,
      questions: formattedQuestions,
    };

    try {
      await api.put(`/teacher-chapter/${id}`, payload, {
        headers: { "Content-Type": "application/json" },
      });
      setSuccess(true);
      toast.success("Chapter Updated!", {
        description: "The chapter has been successfully updated.",
      });
      setTimeout(() => {
        router.push("/dashboard/admin/teacher-chapters");
      }, 2000);
    } catch (err: any) {
      toast.error("Update Failed", {
        description: err.response?.data?.message || "An error occurred. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (fetchingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
          <p className="text-gray-600 font-medium">Loading chapter data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 relative">
      <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white py-8 mb-8 rounded-3xl">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center mb-4">
            <Sparkles className="h-8 w-8 mr-3" />
            <h1 className="text-3xl font-bold">Edit Teacher Training Chapter</h1>
          </div>
          <p className="text-indigo-100 text-lg">Update professional development materials for teachers</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 pb-8">
        {success && (
          <Alert className="mb-8 border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 shadow-lg rounded-2xl">
            <CheckCircle className="h-5 w-5 text-emerald-600" />
            <AlertDescription className="text-emerald-800 font-medium">
              Chapter updated successfully!
            </AlertDescription>
          </Alert>
        )}

        <Tabs
          value={contentType}
          onValueChange={(val: string) => setContentType(val as "video" | "text")}
          className="space-y-8"
        >
          <div className="flex justify-center">
            <TabsList className="grid w-full max-w-md grid-cols-2 h-14 bg-gradient-to-r from-slate-100 to-slate-200 rounded-2xl p-2">
              <TabsTrigger
                value="video"
                className="flex items-center space-x-2 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300"
              >
                <Video className="w-5 h-5" /> <span className="font-medium">Video Content</span>
              </TabsTrigger>
              <TabsTrigger
                value="text"
                className="flex items-center space-x-2 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300"
              >
                <BookOpen className="w-5 h-5" /> <span className="font-medium">Text Content</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <Card className="shadow-2xl border-0 bg-white rounded-3xl overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
              <CardHeader className="pb-4 bg-gradient-to-br from-blue-50 to-indigo-50">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <Badge
                    variant="secondary"
                    className="bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 border-0 px-4 py-1 rounded-full"
                  >
                    Basic Info
                  </Badge>
                </div>
                <CardTitle className="text-2xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Content Details
                </CardTitle>
                <CardDescription className="text-slate-600 text-base">
                  Basic information about the training content
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="title" className="text-sm font-semibold text-slate-700 flex items-center">
                      <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mr-2"></div>
                      Content Title
                    </Label>
                    <Input
                      id="title"
                      placeholder="Enter a descriptive title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="h-12 border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-xl transition-all duration-300"
                      required
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="grade" className="text-sm font-semibold text-slate-700 flex items-center">
                      <div className="w-2 h-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full mr-2"></div>
                      Teacher Grade
                    </Label>
                    <Select onValueChange={setSelectedGrade} value={selectedGrade}>
                      <SelectTrigger
                        id="grade"
                        className="h-12 border-2 border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 rounded-xl transition-all duration-300"
                      >
                        <SelectValue placeholder="Select grade" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        {grades?.map(({ grade: g }) => (
                          <SelectItem key={g} value={String(g)} className="rounded-lg">
                            Grade {g}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="unit" className="text-sm font-semibold text-slate-700 flex items-center">
                      <div className="w-2 h-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-full mr-2"></div>
                      Unit
                    </Label>
                    <Select onValueChange={setSelectedUnit} value={selectedUnit}>
                      <SelectTrigger
                        id="unit"
                        className="h-12 border-2 border-slate-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-100 rounded-xl transition-all duration-300"
                      >
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        {units?.map(({ unit: u }) => (
                          <SelectItem key={u} value={String(u)} className="rounded-lg">
                            Unit {u}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="chapter" className="text-sm font-semibold text-slate-700 flex items-center">
                      <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mr-2"></div>
                      Chapter Number
                    </Label>
                    <Select onValueChange={(val) => setChapter(Number(val))} value={String(chapter)}>
                      <SelectTrigger
                        id="chapter"
                        className="h-12 border-2 border-slate-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 rounded-xl transition-all duration-300"
                      >
                        <SelectValue placeholder="Select Chapter" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        {chapters?.map(({ id, title }) => (
                          <SelectItem key={id} value={String(id)} className="rounded-lg">
                            {title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="description" className="text-sm font-semibold text-slate-700 flex items-center">
                    <div className="w-2 h-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full mr-2"></div>
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Describe what teachers will learn..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    className="border-2 border-slate-200 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100 rounded-xl resize-none transition-all duration-300"
                  />
                </div>
              </CardContent>
            </Card>

            <TabsContent value="video" className="space-y-8">
              <Card className="shadow-2xl border-0 bg-white rounded-3xl overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-purple-500 to-pink-500"></div>
                <CardHeader className="pb-4 bg-gradient-to-br from-purple-50 to-pink-50">
                  <CardTitle className="text-2xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Video Upload
                  </CardTitle>
                  <CardDescription className="text-slate-600 text-base">Upload your training video</CardDescription>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="space-y-3">
                    <Label htmlFor="videoUrl" className="text-sm font-semibold text-slate-700">
                      Video URL
                    </Label>
                    <Input
                      id="videoUrl"
                      placeholder="Enter Video URL..."
                      value={videoUrl}
                      type="url"
                      onChange={(e) => setVideoUrl(e.target.value)}
                      className="h-12 border-2 border-slate-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 rounded-xl"
                      required={contentType === "video"}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="text" className="space-y-8">
              <Card className="shadow-2xl border-0 bg-white rounded-3xl overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
                <CardHeader className="pb-4 bg-gradient-to-br from-emerald-50 to-teal-50">
                  <CardTitle className="text-2xl bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                    Text Content
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <Textarea
                    placeholder="Enter or paste the training content..."
                    value={textContent}
                    onChange={(e) => setTextContent(e.target.value)}
                    rows={12}
                    className="border-2 border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 rounded-xl resize-none min-h-[400px]"
                    required={contentType === "text"}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <Card className="shadow-lg border-0 bg-white rounded-3xl overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-orange-500 to-red-500"></div>
              <CardHeader className="pb-4 bg-gradient-to-br from-orange-50 to-red-50">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                      Assessment Questions (Optional)
                    </CardTitle>
                    <CardDescription className="text-slate-600 text-base">
                      Add optional quiz questions
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="include-quiz"
                      checked={includeQuiz}
                      onCheckedChange={(checked) => setIncludeQuiz(checked as boolean)}
                    />
                    <Label htmlFor="include-quiz" className="text-sm font-medium cursor-pointer">
                      Include Quiz
                    </Label>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6 p-8">
                {includeQuiz && (
                  <>
                    <div className="grid gap-2 mb-4">
                      <Label htmlFor="excel-upload" className="text-sm font-semibold text-slate-700 flex items-center">
                        <FileUp className="w-5 h-5 mr-2" /> Import Questions from Excel
                      </Label>
                      <Input
                        id="excel-upload"
                        type="file"
                        accept=".xlsx, .xls"
                        onChange={handleExcelUpload}
                        className="cursor-pointer h-12 border-2 border-slate-200 rounded-xl"
                      />
                    </div>

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
                          <Label className="text-sm font-medium text-slate-700">Question</Label>
                          <Input
                            placeholder="Enter your question..."
                            value={question.question}
                            onChange={(e) => updateQuestion(question.id, "question", e.target.value)}
                            className="h-11 border-slate-200 rounded-lg"
                            required={includeQuiz}
                          />
                        </div>
                        <div className="space-y-3">
                          <Label className="text-sm font-medium text-slate-700">Answer Options</Label>
                          <RadioGroup
                            value={question.correctAnswer.toString()}
                            onValueChange={(value: string) =>
                              updateQuestion(question.id, "correctAnswer", Number.parseInt(value))
                            }
                          >
                            {question.options.map((option, optionIndex) => (
                              <div
                                key={optionIndex}
                                className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors ${
                                  optionIndex === question.correctAnswer
                                    ? "bg-green-50 border-green-200"
                                    : "bg-white border-slate-200"
                                }`}
                              >
                                <RadioGroupItem
                                  value={optionIndex.toString()}
                                  id={`${question.id}-${optionIndex}`}
                                />
                                <Input
                                  placeholder={`Option ${String.fromCharCode(65 + optionIndex)}`}
                                  value={option}
                                  onChange={(e) => updateOption(question.id, optionIndex, e.target.value)}
                                  className="flex-1 border-0 bg-transparent"
                                  required={includeQuiz}
                                />
                                {optionIndex === question.correctAnswer && (
                                  <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
                                    Correct
                                  </Badge>
                                )}
                              </div>
                            ))}
                          </RadioGroup>
                        </div>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addQuestion}
                      className="border-blue-200 text-blue-700 hover:bg-blue-50"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Question
                    </Button>
                  </>
                )}
                
                {!includeQuiz && (
                  <div className="text-center py-12 bg-slate-50 rounded-xl border-2 border-dashed border-slate-300">
                    <p className="text-slate-600 font-medium">No quiz included</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-4">
              <Button
                type="button"
                variant="outline"
                asChild
                className="px-8 h-12 bg-white border-2 border-slate-300 hover:bg-slate-50 rounded-xl w-full sm:w-auto"
              >
                <Link href="/dashboard/admin/teacher-chapters">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Cancel
                </Link>
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="px-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-xl w-full sm:w-auto shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-3" />
                    Updating...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5 mr-3" />
                    Update Chapter
                  </>
                )}
              </Button>
            </div>
          </form>
        </Tabs>
      </div>
    </div>
  );
}