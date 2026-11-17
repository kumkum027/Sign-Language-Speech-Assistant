"use client";

import React, { useState } from "react";
import {
  Activity,
  Mic,
  Hand,
  Wifi,
  Download,
  Search,
  Users,
  Settings2,
  CheckCircle2,
  AlertCircle,
  Volume2,
} from "lucide-react";

export default function SidePanel({
  isHighContrast = false,
  isListening = false,
  micLevel = 0,
  language = "en-IN",
  setLanguage,
  isCameraActive = false,
  onToggleCamera,
  connectionStatus = "CONNECTED",
  participantCount = 1,
  transcripts = [],
  onSearchChange,
  classroomTitle = "",
  userRole = "STUDENT",
}) {
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Handle transcript export
  const handleDownloadTranscript = () => {
    if (transcripts.length === 0) return;

    let content = `AURALIS LECTURE TRANSCRIPT\n`;
    content += `Classroom: ${classroomTitle}\n`;
    content += `Generated: ${new Date().toLocaleString()}\n`;
    content += `Total Entries: ${transcripts.length}\n`;
    content += `====================================================\n\n`;

    transcripts.forEach((t, i) => {
      const time = t.timestamp ? new Date(t.timestamp).toLocaleTimeString() : "";
      const source = t.source === "SIGN_LANGUAGE" ? "[SIGN]" : "[SPEECH]";
      const speaker = t.speaker?.name ? `${t.speaker.name}: ` : "";
      content += `[${time}] ${source} ${speaker}${t.text}\n\n`;
    });

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Auralis-Transcript-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  return (
    <aside
      className={`w-full lg:w-80 flex flex-col gap-4 shrink-0 transition-colors ${
        isHighContrast ? "text-white" : "text-auralis-text"
      }`}
    >
      {/* 1. Live Engine & Connection Telemetry */}
      <div
        className={`p-5 rounded-2xl border transition-colors space-y-4 ${
          isHighContrast
            ? "bg-[#0B0F0E] border-white/20"
            : "bg-white border-auralis-border shadow-tactile"
        }`}
      >
        <div className="flex items-center justify-between pb-3 border-b border-inherit">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-auralis-accent" />
            <h2 className="font-heading font-bold text-xs uppercase tracking-wider">
              Telemetry & Engine
            </h2>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-mono">
            <span
              className={`w-2 h-2 rounded-full ${
                connectionStatus === "CONNECTED"
                  ? "bg-auralis-success animate-pulse"
                  : connectionStatus === "CONNECTING"
                  ? "bg-amber-400 animate-ping"
                  : "bg-red-400"
              }`}
            />
            <span className="text-[11px] font-semibold">{connectionStatus}</span>
          </div>
        </div>

        {connectionStatus === "OFFLINE" && (
          <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] leading-snug">
            Socket server inactive on port 3001. Run <code className="font-mono font-bold bg-amber-100/80 px-1 py-0.5 rounded">npm run dev</code> or <code className="font-mono font-bold bg-amber-100/80 px-1 py-0.5 rounded">node server/socket-server.js</code>.
          </div>
        )}

        {/* Speech-to-Text Status */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 text-auralis-muted">
              <Mic className="w-3.5 h-3.5" />
              <span>Speech Engine</span>
            </span>
            <span
              className={`font-mono text-[11px] font-bold ${
                isListening
                  ? "text-auralis-success"
                  : "text-auralis-muted"
              }`}
            >
              {isListening ? "ACTIVE" : "STANDBY"}
            </span>
          </div>

          {/* Audio Visualizer Level Bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] font-mono text-auralis-muted">
              <span>Mic Gain</span>
              <span>{micLevel}%</span>
            </div>
            <div
              className={`h-2 rounded-full overflow-hidden ${
                isHighContrast ? "bg-white/10" : "bg-auralis-bg border border-auralis-border"
              }`}
            >
              <div
                className={`h-full transition-all duration-75 rounded-full ${
                  isHighContrast
                    ? "bg-[#FFE27A]"
                    : micLevel > 70
                    ? "bg-emerald-500"
                    : micLevel > 30
                    ? "bg-auralis-accent"
                    : "bg-auralis-secondary"
                }`}
                style={{ width: `${micLevel}%` }}
              />
            </div>
          </div>
        </div>

        {/* Sign Language Recognition Status */}
        <div className="pt-2 border-t border-inherit space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 text-auralis-muted">
              <Hand className="w-3.5 h-3.5" />
              <span>Sign Detection (CV)</span>
            </span>
            <span
              className={`font-mono text-[11px] font-bold ${
                isCameraActive ? "text-auralis-success" : "text-auralis-muted"
              }`}
            >
              {isCameraActive ? "TRACKING" : "OFF"}
            </span>
          </div>

          {onToggleCamera && (
            <button
              onClick={onToggleCamera}
              className={`w-full py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
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
              <span>{isCameraActive ? "Disable Camera Tracking" : "Enable Gesture Camera"}</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Search in Transcript */}
      <div
        className={`p-4 rounded-2xl border transition-colors ${
          isHighContrast
            ? "bg-[#0B0F0E] border-white/20"
            : "bg-white border-auralis-border shadow-tactile"
        }`}
      >
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-auralis-muted" />
          <input
            type="text"
            placeholder="Search keywords in lecture..."
            onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
            className={`w-full pl-9 pr-3 py-2 rounded-xl text-xs outline-none transition-all ${
              isHighContrast
                ? "bg-white/10 text-white placeholder-white/40 focus:ring-1 focus:ring-white"
                : "bg-auralis-bg border border-auralis-border text-auralis-text placeholder-auralis-muted focus:border-auralis-accent"
            }`}
          />
        </div>
      </div>

      {/* 3. Export / Download Transcript */}
      <div
        className={`p-5 rounded-2xl border transition-colors space-y-3 ${
          isHighContrast
            ? "bg-[#0B0F0E] border-white/20"
            : "bg-white border-auralis-border shadow-tactile"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Download className="w-4 h-4 text-auralis-accent" />
            <h3 className="font-heading font-bold text-xs uppercase tracking-wider">
              Lecture Notes
            </h3>
          </div>
          <span className="text-[11px] font-mono text-auralis-muted">
            {transcripts.length} segments
          </span>
        </div>

        <p className="text-xs text-auralis-muted leading-relaxed">
          Download the complete time-stamped lecture transcripts including speech and recognized sign gestures for study and review.
        </p>

        <button
          onClick={handleDownloadTranscript}
          disabled={transcripts.length === 0}
          className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
            transcripts.length === 0
              ? "opacity-50 cursor-not-allowed bg-gray-200 text-gray-500"
              : isHighContrast
              ? "bg-[#FFE27A] hover:bg-white text-black"
              : "bg-auralis-accent hover:bg-auralis-accent-hover text-white shadow-tactile"
          }`}
        >
          {downloadSuccess ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Transcript Downloaded!</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span>Export Full Transcript (.txt)</span>
            </>
          )}
        </button>
      </div>

      {/* 4. Classroom Information Card */}
      <div
        className={`p-5 rounded-2xl border transition-colors space-y-3 ${
          isHighContrast
            ? "bg-[#0B0F0E] border-white/20"
            : "bg-auralis-bg/60 border-auralis-border"
        }`}
      >
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-auralis-muted">
          <Users className="w-3.5 h-3.5" />
          <span>Active Session</span>
        </div>

        <div className="space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-auralis-muted">Active Users:</span>
            <span className="font-mono font-bold">{participantCount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-auralis-muted">Protocol:</span>
            <span className="font-mono">WebSpeech + Socket.IO</span>
          </div>
          <div className="flex justify-between">
            <span className="text-auralis-muted">Sign Dictionary:</span>
            <span className="font-mono">ISL 10-Gesture Core</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
