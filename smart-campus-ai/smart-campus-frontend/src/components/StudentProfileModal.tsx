import React, { useState } from "react";
import { Student } from "../types";
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  Tooltip,
} from "recharts";
import {
  X,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Brain,
  Award,
  BookOpen,
  Calendar,
  Briefcase,
  MonitorCheck,
  Zap,
  Edit3,
  FileText,
  Github,
  Linkedin,
  Code,
  ExternalLink,
  Phone,
  MapPin,
  Target,
  Compass,
  FolderGit2,
} from "lucide-react";
import { EditStudentModal } from "./EditStudentModal";
import { StudentReportCard } from "./StudentReportCard";
import { InterventionsManager } from "./InterventionsManager";
import { HistoricalGrowthChart } from "./HistoricalGrowthChart";
import { PeerBenchmarkingView } from "./PeerBenchmarkingView";

interface StudentProfileModalProps {
  student: Student | null;
  onClose?: () => void;
  isStandalone?: boolean;
}

export function StudentProfileModal({ student, onClose, isStandalone = false }: StudentProfileModalProps) {
  const [currentStudent, setCurrentStudent] = useState<Student | null>(student);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [tasksDone, setTasksDone] = useState<Record<string, boolean>>({});

  // Sync if prop changes
  React.useEffect(() => {
    setCurrentStudent(student);
  }, [student]);

  if (!currentStudent) return null;

  const toggleTask = (key: string) => {
    setTasksDone((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Recharts radar data for 5 pillars
  const radarData = [
    { subject: "Academic Health", score: currentStudent.pillars?.academic ?? 0, fullMark: 100 },
    { subject: "Attendance", score: currentStudent.attendance ?? 0, fullMark: 100 },
    { subject: "LMS Engagement", score: currentStudent.pillars?.lms ?? 0, fullMark: 100 },
    { subject: "Placement Ready", score: currentStudent.pillars?.placement ?? 0, fullMark: 100 },
    {
      subject: "Engagement",
      score: currentStudent.pillars?.engagement ?? currentStudent.pillars?.extracurricular ?? 0,
      fullMark: 100,
    },
  ];

  const score = currentStudent.score ?? currentStudent.success_score ?? currentStudent.successScore ?? 0;
  const scoreTone = score >= 75 ? "text-emerald-400" : score >= 55 ? "text-amber-400" : "text-rose-400";
  const scoreBg =
    score >= 75
      ? "from-emerald-500/20 to-teal-500/10 border-emerald-500/30"
      : score >= 55
      ? "from-amber-500/20 to-orange-500/10 border-amber-500/30"
      : "from-rose-500/20 to-red-500/10 border-rose-500/30";

  const strengths =
    currentStudent.explainability?.top_strengths || currentStudent.explainability?.topStrengths || [];
  const risks = currentStudent.explainability?.top_risks || currentStudent.explainability?.topRisks || [];
  const recommendedAction =
    currentStudent.recommended_action ||
    currentStudent.recommendedAction ||
    "Keep up consistent academic performance and attend placement bootcamps.";

  // Portfolio items
  const skillsList = currentStudent.skills || [];
  const projectsList = currentStudent.projects || [];
  const certsList = currentStudent.certifications_list || currentStudent.certificationsList || [];
  const targetRoles = currentStudent.target_roles || currentStudent.targetRoles || [];
  const ghUrl = currentStudent.github_url || currentStudent.githubUrl;
  const liUrl = currentStudent.linkedin_url || currentStudent.linkedinUrl;
  const lcUrl = currentStudent.leetcode_url || currentStudent.leetcodeUrl;
  const resUrl = currentStudent.resume_url || currentStudent.resumeUrl;

  const content = (
    <div className="space-y-5">
      {/* 360 Header Bento Module */}
      <div className="p-6 bento-card relative overflow-hidden animate-stagger-1">
        {/* Ambient Modal Glow */}
        <div className={`absolute -top-24 -right-24 w-96 h-96 rounded-full blur-[100px] pointer-events-none opacity-50 ${score >= 75 ? 'bg-emerald-500/20' : score >= 55 ? 'bg-amber-500/20' : 'bg-rose-500/20'}`} />
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-white/5 text-slate-300 border border-white/10">
                {currentStudent.id || currentStudent.student_id}
              </span>
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 shadow-[0_0_10px_rgba(99,102,241,0.1)]">
                {currentStudent.department} · Sem {currentStudent.semester} (Div {currentStudent.division || "A"})
              </span>
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-white/5 text-slate-300 border border-white/10">
                {currentStudent.segment}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight drop-shadow-md">{currentStudent.name}</h1>
            <p className="text-xs text-slate-400 mt-0.5">{currentStudent.email}</p>

            {/* Student Bio if present */}
            {currentStudent.bio && (
              <p className="text-xs text-slate-200 mt-2 max-w-xl italic bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
                &ldquo;{currentStudent.bio}&rdquo;
              </p>
            )}

            {/* Quick Contact & Social Handles */}
            <div className="flex flex-wrap items-center gap-2 mt-3">
              {currentStudent.phone && (
                <span className="text-[11px] px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-300 flex items-center gap-1">
                  <Phone className="w-3 h-3 text-slate-400" />
                  {currentStudent.phone}
                </span>
              )}

              {(currentStudent.location_preference || currentStudent.locationPreference) && (
                <span className="text-[11px] px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-300 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  {currentStudent.location_preference || currentStudent.locationPreference}
                </span>
              )}

              {/* GitHub */}
              {ghUrl && (
                <a
                  href={ghUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-white/15 text-white flex items-center gap-1 font-semibold transition hover:shadow-[0_0_10px_rgba(255,255,255,0.1)]"
                >
                  <Github className="w-3.5 h-3.5" />
                  GitHub
                  <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
                </a>
              )}

              {/* LinkedIn */}
              {liUrl && (
                <a
                  href={liUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-blue-950/60 hover:bg-blue-900 border border-blue-500/30 text-blue-200 flex items-center gap-1 font-semibold transition hover:shadow-[0_0_10px_rgba(59,130,246,0.3)]"
                >
                  <Linkedin className="w-3.5 h-3.5 text-blue-400" />
                  LinkedIn
                  <ExternalLink className="w-2.5 h-2.5 text-blue-300" />
                </a>
              )}

              {/* LeetCode */}
              {lcUrl && (
                <a
                  href={lcUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-amber-950/60 hover:bg-amber-900 border border-amber-500/30 text-amber-200 flex items-center gap-1 font-semibold transition hover:shadow-[0_0_10px_rgba(245,158,11,0.3)]"
                >
                  <Code className="w-3.5 h-3.5 text-amber-400" />
                  LeetCode
                  <ExternalLink className="w-2.5 h-2.5 text-amber-300" />
                </a>
              )}

              {/* Resume */}
              {resUrl && (
                <a
                  href={resUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-teal-950/60 hover:bg-teal-900 border border-teal-500/30 text-teal-200 flex items-center gap-1 font-bold transition hover:shadow-[0_0_10px_rgba(20,184,166,0.3)]"
                >
                  <FileText className="w-3.5 h-3.5 text-teal-400" />
                  View Resume
                  <ExternalLink className="w-2.5 h-2.5 text-teal-300" />
                </a>
              )}
            </div>

            {/* Risk Flags */}
            <div className="flex flex-wrap items-center gap-2 mt-4">
              {(currentStudent.risk_flags || currentStudent.riskFlags || []).map((flag) => (
                <span
                  key={flag}
                  className={`text-xs font-semibold px-3 py-1 rounded-full border shadow-sm ${
                    flag === "Safe"
                      ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                      : flag === "Academic Risk"
                      ? "bg-rose-500/15 text-rose-300 border-rose-500/30"
                      : "bg-amber-500/15 text-amber-300 border-amber-500/30"
                  }`}
                >
                  {flag === "Safe" ? "✓ " : "⚠ "}
                  {flag}
                </span>
              ))}
            </div>
          </div>

          {/* Right Action buttons and Radial Success Score Badge */}
          <div className="flex flex-col sm:flex-row md:flex-col items-end gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsReportOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition flex items-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5 text-indigo-300" />
                Report Card
              </button>

              {!isStandalone && (
                <button
                  onClick={() => setIsEditOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition flex items-center gap-1.5 shadow-lg shadow-indigo-600/30"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Edit Metrics
                </button>
              )}
            </div>

            <div className={`flex flex-col items-center justify-center p-4 rounded-2xl bg-black/60 border border-white/10 min-w-[130px] transition-shadow duration-500 ${score >= 75 ? 'ambient-glow-green' : score >= 55 ? 'shadow-[0_0_20px_rgba(245,158,11,0.2)]' : 'shadow-[0_0_20px_rgba(244,63,94,0.2)]'}`}>
              <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">Success Score</span>
              <span className={`text-[40px] leading-none font-extrabold ${scoreTone} font-mono mt-1.5 drop-shadow-md`}>{score}</span>
              <span className="text-[10px] font-medium text-slate-500 mt-1">out of 100 SSS</span>
            </div>
          </div>
        </div>
      </div>

      {/* STUDENT SELF-MANAGED PORTFOLIO SECTION (Visible to Faculty & Student) */}
      {(skillsList.length > 0 || projectsList.length > 0 || certsList.length > 0 || targetRoles.length > 0) && (
        <div className="p-6 rounded-3xl glass-card border border-teal-500/20 bg-teal-950/10 space-y-5 animate-stagger-2">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-teal-400" />
                Student Portfolio &amp; Technical Assets
              </h3>
              <p className="text-xs text-slate-400">
                Self-managed achievements, projects, and verified technical competencies.
              </p>
            </div>
            {(currentStudent.career_preference || currentStudent.careerPreference) && (
              <span className="text-xs font-semibold px-3 py-1 rounded-xl bg-teal-500/20 text-teal-300 border border-teal-500/30 flex items-center gap-1.5 shadow-[0_0_10px_rgba(20,184,166,0.15)]">
                <Compass className="w-3.5 h-3.5" />
                Goal: {currentStudent.career_preference || currentStudent.careerPreference}
              </span>
            )}
          </div>

          {/* Technical Skills */}
          {skillsList.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Technical Skills:</span>
              <div className="flex flex-wrap gap-2">
                {skillsList.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1 rounded-xl bg-teal-500/15 border border-teal-500/30 text-teal-300 text-xs font-semibold"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Featured Projects */}
          {projectsList.length > 0 && (
            <div className="space-y-3 pt-2">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <FolderGit2 className="w-4 h-4 text-indigo-400" />
                Featured Projects ({projectsList.length}):
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {projectsList.map((proj, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-900/70 border border-white/10 space-y-1.5 hover:border-indigo-500/30 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-xs">{proj.title}</span>
                      {proj.link && (
                        <a
                          href={proj.link}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-teal-400 hover:underline flex items-center gap-1 font-mono"
                        >
                          <ExternalLink className="w-3 h-3" />
                          Link
                        </a>
                      )}
                    </div>
                    {(proj.tech_stack || proj.techStack) && (
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 font-mono inline-block">
                        {proj.tech_stack || proj.techStack}
                      </span>
                    )}
                    {proj.description && <p className="text-[11px] text-slate-300 pt-0.5">{proj.description}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Certifications & Target Roles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {certsList.length > 0 && (
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/10 space-y-2 hover:border-teal-500/20 transition-colors">
                <span className="text-xs font-bold text-teal-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-teal-400" />
                  Industry Certifications ({certsList.length})
                </span>
                <div className="space-y-1.5">
                  {certsList.map((cert, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs text-slate-200">
                      <span>{cert.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {cert.issuer} {cert.year ? `(${cert.year})` : ""}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {targetRoles.length > 0 && (
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/10 space-y-2 hover:border-purple-500/20 transition-colors">
                <span className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-purple-400" />
                  Target Career Roles
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {targetRoles.map((role) => (
                    <span
                      key={role}
                      className="px-2.5 py-1 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-semibold"
                    >
                      {role}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Grid: Radar Chart + 5 Pillars Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-stagger-3">
        {/* 5-Pillar Radar Chart Card */}
        <div className="lg:col-span-5 p-6 rounded-3xl glass-card border border-white/10 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Brain className="w-4 h-4 text-indigo-400" />
                Performance Radar
              </h3>
              <p className="text-xs text-slate-400">Multi-pillar balance &amp; competencies</p>
            </div>
          </div>

          <div className="w-full h-72 flex items-center justify-center my-auto">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} outerRadius="72%">
                <PolarGrid stroke="rgba(255, 255, 255, 0.15)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: "#94a3b8", fontSize: 11, fontWeight: 500 }} />
                <Radar
                  name="Student Score"
                  dataKey="score"
                  stroke="#818cf8"
                  fill="#6366f1"
                  fillOpacity={0.4}
                  strokeWidth={2}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(15, 23, 42, 0.95)",
                    borderColor: "rgba(255, 255, 255, 0.15)",
                    borderRadius: "12px",
                    color: "#fff",
                    fontSize: "12px",
                    backdropFilter: "blur(10px)"
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pillar Metric Progress Bars */}
        <div className="lg:col-span-7 p-6 rounded-3xl glass-card border border-white/10 space-y-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-teal-400" />
              Pillars &amp; Key Indicators
            </h3>
            <p className="text-xs text-slate-400">Detailed metric decomposition</p>
          </div>

          <div className="space-y-3.5">
            {/* Academic */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                  Academic Health: CGPA {currentStudent.cgpa} · {currentStudent.backlogs} Backlog(s)
                </span>
                <span className="font-mono font-bold text-slate-100">{currentStudent.pillars?.academic ?? 0}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800/80 overflow-hidden border border-white/5 shadow-inner">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-600 to-indigo-400 transition-all duration-1000 ease-out"
                  style={{ width: `${Math.min(100, currentStudent.pillars?.academic ?? 0)}%` }}
                />
              </div>
            </div>

            {/* Attendance */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-teal-400" />
                  Attendance: {currentStudent.attendance}% overall
                </span>
                <span className="font-mono font-bold text-slate-100">{currentStudent.attendance}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800/80 overflow-hidden border border-white/5 shadow-inner">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ease-out bg-gradient-to-r ${
                    currentStudent.attendance < 75 ? "from-rose-600 to-rose-400" : "from-teal-600 to-teal-400"
                  }`}
                  style={{ width: `${Math.min(100, currentStudent.attendance)}%` }}
                />
              </div>
              {currentStudent.attendance < 75 && (
                <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1 font-medium">
                  <AlertTriangle className="w-3 h-3" /> Attendance below 75% statutory exam eligibility threshold.
                </p>
              )}
            </div>

            {/* Placement */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-purple-400" />
                  Placement Ready: Coding {currentStudent.codingScore ?? currentStudent.coding_score ?? 0} · Aptitude{" "}
                  {currentStudent.aptitudeScore ?? currentStudent.aptitude_score ?? 0}
                </span>
                <span className="font-mono font-bold text-slate-100">{currentStudent.pillars?.placement ?? 0}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800/80 overflow-hidden border border-white/5 shadow-inner">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-purple-600 to-purple-400 transition-all duration-1000 ease-out"
                  style={{ width: `${Math.min(100, currentStudent.pillars?.placement ?? 0)}%` }}
                />
              </div>
            </div>

            {/* LMS */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <MonitorCheck className="w-3.5 h-3.5 text-blue-400" />
                  LMS Engagement: {currentStudent.weeklyLogins ?? currentStudent.lms_login_freq_weekly ?? 0} Logins/Wk ·{" "}
                  {currentStudent.assignmentCompletion ?? currentStudent.lms_completion_rate ?? 0}% Assignments
                </span>
                <span className="font-mono font-bold text-slate-100">{currentStudent.pillars?.lms ?? 0}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800/80 overflow-hidden border border-white/5 shadow-inner">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-1000 ease-out"
                  style={{ width: `${Math.min(100, currentStudent.pillars?.lms ?? 0)}%` }}
                />
              </div>
            </div>

            {/* Extracurricular / Engagement */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  Campus Activity: {currentStudent.hackathons ?? currentStudent.hackathons_count ?? 0} Hackathons ·{" "}
                  {currentStudent.certifications ?? currentStudent.certifications_count ?? 0} Certs
                </span>
                <span className="font-mono font-bold text-slate-100">
                  {currentStudent.pillars?.engagement ?? currentStudent.pillars?.extracurricular ?? 0}%
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800/80 overflow-hidden border border-white/5 shadow-inner">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-600 to-amber-400 transition-all duration-1000 ease-out"
                  style={{
                    width: `${Math.min(
                      100,
                      currentStudent.pillars?.engagement ?? currentStudent.pillars?.extracurricular ?? 0
                    )}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="animate-stagger-4 space-y-5">
        {/* Semester Growth Trajectory (Feature 6) */}
        <HistoricalGrowthChart
          history={currentStudent.semester_history || currentStudent.semesterHistory}
          currentSemester={currentStudent.semester}
          studentName={currentStudent.name}
        />

        {/* Peer Benchmarking & Gamified Badges (Feature 4) */}
        <PeerBenchmarkingView
          studentId={currentStudent.id || currentStudent.student_id || ""}
          studentName={currentStudent.name}
        />
      </div>

      {/* Interventions & Mentoring Action Tracker */}
      <div className="p-6 rounded-3xl glass-card border border-white/10 animate-stagger-5">
        <InterventionsManager
          studentId={currentStudent.id || currentStudent.student_id || ""}
          isStudentPortal={isStandalone}
        />
      </div>

      {/* Diagnostics: Catalysts & Risks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-stagger-5">
        {/* Positive Drivers */}
        <div className="p-6 rounded-3xl glass-card border border-emerald-500/20 bg-emerald-950/20 space-y-3 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-[50px] pointer-events-none" />
          <h4 className="text-sm font-bold text-emerald-300 flex items-center gap-2 relative z-10">
            <Award className="w-4 h-4 text-emerald-400" />
            Core Strengths &amp; Catalysts
          </h4>
          <div className="space-y-2 relative z-10">
            {strengths.map((str, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-xl bg-slate-900/60 border border-emerald-500/20 text-xs text-slate-200 flex items-center gap-2 hover:bg-slate-800 transition-colors"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                {str}
              </div>
            ))}
          </div>
        </div>

        {/* Negative Risk Drivers */}
        <div className="p-6 rounded-3xl glass-card border border-rose-500/20 bg-rose-950/20 space-y-3 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-[50px] pointer-events-none" />
          <h4 className="text-sm font-bold text-rose-300 flex items-center gap-2 relative z-10">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            Key Risk Drivers &amp; Attention Areas
          </h4>
          <div className="space-y-2 relative z-10">
            {risks.map((rsk, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-xl bg-slate-900/60 border border-rose-500/20 text-xs text-slate-200 flex items-center gap-2 hover:bg-slate-800 transition-colors"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0 shadow-[0_0_8px_rgba(244,63,94,0.8)]" />
                {rsk}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recommended Prescriptive Intervention Box */}
      <div className="p-6 rounded-3xl glass-card border border-indigo-500/30 bg-indigo-950/25 space-y-3 animate-stagger-5 relative overflow-hidden shadow-[0_0_30px_-5px_rgba(99,102,241,0.1)]">
        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-indigo-500/5 to-transparent pointer-events-none" />
        <div className="flex items-center justify-between relative z-10">
          <h4 className="text-sm font-bold text-indigo-300 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            AI Prescribed Remediation &amp; Next Actions
          </h4>
          <span className="text-[11px] text-indigo-300/80 bg-indigo-500/20 px-2.5 py-0.5 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.2)]">
            Active Roadmap
          </span>
        </div>
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-indigo-500/20 flex items-start gap-3 relative z-10 shadow-inner">
          <input
            type="checkbox"
            id="rec-action"
            checked={!!tasksDone["main_action"]}
            onChange={() => toggleTask("main_action")}
            className="mt-1 w-4 h-4 rounded border-slate-700 text-indigo-600 focus:ring-indigo-500 transition-colors cursor-pointer"
          />
          <label htmlFor="rec-action" className="text-xs sm:text-sm text-slate-200 cursor-pointer">
            <span className={tasksDone["main_action"] ? "line-through text-slate-500 transition-all" : "font-medium text-indigo-100 transition-all"}>
              {recommendedAction}
            </span>
          </label>
        </div>
      </div>

      {/* Faculty Remarks & Notes */}
      {currentStudent.notes && (
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 text-xs text-slate-300 animate-stagger-5">
          <span className="font-semibold text-slate-200 block mb-1">Faculty Academic Notes:</span>
          <p className="italic text-slate-400">&quot;{currentStudent.notes}&quot;</p>
        </div>
      )}

      {/* Edit Student Modal (Faculty) */}
      {isEditOpen && (
        <EditStudentModal
          student={currentStudent}
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          onSuccess={(updated) => setCurrentStudent(updated)}
        />
      )}

      {/* Report Card Modal */}
      {isReportOpen && (
        <StudentReportCard
          student={currentStudent}
          isOpen={isReportOpen}
          onClose={() => setIsReportOpen(false)}
        />
      )}
    </div>
  );

  if (isStandalone) {
    return <div className="max-w-6xl mx-auto py-6">{content}</div>;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-xl overflow-y-auto transition-all animate-fade-in">
      <div className="relative w-full max-w-5xl glass-panel rounded-3xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto border border-white/15 shadow-2xl animate-stagger-1">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl glass-button-secondary text-slate-400 hover:text-white z-20"
        >
          <X className="w-5 h-5" />
        </button>
        {content}
      </div>
    </div>
  );
}
