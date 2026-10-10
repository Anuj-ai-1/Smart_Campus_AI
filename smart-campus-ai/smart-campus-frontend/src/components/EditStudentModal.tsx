import React, { useState } from "react";
import { Student } from "../types";
import { studentsApi } from "../services/api";
import { X, Edit3, ArrowUpCircle, Check, AlertCircle, RefreshCw } from "lucide-react";

interface EditStudentModalProps {
  student: Student;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updated: Student) => void;
}

export function EditStudentModal({ student, isOpen, onClose, onSuccess }: EditStudentModalProps) {
  const [formData, setFormData] = useState<Partial<Student>>({
    name: student.name,
    email: student.email,
    department: student.department,
    year: student.year,
    semester: student.semester,
    cgpa: student.cgpa,
    backlogs: student.backlogs,
    attendance: student.attendance,
    weeklyLogins: student.weeklyLogins ?? student.lms_login_freq_weekly ?? 4,
    assignmentCompletion: student.assignmentCompletion ?? student.lms_completion_rate ?? 80,
    aptitudeScore: student.aptitudeScore ?? student.aptitude_score ?? 60,
    codingScore: student.codingScore ?? student.coding_score ?? 60,
    internalMarks: student.internalMarks ?? student.mock_interview_score ?? 70,
    certifications: student.certifications ?? student.certifications_count ?? 0,
    hackathons: student.hackathons ?? student.hackathons_count ?? 0,
    clubsActive: student.clubsActive ?? student.clubs_active ?? 0,
    notes: student.notes || "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPromoting, setIsPromoting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? (value === "" ? 0 : parseFloat(value)) : value,
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const updated = await studentsApi.update(student.id, formData);
      onSuccess(updated);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to update student metrics.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePromote = async () => {
    if (!confirm(`Promote ${student.name} to Semester ${Math.min(8, (student.semester || 1) + 1)}?`)) return;
    setIsPromoting(true);
    setError(null);
    try {
      const updated = await studentsApi.promote(student.id);
      setFormData((prev) => ({
        ...prev,
        semester: updated.semester,
        year: updated.year,
      }));
      onSuccess(updated);
    } catch (err: any) {
      setError(err.message || "Failed to promote student.");
    } finally {
      setIsPromoting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl glass-panel rounded-3xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto border border-white/15 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl glass-button-secondary text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Edit Student Telemetry</h2>
              <p className="text-xs text-slate-400">
                Updating marks or attendance automatically recalculates the 5 pillars &amp; SSS score.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handlePromote}
            disabled={isPromoting || (student.semester || 1) >= 8}
            className="px-3.5 py-2 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-300 hover:bg-purple-500/30 text-xs font-semibold flex items-center gap-1.5 shrink-0 transition"
          >
            <ArrowUpCircle className="w-4 h-4 text-purple-400" />
            {isPromoting ? "Promoting..." : `Promote to Sem ${(student.semester || 1) + 1}`}
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 rounded-xl glass-input text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Campus Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 rounded-xl glass-input text-xs"
              />
            </div>
          </div>

          {/* Academic & Attendance */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400">Academic &amp; Attendance</h4>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-slate-300 mb-1">CGPA (0–10)</label>
                <input
                  type="number"
                  step="0.05"
                  min={0}
                  max={10}
                  name="cgpa"
                  value={formData.cgpa}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 rounded-lg glass-input text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-300 mb-1">Backlogs</label>
                <input
                  type="number"
                  min={0}
                  max={30}
                  name="backlogs"
                  value={formData.backlogs}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 rounded-lg glass-input text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-300 mb-1">Attendance %</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  name="attendance"
                  value={formData.attendance}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 rounded-lg glass-input text-xs font-mono"
                />
              </div>
            </div>
          </div>

          {/* Placement & Coding */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-teal-400">Placement &amp; Skills</h4>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-slate-300 mb-1">Aptitude (0-100)</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  name="aptitudeScore"
                  value={formData.aptitudeScore}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 rounded-lg glass-input text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-300 mb-1">Coding Score (0-100)</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  name="codingScore"
                  value={formData.codingScore}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 rounded-lg glass-input text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-300 mb-1">Mock Interview (0-100)</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  name="internalMarks"
                  value={formData.internalMarks}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 rounded-lg glass-input text-xs font-mono"
                />
              </div>
            </div>
          </div>

          {/* LMS */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400">LMS &amp; Engagement</h4>
            <div className="grid grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] text-slate-300 mb-1">Weekly Logins</label>
                <input
                  type="number"
                  min={0}
                  max={7}
                  name="weeklyLogins"
                  value={formData.weeklyLogins}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 rounded-lg glass-input text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-300 mb-1">LMS %</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  name="assignmentCompletion"
                  value={formData.assignmentCompletion}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 rounded-lg glass-input text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-300 mb-1">Certifications</label>
                <input
                  type="number"
                  min={0}
                  max={30}
                  name="certifications"
                  value={formData.certifications}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 rounded-lg glass-input text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-300 mb-1">Hackathons</label>
                <input
                  type="number"
                  min={0}
                  max={30}
                  name="hackathons"
                  value={formData.hackathons}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 rounded-lg glass-input text-xs font-mono"
                />
              </div>
            </div>
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Faculty Remarks</label>
            <textarea
              name="notes"
              rows={2}
              value={formData.notes}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-xl glass-input text-xs"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl glass-button-secondary text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl glass-button-primary text-xs font-semibold text-white flex items-center gap-2"
            >
              {isSubmitting ? "Recalculating..." : "Save & Recalculate SSS"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
