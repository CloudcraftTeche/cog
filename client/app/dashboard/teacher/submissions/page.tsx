"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  BookOpen,
  Star,
  MessageSquare,
  FileText,
  Video,
  FileImage,
  Search,
  Award,
  Clock,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Play,
  Download,
} from "lucide-react"

interface Question {
  _id: string
  questionText: string
  options: { label: string; text: string }[]
  correctAnswer: string
}

interface Answer {
  questionId: string
  answer: string
}

interface Submission {
  _id: string
  assignment: {
    _id: string
    title: string
    questions: Question[]
  }
  student: {
    _id: string
    name: string
    email: string
  }
  submissionType: "text" | "video" | "pdf"
  videoUrl?: string
  pdfUrl?: string
  textContent?: string
  answers: Answer[]
  score?: number
  feedback?: string
  submitted: boolean
  createdAt: string
}

const mockSubmissions: Submission[] = [
  {
    _id: "1",
    assignment: {
      _id: "a1",
      title: "React Fundamentals Essay",
      questions: [
        {
          _id: "q1",
          questionText: "What are the key features of React?",
          options: [
            { label: "A", text: "Component-based architecture" },
            { label: "B", text: "Virtual DOM" },
            { label: "C", text: "JSX syntax" },
            { label: "D", text: "All of the above" },
          ],
          correctAnswer: "D",
        },
        {
          _id: "q2",
          questionText: "Explain the concept of state in React",
          options: [],
          correctAnswer: "State represents data that can change over time",
        },
      ],
    },
    student: { _id: "s1", name: "Alice Johnson", email: "alice@example.com" },
    submissionType: "text",
    textContent:
      "React is a powerful JavaScript library for building user interfaces. It uses a component-based architecture that makes code reusable and maintainable...",
    answers: [
      { questionId: "q1", answer: "D" },
      {
        questionId: "q2",
        answer: "State represents data that can change over time and triggers re-renders when updated",
      },
    ],
    score: 85,
    feedback: "Great understanding of React concepts! Consider adding more examples.",
    submitted: true,
    createdAt: "2024-01-15T10:30:00Z",
  },
  {
    _id: "2",
    assignment: {
      _id: "a2",
      title: "JavaScript Video Tutorial",
      questions: [
        {
          _id: "q3",
          questionText: "What is the difference between let and var?",
          options: [],
          correctAnswer: "let has block scope while var has function scope",
        },
      ],
    },
    student: { _id: "s2", name: "Bob Smith", email: "bob@example.com" },
    submissionType: "video",
    videoUrl: "https://example.com/video.mp4",
    answers: [
      { questionId: "q3", answer: "let has block scope and prevents hoisting issues, while var has function scope" },
    ],
    submitted: true,
    createdAt: "2024-01-14T14:20:00Z",
  },
  {
    _id: "3",
    assignment: {
      _id: "a3",
      title: "Database Design Project",
      questions: [
        {
          _id: "q4",
          questionText: "What is database normalization?",
          options: [],
          correctAnswer: "Process of organizing data to reduce redundancy",
        },
      ],
    },
    student: { _id: "s3", name: "Carol Davis", email: "carol@example.com" },
    submissionType: "pdf",
    pdfUrl: "https://example.com/project.pdf",
    answers: [
      {
        questionId: "q4",
        answer:
          "Database normalization is the process of organizing data to reduce redundancy and improve data integrity",
      },
    ],
    score: 92,
    feedback: "Excellent work on the ER diagram and normalization!",
    submitted: true,
    createdAt: "2024-01-13T09:15:00Z",
  },
]

