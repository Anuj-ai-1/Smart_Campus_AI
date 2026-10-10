import React, { useState, useEffect } from "react";
import { Student } from "../types";
import { studentsApi } from "../services/api";
import {
  Briefcase,
  CheckCircle2,
  XCircle,
  Download,
  Filter,
  Users,
  Building2,
  Search,
  Sparkles,
} from "lucide-react";

export function PlacementEligibilityView() {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Criteria
  const [minCgpa, setMinCgpa] = useState<number>(7.0);
  const [maxBacklogs, setMaxBacklogs] = useState<number>(0);
  const [minCodingScore, setMinCodingScore] = useState<number>(60);
  const [minAttendance, setMinAttendance] = useState<number>(75);
  const [selectedDept, setSelectedDept] = useState<string>("all");
  const [companyName, setCompanyName] = useState<string>("Google / Microsoft (Tier-1)");

  const loadStudents = async () => {
    setIsLoading(true);
    try {
      const data = await studentsApi.getAll();
      setStudents(data);
    } catch (err) {
      console.error("Could not fetch students for placement engine:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  // Filter evaluation
  const eligibleStudents = students.filter((s) => {
    if (selectedDept !== "all" && s.department !== selectedDept) return false;
    if (s.cgpa < minCgpa) return false;
    if (s.backlogs > maxBacklogs) return false;
    const coding = s.codingScore ?? s.coding_score ?? 0;
    if (coding < minCodingScore) return false;
    if (s.attendance < minAttendance) return false;
    return true;
  });

  const exportEligibleCSV = () => {
    if (eligibleStudents.length === 0) return;
    const headers = "Student ID,Name,Email,Department,Year,CGPA,Coding Score,Attendance,SSS Score,Risk Status\n";
    const rows = eligibleStudents
      .map(
        (s) =>
          `"${s.student_id || s.id}","${s.name}","${s.email}","${s.department}","${s.year}","${s.cgpa}","${
            s.codingScore ?? s.coding_score ?? 0
          }","${s.attendance}%","${s.score ?? s.success_score ?? 0}","${s.risk}"`
      )
      .join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `placement_eligible_cohort_${companyName.replace(/[^a-zA-Z0-9]/g, "_")}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-teal-400" />
            Campus Placement Eligibility Engine
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Configure multi-metric drive criteria to filter interview-ready candidates and export shortlisted rosters.
          </p>
        </div>

        <button
          onClick={exportEligibleCSV}
          disabled={eligibleStudents.length === 0}
          className="px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold transition flex items-center gap-2 shrink-0 disabled:opacity-40"
        >
          <Download className="w-4 h-4" />
          Export Shortlisted Roster ({eligibleStudents.length} Students)
        </button>
      </div>

      {/* Filter Control Console */}
      <div className="p-5 rounded-3xl glass-panel border border-white/10 space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-indigo-400" />
            Drive Hiring Criteria
          </span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Target Role / Drive:</span>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="px-2.5 py-1 text-xs glass-input rounded-lg text-white font-semibold"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div>
            <label className="block text-[11px] text-slate-300 mb-1">Min. CGPA</label>
            <input
              type="number"
              step="0.1"
              min={5.0}
              max={10.0}
              value={minCgpa}
              onChange={(e) => setMinCgpa(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-1.5 rounded-xl glass-input text-xs font-mono"
            />
          </div>

          <div>
            <label className="block text-[11px] text-slate-300 mb-1">Max Backlogs Allowed</label>
            <input
              type="number"
              min={0}
              max={5}
              value={maxBacklogs}
              onChange={(e) => setMaxBacklogs(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-1.5 rounded-xl glass-input text-xs font-mono"
            />
          </div>

          <div>
            <label className="block text-[11px] text-slate-300 mb-1">Min. Coding Assessment</label>
            <input
              type="number"
              min={0}
              max={100}
              value={minCodingScore}
              onChange={(e) => setMinCodingScore(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-1.5 rounded-xl glass-input text-xs font-mono"
            />
          </div>

          <div>
            <label className="block text-[11px] text-slate-300 mb-1">Min. Attendance %</label>
            <input
              type="number"
              min={0}
              max={100}
              value={minAttendance}
              onChange={(e) => setMinAttendance(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-1.5 rounded-xl glass-input text-xs font-mono"
            />
          </div>

          <div>
            <label className="block text-[11px] text-slate-300 mb-1">Department</label>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl glass-input text-xs"
            >
              <option value="all">All Departments</option>
              <option value="CSE">CSE</option>
              <option value="IT">IT</option>
              <option value="ECE">ECE</option>
              <option value="ME">ME</option>
              <option value="EEE">EEE</option>
            </select>
          </div>
        </div>

        {/* Quick KPI stats banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-3 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-between">
            <span className="text-xs text-teal-300 font-semibold">Eligible Candidates</span>
            <span className="text-lg font-bold text-teal-300">{eligibleStudents.length}</span>
          </div>

          <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-between">
            <span className="text-xs text-rose-300 font-semibold">Filtered Out / Ineligible</span>
            <span className="text-lg font-bold text-rose-300">
              {Math.max(0, students.length - eligibleStudents.length)}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-between">
            <span className="text-xs text-indigo-300 font-semibold">Cohort Eligibility Rate</span>
            <span className="text-lg font-bold text-indigo-300">
              {students.length > 0
                ? `${((eligibleStudents.length / students.length) * 100).toFixed(1)}%`
                : "0%"}
            </span>
          </div>
        </div>
      </div>

      {/* Roster Table */}
      <div className="p-5 rounded-3xl glass-panel border border-white/10 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-teal-400" />
            Shortlisted Candidates ({eligibleStudents.length})
          </span>
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading candidates...</div>
        ) : eligibleStudents.length === 0 ? (
          <div className="py-12 text-center rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
            <XCircle className="w-8 h-8 text-slate-500 mx-auto" />
            <p className="text-xs font-bold text-white">No students match current threshold criteria.</p>
            <p className="text-[11px] text-slate-400">Try lowering minimum CGPA or coding score thresholds.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-white/10">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/5 border-b border-white/10 text-slate-400 font-semibold">
                <tr>
                  <th className="p-3">Student ID</th>
                  <th className="p-3">Candidate Name</th>
                  <th className="p-3">Email Address</th>
                  <th className="p-3">Dept &amp; Year</th>
                  <th className="p-3">CGPA</th>
                  <th className="p-3">Coding Score</th>
                  <th className="p-3">Attendance</th>
                  <th className="p-3">SSS Score</th>
                  <th className="p-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono text-slate-300">
                {eligibleStudents.map((s) => (
                  <tr key={s.id || s.student_id} className="hover:bg-white/5 transition">
                    <td className="p-3 text-teal-400 font-bold">{s.student_id || s.id}</td>
                    <td className="p-3 font-sans font-semibold text-white">{s.name}</td>
                    <td className="p-3 font-sans text-slate-300">{s.email}</td>
                    <td className="p-3 font-sans">
                      {s.department} · Year {s.year}
                    </td>
                    <td className="p-3">{s.cgpa}</td>
                    <td className="p-3 text-indigo-400 font-bold">
                      {s.codingScore ?? s.coding_score ?? 0}/100
                    </td>
                    <td className="p-3">{s.attendance}%</td>
                    <td className="p-3 text-emerald-400 font-bold">
                      {s.score ?? s.success_score ?? 0}
                    </td>
                    <td className="p-3 text-right font-sans">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        Eligible
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
