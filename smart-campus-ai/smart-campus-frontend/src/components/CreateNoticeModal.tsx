import React, { useState } from "react";
import { X, Send, AlertTriangle, Pin, Link as LinkIcon, Sparkles } from "lucide-react";
import { Notice } from "../types";
import { noticesApi } from "../services/api";

interface CreateNoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newNotice: Notice) => void;
  editNotice?: Notice | null;
}

export const CreateNoticeModal: React.FC<CreateNoticeModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  editNotice = null,
}) => {
  const [title, setTitle] = useState(editNotice?.title || "");
  const [content, setContent] = useState(editNotice?.content || "");
  const [category, setCategory] = useState(editNotice?.category || "General");
  const [priority, setPriority] = useState(editNotice?.priority || "Normal");
  const [department, setDepartment] = useState(editNotice?.department || "All");
  const [targetYear, setTargetYear] = useState(editNotice?.target_year || editNotice?.targetYear || "All");
  const [isPinned, setIsPinned] = useState(Boolean(editNotice?.is_pinned || editNotice?.isPinned));
  const [attachmentUrl, setAttachmentUrl] = useState(editNotice?.attachment_url || editNotice?.attachmentUrl || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError("Please provide both a title and announcement content.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const payload = {
        title: title.trim(),
        content: content.trim(),
        category,
        priority,
        department,
        target_year: targetYear,
        is_pinned: isPinned ? 1 : 0,
        attachment_url: attachmentUrl.trim(),
      };

      let result: Notice;
      if (editNotice) {
        result = await noticesApi.update(editNotice.id, payload);
      } else {
        result = await noticesApi.create(payload);
      }

      onSuccess(result);
      onClose();
    } catch (err: any) {
      console.error("Failed to post notice:", err);
      setError(err?.message || "Failed to publish notice.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">
              {editNotice ? "Edit Campus Announcement" : "Publish Campus Notice"}
            </h2>
            <p className="text-xs text-slate-400">
              Broadcast critical information, examination schedules, or placement alerts to campus cohorts.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center gap-2 text-rose-300 text-xs">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Notice Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., TCS Digital Campus Recruitment Drive or Mid-Term Schedule"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700 focus:border-indigo-500 text-sm text-white placeholder-slate-500 focus:outline-none transition"
            />
          </div>

          {/* Category & Priority Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700 focus:border-indigo-500 text-sm text-white focus:outline-none transition"
              >
                <option value="Placement">Placement & Drives</option>
                <option value="Examination">Examination & Results</option>
                <option value="Academic">Academic & Syllabus</option>
                <option value="Event">Event & Hackathon</option>
                <option value="Holiday">Holiday & Circular</option>
                <option value="General">General Announcement</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700 focus:border-indigo-500 text-sm text-white focus:outline-none transition"
              >
                <option value="Normal">Normal</option>
                <option value="High">High Priority</option>
                <option value="Urgent">🚨 Urgent / Critical</option>
              </select>
            </div>
          </div>

          {/* Target Audience: Department & Year */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Target Department
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700 focus:border-indigo-500 text-sm text-white focus:outline-none transition"
              >
                <option value="All">All Departments</option>
                <option value="CSE">Computer Science (CSE)</option>
                <option value="IT">Information Technology (IT)</option>
                <option value="ECE">Electronics (ECE)</option>
                <option value="ME">Mechanical (ME)</option>
                <option value="EEE">Electrical (EEE)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Target Academic Year
              </label>
              <select
                value={targetYear}
                onChange={(e) => setTargetYear(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700 focus:border-indigo-500 text-sm text-white focus:outline-none transition"
              >
                <option value="All">All Years</option>
                <option value="1">1st Year (Freshers)</option>
                <option value="2">2nd Year (Sophomores)</option>
                <option value="3">3rd Year (Pre-Final)</option>
                <option value="4">4th Year (Final Year)</option>
              </select>
            </div>
          </div>

          {/* Pin to Top Checkbox */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Pin className={`w-4 h-4 ${isPinned ? "text-amber-400" : "text-slate-500"}`} />
              <div>
                <span className="text-xs font-bold text-white block">Pin Notice to Top</span>
                <span className="text-[11px] text-slate-400">Keep this notice pinned at the very top of the board banner</span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={isPinned}
              onChange={(e) => setIsPinned(e.target.checked)}
              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-700"
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Notice Content &amp; Instructions *
            </label>
            <textarea
              required
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Provide detailed circular information, instructions, timings, room numbers, or guidelines..."
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700 focus:border-indigo-500 text-sm text-white placeholder-slate-500 focus:outline-none transition resize-none"
            />
          </div>

          {/* Optional Attachment Link */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
              <LinkIcon className="w-3.5 h-3.5 text-slate-400" />
              Attachment URL / Registration Link (Optional)
            </label>
            <input
              type="url"
              value={attachmentUrl}
              onChange={(e) => setAttachmentUrl(e.target.value)}
              placeholder="https://example.com/circular.pdf or registration Google form"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700 focus:border-indigo-500 text-sm text-white placeholder-slate-500 focus:outline-none transition"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-indigo-600/30"
            >
              <Send className="w-3.5 h-3.5" />
              {isSubmitting ? "Publishing..." : editNotice ? "Update Notice" : "Broadcast Notice"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
