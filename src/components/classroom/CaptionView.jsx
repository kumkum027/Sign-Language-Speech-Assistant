"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Mic,
  Hand,
  Volume2,
  Sparkles,
  ArrowDown,
  Layers,
  CheckCircle2,
} from "lucide-react";

export default function CaptionView({
  transcripts = [],
  interimText = "",
  activeSign = null,
  isListening = false,
  isHighContrast = false,
  fontSize = "large",
  lectureStatus = "SCHEDULED",
  isTeacher = false,
  onStartSpeech = null,
  micLevel = 0,
  isSpeaking = false,
}) {
  const scrollContainerRef = useRef(null);
  const [userHasScrolledUp, setUserHasScrolledUp] = useState(false);

  // Determine typography size class based on user's preference
  const getTypographyClass = () => {
    switch (fontSize) {
      case "standard":
        return "text-lg sm:text-xl leading-relaxed";
      case "xlarge":
        return "text-2xl sm:text-3xl lg:text-4xl leading-loose font-medium";
      case "huge":
        return "text-3xl sm:text-4xl lg:text-5xl leading-loose font-bold";
      case "large":
      default:
        return "text-xl sm:text-2xl leading-relaxed";
    }
  };

  const getInterimTypographyClass = () => {
    switch (fontSize) {
      case "standard":
        return "text-lg sm:text-xl leading-relaxed";
      case "xlarge":
        return "text-2xl sm:text-3xl leading-loose";
      case "huge":
        return "text-3xl sm:text-4xl leading-loose";
      case "large":
      default:
        return "text-xl sm:text-2xl leading-relaxed";
    }
  };

  // Scroll to bottom smoothly unless user scrolled up intentionally
  useEffect(() => {
    if (!userHasScrolledUp && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop =
        scrollContainerRef.current.scrollHeight;
    }
  }, [transcripts, interimText, activeSign, userHasScrolledUp]);

  // Handle scroll events to detect if user is browsing past captions
  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 120;
    setUserHasScrolledUp(!isNearBottom);
  };

  const scrollToBottom = () => {
    setUserHasScrolledUp(false);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  const formatTimestamp = (isoString) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    } catch {
      return "";
    }
  };

  return (
    <div
      className={`relative flex-1 flex flex-col h-full rounded-2xl border transition-colors overflow-hidden ${
        isHighContrast
          ? "bg-[#0B0F0E] border-white/20 text-white"
          : "bg-white border-auralis-border text-auralis-text shadow-tactile"
      }`}
    >
      {/* Gesture Callout Toast when sign language detected */}
      {activeSign && (
        <div
          className={`absolute top-4 left-1/2 -translate-x-1/2 z-30 px-5 py-2.5 rounded-2xl shadow-float flex items-center gap-3 border animate-in slide-in-from-top duration-300 ${
            isHighContrast
              ? "bg-[#FFE27A] text-black border-white"
              : "bg-auralis-dark text-white border-auralis-accent"
          }`}
        >
          <div className="w-8 h-8 rounded-xl bg-auralis-accent text-white flex items-center justify-center font-bold">
            <Hand className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider font-bold opacity-80">
              Sign Language Recognized ({Math.round((activeSign.confidence || 0.95) * 100)}%)
            </div>
            <div className="font-heading font-extrabold text-base tracking-wide">
              {activeSign.gesture}
            </div>
          </div>
        </div>
      )}

      {/* Main Scrollable Viewport */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 p-6 sm:p-10 lg:p-12 overflow-y-auto space-y-8"
        aria-live="polite"
        role="region"
        aria-label="Real-time lecture transcript"
      >
        {transcripts.length === 0 && !interimText ? (
          <div className="h-full min-h-[320px] flex flex-col items-center justify-center text-center p-6 space-y-4">
            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                isHighContrast
                  ? "bg-white/10 text-white border border-white/20"
                  : "bg-auralis-highlight text-auralis-accent border border-auralis-secondary/40"
              }`}
            >
              <Sparkles className="w-8 h-8" />
            </div>

            <div className="max-w-md space-y-2">
              <h2
                className={`font-heading font-bold text-lg sm:text-xl ${
                  isHighContrast ? "text-white" : "text-auralis-text"
                }`}
              >
                {lectureStatus === "LIVE"
                  ? "Awaiting Speech or Sign Gestures"
                  : "Lecture Ready to Begin"}
              </h2>
              <p
                className={`text-xs sm:text-sm leading-relaxed ${
                  isHighContrast ? "text-white/70" : "text-auralis-muted"
                }`}
              >
                {lectureStatus === "LIVE"
                  ? "Captions will populate here in real-time as the instructor speaks or as sign language is detected."
                  : "When the instructor initiates the lecture, verified speech captions and sign translations will stream continuously here."}
              </p>
            </div>

            {isListening ? (
              <div
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-semibold ${
                  isHighContrast
                    ? "bg-[#FFE27A] text-black"
                    : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span>Microphone active • Analyzing voice input in real time</span>
              </div>
            ) : isTeacher && onStartSpeech ? (
              <button
                type="button"
                onClick={onStartSpeech}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-auralis-accent hover:bg-auralis-accent-hover text-white text-xs font-heading font-bold shadow-tactile transition-all"
              >
                <Mic className="w-4 h-4" />
                <span>Activate Microphone &amp; Speech Analyzer</span>
              </button>
            ) : null}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Teacher Mic Status & Real-time Level Feedback */}
            {isTeacher && !isListening && (
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-pulse">
                <div className="flex items-center gap-2 font-semibold">
                  <Mic className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Microphone is paused. Spoken words will not appear in the caption block until you resume.</span>
                </div>
                {onStartSpeech && (
                  <button
                    type="button"
                    onClick={onStartSpeech}
                    className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-sm transition-all shrink-0 cursor-pointer"
                  >
                    Resume Microphone
                  </button>
                )}
              </div>
            )}

            {isTeacher && isListening && (
              <div className="px-3.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-[11px] font-mono flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span>Speech Analyzer Active</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-auralis-muted">Mic Volume:</span>
                  <div className="w-16 h-2 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${Math.min(100, micLevel * 2)}%` }}
                      className="h-full bg-emerald-500 transition-all duration-75"
                    />
                  </div>
                  {isSpeaking && (
                    <span className="text-[10px] text-emerald-600 font-bold uppercase ml-1 animate-pulse">
                      Voice Detected
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Finalized Transcripts formatted in spacious editorial layout */}
            {transcripts.map((t, idx) => {
              const isGesture = t.source === "SIGN_LANGUAGE";
              return (
                <article
                  key={t.id || `tr-${idx}`}
                  className={`group relative pl-4 sm:pl-6 border-l-2 transition-all ${
                    isGesture
                      ? isHighContrast
                        ? "border-[#FFE27A]"
                        : "border-auralis-accent"
                      : isHighContrast
                      ? "border-white/30 hover:border-white"
                      : "border-auralis-border hover:border-auralis-accent/60"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-1.5">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono font-bold uppercase tracking-wider ${
                        isGesture
                          ? isHighContrast
                            ? "bg-[#FFE27A] text-black"
                            : "bg-auralis-highlight text-auralis-accent border border-auralis-secondary/50"
                          : isHighContrast
                          ? "bg-white/10 text-white"
                          : "bg-auralis-bg text-auralis-muted border border-auralis-border"
                      }`}
                    >
                      {isGesture ? (
                        <>
                          <Hand className="w-3 h-3" />
                          <span>SIGN GESTURE</span>
                        </>
                      ) : (
                        <>
                          <Mic className="w-3 h-3" />
                          <span>SPEECH</span>
                        </>
                      )}
                    </span>

                    {t.speaker?.name && (
                      <span
                        className={`text-xs font-bold ${
                          isHighContrast ? "text-white" : "text-auralis-text"
                        }`}
                      >
                        {t.speaker.name}
                      </span>
                    )}

                    {t.timestamp && (
                      <span
                        className={`text-[11px] font-mono ${
                          isHighContrast ? "text-white/60" : "text-auralis-muted"
                        }`}
                      >
                        {formatTimestamp(t.timestamp)}
                      </span>
                    )}

                    {t.confidence && (
                      <span
                        className={`text-[10px] font-mono opacity-0 group-hover:opacity-100 transition-opacity ${
                          isHighContrast ? "text-white/40" : "text-auralis-muted"
                        }`}
                      >
                        {Math.round(t.confidence * 100)}% accuracy
                      </span>
                    )}
                  </div>

                  <p
                    className={`font-sans tracking-tight font-medium ${getTypographyClass()} ${
                      isHighContrast
                        ? isGesture
                          ? "text-[#FFE27A]"
                          : "text-white"
                        : "text-auralis-text"
                    }`}
                  >
                    {t.text}
                  </p>
                </article>
              );
            })}

            {/* Live Interim Streaming Words */}
            {interimText && (
              <div
                className={`pl-4 sm:pl-6 border-l-2 transition-all animate-in fade-in duration-150 ${
                  isHighContrast ? "border-[#FFE27A]" : "border-auralis-accent"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${
                      isHighContrast
                        ? "bg-[#FFE27A] text-black"
                        : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                    <span>ANALYZING &amp; WRITING</span>
                  </span>
                </div>

                <p
                  className={`font-sans italic ${getInterimTypographyClass()} ${
                    isHighContrast ? "text-[#FFE27A]/90" : "text-auralis-accent/90"
                  }`}
                >
                  {interimText}
                  <span className="inline-block w-2 h-5 ml-1 bg-current animate-pulse align-middle" />
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Jump to Latest Floating Button */}
      {userHasScrolledUp && (
        <button
          onClick={scrollToBottom}
          className={`absolute bottom-5 right-6 z-20 flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold shadow-float transition-all animate-in slide-in-from-bottom-2 ${
            isHighContrast
              ? "bg-[#FFE27A] text-black border border-white hover:bg-white"
              : "bg-auralis-accent text-white hover:bg-auralis-accent-hover"
          }`}
        >
          <ArrowDown className="w-3.5 h-3.5" />
          <span>Resume Live Stream</span>
        </button>
      )}

      {/* Viewport Footer Banner */}
      <div
        className={`px-6 py-2.5 border-t text-xs flex items-center justify-between ${
          isHighContrast
            ? "bg-[#0B0F0E] border-white/20 text-white/60"
            : "bg-auralis-bg/60 border-auralis-border text-auralis-muted"
        }`}
      >
        <div className="flex items-center gap-2">
          <Layers className="w-3.5 h-3.5" />
          <span>
            {transcripts.length} {transcripts.length === 1 ? "caption block" : "caption blocks"}{" "}
            recorded
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-auralis-success" />
          <span>End-to-End Encrypted Session</span>
        </div>
      </div>
    </div>
  );
}
