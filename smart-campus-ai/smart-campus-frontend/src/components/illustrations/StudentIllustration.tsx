import React from "react";
import { Laptop, Terminal, Award, Zap, Code2, GraduationCap } from "lucide-react";

export function StudentIllustration() {
  return (
    <div className="relative w-full max-w-md mx-auto aspect-square flex items-center justify-center p-6 select-none">
      {/* Ambient glassmorphic glow rings */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-cyan-500/20 via-indigo-500/20 to-teal-500/25 blur-2xl animate-pulseSlow" />
      <div className="absolute w-72 h-72 rounded-full border border-teal-400/20 animate-spin" style={{ animationDuration: "20s", animationDirection: "reverse" }} />
      <div className="absolute w-84 h-84 rounded-full border border-dashed border-cyan-400/15" />

      {/* Floating Glass Badges */}
      <div className="absolute top-4 right-2 z-20 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 backdrop-blur-md border border-teal-500/30 shadow-glass animate-float">
        <GraduationCap className="w-4 h-4 text-teal-400" />
        <span className="text-xs font-semibold text-slate-200">CGPA 9.1 · Honors</span>
      </div>

      <div className="absolute bottom-8 left-0 z-20 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 backdrop-blur-md border border-indigo-500/30 shadow-glass animate-float" style={{ animationDelay: "2s" }}>
        <Code2 className="w-4 h-4 text-indigo-400" />
        <span className="text-xs font-semibold text-slate-200">Coding Score: 92/100</span>
      </div>

      <div className="absolute top-1/2 -right-4 z-20 flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-900/80 backdrop-blur-md border border-amber-500/30 shadow-glass animate-float" style={{ animationDelay: "1s" }}>
        <Zap className="w-4 h-4 text-amber-400" />
        <span className="text-xs font-semibold text-slate-200">Hackathon Winner</span>
      </div>

      {/* Centerpiece Vector Student Illustration */}
      <svg
        viewBox="0 0 400 400"
        className="relative z-10 w-full h-full max-h-80 drop-shadow-2xl"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="studentSkin" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fde2d0" />
            <stop offset="100%" stopColor="#f3b89e" />
          </linearGradient>
          <linearGradient id="studentHoodie" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0f766e" />
            <stop offset="50%" stopColor="#115e59" />
            <stop offset="100%" stopColor="#134e4a" />
          </linearGradient>
          <linearGradient id="laptopGlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#2dd4bf" stopOpacity="0.4" />
          </linearGradient>
        </defs>

        {/* Floating Holographic Coding Matrix Window */}
        <rect x="75" y="45" width="250" height="135" rx="14" fill="rgba(15, 23, 42, 0.75)" stroke="rgba(20, 184, 166, 0.3)" strokeWidth="1.5" />
        <circle cx="95" cy="60" r="3.5" fill="#f43f5e" />
        <circle cx="107" cy="60" r="3.5" fill="#f59e0b" />
        <circle cx="119" cy="60" r="3.5" fill="#10b981" />
        {/* Terminal Text Lines */}
        <text x="95" y="85" fill="#2dd4bf" fontSize="10" fontFamily="JetBrains Mono, monospace">&gt; calculateSuccessScore()</text>
        <text x="95" y="103" fill="#94a3b8" fontSize="9" fontFamily="JetBrains Mono, monospace">✓ Academic Pillar: 91.0</text>
        <text x="95" y="119" fill="#94a3b8" fontSize="9" fontFamily="JetBrains Mono, monospace">✓ Placement Readiness: 92%</text>
        <text x="95" y="137" fill="#38bdf8" fontSize="9" fontFamily="JetBrains Mono, monospace">→ Status: Top Performer</text>

        {/* Student Silhouette / Character */}
        {/* Hair Back */}
        <ellipse cx="200" cy="185" rx="34" ry="32" fill="#0f172a" />

        {/* Body / Casual Tech Hoodie */}
        <path
          d="M 135 370 C 135 270, 165 240, 200 240 C 235 240, 265 270, 265 370 Z"
          fill="url(#studentHoodie)"
          stroke="#14b8a6"
          strokeWidth="1.5"
        />

        {/* Hoodie Strings / V-neck */}
        <path d="M 188 245 Q 200 270 212 245" fill="none" stroke="#2dd4bf" strokeWidth="2.5" />
        <line x1="194" y1="260" x2="194" y2="295" stroke="#e2e8f0" strokeWidth="2" strokeLinecap="round" />
        <line x1="206" y1="260" x2="206" y2="295" stroke="#e2e8f0" strokeWidth="2" strokeLinecap="round" />

        {/* Neck */}
        <rect x="190" y="215" width="20" height="28" fill="url(#studentSkin)" rx="4" />

        {/* Head */}
        <ellipse cx="200" cy="185" rx="27" ry="30" fill="url(#studentSkin)" />

        {/* Hair Modern Tech Forward Cut */}
        <path
          d="M 172 178 C 170 145, 230 145, 228 178 C 220 160, 185 160, 172 178 Z"
          fill="#1e293b"
        />
        <path d="M 180 160 Q 195 150 215 162" fill="none" stroke="#334155" strokeWidth="3" />

        {/* Eyes & Friendly expression */}
        <circle cx="190" cy="182" r="2.5" fill="#1e293b" />
        <circle cx="210" cy="182" r="2.5" fill="#1e293b" />
        <path d="M 193 198 Q 200 205 207 198" fill="none" stroke="#e07a5f" strokeWidth="2" strokeLinecap="round" />

        {/* Over-ear tech headphones */}
        <path d="M 168 185 C 168 150, 232 150, 232 185" fill="none" stroke="#38bdf8" strokeWidth="4" />
        <rect x="164" y="176" width="10" height="20" rx="4" fill="#0284c7" />
        <rect x="226" y="176" width="10" height="20" rx="4" fill="#0284c7" />

        {/* Student Arms Typing on Modern Laptop */}
        <path d="M 145 285 Q 170 320 185 330" fill="none" stroke="url(#studentHoodie)" strokeWidth="16" strokeLinecap="round" />
        <path d="M 255 285 Q 230 320 215 330" fill="none" stroke="url(#studentHoodie)" strokeWidth="16" strokeLinecap="round" />

        {/* Hands */}
        <circle cx="178" cy="330" r="7" fill="url(#studentSkin)" />
        <circle cx="222" cy="330" r="7" fill="url(#studentSkin)" />

        {/* Glowing Sleek Laptop */}
        {/* Laptop Screen (Back view facing student) */}
        <polygon points="160,345 240,345 235,305 165,305" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
        {/* Glowing Logo on Laptop Lid */}
        <circle cx="200" cy="325" r="5" fill="#38bdf8" />
        {/* Laptop Base */}
        <polygon points="150,355 250,355 240,345 160,345" fill="#1e293b" stroke="#64748b" strokeWidth="1" />
      </svg>
    </div>
  );
}
