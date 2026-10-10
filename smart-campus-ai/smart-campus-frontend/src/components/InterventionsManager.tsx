import React, { useState, useEffect } from "react";
import { Intervention } from "../types";
import { interventionsApi } from "../services/api";
import { useAuth } from "../context/AuthContext";
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  Calendar,
  Check,
  Send,
  Trash2,
  Award,
  Sparkles,
} from "lucide-react";

interface InterventionsManagerProps {
  studentId: string;
  isStudentPortal?: boolean;
}

export function InterventionsManager({ studentId, isStudentPortal = false }: InterventionsManagerProps) {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Intervention[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [activeNoteTaskId, setActiveNoteTaskId] = useState<string | null>(null);
  const [completionNote, setCompletionNote] = useState("");

  // New task form state (for faculty)
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    category: "Academic",
    due_date: "",
  });

  const loadTasks = async () => {
    setIsLoading(true);
    try {
      const data = await interventionsApi.list(studentId);
      setTasks(data);
    } catch (err) {
      console.error("Could not fetch interventions:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (studentId) {
      loadTasks();
    }
  }, [studentId]);

  const [actionMessage, setActionMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;
    try {
      await interventionsApi.create({
        student_id: studentId,
        title: newTask.title.trim(),
        description: newTask.description.trim(),
        category: newTask.category,
        due_date: newTask.due_date,
      });
      setNewTask({ title: "", description: "", category: "Academic", due_date: "" });
      setIsAdding(false);
      setActionMessage({ type: "success", text: "Mentoring task assigned successfully." });
      setTimeout(() => setActionMessage(null), 4000);
      loadTasks();
    } catch (err) {
      setActionMessage({ type: "error", text: "Failed to assign mentoring task." });
      setTimeout(() => setActionMessage(null), 4000);
    }
  };

  const handleStudentComplete = async (taskId: string) => {
    try {
      await interventionsApi.update(taskId, {
        status: "completed",
        student_notes: completionNote.trim() || "Completed by student.",
      });
      setActiveNoteTaskId(null);
      setCompletionNote("");
      setActionMessage({ type: "success", text: "Task marked as completed." });
      setTimeout(() => setActionMessage(null), 4000);
      loadTasks();
    } catch (err) {
      setActionMessage({ type: "error", text: "Failed to mark task completed." });
      setTimeout(() => setActionMessage(null), 4000);
    }
  };

  const handleFacultyVerify = async (taskId: string) => {
    try {
      await interventionsApi.update(taskId, { status: "verified" });
      setActionMessage({ type: "success", text: "Task verified." });
      setTimeout(() => setActionMessage(null), 4000);
      loadTasks();
    } catch (err) {
      setActionMessage({ type: "error", text: "Failed to verify task." });
      setTimeout(() => setActionMessage(null), 4000);
    }
  };

  const handleDelete = async (taskId: string) => {
    if (!confirm("Delete this intervention task?")) return;
    try {
      await interventionsApi.delete(taskId);
      setActionMessage({ type: "success", text: "Task deleted." });
      setTimeout(() => setActionMessage(null), 4000);
      loadTasks();
    } catch (err) {
      setActionMessage({ type: "error", text: "Failed to delete task." });
      setTimeout(() => setActionMessage(null), 4000);
    }
  };

  return (
    <div className="space-y-4 relative">
      {/* Action Toast */}
      {actionMessage && (
        <div className={`fixed bottom-6 right-6 z-50 p-4 rounded-2xl border shadow-2xl flex items-center gap-3 animate-slide-up-fade backdrop-blur-xl ${
          actionMessage.type === "success" 
            ? "bg-emerald-950/80 border-emerald-500/30 text-emerald-300 shadow-emerald-900/20" 
            : "bg-rose-950/80 border-rose-500/30 text-rose-300 shadow-rose-900/20"
        }`}>
          {actionMessage.type === "success" ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <p className="text-sm font-semibold">{actionMessage.text}</p>
          <button onClick={() => setActionMessage(null)} className="ml-2 text-slate-400 hover:text-white">✕</button>
        </div>
      )}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-teal-400" />
            Interventions &amp; Mentoring Remediation
          </h4>
          <p className="text-xs text-slate-400">
            {isStudentPortal
              ? "Actionable recovery milestones assigned to you by your faculty advisor."
              : "Prescribe targeted remedial tasks and verify student resolution milestones."}
          </p>
        </div>

        {!isStudentPortal && !isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="px-3 py-1.5 rounded-xl glass-button-primary text-xs font-semibold flex items-center gap-1.5 text-white"
          >
            <Plus className="w-3.5 h-3.5" />
            Assign Action
          </button>
        )}
      </div>

      {/* Faculty Add Task Drawer */}
      {isAdding && (
        <form onSubmit={handleCreate} className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-300">Assign New Mentoring Action</span>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] text-slate-300 mb-1">Task Title *</label>
              <input
                type="text"
                placeholder="e.g. Complete 20 LeetCode Mediums"
                required
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                className="w-full px-3 py-1.5 rounded-xl glass-input text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-300 mb-1">Category</label>
              <select
                value={newTask.category}
                onChange={(e) => setNewTask({ ...newTask, category: e.target.value })}
                className="w-full px-3 py-1.5 rounded-xl glass-input text-xs"
              >
                <option value="Academic">Academic Mentoring</option>
                <option value="Placement">Placement &amp; Coding</option>
                <option value="Attendance">Attendance Rectification</option>
                <option value="LMS">LMS &amp; Assignments</option>
                <option value="Wellbeing">Counselling / Wellbeing</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] text-slate-300 mb-1">Due Date (Optional)</label>
              <input
                type="date"
                value={newTask.due_date}
                onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                className="w-full px-3 py-1.5 rounded-xl glass-input text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-300 mb-1">Description &amp; Instructions</label>
              <input
                type="text"
                placeholder="Submit screenshot of profile / certificate"
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                className="w-full px-3 py-1.5 rounded-xl glass-input text-xs"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="submit"
              className="px-4 py-2 rounded-xl glass-button-primary text-xs font-semibold text-white"
            >
              Assign to Student
            </button>
          </div>
        </form>
      )}

      {/* Task List */}
      {isLoading ? (
        <div className="p-6 text-center text-xs text-slate-400">Loading intervention milestones...</div>
      ) : tasks.length === 0 ? (
        <div className="p-6 text-center rounded-2xl bg-white/[0.02] border border-white/5 text-xs text-slate-400">
          No remedial interventions assigned yet. Student is currently on standard track.
        </div>
      ) : (
        <div className="space-y-2.5">
          {tasks.map((task) => (
            <div
              key={task.id}
              className={`p-3.5 rounded-2xl border transition-all ${
                task.status === "verified"
                  ? "bg-emerald-500/10 border-emerald-500/25"
                  : task.status === "completed"
                  ? "bg-indigo-500/10 border-indigo-500/25"
                  : "bg-white/5 border-white/10"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                        task.category === "Placement"
                          ? "bg-teal-500/20 text-teal-300"
                          : task.category === "Attendance"
                          ? "bg-amber-500/20 text-amber-300"
                          : "bg-indigo-500/20 text-indigo-300"
                      }`}
                    >
                      {task.category}
                    </span>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                        task.status === "verified"
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : task.status === "completed"
                          ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                          : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                      }`}
                    >
                      {task.status === "verified" && <Award className="w-3 h-3" />}
                      {task.status === "completed" && <CheckCircle2 className="w-3 h-3" />}
                      {task.status === "pending" && <Clock className="w-3 h-3" />}
                      {task.status.toUpperCase()}
                    </span>
                  </div>

                  <p className="text-xs font-bold text-white mt-1">{task.title}</p>
                  {task.description && <p className="text-[11px] text-slate-300">{task.description}</p>}

                  {task.due_date && (
                    <p className="text-[10px] text-slate-400 flex items-center gap-1 pt-0.5">
                      <Calendar className="w-3 h-3 text-slate-500" />
                      Due by: {task.due_date}
                    </p>
                  )}

                  {task.student_notes && (
                    <div className="mt-2 p-2 rounded-xl bg-black/30 border border-white/5 text-[11px] text-slate-300">
                      <span className="font-semibold text-teal-400">Student Submission: </span>
                      {task.student_notes}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {/* Student mark completed */}
                  {isStudentPortal && task.status === "pending" && (
                    <>
                      {activeNoteTaskId === task.id ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            placeholder="Add brief note/link..."
                            value={completionNote}
                            onChange={(e) => setCompletionNote(e.target.value)}
                            className="px-2 py-1 text-[11px] rounded-lg glass-input text-white w-40"
                          />
                          <button
                            onClick={() => handleStudentComplete(task.id)}
                            className="px-2.5 py-1 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold transition flex items-center gap-1"
                          >
                            <Send className="w-3 h-3" />
                            Submit
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setActiveNoteTaskId(task.id)}
                          className="px-3 py-1.5 rounded-xl bg-teal-500/20 hover:bg-teal-500/30 border border-teal-500/30 text-teal-300 text-xs font-semibold transition flex items-center gap-1.5"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Mark Completed
                        </button>
                      )}
                    </>
                  )}

                  {/* Faculty verify */}
                  {!isStudentPortal && task.status === "completed" && (
                    <button
                      onClick={() => handleFacultyVerify(task.id)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-300 text-xs font-semibold transition flex items-center gap-1.5"
                    >
                      <Award className="w-3.5 h-3.5" />
                      Verify Resolution
                    </button>
                  )}

                  {/* Faculty delete */}
                  {!isStudentPortal && (
                    <button
                      onClick={() => handleDelete(task.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 transition"
                      title="Delete action"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
