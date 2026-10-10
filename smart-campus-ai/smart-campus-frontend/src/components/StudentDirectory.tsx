import React, { useState, useEffect, useMemo } from "react";
import { Student, CohortItem } from "../types";
import { studentsApi } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { Search, Filter, Eye, Trash2, Plus, AlertTriangle, ShieldCheck, Sparkles, ChevronRight } from "lucide-react";

interface StudentDirectoryProps {
  onSelectStudent: (student: Student) => void;
  onOpenAddModal: () => void;
  onOpenBulkModal?: () => void;
}

export function StudentDirectory({ onSelectStudent, onOpenAddModal, onOpenBulkModal }: StudentDirectoryProps) {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dept, setDept] = useState("all");
  const [semester, setSemester] = useState("all");
  const [division, setDivision] = useState("all");
  const [year, setYear] = useState("all");
  const [risk, setRisk] = useState("all");
  const [isPromoting, setIsPromoting] = useState(false);

  // Parse assigned cohorts if faculty
  const assignedCohorts: CohortItem[] = useMemo(() => {
    if (user?.role !== "faculty") return [];
    try {
      if (typeof user?.assigned_cohorts === "string") {
        return JSON.parse(user.assigned_cohorts);
      }
      return Array.isArray(user?.assigned_cohorts) ? user.assigned_cohorts : [];
    } catch {
      return [];
    }
  }, [user]);

  // Available dropdown options for Faculty (constrained) vs Admin (all)
  const availableDepts = useMemo(() => {
    if (user?.role === "faculty" && assignedCohorts.length > 0) {
      return Array.from(new Set(assignedCohorts.map((c) => c.department)));
    }
    return ["CSE", "ECE", "ME", "IT", "EEE"];
  }, [user, assignedCohorts]);

  const availableSemesters = useMemo(() => {
    if (user?.role === "faculty" && assignedCohorts.length > 0) {
      const filtered = dept === "all" ? assignedCohorts : assignedCohorts.filter((c) => c.department === dept);
      return Array.from(new Set(filtered.map((c) => Number(c.semester)))).sort((a, b) => a - b);
    }
    return [1, 2, 3, 4, 5, 6, 7, 8];
  }, [user, assignedCohorts, dept]);

  const availableDivisions = useMemo(() => {
    if (user?.role === "faculty" && assignedCohorts.length > 0) {
      const filtered = assignedCohorts.filter((c) => {
        const deptMatch = dept === "all" || c.department === dept;
        const semMatch = semester === "all" || c.semester === parseInt(semester);
        return deptMatch && semMatch;
      });
      return Array.from(new Set(filtered.map((c) => c.division))).sort();
    }
    return ["A", "B", "C", "D"];
  }, [user, assignedCohorts, dept, semester]);

  const fetchStudents = async () => {
    setIsLoading(true);
    try {
      const data = await studentsApi.getAll({
        department: dept === "all" ? undefined : dept,
        year: year === "all" ? undefined : year,
        semester: semester === "all" ? undefined : parseInt(semester),
        division: division === "all" ? undefined : division,
        risk_status: risk === "all" ? undefined : risk,
        search: search.trim() || undefined,
      });
      setStudents(data);
    } catch (err) {
      console.error("Failed to load students:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchStudents();
    }, 250);
    return () => clearTimeout(timer);
  }, [dept, semester, division, year, risk, search]);

  const [actionMessage, setActionMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleBatchPromote = async () => {
    const targetDept = dept === "all" ? undefined : dept;
    const targetYear = year === "all" ? undefined : parseInt(year);
    if (!window.confirm(`Promote all filtered students (${students.length}) to next semester?`)) return;

    setIsPromoting(true);
    try {
      const res = await studentsApi.batchPromote({ department: targetDept, year: targetYear });
      setActionMessage({ type: "success", text: res.message });
      setTimeout(() => setActionMessage(null), 4000);
      fetchStudents();
    } catch (err: any) {
      setActionMessage({ type: "error", text: err.message || "Failed to batch promote." });
      setTimeout(() => setActionMessage(null), 4000);
    } finally {
      setIsPromoting(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete student ${id}?`)) return;
    try {
      await studentsApi.delete(id);
      setStudents((prev) => prev.filter((s) => s.id !== id && s.student_id !== id));
      setActionMessage({ type: "success", text: "Student deleted successfully." });
      setTimeout(() => setActionMessage(null), 4000);
    } catch (err: any) {
      setActionMessage({ type: "error", text: err.message || "Failed to delete student." });
      setTimeout(() => setActionMessage(null), 4000);
    }
  };

  return (
    <div className="space-y-5 relative">
      {/* Action Toast */}
      {actionMessage && (
        <div className={`fixed bottom-6 right-6 z-50 p-4 rounded-2xl border shadow-2xl flex items-center gap-3 animate-slide-up-fade backdrop-blur-xl ${
          actionMessage.type === "success" 
            ? "bg-emerald-950/80 border-emerald-500/30 text-emerald-300 shadow-emerald-900/20" 
            : "bg-rose-950/80 border-rose-500/30 text-rose-300 shadow-rose-900/20"
        }`}>
          {actionMessage.type === "success" ? <ShieldCheck className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
          <p className="text-sm font-semibold">{actionMessage.text}</p>
          <button onClick={() => setActionMessage(null)} className="ml-2 text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Bento Header Module */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 bento-card">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Student Directory
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-300 font-mono font-medium">
              {students.length} Records
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Multi-cohort student records with live SSS indicators and division filters.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Batch Promote Button */}
          <button
            onClick={handleBatchPromote}
            disabled={isPromoting || students.length === 0}
            className="px-3 py-2 rounded-xl glass-button-secondary text-xs font-medium flex items-center gap-1.5 transition disabled:opacity-40"
          >
            {isPromoting ? "Promoting..." : "Promote (+1 Sem)"}
          </button>

          {/* Bulk Import Button */}
          {onOpenBulkModal && (
            <button
              onClick={onOpenBulkModal}
              className="px-3 py-2 rounded-xl glass-button-secondary text-xs font-medium flex items-center gap-1.5 transition"
            >
              CSV Import
            </button>
          )}

          {/* Add Student Record Button */}
          <button
            onClick={onOpenAddModal}
            className="glass-button-primary px-3.5 py-2 rounded-xl text-xs font-medium flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Add Student
          </button>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="p-3.5 bento-card flex flex-wrap items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search student, ID, or email..."
            className="w-full pl-9 pr-3.5 py-1.5 glass-input text-xs text-white placeholder-slate-500"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Department / Branch */}
          <select
            value={dept}
            onChange={(e) => setDept(e.target.value)}
            className="px-2.5 py-1.5 glass-input text-xs text-slate-200"
          >
            <option value="all">{user?.role === "faculty" ? "All My Branches" : "All Branches"}</option>
            {availableDepts.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          {/* Semester */}
          <select
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
            className="px-2.5 py-1.5 glass-input text-xs text-slate-200"
          >
            <option value="all">All Semesters</option>
            {availableSemesters.map((s) => (
              <option key={s} value={s}>Sem {s}</option>
            ))}
          </select>

          {/* Division */}
          <select
            value={division}
            onChange={(e) => setDivision(e.target.value)}
            className="px-2.5 py-1.5 glass-input text-xs text-slate-200"
          >
            <option value="all">All Divisions</option>
            {availableDivisions.map((div) => (
              <option key={div} value={div}>Div {div}</option>
            ))}
          </select>

          {/* Risk Level */}
          <select
            value={risk}
            onChange={(e) => setRisk(e.target.value)}
            className="px-2.5 py-1.5 glass-input text-xs text-slate-200"
          >
            <option value="all">All Risk Statuses</option>
            <option value="Academic Risk">Academic Risk</option>
            <option value="Placement Risk">Placement Risk</option>
            <option value="Safe">Safe</option>
            <option value="High">High Risk Level</option>
            <option value="Moderate">Moderate Risk</option>
            <option value="Good">Good Standing</option>
          </select>
        </div>
      </div>

      {/* Bento Table Card */}
      <div className="bento-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/[0.06] bg-black/30 text-[11px] font-semibold text-slate-400">
                <th className="py-3.5 px-4">Student Profile</th>
                <th className="py-3.5 px-4">Dept & Year</th>
                <th className="py-3.5 px-4 text-center">CGPA</th>
                <th className="py-3.5 px-4 text-center">Attendance</th>
                <th className="py-3.5 px-4 text-center">Placement</th>
                <th className="py-3.5 px-4 text-center">Success Score</th>
                <th className="py-3.5 px-4">Risk Flags & Segment</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs text-slate-200">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <div className="w-6 h-6 border-2 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin mx-auto mb-2" />
                    Loading student records...
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No students match the selected filters.
                  </td>
                </tr>
              ) : (
                students.map((s) => {
                  const score = s.score ?? s.success_score ?? s.successScore ?? 0;
                  const scoreColor = score >= 75 ? "text-emerald-400" : score >= 55 ? "text-amber-400" : "text-rose-400";
                  const flags = s.risk_flags || s.riskFlags || [];
                  const isSafe = flags.includes("Safe");

                  return (
                    <tr
                      key={s.id || s.student_id}
                      onClick={() => onSelectStudent(s)}
                      className="hover:bg-white/[0.04] cursor-pointer transition-colors group"
                    >
                      {/* Name & ID */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center font-bold text-xs text-white">
                            {s.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-white group-hover:text-indigo-300 transition-colors">
                              {s.name}
                            </p>
                            <span className="text-[11px] font-mono text-slate-400">{s.id || s.student_id}</span>
                          </div>
                        </div>
                      </td>

                      {/* Dept & Year & Cohort */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 font-semibold text-[11px] text-slate-300">
                            {s.department}
                          </span>
                          <span className="text-[11px] text-slate-300 font-medium">Sem {s.semester || s.year * 2}</span>
                          <span className="px-1.5 py-0.2 rounded bg-teal-500/10 text-teal-300 font-mono text-[10px] font-bold">
                            Div {s.division || "A"}
                          </span>
                        </div>
                      </td>

                      {/* CGPA */}
                      <td className="py-3.5 px-4 text-center font-mono">
                        <span className={s.cgpa < 6.5 ? "text-rose-400 font-bold" : "text-slate-200"}>
                          {s.cgpa.toFixed(1)}
                        </span>
                        {s.backlogs > 0 && (
                          <span className="block text-[10px] text-rose-400 font-medium">
                            {s.backlogs} backlog{s.backlogs > 1 ? "s" : ""}
                          </span>
                        )}
                      </td>

                      {/* Attendance */}
                      <td className="py-3.5 px-4 text-center font-mono">
                        <span className={s.attendance < 75 ? "text-rose-400 font-bold" : "text-slate-200"}>
                          {s.attendance}%
                        </span>
                      </td>

                      {/* Placement */}
                      <td className="py-3.5 px-4 text-center font-mono">
                        <span className="text-cyan-400">
                          {s.pillars?.placement ?? Math.round((s.codingScore + s.aptitudeScore) / 2)}
                        </span>
                      </td>

                      {/* Success Score SSS */}
                      <td className="py-3.5 px-4 text-center font-mono font-bold">
                        <span className={`px-2.5 py-1 rounded-xl bg-white/5 border border-white/10 ${scoreColor}`}>
                          {score}
                        </span>
                      </td>

                      {/* Risk & Segment */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col gap-1 items-start">
                          <div className="flex items-center gap-1.5">
                            {flags.map((fl) => (
                              <span
                                key={fl}
                                className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${
                                  fl === "Safe"
                                    ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                                    : fl === "Academic Risk"
                                    ? "bg-rose-500/15 text-rose-300 border-rose-500/30"
                                    : "bg-amber-500/15 text-amber-300 border-amber-500/30"
                                }`}
                              >
                                {fl}
                              </span>
                            ))}
                          </div>
                          {s.segment && (
                            <span className="text-[10px] text-slate-400 italic">
                              {s.segment}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onSelectStudent(s)}
                            title="Inspect 360 Profile"
                            className="p-1.5 rounded-lg glass-button-secondary text-slate-300 hover:text-white"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => handleDelete(e, s.id || s.student_id || "")}
                            title="Delete Student"
                            className="p-1.5 rounded-lg glass-button-secondary text-slate-400 hover:text-rose-400"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
