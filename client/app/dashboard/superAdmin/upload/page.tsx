"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BookOpen, CheckCircle, Plus, Trash2, Upload, Video, FileUp, Sparkles, Check } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import api from "@/lib/api"
import { toast } from "sonner"
import * as XLSX from "xlsx"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"

interface Question {
  id: string
  question: string
  options: string[]
  correctAnswer: number
}

const chapters = Array.from({ length: 50 }, (_, i) => ({
  id: (i + 1).toString(),
  title: `Chapter ${i + 1}`,
}))

export default function UploadContent() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [contentType, setContentType] = useState<"video" | "text">("video")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [grade, setGrade] = useState<string[]>([])
  const [chapter, setChapter] = useState<number>(1)
  const [videoUrl, setVideoUrl] = useState<string>("")
  const [bibleText, setBibleText] = useState("")
  const [grades, setGrades] = useState([])
  const [units, setUnits] = useState([])
  const [selectUnit, setSelectedUnit] = useState("")

  useEffect(() => {
    const fetchGrades = async () => {
      const response = await api.get("/grades/all")
      const data = await response.data.data
      setGrades(data)
    }
    const fetchUnits = async () => {
      const response = await api.get("/units/all")
      const data = await response.data.data
      setUnits(data)
    }
    Promise.all([fetchGrades(), fetchUnits()])
  }, [])

  const [questions, setQuestions] = useState<Question[]>([
    { id: "1", question: "", options: ["", "", "", ""], correctAnswer: 0 },
  ])

  const addQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        question: "",
        options: ["", "", "", ""],
        correctAnswer: 0,
      },
    ])
  }

  const removeQuestion = (id: string) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((q) => q.id !== id))
    } else {
      toast.warning("Cannot remove last question", {
        description: "You must have at least one question.",
      })
    }
  }

  const updateQuestion = (id: string, field: keyof Question, value: any) => {
    setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, [field]: value } : q)))
  }

  const updateOption = (qId: string, idx: number, value: string) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === qId
          ? {
              ...q,
              options: q.options.map((opt, i) => (i === idx ? value : opt)),
            }
          : q,
      ),
    )
  }

  const handleExcelUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: "array" })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const json = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
        }) as string[][]

        if (json.length < 2) {
          toast.error("Excel Import Error", {
            description: "No data found in the Excel file. Please ensure it has at least a header and one row of data.",
          })
          return
        }

        const headerRow = json[0]
        const questionColIndex = headerRow.indexOf("Question")
        const correctAnswerColIndex = headerRow.indexOf("Correct Answer")

        if (questionColIndex === -1 || correctAnswerColIndex === -1) {
          toast.error("Excel Format Error", {
            description: "Missing 'Question' or 'Correct Answer' column in the Excel header.",
          })
          return
        }

        const newQuestions: Question[] = []
        const labels = ["A", "B", "C", "D"]

        json.slice(1).forEach((row, rowIndex) => {
          const questionText = row[questionColIndex]?.toString().trim() || ""
          const correctAnswerLabel = row[correctAnswerColIndex]?.toString().trim().toUpperCase() || ""

          const optionsFromExcel: string[] = []
          for (let i = questionColIndex + 1; i < correctAnswerColIndex; i++) {
            if (row[i] !== undefined && row[i] !== null && row[i].toString().trim() !== "") {
              optionsFromExcel.push(row[i].toString().trim())
            }
          }

          const fixedOptions: string[] = Array(4).fill("")
          optionsFromExcel.slice(0, 4).forEach((opt, idx) => {
            fixedOptions[idx] = opt
          })

          if (!questionText || fixedOptions.filter(Boolean).length < 1 || !correctAnswerLabel) {
            toast.warning("Skipping Row", {
              description: `Row ${rowIndex + 2} was skipped due to missing question text, options, or correct answer.`,
            })
            return
          }

          let correctAnswerIndex = labels.indexOf(correctAnswerLabel)
          if (correctAnswerIndex === -1 || correctAnswerIndex >= fixedOptions.length) {
            toast.warning("Adjusting Correct Answer", {
              description: `Row ${
                rowIndex + 2
              }: Correct answer '${correctAnswerLabel}' is invalid or out of bounds for 4 options. Defaulting to Option A.`,
            })
            correctAnswerIndex = 0
          }

          newQuestions.push({
            id: Date.now().toString() + rowIndex,
            question: questionText,
            options: fixedOptions,
            correctAnswer: correctAnswerIndex,
          })
        })

        if (newQuestions.length > 0) {
          setQuestions(newQuestions)
          toast.success("Excel Imported", {
            description: `${newQuestions.length} questions loaded from Excel.`,
          })
        } else {
          toast.warning("No Valid Questions", {
            description: "No valid questions could be extracted from the Excel file. Please check the format.",
          })
        }
      } catch (error) {
        toast.error("Error reading Excel file:")
        toast.error("Excel Import Error", {
          description: "Failed to read Excel file. Please ensure it's a valid .xlsx or .xls file.",
        })
      }
    }
    reader.readAsArrayBuffer(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setSuccess(false)

    const labels = ["A", "B", "C", "D"]
    const formattedQuestions = questions
      .map((q) => {
        const trimmedOptions = q.options.filter((opt) => opt.trim() !== "")
        if (
          !q.question.trim() ||
          trimmedOptions.length < 1 ||
          q.correctAnswer === undefined ||
          q.correctAnswer < 0 ||
          q.correctAnswer >= trimmedOptions.length
        ) {
          return null
        }
        return {
          questionText: q.question.trim(),
          options: trimmedOptions.map((text, i) => ({
            label: labels[i],
            text: text,
          })),
          correctAnswer: labels[q.correctAnswer],
        }
      })
      .filter(Boolean)

    if (formattedQuestions.length === 0) {
      toast.error("Validation Error", {
        description: "Please add at least one valid question with options and a correct answer.",
      })
      setLoading(false)
      return
    }

    const payload = {
      title,
      description,
      class: grade,
      contentType,
      unit: selectUnit,
      chapterNumber: chapter,
      videoUrl: contentType === "video" ? videoUrl : undefined,
      textContent: contentType === "text" ? bibleText : undefined,
      questions: formattedQuestions,
    }

    try {
      await api.post(`/chapter`, payload, {
        headers: { "Content-Type": "application/json" },
      })
      setSuccess(true)
      toast.success("Content Uploaded!", {
        description: "Your educational content and quiz have been successfully uploaded.",
      })
      router.push("/dashboard/admin/chapters")
    } catch (err: any) {
      toast.error("Upload Failed", {
        description: err.response?.data?.message || "An error occurred during upload. Please try again.",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 relative">
      <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white py-8 mb-8 rounded-3xl">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center mb-4">
            <Sparkles className="h-8 w-8 mr-3" />
            <h1 className="text-3xl font-bold">Upload Educational Content</h1>
          </div>
          <p className="text-indigo-100 text-lg">Create engaging lessons and assessments for your students</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 pb-8">
        {success && (
          <Alert className="mb-8 border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 shadow-lg rounded-2xl">
            <CheckCircle className="h-5 w-5 text-emerald-600" />
            <AlertDescription className="text-emerald-800 font-medium">
              Content uploaded successfully! Students can now access this material.
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
                <BookOpen className="w-5 h-5" /> <span className="font-medium">Bible Text</span>
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
                  Basic information about your educational content
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 p-8">
                <div className="flex md:flex-row flex-col flex-wrap gap-6 md:items-center justify-between">
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
    Grade Level
  </Label>

  <Command className="rounded-xl border-2 border-slate-200 focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-100 transition-all duration-300">
    <CommandInput placeholder="Search grade..." />
    <CommandList>
      <CommandEmpty>No grade found.</CommandEmpty>
      <CommandGroup>
        {grades?.map(({ grade: g }) => {
          const value = String(g)
          const isSelected = (grade as string[]).includes(value)
          return (
            <CommandItem
              key={g}
              onSelect={() => {
                setGrade((prev: string[]) =>
                  prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
                )
              }}
              className="flex items-center justify-between rounded-lg"
            >
              <span>Grade {g}</span>
              {isSelected && <Check className="h-4 w-4 text-emerald-600" />}
            </CommandItem>
          )
        })}
      </CommandGroup>
    </CommandList>
  </Command>

  {Array.isArray(grade) && grade.length > 0 && (
    <div className="flex flex-wrap gap-2 mt-2">
      {grade.map((g) => (
        <Badge
          key={g}
          variant="secondary"
          className="bg-emerald-100 text-emerald-700 border-0 rounded-full px-3 py-1"
        >
          Grade {g}
        </Badge>
      ))}
    </div>
  )}
</div>


                  <div className="space-y-3">
                    <Label htmlFor="unit" className="text-sm font-semibold text-slate-700 flex items-center">
                      <div className="w-2 h-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-full mr-2"></div>
                      Units
                    </Label>
                    <Select onValueChange={(val) => setSelectedUnit(val)} value={selectUnit}>
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
                    placeholder="Describe what students will learn from this content..."
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
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <Video className="w-5 h-5 text-white" />
                    </div>
                    <Badge
                      variant="secondary"
                      className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border-0 px-4 py-1 rounded-full"
                    >
                      Video Content
                    </Badge>
                  </div>
                  <CardTitle className="text-2xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Video Upload
                  </CardTitle>
                  <CardDescription className="text-slate-600 text-base">Upload your video lesson file</CardDescription>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="space-y-3">
                    <Label htmlFor="video" className="text-sm font-semibold text-slate-700 flex items-center">
                      <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mr-2"></div>
                      Video URL
                    </Label>
                    <Input
                      id="videoUrl"
                      placeholder="Enter Video URL..."
                      value={videoUrl}
                      type="url"
                      onChange={(e) => setVideoUrl(e.target.value)}
                      className="h-12 border-2 border-slate-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 rounded-xl transition-all duration-300"
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
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-white" />
                    </div>
                    <Badge
                      variant="secondary"
                      className="bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 border-0 px-4 py-1 rounded-full"
                    >
                      Bible Text
                    </Badge>
                  </div>
                  <CardTitle className="text-2xl bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                    Bible Text Content
                  </CardTitle>
                  <CardDescription className="text-slate-600 text-base">
                    Add biblical text content for study
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 p-8">
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <Textarea
                        placeholder="Enter or paste the biblical text here..."
                        value={bibleText}
                        onChange={(e) => setBibleText(e.target.value)}
                        rows={12}
                        className="border-2 border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 rounded-xl resize-none font-serif text-sm leading-relaxed min-h-[400px] transition-all duration-300"
                        required={contentType === "text"}
                      />
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-slate-500">{bibleText.length} characters</p>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                          <span className="text-xs text-emerald-600 font-medium">Ready for students</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <Card className="shadow-lg border-0 bg-white rounded-3xl overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-orange-500 to-red-500"></div>
              <CardHeader className="pb-4 bg-gradient-to-br from-orange-50 to-red-50">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-white" />
                      </div>
                      <Badge
                        variant="secondary"
                        className="bg-gradient-to-r from-orange-100 to-red-100 text-orange-700 border-0 px-4 py-1 rounded-full"
                      >
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
                        className="h-10 sm:h-11 border-slate-200 focus:border-blue-500 focus:ring-blue-100 rounded-lg transition-all duration-300"
                        required
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
                                : "bg-white border-slate-200 hover:bg-slate-50"
                            }`}
                          >
                            <RadioGroupItem
                              value={optionIndex.toString()}
                              id={`${question.id}-${optionIndex}`}
                              className="text-blue-600"
                            />
                            <Input
                              placeholder={`Option ${String.fromCharCode(65 + optionIndex)}`} 
                              value={option}
                              onChange={(e) => updateOption(question.id, optionIndex, e.target.value)}
                              className="flex-1 border-0 bg-transparent focus:ring-0 focus:border-0"
                              required
                            />
                            {optionIndex === question.correctAnswer && (
                              <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
                                Correct Answer
                              </Badge>
                            )}
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                  </div>
                ))}
                <div className=" w-full flex sm:justify-end justify-center">
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

            <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-4">
              <Button
                type="button"
                variant="outline"
                asChild
                className="px-6 sm:px-8 h-12 bg-white border-2 border-slate-300 hover:bg-slate-50 hover:border-slate-400 rounded-xl w-full sm:w-auto transition-all duration-300"
              >
                <Link href="/dashboard/admin/chapters">Cancel</Link>
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="px-8 sm:px-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-xl w-full sm:w-auto shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5 mr-3" />
                    Upload Content & Quiz
                  </>
                )}
              </Button>
            </div>
          </form>
        </Tabs>
      </div>
    </div>
  )
}
