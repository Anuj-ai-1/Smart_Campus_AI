import React, { useState } from "react";
import { Role } from "../types";
import { useAuth } from "../context/AuthContext";
import { TeacherIllustration } from "./illustrations/TeacherIllustration";
import { StudentIllustration } from "./illustrations/StudentIllustration";
import {
  GraduationCap, Users, Lock, Mail, ArrowRight,
  ShieldCheck, Sparkles, UserCheck, User as UserIcon, Eye, EyeOff, Info,
} from "lucide-react";

type Mode = "login" | "signup";

interface LoginPageProps {
  onBackToLanding?: () => void;
  initialRole?: Role;
  initialAdminOpen?: boolean;
}

export function LoginPage({ onBackToLanding, initialRole = "faculty", initialAdminOpen = false }: LoginPageProps) {
  const { login, register } = useAuth();
  const [role, setRole] = useState<Role>(initialRole);
  const [mode, setMode] = useState<Mode>("login");

  // Common fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Student verification field
  const [studentId, setStudentId] = useState("");

  // Remember me toggle
  const [rememberMe, setRememberMe] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Administrator login state
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(initialAdminOpen);
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminRememberMe, setAdminRememberMe] = useState(false);
  const [isAdminSubmitting, setIsAdminSubmitting] = useState(false);
  const [adminError, setAdminError] = useState<string | null>(null);

  const handleRoleChange = (newRole: Role) => {
    setRole(newRole);
    setError(null);
  };

  const switchMode = (m: Mode) => {
    setMode(m);
    setError(null);
    setName(""); setEmail(""); setPassword(""); setConfirmPassword("");
    setStudentId("");
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAdminSubmitting(true);
    setAdminError(null);
    try {
      await login(adminEmail.trim(), adminPassword, "admin", adminRememberMe);
    } catch (err: any) {
      console.error("Admin login error:", err);
      setAdminError(err?.message || "Invalid administrator credentials.");
    } finally {
      setIsAdminSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (mode === "signup") {
        if (password !== confirmPassword) {
          setError("Passwords do not match.");
          setIsSubmitting(false);
          return;
        }
        if (password.length < 6) {
          setError("Password must be at least 6 characters.");
          setIsSubmitting(false);
          return;
        }

        if (role === "faculty") {
          if (!name.trim()) {
            setError("Full name is required for faculty account.");
            setIsSubmitting(false);
            return;
          }
          await register({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            password,
            role: "faculty",
            rememberMe,
          });
        } else {
          // Student account activation
          await register({
            email: email.trim().toLowerCase(),
            password,
            role: "student",
            student_id: studentId.trim().toUpperCase() || undefined,
            rememberMe,
          });
        }
      } else {
        await login(email.trim().toLowerCase(), password, role, rememberMe);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Authentication failed. Please check your credentials.";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-10 relative overflow-hidden">
      {/* Ambient Orbs */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none animate-pulseSlow" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-teal-500/15 rounded-full blur-3xl pointer-events-none animate-pulseSlow" style={{ animationDelay: "2s" }} />
      <div className="absolute top-3/4 left-1/3 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Card */}
      <div className="w-full max-w-5xl glass-panel rounded-3xl overflow-hidden shadow-2xl border border-white/10 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[660px]">

          {/* Left — Illustration */}
          <div className="lg:col-span-6 p-8 md:p-12 flex flex-col justify-between bg-gradient-to-br from-slate-900/80 via-slate-900/50 to-indigo-950/40 border-b lg:border-b-0 lg:border-r border-white/10 relative">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-teal-400 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <span className="font-bold text-lg text-white tracking-tight flex items-center gap-1.5">
                    Smart Campus <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-medium">AI</span>
                  </span>
                  <p className="text-xs text-slate-400">Student Success &amp; Predictive Analytics</p>
                </div>
              </div>

              {onBackToLanding && (
                <button
                  type="button"
                  onClick={onBackToLanding}
                  className="text-xs px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition"
                >
                  ← Webpage
                </button>
              )}
            </div>

            <div className="my-auto py-6">
              {role === "faculty" ? (
                <div className="space-y-4">
                  <TeacherIllustration />
                  <div className="text-center px-4">
                    <h3 className="text-xl font-bold text-white tracking-tight">Faculty &amp; Academic Advisory</h3>
                    <p className="text-sm text-slate-300/80 mt-1.5 max-w-sm mx-auto">
                      Enroll students, set default credentials, track telemetry, and guide interventions.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <StudentIllustration />
                  <div className="text-center px-4">
                    <h3 className="text-xl font-bold text-white tracking-tight">Student 360 Self-Service Portal</h3>
                    <p className="text-sm text-slate-300/80 mt-1.5 max-w-sm mx-auto">
                      Access performance radar, view personalized risk remediations, and update your credentials.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-4 border-t border-white/5">
              <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-400" /> Secure PBKDF2 Auth</span>
              <span className="flex items-center gap-1.5"><Sparkles className="w-4 h-4 text-indigo-400" /> Scikit-Learn ML</span>
            </div>
          </div>

          {/* Right — Form */}
          <div className="lg:col-span-6 p-8 md:p-12 flex flex-col justify-center bg-slate-900/60 backdrop-blur-xl">
            <div className="max-w-md w-full mx-auto space-y-5">

              {/* Role Toggle */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 block">Select Portal</label>
                <div className="grid grid-cols-2 p-1.5 rounded-2xl bg-slate-950/70 border border-white/10 shadow-inner">
                  <button type="button" onClick={() => handleRoleChange("faculty")}
                    className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      role === "faculty"
                        ? "bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-600/30"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <Users className="w-4 h-4" /> Faculty Portal
                  </button>
                  <button type="button" onClick={() => handleRoleChange("student")}
                    className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      role === "student"
                        ? "bg-gradient-to-r from-teal-600 to-teal-500 text-white shadow-lg shadow-teal-600/30"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <GraduationCap className="w-4 h-4" /> Student Portal
                  </button>
                </div>
              </div>

              {/* Sign In / Sign Up Tab */}
              <div className="flex border-b border-white/10">
                {(["login", "signup"] as Mode[]).map((m) => (
                  <button key={m} type="button" onClick={() => switchMode(m)}
                    className={`flex-1 pb-2.5 text-sm font-semibold transition-colors ${
                      mode === m
                        ? `border-b-2 text-white ${role === "faculty" ? "border-indigo-500" : "border-teal-500"}`
                        : "text-slate-500 hover:text-slate-300 border-b-2 border-transparent"
                    }`}
                  >
                    {m === "login"
                      ? "Sign In"
                      : role === "faculty"
                        ? "Create Faculty Account"
                        : "Set / Activate Password"}
                  </button>
                ))}
              </div>

              {/* Header */}
              <div>
                <h2 className="text-2xl font-extrabold text-white tracking-tight">
                  {mode === "login"
                    ? (role === "faculty" ? "Faculty Sign In" : "Student Sign In")
                    : (role === "faculty" ? "Create Faculty Account" : "Activate Student Password")}
                </h2>
                <p className="text-sm text-slate-400 mt-1">
                  {mode === "login"
                    ? (role === "faculty"
                        ? "Enter your registered email and password to access your dashboard."
                        : "Enter your enrolled campus email (or Student ID) and your password.")
                    : (role === "faculty"
                        ? "Register with your institutional email to manage your cohort."
                        : "Only students enrolled by faculty can activate their account. Enter your enrolled email below.")}
                </p>
              </div>

              {/* Notice for Student Activation */}
              {role === "student" && mode === "signup" && (
                <div className="p-3 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-300 text-xs flex items-start gap-2">
                  <Info className="w-4 h-4 flex-shrink-0 mt-0.5 text-teal-400" />
                  <span>
                    Your faculty must have already enrolled your record with this email. Enter your enrolled email to set your personal password.
                  </span>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-rose-500 flex-shrink-0 animate-ping" />
                  <span>{error}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-3.5">

                {/* Name — faculty signup only */}
                {mode === "signup" && role === "faculty" && (
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">Full Name *</label>
                    <div className="relative">
                      <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                        placeholder="Dr. Jane Smith" required
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm text-white placeholder-slate-500" />
                    </div>
                  </div>
                )}

                {/* Student ID — optional verification for student activation */}
                {mode === "signup" && role === "student" && (
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">Student ID (Optional)</label>
                    <div className="relative">
                      <UserCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input type="text" value={studentId} onChange={(e) => setStudentId(e.target.value.toUpperCase())}
                        placeholder="e.g. STU1009"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm text-white placeholder-slate-500 font-mono" />
                    </div>
                  </div>
                )}

                {/* Email / Student ID */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    {mode === "login" && role === "student"
                      ? "Enrolled Campus Email or Student ID *"
                      : "Campus Email Address *"}
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type={mode === "login" && role === "student" ? "text" : "email"}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={role === "faculty" ? "faculty@institution.edu" : "student@institution.edu"}
                      required
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm text-white placeholder-slate-500"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    {mode === "signup" ? "Set New Password *" : "Password *"}
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type={showPassword ? "text" : "password"} value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••" required minLength={6}
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl glass-input text-sm text-white placeholder-slate-500" />
                    <button type="button" onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {mode === "login" && role === "student" && (
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      First time logging in? Use the default password set by your faculty.
                    </span>
                  )}
                </div>

                {/* Confirm Password — signup only */}
                {mode === "signup" && (
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">Confirm Password *</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input type={showPassword ? "text" : "password"} value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••" required
                        className={`w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm text-white placeholder-slate-500 ${
                          confirmPassword && confirmPassword !== password ? "border-rose-500/50" : ""
                        }`} />
                    </div>
                    {confirmPassword && confirmPassword !== password && (
                      <p className="text-rose-400 text-[11px] mt-1">Passwords do not match</p>
                    )}
                  </div>
                )}

                {/* Remember Me */}
                <div className="pt-1 pb-2 flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-700 text-indigo-500 focus:ring-indigo-500 bg-slate-900 transition-colors"
                    />
                    <span className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors">
                      Remember me for 30 days
                    </span>
                  </label>
                </div>

                {/* Submit */}
                <button type="submit" disabled={isSubmitting}
                  className={`w-full py-3 px-4 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2 transition-all mt-1 ${
                    role === "faculty"
                      ? "bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-500/25"
                      : "bg-gradient-to-r from-teal-600 via-teal-500 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 shadow-lg shadow-teal-500/25"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>
                        {mode === "login"
                          ? "Sign In"
                          : role === "faculty"
                            ? "Create Faculty Account"
                            : "Activate Account &amp; Sign In"}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Switch mode link */}
              <p className="text-center text-xs text-slate-500">
                {mode === "login" ? (
                  role === "faculty" ? (
                    <>Don't have an account? <button onClick={() => switchMode("signup")} className="font-semibold text-indigo-400 hover:text-indigo-300">Create one</button></>
                  ) : (
                    <>Want to activate / set a new password? <button onClick={() => switchMode("signup")} className="font-semibold text-teal-400 hover:text-teal-300">Activate account</button></>
                  )
                ) : (
                  <>Already have your password? <button onClick={() => switchMode("login")} className="font-semibold text-teal-400 hover:text-teal-300">Sign in</button></>
                )}
              </p>

              {/* Discreet Administrator Console Access Link */}
              <div className="pt-4 mt-2 border-t border-slate-800/80 text-center">
                <button
                  type="button"
                  onClick={() => setIsAdminModalOpen(true)}
                  className="text-[11px] text-slate-500 hover:text-indigo-400 transition inline-flex items-center gap-1.5 font-medium tracking-wide"
                >
                  <Lock className="w-3 h-3 text-slate-500" />
                  Administrator Access · Central Institutional Console ➔
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Admin Login Modal */}
      {isAdminModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 border border-indigo-500/30 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => {
                setIsAdminModalOpen(false);
                setAdminError(null);
              }}
              className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition text-xs"
            >
              ✕
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Central Admin Console</h3>
                <p className="text-xs text-slate-400">HOD / Dean Institutional Governance Portal</p>
              </div>
            </div>

            {adminError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
                {adminError}
              </div>
            )}

            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">
                  Administrator Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    placeholder="admin@campus.edu"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">
                  Master Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer group mt-2">
                <input
                  type="checkbox"
                  checked={adminRememberMe}
                  onChange={(e) => setAdminRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-700 text-indigo-500 focus:ring-indigo-500 bg-slate-900 transition-colors"
                />
                <span className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors">
                  Remember me for 30 days
                </span>
              </label>

              <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/20 text-[11px] text-slate-400">
                <span className="font-semibold text-indigo-300">Default Credentials:</span> admin@campus.edu / Admin@123
              </div>

              <button
                type="submit"
                disabled={isAdminSubmitting}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2"
              >
                {isAdminSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Authenticate as Administrator</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
