"use client";
import { X, Send } from "lucide-react";

interface QueryModalProps {
  query: any;
  show: boolean;
  onClose: () => void;
  onSendResponse: (text: string) => void;
  responseText: string;
  setResponseText: (text: string) => void;
  getStatusColor: (status: string) => string;
  getPriorityColor: (priority: string) => string;
}

const QueryModal = ({
  query,
  show,
  onClose,
  onSendResponse,
  responseText,
  setResponseText,
  getStatusColor,
  getPriorityColor,
}: QueryModalProps) => {
  if (!show || !query) return null;

  const isStudent = (response: any) =>
    response.from?.role === "student" || response.from === "student";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{query.subject}</h2>
            <p className="text-gray-600">
              To: {query.to?.name || "—"} {query.to?.subject ? `• ${query.to.subject}` : ""}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(
                query.status
              )}`}
            >
              {query.status.replace("_", " ").toUpperCase()}
            </span>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-6 max-h-[60vh] overflow-y-auto">
          <div className="bg-blue-50 border-l-4 border-blue-400 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <span
                className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(
                  query.priority
                )}`}
              >
                {query.priority.toUpperCase()}
              </span>
              <span className="text-sm text-gray-500">
                {new Date(query.createdAt).toLocaleString()}
              </span>
            </div>
            <p className="text-gray-800">{query.content}</p>
          </div>

          <div className="space-y-4 mb-6">
            {(query.responses || []).map((response: any, index: number) => (
              <div
                key={index}
                className={`p-4 rounded-lg ${
                  isStudent(response)
                    ? "bg-blue-50 border-l-4 border-blue-400 ml-8"
                    : "bg-gray-50 border-l-4 border-gray-400"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium text-sm">
                    {isStudent(response)
                      ? "You"
                      : response.from?.name || query.to?.name || "Teacher"}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(response.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-gray-800">{response.content}</p>
              </div>
            ))}
          </div>
        </div>

        {query.status !== "resolved" && (
          <div className="p-6 border-t bg-gray-50">
            <div className="flex gap-4">
              <div className="flex-1">
                <textarea
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  placeholder="Add a follow-up message..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  rows={3}
                />
              </div>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => onSendResponse(responseText)}
                  disabled={!responseText.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                >
                  <Send size={16} /> Send
                </button>
               
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QueryModal;
