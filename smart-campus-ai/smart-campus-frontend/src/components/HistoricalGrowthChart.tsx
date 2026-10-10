import React, { useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
} from "recharts";
import {
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Award,
  Zap,
  Activity,
  Layers,
  BookOpen,
  Calendar,
  Briefcase,
  MonitorCheck,
  Flame,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Filter,
} from "lucide-react";
import { SemesterHistoryPoint } from "../types";

interface HistoricalGrowthChartProps {
  history?: SemesterHistoryPoint[];
  currentSemester?: number;
  studentName?: string;
  className?: string;
}

type MetricType = "sss" | "cgpa" | "attendance" | "coding" | "all";

export const HistoricalGrowthChart: React.FC<HistoricalGrowthChartProps> = ({
  history = [],
  currentSemester = 1,
  studentName = "",
  className = "",
}) => {
  const [viewMode, setViewMode] = useState<"overall" | "semester">("overall");
  const [selectedSemNumber, setSelectedSemNumber] = useState<number>(currentSemester);
  const [activeMetric, setActiveMetric] = useState<MetricType>("sss");

  // Format data points for Recharts
  const data = (history && history.length > 0 ? history : []).map((pt) => ({
    name: `Sem ${pt.semester}`,
    semester: pt.semester,
    sss: Number((pt.successScore ?? pt.success_score ?? 0).toFixed(1)),
    cgpa: Number(pt.cgpa.toFixed(2)),
    attendance: Number(pt.attendance.toFixed(1)),
    coding: Number((pt.codingScore ?? pt.coding_score ?? 0).toFixed(1)),
    academic: Number((pt.academicPillar ?? pt.academic_pillar ?? 75).toFixed(1)),
    attendancePillar: Number((pt.attendancePillar ?? pt.attendance_pillar ?? pt.attendance ?? 80).toFixed(1)),
    placement: Number((pt.placementPillar ?? pt.placement_pillar ?? 70).toFixed(1)),
    lms: Number((pt.lmsPillar ?? pt.lms_pillar ?? 72).toFixed(1)),
    engagement: Number((pt.engagementPillar ?? pt.engagement_pillar ?? 68).toFixed(1)),
    backlogs: Number(pt.backlogs ?? 0),
  }));

  if (data.length === 0) {
    return (
      <div className={`p-8 bg-slate-900/40 border border-slate-800 rounded-2xl text-center text-slate-400 ${className}`}>
        <Activity className="w-8 h-8 mx-auto text-slate-500 mb-2 animate-pulse" />
        <p className="text-sm font-medium">No historical semester checkpoints available yet.</p>
        <p className="text-xs text-slate-500 mt-1">Growth progression points will unlock as semester milestones are recorded.</p>
      </div>
    );
  }

  // Active selected semester data point
  const activeSemData =
    data.find((d) => d.semester === selectedSemNumber) || data[data.length - 1];

  // Radar chart data for the currently selected semester
  const semRadarData = [
    { subject: "Academic Health", score: activeSemData.academic, fullMark: 100 },
    { subject: "Attendance", score: activeSemData.attendance, fullMark: 100 },
    { subject: "Placement Ready", score: activeSemData.placement, fullMark: 100 },
    { subject: "LMS Engagement", score: activeSemData.lms, fullMark: 100 },
    { subject: "Activity & Hacks", score: activeSemData.engagement, fullMark: 100 },
  ];

  // Calculate overall trajectory metrics
  const firstPt = data[0];
  const lastPt = data[data.length - 1];

  const getMetricSummary = () => {
    switch (activeMetric) {
      case "cgpa": {
        const diff = Number((lastPt.cgpa - firstPt.cgpa).toFixed(2));
        const pct = firstPt.cgpa > 0 ? ((diff / firstPt.cgpa) * 100).toFixed(1) : "0.0";
        const best = [...data].sort((a, b) => b.cgpa - a.cgpa)[0];
        return {
          current: `${lastPt.cgpa} / 10`,
          diff,
          diffText: `${diff >= 0 ? "+" : ""}${diff} CGPA (${diff >= 0 ? "+" : ""}${pct}%)`,
          isPositive: diff >= 0,
          bestLabel: `Sem ${best.semester} (${best.cgpa})`,
          unit: "",
        };
      }
      case "attendance": {
        const diff = Number((lastPt.attendance - firstPt.attendance).toFixed(1));
        const best = [...data].sort((a, b) => b.attendance - a.attendance)[0];
        return {
          current: `${lastPt.attendance}%`,
          diff,
          diffText: `${diff >= 0 ? "+" : ""}${diff}% vs Sem 1`,
          isPositive: diff >= 0,
          bestLabel: `Sem ${best.semester} (${best.attendance}%)`,
          unit: "%",
        };
      }
      case "coding": {
        const diff = Number((lastPt.coding - firstPt.coding).toFixed(1));
        const best = [...data].sort((a, b) => b.coding - a.coding)[0];
        return {
          current: `${lastPt.coding} / 100`,
          diff,
          diffText: `${diff >= 0 ? "+" : ""}${diff} pts vs Sem 1`,
          isPositive: diff >= 0,
          bestLabel: `Sem ${best.semester} (${best.coding} pts)`,
          unit: "pts",
        };
      }
      default: {
        const diff = Number((lastPt.sss - firstPt.sss).toFixed(1));
        const pct = firstPt.sss > 0 ? ((diff / firstPt.sss) * 100).toFixed(1) : "0.0";
        const best = [...data].sort((a, b) => b.sss - a.sss)[0];
        return {
          current: `${lastPt.sss} pts`,
          diff,
          diffText: `${diff >= 0 ? "+" : ""}${diff} pts (${diff >= 0 ? "+" : ""}${pct}%)`,
          isPositive: diff >= 0,
          bestLabel: `Sem ${best.semester} (${best.sss} pts)`,
          unit: "pts",
        };
      }
    }
  };

  const summary = getMetricSummary();

  const getTrajectoryStatus = () => {
    if (summary.diff > 5) return { label: "High Growth Velocity 🚀", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" };
    if (summary.diff >= 0) return { label: "Steady Progression 📈", color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20" };
    return { label: "Mild Dip - Mentoring Recommended ⚠️", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" };
  };

  const trajectory = getTrajectoryStatus();

  return (
    <div className={`bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 backdrop-blur-md space-y-6 ${className}`}>
      {/* ── TOP LEVEL NAVIGATION: OVERALL TRAJECTORY VS SEMESTER-WISE BREAKDOWN ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-400" />
            <h3 className="text-lg font-bold text-white tracking-tight">Academic Growth &amp; Semester Analytics</h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Toggle between multi-semester trajectory trends and deep-dive semester performance cards.
          </p>
        </div>

        {/* View Mode Toggle: Overall vs Semester-Wise */}
        <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-950/80 border border-slate-800 self-start lg:self-auto">
          <button
            onClick={() => setViewMode("overall")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              viewMode === "overall"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Overall Trajectory (Sem 1-{currentSemester})</span>
          </button>

          <button
            onClick={() => setViewMode("semester")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              viewMode === "semester"
                ? "bg-teal-600 text-white shadow-lg shadow-teal-600/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Semester-Wise Performance</span>
          </button>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* ── VIEW 1: OVERALL MULTI-SEMESTER TRAJECTORY CHART ────────── */}
      {/* ───────────────────────────────────────────────────────────── */}
      {viewMode === "overall" ? (
        <div className="space-y-6">
          {/* Metric Selector Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Select Primary Metric:
            </span>

            <div className="flex items-center gap-1 bg-slate-950/70 p-1 rounded-xl border border-slate-800 text-xs overflow-x-auto">
              <button
                onClick={() => setActiveMetric("sss")}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap cursor-pointer ${
                  activeMetric === "sss"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                SSS Score
              </button>
              <button
                onClick={() => setActiveMetric("cgpa")}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap cursor-pointer ${
                  activeMetric === "cgpa"
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                CGPA
              </button>
              <button
                onClick={() => setActiveMetric("attendance")}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap cursor-pointer ${
                  activeMetric === "attendance"
                    ? "bg-cyan-600 text-white shadow-md shadow-cyan-600/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Attendance
              </button>
              <button
                onClick={() => setActiveMetric("coding")}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap cursor-pointer ${
                  activeMetric === "coding"
                    ? "bg-amber-600 text-white shadow-md shadow-amber-600/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Coding
              </button>
              <button
                onClick={() => setActiveMetric("all")}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap cursor-pointer ${
                  activeMetric === "all"
                    ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Multi-Metric
              </button>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-slate-950/50 border border-slate-800/80 rounded-2xl p-4">
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">Current Score</span>
              <div className="text-2xl font-bold text-white mt-1 font-mono">{summary.current}</div>
              <span className="text-[11px] text-slate-400">At Semester {currentSemester}</span>
            </div>

            <div className="bg-slate-950/50 border border-slate-800/80 rounded-2xl p-4">
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">Cumulative Change</span>
              <div className={`text-2xl font-bold flex items-center gap-1 mt-1 font-mono ${summary.isPositive ? "text-emerald-400" : "text-rose-400"}`}>
                {summary.isPositive ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                {summary.diffText}
              </div>
              <span className="text-[11px] text-slate-400">Compared to Sem 1 baseline</span>
            </div>

            <div className="bg-slate-950/50 border border-slate-800/80 rounded-2xl p-4">
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">Peak Milestone</span>
              <div className="text-2xl font-bold text-amber-400 mt-1 flex items-center gap-1.5 font-mono">
                <Award className="w-5 h-5 text-amber-400" />
                {summary.bestLabel}
              </div>
              <span className="text-[11px] text-slate-400">All-time semester high</span>
            </div>

            <div className="bg-slate-950/50 border border-slate-800/80 rounded-2xl p-4">
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">Trajectory Vector</span>
              <div className={`text-xs font-semibold px-2.5 py-1.5 rounded-xl border inline-block mt-2 ${trajectory.color}`}>
                {trajectory.label}
              </div>
            </div>
          </div>

          {/* Recharts Canvas */}
          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              {activeMetric === "all" ? (
                <LineChart data={data} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderColor: "#334155",
                      borderRadius: "0.75rem",
                      color: "#f8fafc",
                      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.5)",
                    }}
                  />
                  <Line type="monotone" dataKey="sss" name="SSS Score" stroke="#818cf8" strokeWidth={3} dot={{ r: 4, fill: "#818cf8" }} />
                  <Line type="monotone" dataKey="attendance" name="Attendance %" stroke="#22d3ee" strokeWidth={2} dot={{ r: 3, fill: "#22d3ee" }} />
                  <Line type="monotone" dataKey="coding" name="Coding Score" stroke="#fbbf24" strokeWidth={2} dot={{ r: 3, fill: "#fbbf24" }} />
                  <Line type="monotone" dataKey="cgpa" name="CGPA (x10)" stroke="#10b981" strokeWidth={2} dot={{ r: 3, fill: "#10b981" }} />
                </LineChart>
              ) : activeMetric === "cgpa" ? (
                <AreaChart data={data} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="cgpaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} domain={[0, 10]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderColor: "#334155",
                      borderRadius: "0.75rem",
                      color: "#f8fafc",
                    }}
                    formatter={(value: any) => [`${value} / 10.0`, "Cumulative CGPA"]}
                  />
                  <Area type="monotone" dataKey="cgpa" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#cgpaGrad)" dot={{ r: 5, fill: "#10b981" }} />
                </AreaChart>
              ) : activeMetric === "attendance" ? (
                <AreaChart data={data} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="attGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} domain={[40, 100]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderColor: "#334155",
                      borderRadius: "0.75rem",
                      color: "#f8fafc",
                    }}
                    formatter={(value: any) => [`${value}%`, "Attendance Rate"]}
                  />
                  <Area type="monotone" dataKey="attendance" stroke="#06b6d4" strokeWidth={3} fillOpacity={1} fill="url(#attGrad)" dot={{ r: 5, fill: "#06b6d4" }} />
                </AreaChart>
              ) : activeMetric === "coding" ? (
                <AreaChart data={data} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="codeGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderColor: "#334155",
                      borderRadius: "0.75rem",
                      color: "#f8fafc",
                    }}
                    formatter={(value: any) => [`${value} / 100`, "Coding Readiness"]}
                  />
                  <Area type="monotone" dataKey="coding" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#codeGrad)" dot={{ r: 5, fill: "#f59e0b" }} />
                </AreaChart>
              ) : (
                <AreaChart data={data} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="sssGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} domain={[20, 100]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderColor: "#334155",
                      borderRadius: "0.75rem",
                      color: "#f8fafc",
                    }}
                    formatter={(value: any) => [`${value} pts`, "Smart Success Score"]}
                  />
                  <Area type="monotone" dataKey="sss" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#sssGrad)" dot={{ r: 5, fill: "#6366f1" }} />
                </AreaChart>
              )}
            </ResponsiveContainer>
          </div>

          {/* Quick Summary Table Across All Semesters */}
          <div className="pt-4 border-t border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
              Historical Checkpoints Summary
            </h4>
            <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/40">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/80 text-slate-400 font-semibold border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Semester</th>
                    <th className="py-3 px-4">SSS Score</th>
                    <th className="py-3 px-4">CGPA</th>
                    <th className="py-3 px-4">Attendance</th>
                    <th className="py-3 px-4">Coding Score</th>
                    <th className="py-3 px-4">Active Backlogs</th>
                    <th className="py-3 px-4 text-right">Inspect</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {data.map((sem) => (
                    <tr
                      key={sem.semester}
                      className="hover:bg-slate-900/50 transition cursor-pointer"
                      onClick={() => {
                        setSelectedSemNumber(sem.semester);
                        setViewMode("semester");
                      }}
                    >
                      <td className="py-3 px-4 font-bold text-white flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center text-[11px] font-mono">
                          {sem.semester}
                        </span>
                        <span>Semester {sem.semester}</span>
                        {sem.semester === currentSemester && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            Current
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-indigo-300">
                        {sem.sss} pts
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold text-emerald-400">
                        {sem.cgpa} / 10
                      </td>
                      <td className="py-3 px-4 font-mono text-cyan-300">
                        {sem.attendance}%
                      </td>
                      <td className="py-3 px-4 font-mono text-amber-300">
                        {sem.coding} / 100
                      </td>
                      <td className="py-3 px-4">
                        {sem.backlogs === 0 ? (
                          <span className="text-emerald-400 font-medium">0 Clean</span>
                        ) : (
                          <span className="text-rose-400 font-bold">{sem.backlogs} Backlog</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="text-[11px] text-teal-400 hover:underline inline-flex items-center gap-1 font-semibold">
                          View Deep-Dive <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* ───────────────────────────────────────────────────────────── */
        /* ── VIEW 2: SEMESTER-WISE DEEP-DIVE PERFORMANCE BREAKDOWN ──── */
        /* ───────────────────────────────────────────────────────────── */
        <div className="space-y-6">
          {/* Semester Selector Carousel / Pills */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-teal-400" />
              Choose Semester to Inspect:
            </span>
            <div className="flex flex-wrap items-center gap-2">
              {data.map((sem) => {
                const isSelected = sem.semester === selectedSemNumber;
                return (
                  <button
                    key={sem.semester}
                    onClick={() => setSelectedSemNumber(sem.semester)}
                    className={`px-4 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                      isSelected
                        ? "bg-teal-500 text-slate-950 font-extrabold shadow-lg shadow-teal-500/25"
                        : "bg-slate-950/70 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700"
                    }`}
                  >
                    <span>Semester {sem.semester}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-md font-mono ${
                        isSelected ? "bg-black/20 text-slate-950" : "bg-white/10 text-slate-300"
                      }`}
                    >
                      {sem.sss} SSS
                    </span>
                    {sem.semester === currentSemester && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Semester Performance Card Header */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-teal-950/40 via-slate-900 to-indigo-950/40 border border-teal-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-xl bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  Semester {activeSemData.semester} Milestone
                </span>
                {activeSemData.semester === currentSemester && (
                  <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Active Term
                  </span>
                )}
              </div>
              <h4 className="text-2xl font-black text-white tracking-tight">
                Semester {activeSemData.semester} Performance Audit
              </h4>
              <p className="text-xs text-slate-300 mt-1 max-w-lg">
                Comprehensive 5-pillar telemetry, exam scores, and academic standings for Semester {activeSemData.semester}.
              </p>
            </div>

            <div className="flex items-center gap-4 bg-slate-950/70 px-5 py-3 rounded-2xl border border-white/10">
              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Semester SSS</span>
                <span className="text-3xl font-black text-teal-300 font-mono">{activeSemData.sss}</span>
              </div>
              <div className="h-8 w-px bg-slate-800" />
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">CGPA Record</span>
                <span className="text-2xl font-bold text-emerald-400 font-mono">{activeSemData.cgpa}</span>
              </div>
            </div>
          </div>

          {/* Detailed 5-Pillar Matrix for this specific semester */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Radar Chart of this Semester */}
            <div className="lg:col-span-5 p-6 rounded-3xl bg-slate-950/60 border border-slate-800/80 flex flex-col">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                Semester {activeSemData.semester} Competency Radar
              </h5>
              <p className="text-[11px] text-slate-400 mb-2">5-Pillar balance during this term</p>

              <div className="w-full h-64 flex items-center justify-center my-auto">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={semRadarData} outerRadius="72%">
                    <PolarGrid stroke="rgba(255, 255, 255, 0.1)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: "#94a3b8", fontSize: 10 }} />
                    <Radar
                      name={`Sem ${activeSemData.semester}`}
                      dataKey="score"
                      stroke="#14b8a6"
                      fill="#14b8a6"
                      fillOpacity={0.4}
                      strokeWidth={2}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(15, 23, 42, 0.9)",
                        borderColor: "rgba(255, 255, 255, 0.1)",
                        borderRadius: "12px",
                        color: "#fff",
                        fontSize: "12px",
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Right: Detailed Metric Progress Bars for this Semester */}
            <div className="lg:col-span-7 p-6 rounded-3xl bg-slate-950/60 border border-slate-800/80 space-y-4">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                Semester {activeSemData.semester} Pillar Telemetry
              </h5>

              <div className="space-y-3.5">
                {/* Academic */}
                <div className="p-3.5 rounded-2xl bg-slate-900/50 border border-slate-800">
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                      Academic Health · CGPA {activeSemData.cgpa}
                    </span>
                    <span className="font-mono font-bold text-slate-100">{activeSemData.academic}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-indigo-500 transition-all duration-500"
                      style={{ width: `${Math.min(100, activeSemData.academic)}%` }}
                    />
                  </div>
                </div>

                {/* Attendance */}
                <div className="p-3.5 rounded-2xl bg-slate-900/50 border border-slate-800">
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-teal-400" />
                      Lecture Attendance Rate
                    </span>
                    <span className="font-mono font-bold text-slate-100">{activeSemData.attendance}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        activeSemData.attendance < 75 ? "bg-rose-500" : "bg-teal-500"
                      }`}
                      style={{ width: `${Math.min(100, activeSemData.attendance)}%` }}
                    />
                  </div>
                </div>

                {/* Placement Readiness */}
                <div className="p-3.5 rounded-2xl bg-slate-900/50 border border-slate-800">
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-amber-400" />
                      Placement &amp; Coding · Score {activeSemData.coding} / 100
                    </span>
                    <span className="font-mono font-bold text-slate-100">{activeSemData.placement}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-amber-500 transition-all duration-500"
                      style={{ width: `${Math.min(100, activeSemData.placement)}%` }}
                    />
                  </div>
                </div>

                {/* LMS Coursework */}
                <div className="p-3.5 rounded-2xl bg-slate-900/50 border border-slate-800">
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                      <MonitorCheck className="w-3.5 h-3.5 text-sky-400" />
                      LMS Coursework &amp; Activity
                    </span>
                    <span className="font-mono font-bold text-slate-100">{activeSemData.lms}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-sky-500 transition-all duration-500"
                      style={{ width: `${Math.min(100, activeSemData.lms)}%` }}
                    />
                  </div>
                </div>

                {/* Verified Engagement */}
                <div className="p-3.5 rounded-2xl bg-slate-900/50 border border-slate-800">
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                      <Flame className="w-3.5 h-3.5 text-rose-400" />
                      Co-curricular &amp; Technical Engagement
                    </span>
                    <span className="font-mono font-bold text-slate-100">{activeSemData.engagement}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-rose-500 transition-all duration-500"
                      style={{ width: `${Math.min(100, activeSemData.engagement)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
