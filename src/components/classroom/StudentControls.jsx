"use client";

import React from "react";
import {
  Type,
  Contrast,
  Globe,
  Hand,
  Volume2,
  Sparkles,
} from "lucide-react";

export default function StudentControls({
  fontSize = "large",
  setFontSize,
  isHighContrast = false,
  toggleHighContrast,
  isCameraActive = false,
  onToggleCamera,
  onOpenDoubtModal,
  isDoubtPending = false,
  activePoll = null,
  onOpenPollModal = null,
}) {
  return (
    <div
      className={`p-4 rounded-2xl border transition-colors ${
        isHighContrast
          ? "bg-[#0B0F0E] border-white/20 text-white"
          : "bg-white border-auralis-border text-auralis-text shadow-tactile"
      }`}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Left: Accessibility explanation */}
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              isHighContrast
                ? "bg-[#FFE27A] text-black"
                : "bg-auralis-highlight text-auralis-accent"
            }`}
          >
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-heading font-bold text-xs uppercase tracking-wider">
              Student Accessibility Preferences
            </h4>
            <p className="text-[11px] text-auralis-muted">
              Personalize font size, OLED contrast, and interactive sign participation.
            </p>
          </div>
        </div>

        {/* Right: Quick accessibility buttons */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Active Poll Prompt if live */}
          {activePoll && !activePoll.isEnded && onOpenPollModal && (
            <button
              onClick={onOpenPollModal}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-auralis-accent text-white shadow-tactile animate-pulse"
            >
              <span>📊 Active Class Poll</span>
            </button>
          )}

          {/* Raise Hand / Doubt Button */}
          {onOpenDoubtModal && (
            <button
              onClick={onOpenDoubtModal}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-tactile ${
                isDoubtPending
                  ? "bg-amber-500 text-white animate-pulse"
                  : isHighContrast
                  ? "bg-white/10 hover:bg-white/20 text-white border border-white/20"
                  : "bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300"
              }`}
            >
              <Hand className="w-3.5 h-3.5 text-amber-500" />
              <span>{isDoubtPending ? "✋ Hand Raised" : "Raise Hand / Ask Doubt"}</span>
            </button>
          )}

          {/* Sign Language participation toggle */}
          {onToggleCamera && (
            <button
              onClick={onToggleCamera}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                isCameraActive
                  ? isHighContrast
                    ? "bg-[#FFE27A] text-black font-bold"
                    : "bg-auralis-highlight text-auralis-accent border border-auralis-secondary"
                  : isHighContrast
                  ? "bg-white/10 hover:bg-white/20 text-white"
                  : "bg-auralis-bg hover:bg-auralis-surface text-auralis-text border border-auralis-border"
              }`}
            >
              <Hand className="w-3.5 h-3.5" />
              <span>{isCameraActive ? "Sign Input Active" : "Sign Gesture Input"}</span>
            </button>
          )}

          {/* High Contrast */}
          <button
            onClick={toggleHighContrast}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              isHighContrast
                ? "bg-[#FFE27A] text-black font-bold"
                : "bg-auralis-bg hover:bg-auralis-surface text-auralis-text border border-auralis-border"
            }`}
          >
            <Contrast className="w-3.5 h-3.5" />
            <span>{isHighContrast ? "OLED Mode Active" : "OLED Contrast"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