export default function TeacherSubmissions() {
  const [submissions, setSubmissions] = useState<Submission[]>(mockSubmissions)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<"all" | "graded" | "ungraded">("all")
  const [gradingSubmission, setGradingSubmission] = useState<string | null>(null)
  const [expandedSubmission, setExpandedSubmission] = useState<string | null>(null)
  const [tempScore, setTempScore] = useState("")
  const [tempFeedback, setTempFeedback] = useState("")

  const filteredSubmissions = submissions.filter((submission) => {
    const matchesSearch =
      submission.student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.assignment.title.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesFilter =
      filterStatus === "all" ||
      (filterStatus === "graded" && submission.score !== undefined) ||
      (filterStatus === "ungraded" && submission.score === undefined)

    return matchesSearch && matchesFilter
  })

  const handleGradeSubmission = (submissionId: string, score: number, feedback: string) => {
    setSubmissions((prev) => prev.map((sub) => (sub._id === submissionId ? { ...sub, score, feedback } : sub)))
    setGradingSubmission(null)
    setTempScore("")
    setTempFeedback("")
  }

  const startGrading = (submission: Submission) => {
    setGradingSubmission(submission._id)
    setTempScore(submission.score?.toString() || "")
    setTempFeedback(submission.feedback || "")
  }

  const toggleExpanded = (submissionId: string) => {
    setExpandedSubmission(expandedSubmission === submissionId ? null : submissionId)
  }

  const getSubmissionTypeIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Video className="h-4 w-4" />
      case "pdf":
        return <FileImage className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getSubmissionTypeColor = (type: string) => {
    switch (type) {
      case "video":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "pdf":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-blue-100 text-blue-800 border-blue-200"
    }
  }

  const getScoreColor = (score?: number) => {
    if (!score) return "text-gray-400"
    if (score >= 90) return "text-green-600"
    if (score >= 80) return "text-blue-600"
    if (score >= 70) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreBadgeColor = (score?: number) => {
    if (!score) return "bg-gray-100 text-gray-600"
    if (score >= 90) return "bg-green-100 text-green-800 border-green-200"
    if (score >= 80) return "bg-blue-100 text-blue-800 border-blue-200"
    if (score >= 70) return "bg-yellow-100 text-yellow-800 border-yellow-200"
    return "bg-red-100 text-red-800 border-red-200"
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl p-8 text-white shadow-2xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <BookOpen className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold">Student Submissions</h1>
                <p className="text-purple-100 text-lg">Review, grade, and provide valuable feedback</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-r from-blue-400 to-blue-600 rounded-xl p-4 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium">Total Submissions</p>
                    <p className="text-2xl font-bold">{submissions.length}</p>
                  </div>
                  <FileText className="h-8 w-8 text-blue-200" />
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-400 to-green-600 rounded-xl p-4 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm font-medium">Graded</p>
                    <p className="text-2xl font-bold">{submissions.filter((s) => s.score !== undefined).length}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-200" />
                </div>
              </div>

              <div className="bg-gradient-to-r from-orange-400 to-orange-600 rounded-xl p-4 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm font-medium">Pending Review</p>
                    <p className="text-2xl font-bold">{submissions.filter((s) => s.score === undefined).length}</p>
                  </div>
                  <Clock className="h-8 w-8 text-orange-200" />
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-400 to-purple-600 rounded-xl p-4 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm font-medium">Average Score</p>
                    <p className="text-2xl font-bold">
                      {Math.round(
                        submissions.filter((s) => s.score).reduce((acc, s) => acc + (s.score || 0), 0) /
                          submissions.filter((s) => s.score).length,
                      ) || 0}
                      %
                    </p>
                  </div>
                  <Award className="h-8 w-8 text-purple-200" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500 h-5 w-5" />
                <Input
                  placeholder="Search by student name or assignment..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white border-blue-200 focus:border-blue-400 focus:ring-blue-200"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={filterStatus === "all" ? "default" : "outline"}
                  onClick={() => setFilterStatus("all")}
                  className={
                    filterStatus === "all"
                      ? "bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                      : "hover:bg-indigo-50 hover:text-indigo-700"
                  }
                >
                  All Submissions
                </Button>
                <Button
                  variant={filterStatus === "graded" ? "default" : "outline"}
                  onClick={() => setFilterStatus("graded")}
                  className={
                    filterStatus === "graded"
                      ? "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                      : "hover:bg-green-50 hover:text-green-700"
                  }
                >
                  Graded
                </Button>
                <Button
                  variant={filterStatus === "ungraded" ? "default" : "outline"}
                  onClick={() => setFilterStatus("ungraded")}
                  className={
                    filterStatus === "ungraded"
                      ? "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
                      : "hover:bg-orange-50 hover:text-orange-700"
                  }
                >
                  Pending
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6">
          {filteredSubmissions.map((submission, index) => {
            const cardGradients = [
              "from-blue-50 to-indigo-50",
              "from-green-50 to-emerald-50",
              "from-purple-50 to-pink-50",
              "from-orange-50 to-red-50",
              "from-teal-50 to-cyan-50",
              "from-yellow-50 to-orange-50",
            ]
            const borderGradients = [
              "from-blue-400 to-indigo-500",
              "from-green-400 to-emerald-500",
              "from-purple-400 to-pink-500",
              "from-orange-400 to-red-500",
              "from-teal-400 to-cyan-500",
              "from-yellow-400 to-orange-500",
            ]
            const cardGradient = cardGradients[index % cardGradients.length]
            const borderGradient = borderGradients[index % borderGradients.length]

            return (
              <Card
                key={submission._id}
                className="overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300 bg-white"
              >
                <div className={`h-1 bg-gradient-to-r ${borderGradient}`}></div>
                <CardHeader className={`bg-gradient-to-r ${cardGradient} border-b p-6`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <Avatar className="h-12 w-12 border-4 border-white shadow-lg">
                          <AvatarImage
                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${submission.student.name}`}
                          />
                          <AvatarFallback className={`bg-gradient-to-r ${borderGradient} text-white text-sm font-bold`}>
                            {submission.student.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div
                          className={`absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-r ${borderGradient} rounded-full flex items-center justify-center`}
                        >
                          <Star className="h-3 w-3 text-white" />
                        </div>
                      </div>
                      <div>
                        <CardTitle className="text-xl text-gray-800 font-bold">{submission.student.name}</CardTitle>
                        <p className="text-gray-600 font-medium">{submission.assignment.title}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={`${getSubmissionTypeColor(submission.submissionType)} border font-semibold`}>
                        {getSubmissionTypeIcon(submission.submissionType)}
                        <span className="ml-2 capitalize">{submission.submissionType}</span>
                      </Badge>
                      {submission.score !== undefined && (
                        <Badge className={`${getScoreBadgeColor(submission.score)} border font-bold text-sm`}>
                          <Star className="h-4 w-4 mr-1" />
                          {submission.score}%
                        </Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleExpanded(submission._id)}
                        className="p-2 hover:bg-white/50"
                      >
                        {expandedSubmission === submission._id ? (
                          <ChevronDown className="h-5 w-5" />
                        ) : (
                          <ChevronRight className="h-5 w-5" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                {expandedSubmission === submission._id && (
                  <CardContent className="p-6">
                    <div className="mb-6">
                      <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2 text-lg">
                        {getSubmissionTypeIcon(submission.submissionType)}
                        Submission Content
                      </h4>

                      {submission.submissionType === "text" && submission.textContent && (
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border-l-4 border-blue-400 shadow-sm">
                          <p className="text-gray-700 leading-relaxed">
                            {submission.textContent.length > 150
                              ? `${submission.textContent.substring(0, 150)}...`
                              : submission.textContent}
                          </p>
                        </div>
                      )}

                      {submission.submissionType === "video" && submission.videoUrl && (
                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border-l-4 border-purple-400 shadow-sm">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 text-purple-700">
                              <Video className="h-5 w-5" />
                              <span className="font-bold">Video Submission</span>
                            </div>
                            <Button
                              size="sm"
                              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0"
                            >
                              <Play className="h-4 w-4 mr-2" />
                              Play Video
                            </Button>
                          </div>
                        </div>
                      )}

                      {submission.submissionType === "pdf" && submission.pdfUrl && (
                        <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-4 border-l-4 border-red-400 shadow-sm">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 text-red-700">
                              <FileImage className="h-5 w-5" />
                              <span className="font-bold">PDF Document</span>
                            </div>
                            <Button
                              size="sm"
                              className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white border-0"
                            >
                              <Download className="h-4 w-4 mr-2" />
                              View PDF
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>

                    {gradingSubmission === submission._id ? (
                      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-200 shadow-sm">
                        <h4 className="font-bold text-indigo-800 mb-4 flex items-center gap-2 text-lg">
                          <div className="p-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg">
                            <Star className="h-4 w-4 text-white" />
                          </div>
                          Grade This Submission
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <label className="block text-sm font-bold text-indigo-800 mb-2">Score (0-100)</label>
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              value={tempScore}
                              onChange={(e) => setTempScore(e.target.value)}
                              placeholder="Enter score..."
                              className="bg-white border-indigo-200 focus:border-indigo-400"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-indigo-800 mb-2">Quick Score</label>
                            <div className="flex gap-2">
                              {[100, 90, 80, 70].map((score) => (
                                <Button
                                  key={score}
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setTempScore(score.toString())}
                                  className="hover:bg-indigo-100 hover:text-indigo-700 hover:border-indigo-300 font-semibold"
                                >
                                  {score}%
                                </Button>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="mb-4">
                          <label className="block text-sm font-bold text-indigo-800 mb-2">Feedback</label>
                          <Textarea
                            value={tempFeedback}
                            onChange={(e) => setTempFeedback(e.target.value)}
                            placeholder="Provide constructive feedback..."
                            rows={3}
                            className="bg-white border-indigo-200 focus:border-indigo-400"
                          />
                        </div>
                        <div className="flex gap-3">
                          <Button
                            onClick={() =>
                              handleGradeSubmission(submission._id, Number.parseInt(tempScore), tempFeedback)
                            }
                            disabled={!tempScore}
                            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white border-0 shadow-lg font-semibold"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Save Grade
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setGradingSubmission(null)}
                            className="hover:bg-gray-50 font-semibold"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        {submission.score !== undefined ? (
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <div
                                className={`p-2 bg-gradient-to-r ${getScoreColor(submission.score) === "text-green-600" ? "from-green-400 to-green-600" : getScoreColor(submission.score) === "text-blue-600" ? "from-blue-400 to-blue-600" : getScoreColor(submission.score) === "text-yellow-600" ? "from-yellow-400 to-yellow-600" : "from-red-400 to-red-600"} rounded-lg`}
                              >
                                <Star className="h-4 w-4 text-white" />
                              </div>
                              <span className={`text-2xl font-bold ${getScoreColor(submission.score)}`}>
                                {submission.score}/100
                              </span>
                            </div>
                            {submission.feedback && (
                              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border-l-4 border-green-400 shadow-sm">
                                <div className="flex items-start gap-3">
                                  <MessageSquare className="h-4 w-4 text-green-600 mt-1" />
                                  <p className="text-green-800 leading-relaxed font-medium">{submission.feedback}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="flex-1">
                            <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 font-semibold">
                              <Clock className="h-4 w-4 mr-2" />
                              Awaiting Your Review
                            </Badge>
                          </div>
                        )}
                        <Button
                          onClick={() => startGrading(submission)}
                          className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 font-semibold"
                        >
                          <Star className="h-4 w-4 mr-2" />
                          {submission.score !== undefined ? "Update Grade" : "Grade Now"}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            )
          })}
        </div>

        {filteredSubmissions.length === 0 && (
          <div className="text-center py-16">
            <div className="bg-gradient-to-r from-gray-100 to-gray-200 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
              <Search className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-600 mb-3">No submissions found</h3>
            <p className="text-gray-500 text-lg">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </div>
  )
}
