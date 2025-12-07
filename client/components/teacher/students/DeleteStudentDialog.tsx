"use client"
import { Trash2 } from "lucide-react"
interface DeleteStudentDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
}
export const DeleteStudentDialog = ({
  open,
  onClose,
  onConfirm,
}: DeleteStudentDialogProps) => {
  if (!open) return null
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in zoom-in duration-200">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Trash2 className="h-8 w-8 text-red-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">Delete Student</h2>
        <p className="text-gray-600 text-center mb-6">
          Are you sure you want to delete this student? This action cannot be undone and will
          remove all associated data including progress tracking.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 font-medium transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}