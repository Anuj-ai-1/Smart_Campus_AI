import React from "react";
import { Student } from "../types";
import { X, Printer, GraduationCap, Award, ShieldCheck } from "lucide-react";

interface StudentReportCardProps {
  student: Student;
  isOpen: boolean;
  onClose: () => void;
}

export function StudentReportCard({ student, isOpen, onClose }: StudentReportCardProps) {
  if (!isOpen) return null;

  const score = student.score ?? student.success_score ?? student.successScore ?? 0;
  const strengths = student.explainability?.top_strengths || student.explainability?.topStrengths || [];
  const risks = student.explainability?.top_risks || student.explainability?.topRisks || [];
  const recommendedAction =
    student.recommended_action ||
    student.recommendedAction ||
    "Maintain high academic consistency and attend placement training bootcamps.";

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto print:p-0 print:bg-white">
      <div className="relative w-full max-w-4xl bg-[#0b0f19] print:bg-white text-slate-100 print:text-black rounded-3xl p-8 sm:p-10 max-h-[95vh] overflow-y-auto border border-white/20 print:border-none shadow-2xl print:max-h-none print:overflow-visible">
        {/* Controls - Hidden in print */}
        <div className="flex items-center justify-between pb-6 border-b border-white/10 print:hidden">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Official Academic Success Report Card
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              Print / Save as PDF
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl glass-button-secondary text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Official Document */}
        <div className="space-y-6 pt-4 print:pt-0">
          {/* Institution Header */}
          <div className="text-center border-b-2 border-indigo-500/40 print:border-black pb-4 space-y-1">
            <div className="flex items-center justify-center gap-2">
              <GraduationCap className="w-8 h-8 text-indigo-400 print:text-black" />
              <h1 className="text-2xl font-black uppercase tracking-tight text-white print:text-black">
                Smart Campus Institute of Technology
              </h1>
            </div>
            <p className="text-xs text-slate-400 print:text-gray-600 uppercase tracking-widest font-semibold">
              Student Success &amp; Predictive Performance Analytics Registry
            </p>
            <p className="text-[10px] text-slate-500 print:text-gray-500">
              Generated on: {new Date().toLocaleDateString()} · Confidential Academic Record
            </p>
          </div>

          {/* Student Demographics Card */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-white/5 print:bg-gray-100 border border-white/10 print:border-gray-300 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 print:text-gray-600 block">
                Student Name
              </span>
              <span className="font-bold text-white print:text-black text-sm">{student.name}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 print:text-gray-600 block">
                Student ID
              </span>
              <span className="font-mono font-bold text-indigo-400 print:text-black">{student.student_id || student.id}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 print:text-gray-600 block">
                Department &amp; Sem
              </span>
              <span className="font-semibold text-white print:text-black">
                {student.department} · Semester {student.semester} (Year {student.year})
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 print:text-gray-600 block">
                Registered Email
              </span>
              <span className="text-slate-300 print:text-black font-mono text-[11px]">{student.email}</span>
            </div>
          </div>

          {/* Composite SSS & Machine Learning Segment */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-950/40 to-teal-950/40 print:bg-gray-50 border border-indigo-500/30 print:border-gray-300 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-indigo-300 print:text-black uppercase tracking-wider block">
                Smart Success Score (SSS Composite)
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-4xl font-black text-white print:text-black">{score}</span>
                <span className="text-xs text-slate-400 print:text-gray-600">/ 100 Points</span>
              </div>
            </div>

            <div className="text-right sm:text-right">
              <span className="text-xs font-bold text-teal-300 print:text-black uppercase tracking-wider block">
                Machine Learning Cohort Segment
              </span>
              <span className="inline-block mt-1 px-3 py-1 rounded-xl text-xs font-bold bg-teal-500/20 text-teal-300 print:text-black border border-teal-500/30 print:border-gray-400">
                {student.segment}
              </span>
            </div>
          </div>

          {/* 5-Pillar Score Breakdown */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 print:text-black">
              5-Pillar Performance Health Matrix
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="p-3 rounded-xl bg-white/5 print:bg-gray-100 border border-white/10 print:border-gray-300 text-center">
                <span className="text-[10px] text-slate-400 print:text-gray-600 uppercase font-bold block">
                  Academic Health
                </span>
                <span className="text-xl font-bold text-white print:text-black mt-1 block">
                  {student.pillars?.academic ?? 0}%
                </span>
                <span className="text-[10px] text-slate-500 font-mono">CGPA: {student.cgpa}</span>
              </div>

              <div className="p-3 rounded-xl bg-white/5 print:bg-gray-100 border border-white/10 print:border-gray-300 text-center">
                <span className="text-[10px] text-slate-400 print:text-gray-600 uppercase font-bold block">
                  Attendance Health
                </span>
                <span className="text-xl font-bold text-white print:text-black mt-1 block">
                  {student.attendance}%
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Min req: 75%</span>
              </div>

              <div className="p-3 rounded-xl bg-white/5 print:bg-gray-100 border border-white/10 print:border-gray-300 text-center">
                <span className="text-[10px] text-slate-400 print:text-gray-600 uppercase font-bold block">
                  Placement Readiness
                </span>
                <span className="text-xl font-bold text-white print:text-black mt-1 block">
                  {student.pillars?.placement ?? 0}%
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Coding: {student.codingScore ?? student.coding_score ?? 0}</span>
              </div>

              <div className="p-3 rounded-xl bg-white/5 print:bg-gray-100 border border-white/10 print:border-gray-300 text-center">
                <span className="text-[10px] text-slate-400 print:text-gray-600 uppercase font-bold block">
                  LMS Engagement
                </span>
                <span className="text-xl font-bold text-white print:text-black mt-1 block">
                  {student.pillars?.lms ?? 0}%
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Logins: {student.weeklyLogins ?? student.lms_login_freq_weekly ?? 0}/wk</span>
              </div>

              <div className="p-3 rounded-xl bg-white/5 print:bg-gray-100 border border-white/10 print:border-gray-300 text-center">
                <span className="text-[10px] text-slate-400 print:text-gray-600 uppercase font-bold block">
                  Co-Curricular
                </span>
                <span className="text-xl font-bold text-white print:text-black mt-1 block">
                  {student.pillars?.engagement ?? student.pillars?.extracurricular ?? 0}%
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Hacks: {student.hackathons ?? student.hackathons_count ?? 0}</span>
              </div>
            </div>
          </div>

          {/* Semester-by-Semester Academic & Health History Table */}
          {((student.semester_history || student.semesterHistory || []).length > 0) && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 print:text-black">
                Semester-by-Semester Academic Progression &amp; Telemetry Log
              </h3>
              <div className="overflow-x-auto rounded-xl border border-white/10 print:border-gray-300 bg-white/5 print:bg-white">
                <table className="w-full text-left text-xs">
                  <thead className="bg-white/10 print:bg-gray-100 text-slate-300 print:text-black font-bold border-b border-white/10 print:border-gray-300">
                    <tr>
                      <th className="py-2.5 px-3">Term</th>
                      <th className="py-2.5 px-3">SSS Score</th>
                      <th className="py-2.5 px-3">CGPA</th>
                      <th className="py-2.5 px-3">Attendance</th>
                      <th className="py-2.5 px-3">Coding Score</th>
                      <th className="py-2.5 px-3">Backlogs</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 print:divide-gray-200">
                    {(student.semester_history || student.semesterHistory || []).map((sem) => (
                      <tr key={sem.semester} className="hover:bg-white/5 print:hover:bg-transparent">
                        <td className="py-2 px-3 font-semibold text-white print:text-black">
                          Semester {sem.semester}
                          {sem.semester === student.semester && (
                            <span className="ml-1 text-[10px] text-teal-400 print:text-gray-600 font-normal">
                              (Current)
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-3 font-mono font-bold text-indigo-300 print:text-black">
                          {sem.successScore ?? sem.success_score ?? 0} pts
                        </td>
                        <td className="py-2 px-3 font-mono text-emerald-400 print:text-black font-semibold">
                          {sem.cgpa} / 10
                        </td>
                        <td className="py-2 px-3 font-mono text-cyan-300 print:text-black">
                          {sem.attendance}%
                        </td>
                        <td className="py-2 px-3 font-mono text-amber-300 print:text-black">
                          {sem.codingScore ?? sem.coding_score ?? 0} / 100
                        </td>
                        <td className="py-2 px-3">
                          {(sem.backlogs ?? 0) === 0 ? (
                            <span className="text-emerald-400 print:text-black">0</span>
                          ) : (
                            <span className="text-rose-400 print:text-black font-bold">{sem.backlogs} Backlog</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Explainability Diagnostics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-emerald-500/10 print:bg-gray-50 border border-emerald-500/20 print:border-gray-300 space-y-2">
              <span className="text-xs font-bold text-emerald-300 print:text-black uppercase tracking-wider block">
                Identified Strengths &amp; Catalysts
              </span>
              <ul className="space-y-1 text-xs text-slate-300 print:text-gray-800">
                {strengths.map((str, idx) => (
                  <li key={idx} className="flex items-center gap-1.5">
                    <span className="text-emerald-400 font-bold">✓</span> {str}
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-rose-500/10 print:bg-gray-50 border border-rose-500/20 print:border-gray-300 space-y-2">
              <span className="text-xs font-bold text-rose-300 print:text-black uppercase tracking-wider block">
                Identified Vulnerabilities &amp; Risks
              </span>
              <ul className="space-y-1 text-xs text-slate-300 print:text-gray-800">
                {risks.length === 0 ? (
                  <li className="text-slate-400">No critical vulnerabilities detected.</li>
                ) : (
                  risks.map((r, idx) => (
                    <li key={idx} className="flex items-center gap-1.5">
                      <span className="text-rose-400 font-bold">!</span> {r}
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>

          {/* Action Recommendation */}
          <div className="p-4 rounded-xl bg-white/5 print:bg-gray-50 border border-white/10 print:border-gray-300 space-y-1">
            <span className="text-xs font-bold text-indigo-300 print:text-black uppercase tracking-wider block">
              Prescriptive Remediation Strategy
            </span>
            <p className="text-xs text-slate-300 print:text-black leading-relaxed">{recommendedAction}</p>
          </div>

          {/* Signatures Footer */}
          <div className="pt-10 grid grid-cols-2 gap-8 text-center text-xs text-slate-400 print:text-black">
            <div className="border-t border-slate-700 print:border-black pt-2">
              <p className="font-bold text-white print:text-black">Faculty Mentor / Advisor</p>
              <p className="text-[10px]">Department of {student.department}</p>
            </div>
            <div className="border-t border-slate-700 print:border-black pt-2">
              <p className="font-bold text-white print:text-black">Head of Department / Academic Dean</p>
              <p className="text-[10px]">Smart Campus Academic Council</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
