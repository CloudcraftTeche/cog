"use client";
import { useState, useEffect, type FormEvent } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Save, Plus, Trash2, BookOpen, Video } from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";

interface Question {
  id: string;
  questionText: string;
  options: { label: string; text: string }[];
  correctAnswer: string;
}

interface Chapter {
  _id?: string;
  title: string;
  description: string;
  contentType: "video" | "text";
  videoUrl?: string;
  textContent?: string;
  class: string;
  questions?: Question[];
}

export default function EditChapterPage() {
  const router = useRouter();
  const { id } = useParams() as { id: string };
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [grades, setGrades] = useState([]);

  const [activeTab, setActiveTab] = useState("content");
  const [formData, setFormData] = useState<Chapter>({
    title: "",
    description: "",
    contentType: "text",
    videoUrl: "",
    textContent: "",
    class: "",
    questions: [],
  });

  const [questions, setQuestions] = useState<Question[]>([
    {
      id: "1",
      questionText: "",
      options: [
        { label: "A", text: "" },
        { label: "B", text: "" },
        { label: "C", text: "" },
        { label: "D", text: "" },
      ],
      correctAnswer: "A",
    },
  ]);

  useEffect(() => {
    if (!id) return;

    const fetchChapter = async () => {
      try {
        setFetchLoading(true);
        const res = await api.get(`/chapter/chapter/${id}`);
        const chapter = res.data.data;

        setFormData({
          title: chapter.title || "",
          description: chapter.description || "",
          contentType: chapter.contentType || "text",
          textContent: chapter.textContent || "",
          class: chapter.class || "",
          videoUrl: chapter.videoUrl || "",
          questions: chapter.questions || [],
        });

        if (Array.isArray(chapter.questions) && chapter.questions.length > 0) {
          setQuestions(
            chapter.questions.map((q: any, index: number) => ({
              id: q.id || String(index),
              questionText: q.questionText || q.question || "",
              options:
                Array.isArray(q.options) && q.options.length > 0
                  ? q.options
                  : [
                      { label: "A", text: "" },
                      { label: "B", text: "" },
                      { label: "C", text: "" },
                      { label: "D", text: "" },
                    ],
              correctAnswer: q.correctAnswer || "A",
            }))
          );
        }
      } catch (error: any) {
        toast.error(
          error?.response?.data?.message || "Failed to fetch chapter"
        );
      } finally {
        setFetchLoading(false);
      }
    };

    const fetchGrades = async () => {
      try {
        const res = await api.get("/grades");
        setGrades(res.data.data);
      } catch (error) {
        toast.error("Failed to fetch grades");
      }
    };

    Promise.all([fetchGrades(), fetchChapter()]);
  }, [id]);

  const handleInputChange = (field: keyof Chapter, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        questionText: "",
        options: [
          { label: "A", text: "" },
          { label: "B", text: "" },
          { label: "C", text: "" },
          { label: "D", text: "" },
        ],
        correctAnswer: "A",
      },
    ]);
  };

  const removeQuestion = (id: string) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((q) => q.id !== id));
    }
  };

  const updateQuestion = (id: string, field: keyof Question, value: any) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, [field]: value } : q))
    );
  };

  const updateOption = (qId: string, label: string, text: string) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === qId
          ? {
              ...q,
              options: q.options.map((opt) =>
                opt.label === label ? { ...opt, text } : opt
              ),
            }
          : q
      )
    );
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload: Chapter = {
        title: formData.title,
        description: formData.description,
        contentType: formData.contentType,
        class: formData.class,
        videoUrl:
          formData.contentType === "video" ? formData.videoUrl : undefined,
        textContent:
          formData.contentType === "text" ? formData.textContent : undefined,
        questions: questions.map((q) => ({
          questionText: q.questionText,
          options: q.options,
          correctAnswer: q.correctAnswer,
          id: q.id,
        })),
      };

      await api.put(`/chapter/${id}`, payload, {
        headers: { "Content-Type": "application/json" },
      });

      router.push("/dashboard/teacher/chapters");
    } catch (error) {
      toast.error("Error updating chapter");
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Chapter</h1>
            <p className="text-gray-600">Loading chapter details...</p>
          </div>
        </div>
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="text-center text-gray-500">Loading...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-5xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-8"
        >
          <div className="flex justify-center">
            <TabsList className="grid w-full max-w-md grid-cols-2 h-12">
              <TabsTrigger
                value="content"
                className="flex items-center space-x-2"
              >
                <BookOpen className="w-4 h-4" /> <span>Content</span>
              </TabsTrigger>
              <TabsTrigger
                value="questions"
                className="flex items-center space-x-2"
              >
                <Video className="w-4 h-4" /> <span>Questions</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <TabsContent value="content" className="space-y-8">
              <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-2">
                    <Badge
                      variant="secondary"
                      className="bg-blue-100 text-blue-700"
                    >
                      Basic Info
                    </Badge>
                  </div>
                  <CardTitle className="text-xl">Chapter Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="title">Chapter Title *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) =>
                          handleInputChange("title", e.target.value)
                        }
                        placeholder="Enter chapter title"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="class">Grade *</Label>
                      <Select
                        value={formData.class}
                        onValueChange={(value) =>
                          handleInputChange("class", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue
                            placeholder="Select class"
                            defaultValue={formData.class || ""}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {grades?.map(({ grade }) => (
                            <SelectItem key={grade} value={grade}>
                              {grade}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) =>
                        handleInputChange("description", e.target.value)
                      }
                      placeholder="Enter chapter description"
                      rows={3}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contentType">Content Type *</Label>
                    <Select
                      value={formData.contentType}
                      onValueChange={(value: "video" | "text") =>
                        handleInputChange("contentType", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select content type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Text Content</SelectItem>
                        <SelectItem value="video">Video Upload</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {formData.contentType === "video" ? (
                    <div className="space-y-2">
                      <Label htmlFor="videoUrl">Video Url</Label>
                      <Input
                        id="videoUrl"
                        type="url"
                        value={formData.videoUrl}
                        onChange={(e) =>
                          handleInputChange("videoUrl", e.target.value)
                        }
                      />
                      <p className="text-sm text-gray-500">
                        Leave empty to keep existing video
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label htmlFor="textContent">Text Content *</Label>
                      <Textarea
                        id="textContent"
                        value={formData.textContent}
                        onChange={(e) =>
                          handleInputChange("textContent", e.target.value)
                        }
                        placeholder="Enter text content"
                        rows={8}
                        required
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="questions" className="space-y-8">
              <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge
                          variant="secondary"
                          className="bg-orange-100 text-orange-700"
                        >
                          Quiz Questions
                        </Badge>
                      </div>
                      <CardTitle className="text-xl">
                        Assessment Questions
                      </CardTitle>
                      <p className="text-slate-600 text-sm">
                        Edit questions to test student understanding
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addQuestion}
                      className="border-blue-200 text-blue-700 hover:bg-blue-50 bg-transparent"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Question
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
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
                          Question
                        </Label>
                        <Input
                          placeholder="Enter your question..."
                          value={question.questionText}
                          onChange={(e) =>
                            updateQuestion(
                              question.id,
                              "questionText",
                              e.target.value
                            )
                          }
                          className="h-10 sm:h-11 border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div className="space-y-3">
                        <Label className="text-sm font-medium text-slate-700">
                          Answer Options
                        </Label>
                        <RadioGroup
                          value={question.correctAnswer}
                          onValueChange={(value: string) =>
                            updateQuestion(question.id, "correctAnswer", value)
                          }
                        >
                          {question.options.map((option) => (
                            <div
                              key={option.label}
                              className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors ${
                                option.label === question.correctAnswer
                                  ? "bg-green-50 border-green-200"
                                  : "bg-white border-slate-200 hover:bg-slate-50"
                              }`}
                            >
                              <RadioGroupItem
                                value={option.label}
                                id={`${question.id}-${option.label}`}
                                className="text-blue-600"
                              />
                              <Input
                                placeholder={`Option ${option.label}`}
                                value={option.text}
                                onChange={(e) =>
                                  updateOption(
                                    question.id,
                                    option.label,
                                    e.target.value
                                  )
                                }
                                className="flex-1 border-0 bg-transparent focus:ring-0 focus:border-0"
                                required
                              />
                              {option.label === question.correctAnswer && (
                                <Badge
                                  variant="secondary"
                                  className="bg-green-100 text-green-700 text-xs"
                                >
                                  Correct Answer
                                </Badge>
                              )}
                            </div>
                          ))}
                        </RadioGroup>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
              >
                <Save className="h-4 w-4 mr-2" />
                {loading ? "Updating..." : "Update Chapter"}
              </Button>
            </div>
          </form>
        </Tabs>
      </div>
    </div>
  );
}
