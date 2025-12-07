"use client"
import { useState, useEffect, type FormEvent } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save, Plus, Trash2, BookOpen, Video } from "lucide-react"
import api from "@/lib/api"
import { toast } from "sonner"

interface Question {
  id: string
  questionText: string
  options: { label: string; text: string }[]
  correctAnswer: string
}

interface Chapter {
  _id?: string
  title: string
  description: string
  contentType: "video" | "text"
  videoUrl?: string
  textContent?: string
  class: string
  questions?: Question[]
}

export default function EditChapterPage() {
  const router = useRouter()
  const { id } = useParams() as { id: string }
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)
  const [grades, setGrades] = useState([])
  const [activeTab, setActiveTab] = useState("content")
  const [formData, setFormData] = useState<Chapter>({
    title: "",
    description: "",
    contentType: "text",
    videoUrl: "",
    textContent: "",
    class: "",
    questions: [],
  })

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
  ])

  useEffect(() => {
    if (!id) return
    const fetchChapter = async () => {
      try {
        setFetchLoading(true)
        const { data } = await api.get(`/chapter/chapter/${id}`)
        const chapter = data.data
        setFormData({
          title: chapter.title || "",
          description: chapter.description || "",
          contentType: chapter.contentType || "text",
          textContent: chapter.textContent || "",
          class: chapter.class || "",
          videoUrl: chapter.videoUrl || "",
          questions: chapter.questions || [],
        })

        if (chapter.questions && chapter.questions.length > 0) {
          setQuestions(
            chapter.questions.map((q: any, index: number) => ({
              id: q.id || index.toString(),
              questionText: q.questionText || q.question || "",
              options: q.options || [
                { label: "A", text: "" },
                { label: "B", text: "" },
                { label: "C", text: "" },
                { label: "D", text: "" },
              ],
              correctAnswer: q.correctAnswer || "A",
            })),
          )
        }
      } catch (error: any) {
        toast.error(error.response.data.message)
      } finally {
        setFetchLoading(false)
      }
    }
    const fetchGrades = async () => {
      const response = await api.get("/grades/all")
      const data = await response.data.data

      setGrades(data)
    }
    fetchGrades()
    fetchChapter()
  }, [id])

  const handleInputChange = (field: keyof Chapter, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

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
    ])
  }

  const removeQuestion = (id: string) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((q) => q.id !== id))
    }
  }

  const updateQuestion = (id: string, field: keyof Question, value: any) => {
    setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, [field]: value } : q)))
  }

  const updateOption = (qId: string, label: string, text: string) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === qId
          ? {
              ...q,
              options: q.options.map((opt) => (opt.label === label ? { ...opt, text } : opt)),
            }
          : q,
      ),
    )
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const payload: Chapter = {
        title: formData.title,
        description: formData.description,
        contentType: formData.contentType,
        class: formData.class,
        videoUrl: formData.contentType === "video" ? formData.videoUrl : undefined,
        textContent: formData.contentType === "text" ? formData.textContent : undefined,
        questions: questions.map((q) => ({
          questionText: q.questionText,
          options: q.options,
          correctAnswer: q.correctAnswer,
          id: q.id,
        })),
      }

      await api.put(`/chapter/${id}`, payload, {
        headers: { "Content-Type": "application/json" },
      })

      router.push("/dashboard/admin/chapters")
    } catch (error) {
      toast.error("Error updating chapter:")
    } finally {
      setLoading(false)
    }
  }

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
    )
  }

  return (
    <div className="">
      <div className="max-w-5xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <div className="flex justify-center">
            <TabsList className="grid w-full max-w-md grid-cols-2 h-16 bg-white rounded-2xl shadow-xl border-0 p-2">
              <TabsTrigger
                value="content"
                className="flex items-center space-x-3 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white font-semibold transition-all duration-300 text-lg"
              >
                <BookOpen className="w-5 h-5" /> <span>Content</span>
              </TabsTrigger>
              <TabsTrigger
                value="questions"
                className="flex items-center space-x-3 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-600 data-[state=active]:text-white font-semibold transition-all duration-300 text-lg"
              >
                <Video className="w-5 h-5" /> <span>Questions</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <TabsContent value="content" className="space-y-8">
              <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm rounded-3xl overflow-hidden">
                <CardHeader className="pb-6 bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-8">
                  <div className="flex items-center space-x-3">
                    <Badge className="bg-white/20 text-white border-white/30 px-4 py-2 rounded-full font-semibold">
                      Basic Info
                    </Badge>
                  </div>
                  <CardTitle className="text-2xl font-bold">Chapter Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-8 p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <Label htmlFor="title" className="text-lg font-semibold text-gray-700">
                        Chapter Title *
                      </Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => handleInputChange("title", e.target.value)}
                        placeholder="Enter chapter title"
                        className="h-12 border-2 border-blue-200 focus:border-blue-500 rounded-xl text-lg"
                        required
                      />
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="class" className="text-lg font-semibold text-gray-700">
                        Grade *
                      </Label>
                      <Select value={formData.class || ""} onValueChange={(value) => handleInputChange("class", value)}>
                        <SelectTrigger className="h-12 border-2 border-green-200 focus:border-green-500 rounded-xl">
                          <SelectValue placeholder="Select Grade" />
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
                  <div className="space-y-3">
                    <Label htmlFor="description" className="text-lg font-semibold text-gray-700">
                      Description *
                    </Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      placeholder="Enter chapter description"
                      rows={4}
                      className="border-2 border-purple-200 focus:border-purple-500 rounded-xl text-lg"
                      required
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="contentType" className="text-lg font-semibold text-gray-700">
                      Content Type *
                    </Label>
                    <Select
                      value={formData.contentType}
                      onValueChange={(value: "video" | "text") => handleInputChange("contentType", value)}
                    >
                      <SelectTrigger className="h-12 border-2 border-orange-200 focus:border-orange-500 rounded-xl">
                        <SelectValue placeholder="Select content type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Text Content</SelectItem>
                        <SelectItem value="video">Video Upload</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {formData.contentType === "video" ? (
                    <div className="space-y-3">
                      <Label htmlFor="videoUrl" className="text-lg font-semibold text-gray-700">
                        Video Url
                      </Label>
                      <Input
                        id="videoUrl"
                        type="url"
                        value={formData.videoUrl}
                        onChange={(e) => handleInputChange("videoUrl", e.target.value)}
                        className="h-12 border-2 border-red-200 focus:border-red-500 rounded-xl text-lg"
                      />
                      <p className="text-sm text-gray-500 bg-gray-50 p-3 rounded-xl">
                        Leave empty to keep existing video
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Label htmlFor="textContent" className="text-lg font-semibold text-gray-700">
                        Text Content *
                      </Label>
                      <Textarea
                        id="textContent"
                        value={formData.textContent}
                        onChange={(e) => handleInputChange("textContent", e.target.value)}
                        placeholder="Enter text content"
                        rows={10}
                        className="border-2 border-teal-200 focus:border-teal-500 rounded-xl text-lg"
                        required
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="questions" className="space-y-8">
              <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm rounded-3xl overflow-hidden">
                <CardHeader className="pb-6 bg-gradient-to-r from-purple-500 to-pink-600 text-white p-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-3 mb-3">
                        <Badge className="bg-white/20 text-white border-white/30 px-4 py-2 rounded-full font-semibold">
                          Quiz Questions
                        </Badge>
                      </div>
                      <CardTitle className="text-2xl font-bold">Assessment Questions</CardTitle>
                      <p className="text-purple-100 text-lg font-medium">
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
                        <Label className="text-lg font-semibold text-slate-700">Question</Label>
                        <Input
                          placeholder="Enter your question..."
                          value={question.questionText}
                          onChange={(e) => updateQuestion(question.id, "questionText", e.target.value)}
                          className="h-12 border-2 border-slate-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl text-lg"
                          required
                        />
                      </div>
                      <div className="space-y-4">
                        <Label className="text-lg font-semibold text-slate-700">Answer Options</Label>
                        <RadioGroup
                          value={question.correctAnswer}
                          onValueChange={(value: string) => updateQuestion(question.id, "correctAnswer", value)}
                        >
                          {question.options.map((option) => (
                            <div
                              key={option.label}
                              className={`flex items-center space-x-4 p-4 rounded-2xl border-2 transition-all duration-300 ${
                                option.label === question.correctAnswer
                                  ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-300 shadow-lg"
                                  : "bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                              }`}
                            >
                              <RadioGroupItem
                                value={option.label}
                                id={`${question.id}-${option.label}`}
                                className="text-blue-600 w-5 h-5"
                              />
                              <Input
                                placeholder={`Option ${option.label}`}
                                value={option.text}
                                onChange={(e) => updateOption(question.id, option.label, e.target.value)}
                                className="flex-1 border-0 bg-transparent focus:ring-0 focus:border-0 text-lg"
                                required
                              />
                              {option.label === question.correctAnswer && (
                                <Badge className="bg-gradient-to-r from-green-400 to-emerald-500 text-white px-3 py-1 rounded-full font-semibold">
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

            <div className="flex justify-end gap-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-700 hover:bg-gray-50 rounded-xl px-8 py-3 font-semibold transition-all duration-300"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 rounded-xl px-8 py-3 font-semibold"
              >
                <Save className="h-5 w-5 mr-2" />
                {loading ? "Updating..." : "Update Chapter"}
              </Button>
            </div>
          </form>
        </Tabs>
      </div>
    </div>
  )
}
