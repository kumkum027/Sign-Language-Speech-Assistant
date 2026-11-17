"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  GraduationCap,
  Radio,
  History,
  Settings,
  LogOut,
  Plus,
  Users,
  BookOpen,
  Copy,
  Check,
  Play,
  Loader2,
  AlertCircle,
  X,
  Search,
  CheckCircle2,
  Mic,
  Video,
  Sliders,
  Sparkles,
  ShieldCheck,
  Globe,
  RotateCcw,
  Edit3,
  Lock,
  Eye,
  EyeOff,
  Sun,
  Moon,
} from "lucide-react";

export default function TeacherDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [user, setUser] = useState(null);
  const [classrooms, setClassrooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(null);

  // Modal State for Create Classroom
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createSubject, setCreateSubject] = useState("");
  const [createDesc, setCreateDesc] = useState("");
  const [createSemester, setCreateSemester] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState(null);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  // Profile Edit State
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
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

  const openProfileModal = () => {
    if (user) {
      setProfileName(user.name || "");
      setProfileEmail(user.email || "");
    }
    setCurrentPassword("");
    setNewPassword("");
    setConfirmNewPassword("");
    setProfileError("");
    setProfileSuccess("");
    setIsProfileModalOpen(true);
  };

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
      setProfileSuccess("Profile updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      setTimeout(() => {
        setIsProfileModalOpen(false);
        setProfileSuccess("");
      }, 1500);
    } catch (err) {
      setProfileError(err.message || "An error occurred.");
    } finally {
      setProfileLoading(false);
    }
  };

  // Settings & Filter State
  const [classroomsSearch, setClassroomsSearch] = useState("");
  const [speechLanguage, setSpeechLanguage] = useState("en-IN");
  const [gestureThreshold, setGestureThreshold] = useState(80);
  const [autoArchive, setAutoArchive] = useState(true);
  const [allowStudentGestures, setAllowStudentGestures] = useState(true);
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [saveToast, setSaveToast] = useState(false);

  // Load saved instructor preferences on mount
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

      const saved = localStorage.getItem("auralis_instructor_settings");
      if (saved) {
        const pref = JSON.parse(saved);
        if (pref.speechLanguage) setSpeechLanguage(pref.speechLanguage);
        if (pref.gestureThreshold) setGestureThreshold(pref.gestureThreshold);
        if (typeof pref.autoArchive === "boolean") setAutoArchive(pref.autoArchive);
        if (typeof pref.allowStudentGestures === "boolean") setAllowStudentGestures(pref.allowStudentGestures);
        if (typeof pref.isHighContrast === "boolean") {
          setIsHighContrast(pref.isHighContrast);
          if (pref.isHighContrast) {
            document.documentElement.classList.add("high-contrast", "dark");
          }
        }
      }
    } catch (e) {
      // ignore
    }
    fetchSessionAndClassrooms();
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
    saveSettings({ isHighContrast: next });
  };

  const saveSettings = (updates = {}) => {
    const updated = {
      speechLanguage,
      gestureThreshold,
      autoArchive,
      allowStudentGestures,
      ...updates,
    };
    try {
      localStorage.setItem("auralis_instructor_settings", JSON.stringify(updated));
      setSaveToast(true);
      setTimeout(() => setSaveToast(false), 2500);
    } catch (e) {
      // ignore
    }
  };

  const fetchSessionAndClassrooms = async () => {
    try {
      const userRes = await fetch("/api/auth/me");
      if (!userRes.ok) {
        router.push("/login");
        return;
      }
      const userData = await userRes.json();

      if (userData.user.role === "STUDENT") {
        router.push("/student/dashboard");
        return;
      }
      setUser(userData.user);

      const classRes = await fetch("/api/classrooms");
      if (classRes.ok) {
        const classData = await classRes.json();
        setClassrooms(classData.classrooms || []);
      }
    } catch (err) {
      console.error("Dashboard Load Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
    } catch (e) {
      router.push("/login");
    }
  };

  const handleCreateClassroom = async (e) => {
    e.preventDefault();
    if (!createName.trim() || !createSubject.trim()) {
      setModalError("Classroom name and subject are required.");
      return;
    }

    setIsSubmitting(true);
    setModalError(null);

    try {
      const res = await fetch("/api/classrooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: createName.trim(),
          subject: createSubject.trim(),
          description: createDesc.trim() || undefined,
          semester: createSemester.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        const firstFieldErr = data.details
          ? Object.values(data.details).flat()[0]
          : null;
        setModalError(firstFieldErr || data.error || "Failed to create classroom");
        setIsSubmitting(false);
        return;
      }

      setClassrooms([data.classroom, ...classrooms]);
      setIsModalOpen(false);
      setCreateName("");
      setCreateSubject("");
      setCreateDesc("");
      setCreateSemester("");
    } catch (err) {
      setModalError("Network error while creating classroom.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalStudents = classrooms.reduce((acc, c) => acc + (c._count?.members || 0), 0);
  const totalLectures = classrooms.reduce((acc, c) => acc + (c._count?.lectures || 0), 0);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-auralis-bg">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-auralis-accent" />
          <span className="text-xs font-semibold text-auralis-muted uppercase tracking-wider">
            Loading Instructor Workspace...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen flex flex-col md:flex-row transition-colors ${
        isHighContrast ? "bg-[#0A100F] text-white" : "bg-auralis-bg text-auralis-text"
      }`}
    >
      <aside className="w-full md:w-64 bg-white border-r border-auralis-border flex flex-col justify-between shrink-0">
        <div>
          <div className="p-6 border-b border-auralis-border">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-auralis-dark text-white flex items-center justify-center font-bold text-base shadow-tactile border border-auralis-accent/30">
                <span className="text-auralis-secondary font-heading">A</span>
              </div>
              <div className="flex flex-col">
                <span className="font-heading font-extrabold text-lg text-auralis-text leading-none">
                  AURALIS
                </span>
                <span className="text-[10px] font-semibold text-auralis-accent uppercase tracking-wider mt-1">
                  Instructor Suite
                </span>
              </div>
            </Link>
          </div>

          <nav className="p-4 space-y-1">
            <button
              onClick={() => setActiveTab("overview")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === "overview"
                  ? "bg-auralis-highlight text-auralis-accent shadow-tactile font-bold"
                  : "text-auralis-muted hover:text-auralis-text hover:bg-auralis-bg"
              }`}
            >
              <LayoutDashboard className="w-4 h-4 shrink-0" />
              <span>Overview</span>
            </button>

            <button
              onClick={() => setActiveTab("classrooms")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === "classrooms"
                  ? "bg-auralis-highlight text-auralis-accent shadow-tactile font-bold"
                  : "text-auralis-muted hover:text-auralis-text hover:bg-auralis-bg"
              }`}
            >
              <GraduationCap className="w-4 h-4 shrink-0" />
              <span>My Classrooms</span>
            </button>

            <button
              onClick={() => setActiveTab("sessions")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === "sessions"
                  ? "bg-auralis-highlight text-auralis-accent shadow-tactile font-bold"
                  : "text-auralis-muted hover:text-auralis-text hover:bg-auralis-bg"
              }`}
            >
              <Radio className="w-4 h-4 shrink-0" />
              <span>Live Sessions</span>
            </button>

            <Link
              href="/lectures"
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-auralis-muted hover:text-auralis-text hover:bg-auralis-bg transition-all"
            >
              <History className="w-4 h-4 shrink-0" />
              <span>Lecture History</span>
            </Link>

            <button
              onClick={() => setActiveTab("settings")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === "settings"
                  ? "bg-auralis-highlight text-auralis-accent shadow-tactile font-bold"
                  : "text-auralis-muted hover:text-auralis-text hover:bg-auralis-bg"
              }`}
            >
              <Settings className="w-4 h-4 shrink-0" />
              <span>Settings</span>
            </button>
          </nav>
        </div>

        <div className="p-4 border-t border-auralis-border space-y-3">
          <div className="p-3 rounded-xl bg-auralis-bg border border-auralis-border flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-auralis-accent text-white flex items-center justify-center font-bold text-xs uppercase shrink-0">
                {user?.name?.slice(0, 2) || "TR"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-auralis-text truncate">{user?.name}</div>
                <div className="text-[10px] text-auralis-muted truncate">{user?.email}</div>
              </div>
            </div>
            <button
              onClick={openProfileModal}
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
        <div className="max-w-6xl mx-auto space-y-10">
          {/* ========================================================= */}
          {/* TAB 1: OVERVIEW */}
          {/* ========================================================= */}
          {activeTab === "overview" && (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-auralis-border">
                <div>
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-auralis-accent bg-auralis-highlight px-3 py-1 rounded-full border border-auralis-secondary/60">
                    Instructor Workspace
                  </span>
                  <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-auralis-text tracking-tight mt-3">
                    {getGreeting()}, {user?.name}
                  </h1>
                  <p className="text-sm text-auralis-muted mt-1">
                    Your classroom is ready for more inclusive learning.
                  </p>
                </div>

                <div className="flex items-center gap-3 self-start sm:self-auto flex-wrap">
                  <button
                    type="button"
                    onClick={toggleContrast}
                    className="inline-flex items-center gap-2 px-4 py-3 rounded-xl border border-auralis-border bg-white text-xs font-bold text-auralis-text hover:bg-auralis-bg transition-colors shadow-tactile cursor-pointer"
                    title="Toggle Night Mode / High Contrast"
                  >
                    {isHighContrast ? (
                      <>
                        <Sun className="w-4 h-4 text-auralis-warning" />
                        <span>Standard Theme</span>
                      </>
                    ) : (
                      <>
                        <Moon className="w-4 h-4 text-auralis-accent" />
                        <span>Night Mode</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="inline-flex items-center gap-2.5 px-5 py-3.5 rounded-xl bg-auralis-accent hover:bg-auralis-accent-hover text-white font-heading font-bold text-sm transition-all shadow-tactile hover:shadow shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-auralis-accent cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create New Classroom</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
                <div className="md:col-span-6 rounded-2xl bg-auralis-dark text-white p-7 flex flex-col justify-between shadow-float relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-auralis-accent/20 rounded-full blur-2xl pointer-events-none" />

                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-mono font-bold uppercase tracking-wider text-auralis-secondary">
                        Active Teaching Workspaces
                      </span>
                      <GraduationCap className="w-5 h-5 text-auralis-secondary" />
                    </div>
                    <div className="font-heading font-extrabold text-5xl text-white tracking-tight">
                      {classrooms.length}
                    </div>
                    <p className="text-xs text-white/70 mt-2">
                      Active academic classrooms configured with live speech-to-text and ISL gesture classification.
                    </p>
                  </div>

                  <div className="relative z-10 mt-6 pt-4 border-t border-white/15 flex items-center justify-between text-xs">
                    <span className="text-white/60">Room code sharing ready</span>
                    <span className="text-auralis-secondary font-mono font-semibold">100% In-Browser</span>
                  </div>
                </div>

                <div className="md:col-span-3 rounded-2xl bg-white border border-auralis-border p-6 flex flex-col justify-between shadow-tactile">
                  <div>
                    <div className="w-9 h-9 rounded-xl bg-auralis-highlight text-auralis-accent flex items-center justify-center mb-4">
                      <Users className="w-4 h-4" />
                    </div>
                    <div className="text-xs font-semibold text-auralis-muted uppercase tracking-wider">
                      Enrolled Students
                    </div>
                    <div className="font-heading font-extrabold text-3xl text-auralis-text mt-1">
                      {totalStudents}
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-auralis-border text-[11px] text-auralis-muted">
                    Across all your active classrooms.
                  </div>
                </div>

                <div className="md:col-span-3 rounded-2xl bg-white border border-auralis-border p-6 flex flex-col justify-between shadow-tactile">
                  <div>
                    <div className="w-9 h-9 rounded-xl bg-auralis-bg text-auralis-accent flex items-center justify-center mb-4 border border-auralis-border">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <div className="text-xs font-semibold text-auralis-muted uppercase tracking-wider">
                      Lectures Delivered
                    </div>
                    <div className="font-heading font-extrabold text-3xl text-auralis-text mt-1">
                      {totalLectures}
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-auralis-border text-[11px] text-auralis-muted">
                    Archived with searchable transcripts.
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="font-heading font-bold text-xl text-auralis-text">
                      Recent Classrooms
                    </h2>
                    <p className="text-xs text-auralis-muted">
                      Share the joining code with deaf and hearing students to start synchronized lectures.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab("classrooms")}
                    className="text-xs font-bold text-auralis-accent hover:underline"
                  >
                    View All ({classrooms.length}) →
                  </button>
                </div>

                {classrooms.length === 0 ? (
                  <div className="p-12 text-center rounded-2xl bg-white border border-dashed border-auralis-border space-y-4">
                    <div className="w-12 h-12 rounded-xl bg-auralis-highlight text-auralis-accent mx-auto flex items-center justify-center">
                      <GraduationCap className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-base text-auralis-text">
                        No classrooms created yet
                      </h3>
                      <p className="text-xs text-auralis-muted max-w-sm mx-auto mt-1">
                        Create your first classroom to generate a unique invite code and launch live caption broadcasts.
                      </p>
                    </div>
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-auralis-accent text-white text-xs font-bold shadow-tactile"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Create Classroom Now</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {classrooms.slice(0, 4).map((cls) => (
                      <div
                        key={cls.id}
                        className="p-5 rounded-2xl bg-white border border-auralis-border hover:border-auralis-accent/50 transition-all shadow-tactile flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="flex items-start sm:items-center gap-4">
                          <div className="w-11 h-11 rounded-xl bg-auralis-highlight text-auralis-accent flex items-center justify-center font-bold font-heading text-base shrink-0">
                            {cls.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-heading font-bold text-base text-auralis-text">
                                {cls.name}
                              </h3>
                              <span className="text-[11px] font-semibold text-auralis-muted bg-auralis-bg px-2 py-0.5 rounded border border-auralis-border">
                                {cls.subject}
                              </span>
                            </div>
                            {cls.description && (
                              <p className="text-xs text-auralis-muted mt-0.5 line-clamp-1">
                                {cls.description}
                              </p>
                            )}
                            <div className="flex items-center gap-4 mt-2 text-xs text-auralis-muted font-mono">
                              <span>{cls._count?.members || 0} students enrolled</span>
                              <span>•</span>
                              <span>{cls._count?.lectures || 0} lectures recorded</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-auralis-border/60">
                          <button
                            onClick={() => handleCopyCode(cls.code)}
                            className="px-3 py-2 rounded-xl bg-auralis-bg hover:bg-auralis-surface border border-auralis-border flex items-center gap-2 text-xs font-mono font-bold text-auralis-text transition-colors group"
                            title="Click to copy student invite code"
                          >
                            <span className="text-auralis-accent">{cls.code}</span>
                            {copiedCode === cls.code ? (
                              <Check className="w-3.5 h-3.5 text-auralis-success" />
                            ) : (
                              <Copy className="w-3.5 h-3.5 text-auralis-muted group-hover:text-auralis-text" />
                            )}
                          </button>

                          <Link
                            href={`/classroom/${cls.id}?role=teacher`}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-auralis-accent hover:bg-auralis-accent-hover text-white text-xs font-bold transition-all shadow-tactile"
                          >
                            <Play className="w-3.5 h-3.5 fill-white" />
                            <span>Start Lecture</span>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* ========================================================= */}
          {/* TAB 2: MY CLASSROOMS (DEDICATED MANAGER) */}
          {/* ========================================================= */}
          {activeTab === "classrooms" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-auralis-border">
                <div>
                  <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-auralis-text">
                    My Teaching Classrooms
                  </h2>
                  <p className="text-xs text-auralis-muted mt-1">
                    Manage student invite codes, course details, and launch live lecture workspaces.
                  </p>
                </div>

                <button
                  onClick={() => setIsModalOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-auralis-accent hover:bg-auralis-accent-hover text-white font-heading font-bold text-xs shadow-tactile shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Classroom</span>
                </button>
              </div>

              {/* Search & Filter Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-auralis-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={classroomsSearch}
                  onChange={(e) => setClassroomsSearch(e.target.value)}
                  placeholder="Search classrooms by course name, subject, or AURA code..."
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-auralis-border text-sm text-auralis-text placeholder:text-auralis-muted shadow-tactile focus:outline-none focus:ring-2 focus:ring-auralis-accent"
                />
              </div>

              {/* Classrooms List */}
              {classrooms.filter(
                (c) =>
                  !classroomsSearch.trim() ||
                  c.name.toLowerCase().includes(classroomsSearch.toLowerCase()) ||
                  c.subject.toLowerCase().includes(classroomsSearch.toLowerCase()) ||
                  c.code.toLowerCase().includes(classroomsSearch.toLowerCase())
              ).length === 0 ? (
                <div className="p-12 text-center rounded-2xl bg-white border border-dashed border-auralis-border space-y-3">
                  <BookOpen className="w-10 h-10 text-auralis-muted mx-auto" />
                  <h3 className="font-heading font-bold text-base text-auralis-text">
                    No matching classrooms found
                  </h3>
                  <p className="text-xs text-auralis-muted">
                    {classroomsSearch ? "Try adjusting your search keywords." : "Create a classroom to get started."}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {classrooms
                    .filter(
                      (c) =>
                        !classroomsSearch.trim() ||
                        c.name.toLowerCase().includes(classroomsSearch.toLowerCase()) ||
                        c.subject.toLowerCase().includes(classroomsSearch.toLowerCase()) ||
                        c.code.toLowerCase().includes(classroomsSearch.toLowerCase())
                    )
                    .map((cls) => (
                      <div
                        key={cls.id}
                        className="p-6 rounded-2xl bg-white border border-auralis-border hover:border-auralis-accent/50 transition-all shadow-tactile flex flex-col justify-between space-y-5"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-mono font-semibold text-auralis-accent bg-auralis-highlight px-2.5 py-1 rounded">
                              {cls.subject}
                            </span>
                            <button
                              onClick={() => handleCopyCode(cls.code)}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-auralis-bg border border-auralis-border text-xs font-mono font-bold text-auralis-text hover:bg-auralis-surface"
                              title="Click to copy student code"
                            >
                              <span>{cls.code}</span>
                              {copiedCode === cls.code ? (
                                <Check className="w-3 h-3 text-auralis-success" />
                              ) : (
                                <Copy className="w-3 h-3 text-auralis-muted" />
                              )}
                            </button>
                          </div>

                          <h3 className="font-heading font-bold text-lg text-auralis-text">
                            {cls.name}
                          </h3>
                          {cls.description && (
                            <p className="text-xs text-auralis-muted mt-1.5 line-clamp-2">
                              {cls.description}
                            </p>
                          )}

                          <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-auralis-border/60 text-xs font-mono text-auralis-muted">
                            <div>
                              <span className="text-auralis-text font-bold block">{cls._count?.members || 0}</span>
                              <span>Students</span>
                            </div>
                            <div>
                              <span className="text-auralis-text font-bold block">{cls._count?.lectures || 0}</span>
                              <span>Lectures</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 pt-2">
                          <Link
                            href={`/classroom/${cls.id}?role=teacher`}
                            className="flex-1 py-2.5 rounded-xl bg-auralis-accent hover:bg-auralis-accent-hover text-white text-xs font-bold text-center flex items-center justify-center gap-2 shadow-tactile transition-all"
                          >
                            <Play className="w-3.5 h-3.5 fill-white" />
                            <span>Launch Lecture</span>
                          </Link>
                          <Link
                            href="/lectures"
                            className="px-3.5 py-2.5 rounded-xl bg-auralis-bg hover:bg-auralis-surface border border-auralis-border text-xs font-semibold text-auralis-text transition-colors"
                          >
                            Past Lectures
                          </Link>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 3: LIVE SESSIONS (TEACHING HUB) */}
          {/* ========================================================= */}
          {activeTab === "sessions" && (
            <div className="space-y-8">
              <div className="pb-6 border-b border-auralis-border">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-auralis-accent bg-auralis-highlight px-3 py-1 rounded-full border border-auralis-secondary/60">
                  Real-Time Broadcast
                </span>
                <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-auralis-text tracking-tight mt-3">
                  Live Classroom Broadcast Hub
                </h2>
                <p className="text-xs text-auralis-muted mt-1 max-w-xl">
                  Select any course to launch an interactive live lecture with synchronized speech captioning, interim-to-final processing, and student sign recognition.
                </p>
              </div>

              {/* Hardware & AI Engine Telemetry Card */}
              <div className="p-6 rounded-2xl bg-white border border-auralis-border shadow-tactile space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-auralis-accent">
                  <Sparkles className="w-4 h-4" />
                  <span>Hardware &amp; AI Engine Readiness Status</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div className="p-4 rounded-xl bg-auralis-bg border border-auralis-border flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                      <Mic className="w-4 h-4 text-auralis-success" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-auralis-text">Web Speech STT</div>
                      <div className="text-[11px] text-auralis-success font-semibold mt-0.5">Ready ({speechLanguage})</div>
                      <p className="text-[10px] text-auralis-muted mt-1">Interim caption streaming enabled.</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-auralis-bg border border-auralis-border flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                      <Video className="w-4 h-4 text-auralis-success" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-auralis-text">MediaPipe ISL Vision</div>
                      <div className="text-[11px] text-auralis-success font-semibold mt-0.5">Ready (21 3D Landmarks)</div>
                      <p className="text-[10px] text-auralis-muted mt-1">Kinematic gesture classifier active.</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-auralis-bg border border-auralis-border flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                      <Radio className="w-4 h-4 text-auralis-success" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-auralis-text">Classroom Socket</div>
                      <div className="text-[11px] text-auralis-success font-semibold mt-0.5">Broadcasting Ready</div>
                      <p className="text-[10px] text-auralis-muted mt-1">Multi-client classroom sync.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Classroom Launch Cards */}
              <div>
                <h3 className="font-heading font-bold text-lg text-auralis-text mb-3">
                  Choose Classroom to Start Teaching
                </h3>

                {classrooms.length === 0 ? (
                  <div className="p-10 text-center rounded-2xl bg-white border border-dashed border-auralis-border">
                    <p className="text-xs text-auralis-muted">No classrooms available. Create a classroom first to start teaching.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {classrooms.map((cls) => (
                      <div
                        key={cls.id}
                        className="p-5 rounded-2xl bg-white border border-auralis-border hover:border-auralis-accent/50 shadow-tactile flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold text-auralis-accent bg-auralis-highlight px-2 py-0.5 rounded">
                              {cls.code}
                            </span>
                            <h4 className="font-heading font-bold text-base text-auralis-text">
                              {cls.name}
                            </h4>
                          </div>
                          <p className="text-xs text-auralis-muted mt-1">
                            {cls.subject} • {cls._count?.members || 0} students ready to connect
                          </p>
                        </div>

                        <Link
                          href={`/classroom/${cls.id}?role=teacher`}
                          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-auralis-accent hover:bg-auralis-accent-hover text-white text-xs font-bold shadow-tactile transition-all shrink-0"
                        >
                          <Play className="w-4 h-4 fill-white" />
                          <span>Start Live Broadcast Now</span>
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 4: SETTINGS (INSTRUCTOR PREFERENCES) */}
          {/* ========================================================= */}
          {activeTab === "settings" && (
            <div className="space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-auralis-border">
                <div>
                  <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-auralis-text">
                    Instructor Preferences &amp; AI Settings
                  </h2>
                  <p className="text-xs text-auralis-muted mt-1">
                    Configure your preferred lecture speech recognition language, sign gesture sensitivity, and broadcasting defaults.
                  </p>
                </div>

                {saveToast && (
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold animate-pulse shadow-tactile shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-auralis-success" />
                    <span>Settings Saved &amp; Synced</span>
                  </div>
                )}
              </div>

              {/* PROFILE CARD */}
              <div className="p-6 sm:p-8 rounded-2xl bg-white border border-auralis-border shadow-tactile space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-auralis-accent">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Instructor Account Profile</span>
                  </div>
                  <button
                    onClick={openProfileModal}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-auralis-accent hover:bg-auralis-accent-hover text-white text-xs font-heading font-bold shadow-tactile transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Profile &amp; Password</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div className="p-4 rounded-xl bg-auralis-bg border border-auralis-border">
                    <span className="text-[10px] uppercase font-bold text-auralis-muted block">Faculty Name</span>
                    <span className="text-sm font-bold text-auralis-text mt-1 block">{user?.name}</span>
                  </div>
                  <div className="p-4 rounded-xl bg-auralis-bg border border-auralis-border">
                    <span className="text-[10px] uppercase font-bold text-auralis-muted block">Email Address</span>
                    <span className="text-sm font-bold text-auralis-text mt-1 block truncate">{user?.email}</span>
                  </div>
                  <div className="p-4 rounded-xl bg-auralis-bg border border-auralis-border">
                    <span className="text-[10px] uppercase font-bold text-auralis-muted block">Platform Role</span>
                    <span className="text-xs font-bold text-auralis-accent bg-auralis-highlight px-2 py-0.5 rounded inline-block mt-1">
                      FACULTY INSTRUCTOR
                    </span>
                  </div>
                </div>
              </div>

              {/* SPEECH-TO-TEXT LANGUAGE */}
              <div className="p-6 sm:p-8 rounded-2xl bg-white border border-auralis-border shadow-tactile space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-auralis-accent">
                  <Globe className="w-4 h-4" />
                  <span>Primary Spoken Lecture Language</span>
                </div>
                <p className="text-xs text-auralis-muted">
                  The Web Speech engine tunes phonetic models to this language for higher caption accuracy.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
                  {[
                    { code: "en-IN", label: "English (India)", desc: "Optimized for Indian academic accents" },
                    { code: "en-US", label: "English (US)", desc: "Standard international English" },
                    { code: "hi-IN", label: "Hindi (भारत)", desc: "Devanagari script captioning" },
                    { code: "ta-IN", label: "Tamil (தமிழ்)", desc: "Tamil academic speech" },
                    { code: "te-IN", label: "Telugu (తెలుగు)", desc: "Telugu academic speech" },
                  ].map((lang) => (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => {
                        setSpeechLanguage(lang.code);
                        saveSettings({ speechLanguage: lang.code });
                      }}
                      className={`p-4 rounded-xl border text-left transition-all ${
                        speechLanguage === lang.code
                          ? "border-auralis-accent bg-auralis-highlight/60 ring-2 ring-auralis-accent shadow-tactile"
                          : "border-auralis-border bg-white hover:bg-auralis-bg"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-heading font-bold text-sm text-auralis-text">{lang.label}</span>
                        {speechLanguage === lang.code && <Check className="w-4 h-4 text-auralis-accent" />}
                      </div>
                      <span className="text-[10px] font-mono text-auralis-accent font-semibold block">{lang.code}</span>
                      <p className="text-[11px] text-auralis-muted mt-1 leading-normal">{lang.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* ISL GESTURE SENSITIVITY */}
              <div className="p-6 sm:p-8 rounded-2xl bg-white border border-auralis-border shadow-tactile space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-auralis-accent">
                  <Sliders className="w-4 h-4" />
                  <span>Indian Sign Language (ISL) Vision Sensitivity</span>
                </div>
                <p className="text-xs text-auralis-muted">
                  Minimum geometric confidence required before a student or instructor sign is committed to the live caption record.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  {[
                    { val: 70, label: "Fast (70%)", desc: "Faster recognition, tolerates motion blur" },
                    { val: 80, label: "Balanced (80%)", desc: "Recommended balance of speed & precision" },
                    { val: 90, label: "Strict (90%)", desc: "Eliminates false positives in noisy lighting" },
                  ].map((t) => (
                    <button
                      key={t.val}
                      type="button"
                      onClick={() => {
                        setGestureThreshold(t.val);
                        saveSettings({ gestureThreshold: t.val });
                      }}
                      className={`p-4 rounded-xl border text-left transition-all ${
                        gestureThreshold === t.val
                          ? "border-auralis-accent bg-auralis-highlight/60 ring-2 ring-auralis-accent shadow-tactile"
                          : "border-auralis-border bg-white hover:bg-auralis-bg"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-heading font-bold text-sm text-auralis-text">{t.label}</span>
                        {gestureThreshold === t.val && <Check className="w-4 h-4 text-auralis-accent" />}
                      </div>
                      <p className="text-[11px] text-auralis-muted leading-normal">{t.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* BROADCAST & ARCHIVE PREFERENCES */}
              <div className="p-6 sm:p-8 rounded-2xl bg-white border border-auralis-border shadow-tactile space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-auralis-accent">
                  <Radio className="w-4 h-4" />
                  <span>Broadcast &amp; Archival Defaults</span>
                </div>

                <div className="space-y-4 pt-2">
                  <label className="flex items-center gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={autoArchive}
                      onChange={(e) => {
                        const val = e.target.checked;
                        setAutoArchive(val);
                        saveSettings({ autoArchive: val });
                      }}
                      className="w-4 h-4 text-auralis-accent rounded border-auralis-border focus:ring-auralis-accent"
                    />
                    <div>
                      <span className="text-xs font-bold text-auralis-text">Automatic Transcript Archival</span>
                      <p className="text-[11px] text-auralis-muted">
                        Automatically publishes lecture transcripts to enrolled students upon ending a live lecture.
                      </p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={allowStudentGestures}
                      onChange={(e) => {
                        const val = e.target.checked;
                        setAllowStudentGestures(val);
                        saveSettings({ allowStudentGestures: val });
                      }}
                      className="w-4 h-4 text-auralis-accent rounded border-auralis-border focus:ring-auralis-accent"
                    />
                    <div>
                      <span className="text-xs font-bold text-auralis-text">Enable Student Sign Question Broadcast</span>
                      <p className="text-[11px] text-auralis-muted">
                        Allows deaf and hard-of-hearing students to ask questions via sign language from their desks.
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* FOOTER */}
              <div className="flex items-center justify-between pt-4 border-t border-auralis-border">
                <button
                  type="button"
                  onClick={() => {
                    const defaults = {
                      speechLanguage: "en-IN",
                      gestureThreshold: 80,
                      autoArchive: true,
                      allowStudentGestures: true,
                    };
                    setSpeechLanguage("en-IN");
                    setGestureThreshold(80);
                    setAutoArchive(true);
                    setAllowStudentGestures(true);
                    saveSettings(defaults);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-auralis-border text-xs font-bold text-auralis-muted hover:text-auralis-text hover:bg-auralis-bg transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset to Defaults</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("overview")}
                  className="px-6 py-2.5 rounded-xl bg-auralis-accent hover:bg-auralis-accent-hover text-white text-xs font-bold shadow-tactile transition-all"
                >
                  Return to Overview
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-float border border-auralis-border p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-auralis-border">
              <div>
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-auralis-accent">
                  New Workspace
                </span>
                <h3 className="font-heading font-extrabold text-2xl text-auralis-text mt-1">
                  Create Inclusive Classroom
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-auralis-muted hover:text-auralis-text hover:bg-auralis-bg"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleCreateClassroom} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-auralis-text mb-1.5">
                  Classroom Name *
                </label>
                <input
                  type="text"
                  required
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  placeholder="e.g. Wave Mechanics & Optics"
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-auralis-border text-sm text-auralis-text placeholder:text-auralis-muted focus:outline-none focus:ring-2 focus:ring-auralis-accent focus:border-auralis-accent focus:bg-white transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-auralis-text mb-1.5">
                  Subject *
                </label>
                <input
                  type="text"
                  required
                  value={createSubject}
                  onChange={(e) => setCreateSubject(e.target.value)}
                  placeholder="e.g. Physics 301"
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-auralis-border text-sm text-auralis-text placeholder:text-auralis-muted focus:outline-none focus:ring-2 focus:ring-auralis-accent focus:border-auralis-accent focus:bg-white transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-auralis-text mb-1.5">
                  Description (Optional)
                </label>
                <textarea
                  rows={3}
                  value={createDesc}
                  onChange={(e) => setCreateDesc(e.target.value)}
                  placeholder="Topics, syllabus scope, or classroom accessibility notes..."
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-auralis-border text-sm text-auralis-text placeholder:text-auralis-muted focus:outline-none focus:ring-2 focus:ring-auralis-accent focus:border-auralis-accent focus:bg-white transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-auralis-text mb-1.5">
                  Semester / Term (Optional)
                </label>
                <input
                  type="text"
                  value={createSemester}
                  onChange={(e) => setCreateSemester(e.target.value)}
                  placeholder="e.g. Fall 2026 / Semester 5"
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-auralis-border text-sm text-auralis-text placeholder:text-auralis-muted focus:outline-none focus:ring-2 focus:ring-auralis-accent focus:border-auralis-accent focus:bg-white transition-colors"
                />
              </div>

              <div className="pt-4 border-t border-auralis-border flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-auralis-border text-sm font-semibold text-auralis-text hover:bg-auralis-bg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-auralis-accent hover:bg-auralis-accent-hover text-white text-sm font-bold shadow-tactile flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Generating Code...</span>
                    </>
                  ) : (
                    <span>Create Classroom</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* EDIT PROFILE MODAL */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-white rounded-3xl border border-auralis-border shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-auralis-border pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-auralis-highlight text-auralis-accent flex items-center justify-center font-bold">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-lg text-auralis-text leading-tight">
                    Edit Instructor Profile
                  </h3>
                  <p className="text-xs text-auralis-muted">Update your account credentials and security</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsProfileModalOpen(false)}
                className="p-1 rounded-lg text-auralis-muted hover:text-auralis-text hover:bg-auralis-bg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {profileError && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{profileError}</span>
              </div>
            )}

            {profileSuccess && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{profileSuccess}</span>
              </div>
            )}

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-auralis-text mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  placeholder="e.g. Dr. Jane Doe"
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
                  placeholder="instructor@university.edu"
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-auralis-border text-sm text-auralis-text focus:outline-none focus:ring-2 focus:ring-auralis-accent"
                />
              </div>

              <div className="pt-2 border-t border-auralis-border">
                <span className="text-xs font-bold text-auralis-text block mb-1">
                  Change Password (Optional)
                </span>
                <p className="text-[11px] text-auralis-muted mb-3">
                  Leave blank if you do not want to change your current password.
                </p>

                <div className="space-y-3">
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
                        placeholder="Required only to set new password"
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
                  type="button"
                  onClick={() => setIsProfileModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-auralis-border text-sm font-semibold text-auralis-text hover:bg-auralis-bg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={profileLoading}
                  className="px-5 py-2.5 rounded-xl bg-auralis-accent hover:bg-auralis-accent-hover text-white text-sm font-bold shadow-tactile flex items-center gap-2"
                >
                  {profileLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving Profile...</span>
                    </>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
