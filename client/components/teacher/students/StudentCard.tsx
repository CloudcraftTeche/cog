"use client"
import { Mail, Phone, MoreHorizontal, Edit, Trash2, Award, TrendingUp, BookOpen } from "lucide-react"
interface Student {
  _id: string
  name: string
  email: string
  rollNumber?: string
  gradeId?: string
  parentContact?: string
  profilePictureUrl?: string
}
interface StudentCardProps {
  student: Student
  gradient: string
  dropdownOpen: boolean
  onDropdownToggle: () => void
  onViewProgress: () => void
  onEdit: () => void
  onDelete: () => void
  onCloseDropdown: () => void
}
export const StudentCard = ({
  student,
  gradient,
  dropdownOpen,
  onDropdownToggle,
  onViewProgress,
  onEdit,
  onDelete,
  onCloseDropdown,
}: StudentCardProps) => {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }
  return (
    <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 overflow-hidden border border-gray-100">
      {}
      <div className={`h-24 bg-gradient-to-r ${gradient} relative`}>
        <div className="absolute -bottom-10 left-6">
          <div className="h-20 w-20 rounded-2xl bg-white p-1 shadow-xl">
            {student.profilePictureUrl ? (
              <img 
                src={student.profilePictureUrl} 
                alt={student.name} 
                className="h-full w-full rounded-xl object-cover"
              />
            ) : (
              <div className={`h-full w-full rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white text-xl font-bold`}>
                {getInitials(student.name)}
              </div>
            )}
          </div>
        </div>
        <div className="absolute top-4 right-4 dropdown-container">
          <button 
            className="h-9 w-9 rounded-lg bg-white/20 backdrop-blur-sm hover:bg-white/30 flex items-center justify-center transition-all"
            onClick={onDropdownToggle}
          >
            <MoreHorizontal className="h-5 w-5 text-white" />
          </button>
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-2xl border border-gray-200 z-10 overflow-hidden">
              <button 
                className="w-full text-left px-4 py-3 hover:bg-purple-50 flex items-center text-gray-700 transition-colors"
                onClick={() => {
                  onViewProgress()
                  onCloseDropdown()
                }}
              >
                <TrendingUp className="h-4 w-4 mr-3 text-purple-500" />
                View Progress
              </button>
              <button 
                className="w-full text-left px-4 py-3 hover:bg-green-50 flex items-center text-gray-700 transition-colors"
                onClick={() => {
                  onEdit()
                  onCloseDropdown()
                }}
              >
                <Edit className="h-4 w-4 mr-3 text-green-500" />
                Edit
              </button>
              <button 
                className="w-full text-left px-4 py-3 hover:bg-red-50 flex items-center text-red-600 transition-colors"
                onClick={() => {
                  onDelete()
                  onCloseDropdown()
                }}
              >
                <Trash2 className="h-4 w-4 mr-3" />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
      {}
      <div className="pt-14 px-6 pb-6">
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-900 mb-1">
            {student.name}
          </h3>
          {student.rollNumber && (
            <span className="inline-block px-3 py-1 bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 text-sm font-medium rounded-full">
              Roll: {student.rollNumber}
            </span>
          )}
        </div>
        <div className="space-y-3 mb-5">
          <div className="flex items-center text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
            <Mail className="h-4 w-4 mr-3 text-blue-500 flex-shrink-0" />
            <span className="truncate">{student.email}</span>
          </div>
          {student.parentContact && (
            <div className="flex items-center text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
              <Phone className="h-4 w-4 mr-3 text-green-500 flex-shrink-0" />
              <span>{student.parentContact}</span>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <button 
            className="flex-1 px-4 py-2.5 bg-gradient-to-r from-purple-100 to-pink-100 hover:from-purple-200 hover:to-pink-200 text-purple-700 font-medium rounded-xl transition-all flex items-center justify-center shadow-sm"
            onClick={onViewProgress}
          >
            <Award className="h-4 w-4 mr-2" />
            Progress
          </button>
          <button 
            className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-medium rounded-xl transition-all shadow-md hover:shadow-lg"
            onClick={onEdit}
          >
            Edit
          </button>
        </div>
      </div>
    </div>
  )
}