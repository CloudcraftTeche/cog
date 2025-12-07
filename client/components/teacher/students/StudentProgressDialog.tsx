"use client"
import { X, Loader2, BookOpen, Award, TrendingUp } from "lucide-react"
interface Student {
  _id: string
  name: string
}
interface StudentProgress {
  totalChapters: number
  completedCount: number
  notCompletedChapters: number
  completionPercentage: number
  completedChapters: Array<{
    chapterId: string
    chapterTitle: string
    chapterNumber: number
    completedAt: string
    score?: number
  }>
}
interface StudentProgressDialogProps {
  open: boolean
  student: Student | null
  progress: StudentProgress | null
  loading: boolean
  onClose: () => void
}
export const StudentProgressDialog = ({
  open,
  student,
  progress,
  loading,
  onClose,
}: StudentProgressDialogProps) => {
  if (!open) return null
  const formatDate = (date?: string) => {
    if (!date) return "N/A"
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-3xl w-full my-8 shadow-2xl animate-in zoom-in duration-200">
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">Student Progress</h2>
              <p className="text-purple-100 mt-1">
                {student?.name}'s learning journey
              </p>
            </div>
            <button
              onClick={onClose}
              className="h-10 w-10 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all"
            >
              <X className="h-6 w-6 text-white" />
            </button>
          </div>
        </div>
        <div className="p-6 max-h-[calc(80vh-120px)] overflow-y-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-12 w-12 animate-spin text-purple-600 mb-4" />
              <p className="text-gray-600">Loading progress data...</p>
            </div>
          ) : progress ? (
            <div className="space-y-6">
              {}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 text-center shadow-sm">
                  <BookOpen className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-3xl font-bold text-blue-600">
                    {progress.totalChapters}
                  </div>
                  <div className="text-sm text-blue-700 font-medium mt-1">Total Chapters</div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-5 text-center shadow-sm">
                  <Award className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <div className="text-3xl font-bold text-green-600">
                    {progress.completedCount}
                  </div>
                  <div className="text-sm text-green-700 font-medium mt-1">Completed</div>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-5 text-center shadow-sm">
                  <TrendingUp className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                  <div className="text-3xl font-bold text-orange-600">
                    {progress.notCompletedChapters}
                  </div>
                  <div className="text-sm text-orange-700 font-medium mt-1">Remaining</div>
                </div>
              </div>
              {}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-5 shadow-sm">
                <div className="flex justify-between text-sm mb-3">
                  <span className="font-semibold text-gray-700">Overall Progress</span>
                  <span className="text-purple-600 font-bold text-lg">
                    {progress.completionPercentage}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4 shadow-inner">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-4 rounded-full transition-all duration-500 shadow-md"
                    style={{ width: `${progress.completionPercentage}%` }}
                  />
                </div>
              </div>
              {}
              {progress.completedChapters.length > 0 ? (
                <div>
                  <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <Award className="h-5 w-5 mr-2 text-purple-600" />
                    Completed Chapters
                  </h4>
                  <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                    {progress.completedChapters.map((chapter) => (
                      <div
                        key={chapter.chapterId}
                        className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-4 shadow-sm hover:shadow-md transition-all"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-start gap-3">
                              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                {chapter.chapterNumber}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h5 className="font-semibold text-gray-900 mb-1">
                                  {chapter.chapterTitle}
                                </h5>
                                <p className="text-sm text-gray-600">
                                  Completed: {formatDate(chapter.completedAt)}
                                </p>
                              </div>
                            </div>
                          </div>
                          {chapter.score !== undefined && (
                            <span className="ml-3 px-3 py-1 bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 font-semibold rounded-lg text-sm whitespace-nowrap">
                              {chapter.score}%
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-xl">
                  <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-lg">No chapters completed yet</p>
                  <p className="text-gray-400 text-sm mt-1">
                    Progress will appear here once the student starts completing chapters
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <X className="h-16 w-16 text-red-400 mx-auto mb-3" />
              <p className="text-gray-600">Failed to load progress data</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}