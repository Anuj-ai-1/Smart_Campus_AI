import React, { useState } from "react";
import {
  GraduationCap,
  Sparkles,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  BrainCircuit,
  Users,
  Compass,
  CheckCircle2,
  Lock,
  ChevronRight,
  Sliders,
  Layers,
  Award,
  BarChart3,
  BookOpen,
  LogIn,
  Activity,
  Flame,
  Zap,
  Menu,
  X,
  HelpCircle,
  Plus,
  Minus,
} from "lucide-react";

interface LandingPageProps {
  onOpenPortal: (target?: "admin" | "student" | "faculty") => void;
}

export function LandingPage({ onOpenPortal }: LandingPageProps) {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const toggleFaq = (idx: number) => {
    setActiveFaq(activeFaq === idx ? null : idx);
  };

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#f7eee7] text-stone-900 flex flex-col selection:bg-purple-500/20 selection:text-purple-900 relative overflow-x-hidden font-sans">
      {/* Subtle Warm Gradient Highlights matching reference background ambient glow */}
      <div className="absolute top-0 -left-20 w-[600px] h-[500px] bg-purple-400/[0.12] blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute top-40 -right-20 w-[550px] h-[550px] bg-rose-400/[0.10] blur-[150px] pointer-events-none rounded-full" />

      {/* ── HEADER NAVIGATION (Matching reference image minimal pill aesthetic) ────── */}
      <header className="w-full sticky top-0 z-50 bg-[#f7eee7]/90 backdrop-blur-md transition-all">
        <div className="max-w-7xl mx-auto px-6 sm:px-12 py-5 flex items-center justify-between">
          {/* Brand - Black Rounded App Icon exactly as in reference */}
          <div 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-2xl bg-black text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base text-stone-900 tracking-tight">Smart Campus</span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-stone-200/80 text-stone-700">
                  AI
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Links - Center clean text links matching reference */}
          <nav className="hidden lg:flex items-center gap-9 text-[13px] font-medium text-stone-700">
            <button 
              onClick={() => scrollToSection("how-it-works")} 
              className="hover:text-black transition"
            >
              How it works
            </button>
            <button 
              onClick={() => scrollToSection("features")} 
              className="hover:text-black transition"
            >
              Use cases
            </button>
            <button 
              onClick={() => scrollToSection("pillars")} 
              className="hover:text-black transition"
            >
              Features
            </button>
            <button 
              onClick={() => scrollToSection("copilot")} 
              className="hover:text-black transition"
            >
              AI Copilot
            </button>
            <button 
              onClick={() => scrollToSection("faq")} 
              className="hover:text-black transition"
            >
              FAQ
            </button>
          </nav>

          {/* Top Right Actions - Pill icon buttons matching reference */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => onOpenPortal()}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-black hover:bg-stone-800 text-white font-semibold text-xs tracking-tight shadow-sm hover:shadow transition-all active:scale-95 cursor-pointer shrink-0"
            >
              <span>Launch Console</span>
              <LogIn className="w-3.5 h-3.5 text-stone-300 shrink-0" />
            </button>

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-full bg-stone-200/70 hover:bg-stone-300 text-stone-800 transition cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-stone-200/60 bg-[#f7eee7] px-6 py-4 space-y-2 animate-in slide-in-from-top-2 duration-150">
            <button
              onClick={() => scrollToSection("how-it-works")}
              className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold text-stone-700 hover:text-black hover:bg-stone-200/60 transition"
            >
              How it works
            </button>
            <button
              onClick={() => scrollToSection("features")}
              className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold text-stone-700 hover:text-black hover:bg-stone-200/60 transition"
            >
              Architecture &amp; Use Cases
            </button>
            <button
              onClick={() => scrollToSection("pillars")}
              className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold text-stone-700 hover:text-black hover:bg-stone-200/60 transition"
            >
              5 Telemetry Pillars
            </button>
            <button
              onClick={() => scrollToSection("copilot")}
              className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold text-stone-700 hover:text-black hover:bg-stone-200/60 transition"
            >
              AI Copilot &amp; Simulator
            </button>
            <button
              onClick={() => scrollToSection("faq")}
              className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold text-stone-700 hover:text-black hover:bg-stone-200/60 transition"
            >
              Institutional FAQs
            </button>

            <div className="pt-2 border-t border-stone-200/60">
              <button
                onClick={() => onOpenPortal()}
                className="w-full py-2.5 rounded-full bg-gradient-to-r from-purple-600 via-rose-500 to-amber-500 text-white font-semibold text-xs transition flex items-center justify-center gap-2 shadow-md active:scale-95"
              >
                <span>Launch Console</span>
                <LogIn className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </header>

      {/* ── HERO BENTO STAGE (Exactly following reference layout & colors) ── */}
      <section className="w-full relative z-10 py-12 lg:py-20">
        <div className="max-w-7xl mx-auto px-6 sm:px-12 flex flex-col lg:flex-row items-center justify-between gap-12">
          
          {/* Left Hero Narrative */}
          <div className="max-w-xl space-y-6">
            <h1 className="text-5xl sm:text-6xl lg:text-[68px] font-extrabold text-stone-900 tracking-tight leading-[1.08]">
              <span className="bg-gradient-to-r from-purple-600 via-rose-500 to-amber-500 bg-clip-text text-transparent">
                AI analysis
              </span>{" "}
              for student success
            </h1>

            <p className="text-sm sm:text-base text-stone-600 leading-relaxed max-w-lg font-normal">
              Smart Campus continuously calculates multi-pillar health, identifies early dropout or placement risks, and guides students with personalized AI copilot roadmaps — before it&apos;s too late.
            </p>

            {/* CTAs matching reference buttons (Coral gradient pill + white border pill) */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => onOpenPortal()}
                className="px-7 py-3.5 rounded-full bg-gradient-to-r from-purple-600 via-rose-500 to-amber-500 hover:opacity-95 text-white text-xs sm:text-sm font-bold tracking-tight transition flex items-center gap-2.5 shadow-lg shadow-rose-500/20 active:scale-95 cursor-pointer"
              >
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                  <ArrowRight className="w-3 h-3 text-white" />
                </div>
                <span>Start for free</span>
              </button>

              <button
                onClick={() => scrollToSection("features")}
                className="px-6 py-3.5 rounded-full bg-transparent hover:bg-stone-200/50 border border-stone-300 text-stone-800 text-xs sm:text-sm font-semibold transition active:scale-95 cursor-pointer"
              >
                Contact us
              </button>
            </div>

            <div className="flex items-center gap-6 pt-3 text-[12px] text-stone-500 font-medium">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-stone-400" /> Multi-pillar SSS Engine
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-stone-400" /> Role-isolated Cohorts
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-stone-400" /> Cancel anytime
              </span>
            </div>
          </div>

          {/* Right Floating 3D / Isometric Bento Composition (Matches reference with phone mockup & floating dialog) */}
          <div className="relative w-full max-w-lg flex items-center justify-center py-6">
            
            {/* Ambient Backing Glow */}
            <div className="absolute inset-0 bg-purple-400/20 rounded-full blur-3xl pointer-events-none" />

            {/* Main Central Card: Phone-like Dark Frame matching reference mockup */}
            <div className="relative z-10 w-72 sm:w-80 rounded-[2.2rem] bg-black text-white p-5 shadow-2xl shadow-stone-900/20 space-y-4 animate-bubble-center border border-stone-800">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center font-bold text-xs text-purple-300">
                    ST
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">End-of-Semester Review</h4>
                    <span className="text-[10px] text-stone-400">Live AI Telemetry</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  92.4 SSS
                </span>
              </div>

              {/* Audio / Telemetry Waveform visualization exactly as in reference */}
              <div className="p-3.5 rounded-2xl bg-stone-900/80 border border-white/10 space-y-2">
                <div className="flex items-center justify-between text-[10px] text-stone-400 font-mono">
                  <span>00:05:39</span>
                  <span className="text-rose-400 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Analysing...
                  </span>
                </div>
                <div className="flex items-end gap-1.5 h-10 px-1">
                  {[35, 65, 85, 55, 95, 80, 60, 90, 100, 70, 85, 92].map((val, idx) => (
                    <div
                      key={idx}
                      style={{ height: `${val}%` }}
                      className="flex-1 rounded-full bg-gradient-to-t from-purple-500 via-rose-500 to-amber-400 opacity-90"
                    />
                  ))}
                </div>
              </div>

              {/* White Floating Speech / Insight Dialog matching reference bubble */}
              <div className="p-4 rounded-2xl bg-white text-stone-900 shadow-xl space-y-1.5 -mx-2 -mb-2 border border-stone-100">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-purple-500 to-rose-500 flex items-center justify-center text-[10px] text-white font-bold">
                    AI
                  </div>
                  <span className="text-[11px] font-bold text-stone-800">Placement Copilot</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-purple-100 text-purple-700 font-mono">96.8%</span>
                </div>
                <p className="text-[11px] text-stone-600 leading-snug">
                  The only thing left is to clear the DSA mock interview to secure Tier-1 product eligibility.
                </p>
              </div>
            </div>

            {/* Orbiting Satellite Bento 1: Top Left Peer Benchmark */}
            <div className="absolute -top-3 -left-4 sm:-left-8 z-20 p-3 rounded-2xl bg-white/95 backdrop-blur-md border border-stone-200/80 shadow-xl shadow-stone-800/5 flex items-center gap-2.5 animate-bubble-slow-1 hover:scale-105 transition-transform duration-300">
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                <Award className="w-4 h-4" />
              </div>
              <div className="text-left">
                <span className="text-[10px] text-stone-500 block font-medium">Cohort Rank</span>
                <span className="text-xs font-bold text-stone-900 font-mono">#3 in CSE Sem 4</span>
              </div>
            </div>

            {/* Orbiting Satellite Bento 2: Right ML Segment */}
            <div className="absolute top-1/4 -right-2 sm:-right-8 z-20 p-3 rounded-2xl bg-white/95 backdrop-blur-md border border-stone-200/80 shadow-xl shadow-stone-800/5 flex items-center gap-2.5 animate-bubble-slow-2 hover:scale-105 transition-transform duration-300">
              <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                <BrainCircuit className="w-4 h-4" />
              </div>
              <div className="text-left">
                <span className="text-[10px] text-stone-500 block font-medium">K-Means Segment</span>
                <span className="text-xs font-bold text-purple-900">All-Round Achiever</span>
              </div>
            </div>

            {/* Orbiting Satellite Bento 3: Bottom Left Debarment Safe Guard */}
            <div className="absolute -bottom-4 left-2 sm:left-0 z-20 p-3 rounded-2xl bg-white/95 backdrop-blur-md border border-stone-200/80 shadow-xl shadow-stone-800/5 flex items-center gap-2.5 animate-bubble-slow-3 hover:scale-105 transition-transform duration-300">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="text-left">
                <span className="text-[10px] text-stone-500 block font-medium">Attendance Status</span>
                <span className="text-xs font-bold text-emerald-700">89.4% (Exam Safe)</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── SECTION: VIDEO SHOWCASE ── */}
      <section className="w-full py-12 relative z-10">
        <div className="max-w-6xl mx-auto px-6 sm:px-12 text-center space-y-10">
          <div className="space-y-3">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-rose-200/50 text-rose-800 border border-rose-300/50">
              Platform Walkthrough
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
              See the Intelligence in Action
            </h2>
          </div>
          
          {/* Browser Frame Video Mockup */}
          <div className="relative mx-auto rounded-[2rem] overflow-hidden border-4 border-stone-800 shadow-2xl bg-black transform hover:scale-[1.01] transition-transform duration-500">
            {/* Browser top bar */}
            <div className="w-full h-10 bg-stone-900 flex items-center px-4 gap-2 border-b border-stone-800">
              <div className="w-3 h-3 rounded-full bg-rose-500" />
              <div className="w-3 h-3 rounded-full bg-amber-500" />
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <div className="flex-1 text-center">
                <div className="inline-block px-24 py-1 rounded-lg bg-stone-800/80 text-[10px] text-stone-400 font-mono">
                  app.smartcampus.edu
                </div>
              </div>
            </div>
            
            {/* Simulated Step-by-Step Platform Video */}
            <div className="w-full aspect-video bg-slate-900 relative overflow-hidden flex flex-col font-sans">
              <style>{`
                @keyframes step1 { 0%, 25% { opacity: 1; transform: scale(1); } 30%, 100% { opacity: 0; transform: scale(0.95); } }
                @keyframes step2 { 0%, 25% { opacity: 0; transform: scale(1.05); } 33%, 58% { opacity: 1; transform: scale(1); } 63%, 100% { opacity: 0; transform: scale(0.95); } }
                @keyframes step3 { 0%, 58% { opacity: 0; transform: scale(1.05); } 66%, 95% { opacity: 1; transform: scale(1); } 100% { opacity: 0; transform: scale(0.95); } }
                @keyframes progress { 0% { width: 0%; } 100% { width: 100%; } }
                
                .sim-step-1 { animation: step1 12s infinite; }
                .sim-step-2 { animation: step2 12s infinite; }
                .sim-step-3 { animation: step3 12s infinite; }
                .sim-progress { animation: progress 12s linear infinite; }
              `}</style>

              {/* Progress Bar Top */}
              <div className="w-full h-1 bg-slate-800 absolute top-0 left-0 z-20">
                <div className="h-full bg-rose-500 sim-progress" />
              </div>

              {/* Step 1: Faculty Upload */}
              <div className="absolute inset-0 p-8 sm:p-12 flex flex-col items-center justify-center text-center space-y-6 sim-step-1 z-10">
                <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
                  <Users className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">1. Connect & Ingest</h3>
                  <p className="text-slate-400 mt-2 max-w-sm mx-auto">Faculty syncs LMS, Attendance & Internal marks seamlessly.</p>
                </div>
                <div className="w-full max-w-md p-4 rounded-xl bg-slate-800/50 border border-slate-700 mt-4 flex flex-col gap-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="w-full h-8 rounded-lg bg-slate-700/50 flex items-center px-4 gap-3">
                      <div className="w-4 h-4 rounded-full bg-indigo-400/50" />
                      <div className="h-2 rounded-full bg-slate-600 flex-1" />
                      <div className="h-2 w-12 rounded-full bg-slate-600" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Step 2: AI Processing */}
              <div className="absolute inset-0 p-8 sm:p-12 flex flex-col items-center justify-center text-center space-y-6 sim-step-2 z-10">
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30 animate-pulse">
                    <BrainCircuit className="w-8 h-8" />
                  </div>
                  <div className="absolute inset-0 bg-rose-500/20 blur-xl rounded-full" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">2. AI Scoring & Clustering</h3>
                  <p className="text-slate-400 mt-2 max-w-sm mx-auto">K-Means algorithm calculates the 5-Pillar Success Score (SSS).</p>
                </div>
                <div className="flex items-end gap-2 h-24 mt-4">
                  {[40, 70, 45, 90, 65, 80, 100, 85].map((val, i) => (
                    <div key={i} className="w-8 rounded-t-lg bg-gradient-to-t from-rose-600 to-amber-400 opacity-80" style={{ height: `${val}%` }} />
                  ))}
                </div>
              </div>

              {/* Step 3: Copilot Roadmap */}
              <div className="absolute inset-0 p-8 sm:p-12 flex flex-col items-center justify-center text-center space-y-6 sim-step-3 z-10">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                  <Compass className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">3. Actionable Copilot</h3>
                  <p className="text-slate-400 mt-2 max-w-sm mx-auto">Student receives a personalized week-by-week intervention roadmap.</p>
                </div>
                <div className="w-full max-w-md bg-emerald-950/30 border border-emerald-900/50 p-4 rounded-xl text-left space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span className="text-sm font-medium text-emerald-200">Clear DSA mock interview</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span className="text-sm font-medium text-emerald-200">Attend next 3 lectures (Risk Warning)</span>
                  </div>
                  <button className="w-full py-2 rounded-lg bg-emerald-600 text-white text-xs font-bold mt-2">
                    View Placement Status
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CLIENT & INSTITUTION LOGO STRIP ── */}
      <div className="w-full overflow-hidden relative flex flex-col items-center justify-center py-12 space-y-10">
        <style>{`
          @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .animate-marquee {
            animation: marquee 80s linear infinite;
          }
          .animate-marquee:hover {
            animation-play-state: paused;
          }
        `}</style>
        
        <span className="text-[13px] text-stone-500 font-sans tracking-wide font-semibold text-center w-full px-6">
          Trusted by leading technical institutions:
        </span>
        
        <div className="w-full border-t border-b border-stone-200/80 bg-[#f4ebe3]/60 py-8">
          <div className="w-full flex overflow-hidden">
            <div className="flex items-center whitespace-nowrap animate-marquee">
              {[...Array(2)].map((_, groupIdx) => (
                <div key={groupIdx} className="flex items-center">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex items-center gap-20 px-10 text-3xl font-extrabold uppercase text-stone-700 tracking-[0.15em]">
                      <span className="hover:text-black transition cursor-pointer">SHELLS</span>
                      <span className="hover:text-black transition cursor-pointer">SMARTFINDER</span>
                      <span className="hover:text-black transition cursor-pointer">ZOOMERR</span>
                      <span className="hover:text-black transition cursor-pointer">KONTRASTR</span>
                      <span className="hover:text-black transition cursor-pointer">WAVESMARATHON</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── SECTION: HOW IT WORKS BENTO GRID ─────────────────────────── */}
      <section id="how-it-works" className="w-full py-20 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-6 sm:px-12 space-y-12">
          <div id="features" className="text-center max-w-xl mx-auto space-y-2 scroll-mt-24">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-stone-200/80 text-stone-700">
              Workflow
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
              From Raw LMS Records to Prescriptive Action
            </h2>
            <p className="text-xs sm:text-sm text-stone-600">
              A 3-step continuous feedback loop between students, mentors, and placement deans.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-8 rounded-[2rem] bg-white border border-stone-200/80 shadow-sm hover:shadow-md space-y-4 flex flex-col justify-between transition-all">
              <div>
                <div className="w-11 h-11 rounded-2xl bg-purple-100 text-purple-700 font-extrabold flex items-center justify-center text-sm mb-4">
                  01
                </div>
                <h3 className="text-lg font-bold text-stone-900">Multi-Source Telemetry Ingestion</h3>
                <p className="text-xs text-stone-600 mt-2 leading-relaxed">
                  Aggregates attendance rosters, internal examination marks, LMS weekly logins, LeetCode assessments, and hackathon milestones into unified student profiles.
                </p>
              </div>
              <span className="text-xs text-purple-700 font-bold pt-4 flex items-center gap-1">
                Automated Ingestion ➔
              </span>
            </div>

            <div className="p-8 rounded-[2rem] bg-white border border-stone-200/80 shadow-sm hover:shadow-md space-y-4 flex flex-col justify-between transition-all">
              <div>
                <div className="w-11 h-11 rounded-2xl bg-rose-100 text-rose-700 font-extrabold flex items-center justify-center text-sm mb-4">
                  02
                </div>
                <h3 className="text-lg font-bold text-stone-900">5-Pillar SSS &amp; ML Clustering</h3>
                <p className="text-xs text-stone-600 mt-2 leading-relaxed">
                  Calculates Student Success Score (SSS 0-100) and executes K-Means clustering to categorize students into actionable behavioral segments.
                </p>
              </div>
              <span className="text-xs text-rose-700 font-bold pt-4 flex items-center gap-1">
                K-Means Machine Learning ➔
              </span>
            </div>

            <div className="p-8 rounded-[2rem] bg-white border border-stone-200/80 shadow-sm hover:shadow-md space-y-4 flex flex-col justify-between transition-all">
              <div>
                <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-800 font-extrabold flex items-center justify-center text-sm mb-4">
                  03
                </div>
                <h3 className="text-lg font-bold text-stone-900">Prescriptive AI Interventions</h3>
                <p className="text-xs text-stone-600 mt-2 leading-relaxed">
                  Debarment warning alerts notify mentors in advance, while the AI Career Copilot prescribes customized 4-week roadmaps to bridge recruitment cutoffs.
                </p>
              </div>
              <span className="text-xs text-amber-700 font-bold pt-4 flex items-center gap-1">
                Closed-Loop Tracking ➔
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION: 5-PILLARS DECOMPOSITION (BENTO BOX) ─────────────── */}
      <section id="pillars" className="w-full py-20 border-t border-stone-200/80 bg-[#f4ebe3]/40">
        <div className="max-w-7xl mx-auto px-6 sm:px-12 space-y-12">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-stone-200/80 text-stone-700">
                Scoring Engine
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight mt-2">
                The 5 Foundational Telemetry Pillars
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-stone-600 max-w-md">
              Evaluated with zero guesswork. Mathematically formulated to give balanced weighting to academics, attendance, and technical capability.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-stone-200/80 shadow-sm space-y-2 hover:border-purple-300 transition">
              <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center text-purple-700">
                <BookOpen className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-stone-900">Academic Health (30%)</h4>
              <p className="text-[11px] text-stone-600">
                CGPA scaling with strict deductions for active backlogs.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-stone-200/80 shadow-sm space-y-2 hover:border-emerald-300 transition">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-stone-900">Attendance (20%)</h4>
              <p className="text-[11px] text-stone-600">
                Real-time lecture compliance with 75% examination debarment guardrails.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-stone-200/80 shadow-sm space-y-2 hover:border-amber-300 transition">
              <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700">
                <Compass className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-stone-900">Placement Readiness (20%)</h4>
              <p className="text-[11px] text-stone-600">
                Weighted coding assessment scores, analytical aptitude, and mock interviews.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-stone-200/80 shadow-sm space-y-2 hover:border-sky-300 transition">
              <div className="w-8 h-8 rounded-lg bg-sky-100 flex items-center justify-center text-sky-700">
                <Activity className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-stone-900">LMS Coursework (15%)</h4>
              <p className="text-[11px] text-stone-600">
                Weekly login cadence and digital assignment completion rates.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-stone-200/80 shadow-sm space-y-2 hover:border-rose-300 transition">
              <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center text-rose-700">
                <Flame className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-stone-900">Engagement (15%)</h4>
              <p className="text-[11px] text-stone-600">
                Verified hackathons, certifications, and campus technical club initiatives.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION: AI COPILOT & WHAT-IF SIMULATOR PREVIEW ──────────── */}
      <section id="copilot" className="w-full py-20 border-t border-stone-200/80">
        <div className="max-w-7xl mx-auto px-6 sm:px-12 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          <div className="space-y-5">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-purple-100 text-purple-700">
              Interactive Growth Lab
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
              Simulate your future score before taking the exam
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              Students can test hypotheses in the &quot;What-If&quot; Simulator. Move sliders to discover how clearing a backlog or achieving 80% attendance impacts their percentile and placement drive eligibility.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2.5 text-xs text-stone-700 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Role-specific gap analysis against Tier-1 SDE recruiter cutoffs</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-stone-700 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Instant 5-pillar mathematical projection updates in real-time</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-stone-700 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Gamified badges (Bronze to Diamond) to reward continuous improvement</span>
              </div>
            </div>

            <div className="pt-3">
              <button
                onClick={() => onOpenPortal()}
                className="px-6 py-3.5 rounded-full bg-gradient-to-r from-purple-600 via-rose-500 to-amber-500 hover:opacity-95 text-white text-xs font-bold transition flex items-center gap-2 shadow-md shadow-rose-500/20 active:scale-95 cursor-pointer"
              >
                <span>Experience What-If Simulator</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Interactive Preview Bento Box */}
          <div className="p-8 rounded-[2rem] bg-white border border-stone-200/80 space-y-4 shadow-xl">
            <div className="flex items-center justify-between text-xs pb-3 border-b border-stone-100">
              <span className="font-bold text-stone-900 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-purple-600" />
                What-If Simulation Sandbox
              </span>
              <span className="text-[11px] text-emerald-700 font-mono font-bold">+12.4 SSS Potential</span>
            </div>

            {/* Slider 1 Preview */}
            <div className="space-y-2 p-4 rounded-2xl bg-stone-50 border border-stone-100">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-stone-600">Attendance Target</span>
                <span className="font-mono text-emerald-700 font-bold">88%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-stone-200 overflow-hidden">
                <div className="w-[88%] h-full bg-emerald-500 rounded-full" />
              </div>
            </div>

            {/* Slider 2 Preview */}
            <div className="space-y-2 p-4 rounded-2xl bg-stone-50 border border-stone-100">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-stone-600">Coding Assessment</span>
                <span className="font-mono text-purple-700 font-bold">85 / 100</span>
              </div>
              <div className="w-full h-2 rounded-full bg-stone-200 overflow-hidden">
                <div className="w-[85%] h-full bg-gradient-to-r from-purple-500 to-rose-500 rounded-full" />
              </div>
            </div>

            {/* Result Preview */}
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs">
              <div>
                <span className="text-emerald-900 font-bold block">Placement Tier Projected</span>
                <span className="text-[11px] text-stone-600">Tier-1 Product Companies (Microsoft, Google)</span>
              </div>
              <span className="text-xs font-mono font-extrabold text-emerald-700 px-2 py-0.5 rounded-full bg-emerald-100">ELIGIBLE</span>
            </div>
          </div>

        </div>
      </section>

      {/* ── SECTION: FREQUENTLY ASKED QUESTIONS (BENTO EXPANDABLE ACCORDION) ── */}
      <section id="faq" className="w-full py-24 border-t border-stone-200/80 bg-[#f4ebe3]/40 relative scroll-mt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-8 space-y-10">
          
          {/* Header & Badges */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 text-[11px] font-bold text-purple-700">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Everything You Need to Know</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
              Institutional Governance &amp; Platform FAQs
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 max-w-lg mx-auto">
              Real-world answers covering faculty segregation, early debarment guardrails, AI roadmaps, and administrative workflows.
            </p>
          </div>

          {/* Interactive Category Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {[
              { id: "all", label: "All Questions" },
              { id: "access", label: "Access & Segregation" },
              { id: "ai", label: "AI Scoring & Copilot" },
              { id: "students", label: "Student Portfolio" },
              { id: "admin", label: "Administration" },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
                  selectedCategory === cat.id
                    ? "bg-black text-white shadow-sm"
                    : "bg-white text-stone-600 hover:text-black hover:bg-stone-100 border border-stone-200"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* FAQ Accordion Bento Box Cards */}
          <div className="space-y-3.5">
            {[
              {
                id: 1,
                cat: "access",
                tag: "Role-Based Access",
                q: "How is cohort isolation enforced between different faculty members?",
                a: "Faculty permissions are strictly managed by the Super Admin. Each faculty member only receives access to their authorized Branch, Semester, and Division (e.g. CSE - Sem 4 - Div A). When logged in, backend SQLite/SQL queries filter student records by assigned_cohorts, preventing unauthorized cross-branch grading or telemetry access.",
              },
              {
                id: 2,
                cat: "ai",
                tag: "Debarment Guardrail",
                q: "How does the early debarment warning mechanism function?",
                a: "The attendance telemetry pipeline runs in real-time. Any student falling below the statutory 75% attendance threshold triggers an automatic High Priority Debarment alert in both the faculty dashboard and the student's personal portal, allowing intervention weeks before semester examinations.",
              },
              {
                id: 3,
                cat: "ai",
                tag: "Scoring Engine",
                q: "What mathematical logic powers the Student Success Score (SSS 0-100)?",
                a: "The scoring engine computes a weighted index across 5 foundational pillars: Academic Health (30%), Attendance Compliance (20%), Placement Readiness (20%), LMS Activity Cadence (15%), and Verified Co-curricular Engagement (15%). Deductions are systematically applied for active backlogs.",
              },
              {
                id: 4,
                cat: "students",
                tag: "Student Empowerment",
                q: "Can students update their own projects and technical certifications?",
                a: "Yes! Students have access to the 'Edit My Profile & Portfolio' feature directly within their portal. They can add GitHub repositories, verify LeetCode profiles, showcase live deployed project URLs, and log hackathon awards which immediately sync with their 360 profile.",
              },
              {
                id: 5,
                cat: "ai",
                tag: "Interactive Growth Lab",
                q: "How does the 'What-If' Simulation Sandbox help students?",
                a: "Instead of retroactive grading, the What-If Simulator lets students interactively tweak prospective attendance percentages, expected examination marks, or backlogs cleared to preview their projected SSS score and Tier-1 recruiter eligibility in real-time.",
              },
              {
                id: 6,
                cat: "admin",
                tag: "Institutional Governance",
                q: "How does the Super Admin console manage campus-wide operations?",
                a: "The central Admin console (available via Admin Login) provides single-pane-of-glass oversight across all branches and divisions. Deans can assign/revoke faculty cohort permissions with a click, manage bulk student enrollments via CSV, and review campus-wide percentile distributions.",
              },
            ]
              .filter((item) => selectedCategory === "all" || item.cat === selectedCategory)
              .map((faq) => {
                const isOpen = activeFaq === faq.id;
                return (
                  <div
                    key={faq.id}
                    onClick={() => toggleFaq(faq.id)}
                    className={`rounded-2xl border transition-all cursor-pointer overflow-hidden ${
                      isOpen
                        ? "bg-white border-purple-300 shadow-md"
                        : "bg-white/80 border-stone-200/80 hover:border-stone-300 hover:bg-white"
                    }`}
                  >
                    <div className="p-5 flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-stone-100 text-stone-600">
                          {faq.tag}
                        </span>
                        <h4 className={`text-xs sm:text-sm font-bold transition ${isOpen ? "text-stone-900" : "text-stone-800"}`}>
                          {faq.q}
                        </h4>
                      </div>

                      <div className={`p-1.5 rounded-xl shrink-0 transition-colors ${
                        isOpen ? "bg-purple-100 text-purple-700" : "bg-stone-100 text-stone-500"
                      }`}>
                        {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                      </div>
                    </div>

                    {isOpen && (
                      <div className="px-5 pb-5 pt-0 animate-in fade-in duration-150">
                        <div className="pt-3 border-t border-stone-100 text-xs text-stone-600 leading-relaxed">
                          {faq.a}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>

          {/* Bottom Helpdesk Pill Banner */}
          <div className="p-6 sm:p-7 rounded-[2rem] bg-gradient-to-r from-purple-100 via-rose-50 to-amber-50 border border-stone-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left shadow-sm">
            <div>
              <h5 className="text-sm font-bold text-stone-900">Have departmental deployment questions?</h5>
              <p className="text-xs text-stone-600 mt-0.5">
                Access the Institutional Console to explore preconfigured faculty and student sandboxes.
              </p>
            </div>
            <button
              onClick={() => onOpenPortal()}
              className="px-5 py-2.5 rounded-full bg-black text-white hover:bg-stone-800 text-xs font-bold transition shrink-0 flex items-center gap-2 active:scale-95 cursor-pointer"
            >
              <span>Access Institutional Portal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────────── */}
      <footer className="w-full border-t border-stone-200/80 bg-[#f4ebe3]/80">
        <div className="max-w-7xl mx-auto px-6 sm:px-12 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500 font-medium">
          <div className="flex items-center gap-2">
            <span className="font-bold text-stone-900">Smart Campus AI</span>
            <span>·</span>
            <span>Edition {new Date().getFullYear()}</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <button onClick={() => onOpenPortal()} className="text-purple-700 font-bold hover:underline">
              Institutional Console ➔
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
