"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Users,
  Clock,
  Sparkles,
  Contrast,
  Type,
  Radio,
  PauseCircle,
  CheckCircle2,
} from "lucide-react";

export default function LiveHeader({
  classroom,
  teacherName,
  lectureStatus = "SCHEDULED",
  duration = 0,
  participantCount = 1,
  isHighContrast = false,
  toggleHighContrast,
  fontSize = "large",
  setFontSize,
  userRole = "STUDENT",
}) {
  const formatDuration = (totalSeconds) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    if (hrs > 0) {
      return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
    }
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const getStatusBadge = () => {
    switch (lectureStatus) {
      case "LIVE":
        return (
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider ${
            isHighContrast
              ? "bg-[#FFE27A] text-black border border-white"
              : "bg-red-50 text-red-600 border border-red-200"
          }`}>
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            <Radio className="w-3.5 h-3.5" />
            <span>LIVE STREAM</span>
          </span>
        );
      case "PAUSED":
        return (
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider ${
            isHighContrast
              ? "bg-[#FFE27A] text-black"
              : "bg-amber-50 text-amber-700 border border-amber-200"
          }`}>
            <PauseCircle className="w-3.5 h-3.5" />
            <span>PAUSED</span>
          </span>
        );
      case "COMPLETED":
        return (
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider ${
            isHighContrast
              ? "bg-white text-black"
              : "bg-gray-100 text-gray-700 border border-gray-300"
          }`}>
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>CONCLUDED</span>
          </span>
        );
      default:
        return (
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider ${
            isHighContrast
              ? "bg-[#176B60] text-white"
              : "bg-auralis-highlight text-auralis-accent border border-auralis-secondary/40"
          }`}>
            <Sparkles className="w-3.5 h-3.5" />
            <span>READY</span>
          </span>
        );
    }
  };

  const dashboardHref =
    userRole === "TEACHER" ? "/teacher/dashboard" : "/student/dashboard";

  return (
    <header
      className={`border-b transition-colors ${
        isHighContrast
          ? "bg-[#0B0F0E] border-white/20 text-white"
          : "bg-white border-auralis-border text-auralis-text shadow-sm"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Left: Back button + Classroom / Instructor title */}
          <div className="flex items-center gap-4">
            <Link
              href={dashboardHref}
              className={`p-2 rounded-xl transition-all ${
                isHighContrast
                  ? "bg-white/10 hover:bg-white/20 text-white"
                  : "bg-auralis-bg hover:bg-auralis-surface text-auralis-muted hover:text-auralis-text border border-auralis-border"
              }`}
              title="Return to Dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>

            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="font-heading font-extrabold text-lg sm:text-xl tracking-tight">
                  {classroom?.name || "Academic Classroom"}
                </h1>
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded ${
                    isHighContrast
                      ? "bg-white/15 text-white"
                      : "bg-auralis-bg text-auralis-muted border border-auralis-border"
                  }`}
                >
                  {classroom?.subject || "Accessibility Track"}
                </span>
                {getStatusBadge()}
              </div>

              <div className="flex items-center gap-3 mt-0.5 text-xs">
                <span className={isHighContrast ? "text-white/70" : "text-auralis-muted"}>
                  Instructor:{" "}
                  <strong className={isHighContrast ? "text-white" : "text-auralis-text"}>
                    {teacherName || classroom?.teacher?.name || "Lead Faculty"}
                  </strong>
                </span>
                <span className={isHighContrast ? "text-white/40" : "text-auralis-border"}>•</span>
                <span className={`font-mono ${isHighContrast ? "text-[#FFE27A]" : "text-auralis-accent"}`}>
                  Code: {classroom?.code || "AURA-LIVE"}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Metrics & Accessibility Quick Controls */}
          <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
            {/* Connected Counter */}
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-mono font-semibold ${
                isHighContrast
                  ? "bg-white/10 text-white border border-white/20"
                  : "bg-auralis-bg text-auralis-text border border-auralis-border"
              }`}
            >
              <Users className="w-3.5 h-3.5 text-auralis-accent" />
              <span>
                {participantCount} {participantCount === 1 ? "participant" : "participants"}
              </span>
            </div>

            {/* Duration Timer */}
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-mono font-semibold ${
                isHighContrast
                  ? "bg-white/10 text-white border border-white/20"
                  : "bg-auralis-bg text-auralis-text border border-auralis-border"
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-auralis-accent" />
              <span>{formatDuration(duration)}</span>
            </div>

            {/* Font Size Selector */}
            <div
              className={`flex items-center rounded-xl p-0.5 border ${
                isHighContrast
                  ? "bg-white/10 border-white/20 text-white"
                  : "bg-auralis-bg border-auralis-border text-auralis-muted"
              }`}
              title="Caption Font Size"
            >
              <button
                onClick={() => setFontSize("standard")}
                className={`px-2 py-1 text-xs font-bold rounded-lg transition-all ${
                  fontSize === "standard"
                    ? isHighContrast
                      ? "bg-white text-black"
                      : "bg-white text-auralis-text shadow-sm"
                    : "hover:text-auralis-text"
                }`}
              >
                A
              </button>
              <button
                onClick={() => setFontSize("large")}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                  fontSize === "large"
                    ? isHighContrast
                      ? "bg-white text-black"
                      : "bg-white text-auralis-text shadow-sm"
                    : "hover:text-auralis-text"
                }`}
              >
                A+
              </button>
              <button
                onClick={() => setFontSize("xlarge")}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                  fontSize === "xlarge"
                    ? isHighContrast
                      ? "bg-white text-black"
                      : "bg-white text-auralis-text shadow-sm"
                    : "hover:text-auralis-text"
                }`}
              >
                A++
              </button>
            </div>

            {/* High Contrast Mode Toggle */}
            <button
              onClick={toggleHighContrast}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                isHighContrast
                  ? "bg-[#FFE27A] text-black font-bold shadow-tactile"
                  : "bg-auralis-bg hover:bg-auralis-surface text-auralis-text border border-auralis-border"
              }`}
              title="Toggle OLED High Contrast Display"
            >
              <Contrast className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                {isHighContrast ? "High Contrast On" : "High Contrast"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
