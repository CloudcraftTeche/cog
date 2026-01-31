// components/queries/CreateQueryModal.tsx
import React from 'react';
import { X, Send, Paperclip } from 'lucide-react';
import type { CreateQueryData, Recipients } from '@/types/query.types';

interface CreateQueryModalProps {
  isOpen: boolean;
  formData: CreateQueryData;
  recipients: Recipients | null;
  isLoading: boolean;
  onClose: () => void;
  onFormChange: (data: Partial<CreateQueryData>) => void;
  onSubmit: () => void;
}

export const CreateQueryModal: React.FC<CreateQueryModalProps> = ({
  isOpen,
  formData,
  recipients,
  isLoading,
  onClose,
  onFormChange,
  onSubmit,
}) => {
  if (!isOpen) return null;

  const isFormValid = formData.to && formData.subject && formData.content;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Create New Query
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-all"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Send To
              </label>
              <select
                value={formData.to}
                onChange={(e) => onFormChange({ to: e.target.value })}
                className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              >
                <option value="">Select recipient...</option>
                {recipients && recipients.teachers.length > 0 && (
                  <optgroup label="Teachers">
                    {recipients.teachers.map((teacher) => (
                      <option key={teacher._id} value={teacher._id}>
                        {teacher.name} - {teacher.email}
                      </option>
                    ))}
                  </optgroup>
                )}
                {recipients && recipients.admins.length > 0 && (
                  <optgroup label="Admins">
                    {recipients.admins.map((admin) => (
                      <option key={admin._id} value={admin._id}>
                        {admin.name} - Admin
                      </option>
                    ))}
                  </optgroup>
                )}
                {recipients && recipients.superAdmins.length > 0 && (
                  <optgroup label="Super Admins">
                    {recipients.superAdmins.map((sa) => (
                      <option key={sa._id} value={sa._id}>
                        {sa.name} - Super Admin
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Subject
              </label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => onFormChange({ subject: e.target.value })}
                maxLength={200}
                className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="Brief summary of your query"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Content
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => onFormChange({ content: e.target.value })}
                rows={6}
                className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="Describe your query in detail..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Query Type
                </label>
                <select
                  value={formData.queryType}
                  onChange={(e) =>
                    onFormChange({ queryType: e.target.value as any })
                  }
                  className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                >
                  <option value="general">General</option>
                  <option value="academic">Academic</option>
                  <option value="disciplinary">Disciplinary</option>
                  <option value="doctrinal">Doctrinal</option>
                  <option value="technical">Technical</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) =>
                    onFormChange({ priority: e.target.value as any })
                  }
                  className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>

            <div>
              <label className="flex items-center gap-3 cursor-pointer bg-purple-50 p-4 rounded-xl hover:bg-purple-100 transition-all">
                <input
                  type="checkbox"
                  checked={formData.isSensitive}
                  onChange={(e) =>
                    onFormChange({ isSensitive: e.target.checked })
                  }
                  className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <span className="text-sm font-semibold text-gray-700">
                  Mark as sensitive
                </span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Attachments (Optional)
              </label>
              <div className="relative">
                <input
                  type="file"
                  multiple
                  onChange={(e) =>
                    onFormChange({
                      attachments: Array.from(e.target.files || []),
                    })
                  }
                  className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                />
                <Paperclip className="absolute right-4 top-1/2 transform -translate-y-1/2 text-purple-400 w-5 h-5 pointer-events-none" />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={onSubmit}
                disabled={isLoading || !isFormValid}
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-4 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 font-semibold shadow-lg"
              >
                <Send className="w-5 h-5" />
                {isLoading ? 'Sending...' : 'Send Query'}
              </button>
              <button
                onClick={onClose}
                className="px-8 py-4 border-2 border-purple-200 rounded-xl hover:bg-purple-50 transition-all font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};