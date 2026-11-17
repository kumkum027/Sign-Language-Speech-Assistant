"use client";

import React, { useState } from "react";
import {
  Hand,
  HelpCircle,
  X,
  Send,
  Sparkles,
  CheckCircle2,
  Video,
} from "lucide-react";

export default function StudentDoubtModal({
  isOpen,
  onClose,
  onSubmitDoubt,
  isCameraActive = false,
  isHighContrast = false,
}) {
  const [questionText, setQuestionText] = useState("");
  const [selectedGesture, setSelectedGesture] = useState("QUESTION");

  if (!isOpen) return null;

  const quickGestures = [
    { id: "QUESTION", label: "❓ Ask a Question", desc: "Need clarification on topic" },
    { id: "REPEAT", label: "🔁 Please Repeat", desc: "Didn't catch the last sentence" },
    { id: "SLOW_DOWN", label: "⏳ Speak Slower", desc: "Pace is a bit too fast" },
    { id: "HAND_RAISE", label: "✋ Raise Hand", desc: "Want to speak or contribute" },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmitDoubt({
      gesture: selectedGesture,
      question: questionText.trim() || quickGestures.find((g) => g.id === selectedGesture)?.label,
    });
    setQuestionText("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={`w-full max-w-md rounded-3xl p-6 border shadow-2xl transition-all ${
          isHighContrast
            ? "bg-[#0B0F0E] border-white/30 text-white"
            : "bg-white border-auralis-border text-auralis-text"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-inherit">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center">
              <Hand className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-heading font-extrabold text-base">
                Raise Hand / Ask Doubt
              </h3>
              <p className="text-[11px] text-auralis-muted">
                Alert the instructor instantly with sign gesture or question
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 text-inherit"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Gesture Selection */}
        <div className="mt-4">
          <label className="text-[11px] font-mono text-auralis-muted uppercase tracking-wider block mb-2">
            Select Doubt Intent / Gesture
          </label>
          <div className="grid grid-cols-2 gap-2">
            {quickGestures.map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => setSelectedGesture(g.id)}
                className={`p-2.5 rounded-xl text-left border transition-all ${
                  selectedGesture === g.id
                    ? isHighContrast
                      ? "bg-[#FFE27A] text-black border-white"
                      : "bg-amber-50 text-amber-900 border-amber-300 ring-2 ring-amber-400/30"
                    : isHighContrast
                    ? "bg-white/10 hover:bg-white/20 border-white/20 text-white"
                    : "bg-auralis-bg hover:bg-auralis-surface text-auralis-text border-auralis-border"
                }`}
              >
                <div className="text-xs font-bold">{g.label}</div>
                <div className="text-[10px] opacity-75 mt-0.5">{g.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Optional Question Text */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="text-xs font-bold block mb-1">
              Add Specific Question (Optional)
            </label>
            <textarea
              rows={3}
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              placeholder="e.g. Could you explain the difference between TCP and UDP again?"
              className={`w-full px-3.5 py-2.5 rounded-xl text-xs border outline-none resize-none ${
                isHighContrast
                  ? "bg-white/10 border-white/20 text-white placeholder:text-white/40"
                  : "bg-auralis-bg border-auralis-border text-auralis-text placeholder:text-auralis-muted"
              }`}
            />
          </div>

          {isCameraActive && (
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-[11px] flex items-center gap-2">
              <Video className="w-3.5 h-3.5 shrink-0" />
              <span>Camera is active: You can also hold up your hand to the camera to trigger live sign detection!</span>
            </div>
          )}

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-inherit text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-tactile transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send Doubt to Instructor</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
