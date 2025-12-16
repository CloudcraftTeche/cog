import React, { useState } from "react";
import { X, ArrowUpCircle, AlertTriangle } from "lucide-react";
import { Query, User } from "@/types/query.types";
interface EscalateModalProps {
  query: Query;
  superAdmins: User[];
  onClose: () => void;
  onEscalate: (to: string, reason: string) => Promise<void>;
}
const EscalateModal: React.FC<EscalateModalProps> = ({
  query,
  superAdmins,
  onClose,
  onEscalate,
}) => {
  const [selectedAdmin, setSelectedAdmin] = useState("");
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleEscalate = async () => {
    if (!selectedAdmin || !reason.trim()) return;
    setIsSubmitting(true);
    try {
      await onEscalate(selectedAdmin, reason);
      onClose();
    } catch (error) {
      console.error("Error escalating query:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden">
        {}
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <ArrowUpCircle className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Escalate Query</h2>
                <p className="text-sm text-white/80 mt-1">
                  Escalate to super admin for review
                </p>
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
        <div className="p-6 space-y-6">
          {}
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-orange-900 mb-1">Important</p>
              <p className="text-sm text-orange-800">
                This query will be escalated to a super admin for immediate
                attention. Please provide a clear reason for escalation.
              </p>
            </div>
          </div>
          {}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <h3 className="font-semibold text-slate-900 mb-1">
              {query.subject}
            </h3>
            <p className="text-sm text-slate-600">From: {query.from.name}</p>
          </div>
          {}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-3">
              Escalate To
            </label>
            <select
              value={selectedAdmin}
              onChange={(e) => setSelectedAdmin(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-slate-900 font-medium"
              disabled={isSubmitting}
            >
              <option value="">Select super admin...</option>
              {superAdmins.map((admin) => (
                <option key={admin._id} value={admin._id}>
                  {admin.name} - Super Admin
                </option>
              ))}
            </select>
          </div>
          {}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-3">
              Escalation Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none text-slate-900"
              placeholder="Explain why this query needs to be escalated..."
              disabled={isSubmitting}
            />
            <p className="text-xs text-slate-500 mt-2">
              Be specific about the urgency and why super admin attention is
              required.
            </p>
          </div>
          {}
          <div className="flex gap-3 pt-4">
            <button
              onClick={handleEscalate}
              disabled={!selectedAdmin || !reason.trim() || isSubmitting}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:shadow-lg transform hover:scale-105 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              <ArrowUpCircle className="w-5 h-5" />
              {isSubmitting ? "Escalating..." : "Escalate Query"}
            </button>
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="px-6 py-3 border-2 border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors font-semibold"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default EscalateModal;
