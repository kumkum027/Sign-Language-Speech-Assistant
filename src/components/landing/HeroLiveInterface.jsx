"use client";

import { useState, useEffect } from "react";
import { Mic, Users, Hand, Volume2 } from "lucide-react";

export function HeroLiveInterface() {
  const [activeCaptionIndex, setActiveCaptionIndex] = useState(0);
  const [interimText, setInterimText] = useState("");
  const [micLevel, setMicLevel] = useState(65);
  const [activeGesture, setActiveGesture] = useState("QUESTION / DOUBT");
  const [gestureConfidence, setGestureConfidence] = useState(94.2);

  // Simulated live lecture transcription feed
  const lectureCaptions = [
    {
      speaker: "Prof. Sharma",
      time: "10:14:02",
      text: "When two coherent sound waves meet with equal phase, constructive interference maximizes total amplitude.",
      type: "speech",
    },
    {
      speaker: "Aarav (Student)",
      time: "10:14:18",
      text: "QUESTION / DOUBT – Raised hand gesture detected via camera.",
      type: "sign",
    },
    {
      speaker: "Prof. Sharma",
      time: "10:14:24",
      text: "Yes Aarav, excellent question. Notice how the node points remain at zero displacement regardless of time.",
      type: "speech",
    },
  ];

  // Typing effect for live interim caption stream
  useEffect(() => {
    const interimPhrases = [
      "...the nodal planes correspond to sin(kx) = 0...",
      "...which produces destructive wave cancellation...",
      "...as shown in equation 4.12 on the blackboard...",
    ];

    let currentPhrase = interimPhrases[activeCaptionIndex % interimPhrases.length];
    let charIndex = 0;
    setInterimText("");

    const typingInterval = setInterval(() => {
      if (charIndex <= currentPhrase.length) {
        setInterimText(currentPhrase.slice(0, charIndex));
        charIndex++;
      } else {
        clearInterval(typingInterval);
        setTimeout(() => {
          setActiveCaptionIndex((prev) => (prev + 1) % lectureCaptions.length);
        }, 2200);
      }
    }, 45);

    // Dynamic mic wave animation
    const micInterval = setInterval(() => {
      setMicLevel(Math.floor(40 + Math.random() * 50));
    }, 180);

    return () => {
      clearInterval(typingInterval);
      clearInterval(micInterval);
    };
  }, [activeCaptionIndex]);

  return (
    <div className="relative rounded-2xl border border-auralis-border bg-auralis-surface shadow-float overflow-hidden flex flex-col font-sans transition-all">
      {/* Product Top Header Bar */}
      <div className="bg-auralis-dark text-white px-5 py-3.5 flex items-center justify-between border-b border-auralis-border/20">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-auralis-success opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-auralis-success"></span>
            </span>
            <span className="text-xs font-bold tracking-wider text-auralis-secondary uppercase">
              LIVE BROADCAST
            </span>
          </div>
          <span className="text-white/30 text-xs">|</span>
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-white tracking-tight">PHY-301: Wave Mechanics</span>
            <span className="text-[10px] text-white/60">Prof. Ananya Sharma • Hall 4B</span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="hidden sm:flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-full text-white/80">
            <Users className="w-3.5 h-3.5 text-auralis-secondary" />
            <span className="font-semibold text-white">42</span> connected
          </div>
          <div className="flex items-center gap-1.5 bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 px-2.5 py-1 rounded-full text-[11px] font-mono">
            <span>00:48:19</span>
          </div>
        </div>
      </div>

      {/* Main Workspace Grid (Captions + ISL Computer Vision Sidecar) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[380px]">
        {/* Large Caption Feed Area (8 Cols) */}
        <div className="lg:col-span-8 p-5 sm:p-6 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-auralis-border bg-auralis-surface">
          {/* Header Sub-bar */}
          <div className="flex items-center justify-between pb-3 border-b border-auralis-border/60 mb-4">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-auralis-accent" />
              <span className="text-xs font-semibold uppercase tracking-wider text-auralis-muted">
                Synchronized Classroom Captions
              </span>
            </div>
            <div className="text-[11px] font-mono text-auralis-muted bg-auralis-bg px-2 py-0.5 rounded border border-auralis-border">
              Latency: 142ms
            </div>
          </div>

          {/* Historical Finalized Captions */}
          <div className="space-y-4 flex-1">
            {lectureCaptions.slice(0, 2).map((item, idx) => (
              <div
                key={idx}
                className={`p-3.5 rounded-xl border transition-all ${
                  item.type === "sign"
                    ? "bg-auralis-highlight/40 border-auralis-secondary/60"
                    : "bg-auralis-bg/60 border-auralis-border/80"
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                        item.type === "sign"
                          ? "bg-auralis-accent text-white"
                          : "bg-auralis-dark text-white"
                      }`}
                    >
                      {item.type === "sign" ? "ISL SIGN" : "SPEECH"}
                    </span>
                    <span className="font-semibold text-auralis-text">{item.speaker}</span>
                  </div>
                  <span className="text-[11px] font-mono text-auralis-muted">{item.time}</span>
                </div>
                <p className="text-sm sm:text-base text-auralis-text leading-relaxed font-normal">
                  {item.text}
                </p>
              </div>
            ))}

            {/* Active Interim Speech Stream (Live typing stream) */}
            <div className="p-4 rounded-xl bg-white border-2 border-auralis-accent/30 shadow-tactile relative">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="flex h-2 w-2 rounded-full bg-auralis-accent animate-pulse"></span>
                  <span className="font-semibold text-auralis-accent text-xs">Live Voice Input (Prof. Sharma)</span>
                </div>
                <span className="text-[10px] font-mono bg-auralis-highlight text-auralis-accent px-1.5 py-0.5 rounded">
                  STREAMING
                </span>
              </div>
              <p className="text-base sm:text-lg font-medium text-auralis-text leading-relaxed italic">
                {interimText}
                <span className="inline-block w-1.5 h-4 ml-1 bg-auralis-accent animate-pulse align-middle"></span>
              </p>
            </div>
          </div>

          {/* Teacher Audio Activity Meter */}
          <div className="mt-5 pt-3 border-t border-auralis-border/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-auralis-highlight flex items-center justify-center text-auralis-accent">
                <Mic className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-semibold text-auralis-text">Dynamic Speech Processor</div>
                <div className="text-[10px] text-auralis-muted">Continuous Web Speech Engine active</div>
              </div>
            </div>

            {/* Equalizer Bars */}
            <div className="flex items-end gap-1 h-6">
              {[40, 75, 55, 90, 60, 85, 45, 95, 70, 50].map((baseHeight, i) => {
                const height = Math.min(100, Math.max(15, (baseHeight * micLevel) / 70));
                return (
                  <div
                    key={i}
                    className="w-1 bg-auralis-accent rounded-full transition-all duration-150"
                    style={{ height: `${height}%` }}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* ISL Computer Vision Mini-Sidecar (4 Cols) */}
        <div className="lg:col-span-4 p-5 flex flex-col justify-between bg-auralis-bg/70">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <Hand className="w-4 h-4 text-auralis-accent" />
                <span className="text-xs font-bold uppercase tracking-wider text-auralis-text">
                  ISL Gesture Vision
                </span>
              </div>
              <span className="text-[10px] bg-auralis-highlight text-auralis-accent font-semibold px-2 py-0.5 rounded-full border border-auralis-secondary/60">
                MediaPipe 3D
              </span>
            </div>

            {/* Camera Preview with Simulated 21-Landmark Hand Skeleton */}
            <div className="relative rounded-xl overflow-hidden aspect-[4/3] bg-auralis-dark border border-auralis-border shadow-inner flex items-center justify-center">
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#176B6015_1px,transparent_1px),linear-gradient(to_bottom,#176B6015_1px,transparent_1px)] bg-[size:16px_16px]" />

              <svg className="w-full h-full p-4 relative z-10" viewBox="0 0 200 160">
                <polyline points="100,140 100,110 80,90 70,70 65,55" stroke="#2FE4BD" strokeWidth="2.5" fill="none" opacity="0.8" />
                <polyline points="100,110 92,80 88,55 86,40" stroke="#2FE4BD" strokeWidth="2.5" fill="none" opacity="0.8" />
                <polyline points="100,110 102,78 104,50 106,32" stroke="#2FE4BD" strokeWidth="2.5" fill="none" opacity="0.9" />
                <polyline points="100,110 115,82 122,60 126,45" stroke="#2FE4BD" strokeWidth="2.5" fill="none" opacity="0.8" />
                <polyline points="100,110 128,95 138,80 144,70" stroke="#2FE4BD" strokeWidth="2.5" fill="none" opacity="0.8" />

                <circle cx="100" cy="140" r="4.5" fill="#FFFFFF" stroke="#176B60" strokeWidth="2" />
                <circle cx="80" cy="90" r="3" fill="#D9EDDF" />
                <circle cx="70" cy="70" r="3" fill="#D9EDDF" />
                <circle cx="65" cy="55" r="4" fill="#FFFFFF" stroke="#2FE4BD" strokeWidth="2" />
                <circle cx="92" cy="80" r="3" fill="#D9EDDF" />
                <circle cx="88" cy="55" r="3" fill="#D9EDDF" />
                <circle cx="86" cy="40" r="4.5" fill="#2FE4BD" stroke="#FFFFFF" strokeWidth="2" />
                <circle cx="102" cy="78" r="3" fill="#D9EDDF" />
                <circle cx="104" cy="50" r="3" fill="#D9EDDF" />
                <circle cx="106" cy="32" r="4" fill="#FFFFFF" stroke="#2FE4BD" strokeWidth="2" />
                <circle cx="115" cy="82" r="3" fill="#D9EDDF" />
                <circle cx="122" cy="60" r="3" fill="#D9EDDF" />
                <circle cx="126" cy="45" r="3.5" fill="#D9EDDF" />
                <circle cx="128" cy="95" r="3" fill="#D9EDDF" />
                <circle cx="138" cy="80" r="3" fill="#D9EDDF" />
                <circle cx="144" cy="70" r="3.5" fill="#D9EDDF" />
              </svg>

              <div className="absolute bottom-2.5 left-2.5 bg-black/75 backdrop-blur px-2 py-0.5 rounded text-[10px] text-white flex items-center gap-1.5 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                21 Keypoints Tracked
              </div>
            </div>

            {/* Classification Card */}
            <div className="mt-3 p-3 rounded-xl bg-white border border-auralis-border">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-[11px] font-medium text-auralis-muted">Predicted ISL Gesture</span>
                <span className="text-[11px] font-mono font-bold text-auralis-accent">
                  {gestureConfidence}% CONF
                </span>
              </div>
              <div className="font-heading font-bold text-base text-auralis-text flex items-center gap-2">
                <span>{activeGesture}</span>
                <span className="text-xs font-normal text-auralis-muted">(Doubt Raised)</span>
              </div>

              <div className="mt-2 w-full h-1.5 bg-auralis-border rounded-full overflow-hidden">
                <div
                  className="h-full bg-auralis-accent rounded-full transition-all duration-300"
                  style={{ width: `${gestureConfidence}%` }}
                />
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-auralis-border/60 text-[11px] text-auralis-muted flex items-center justify-between">
            <span>Model: ISL-Core-v1.4</span>
            <span className="text-auralis-success font-medium">Verified Landmark Lock</span>
          </div>
        </div>
      </div>
    </div>
  );
}
