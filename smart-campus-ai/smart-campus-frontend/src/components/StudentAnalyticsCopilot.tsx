import React, { useState } from "react";
import { Student } from "../types";
import {
  BrainCircuit,
  Compass,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Briefcase,
  BookOpen,
  Calendar,
  Layers,
  ChevronRight,
  ShieldAlert,
  Flame,
  Award,
  ExternalLink,
} from "lucide-react";

interface StudentAnalyticsCopilotProps {
  student: Student;
  onOpenSimulator?: () => void;
  onOpenBenchmarks?: () => void;
}

interface GapItem {
  domain: string;
  current: string | number;
  target: string | number;
  gapText: string;
  status: "critical" | "warning" | "optimal";
  recommendedAction: string;
}

interface CareerGoalRequirement {
  role: string;
  minCgpa: number;
  minCoding: number;
  minAptitude: number;
  minCerts: number;
  mandatorySkills: string[];
}

const CAREER_BENCHMARKS: Record<string, CareerGoalRequirement> = {
  "Software Development Engineer (SDE Tier-1)": {
    role: "SDE Tier-1 (Google, Microsoft, Amazon)",
    minCgpa: 8.0,
    minCoding: 80,
    minAptitude: 75,
    minCerts: 2,
    mandatorySkills: ["Data Structures & Algorithms", "System Design", "C++ / Java / Python", "SQL"],
  },
  "Full Stack Web / Cloud Engineer": {
    role: "Full Stack Engineer (Product Startups & MNCs)",
    minCgpa: 7.2,
    minCoding: 70,
    minAptitude: 65,
    minCerts: 2,
    mandatorySkills: ["React / TypeScript", "Node.js / FastAPI", "Docker", "REST APIs"],
  },
  "AI / Machine Learning Engineer": {
    role: "AI / ML Engineer",
    minCgpa: 8.2,
    minCoding: 75,
    minAptitude: 80,
    minCerts: 3,
    mandatorySkills: ["Python", "PyTorch / TensorFlow", "Linear Algebra", "Data Preprocessing"],
  },
  "Data Analyst / BI Specialist": {
    role: "Data Analyst / BI Specialist",
    minCgpa: 7.0,
    minCoding: 60,
    minAptitude: 75,
    minCerts: 1,
    mandatorySkills: ["SQL", "PowerBI / Tableau", "Excel Advanced", "Python (Pandas)"],
  },
  "Cybersecurity & Cloud Analyst": {
    role: "Cybersecurity & Cloud Analyst",
    minCgpa: 7.5,
    minCoding: 65,
    minAptitude: 70,
    minCerts: 2,
    mandatorySkills: ["Computer Networks", "Linux", "AWS / Azure Cloud", "Ethical Hacking"],
  },
};

