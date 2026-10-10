import React, { useState, useEffect } from "react";
import {
  Trophy,
  Award,
  Medal,
  Code2,
  ShieldCheck,
  Clock,
  GraduationCap,
  GitBranch,
  Sparkles,
  Flame,
  Lock,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  Users,
  Target,
  BarChart2,
  RefreshCw,
} from "lucide-react";
import { StudentBenchmarks, BadgeItem } from "../types";
import { studentsApi } from "../services/api";

interface PeerBenchmarkingViewProps {
  studentId: string;
  studentName?: string;
  initialBenchmarks?: StudentBenchmarks | null;
  className?: string;
}

const BADGE_ICONS: Record<string, React.FC<{ className?: string }>> = {
  Code2,
  ShieldCheck,
  Trophy,
  Clock,
  Award,
  GraduationCap,
  GitBranch,
  Sparkles,
  Flame,
};

export const PeerBenchmarkingView: React.FC<PeerBenchmarkingViewProps> = ({
  studentId,
  studentName = "Student",
  initialBenchmarks = null,
  className = "",
}) => {
  const [benchmarks, setBenchmarks] = useState<StudentBenchmarks | null>(initialBenchmarks);
  const [loading, setLoading] = useState<boolean>(!initialBenchmarks);
  const [error, setError] = useState<string | null>(null);

  const fetchBenchmarks = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await studentsApi.getBenchmarks(studentId);
      setBenchmarks(data);
    } catch (err: any) {
      console.error("Failed to load student benchmarks:", err);
      setError(err?.message || "Failed to load peer benchmarking data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!initialBenchmarks && studentId) {
      fetchBenchmarks();
    } else if (initialBenchmarks) {
      setBenchmarks(initialBenchmarks);
    }
  }, [studentId, initialBenchmarks]);

  if (loading) {
    return (
      <div className={`p-10 bg-slate-900/50 border border-slate-800 rounded-2xl text-center ${className}`}>
        <RefreshCw className="w-8 h-8 mx-auto text-indigo-400 animate-spin mb-3" />
        <p className="text-sm font-medium text-slate-300">Calculating cohort percentiles...</p>
        <p className="text-xs text-slate-500 mt-1">Analyzing department metrics across active student cohorts</p>
      </div>
    );
  }

  if (error || !benchmarks) {
    return (
      <div className={`p-8 bg-slate-900/50 border border-rose-900/30 rounded-2xl text-center ${className}`}>
        <p className="text-sm text-rose-400 font-medium">{error || "No benchmarking data available."}</p>
        <button
          onClick={fetchBenchmarks}
          className="mt-3 px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Retry
        </button>
      </div>
    );
  }

  const { overall_rank, overall_percentile, total_peers, cohort_name, metrics } = benchmarks;

  const getPercentileColor = (pct: number) => {
    if (pct >= 85) return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
    if (pct >= 60) return "text-indigo-400 bg-indigo-500/10 border-indigo-500/20";
    if (pct >= 35) return "text-amber-400 bg-amber-500/10 border-amber-500/20";
    return "text-rose-400 bg-rose-500/10 border-rose-500/20";
  };

  const getProgressGradient = (pct: number) => {
    if (pct >= 85) return "from-emerald-500 to-teal-400";
    if (pct >= 60) return "from-indigo-500 to-cyan-400";
    if (pct >= 35) return "from-amber-500 to-yellow-400";
    return "from-rose-500 to-orange-400";
  };

  const metricConfigs = [
    {
      key: "sss_score",
      label: "Smart Success Score (SSS)",
      unit: "pts",
      data: metrics.sss_score,
      color: "indigo",
    },
    {
      key: "cgpa",
      label: "Cumulative CGPA",
      unit: "CGPA",
      data: metrics.cgpa,
      color: "emerald",
    },
    {
      key: "coding_score",
      label: "Coding Readiness",
      unit: "pts",
      data: metrics.coding_score,
      color: "amber",
    },
    {
      key: "attendance",
      label: "Classroom Attendance",
      unit: "%",
      data: metrics.attendance,
      color: "cyan",
    },
    {
      key: "lms_completion",
      label: "LMS Module Completion",
      unit: "%",
      data: metrics.lms_completion,
      color: "purple",
    },
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* ── Top Cohort Benchmark Banner ── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-950/70 via-slate-900/90 to-purple-950/50 border border-indigo-500/30 rounded-2xl p-6 backdrop-blur-md shadow-xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {cohort_name}
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Users className="w-3.5 h-3.5" /> {total_peers} peers in cohort
              </span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <Trophy className="w-6 h-6 text-amber-400" />
              Peer Benchmarking
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Anonymous percentile performance metrics compared against departmental peers.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Cohort Rank Card */}
            <div className="bg-slate-900/80 border border-indigo-500/40 rounded-xl px-4 py-3 min-w-[130px] text-center shadow-lg">
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">Cohort Rank</span>
              <div className="text-2xl font-extrabold text-amber-400 mt-0.5">
                #{overall_rank} <span className="text-xs font-normal text-slate-400">/ {total_peers}</span>
              </div>
              <span className="text-[11px] text-emerald-400 font-semibold">Top {(100 - overall_percentile + 0.1).toFixed(1)}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 5-Pillar Peer Benchmarking Cards ── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
              Department Cohort Percentiles (Anonymous Benchmark)
            </h3>
          </div>
          <span className="text-xs text-slate-500">Calculated across department roster</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {metricConfigs.map((m) => {
            if (!m.data) return null;
            const pct = m.data.percentile;
            const isTop10 = pct >= 90;

            return (
              <div
                key={m.key}
                className="bg-slate-900/60 border border-slate-800/80 hover:border-slate-700/80 rounded-2xl p-4 transition-all duration-200"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-xs font-medium text-slate-400 block">{m.label}</span>
                    <div className="text-2xl font-bold text-white mt-1">
                      {m.data.student_value} <span className="text-xs font-normal text-slate-400">{m.unit}</span>
                    </div>
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${getPercentileColor(pct)}`}>
                    {pct >= 50 ? `Top ${(100 - pct + 0.1).toFixed(0)}%` : `P${pct.toFixed(0)}`}
                  </span>
                </div>

                {/* Percentile Progress Gauge */}
                <div className="mt-4">
                  <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                    <span>Percentile Rank: <strong className="text-slate-200">{pct}%</strong></span>
                    <span>Rank: <strong className="text-slate-200">#{m.data.rank}</strong> of {m.data.total_cohort}</span>
                  </div>
                  <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${getProgressGradient(pct)} transition-all duration-700`}
                      style={{ width: `${Math.min(100, Math.max(5, pct))}%` }}
                    />
                  </div>
                </div>

                {/* Cohort Comparison Bar Stats */}
                <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <div>
                    <span className="block text-[10px] text-slate-500 uppercase">Dept Average</span>
                    <span className="font-semibold text-slate-300">{m.data.dept_average} {m.unit}</span>
                  </div>
                  <div className="text-right">
                    <span className="block text-[10px] text-amber-500 uppercase flex items-center justify-end gap-1">
                      <Sparkles className="w-2.5 h-2.5" /> Top 10% Dept
                    </span>
                    <span className="font-semibold text-amber-300">{m.data.dept_top_10} {m.unit}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
