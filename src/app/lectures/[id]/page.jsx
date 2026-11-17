"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Download,
  Printer,
  Search,
  Contrast,
  Type,
  Mic,
  Hand,
  Calendar,
  Clock,
  Layers,
  Sparkles,
  Radio,
  CheckCircle2,
  Share2,
  FileText,
  Loader2,
  AlertCircle,
  BookOpen,
  HelpCircle,
  Send,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Check,
  Quote,
  Sun,
  Moon,
} from "lucide-react";

export default function LectureTranscriptViewPage() {
  const params = useParams();
  const router = useRouter();
  const lectureId = params?.id;

  const [lecture, setLecture] = useState(null);
  const [transcripts, setTranscripts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Tab Navigation: transcripts | summary | qa
  const [activeTab, setActiveTab] = useState("transcripts");

  // AI Study Summary & Flashcards State
  const [summaryData, setSummaryData] = useState(null);
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);
  const [activeFlashcardIndex, setActiveFlashcardIndex] = useState(0);
  const [isFlashcardFlipped, setIsFlashcardFlipped] = useState(false);

  // Semantic Q&A State
  const [qaQuestion, setQaQuestion] = useState("");
  const [qaResult, setQaResult] = useState(null);
  const [isQaLoading, setIsQaLoading] = useState(false);
  const [qaError, setQaError] = useState(null);

  // UX & Accessibility
  const [fontSize, setFontSize] = useState("large"); // standard | large | xlarge
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [exportNotice, setExportNotice] = useState(null);

  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem("auralis_theme");
      const isDark =
        savedTheme === "dark" ||
        document.documentElement.classList.contains("dark") ||
        document.documentElement.classList.contains("high-contrast");
      if (isDark) {
        setIsHighContrast(true);
        document.documentElement.classList.add("high-contrast", "dark");
      }
    } catch (e) {
      // ignore
    }
  }, []);

  const toggleContrast = () => {
    const next = !isHighContrast;
    setIsHighContrast(next);
    if (next) {
      document.documentElement.classList.add("high-contrast", "dark");
      try {
        localStorage.setItem("auralis_theme", "dark");
      } catch (e) {}
    } else {
      document.documentElement.classList.remove("high-contrast", "dark");
      try {
        localStorage.setItem("auralis_theme", "light");
      } catch (e) {}
    }
  };

  // Load AI Summary on demand or initial load
  const loadSummaryData = async () => {
    if (!lectureId || summaryData) return;
    try {
      setIsSummaryLoading(true);
      const res = await fetch(`/api/lectures/${lectureId}/summary`);
      if (res.ok) {
        const data = await res.json();
        setSummaryData(data.summary);
      }
    } catch (err) {
      console.warn("Failed to load AI summary:", err);
    } finally {
      setIsSummaryLoading(false);
    }
  };

  const handleAskQuestion = async (e, customQuery) => {
    if (e) e.preventDefault();
    const q = customQuery || qaQuestion;
    if (!q || !q.trim() || !lectureId) return;

    try {
      setIsQaLoading(true);
      setQaError(null);
      const res = await fetch(`/api/lectures/${lectureId}/summary`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q.trim() }),
      });

      if (!res.ok) {
        const errJson = await res.json();
        setQaError(errJson.error || "Failed to get answer");
        return;
      }

      const data = await res.json();
      setQaResult(data);
    } catch (err) {
      console.error("Q&A ask error:", err);
      setQaError("Failed to reach lecture Q&A engine.");
    } finally {
      setIsQaLoading(false);
    }
  };

  useEffect(() => {
    async function fetchLectureTranscript() {
      if (!lectureId) return;
      try {
        setIsLoading(true);
        setError(null);

        const res = await fetch(`/api/lectures/${lectureId}/transcripts`);
        if (!res.ok) {
          const errData = await res.json();
          setError(errData.error || "Failed to load lecture transcript");
          setIsLoading(false);
          return;
        }

        const data = await res.json();
        setLecture(data.lecture);
        setTranscripts(data.transcripts || []);
      } catch (err) {
        console.error("Fetch transcript error:", err);
        setError("Network error while loading lecture transcripts");
      } finally {
        setIsLoading(false);
      }
    }

    fetchLectureTranscript();
  }, [lectureId]);

  // Export Plain Text
  const handleExportText = () => {
    if (!lecture || transcripts.length === 0) return;

    let txt = `====================================================\n`;
    txt += `AURALIS ACCESSIBLE CLASSROOM TRANSCRIPT\n`;
    txt += `====================================================\n`;
    txt += `Lecture: ${lecture.title}\n`;
    txt += `Classroom: ${lecture.classroomName} (${lecture.classroomSubject})\n`;
    txt += `Date: ${new Date(lecture.startedAt || Date.now()).toLocaleString()}\n`;
    txt += `Status: ${lecture.status}\n`;
    txt += `Total Caption Blocks: ${transcripts.length}\n`;
    txt += `====================================================\n\n`;

    transcripts.forEach((t) => {
      const time = t.timestamp ? new Date(t.timestamp).toLocaleTimeString() : "";
      const source = t.source === "SIGN_LANGUAGE" ? "[SIGN GESTURE]" : "[SPEECH]";
      const speaker = t.speaker?.name ? `${t.speaker.name}: ` : "";
      txt += `[${time}] ${source} ${speaker}${t.text}\n\n`;
    });

    const blob = new Blob([txt], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${lecture.title.replace(/\s+/g, "_")}_Transcript.txt`;
    a.click();
    URL.revokeObjectURL(url);

    setExportNotice("Transcript exported as plain text!");
    setTimeout(() => setExportNotice(null), 3000);
  };

  // Export JSON
  const handleExportJSON = () => {
    if (!lecture || transcripts.length === 0) return;

    const exportData = {
      meta: {
        platform: "AURALIS – Classroom Without Barriers",
        exportedAt: new Date().toISOString(),
      },
      lecture,
      transcripts,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${lecture.title.replace(/\s+/g, "_")}_Transcript.json`;
    a.click();
    URL.revokeObjectURL(url);

    setExportNotice("Transcript data exported as JSON!");
    setTimeout(() => setExportNotice(null), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  // Filter transcripts by search keyword
  const filteredTranscripts = searchQuery.trim()
    ? transcripts.filter((t) =>
        t.text.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : transcripts;

  // Statistics
  const speechCount = transcripts.filter((t) => t.source !== "SIGN_LANGUAGE").length;
  const signCount = transcripts.filter((t) => t.source === "SIGN_LANGUAGE").length;
  const totalWords = transcripts.reduce(
    (acc, t) => acc + (t.text ? t.text.split(/\s+/).filter(Boolean).length : 0),
    0
  );

  const getTypographyClass = () => {
    switch (fontSize) {
      case "standard":
        return "text-base sm:text-lg leading-relaxed";
      case "xlarge":
        return "text-2xl sm:text-3xl leading-loose font-medium";
      case "large":
      default:
        return "text-lg sm:text-xl leading-relaxed";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-auralis-bg">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-auralis-accent" />
          <span className="text-xs font-semibold text-auralis-muted uppercase tracking-wider">
            Loading Lecture Transcript...
          </span>
        </div>
      </div>
    );
  }

  if (error || !lecture) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-auralis-bg p-6">
        <div className="max-w-md w-full bg-white rounded-2xl border border-auralis-border p-8 text-center space-y-4 shadow-float">
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 mx-auto flex items-center justify-center">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-heading font-extrabold text-xl text-auralis-text">
              Unable to Open Transcript
            </h2>
            <p className="text-xs text-auralis-muted mt-1 leading-relaxed">
              {error || "The requested lecture transcript could not be found."}
            </p>
          </div>
          <button
            onClick={() => router.push("/lectures")}
            className="w-full py-2.5 rounded-xl bg-auralis-accent text-white text-xs font-bold"
          >
            Return to Lecture Archive
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors ${
        isHighContrast ? "bg-[#0B0F0E] text-white" : "bg-auralis-bg text-auralis-text"
      }`}
    >
      {/* Top Bar */}
      <header
        className={`border-b sticky top-0 z-30 transition-colors ${
          isHighContrast
            ? "bg-[#0B0F0E] border-white/20"
            : "bg-white border-auralis-border shadow-sm"
        }`}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              href="/lectures"
              className={`p-2 rounded-xl transition-colors ${
                isHighContrast
                  ? "bg-white/10 text-white hover:bg-white/20"
                  : "bg-auralis-bg hover:bg-auralis-surface text-auralis-muted hover:text-auralis-text border border-auralis-border"
              }`}
              title="Back to Lecture Archive"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-heading font-extrabold text-lg sm:text-xl tracking-tight">
                  {lecture.title}
                </h1>
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded ${
                    isHighContrast
                      ? "bg-white/15 text-white"
                      : "bg-auralis-bg text-auralis-muted border border-auralis-border"
                  }`}
                >
                  {lecture.classroomSubject}
                </span>
                {lecture.status === "LIVE" && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-red-50 text-red-600 border border-red-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                    <span>LIVE STREAM</span>
                  </span>
                )}
              </div>

              <p className={`text-xs mt-0.5 ${isHighContrast ? "text-white/70" : "text-auralis-muted"}`}>
                Classroom: {lecture.classroomName}
              </p>
            </div>
          </div>

          {/* Quick Actions & Accessibility Controls */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Font Size */}
            <div
              className={`flex items-center rounded-xl p-0.5 border ${
                isHighContrast ? "bg-white/10 border-white/20" : "bg-auralis-bg border-auralis-border"
              }`}
            >
              <button
                onClick={() => setFontSize("standard")}
                className={`px-2 py-1 text-xs font-bold rounded-lg transition-all ${
                  fontSize === "standard"
                    ? isHighContrast
                      ? "bg-white text-black"
                      : "bg-white text-auralis-text shadow-sm"
                    : "text-inherit opacity-70"
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
                    : "text-inherit opacity-70"
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
                    : "text-inherit opacity-70"
                }`}
              >
                A++
              </button>
            </div>

            {/* High Contrast / Night Mode */}
            <button
              onClick={toggleContrast}
              className={`p-2 rounded-xl transition-all border cursor-pointer ${
                isHighContrast
                  ? "bg-[#FFE27A] text-black border-white font-bold"
                  : "bg-auralis-bg hover:bg-auralis-surface text-auralis-text border-auralis-border"
              }`}
              title={isHighContrast ? "Switch to Standard Theme" : "Switch to Night / High-Contrast Mode"}
            >
              {isHighContrast ? <Sun className="w-4 h-4 text-black" /> : <Moon className="w-4 h-4 text-auralis-accent" />}
            </button>

            {/* Print */}
            <button
              onClick={handlePrint}
              className={`p-2 rounded-xl transition-all border ${
                isHighContrast
                  ? "bg-white/10 hover:bg-white/20 text-white border-white/20"
                  : "bg-auralis-bg hover:bg-auralis-surface text-auralis-text border-auralis-border"
              }`}
              title="Print or Save PDF"
            >
              <Printer className="w-4 h-4" />
            </button>

            {/* Export TXT */}
            <button
              onClick={handleExportText}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                isHighContrast
                  ? "bg-[#FFE27A] hover:bg-white text-black"
                  : "bg-auralis-accent hover:bg-auralis-accent-hover text-white shadow-tactile"
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export .txt</span>
            </button>

            {/* Export JSON */}
            <button
              onClick={handleExportJSON}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                isHighContrast
                  ? "bg-white/10 hover:bg-white/20 text-white border-white/20"
                  : "bg-white hover:bg-auralis-surface text-auralis-text border-auralis-border"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>JSON</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Export Notification Toast */}
        {exportNotice && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{exportNotice}</span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-inherit pb-3 overflow-x-auto">
          <button
            onClick={() => setActiveTab("transcripts")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-heading font-bold transition-all shrink-0 ${
              activeTab === "transcripts"
                ? isHighContrast
                  ? "bg-[#FFE27A] text-black"
                  : "bg-auralis-accent text-white shadow-tactile"
                : isHighContrast
                ? "bg-white/10 hover:bg-white/20 text-white"
                : "bg-white hover:bg-auralis-surface text-auralis-text border border-auralis-border"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Full Transcript</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("summary");
              loadSummaryData();
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-heading font-bold transition-all shrink-0 ${
              activeTab === "summary"
                ? isHighContrast
                  ? "bg-[#FFE27A] text-black"
                  : "bg-auralis-accent text-white shadow-tactile"
                : isHighContrast
                ? "bg-white/10 hover:bg-white/20 text-white"
                : "bg-white hover:bg-auralis-surface text-auralis-text border border-auralis-border"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>AI Study Summary &amp; Flashcards</span>
          </button>

          <button
            onClick={() => setActiveTab("qa")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-heading font-bold transition-all shrink-0 ${
              activeTab === "qa"
                ? isHighContrast
                  ? "bg-[#FFE27A] text-black"
                  : "bg-auralis-accent text-white shadow-tactile"
                : isHighContrast
                ? "bg-white/10 hover:bg-white/20 text-white"
                : "bg-white hover:bg-auralis-surface text-auralis-text border border-auralis-border"
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>Ask the Lecture (AI Q&amp;A)</span>
          </button>
        </div>

        {/* TAB 1: FULL TRANSCRIPT */}
        {activeTab === "transcripts" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Telemetry & Search Row */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch">
              <div
                className={`md:col-span-8 p-4 rounded-2xl border flex items-center gap-3 ${
                  isHighContrast
                    ? "bg-[#0B0F0E] border-white/20"
                    : "bg-white border-auralis-border shadow-tactile"
                }`}
              >
                <Search className="w-4 h-4 text-auralis-muted shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter lecture transcript by word or phrase..."
                  className={`w-full text-xs outline-none bg-transparent ${
                    isHighContrast ? "text-white placeholder-white/40" : "text-auralis-text placeholder-auralis-muted"
                  }`}
                />
                {searchQuery && (
                  <span className="text-[11px] font-mono text-auralis-muted shrink-0">
                    {filteredTranscripts.length} matches
                  </span>
                )}
              </div>

              <div
                className={`md:col-span-4 p-4 rounded-2xl border flex items-center justify-around text-xs font-mono ${
                  isHighContrast
                    ? "bg-[#0B0F0E] border-white/20"
                    : "bg-white border-auralis-border shadow-tactile"
                }`}
              >
                <div className="text-center">
                  <div className="text-auralis-muted text-[10px] uppercase">Speech</div>
                  <div className="font-bold text-sm">{speechCount}</div>
                </div>
                <div className="h-6 w-px bg-inherit opacity-40" />
                <div className="text-center">
                  <div className="text-auralis-muted text-[10px] uppercase">Sign Signs</div>
                  <div className="font-bold text-sm text-auralis-accent">{signCount}</div>
                </div>
                <div className="h-6 w-px bg-inherit opacity-40" />
                <div className="text-center">
                  <div className="text-auralis-muted text-[10px] uppercase">Total Words</div>
                  <div className="font-bold text-sm">{totalWords}</div>
                </div>
              </div>
            </div>

            {/* Transcripts Editorial Reader */}
            <div
              className={`p-6 sm:p-10 rounded-2xl border transition-colors space-y-6 ${
                isHighContrast
                  ? "bg-[#0B0F0E] border-white/20"
                  : "bg-white border-auralis-border shadow-tactile"
              }`}
            >
              {filteredTranscripts.length === 0 ? (
                <div className="py-16 text-center space-y-2">
                  <Sparkles className="w-8 h-8 mx-auto text-auralis-accent opacity-60" />
                  <h3 className="font-heading font-bold text-base">
                    {searchQuery ? "No matching captions found" : "No captions recorded for this lecture"}
                  </h3>
                  <p className="text-xs text-auralis-muted">
                    {searchQuery ? "Try searching for a different keyword." : "Transcripts will appear here once the instructor speaks or signs."}
                  </p>
                </div>
              ) : (
                filteredTranscripts.map((t, idx) => {
                  const isGesture = t.source === "SIGN_LANGUAGE";
                  return (
                    <article
                      key={t.id || `tr-${idx}`}
                      className={`pl-4 sm:pl-6 border-l-2 transition-all space-y-1.5 ${
                        isGesture
                          ? isHighContrast
                            ? "border-[#FFE27A]"
                            : "border-auralis-accent"
                          : isHighContrast
                          ? "border-white/30"
                          : "border-auralis-border"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${
                            isGesture
                              ? isHighContrast
                                ? "bg-[#FFE27A] text-black"
                                : "bg-auralis-highlight text-auralis-accent border border-auralis-secondary/40"
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
                          <span className="text-xs font-bold">{t.speaker.name}</span>
                        )}

                        {t.timestamp && (
                          <span
                            className={`text-[11px] font-mono ${
                              isHighContrast ? "text-white/60" : "text-auralis-muted"
                            }`}
                          >
                            {new Date(t.timestamp).toLocaleTimeString()}
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
                })
              )}
            </div>
          </div>
        )}

        {/* TAB 2: AI STUDY SUMMARY & FLASHCARDS */}
        {activeTab === "summary" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {isSummaryLoading ? (
              <div className="py-20 flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-auralis-accent" />
                <span className="text-xs font-bold text-auralis-muted uppercase tracking-wider">
                  Analyzing Lecture Transcripts with AI...
                </span>
              </div>
            ) : !summaryData ? (
              <div className="p-8 rounded-2xl bg-white border border-auralis-border text-center space-y-3">
                <Sparkles className="w-8 h-8 mx-auto text-auralis-accent" />
                <h3 className="font-heading font-bold text-base">Generate AI Lecture Study Materials</h3>
                <p className="text-xs text-auralis-muted max-w-md mx-auto">
                  Automatically synthesize executive overviews, key definitions, bullet takeaways, and interactive flashcards from classroom captions.
                </p>
                <button
                  onClick={loadSummaryData}
                  className="px-5 py-2.5 rounded-xl bg-auralis-accent text-white font-bold text-xs shadow-tactile"
                >
                  Generate Study Notes
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Executive Summary */}
                <div
                  className={`p-6 sm:p-8 rounded-3xl border transition-all ${
                    isHighContrast
                      ? "bg-[#0B0F0E] border-white/20 text-white"
                      : "bg-white border-auralis-border text-auralis-text shadow-tactile"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-9 h-9 rounded-xl bg-auralis-accent text-white flex items-center justify-center">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-auralis-accent font-bold">
                        AI Executive Overview
                      </span>
                      <h2 className="font-heading font-extrabold text-lg">Lecture Synthesis</h2>
                    </div>
                  </div>
                  <p className="text-sm sm:text-base leading-relaxed opacity-90">
                    {summaryData.executiveSummary}
                  </p>
                </div>

                {/* Key Takeaways */}
                <div
                  className={`p-6 sm:p-8 rounded-3xl border transition-all ${
                    isHighContrast
                      ? "bg-[#0B0F0E] border-white/20 text-white"
                      : "bg-white border-auralis-border text-auralis-text shadow-tactile"
                  }`}
                >
                  <h3 className="font-heading font-extrabold text-base mb-4 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    <span>Essential Concepts &amp; Key Takeaways</span>
                  </h3>
                  <div className="space-y-3">
                    {summaryData.takeaways?.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-3 text-sm leading-relaxed">
                        <span className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Interactive Flashcards */}
                {summaryData.flashcards && summaryData.flashcards.length > 0 && (
                  <div
                    className={`p-6 sm:p-8 rounded-3xl border transition-all ${
                      isHighContrast
                        ? "bg-[#0B0F0E] border-white/20 text-white"
                        : "bg-white border-auralis-border text-auralis-text shadow-tactile"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-wider text-auralis-accent font-bold">
                          Active Recall
                        </span>
                        <h3 className="font-heading font-extrabold text-base">
                          Interactive Study Flashcards
                        </h3>
                      </div>
                      <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-black/5 dark:bg-white/10">
                        Card {activeFlashcardIndex + 1} of {summaryData.flashcards.length}
                      </span>
                    </div>

                    {/* Flipped Card */}
                    <div
                      onClick={() => setIsFlashcardFlipped(!isFlashcardFlipped)}
                      className={`min-h-[200px] p-8 rounded-2xl border-2 transition-all flex flex-col items-center justify-center text-center cursor-pointer select-none group relative overflow-hidden ${
                        isFlashcardFlipped
                          ? isHighContrast
                            ? "bg-[#FFE27A]/10 border-[#FFE27A]"
                            : "bg-emerald-50/70 border-emerald-400"
                          : isHighContrast
                          ? "bg-white/5 border-white/20 hover:border-white/40"
                          : "bg-auralis-bg border-auralis-border hover:border-auralis-accent/50"
                      }`}
                    >
                      <span className="text-[10px] font-mono uppercase tracking-widest text-auralis-muted mb-2 block">
                        {isFlashcardFlipped ? "Answer / Explanation (Click to flip back)" : "Question / Concept (Click to reveal answer)"}
                      </span>
                      <h4 className="font-heading font-bold text-lg sm:text-xl max-w-lg leading-snug">
                        {isFlashcardFlipped
                          ? summaryData.flashcards[activeFlashcardIndex]?.back
                          : summaryData.flashcards[activeFlashcardIndex]?.front}
                      </h4>
                      <div className="mt-4 text-xs font-semibold text-auralis-accent flex items-center gap-1.5 opacity-70 group-hover:opacity-100 transition-opacity">
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Flip Card</span>
                      </div>
                    </div>

                    {/* Flashcard Nav Controls */}
                    <div className="flex items-center justify-between mt-4">
                      <button
                        onClick={() => {
                          setIsFlashcardFlipped(false);
                          setActiveFlashcardIndex((prev) => Math.max(0, prev - 1));
                        }}
                        disabled={activeFlashcardIndex === 0}
                        className="px-4 py-2 rounded-xl border border-inherit text-xs font-bold flex items-center gap-1 disabled:opacity-40"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <span>Previous</span>
                      </button>

                      <button
                        onClick={() => {
                          setIsFlashcardFlipped(false);
                          setActiveFlashcardIndex((prev) =>
                            Math.min(summaryData.flashcards.length - 1, prev + 1)
                          );
                        }}
                        disabled={activeFlashcardIndex === summaryData.flashcards.length - 1}
                        className="px-4 py-2 rounded-xl bg-auralis-accent text-white text-xs font-bold flex items-center gap-1 shadow-tactile disabled:opacity-40"
                      >
                        <span>Next Card</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Academic Glossary */}
                {summaryData.glossary && summaryData.glossary.length > 0 && (
                  <div
                    className={`p-6 sm:p-8 rounded-3xl border transition-all ${
                      isHighContrast
                        ? "bg-[#0B0F0E] border-white/20 text-white"
                        : "bg-white border-auralis-border text-auralis-text shadow-tactile"
                    }`}
                  >
                    <h3 className="font-heading font-extrabold text-base mb-4 flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-auralis-accent" />
                      <span>Academic Glossary &amp; Definitions</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {summaryData.glossary.map((item, i) => (
                        <div
                          key={i}
                          className={`p-4 rounded-2xl border transition-all ${
                            isHighContrast
                              ? "bg-white/5 border-white/10"
                              : "bg-auralis-bg/60 border-auralis-border"
                          }`}
                        >
                          <div className="font-heading font-bold text-sm text-auralis-accent">
                            {item.term}
                          </div>
                          <p className="text-xs leading-relaxed mt-1 opacity-80">
                            {item.definition}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: ASK THE LECTURE (AI SEMANTIC Q&A) */}
        {activeTab === "qa" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Question Input Card */}
            <div
              className={`p-6 sm:p-8 rounded-3xl border transition-all ${
                isHighContrast
                  ? "bg-[#0B0F0E] border-white/20 text-white"
                  : "bg-white border-auralis-border text-auralis-text shadow-tactile"
              }`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-auralis-accent text-white flex items-center justify-center">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-heading font-extrabold text-lg">Ask the Lecture</h2>
                  <p className="text-xs text-auralis-muted">
                    Semantic Q&amp;A referencing the live classroom transcript with exact timestamp citations
                  </p>
                </div>
              </div>

              {/* Preset prompt pills */}
              <div className="flex items-center gap-2 flex-wrap mb-4">
                <span className="text-[11px] font-mono text-auralis-muted uppercase">Try:</span>
                {[
                  "What was the main topic explained?",
                  "Summarize key definitions discussed",
                  "What instructions did the teacher give?",
                ].map((promptText, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={(e) => {
                      setQaQuestion(promptText);
                      handleAskQuestion(e, promptText);
                    }}
                    className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                      isHighContrast
                        ? "bg-white/10 hover:bg-white/20 border-white/20 text-white"
                        : "bg-auralis-bg hover:bg-auralis-surface text-auralis-text border-auralis-border"
                    }`}
                  >
                    {promptText}
                  </button>
                ))}
              </div>

              <form onSubmit={handleAskQuestion} className="flex items-center gap-3">
                <input
                  type="text"
                  value={qaQuestion}
                  onChange={(e) => setQaQuestion(e.target.value)}
                  placeholder="Ask any question about today's lecture content..."
                  required
                  className={`flex-1 px-4 py-3 rounded-2xl text-xs sm:text-sm border outline-none ${
                    isHighContrast
                      ? "bg-white/10 border-white/20 text-white placeholder:text-white/40"
                      : "bg-auralis-bg border-auralis-border text-auralis-text placeholder:text-auralis-muted"
                  }`}
                />
                <button
                  type="submit"
                  disabled={isQaLoading || !qaQuestion.trim()}
                  className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-auralis-accent hover:bg-auralis-accent-hover text-white text-xs sm:text-sm font-bold shadow-tactile transition-all disabled:opacity-50"
                >
                  {isQaLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  <span>Ask AI</span>
                </button>
              </form>

              {qaError && (
                <div className="mt-4 p-3 rounded-xl bg-red-50 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{qaError}</span>
                </div>
              )}
            </div>

            {/* Answer Display */}
            {qaResult && (
              <div
                className={`p-6 sm:p-8 rounded-3xl border transition-all space-y-5 animate-in slide-in-from-bottom-3 duration-300 ${
                  isHighContrast
                    ? "bg-[#0B0F0E] border-white/20 text-white"
                    : "bg-white border-auralis-border text-auralis-text shadow-tactile"
                }`}
              >
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-auralis-accent font-bold">
                    Question Asked
                  </span>
                  <h3 className="font-heading font-extrabold text-base mt-0.5">
                    &ldquo;{qaResult.question}&rdquo;
                  </h3>
                </div>

                <div
                  className={`p-5 rounded-2xl border leading-relaxed text-sm sm:text-base ${
                    isHighContrast
                      ? "bg-white/5 border-white/10"
                      : "bg-auralis-bg/70 border-auralis-border"
                  }`}
                >
                  {qaResult.answer}
                </div>

                {/* Direct Transcript Citations */}
                {qaResult.citations && qaResult.citations.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-auralis-muted flex items-center gap-1.5">
                      <Quote className="w-3.5 h-3.5 text-auralis-accent" />
                      <span>Transcript Sources &amp; Exact Citations</span>
                    </h4>

                    <div className="space-y-2.5">
                      {qaResult.citations.map((cite, i) => (
                        <div
                          key={i}
                          className={`p-3.5 rounded-xl border text-xs space-y-1 ${
                            isHighContrast
                              ? "bg-white/5 border-white/10"
                              : "bg-white border-auralis-border"
                          }`}
                        >
                          <div className="flex items-center justify-between text-[11px] font-mono text-auralis-muted">
                            <span className="font-bold text-auralis-accent">{cite.speaker}</span>
                            <span>{cite.timestamp}</span>
                          </div>
                          <p className="italic opacity-90">&ldquo;{cite.text}&rdquo;</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
