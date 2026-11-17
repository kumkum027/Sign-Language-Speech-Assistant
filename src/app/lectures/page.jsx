"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Search,
  BookOpen,
  Calendar,
  Clock,
  Layers,
  Sparkles,
  Radio,
  CheckCircle2,
  ChevronRight,
  Filter,
  Loader2,
  FileText,
  Sun,
  Moon,
} from "lucide-react";

export default function LectureHistoryPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [lectures, setLectures] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL"); // ALL | LIVE | COMPLETED
  const [isHighContrast, setIsHighContrast] = useState(false);

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

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);

        const meRes = await fetch("/api/auth/me", { cache: "no-store" });
        if (!meRes.ok) {
          router.push("/login?redirect=/lectures");
          return;
        }
        const meData = await meRes.json();
        setUser(meData.user);

        const lecRes = await fetch(`/api/lectures?_t=${Date.now()}`, {
          cache: "no-store",
          headers: { "Cache-Control": "no-cache" },
        });
        if (lecRes.ok) {
          const lecData = await lecRes.json();
          setLectures(lecData.lectures || []);
        }
      } catch (err) {
        console.error("Failed to load lecture history:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [router]);

  const filteredLectures = lectures.filter((lec) => {
    const matchesStatus =
      statusFilter === "ALL" || lec.status === statusFilter;
    const matchesSearch =
      !searchQuery.trim() ||
      lec.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lec.classroom?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lec.classroom?.subject?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const totalTranscriptsCount = lectures.reduce(
    (acc, l) => acc + (l._count?.transcripts || 0),
    0
  );

  const formatDate = (isoString) => {
    if (!isoString) return "Date Pending";
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString("en-IN", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "Invalid Date";
    }
  };

  const dashboardHref =
    user?.role === "TEACHER" ? "/teacher/dashboard" : "/student/dashboard";

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-auralis-bg">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-auralis-accent" />
          <span className="text-xs font-semibold text-auralis-muted uppercase tracking-wider">
            Loading Lecture Archive...
          </span>
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
      {/* Top Header */}
      <header
        className={`border-b sticky top-0 z-30 shadow-sm transition-colors ${
          isHighContrast ? "bg-[#111C19] border-white/20 text-white" : "bg-white border-auralis-border"
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href={dashboardHref}
              className={`p-2 rounded-xl transition-colors border ${
                isHighContrast
                  ? "bg-white/10 text-white border-white/20 hover:bg-white/20"
                  : "bg-auralis-bg hover:bg-auralis-surface text-auralis-muted hover:text-auralis-text border-auralis-border"
              }`}
              title="Return to Dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>

            <div>
              <span
                className={`text-[11px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                  isHighContrast
                    ? "bg-[#FFE27A] text-black border-white"
                    : "text-auralis-accent bg-auralis-highlight border-auralis-secondary/40"
                }`}
              >
                Accessible Transcripts
              </span>
              <h1 className="font-heading font-extrabold text-xl sm:text-2xl tracking-tight mt-0.5">
                Lecture History & Transcripts
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleContrast}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-bold transition-colors cursor-pointer ${
                isHighContrast
                  ? "bg-[#FFE27A] text-black border-white"
                  : "border-auralis-border text-auralis-text bg-white hover:bg-auralis-bg"
              }`}
              title="Toggle Night Mode / High Contrast"
            >
              {isHighContrast ? (
                <>
                  <Sun className="w-4 h-4 text-black" />
                  <span>Standard</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-auralis-accent" />
                  <span>Night Mode</span>
                </>
              )}
            </button>

            <Link
              href={dashboardHref}
              className={`hidden sm:inline-flex items-center gap-2 text-xs font-bold px-3 py-2 rounded-xl border transition-colors ${
                isHighContrast
                  ? "border-white/20 text-white hover:bg-white/10"
                  : "border-auralis-border text-auralis-muted hover:text-auralis-text hover:bg-auralis-surface"
              }`}
            >
              <span>Back to Dashboard</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Telemetry Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-6 rounded-2xl bg-white border border-auralis-border shadow-tactile">
            <div className="flex items-center justify-between text-auralis-muted mb-2">
              <span className="text-xs font-bold uppercase tracking-wider font-mono">
                Total Lectures
              </span>
              <BookOpen className="w-4 h-4 text-auralis-accent" />
            </div>
            <div className="font-heading font-extrabold text-3xl sm:text-4xl">
              {lectures.length}
            </div>
            <p className="text-xs text-auralis-muted mt-1">
              Synchronized classroom lectures
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-auralis-border shadow-tactile">
            <div className="flex items-center justify-between text-auralis-muted mb-2">
              <span className="text-xs font-bold uppercase tracking-wider font-mono">
                Total Captions
              </span>
              <Layers className="w-4 h-4 text-auralis-accent" />
            </div>
            <div className="font-heading font-extrabold text-3xl sm:text-4xl">
              {totalTranscriptsCount}
            </div>
            <p className="text-xs text-auralis-muted mt-1">
              Persisted speech & sign segments
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-auralis-dark text-white border border-auralis-border shadow-tactile relative overflow-hidden">
            <div className="relative z-10 flex items-center justify-between text-auralis-secondary mb-2">
              <span className="text-xs font-bold uppercase tracking-wider font-mono">
                Live Broadcasts
              </span>
              <Radio className="w-4 h-4 text-auralis-secondary animate-pulse" />
            </div>
            <div className="relative z-10 font-heading font-extrabold text-3xl sm:text-4xl text-white">
              {lectures.filter((l) => l.status === "LIVE").length}
            </div>
            <p className="relative z-10 text-xs text-white/70 mt-1">
              Currently streaming in real-time
            </p>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-auralis-border shadow-tactile flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-auralis-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search lectures by title, topic, or subject code..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-auralis-border text-sm text-auralis-text placeholder:text-auralis-muted focus:outline-none focus:ring-2 focus:ring-auralis-accent focus:border-auralis-accent"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-auralis-muted font-bold flex items-center gap-1.5 mr-1">
              <Filter className="w-3.5 h-3.5" />
              <span>Status:</span>
            </span>

            {["ALL", "LIVE", "COMPLETED"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  statusFilter === st
                    ? "bg-auralis-accent text-white shadow-tactile"
                    : "bg-auralis-bg hover:bg-auralis-surface text-auralis-muted hover:text-auralis-text border border-auralis-border"
                }`}
              >
                {st === "ALL" ? "All" : st === "LIVE" ? "Live Now" : "Concluded"}
              </button>
            ))}
          </div>
        </div>

        {/* Lectures List */}
        {filteredLectures.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-white border border-dashed border-auralis-border space-y-4">
            <div className="w-12 h-12 rounded-xl bg-auralis-highlight text-auralis-accent mx-auto flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-base text-auralis-text">
                No matching lectures found
              </h3>
              <p className="text-xs text-auralis-muted max-w-sm mx-auto mt-1">
                {searchQuery
                  ? "Try searching for a different keyword or resetting your status filter."
                  : "Lecture sessions and real-time caption transcripts will appear here once started."}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredLectures.map((lec) => {
              const isLive = lec.status === "LIVE";
              return (
                <div
                  key={lec.id}
                  className="p-5 sm:p-6 rounded-2xl bg-white border border-auralis-border hover:border-auralis-accent/50 transition-all shadow-tactile flex flex-col md:flex-row md:items-center justify-between gap-4 group"
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 font-heading font-bold text-base ${
                        isLive
                          ? "bg-red-50 text-red-600 border border-red-200"
                          : "bg-auralis-highlight text-auralis-accent border border-auralis-secondary/40"
                      }`}
                    >
                      {isLive ? (
                        <Radio className="w-5 h-5 animate-pulse" />
                      ) : (
                        <CheckCircle2 className="w-5 h-5 text-auralis-success" />
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h2 className="font-heading font-bold text-base sm:text-lg text-auralis-text group-hover:text-auralis-accent transition-colors">
                          {lec.title}
                        </h2>
                        <span
                          className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full ${
                            isLive
                              ? "bg-red-50 text-red-600 border border-red-200"
                              : "bg-auralis-bg text-auralis-muted border border-auralis-border"
                          }`}
                        >
                          {isLive ? "LIVE NOW" : "CONCLUDED"}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-auralis-muted flex-wrap">
                        <span className="font-semibold text-auralis-text">
                          {lec.classroom?.name} ({lec.classroom?.subject})
                        </span>
                        <span>•</span>
                        <span>
                          Instructor: {lec.classroom?.teacher?.name || "Faculty"}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 font-mono">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{formatDate(lec.startedAt || lec.createdAt)}</span>
                        </span>
                      </div>

                      <div className="flex items-center gap-2 pt-1 text-xs text-auralis-accent font-mono">
                        <Layers className="w-3.5 h-3.5" />
                        <span>
                          {lec._count?.transcripts || 0}{" "}
                          {lec._count?.transcripts === 1 ? "caption block" : "caption blocks"}{" "}
                          recorded
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-auralis-border">
                    {isLive && (
                      <Link
                        href={`/classroom/${lec.classroom?.id || lec.classroomId}`}
                        className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-tactile transition-all flex items-center gap-1.5"
                      >
                        <Radio className="w-3.5 h-3.5" />
                        <span>Join Live Stream</span>
                      </Link>
                    )}

                    <Link
                      href={`/lectures/${lec.id}`}
                      className="px-4 py-2.5 rounded-xl bg-auralis-bg hover:bg-auralis-surface border border-auralis-border text-auralis-text text-xs font-bold shadow-tactile transition-all flex items-center gap-1.5 group-hover:border-auralis-accent group-hover:text-auralis-accent"
                    >
                      <span>Review Transcript</span>
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
