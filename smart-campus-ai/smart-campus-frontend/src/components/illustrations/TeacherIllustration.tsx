import React from "react";
import { BookOpen, GraduationCap, Award, CheckCircle2, TrendingUp, Sparkles } from "lucide-react";

export function TeacherIllustration() {
  return (
    <div className="relative w-full max-w-md mx-auto aspect-square flex items-center justify-center p-6 select-none">
      {/* Ambient glassmorphic glow rings */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-indigo-500/20 via-purple-500/15 to-teal-500/20 blur-2xl animate-pulseSlow" />
      <div className="absolute w-72 h-72 rounded-full border border-indigo-400/20 animate-spin" style={{ animationDuration: "25s" }} />
      <div className="absolute w-84 h-84 rounded-full border border-dashed border-purple-400/15" />

      {/* Floating Glass Badges */}
      <div className="absolute top-4 left-2 z-20 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 backdrop-blur-md border border-white/10 shadow-glass animate-float">
        <Sparkles className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: "8s" }} />
        <span className="text-xs font-semibold text-slate-200">AI Cohort Advisor</span>
      </div>

      <div className="absolute bottom-10 right-0 z-20 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 backdrop-blur-md border border-teal-500/30 shadow-glass animate-float" style={{ animationDelay: "1.5s" }}>
        <TrendingUp className="w-4 h-4 text-teal-400" />
        <span className="text-xs font-semibold text-slate-200">Student Success: 88.4%</span>
      </div>

      <div className="absolute top-1/2 -left-4 z-20 flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-900/80 backdrop-blur-md border border-indigo-500/30 shadow-glass animate-float" style={{ animationDelay: "3s" }}>
        <Award className="w-4 h-4 text-indigo-400" />
        <span className="text-xs font-semibold text-slate-200">Faculty Leadership</span>
      </div>

      {/* Centerpiece Vector Teacher Illustration */}
      <svg
        viewBox="0 0 400 400"
        className="relative z-10 w-full h-full max-h-80 drop-shadow-2xl"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="teacherSkin" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffd8c2" />
            <stop offset="100%" stopColor="#f7bc99" />
          </linearGradient>
          <linearGradient id="teacherBlazer" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#312e81" />
            <stop offset="50%" stopColor="#1e1b4b" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>
          <linearGradient id="hologramBoard" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#14b8a6" stopOpacity="0.15" />
          </linearGradient>
        </defs>

        {/* Holographic Interactive Board behind teacher */}
        <rect x="70" y="50" width="260" height="150" rx="16" fill="url(#hologramBoard)" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
        {/* Holographic graph lines */}
        <path d="M 90 160 L 130 140 L 170 150 L 220 110 L 260 120 L 300 90" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="3 3" />
        <circle cx="220" cy="110" r="4" fill="#38bdf8" />
        <circle cx="300" cy="90" r="4" fill="#14b8a6" />
        {/* Holographic dashboard bar cards */}
        <rect x="90" y="70" width="45" height="6" rx="3" fill="rgba(255,255,255,0.4)" />
        <rect x="90" y="82" width="65" height="4" rx="2" fill="rgba(255,255,255,0.2)" />
        <rect x="90" y="92" width="55" height="4" rx="2" fill="rgba(255,255,255,0.2)" />

        {/* Teacher Silhouette / Character */}
        {/* Hair Back */}
        <ellipse cx="200" cy="190" rx="36" ry="34" fill="#1e293b" />

        {/* Body / Blazer */}
        <path
          d="M 140 370 C 140 270, 165 240, 200 240 C 235 240, 260 270, 260 370 Z"
          fill="url(#teacherBlazer)"
          stroke="#4338ca"
          strokeWidth="1.5"
        />
        {/* Shirt / Tie */}
        <polygon points="200,242 186,270 214,270" fill="#f8fafc" />
        <polygon points="196,270 204,270 202,320 200,326 198,320" fill="#6366f1" />
        <path d="M 186 270 L 200 340 L 214 270" fill="none" stroke="#e2e8f0" strokeWidth="1" />

        {/* Neck */}
        <rect x="190" y="215" width="20" height="30" fill="url(#teacherSkin)" rx="4" />

        {/* Head */}
        <ellipse cx="200" cy="190" rx="28" ry="32" fill="url(#teacherSkin)" />

        {/* Hair Front / Modern Cut */}
        <path
          d="M 172 185 C 170 155, 230 150, 228 185 C 220 165, 185 165, 172 185 Z"
          fill="#1e293b"
        />

        {/* Glasses (Teacher Archetype) */}
        <rect x="180" y="184" width="16" height="12" rx="3" fill="none" stroke="#e2e8f0" strokeWidth="2" />
        <rect x="204" y="184" width="16" height="12" rx="3" fill="none" stroke="#e2e8f0" strokeWidth="2" />
        <line x1="196" y1="189" x2="204" y2="189" stroke="#e2e8f0" strokeWidth="2" />

        {/* Smile */}
        <path d="M 193 206 Q 200 212 207 206" fill="none" stroke="#e07a5f" strokeWidth="2" strokeLinecap="round" />

        {/* Arms / Pose: Holding Smart Tablet */}
        <path d="M 152 275 Q 170 310 190 320" fill="none" stroke="url(#teacherBlazer)" strokeWidth="18" strokeLinecap="round" />
        <path d="M 248 275 Q 230 310 210 320" fill="none" stroke="url(#teacherBlazer)" strokeWidth="18" strokeLinecap="round" />

        {/* Tablet in Hands */}
        <rect x="175" y="300" width="50" height="40" rx="6" fill="#0f172a" stroke="#6366f1" strokeWidth="2" />
        <rect x="180" y="306" width="40" height="26" rx="3" fill="#1e1b4b" />
        {/* Tablet screen glow lines */}
        <line x1="184" y1="314" x2="210" y2="314" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" />
        <line x1="184" y1="322" x2="202" y2="322" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" />
        {/* Hands holding tablet */}
        <circle cx="174" cy="320" r="7" fill="url(#teacherSkin)" />
        <circle cx="226" cy="320" r="7" fill="url(#teacherSkin)" />
      </svg>
    </div>
  );
}
