import React, { useState, useEffect } from "react";
import { Student } from "../types";
import { useAuth } from "../context/AuthContext";
import { studentsApi } from "../services/api";
import { StudentProfileModal } from "./StudentProfileModal";
import { ChangePasswordModal } from "./ChangePasswordModal";
import { WhatIfSimulator } from "./WhatIfSimulator";
import { EditStudentProfileModal } from "./EditStudentProfileModal";
import { HistoricalGrowthChart } from "./HistoricalGrowthChart";
import { PeerBenchmarkingView } from "./PeerBenchmarkingView";
import { StudentAnalyticsCopilot } from "./StudentAnalyticsCopilot";
import { NoticeBoardView } from "./NoticeBoardView";
import {
  AlertCircle,
  RefreshCw,
  KeyRound,
  ShieldAlert,
  AlertTriangle,
  Sliders,
  UserCheck,
  UserCog,
  Sparkles,
  Trophy,
  TrendingUp,
  Bell,
  BrainCircuit,
} from "lucide-react";

export function StudentPortal() {
  const { user } = useAuth();
  const [student, setStudent] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "copilot" | "benchmarks" | "growth" | "simulator" | "notices">("profile");

  const studentId = user?.studentId || user?.student_id || user?.id || "STU1001";

  const fetchProfile = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await studentsApi.getById(studentId);
      setStudent(data);
    } catch (err: any) {
      console.error("Failed to load student profile:", err);
      setError(err.message || "Could not retrieve your 360 student record.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [studentId]);

  if (isLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center text-slate-400">
        <div className="w-8 h-8 border-2 border-teal-500/30 border-t-teal-400 rounded-full animate-spin mb-3" />
        <p className="text-sm font-medium">Retrieving your Student 360 profile from database...</p>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 rounded-3xl glass-card border border-rose-500/30 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-white">Student Record Not Found</h3>
        <p className="text-xs text-slate-400">
          {error || `No active record linked to ID: ${studentId}`}
        </p>
        <button
          onClick={fetchProfile}
          className="glass-button-primary px-4 py-2 rounded-xl text-xs font-semibold text-white inline-flex items-center gap-2"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Retry Connection
        </button>
      </div>
    );
  }

  // Early Risk Alerts
  const hasAttendanceRisk = (student.attendance || 0) < 75;
  const hasAcademicRisk = (student.backlogs || 0) > 0 || (student.cgpa || 0) < 6.0;

  return (
    <div className="space-y-6">
      {/* Default Password Notice Banner */}
      {user?.mustChangePassword && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 to-orange-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Initial Security Notice</p>
              <p className="text-[11px] text-amber-200/80">
                You are currently logged in with the default password assigned by faculty. Please set your personal password.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsPasswordModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all flex items-center gap-1.5 shrink-0"
          >
            <KeyRound className="w-3.5 h-3.5" />
            Change Password
          </button>
        </div>
      )}

      {/* Early Risk Warning Alert Banners */}
      {hasAttendanceRisk && (
        <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center gap-3 text-rose-300 text-xs">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
          <div>
            <span className="font-bold">Urgent Attendance Debarment Warning: </span>
            Your current attendance is {student.attendance}%, which is below the mandatory 75% examination threshold.
            Please connect with your mentor immediately.
          </div>
        </div>
      )}

      {hasAcademicRisk && (
        <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center gap-3 text-amber-300 text-xs">
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
          <div>
            <span className="font-bold">Academic Remediation Active: </span>
            You have {student.backlogs} active backlog(s). Remedial coursework has been scheduled to keep you eligible for placements.
          </div>
        </div>
      )}

      {/* Tab Switcher & Edit Profile Action */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-2 bento-card">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setActiveTab("profile")}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeTab === "profile"
                ? "bg-white/10 text-white font-semibold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            Performance 360
          </button>

          <button
            onClick={() => setActiveTab("copilot")}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeTab === "copilot"
                ? "bg-indigo-600/30 text-indigo-200 border border-indigo-500/30 font-semibold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <BrainCircuit className="w-3.5 h-3.5 text-indigo-400" />
            Career Copilot
          </button>

          <button
            onClick={() => setActiveTab("benchmarks")}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeTab === "benchmarks"
                ? "bg-white/10 text-white font-semibold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            Benchmarks
          </button>

          <button
            onClick={() => setActiveTab("growth")}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeTab === "growth"
                ? "bg-teal-600/30 text-teal-200 border border-teal-500/30 font-semibold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-teal-400" />
            Semester &amp; Growth
          </button>

          <button
            onClick={() => setActiveTab("simulator")}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeTab === "simulator"
                ? "bg-white/10 text-white font-semibold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            What-If Lab
          </button>

          <button
            onClick={() => setActiveTab("notices")}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeTab === "notices"
                ? "bg-white/10 text-white font-semibold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            Notices
          </button>
        </div>

        {/* Edit My Profile & Portfolio Button */}
        <button
          onClick={() => setIsEditProfileOpen(true)}
          className="px-3.5 py-1.5 rounded-xl glass-button-secondary text-xs font-medium text-slate-200 hover:text-white flex items-center gap-1.5 self-start lg:self-auto"
        >
          <UserCog className="w-3.5 h-3.5" />
          Edit Profile
        </button>
      </div>

      {/* Main Tab Content */}
      {activeTab === "profile" ? (
        <StudentProfileModal student={student} isStandalone={true} />
      ) : activeTab === "copilot" ? (
        <StudentAnalyticsCopilot
          student={student}
          onOpenSimulator={() => setActiveTab("simulator")}
          onOpenBenchmarks={() => setActiveTab("benchmarks")}
        />
      ) : activeTab === "benchmarks" ? (
        <div className="space-y-6">
          <PeerBenchmarkingView
            studentId={student.id || student.student_id || studentId}
            studentName={student.name}
          />
        </div>
      ) : activeTab === "growth" ? (
        <div className="space-y-6">
          <HistoricalGrowthChart
            history={student.semester_history || student.semesterHistory}
            currentSemester={student.semester}
            studentName={student.name}
          />
        </div>
      ) : activeTab === "notices" ? (
        <div className="space-y-6">
          <NoticeBoardView
            isFaculty={false}
            studentDepartment={student.department}
            studentYear={student.year}
          />
        </div>
      ) : (
        <WhatIfSimulator student={student} />
      )}

      {/* Edit Student Profile Modal */}
      {isEditProfileOpen && (
        <EditStudentProfileModal
          student={student}
          isOpen={isEditProfileOpen}
          onClose={() => setIsEditProfileOpen(false)}
          onSuccess={(updated) => setStudent(updated)}
        />
      )}

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
    </div>
  );
}
