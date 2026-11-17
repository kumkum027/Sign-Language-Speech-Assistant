"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  PlusCircle,
  History,
  Sliders,
  LogOut,
  Radio,
  ArrowRight,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Sun,
  Moon,
  Type,
  Sparkles,
  Contrast,
  Eye,
  Hand,
  Volume2,
  RotateCcw,
  Check,
  ShieldCheck,
  Lock,
  EyeOff,
  Edit3,
  User,
} from "lucide-react";

export default function StudentDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("classrooms");
  const [user, setUser] = useState(null);
  const [classrooms, setClassrooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Join Classroom State
  const [joinCode, setJoinCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [joinError, setJoinError] = useState(null);
  const [joinSuccess, setJoinSuccess] = useState(null);

  // Accessibility Controls (Live State)
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [fontSize, setFontSize] = useState("large"); // standard | large | xlarge | huge
  const [skeletonMode, setSkeletonMode] = useState("full"); // full | minimal | hidden
  const [showAudioWave, setShowAudioWave] = useState(true);
  const [gestureAlert, setGestureAlert] = useState(true);
  const [saveToast, setSaveToast] = useState(false);

  // Profile Edit State
  const [profileName, setProfileName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");

  useEffect(() => {
    if (user) {
      setProfileName(user.name || "");
      setProfileEmail(user.email || "");
    }
  }, [user]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileError("");
    setProfileSuccess("");

    if (newPassword && newPassword.length < 8) {
      setProfileError("New password must be at least 8 characters long.");
      return;
    }
    if (newPassword && newPassword !== confirmNewPassword) {
      setProfileError("New passwords do not match.");
      return;
    }
    if (newPassword && !currentPassword) {
      setProfileError("Current password is required to change password.");
      return;
    }

    setProfileLoading(true);
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profileName,
          email: profileEmail,
          currentPassword: currentPassword || undefined,
          newPassword: newPassword || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update profile.");
      }

      setUser(data.user);
      setProfileSuccess("Account profile updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      setTimeout(() => {
        setProfileSuccess("");
      }, 3000);
    } catch (err) {
      setProfileError(err.message || "An error occurred.");
    } finally {
      setProfileLoading(false);
    }
  };

  // Load saved accessibility preferences on mount
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem("auralis_theme");
      const saved = localStorage.getItem("auralis_student_accessibility");
      let shouldDark = savedTheme === "dark";

      if (saved) {
        const pref = JSON.parse(saved);
        if (pref.fontSize) setFontSize(pref.fontSize);
        if (typeof pref.isHighContrast === "boolean") {
          if (pref.isHighContrast) shouldDark = true;
        }
        if (pref.skeletonMode) setSkeletonMode(pref.skeletonMode);
        if (typeof pref.showAudioWave === "boolean") setShowAudioWave(pref.showAudioWave);
        if (typeof pref.gestureAlert === "boolean") setGestureAlert(pref.gestureAlert);
      }

      setIsHighContrast(shouldDark);
      if (shouldDark) {
        document.documentElement.classList.add("high-contrast", "dark");
      } else {
        document.documentElement.classList.remove("high-contrast", "dark");
      }
    } catch (e) {
      // ignore
    }
    fetchSessionAndEnrolled();
  }, []);

  const saveAccessibilityPreferences = (updates = {}) => {
    const updated = {
      fontSize,
      isHighContrast,
      skeletonMode,
      showAudioWave,
      gestureAlert,
      ...updates,
    };
    try {
      localStorage.setItem("auralis_student_accessibility", JSON.stringify(updated));
      setSaveToast(true);
      setTimeout(() => setSaveToast(false), 2500);
    } catch (e) {
      // ignore
    }
  };

  const handleFontSizeChange = (size) => {
    setFontSize(size);
    saveAccessibilityPreferences({ fontSize: size });
  };

  const handleSkeletonModeChange = (mode) => {
    setSkeletonMode(mode);
    saveAccessibilityPreferences({ skeletonMode: mode });
  };

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
    saveAccessibilityPreferences({ isHighContrast: next });
  };

  const fetchSessionAndEnrolled = async () => {
    try {
      const userRes = await fetch("/api/auth/me");
      if (!userRes.ok) {
        router.push("/login");
        return;
      }
      const userData = await userRes.json();

      if (userData.user.role === "TEACHER") {
        router.push("/teacher/dashboard");
        return;
      }
      setUser(userData.user);

      const classRes = await fetch("/api/classrooms");
      if (classRes.ok) {
        const classData = await classRes.json();
        setClassrooms(classData.classrooms || []);
      }
    } catch (err) {
      console.error("Student Dashboard Load Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinClassroom = async (e) => {
    e.preventDefault();
    if (!joinCode.trim()) {
      setJoinError("Please enter a classroom join code");
      return;
    }

    setIsJoining(true);
    setJoinError(null);
    setJoinSuccess(null);

    try {
      const res = await fetch("/api/classrooms/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: joinCode.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        setJoinError(data.error || "Failed to join classroom");
        setIsJoining(false);
        return;
      }

      setJoinSuccess(`Enrolled successfully in ${data.classroom.name}!`);
      setJoinCode("");
      // Refresh classroom list
      const updatedRes = await fetch("/api/classrooms");
      if (updatedRes.ok) {
        const updatedData = await updatedRes.json();
        setClassrooms(updatedData.classrooms || []);
      }
    } catch (err) {
      setJoinError("Network error while joining classroom.");
    } finally {
      setIsJoining(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
    } catch (e) {
      router.push("/login");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-auralis-bg">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-auralis-accent" />
          <span className="text-xs font-semibold text-auralis-muted uppercase tracking-wider">
            Loading Student Console...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen flex flex-col md:flex-row font-sans transition-colors ${
        isHighContrast ? "bg-[#0A100F] text-white" : "bg-auralis-bg text-auralis-text"
      }`}
    >
      <aside className="w-full md:w-64 bg-white border-r border-auralis-border flex flex-col justify-between shrink-0">
        <div>
          <div className="p-6 border-b border-auralis-border">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-auralis-accent text-white flex items-center justify-center font-bold text-base shadow-tactile">
                <span className="font-heading">A</span>
              </div>
              <div className="flex flex-col">
                <span className="font-heading font-extrabold text-lg text-auralis-text leading-none">
                  AURALIS
                </span>
                <span className="text-[10px] font-semibold text-auralis-muted uppercase tracking-wider mt-1">
                  Student Console
                </span>
              </div>
            </Link>
          </div>

          <nav className="p-4 space-y-1">
            <button
              onClick={() => setActiveTab("classrooms")}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all ${
                activeTab === "classrooms"
                  ? "bg-auralis-highlight text-auralis-accent shadow-tactile font-bold"
                  : "text-auralis-muted hover:text-auralis-text hover:bg-auralis-bg"
              }`}
            >
              <BookOpen className="w-4 h-4 shrink-0" />
              <span>My Classrooms</span>
            </button>

            <button
              onClick={() => setActiveTab("join")}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all ${
                activeTab === "join"
                  ? "bg-auralis-highlight text-auralis-accent shadow-tactile font-bold"
                  : "text-auralis-muted hover:text-auralis-text hover:bg-auralis-bg"
              }`}
            >
              <PlusCircle className="w-4 h-4 shrink-0" />
              <span>Join Classroom</span>
            </button>

            <Link
              href="/lectures"
              className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold text-auralis-muted hover:text-auralis-text hover:bg-auralis-bg transition-all"
            >
              <History className="w-4 h-4 shrink-0" />
              <span>Lecture History</span>
            </Link>

            <button
              onClick={() => setActiveTab("accessibility")}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all ${
                activeTab === "accessibility"
                  ? "bg-auralis-highlight text-auralis-accent shadow-tactile font-bold"
                  : "text-auralis-muted hover:text-auralis-text hover:bg-auralis-bg"
              }`}
            >
              <Sliders className="w-4 h-4 shrink-0" />
              <span>Accessibility Settings</span>
            </button>

            <button
              onClick={() => setActiveTab("profile")}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all ${
                activeTab === "profile"
                  ? "bg-auralis-highlight text-auralis-accent shadow-tactile font-bold"
                  : "text-auralis-muted hover:text-auralis-text hover:bg-auralis-bg"
              }`}
            >
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Account &amp; Profile</span>
            </button>
          </nav>
        </div>

        <div className="p-4 border-t border-auralis-border space-y-3">
          <div className="p-3 rounded-xl bg-auralis-bg border border-auralis-border flex items-center justify-between gap-3">
            <button
              onClick={() => setActiveTab("profile")}
              className="flex items-center gap-2.5 min-w-0 text-left flex-1 hover:opacity-80 transition-opacity"
            >
              <div className="w-8 h-8 rounded-full bg-auralis-secondary text-auralis-dark flex items-center justify-center font-bold text-xs uppercase shrink-0">
                {user?.name?.slice(0, 2) || "ST"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-auralis-text truncate">{user?.name}</div>
                <div className="text-[10px] text-auralis-muted truncate">{user?.email}</div>
              </div>
            </button>
            <button
              onClick={() => setActiveTab("profile")}
              title="Edit Profile"
              className="p-1.5 rounded-lg text-auralis-muted hover:text-auralis-accent hover:bg-white transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 p-6 sm:p-10 lg:p-12 overflow-y-auto">
        <div className="max-w-5xl mx-auto space-y-10">
          <div className="pb-6 border-b border-auralis-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-auralis-accent bg-auralis-highlight px-3 py-1 rounded-full border border-auralis-secondary/60">
                Student Learning Portal
              </span>
              <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-auralis-text tracking-tight mt-3">
                Welcome back, {user?.name}
              </h1>
              <p className="text-sm text-auralis-muted mt-1">
                Your live caption stream and archived transcripts are synchronized.
              </p>
            </div>

            <button
              onClick={toggleContrast}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-auralis-border bg-white text-xs font-bold text-auralis-text hover:bg-auralis-bg transition-colors shadow-tactile self-start sm:self-auto"
            >
              {isHighContrast ? (
                <>
                  <Sun className="w-4 h-4 text-auralis-warning" />
                  <span>Standard Theme</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-auralis-accent" />
                  <span>High-Contrast Mode</span>
                </>
              )}
            </button>
          </div>

          {/* TAB 1: ACCESSIBILITY PREFERENCES HUB */}
          {activeTab === "accessibility" && (
            <div className="space-y-8">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-heading font-bold text-2xl text-auralis-text">
                    Accessibility & Caption Preferences
                  </h2>
                  <p className="text-xs text-auralis-muted mt-1 max-w-xl">
                    Tailor live caption sizing, contrast ratios, and sign language landmark overlays. Settings are saved on this device and automatically apply whenever you enter any live classroom.
                  </p>
                </div>

                {saveToast && (
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold animate-pulse shadow-tactile shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-auralis-success" />
                    <span>Preferences Saved &amp; Synced</span>
                  </div>
                )}
              </div>

              {/* LIVE INTERACTIVE CAPTION SANDBOX PREVIEW */}
              <div className="p-6 sm:p-8 rounded-2xl bg-white border border-auralis-border shadow-tactile space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-auralis-border/80">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-auralis-accent">
                    <Sparkles className="w-4 h-4" />
                    <span>Live Interactive Caption Preview</span>
                  </div>
                  <span className="text-[11px] font-mono text-auralis-muted bg-auralis-bg px-2 py-0.5 rounded border border-auralis-border">
                    Font: {fontSize.toUpperCase()} • Mode: {isHighContrast ? "HIGH-CONTRAST" : "STANDARD"}
                  </span>
                </div>

                {/* Simulated Caption Screen */}
                <div
                  className={`p-6 sm:p-8 rounded-xl border transition-all ${
                    isHighContrast
                      ? "bg-[#060B0A] border-[#2FE4BD]/40 text-white"
                      : "bg-[#142B29] border-[#176B60]/30 text-white"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-300">
                      LIVE • Instructor Spoken Stream
                    </span>
                  </div>

                  <p
                    className={`font-sans tracking-wide leading-relaxed transition-all ${
                      fontSize === "standard"
                        ? "text-lg"
                        : fontSize === "xlarge"
                        ? "text-3xl font-medium"
                        : fontSize === "huge"
                        ? "text-4xl font-bold"
                        : "text-2xl"
                    } ${isHighContrast ? "text-[#2FE4BD]" : "text-white"}`}
                  >
                    &ldquo;Today we are exploring binary search trees and algorithm time complexity...&rdquo;
                  </p>

                  {/* Simulated Interim Caption Stream */}
                  <div className="mt-4 pt-3 border-t border-white/10 flex items-center gap-3">
                    <span className="text-xs font-mono text-white/50 shrink-0">Interim:</span>
                    <span className="text-sm font-sans italic text-white/80 animate-pulse">
                      analyzing logarithmic efficiency O(log n)...
                    </span>
                  </div>

                  {/* Simulated Gesture Notification Badge */}
                  {gestureAlert && (
                    <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 text-xs font-mono font-bold shadow-tactile">
                      <Hand className="w-3.5 h-3.5" />
                      <span>ISL Gesture Recognized: &ldquo;QUESTION / DOUBT&rdquo; (98.4%)</span>
                    </div>
                  )}
                </div>
              </div>

              {/* SETTINGS CARD 1: CAPTION FONT SIZE */}
              <div className="p-6 sm:p-8 rounded-2xl bg-white border border-auralis-border shadow-tactile space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-auralis-accent">
                  <Type className="w-4 h-4" />
                  <span>Caption Typography Size</span>
                </div>
                <p className="text-xs text-auralis-muted">
                  Choose the caption text scale that provides optimal reading speed and comfort.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
                  {[
                    { id: "standard", label: "Standard", px: "18px", desc: "Compact desktop reading" },
                    { id: "large", label: "Large (Recommended)", px: "24px", desc: "Best for classroom lectures" },
                    { id: "xlarge", label: "Extra Large", px: "32px", desc: "High readability across room" },
                    { id: "huge", label: "Maximum", px: "40px", desc: "Low vision & large displays" },
                  ].map((size) => (
                    <button
                      key={size.id}
                      type="button"
                      onClick={() => handleFontSizeChange(size.id)}
                      className={`p-4 rounded-xl border text-left transition-all ${
                        fontSize === size.id
                          ? "border-auralis-accent bg-auralis-highlight/60 ring-2 ring-auralis-accent shadow-tactile"
                          : "border-auralis-border bg-white hover:bg-auralis-bg hover:border-auralis-border/80"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-heading font-bold text-sm text-auralis-text">{size.label}</span>
                        {fontSize === size.id && <Check className="w-4 h-4 text-auralis-accent" />}
                      </div>
                      <span className="text-[11px] font-mono text-auralis-accent font-semibold block">{size.px}</span>
                      <p className="text-[11px] text-auralis-muted mt-1 leading-normal">{size.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* SETTINGS CARD 2: HIGH CONTRAST & VISUAL THEME */}
              <div className="p-6 sm:p-8 rounded-2xl bg-white border border-auralis-border shadow-tactile space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-auralis-accent">
                  <Contrast className="w-4 h-4" />
                  <span>Visual Theme &amp; OLED High Contrast</span>
                </div>
                <p className="text-xs text-auralis-muted">
                  Meets WCAG 2.2 AAA accessibility standard (7:1+ contrast ratio) for students with photophobia, astigmatism, or low vision.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (isHighContrast) toggleContrast();
                    }}
                    className={`p-5 rounded-xl border text-left transition-all flex items-start gap-4 ${
                      !isHighContrast
                        ? "border-auralis-accent bg-auralis-highlight/60 ring-2 ring-auralis-accent shadow-tactile"
                        : "border-auralis-border bg-white hover:bg-auralis-bg"
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-auralis-bg border border-auralis-border flex items-center justify-center shrink-0">
                      <Sun className="w-5 h-5 text-auralis-accent" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-heading font-bold text-sm text-auralis-text">Standard Theme</span>
                        {!isHighContrast && <Check className="w-4 h-4 text-auralis-accent" />}
                      </div>
                      <p className="text-xs text-auralis-muted mt-1">
                        Soft organic paper surface (#F6F7F4) with deep evergreen accents.
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (!isHighContrast) toggleContrast();
                    }}
                    className={`p-5 rounded-xl border text-left transition-all flex items-start gap-4 ${
                      isHighContrast
                        ? "border-[#2FE4BD] bg-[#0A100F] text-white ring-2 ring-[#2FE4BD] shadow-tactile"
                        : "border-auralis-border bg-white hover:bg-auralis-bg"
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-black border border-white/20 flex items-center justify-center shrink-0">
                      <Moon className="w-5 h-5 text-[#2FE4BD]" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className={`font-heading font-bold text-sm ${isHighContrast ? "text-white" : "text-auralis-text"}`}>
                          High-Contrast OLED
                        </span>
                        {isHighContrast && <Check className="w-4 h-4 text-[#2FE4BD]" />}
                      </div>
                      <p className={`text-xs mt-1 ${isHighContrast ? "text-white/70" : "text-auralis-muted"}`}>
                        Deep black (#0A100F) with luminous cyan-teal text for maximum glare reduction.
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              {/* SETTINGS CARD 3: ISL GESTURE SKELETON & TELEMETRY */}
              <div className="p-6 sm:p-8 rounded-2xl bg-white border border-auralis-border shadow-tactile space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-auralis-accent">
                  <Hand className="w-4 h-4" />
                  <span>Indian Sign Language (ISL) Landmark Vision</span>
                </div>
                <p className="text-xs text-auralis-muted">
                  Customize the real-time MediaPipe 21-joint skeleton points drawn over your webcam stream during sign language participation.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  {[
                    { id: "full", label: "Full Skeleton", desc: "Draws all 21 joint points and anatomical bones" },
                    { id: "minimal", label: "Minimalist Nodes", desc: "Draws fingertip landmark nodes only" },
                    { id: "hidden", label: "Hidden Skeleton", desc: "Recognizes gestures without drawing skeleton" },
                  ].map((skel) => (
                    <button
                      key={skel.id}
                      type="button"
                      onClick={() => handleSkeletonModeChange(skel.id)}
                      className={`p-4 rounded-xl border text-left transition-all ${
                        skeletonMode === skel.id
                          ? "border-auralis-accent bg-auralis-highlight/60 ring-2 ring-auralis-accent shadow-tactile"
                          : "border-auralis-border bg-white hover:bg-auralis-bg"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-heading font-bold text-sm text-auralis-text">{skel.label}</span>
                        {skeletonMode === skel.id && <Check className="w-4 h-4 text-auralis-accent" />}
                      </div>
                      <p className="text-[11px] text-auralis-muted leading-normal">{skel.desc}</p>
                    </button>
                  ))}
                </div>

                <div className="pt-4 border-t border-auralis-border/80 space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={gestureAlert}
                      onChange={(e) => {
                        const val = e.target.checked;
                        setGestureAlert(val);
                        saveAccessibilityPreferences({ gestureAlert: val });
                      }}
                      className="w-4 h-4 text-auralis-accent rounded border-auralis-border focus:ring-auralis-accent"
                    />
                    <div>
                      <span className="text-xs font-bold text-auralis-text">Visual Gesture Confirmation Pulse</span>
                      <p className="text-[11px] text-auralis-muted">
                        Flashes an instant green badge whenever an Indian Sign Language gesture is identified.
                      </p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={showAudioWave}
                      onChange={(e) => {
                        const val = e.target.checked;
                        setShowAudioWave(val);
                        saveAccessibilityPreferences({ showAudioWave: val });
                      }}
                      className="w-4 h-4 text-auralis-accent rounded border-auralis-border focus:ring-auralis-accent"
                    />
                    <div>
                      <span className="text-xs font-bold text-auralis-text">Visual Speech Amplitude Wave</span>
                      <p className="text-[11px] text-auralis-muted">
                        Shows live audio frequency bars so you can see speech volume levels even before words appear.
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* ACTION FOOTER: RESET & RETURN */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-auralis-border">
                <button
                  type="button"
                  onClick={() => {
                    const defaults = {
                      fontSize: "large",
                      isHighContrast: false,
                      skeletonMode: "full",
                      showAudioWave: true,
                      gestureAlert: true,
                    };
                    setFontSize("large");
                    setIsHighContrast(false);
                    document.documentElement.classList.remove("high-contrast");
                    setSkeletonMode("full");
                    setShowAudioWave(true);
                    setGestureAlert(true);
                    saveAccessibilityPreferences(defaults);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-auralis-border text-xs font-bold text-auralis-muted hover:text-auralis-text hover:bg-auralis-bg transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset All to Defaults</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("classrooms")}
                  className="px-6 py-2.5 rounded-xl bg-auralis-accent hover:bg-auralis-accent-hover text-white text-xs font-bold shadow-tactile transition-all"
                >
                  Return to Classrooms
                </button>
              </div>
            </div>
          )}

          {/* TAB 2 & 3: CLASSROOMS & JOIN */}
          {activeTab !== "accessibility" && activeTab !== "profile" && (
            <>
              <div className="p-6 sm:p-8 rounded-2xl bg-white border border-auralis-border shadow-tactile">
                <div className="max-w-2xl">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-auralis-accent mb-1.5">
                    <PlusCircle className="w-4 h-4" />
                    <span>Join New Classroom</span>
                  </div>
                  <h2 className="font-heading font-bold text-xl text-auralis-text mb-2">
                    Enter your instructor&apos;s 6-character classroom code
                  </h2>
                  <p className="text-xs text-auralis-muted leading-relaxed mb-6">
                    Your instructor displays this code on the lecture projection or syllabus (e.g. <code className="font-mono font-bold text-auralis-accent bg-auralis-bg px-1.5 py-0.5 rounded">AURA-842</code>).
                  </p>

                  {joinError && (
                    <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2 mb-4">
                      <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                      <span>{joinError}</span>
                    </div>
                  )}

                  {joinSuccess && (
                    <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 mb-4">
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-auralis-success" />
                      <span>{joinSuccess}</span>
                    </div>
                  )}

                  <form onSubmit={handleJoinClassroom} className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="text"
                      value={joinCode}
                      onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                      placeholder="e.g. AURA-842"
                      maxLength={12}
                      className="flex-1 px-4 py-3 rounded-xl bg-white border border-auralis-border font-mono text-base font-bold text-auralis-text tracking-wider placeholder:text-auralis-muted focus:outline-none focus:ring-2 focus:ring-auralis-accent focus:border-auralis-accent focus:bg-white uppercase transition-colors"
                    />
                    <button
                      type="submit"
                      disabled={isJoining}
                      className="px-6 py-3 rounded-xl bg-auralis-accent hover:bg-auralis-accent-hover text-white font-heading font-bold text-sm shadow-tactile flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                      {isJoining ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-white" />
                          <span>Verifying...</span>
                        </>
                      ) : (
                        <>
                          <span>Join Classroom</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="font-heading font-bold text-xl text-auralis-text">
                      Your Enrolled Classrooms
                    </h2>
                    <p className="text-xs text-auralis-muted">
                      Click on any classroom to view real-time captions or study past lecture transcripts.
                    </p>
                  </div>
                  <span className="text-xs font-mono font-semibold bg-white border border-auralis-border px-2.5 py-1 rounded-md text-auralis-muted">
                    {classrooms.length} Enrolled
                  </span>
                </div>

                {classrooms.length === 0 ? (
                  <div className="p-10 text-center rounded-2xl bg-white border border-dashed border-auralis-border space-y-3">
                    <BookOpen className="w-10 h-10 text-auralis-muted mx-auto" />
                    <h3 className="font-heading font-bold text-base text-auralis-text">
                      No classrooms joined yet
                    </h3>
                    <p className="text-xs text-auralis-muted max-w-sm mx-auto">
                      Ask your teacher for their classroom code and enter it above to start participating.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {classrooms.map((cls) => {
                      const isLive = cls.lectures && cls.lectures.length > 0 && cls.lectures[0].status === "LIVE";
                      return (
                        <div
                          key={cls.id}
                          className="p-6 rounded-2xl bg-white border border-auralis-border hover:border-auralis-accent/60 transition-all shadow-tactile flex flex-col justify-between space-y-5"
                        >
                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-xs font-mono font-semibold text-auralis-accent bg-auralis-highlight px-2 py-0.5 rounded">
                                {cls.subject}
                              </span>
                              {isLive ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold animate-pulse">
                                  <span className="w-2 h-2 rounded-full bg-auralis-success" />
                                  <span>LIVE NOW</span>
                                </span>
                              ) : (
                                <span className="text-[11px] font-mono text-auralis-muted">
                                  Code: {cls.code}
                                </span>
                              )}
                            </div>

                            <h3 className="font-heading font-bold text-lg text-auralis-text">
                              {cls.name}
                            </h3>
                            {cls.description && (
                              <p className="text-xs text-auralis-muted mt-1 line-clamp-2">
                                {cls.description}
                              </p>
                            )}

                            <div className="mt-4 pt-3 border-t border-auralis-border/60 text-xs text-auralis-muted">
                              Instructor: <span className="font-semibold text-auralis-text">{cls.teacher?.name || "Faculty"}</span>
                            </div>
                          </div>

                          <Link
                            href={`/classroom/${cls.id}?role=student`}
                            className={`w-full py-3 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-all shadow-tactile ${
                              isLive
                                ? "bg-auralis-accent text-white hover:bg-auralis-accent-hover"
                                : "bg-auralis-bg hover:bg-auralis-surface border border-auralis-border text-auralis-text"
                            }`}
                          >
                            <Radio className="w-4 h-4" />
                            <span>{isLive ? "Join Live Caption Stream" : "Open Classroom Workspace"}</span>
                          </Link>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}

          {/* TAB 4: ACCOUNT & PROFILE SETTINGS */}
          {activeTab === "profile" && (
            <div className="space-y-8 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-heading font-bold text-2xl text-auralis-text">
                    Account &amp; Security Profile
                  </h2>
                  <p className="text-xs text-auralis-muted mt-1">
                    Manage your personal student details and update your login password.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab("classrooms")}
                  className="px-4 py-2 rounded-xl bg-auralis-bg hover:bg-auralis-surface border border-auralis-border text-xs font-bold text-auralis-text transition-colors self-start sm:self-auto"
                >
                  Back to Classrooms
                </button>
              </div>

              {/* OVERVIEW STATS */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl bg-white border border-auralis-border shadow-tactile">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-auralis-muted block">
                    Student Account
                  </span>
                  <div className="text-base font-bold text-auralis-text mt-1">{user?.name}</div>
                  <span className="text-xs text-auralis-muted block mt-0.5 truncate">{user?.email}</span>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-auralis-border shadow-tactile">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-auralis-muted block">
                    Access Tier
                  </span>
                  <span className="inline-block mt-2 text-xs font-bold font-mono px-2.5 py-0.5 rounded bg-auralis-highlight text-auralis-accent border border-auralis-secondary/40">
                    ENROLLED STUDENT
                  </span>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-auralis-border shadow-tactile">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-auralis-muted block">
                    Enrolled Courses
                  </span>
                  <div className="text-2xl font-extrabold text-auralis-text mt-1">{classrooms.length}</div>
                </div>
              </div>

              {/* PROFILE EDIT FORM */}
              <div className="p-6 sm:p-8 rounded-2xl bg-white border border-auralis-border shadow-tactile max-w-2xl">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-auralis-accent mb-4">
                  <Edit3 className="w-4 h-4" />
                  <span>Update Account Information</span>
                </div>

                {profileError && (
                  <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <span>{profileError}</span>
                  </div>
                )}

                {profileSuccess && (
                  <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{profileSuccess}</span>
                  </div>
                )}

                <form onSubmit={handleProfileSubmit} className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-auralis-text mb-1.5">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      placeholder="Your full name"
                      className="w-full px-4 py-2.5 rounded-xl bg-white border border-auralis-border text-sm text-auralis-text focus:outline-none focus:ring-2 focus:ring-auralis-accent"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-auralis-text mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={profileEmail}
                      onChange={(e) => setProfileEmail(e.target.value)}
                      placeholder="student@university.edu"
                      className="w-full px-4 py-2.5 rounded-xl bg-white border border-auralis-border text-sm text-auralis-text focus:outline-none focus:ring-2 focus:ring-auralis-accent"
                    />
                  </div>

                  <div className="pt-4 border-t border-auralis-border">
                    <span className="text-xs font-bold text-auralis-text block mb-1">
                      Change Password (Optional)
                    </span>
                    <p className="text-[11px] text-auralis-muted mb-4">
                      Leave these fields blank if you do not want to change your current password.
                    </p>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-[11px] font-semibold text-auralis-muted mb-1">
                          Current Password
                        </label>
                        <div className="relative">
                          <Lock className="w-3.5 h-3.5 text-auralis-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                          <input
                            type={showCurrentPassword ? "text" : "password"}
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            placeholder="Enter current password to authorize changes"
                            className="w-full pl-9 pr-10 py-2 rounded-xl bg-white border border-auralis-border text-sm text-auralis-text focus:outline-none focus:ring-2 focus:ring-auralis-accent"
                          />
                          <button
                            type="button"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-auralis-muted hover:text-auralis-text"
                          >
                            {showCurrentPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-auralis-muted mb-1">
                          New Password
                        </label>
                        <div className="relative">
                          <Lock className="w-3.5 h-3.5 text-auralis-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                          <input
                            type={showNewPassword ? "text" : "password"}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="At least 8 characters"
                            className="w-full pl-9 pr-10 py-2 rounded-xl bg-white border border-auralis-border text-sm text-auralis-text focus:outline-none focus:ring-2 focus:ring-auralis-accent"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-auralis-muted hover:text-auralis-text"
                          >
                            {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-auralis-muted mb-1">
                          Confirm New Password
                        </label>
                        <div className="relative">
                          <Lock className="w-3.5 h-3.5 text-auralis-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                          <input
                            type="password"
                            value={confirmNewPassword}
                            onChange={(e) => setConfirmNewPassword(e.target.value)}
                            placeholder="Re-enter new password"
                            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white border border-auralis-border text-sm text-auralis-text focus:outline-none focus:ring-2 focus:ring-auralis-accent"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-auralis-border flex items-center justify-end gap-3">
                    <button
                      type="submit"
                      disabled={profileLoading}
                      className="px-6 py-2.5 rounded-xl bg-auralis-accent hover:bg-auralis-accent-hover text-white text-xs font-bold shadow-tactile flex items-center gap-2 cursor-pointer"
                    >
                      {profileLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Saving Changes...</span>
                        </>
                      ) : (
                        <span>Save Profile Changes</span>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
