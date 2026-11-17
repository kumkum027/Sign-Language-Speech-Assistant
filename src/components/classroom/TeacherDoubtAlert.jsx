"use client";

import React from "react";
import { Hand, Check, X, MessageSquare, AlertCircle } from "lucide-react";

export default function TeacherDoubtAlert({
  doubts = [],
  onAcknowledge,
  onDismiss,
  isHighContrast = false,
}) {
  if (!doubts || doubts.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-50 max-w-sm w-full space-y-2 pointer-events-auto animate-in slide-in-from-top-4 duration-300">
      {doubts.map((doubt, idx) => (
        <div
          key={`${doubt.studentId}-${idx}`}
          className={`p-4 rounded-2xl border shadow-xl transition-all ${
            isHighContrast
              ? "bg-[#0B0F0E] border-[#FFE27A] text-white"
              : "bg-white border-amber-300 text-auralis-text ring-2 ring-amber-400/20 shadow-tactile"
          }`}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 animate-bounce">
                <Hand className="w-4 h-4" />
              </span>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-amber-600 dark:text-amber-400 font-bold">
                  Student Raised Doubt
                </span>
                <h4 className="font-heading font-extrabold text-xs">
                  {doubt.studentName || "Student"}
                </h4>
              </div>
            </div>
            <button
              onClick={() => onDismiss(doubt)}
              className="p-1 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 text-auralis-muted"
              title="Dismiss Alert"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Doubt Content */}
          <div className="mt-2.5 p-2 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-amber-900 dark:text-amber-200">
              <MessageSquare className="w-3.5 h-3.5 text-amber-600" />
              <span>Gesture: {doubt.gesture}</span>
            </div>
            {doubt.question && (
              <p className="mt-1 text-auralis-text dark:text-white/90 italic">
                &ldquo;{doubt.question}&rdquo;
              </p>
            )}
          </div>

          {/* Action Button */}
          <div className="mt-3 flex items-center justify-end gap-2">
            <button
              onClick={() => onDismiss(doubt)}
              className="px-3 py-1.5 rounded-xl border border-inherit text-[11px] font-semibold hover:bg-black/5"
            >
              Dismiss
            </button>
            <button
              onClick={() => onAcknowledge(doubt)}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold shadow-tactile flex items-center gap-1 transition-all"
            >
              <Check className="w-3 h-3" />
              <span>Acknowledge Doubt</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
