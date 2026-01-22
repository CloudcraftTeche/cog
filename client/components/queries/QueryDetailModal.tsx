import React, { useState } from "react";
import { X, Send, AlertTriangle } from "lucide-react";
import { formatDateTime, formatStatusLabel } from "@/utils/query.utils";
import { QueryDetailModalProps } from "@/types/admin/query.types";

const QueryDetailModal: React.FC<QueryDetailModalProps> = ({
  query,
  onClose,
  onAddResponse,
  canRespond = true,
  accentColor = "blue",
}) => {
  
  const [responseContent, setResponseContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleSubmitResponse = async () => {
    if (!responseContent.trim() || !onAddResponse) return;
    setIsSubmitting(true);
    try {
      await onAddResponse(query._id, responseContent);
      setResponseContent("");
    } catch (error) {
      console.error("Error submitting response:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {}
        <div
          className={`bg-gradient-to-r from-${accentColor}-500 to-${accentColor}-600 p-6 text-white`}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-3">{query.subject}</h2>
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-lg text-xs font-medium bg-white/20 backdrop-blur-sm border border-white/30`}
                >
                  {formatStatusLabel(query.status)}
                </span>
                <span
                  className={`px-3 py-1 rounded-lg text-xs font-medium bg-white/20 backdrop-blur-sm border border-white/30`}
                >
                  {query.priority.toUpperCase()}
                </span>
                {query.assignedTo && (
                  <span className="px-3 py-1 rounded-lg text-xs font-medium bg-white/20 backdrop-blur-sm border border-white/30">
                    Assigned: {query.assignedTo.name}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-xl transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
        {}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="space-y-6">
            {}
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-6 border border-slate-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg">
                  {query.from.name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-slate-900">
                    {query.from.name}
                  </p>
                  <p className="text-sm text-slate-600">
                    Roll: {query.from.rollNumber} •
                    {formatDateTime(query.createdAt)}
                  </p>
                </div>
              </div>
              <p className="text-slate-800 leading-relaxed whitespace-pre-wrap">
                {query.content}
              </p>
              {query.escalationReason && (
                <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-5 h-5 text-orange-600" />
                    <p className="font-semibold text-orange-900">
                      Escalation Reason
                    </p>
                  </div>
                  <p className="text-orange-800">{query.escalationReason}</p>
                </div>
              )}
              {query.tags && query.tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {query.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-white border border-slate-200 text-slate-700 text-sm rounded-lg"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
            {}
            {query.responses && query.responses.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <div
                    className={`w-1 h-6 bg-gradient-to-b from-${accentColor}-500 to-${accentColor}-600 rounded-full`}
                  />
                  Response History
                </h3>
                <div className="space-y-4">
                  {query.responses.map((response, index) => (
                    <div
                      key={index}
                      className="bg-blue-50 border border-blue-200 rounded-2xl p-5"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                          {response.from.name?.charAt(0)} 
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-slate-900">
                              {response.from.name} 
                            </p>
                            <span className="text-xs text-slate-600">
                              ({response.from.role})
                            </span>
                            {response.responseType === "broadcast" && (
                              <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-md font-medium">
                                Broadcast
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500">
                            {formatDateTime(response.createdAt)}
                          </p>
                        </div>
                      </div>
                      <p className="text-slate-800 leading-relaxed">
                        {response.content}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {}
            {canRespond &&
              (query.status === "open" ||
                query.status === "in_progress" ||
                query.status === "escalated") &&
              onAddResponse && (
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <div
                      className={`w-1 h-6 bg-gradient-to-b from-${accentColor}-500 to-${accentColor}-600 rounded-full`}
                    />
                    Add Response
                  </h3>
                  <div className="space-y-3">
                    <textarea
                      value={responseContent}
                      onChange={(e) => setResponseContent(e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none text-slate-900"
                      placeholder="Type your response here..."
                      disabled={isSubmitting}
                    />
                    <button
                      onClick={handleSubmitResponse}
                      disabled={!responseContent.trim() || isSubmitting}
                      className={`flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-${accentColor}-500 to-${accentColor}-600 text-white rounded-xl hover:shadow-lg transform hover:scale-105 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
                    >
                      <Send className="w-5 h-5" />
                      {isSubmitting ? "Sending..." : "Send Response"}
                    </button>
                  </div>
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default QueryDetailModal;
