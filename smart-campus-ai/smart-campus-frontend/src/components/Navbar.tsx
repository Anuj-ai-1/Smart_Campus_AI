import React from "react";
import { useAuth } from "../context/AuthContext";
import { GraduationCap, LogOut, BarChart3, Users, KeyRound, Briefcase, Bell } from "lucide-react";

interface NavbarProps {
  currentTab?: string;
  onTabChange?: (tab: string) => void;
  onAddStudent?: () => void;
  onChangePassword?: () => void;
  onOpenLanding?: () => void;
}

export function Navbar({ currentTab = "overview", onTabChange, onAddStudent, onChangePassword, onOpenLanding }: NavbarProps) {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0e131d]/90 backdrop-blur-md border-b border-white/[0.06] px-4 sm:px-8 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-indigo-600/90 flex items-center justify-center shadow-sm">
            <GraduationCap className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-slate-100 tracking-tight">Smart Campus</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/5 text-slate-300 border border-white/10">
                AI Platform
              </span>
            </div>
          </div>
        </div>

        {/* Center Navigation for Faculty */}
        {user?.role === "faculty" && onTabChange && (
          <div className="flex items-center p-1 rounded-xl bg-black/40 border border-white/5 shadow-inner">
            <button
              onClick={() => onTabChange("overview")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                currentTab === "overview"
                  ? "bg-white/10 text-white font-semibold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              Cohort Analytics
            </button>
            <button
              onClick={() => onTabChange("directory")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                currentTab === "directory"
                  ? "bg-white/10 text-white font-semibold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              Student Directory
            </button>
            <button
              onClick={() => onTabChange("placements")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                currentTab === "placements"
                  ? "bg-white/10 text-white font-semibold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              Placements
            </button>
            <button
              onClick={() => onTabChange("notices")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                currentTab === "notices"
                  ? "bg-white/10 text-white font-semibold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Bell className="w-3.5 h-3.5" />
              Notices
            </button>
          </div>
        )}

        {/* Center Badge for Admin */}
        {user?.role === "admin" && (
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-xl bg-purple-950/60 border border-purple-500/30 text-purple-200 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
            <span>Institutional Governance Console Active</span>
          </div>
        )}

        {/* User Info & Actions */}
        <div className="flex items-center gap-3">
          {/* Live API Health indicator */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>API Online</span>
          </div>

          {/* User Profile Badge */}
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center font-bold text-xs text-white uppercase">
              {user?.name ? user.name.charAt(0) : "U"}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-semibold text-white leading-none">{user?.name}</p>
              <p className="text-[10px] text-slate-400 leading-none mt-1">{user?.title || user?.role}</p>
            </div>
            <span
              className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md ${
                user?.role === "faculty"
                  ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                  : "bg-teal-500/20 text-teal-300 border border-teal-500/30"
              }`}
            >
              {user?.role}
            </span>
          </div>


          {/* Change Password Button */}
          {onChangePassword && (
            <button
              onClick={onChangePassword}
              title="Change Account Password"
              className="p-2 rounded-xl glass-button-secondary text-slate-400 hover:text-teal-300 transition-colors"
            >
              <KeyRound className="w-4 h-4" />
            </button>
          )}

          {/* Logout */}
          <button
            onClick={logout}
            title="Log Out"
            className="p-2 rounded-xl glass-button-secondary text-slate-400 hover:text-rose-400 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
