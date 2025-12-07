"use client";
import { useState } from "react";
import { X, Send, Paperclip } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
interface QueryModalProps {
  show: boolean;
  query: any;
  onClose: () => void;
  onStatusChange: (id: string, status: string) => void;
  onResponseSent: (queryId: string, response: any) => void;
  user: any;
}
export default function QueryModal({
  show,
  query,
  onClose,
  onStatusChange,
  onResponseSent,
  user,
}: QueryModalProps) {
  const [responseText, setResponseText] = useState("");
  if (!show || !query) return null;
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-700";
      case "medium":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-green-100 text-green-700";
    }
  };
  const handleSendResponse = async () => {
    if (!responseText.trim()) {
      toast.error("Please enter a response");
      return;
    }
    const tempResponse = {
      from: { role: "teacher", name: user?.name || "You" },
      content: responseText,
      createdAt: new Date().toISOString(),
    };
    onResponseSent(query._id, tempResponse);
    setResponseText("");
    try {
      const { data } = await api.post(`/queries/${query._id}/responses`, {
        content: responseText,
        from: "teacher",
      });
      const newResponse = data?.response || tempResponse;
      onResponseSent(query._id, newResponse);
      toast.success("Response sent successfully!");
    } catch (error: any) {
      toast.error("Failed to send response");
    }
  };
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-xl">
        {}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-sm font-medium text-gray-600">
                {query.from?.name?.charAt(0) || "?"}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {query.subject}
              </h2>
              <p className="text-gray-600">
                {query.from?.name || "Unknown"} • {query.from?.email || ""}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={query.status}
              onChange={(e) => onStatusChange(query._id, e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="escalated">Escalate</option>
            </select>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>
        {}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
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
            {(query.responses || []).map((response: any, index: number) => {
              const isTeacher =
                response.from?.role === "teacher" || response.from === "teacher";
              return (
                <div
                  key={index}
                  className={`p-4 rounded-lg ${
                    isTeacher
                      ? "bg-blue-50 border-l-4 border-blue-400 ml-8"
                      : "bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium text-sm">
                      {isTeacher
                        ? "You"
                        : response.from?.name || query.from?.name || "Student"}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(response.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-gray-800">{response.content}</p>
                </div>
              );
            })}
          </div>
        </div>
        {}
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
              <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2 transition-colors">
                <Paperclip size={16} />
                Attach
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
