import React, { useState } from "react";
import { Student } from "../types";
import { Sliders, TrendingUp, Sparkles, AlertCircle, ArrowUpRight, RotateCcw } from "lucide-react";

interface WhatIfSimulatorProps {
  student: Student;
}

export function WhatIfSimulator({ student }: WhatIfSimulatorProps) {
  // Initial values from student profile
  const [cgpa, setCgpa] = useState<number>(student.cgpa || 7.0);
  const [backlogs, setBacklogs] = useState<number>(student.backlogs || 0);
  const [attendance, setAttendance] = useState<number>(student.attendance || 80);
  const [codingScore, setCodingScore] = useState<number>(student.codingScore ?? student.coding_score ?? 60);
  const [aptitudeScore, setAptitudeScore] = useState<number>(student.aptitudeScore ?? student.aptitude_score ?? 60);
  const [lmsCompletion, setLmsCompletion] = useState<number>(
    student.assignmentCompletion ?? student.lms_completion_rate ?? 80
  );
  const [weeklyLogins, setWeeklyLogins] = useState<number>(
    student.weeklyLogins ?? student.lms_login_freq_weekly ?? 4
  );
  const [certifications, setCertifications] = useState<number>(
    student.certifications ?? student.certifications_count ?? 1
  );
  const [hackathons, setHackathons] = useState<number>(student.hackathons ?? student.hackathons_count ?? 0);

  // Exact 5-pillar formulas from backend scoring.py:
  // - Academic: min(100, max(0, (cgpa / 10 * 100) - (backlogs * 12)))
  // - Placement: (aptitude * 0.35) + (coding * 0.45) + (mock * 0.20)
  // - LMS: (lms_completion * 0.7) + (min(weeklyLogins / 7, 1) * 100 * 0.3)
  // - Engagement: min(100, (certs * 20) + (hackathons * 20) + (20 if attendance >= 80 else 5))
  // - Attendance: min(100, max(0, attendance))
  const mockInterviewScore = student.internalMarks ?? student.mock_interview_score ?? 70;

  const calcAcademic = Math.min(100, Math.max(0, (cgpa / 10.0) * 100.0 - backlogs * 12.0));
  const calcPlacement = Math.min(100, Math.max(0, aptitudeScore * 0.35 + codingScore * 0.45 + mockInterviewScore * 0.2));
  const calcLms = Math.min(100, Math.max(0, lmsCompletion * 0.7 + Math.min(weeklyLogins / 7.0, 1.0) * 100.0 * 0.3));
  const calcAttendance = Math.min(100, Math.max(0, attendance));
  const calcEngagement = Math.min(
    100,
    Math.max(0, certifications * 20.0 + hackathons * 20.0 + (attendance >= 80.0 ? 20.0 : 5.0))
  );

  // SSS = (academic * 0.30) + (attendance * 0.20) + (placement * 0.20) + (lms * 0.15) + (engagement * 0.15)
  const simulatedSss = Number(
    (
      calcAcademic * 0.30 +
      calcAttendance * 0.20 +
      calcPlacement * 0.20 +
      calcLms * 0.15 +
      calcEngagement * 0.15
    ).toFixed(1)
  );

  const currentSss = student.score ?? student.success_score ?? student.successScore ?? 0;
  const delta = Number((simulatedSss - currentSss).toFixed(1));

  const resetAll = () => {
    setCgpa(student.cgpa || 7.0);
    setBacklogs(student.backlogs || 0);
    setAttendance(student.attendance || 80);
    setCodingScore(student.codingScore ?? student.coding_score ?? 60);
    setAptitudeScore(student.aptitudeScore ?? student.aptitude_score ?? 60);
    setLmsCompletion(student.assignmentCompletion ?? student.lms_completion_rate ?? 80);
    setWeeklyLogins(student.weeklyLogins ?? student.lms_login_freq_weekly ?? 4);
    setCertifications(student.certifications ?? student.certifications_count ?? 1);
    setHackathons(student.hackathons ?? student.hackathons_count ?? 0);
  };

  return (
    <div className="p-6 rounded-3xl glass-panel border border-white/10 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Sliders className="w-5 h-5 text-indigo-400" />
            &quot;What-If&quot; Academic &amp; Placement Scenario Simulator
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Adjust the sliders to project how improving your attendance, coding assessments, or CGPA elevates your Success Score.
          </p>
        </div>

        <button
          onClick={resetAll}
          className="px-3 py-1.5 rounded-xl glass-button-secondary text-xs text-slate-300 hover:text-white flex items-center gap-1.5 shrink-0"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset to Actuals
        </button>
      </div>

      {/* Comparison Scoreboard */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/10">
        <div>
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Current SSS Score</p>
          <p className="text-2xl font-black text-white mt-0.5">{currentSss}</p>
          <span className="text-[10px] text-slate-500 font-mono">Actual telemetry baseline</span>
        </div>

        <div>
          <p className="text-[11px] font-semibold text-indigo-300 uppercase tracking-wider">Simulated SSS Score</p>
          <p className="text-2xl font-black text-indigo-400 mt-0.5">{simulatedSss}</p>
          <span className="text-[10px] text-indigo-300/80 font-mono">5-Pillar projection</span>
        </div>

        <div>
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Potential Growth</p>
          <div className="flex items-center gap-2 mt-0.5">
            <p
              className={`text-2xl font-black ${
                delta > 0 ? "text-emerald-400" : delta < 0 ? "text-rose-400" : "text-slate-300"
              }`}
            >
              {delta > 0 ? `+${delta}` : delta} pts
            </p>
            {delta > 0 && <ArrowUpRight className="w-5 h-5 text-emerald-400" />}
          </div>
          <span className="text-[10px] text-slate-400">
            {delta > 10 ? "Massive leap in placement bracket!" : delta > 0 ? "Meaningful score improvement" : "No change"}
          </span>
        </div>
      </div>

      {/* Simulated 5 Pillars Live Health Gauge */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 space-y-3">
        <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
          Projected 5-Pillar Health Decomposition
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-center">
            <span className="text-[10px] text-slate-400 block">Academic</span>
            <span className="text-base font-bold text-indigo-400 font-mono mt-0.5 block">{calcAcademic.toFixed(1)}%</span>
          </div>
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-center">
            <span className="text-[10px] text-slate-400 block">Attendance</span>
            <span className={`text-base font-bold font-mono mt-0.5 block ${calcAttendance < 75 ? "text-rose-400" : "text-teal-400"}`}>
              {calcAttendance.toFixed(1)}%
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-center">
            <span className="text-[10px] text-slate-400 block">Placement</span>
            <span className="text-base font-bold text-amber-400 font-mono mt-0.5 block">{calcPlacement.toFixed(1)}%</span>
          </div>
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-center">
            <span className="text-[10px] text-slate-400 block">LMS Coursework</span>
            <span className="text-base font-bold text-cyan-400 font-mono mt-0.5 block">{calcLms.toFixed(1)}%</span>
          </div>
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-center col-span-2 sm:col-span-1">
            <span className="text-[10px] text-slate-400 block">Engagement</span>
            <span className="text-base font-bold text-purple-400 font-mono mt-0.5 block">{calcEngagement.toFixed(1)}%</span>
          </div>
        </div>
      </div>

      {/* Sliders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Attendance Slider */}
        <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="font-semibold text-slate-300">Attendance Percentage</span>
            <span className="font-mono font-bold text-teal-400">{attendance}%</span>
          </div>
          <input
            type="range"
            min={40}
            max={100}
            step={1}
            value={attendance}
            onChange={(e) => setAttendance(parseFloat(e.target.value))}
            className="w-full accent-teal-400 cursor-pointer"
          />
          <span className="text-[10px] text-slate-400 block">
            {attendance < 75 ? "Debarment risk (< 75%)" : "Safe for semester examinations (>= 75%)"}
          </span>
        </div>

        {/* Coding Score Slider */}
        <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="font-semibold text-slate-300">Coding Assessment Score</span>
            <span className="font-mono font-bold text-indigo-400">{codingScore}/100</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={codingScore}
            onChange={(e) => setCodingScore(parseFloat(e.target.value))}
            className="w-full accent-indigo-400 cursor-pointer"
          />
          <span className="text-[10px] text-slate-400 block">
            {codingScore >= 75 ? "Tier-1 Tech Ready" : codingScore >= 50 ? "Average Readiness" : "Placement risk"}
          </span>
        </div>

        {/* CGPA Slider */}
        <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="font-semibold text-slate-300">Target CGPA</span>
            <span className="font-mono font-bold text-purple-400">{cgpa.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min={4.0}
            max={10.0}
            step={0.1}
            value={cgpa}
            onChange={(e) => setCgpa(parseFloat(e.target.value))}
            className="w-full accent-purple-400 cursor-pointer"
          />
          <span className="text-[10px] text-slate-400 block">Directly impacts 70% of the Academic Health pillar</span>
        </div>

        {/* Backlogs Slider */}
        <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="font-semibold text-slate-300">Backlogs Count</span>
            <span className={`font-mono font-bold ${backlogs === 0 ? "text-emerald-400" : "text-rose-400"}`}>
              {backlogs}
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={5}
            step={1}
            value={backlogs}
            onChange={(e) => setBacklogs(parseInt(e.target.value))}
            className="w-full accent-rose-400 cursor-pointer"
          />
          <span className="text-[10px] text-slate-400 block">
            {backlogs === 0 ? "Zero backlogs — eligible for all campus drives" : "-15 SSS penalty per active backlog"}
          </span>
        </div>

        {/* Hackathons & Certs */}
        <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="font-semibold text-slate-300">Hackathons Participated</span>
            <span className="font-mono font-bold text-amber-400">{hackathons}</span>
          </div>
          <input
            type="range"
            min={0}
            max={6}
            step={1}
            value={hackathons}
            onChange={(e) => setHackathons(parseInt(e.target.value))}
            className="w-full accent-amber-400 cursor-pointer"
          />
        </div>

        <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="font-semibold text-slate-300">Industry Certifications</span>
            <span className="font-mono font-bold text-blue-400">{certifications}</span>
          </div>
          <input
            type="range"
            min={0}
            max={6}
            step={1}
            value={certifications}
            onChange={(e) => setCertifications(parseInt(e.target.value))}
            className="w-full accent-blue-400 cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}
