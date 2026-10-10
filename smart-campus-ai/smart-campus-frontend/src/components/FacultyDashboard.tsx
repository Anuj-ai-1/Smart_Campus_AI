import React, { useState, useEffect } from "react";
import { AnalyticsOverview, Student } from "../types";
import { analyticsApi, studentsApi } from "../services/api";
import {
  Users,
  Gauge,
  AlertTriangle,
  Briefcase,
  TrendingUp,
  Sparkles,
  BarChart2,
  PieChart,
} from "lucide-react";
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  BarChart,
  Bar,
  Cell,
  ReferenceLine,
  CartesianGrid,
} from "recharts";

interface FacultyDashboardProps {
  onSelectStudentById: (id: string) => void;
  onOpenDirectory: () => void;
}

export function FacultyDashboard({ onSelectStudentById, onOpenDirectory }: FacultyDashboardProps) {
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchOverview() {
      try {
        const data = await analyticsApi.getOverview();
        setOverview(data);
      } catch (err) {
        console.error("Failed to fetch analytics overview:", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchOverview();
  }, []);

  const totalStudents = overview?.total_students ?? overview?.totalStudents ?? 0;
  const avgScore = overview?.average_success_score ?? overview?.averageSuccessScore ?? 0;
  const academicRisks = overview?.academic_risk_count ?? overview?.academicRiskCount ?? 0;
  const placementRisks = overview?.placement_risk_count ?? overview?.placementRiskCount ?? 0;
  const deptData = overview?.department_breakdown || overview?.departmentBreakdown || [];
  const scatterPoints = overview?.quadrant_data || overview?.quadrantData || [];

  const kpis = [
    {
      label: "Total Students",
      value: totalStudents,
      sub: "Active enrolled cohort",
      icon: Users,
      glow: "from-indigo-500/20 to-purple-500/10 border-indigo-500/30 text-indigo-400",
    },
    {
      label: "Avg Success Score",
      value: `${avgScore}`,
      sub: "Campus composite SSS",
      icon: Gauge,
      glow: "from-teal-500/20 to-emerald-500/10 border-teal-500/30 text-teal-400",
    },
    {
      label: "Academic Risk",
      value: academicRisks,
      sub: "CGPA < 6.5 or backlogs",
      icon: AlertTriangle,
      glow: "from-rose-500/20 to-red-500/10 border-rose-500/30 text-rose-400",
    },
    {
      label: "Placement Risk",
      value: placementRisks,
      sub: "Placement pillar < 60",
      icon: Briefcase,
      glow: "from-amber-500/20 to-orange-500/10 border-amber-500/30 text-amber-400",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Bento Header Module */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 bento-card animate-stagger-1">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Cohort Telemetry
            </h1>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white/5 text-slate-300 border border-white/10">
              Live Overview
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Macro-level performance indicators, risk distribution, and scatter telemetry for your assigned cohorts.
          </p>
        </div>

        <button
          onClick={onOpenDirectory}
          className="glass-button-secondary px-3.5 py-2 text-xs font-medium flex items-center gap-1.5"
        >
          Open Directory →
        </button>
      </div>

      {/* Bento Grid: Key Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 animate-stagger-2">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              className="p-4 rounded-2xl bento-card flex flex-col justify-between hover:scale-[1.02] transition-transform duration-300 cursor-default"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400">{kpi.label}</span>
                <div className={`w-7 h-7 rounded-lg bg-gradient-to-tr ${kpi.glow} border flex items-center justify-center shadow-lg`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-2xl sm:text-3xl font-bold text-white font-mono tracking-tight drop-shadow-sm">
                  {isLoading ? "—" : kpi.value}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5 font-medium">{kpi.sub}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Row: Quadrant Scatter (Academic vs Placement) & Department Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-stagger-3">

        {/* Quadrant Scatter Chart */}
        <div className="lg:col-span-7 p-6 rounded-3xl glass-card border border-white/10 flex flex-col justify-between shadow-2xl relative overflow-hidden">
          {/* Ambient Glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-[80px] pointer-events-none" />
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-400" />
                Academic vs Placement Quadrant Scatter
              </h3>
              <span className="text-[11px] text-slate-400">Click any dot to inspect 360 profile</span>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              X-axis: Academic Health Pillar | Y-axis: Placement Readiness Pillar
            </p>
          </div>

          <div className="w-full h-80 relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.04)" />
                <XAxis
                  type="number"
                  dataKey="x"
                  name="Academic Pillar"
                  domain={[0, 100]}
                  unit="%"
                  tick={{ fill: "#64748b", fontSize: 11 }}
                  axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                  tickLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                />
                <YAxis
                  type="number"
                  dataKey="y"
                  name="Placement Pillar"
                  domain={[0, 100]}
                  unit="%"
                  tick={{ fill: "#64748b", fontSize: 11 }}
                  axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                  tickLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                />
                <ZAxis type="number" dataKey="z" range={[80, 200]} />
                <ReferenceLine x={70} stroke="rgba(99, 102, 241, 0.4)" strokeDasharray="4 4" />
                <ReferenceLine y={60} stroke="rgba(20, 184, 166, 0.4)" strokeDasharray="4 4" />
                <Tooltip
                  cursor={{ strokeDasharray: "3 3", stroke: "rgba(255,255,255,0.1)" }}
                  content={({ payload }) => {
                    if (!payload || !payload.length) return null;
                    const d = payload[0].payload;
                    return (
                      <div className="p-3.5 rounded-xl bg-black/90 border border-white/10 text-xs text-slate-200 shadow-2xl backdrop-blur-xl">
                        <p className="font-bold text-white text-sm">{d.name}</p>
                        <p className="text-[11px] font-mono text-indigo-400 mb-2">{d.id}</p>
                        <div className="space-y-1 text-[11px]">
                          <div className="flex justify-between gap-4"><span className="text-slate-400">Academic Pillar:</span> <span className="font-bold text-white">{d.x}%</span></div>
                          <div className="flex justify-between gap-4"><span className="text-slate-400">Placement Pillar:</span> <span className="font-bold text-white">{d.y}%</span></div>
                          <div className="flex justify-between gap-4 border-t border-white/10 pt-1 mt-1"><span className="text-slate-300 font-medium">Success Score (SSS):</span> <span className="font-bold text-teal-400">{d.score}</span></div>
                        </div>
                      </div>
                    );
                  }}
                />
                <Scatter
                  name="Students"
                  data={scatterPoints}
                  onClick={(node) => {
                    if (node?.id) onSelectStudentById(node.id);
                  }}
                >
                  {scatterPoints.map((entry, index) => {
                    const color =
                      entry.risk === "High"
                        ? "#f43f5e"
                        : entry.risk === "Moderate"
                        ? "#f59e0b"
                        : "#10b981";
                    return <Cell key={`cell-${index}`} fill={color} style={{ filter: `drop-shadow(0 0 4px ${color}80)` }} className="cursor-pointer hover:opacity-80 transition-opacity" />;
                  })}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-6 mt-2 text-[11px] text-slate-400 relative z-10">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" /> Good Standing</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]" /> Moderate Risk</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]" /> Critical / High Risk</span>
          </div>
        </div>

        {/* Department Success Breakdown Bar Chart */}
        <div className="lg:col-span-5 p-6 rounded-3xl glass-card border border-white/10 flex flex-col justify-between shadow-2xl relative overflow-hidden animate-stagger-4">
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-500/5 rounded-full blur-[80px] pointer-events-none" />
          
          <div className="relative z-10">
            <h3 className="text-base font-bold text-white flex items-center gap-2 mb-1">
              <BarChart2 className="w-4 h-4 text-teal-400" />
              Department Success Breakdown
            </h3>
            <p className="text-xs text-slate-400 mb-4">Average composite SSS scores by department</p>
          </div>

          <div className="w-full h-80 relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptData} margin={{ top: 20, right: 10, left: -20, bottom: 10 }}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.2}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.04)" vertical={false} />
                <XAxis dataKey="department" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                  content={({ payload }) => {
                    if (!payload || !payload.length) return null;
                    const d = payload[0].payload;
                    return (
                      <div className="p-3.5 rounded-xl bg-black/90 border border-white/10 text-xs text-slate-200 shadow-2xl backdrop-blur-xl">
                        <p className="font-bold text-white text-sm mb-2">{d.department} Department</p>
                        <div className="space-y-1">
                          <div className="flex justify-between gap-4"><span className="text-slate-400">Total Students:</span> <span className="font-bold text-white">{d.total_students}</span></div>
                          <div className="flex justify-between gap-4"><span className="text-slate-400">Avg Success Score:</span> <span className="font-bold text-teal-400">{d.average_score}</span></div>
                          <div className="flex justify-between gap-4"><span className="text-slate-400">High Risk:</span> <span className="font-medium text-rose-400">{d.high_risk}</span></div>
                          <div className="flex justify-between gap-4"><span className="text-slate-400">Moderate Risk:</span> <span className="font-medium text-amber-400">{d.moderate_risk}</span></div>
                        </div>
                      </div>
                    );
                  }}
                />
                <Bar dataKey="average_score" radius={[6, 6, 0, 0]} fill="url(#colorScore)" barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="text-[11px] text-slate-500 text-center mt-2 relative z-10 font-medium">
            Higher composite scores indicate elevated placement and academic health.
          </div>
        </div>

      </div>
    </div>
  );
}
