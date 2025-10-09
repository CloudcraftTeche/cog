"use client";
import { X, Send, Paperclip, Timer } from "lucide-react";

interface AdminQueryModalProps {
  query: any;
  show: boolean;
  onClose: () => void;
  responseText: string;
  setResponseText: (text: string) => void;
  handleSendResponse: () => void;
  handleStatusChange: (queryId: string, status: string) => void;
  getPriorityColor: (priority: string) => string;
}

const AdminQueryModal = ({
  query,
  show,
  onClose,
  responseText,
  setResponseText,
  handleSendResponse,
  handleStatusChange,
  getPriorityColor,
}: AdminQueryModalProps) => {
  if (!show || !query) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-scroll ">
      <div className="bg-white rounded-xl max-w-5xl w-full max-h-[90vh] overflow-y-scroll">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{query.subject}</h2>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-gray-600">From: {query.from?.name || "Unknown"}</span>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(query.priority)}`}>
                {query.priority.toUpperCase()}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={query.status}
              onChange={(e) => handleStatusChange(query._id, e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="escalated">Escalate</option>
            </select>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="flex h-[70vh]">
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="bg-gray-50 border-l-4 border-gray-400 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-medium">{query.from?.name || "Unknown"}</span>
                <span className="text-sm text-gray-500">{new Date(query.createdAt).toLocaleString()}</span>
              </div>
              <p className="text-gray-800">{query.content}</p>
            </div>

            <div className="space-y-4 mb-6">
              <h4 className="font-medium text-gray-900">Response History ({query.responses?.length || 0})</h4>
              {(query.responses || []).map((response:any, index:number) => {
                const isAdmin = response.from?.role === "admin";
                return (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border-l-4 ${
                      isAdmin ? "bg-blue-50 border-blue-400" : "bg-gray-50 border-gray-400"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium">{response.from?.name || (isAdmin ? "Admin" : query.from?.name)}</span>
                      <span className="text-xs bg-gray-200 px-2 py-1 rounded">{response.from?.role || "user"}</span>
                      <span className="text-sm text-gray-500">{new Date(response.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="text-gray-800">{response.content}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="w-80 border-l bg-gray-50 p-6 overflow-y-auto">
            <div className="space-y-6">
              <div>
                <h4 className="font-medium mb-3">Query Details</h4>
                <div className="space-y-2 text-sm">
                  <div><strong>Type:</strong> {query.queryType}</div>
                  <div><strong>Department:</strong> {query.from?.department || "N/A"}</div>
                  <div><strong>Created:</strong> {new Date(query.createdAt).toLocaleString()}</div>
                  <div><strong>Last Updated:</strong> {new Date(query.lastActivity || query.updatedAt).toLocaleString()}</div>
                  {query.resolvedAt && (
                    <div><strong>Resolved:</strong> {new Date(query.resolvedAt).toLocaleString()}</div>
                  )}
                </div>
              </div>

              {query.tags && query.tags.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {query.tags.map((tag:any) => (
                      <span key={tag} className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {query.status !== "resolved" && (
          <div className="p-6 border-t bg-gray-50">
            <div className="flex gap-4">
              <div className="flex-1">
                <textarea
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  placeholder="Type your response..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  rows={3}
                />
              </div>
              <div className="flex flex-col gap-2">
                <button
                  onClick={handleSendResponse}
                  disabled={!responseText.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                >
                  <Send size={16} />
                  Send
                </button>
              
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminQueryModal;
