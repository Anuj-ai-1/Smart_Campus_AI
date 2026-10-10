import React, { useState } from "react";
import { Student, Department } from "../types";
import { studentsApi } from "../services/api";
import { X, UserPlus, Check, AlertCircle, Key, Mail } from "lucide-react";

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddStudentModal({ isOpen, onClose, onSuccess }: AddStudentModalProps) {
  const [formData, setFormData] = useState<Partial<Student>>({
    id: "",
    name: "",
    email: "",
    defaultPassword: "Student@123",
    department: "CSE",
    year: 1,
    semester: 1,
    division: "A",
    cgpa: 8.0,
    internalMarks: 80,
    backlogs: 0,
    attendance: 85,
    weeklyLogins: 5,
    assignmentCompletion: 85,
    aptitudeScore: 70,
    codingScore: 75,
    certifications: 1,
    clubsActive: 1,
    hackathons: 1,
    notes: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? (value === "" ? 0 : parseFloat(value)) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    if (!formData.email?.trim()) {
      setError("Student campus email is required so the student can log in.");
      setIsSubmitting(false);
      return;
    }

    try {
      await studentsApi.create(formData);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to create student record.");
    } finally {
      setIsSubmitting(false);
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

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
            <UserPlus className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Enroll New Student</h2>
            <p className="text-xs text-slate-400">
              Adds telemetry to AI models &amp; provisions login credentials with a default password.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Identity Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Student ID *</label>
              <input
                type="text"
                name="id"
                placeholder="e.g. STU1009"
                required
                value={formData.id}
                onChange={handleChange}
                className="w-full px-3.5 py-2 rounded-xl glass-input text-xs font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Full Name *</label>
              <input
                type="text"
                name="name"
                placeholder="e.g. Riya Patel"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3.5 py-2 rounded-xl glass-input text-xs"
              />
            </div>
          </div>

          {/* Login Credentials Provisioning */}
          <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-indigo-400" />
              Student Login Credentials (Enforced Access)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-300 mb-1">Campus Email * (Only this email can login)</label>
                <input
                  type="email"
                  name="email"
                  placeholder="e.g. riya.patel@campus.edu"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg glass-input text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-300 mb-1">Default Initial Password *</label>
                <div className="relative">
                  <input
                    type="text"
                    name="defaultPassword"
                    placeholder="Student@123"
                    required
                    value={formData.defaultPassword}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-lg glass-input text-xs font-mono"
                  />
                </div>
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Student will use this on first login &amp; can change it.
                </span>
              </div>
            </div>
          </div>

          {/* Academic Info */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Department</label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-xl glass-input text-xs"
              >
                <option value="CSE">CSE</option>
                <option value="ECE">ECE</option>
                <option value="ME">ME</option>
                <option value="IT">IT</option>
                <option value="EEE">EEE</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Year (1–4)</label>
              <input
                type="number"
                name="year"
                min={1}
                max={4}
                value={formData.year}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-xl glass-input text-xs"
              >
              </input>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Semester (1–8)</label>
              <input
                type="number"
                name="semester"
                min={1}
                max={8}
                value={formData.semester}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-xl glass-input text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Division / Section</label>
              <select
                name="division"
                value={formData.division || "A"}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-xl glass-input text-xs"
              >
                <option value="A">Division A</option>
                <option value="B">Division B</option>
                <option value="C">Division C</option>
                <option value="D">Division D</option>
              </select>
            </div>
          </div>

          {/* Academic & Attendance Metrics */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400">Academic &amp; Attendance</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-slate-300 mb-1">CGPA (0–10)</label>
                <input
                  type="number"
                  step="0.1"
                  min={0}
                  max={10}
                  name="cgpa"
                  value={formData.cgpa}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 rounded-lg glass-input text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-300 mb-1">Backlogs Count</label>
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
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-slate-300 mb-1">Aptitude Score (0-100)</label>
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
                <label className="block text-[11px] text-slate-300 mb-1">Internal / Mock Score</label>
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

          {/* LMS & Engagement */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400">LMS &amp; Engagement</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] text-slate-300 mb-1">Logins / Week</label>
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
                <label className="block text-[11px] text-slate-300 mb-1">LMS Comp %</label>
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
                  max={50}
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
                  max={50}
                  name="hackathons"
                  value={formData.hackathons}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 rounded-lg glass-input text-xs font-mono"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Faculty Remarks &amp; Advisory Notes</label>
            <textarea
              name="notes"
              rows={2}
              placeholder="e.g. Needs placement prep guidance..."
              value={formData.notes}
              onChange={handleChange}
              className="w-full px-3.5 py-2 rounded-xl glass-input text-xs"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
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
              {isSubmitting ? "Enrolling & Provisioning..." : "Enroll Student & Provision Access"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
