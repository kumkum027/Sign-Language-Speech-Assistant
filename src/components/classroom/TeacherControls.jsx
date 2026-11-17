"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Play,
  Square,
  Pause,
  Mic,
  MicOff,
  Globe,
  AlertTriangle,
  Loader2,
  Sparkles,
  Video,
  VideoOff,
  Hand,
  CheckCircle2,
  ArrowRight,
  BarChart3,
} from "lucide-react";

export default function TeacherControls({
  lectureStatus = "SCHEDULED",
  isListening = false,
  isHighContrast = false,
  language = "en-IN",
  setLanguage,
  onStartLecture,
  onPauseResumeRecognition,
  onEndLecture,
  speechError = null,
  isActionLoading = false,
  isCameraActive = false,
  onToggleCamera = null,
  onOpenPollModal = null,
  micLevel = 0,
  isSpeaking = false,
}) {
  const [showEndModal, setShowEndModal] = useState(false);

  return (
    <>
      <div
        className={`p-4 rounded-2xl border transition-colors ${
          isHighContrast
            ? "bg-[#0B0F0E] border-white/20 text-white"
            : "bg-white border-auralis-border text-auralis-text shadow-tactile"
        }`}
      >
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          {/* Left: Primary Lecture Workflow Buttons */}
          <div className="flex items-center gap-3 flex-wrap">
            {lectureStatus !== "LIVE" && lectureStatus !== "PAUSED" ? (
              <div className="flex items-center gap-2.5 flex-wrap">
                <button
                  onClick={onStartLecture}
                  disabled={isActionLoading}
                  className="flex items-center gap-2.5 px-6 py-3 rounded-xl bg-auralis-accent hover:bg-auralis-accent-hover text-white font-heading font-bold text-sm shadow-tactile hover:shadow transition-all disabled:opacity-50"
                >
                  {isActionLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Play className="w-4 h-4 fill-white" />
                  )}
                  <span>Start Live Lecture</span>
                </button>

                <button
                  type="button"
                  onClick={onPauseResumeRecognition}
                  disabled={isActionLoading}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl font-heading font-bold text-xs border transition-all ${
                    isListening
                      ? "bg-emerald-600 text-white shadow-tactile"
                      : "bg-auralis-bg hover:bg-auralis-surface text-auralis-text border-auralis-border"
                  }`}
                  title={isListening ? "Microphone active - analyzing speech" : "Enable microphone to analyze speech"}
                >
                  <Mic className="w-4 h-4 text-auralis-accent" />
                  <span>{isListening ? "Mic Analysis Active" : "Enable Microphone Analysis"}</span>
                </button>

                {lectureStatus === "COMPLETED" && (
                  <div className="flex items-center gap-2">
                    <Link
                      href="/lectures"
                      className="flex items-center gap-2 px-4 py-3 rounded-xl font-heading font-bold text-xs bg-auralis-accent text-white hover:bg-auralis-accent-hover transition-colors shadow-tactile"
                    >
                      <Sparkles className="w-4 h-4 text-white" />
                      <span>View in Lecture History</span>
                    </Link>
                    <Link
                      href="/teacher/dashboard"
                      className="flex items-center gap-2 px-4 py-3 rounded-xl font-heading font-bold text-xs bg-auralis-dark text-white hover:bg-black transition-colors shadow-tactile"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Return to Dashboard</span>
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <>
                {/* Pause / Resume Speech Recognition */}
                <button
                  onClick={onPauseResumeRecognition}
                  disabled={isActionLoading}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-heading font-bold text-xs transition-all ${
                    isListening
                      ? isHighContrast
                        ? "bg-amber-400 text-black hover:bg-amber-300"
                        : "bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100"
                      : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-tactile"
                  }`}
                >
                  {isListening ? (
                    <>
                      <Pause className="w-4 h-4" />
                      <span>Pause Speech Recognition</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-4 h-4" />
                      <span>Resume Speech Recognition</span>
                    </>
                  )}
                </button>

                {/* Launch Live Poll */}
                {onOpenPollModal && (
                  <button
                    type="button"
                    onClick={onOpenPollModal}
                    className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl font-heading font-bold text-xs transition-all border ${
                      isHighContrast
                        ? "bg-white/10 hover:bg-white/20 text-white border-white/20"
                        : "bg-auralis-highlight hover:bg-auralis-surface text-auralis-accent border-auralis-secondary shadow-tactile"
                    }`}
                    title="Launch an interactive live poll for students"
                  >
                    <BarChart3 className="w-4 h-4 text-auralis-accent" />
                    <span>Live Poll</span>
                  </button>
                )}

                {/* Stop / Conclude Lecture */}
                <button
                  onClick={() => setShowEndModal(true)}
                  disabled={isActionLoading}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-heading font-bold text-xs bg-red-600 hover:bg-red-700 text-white shadow-tactile transition-all"
                >
                  <Square className="w-3.5 h-3.5 fill-white" />
                  <span>Conclude Lecture</span>
                </button>
              </>
            )}
          </div>

          {/* Right: Camera Toggle, Language Selector & Mic Status Indicator */}
          <div className="flex items-center gap-3 flex-wrap">
            {onToggleCamera && (
              <button
                type="button"
                onClick={onToggleCamera}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all border ${
                  isCameraActive
                    ? isHighContrast
                      ? "bg-[#FFE27A] text-black border-white font-bold"
                      : "bg-auralis-highlight text-auralis-accent border-auralis-secondary font-bold"
                    : isHighContrast
                    ? "bg-white/10 hover:bg-white/20 text-white border-white/20"
                    : "bg-auralis-bg hover:bg-auralis-surface text-auralis-text border-auralis-border"
                }`}
                title="Toggle WebCam Gesture Recognition"
              >
                {isCameraActive ? (
                  <>
                    <Video className="w-3.5 h-3.5 text-auralis-accent" />
                    <span>Camera Active (ISL)</span>
                  </>
                ) : (
                  <>
                    <VideoOff className="w-3.5 h-3.5 text-auralis-muted" />
                    <span>Enable Gesture Camera</span>
                  </>
                )}
              </button>
            )}

            <div className="flex items-center gap-2 text-xs">
              <Globe className="w-3.5 h-3.5 text-auralis-muted" />
              <select
                value={language}
                onChange={(e) => setLanguage && setLanguage(e.target.value)}
                className={`py-2 px-3 rounded-xl text-xs font-semibold outline-none transition-colors border cursor-pointer ${
                  isHighContrast
                    ? "bg-[#142B29] border-white/20 text-white"
                    : "bg-auralis-bg border-auralis-border text-auralis-text"
                }`}
                title="Select Speech Recognition Accent / Language (e.g. English US or English India)"
              >
                <option value="en-US">English (US / Global)</option>
                <option value="en-IN">English (India)</option>
                <option value="en-GB">English (UK)</option>
                <option value="hi-IN">Hindi (हिंदी)</option>
              </select>
            </div>

            <button
              type="button"
              onClick={onPauseResumeRecognition}
              title={isListening ? "Microphone active (click to pause)" : "Microphone muted (click to activate speech recognition)"}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-semibold border transition-all cursor-pointer ${
                isListening
                  ? isHighContrast
                    ? "bg-[#FFE27A] text-black border-white hover:bg-white"
                    : "bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100 ring-2 ring-emerald-400/30"
                  : isHighContrast
                  ? "bg-white/10 text-white/70 border-white/20 hover:bg-white/20"
                  : "bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100 ring-2 ring-amber-400/20"
              }`}
            >
              {isListening ? (
                <div className="flex items-center gap-1.5">
                  <Mic className={`w-3.5 h-3.5 text-emerald-600 ${isSpeaking ? "animate-bounce scale-110" : "animate-pulse"}`} />
                  <span>MIC ON</span>
                  {/* Real-time mini audio level meter */}
                  <div className="flex items-end gap-0.5 h-3 w-4 ml-0.5" title={`Audio input level: ${micLevel}%`}>
                    <span style={{ height: `${Math.max(25, Math.min(100, micLevel * 1.4))}%` }} className="w-1 bg-emerald-500 rounded-full transition-all duration-75" />
                    <span style={{ height: `${Math.max(20, Math.min(100, micLevel * 1.8))}%` }} className="w-1 bg-emerald-500 rounded-full transition-all duration-75" />
                    <span style={{ height: `${Math.max(30, Math.min(100, micLevel * 1.2))}%` }} className="w-1 bg-emerald-500 rounded-full transition-all duration-75" />
                  </div>
                </div>
              ) : (
                <>
                  <MicOff className="w-3.5 h-3.5 text-amber-600" />
                  <span>MIC MUTED</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Prominent Banner when Lecture is LIVE but Mic is Muted */}
        {lectureStatus === "LIVE" && !isListening && (
          <div className="mt-3.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-pulse">
            <div className="flex items-center gap-2 font-semibold">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
              <span>Microphone is currently MUTED. Spoken words will not appear in the caption block until speech recognition is resumed.</span>
            </div>
            <button
              type="button"
              onClick={onPauseResumeRecognition}
              className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shrink-0 shadow-sm transition-all"
            >
              Resume Speech Recognition
            </button>
          </div>
        )}

        {/* Speech Error Banner if microphone was denied or network failed */}
        {speechError && (
          <div className="mt-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-start gap-3 text-xs animate-in fade-in">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="font-bold">Microphone or Speech Engine Notice:</div>
              <div className="mt-0.5">{speechError}</div>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal to Conclude Lecture */}
      {showEndModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-float border border-auralis-border p-6 space-y-5">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
              <Square className="w-6 h-6 fill-red-600" />
            </div>

            <div>
              <h3 className="font-heading font-extrabold text-xl text-auralis-text">
                Conclude Lecture Session?
              </h3>
              <p className="text-xs text-auralis-muted mt-1 leading-relaxed">
                Ending the lecture will finalize all real-time captions, persist the transcript history, and notify all enrolled students.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-auralis-border">
              <button
                type="button"
                onClick={() => setShowEndModal(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-auralis-muted hover:text-auralis-text transition-colors"
              >
                Continue Lecture
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowEndModal(false);
                  onEndLecture();
                }}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-tactile transition-all"
              >
                Conclude & Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