export function StudentAnalyticsCopilot({
  student,
  onOpenSimulator,
  onOpenBenchmarks,
}: StudentAnalyticsCopilotProps) {
  const currentRoleTarget =
    student.career_preference ||
    student.careerPreference ||
    "Software Development Engineer (SDE Tier-1)";

  const [selectedRole, setSelectedRole] = useState<string>(
    CAREER_BENCHMARKS[currentRoleTarget] ? currentRoleTarget : "Software Development Engineer (SDE Tier-1)"
  );

  const goalProfile = CAREER_BENCHMARKS[selectedRole] || CAREER_BENCHMARKS["Software Development Engineer (SDE Tier-1)"];

  // 1. Compute Gap Analysis
  const codingScore = student.codingScore ?? student.coding_score ?? 0;
  const aptitudeScore = student.aptitudeScore ?? student.aptitude_score ?? 0;
  const cgpa = student.cgpa || 0;
  const attendance = student.attendance || 0;
  const backlogs = student.backlogs || 0;
  const certs = student.certifications ?? student.certifications_count ?? 0;
  const lmsCompletion = student.assignmentCompletion ?? student.lms_completion_rate ?? 0;

  const gaps: GapItem[] = [
    {
      domain: "Coding Readiness",
      current: `${codingScore}/100`,
      target: `>= ${goalProfile.minCoding}/100`,
      gapText:
        codingScore >= goalProfile.minCoding
          ? "Target Achieved! Ready for tech screening."
          : `Deficit: ${goalProfile.minCoding - codingScore} pts required`,
      status: codingScore >= goalProfile.minCoding ? "optimal" : codingScore >= goalProfile.minCoding - 15 ? "warning" : "critical",
      recommendedAction:
        codingScore >= goalProfile.minCoding
          ? "Maintain weekly LeetCode practice and participate in mock campus rounds."
          : "Focus on Daily 2 LeetCode Mediums on Graph & Dynamic Programming.",
    },
    {
      domain: "Academic Health (CGPA)",
      current: cgpa.toFixed(2),
      target: `>= ${goalProfile.minCgpa.toFixed(1)}`,
      gapText:
        cgpa >= goalProfile.minCgpa
          ? "Within Tier-1 Cutoff threshold"
          : `Deficit: ${(goalProfile.minCgpa - cgpa).toFixed(2)} CGPA points`,
      status: cgpa >= goalProfile.minCgpa ? "optimal" : cgpa >= goalProfile.minCgpa - 0.5 ? "warning" : "critical",
      recommendedAction:
        cgpa >= goalProfile.minCgpa
          ? "Maintain regular internal assessment scores >= 80%."
          : "Prioritize end-term theory scoring and submit all lab journals on time.",
    },
    {
      domain: "Aptitude & Analytical Core",
      current: `${aptitudeScore}/100`,
      target: `>= ${goalProfile.minAptitude}/100`,
      gapText:
        aptitudeScore >= goalProfile.minAptitude
          ? "Exceeds standard aptitude screening cutoff"
          : `Deficit: ${goalProfile.minAptitude - aptitudeScore} pts required`,
      status: aptitudeScore >= goalProfile.minAptitude ? "optimal" : aptitudeScore >= goalProfile.minAptitude - 15 ? "warning" : "critical",
      recommendedAction:
        aptitudeScore >= goalProfile.minAptitude
          ? "Periodic test series refresh to keep speed and accuracy high."
          : "Practice Quantitative Aptitude (Time & Work, Permutations, Probability).",
    },
    {
      domain: "Exam Attendance Compliance",
      current: `${attendance}%`,
      target: ">= 75.0% Mandatory",
      gapText:
        attendance >= 75
          ? "Safe from examination debarment"
          : `CRITICAL DEBARMENT RISK: Shortfall of ${(75 - attendance).toFixed(1)}%`,
      status: attendance >= 75 ? "optimal" : "critical",
      recommendedAction:
        attendance >= 75
          ? "Maintain consistent morning lecture attendance."
          : "Attend all upcoming lectures for 14 continuous days without leave to cross 75%.",
    },
    {
      domain: "Industry Certifications",
      current: `${certs} verified`,
      target: `>= ${goalProfile.minCerts} verified`,
      gapText:
        certs >= goalProfile.minCerts
          ? "Satisfies role portfolio criteria"
          : `Deficit: ${goalProfile.minCerts - certs} domain certificate(s)`,
      status: certs >= goalProfile.minCerts ? "optimal" : "warning",
      recommendedAction:
        certs >= goalProfile.minCerts
          ? "Showcase badges on LinkedIn and GitHub README."
          : "Complete an industry certification (AWS Cloud Practitioner or Coursera Meta Specialization).",
    },
  ];

  // Missing Skills Check
  const studentSkills = (student.skills || []).map((s) => s.toLowerCase());
  const missingSkills = goalProfile.mandatorySkills.filter(
    (skill) => !studentSkills.some((s) => s.includes(skill.toLowerCase()) || skill.toLowerCase().includes(s))
  );

  // Overall Match Percentage
  const optimalCount = gaps.filter((g) => g.status === "optimal").length;
  const matchPercentage = Math.round((optimalCount / gaps.length) * 100);

  // Next Milestone Actions (Prescriptive 4-Week Roadmap)
  const roadmapSteps = [
    {
      week: "Week 1 - 2",
      title: "Foundational Bridge & Compliance",
      focus: attendance < 75 ? "Attendance Recovery" : "Aptitude Drill",
      description:
        attendance < 75
          ? `Attend 100% of lectures to pull attendance from ${attendance}% above 75%.`
          : "Complete 3 timed aptitude tests on quantitative problem-solving.",
      badge: attendance < 75 ? "High Urgency" : "Quick Win",
    },
    {
      week: "Week 3",
      title: "Core Skill Gap Closing",
      focus: missingSkills.length > 0 ? `Learn ${missingSkills[0]}` : "DSA Practice",
      description:
        missingSkills.length > 0
          ? `Work through a guided project implementing ${missingSkills[0]} to add to portfolio.`
          : "Solve 15 LeetCode Medium problems targeting Trees & Graphs.",
      badge: "Skill Builder",
    },
    {
      week: "Week 4",
      title: "Mock Evaluation & Placement Readiness",
      focus: "Simulated Technical Interview",
      description: "Take an automated AI or mentor mock interview and review code review metrics.",
      badge: "Final Stretch",
    },
  ];

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Bento Header Module */}
      <div className="p-5 bento-card relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 font-mono text-[11px] font-medium border border-indigo-500/20 flex items-center gap-1.5">
                <BrainCircuit className="w-3 h-3 text-indigo-400" />
                Career Copilot
              </span>
              <span className="text-[10px] text-slate-400 bg-white/5 px-2 py-0.5 rounded-full border border-white/5">
                Target Benchmark
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Recruitment Gap &amp; Milestone Analytics
            </h2>
            <p className="text-xs text-slate-400 max-w-2xl">
              Compare your current scores against technical interview cutoffs and follow your tailored 4-week roadmap.
            </p>
          </div>

          {/* Goal Selector Pill */}
          <div className="flex flex-col items-end gap-2 shrink-0">
            <label className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
              Target Dream Role
            </label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="px-3.5 py-2 rounded-xl bg-slate-900 border border-indigo-500/40 text-xs font-semibold text-white focus:outline-none focus:border-indigo-400 shadow-lg cursor-pointer"
            >
              {Object.keys(CAREER_BENCHMARKS).map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Readiness Score Breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-6 pt-5 border-t border-white/10">
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-400 block">Dream Role Match Index</span>
              <span
                className={`text-2xl font-black font-mono mt-0.5 block ${
                  matchPercentage >= 80 ? "text-emerald-400" : matchPercentage >= 50 ? "text-amber-400" : "text-rose-400"
                }`}
              >
                {matchPercentage}%
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Compass className="w-5 h-5" />
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-400 block">Active Backlog Impact</span>
              <span
                className={`text-2xl font-black font-mono mt-0.5 block ${
                  backlogs === 0 ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                {backlogs === 0 ? "0 Backlogs (Clean)" : `${backlogs} Backlog(s)`}
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-400 block">ML Student Segment</span>
              <span className="text-sm font-bold text-teal-300 mt-1 block truncate max-w-[180px]">
                {student.segment || "Academic Scholar"}
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 flex items-center justify-center text-teal-400">
              <Award className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 1: DETAILED GAP ANALYSIS MATRIX */}
      <div className="p-6 rounded-3xl glass-card border border-white/10 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              Recruitment Cutoff Gap Analysis Matrix
            </h3>
            <p className="text-xs text-slate-400">
              Target benchmark: <strong>{goalProfile.role}</strong>
            </p>
          </div>
          {onOpenSimulator && (
            <button
              onClick={onOpenSimulator}
              className="text-xs px-3 py-1.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 transition flex items-center gap-1.5 font-semibold"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
              Simulate Score Growth ➔
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {gaps.map((item, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-2xl border transition flex flex-col justify-between ${
                item.status === "optimal"
                  ? "bg-emerald-950/20 border-emerald-500/30"
                  : item.status === "warning"
                  ? "bg-amber-950/20 border-amber-500/30"
                  : "bg-rose-950/20 border-rose-500/30"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-white tracking-wide">{item.domain}</span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                      item.status === "optimal"
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        : item.status === "warning"
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                        : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>

                <div className="flex items-baseline justify-between text-xs py-1">
                  <span className="text-slate-400 font-medium">Your Score:</span>
                  <span className="font-mono font-bold text-white text-sm">{item.current}</span>
                </div>
                <div className="flex items-baseline justify-between text-xs py-1 border-b border-white/5">
                  <span className="text-slate-400 font-medium">Target Cutoff:</span>
                  <span className="font-mono font-semibold text-slate-300">{item.target}</span>
                </div>

                <p
                  className={`text-[11px] font-semibold mt-2.5 ${
                    item.status === "optimal"
                      ? "text-emerald-300"
                      : item.status === "warning"
                      ? "text-amber-300"
                      : "text-rose-300"
                  }`}
                >
                  {item.gapText}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-white/5">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold mb-0.5">
                  Actionable Next Step:
                </span>
                <p className="text-[11px] text-slate-200 leading-snug">{item.recommendedAction}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 2: SKILLS REPERTOIRE & MISSING GAPS */}
      <div className="p-6 rounded-3xl glass-card border border-teal-500/20 bg-teal-950/10 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-teal-400" />
              Technical Skill Audit for {selectedRole}
            </h3>
            <p className="text-xs text-slate-400">
              Comparison between your verified skills and recruiters&apos; top required competencies.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Missing In-Demand Skills */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-amber-500/30 space-y-2">
            <span className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              Missing High-Impact Skills ({missingSkills.length}):
            </span>
            <div className="flex flex-wrap gap-2 pt-1">
              {missingSkills.map((sk) => (
                <span
                  key={sk}
                  className="px-3 py-1 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-200 text-xs font-semibold flex items-center gap-1"
                >
                  + Add &amp; Learn {sk}
                </span>
              ))}
              {missingSkills.length === 0 && (
                <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> All core skills for this role are already in your portfolio!
                </span>
              )}
            </div>
          </div>

          {/* Student's Verified Skills */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-teal-500/30 space-y-2">
            <span className="text-xs font-bold text-teal-300 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
              Your Active Portfolio Skills ({(student.skills || []).length}):
            </span>
            <div className="flex flex-wrap gap-2 pt-1">
              {(student.skills || []).map((sk) => (
                <span
                  key={sk}
                  className="px-3 py-1 rounded-xl bg-teal-500/15 border border-teal-500/30 text-teal-200 text-xs font-semibold"
                >
                  {sk}
                </span>
              ))}
              {(student.skills || []).length === 0 && (
                <span className="text-xs text-slate-400 italic">
                  No skills listed yet. Use &quot;Edit My Profile &amp; Portfolio&quot; to add them!
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: PRESCRIPTIVE 4-WEEK ROADMAP */}
      <div className="p-6 rounded-3xl glass-card border border-indigo-500/20 bg-indigo-950/20 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-400" />
              Personalized 4-Week Action Roadmap
            </h3>
            <p className="text-xs text-slate-400">
              Step-by-step milestones to raise your Student Success Score (SSS) and bridge cutoff deficits.
            </p>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 font-mono font-bold">
            Curated by AI
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {roadmapSteps.map((step, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-slate-900/70 border border-white/10 space-y-2 hover:border-indigo-500/30 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-mono text-indigo-400 font-bold uppercase">{step.week}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-300 font-semibold">
                    {step.badge}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-white tracking-wide">{step.title}</h4>
                <p className="text-[11px] text-teal-300 font-semibold mt-1">Focus: {step.focus}</p>
                <p className="text-[11px] text-slate-300 mt-1.5 leading-relaxed">{step.description}</p>
              </div>

              <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-indigo-400 font-semibold">
                <span>Phase {idx + 1} Target</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
