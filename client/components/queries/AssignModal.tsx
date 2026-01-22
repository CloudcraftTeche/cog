import React, { useState } from "react";
import { X, UserPlus, Check } from "lucide-react";
import { AssignModalProps, Query, User } from "@/types/admin/query.types";

const AssignModal: React.FC<AssignModalProps> = ({
  query,
  teachers = [],
  admins = [],
  onClose,
  onAssign,
  accentColor = "blue",
}) => {
  const [selectedUser, setSelectedUser] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleAssign = async () => {
    if (!selectedUser) return;
    setIsSubmitting(true);
    try {
      await onAssign(selectedUser);
      onClose();
    } catch (error) {
      console.error("Error assigning query:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden">
        {}
        <div
          className={`bg-gradient-to-r from-${accentColor}-500 to-${accentColor}-600 p-6 text-white`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <UserPlus className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Assign Query</h2>
                <p className="text-sm text-white/80 mt-1">
                  Select a user to assign this query
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
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <h3 className="font-semibold text-slate-900 mb-1">
              {query.subject}
            </h3>
            <p className="text-sm text-slate-600">From: {query.from.name}</p>
          </div>
          {}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-3">
              Assign To
            </label>
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className={`w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-${accentColor}-500 focus:border-transparent transition-all text-slate-900 font-medium`}
              disabled={isSubmitting}
            >
              <option value="">Select user...</option>
              {admins && admins.length > 0 && (
                <optgroup label="Admins">
                  {admins.map((admin) => (
                    <option key={admin._id} value={admin._id}>
                      {admin.name} - Admin
                    </option>
                  ))}
                </optgroup>
              )}
              {teachers && teachers.length > 0 && (
                <optgroup label="Teachers">
                  {teachers.map((teacher) => (
                    <option key={teacher._id} value={teacher._id}>
                      {teacher.name} - Teacher
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
          </div>
          {}
          <div className="flex gap-3 pt-4">
            <button
              onClick={handleAssign}
              disabled={!selectedUser || isSubmitting}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-${accentColor}-500 to-${accentColor}-600 text-white rounded-xl hover:shadow-lg transform hover:scale-105 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
            >
              <Check className="w-5 h-5" />
              {isSubmitting ? "Assigning..." : "Assign Query"}
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
export default AssignModal;
