"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  Loader2,
  AlertCircle,
  Video,
  VideoOff,
  GraduationCap,
  Clock,
  Download,
  ArrowRight,
  CheckCircle2,
  GripHorizontal,
} from "lucide-react";

import LiveHeader from "@/components/classroom/LiveHeader";
import CaptionView from "@/components/classroom/CaptionView";
import SidePanel from "@/components/classroom/SidePanel";
import TeacherControls from "@/components/classroom/TeacherControls";
import StudentControls from "@/components/classroom/StudentControls";
import LivePollModal from "@/components/classroom/LivePollModal";
import StudentDoubtModal from "@/components/classroom/StudentDoubtModal";
import TeacherDoubtAlert from "@/components/classroom/TeacherDoubtAlert";

import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useClassroomSocket } from "@/hooks/useClassroomSocket";
import { useGestureRecognition } from "@/hooks/useGestureRecognition";

export default function LiveClassroomPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const classroomId = params?.id;
  const urlRole = searchParams.get("role");

  // User & Classroom State
  const [user, setUser] = useState(null);
  const [classroom, setClassroom] = useState(null);
  const [currentLecture, setCurrentLecture] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState(null);

  // Live Session State
  const [lectureStatus, setLectureStatus] = useState("SCHEDULED"); // SCHEDULED | LIVE | PAUSED | COMPLETED
  const [duration, setDuration] = useState(0);
  const [transcripts, setTranscripts] = useState([]);
  const [interimText, setInterimText] = useState("");
  const [activeSign, setActiveSign] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [manualCaption, setManualCaption] = useState("");

  // Class Concluded & Student Auto-Close State
  const [isClassConcluded, setIsClassConcluded] = useState(false);
  const [autoRedirectCountdown, setAutoRedirectCountdown] = useState(5);

  // Live In-Class Interactive Polls State
  const [isPollModalOpen, setIsPollModalOpen] = useState(false);
  const [activePoll, setActivePoll] = useState(null);
  const [userVotedOptionIndex, setUserVotedOptionIndex] = useState(null);

  // Student Doubt & Hand Raising State
  const [isDoubtModalOpen, setIsDoubtModalOpen] = useState(false);
  const [isDoubtPending, setIsDoubtPending] = useState(false);
  const [pendingDoubts, setPendingDoubts] = useState([]);
  const [doubtAcknowledgedToast, setDoubtAcknowledgedToast] = useState(null);

  const isTeacher = user?.role === "TEACHER" || classroom?.teacherId === user?.id || urlRole === "teacher";

  const currentLectureRef = useRef(null);
  useEffect(() => {
    currentLectureRef.current = currentLecture;
  }, [currentLecture]);

  // Accessibility & UX State
  const [fontSize, setFontSize] = useState("large"); // standard | large | xlarge
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [speechLanguage, setSpeechLanguage] = useState("en-US");
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const cameraStreamRef = useRef(null);

  // Draggable & Movable Floating Camera Window State
  const [cameraPosition, setCameraPosition] = useState({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ startX: 0, startY: 0, initialX: 0, initialY: 0 });

  useEffect(() => {
    if (isCameraActive && typeof window !== "undefined") {
      setCameraPosition((prev) => {
        // If not positioned yet, dock in bottom right corner
        if (prev.x === 0 && prev.y === 0) {
          return {
            x: Math.max(16, window.innerWidth - 310),
            y: Math.max(80, window.innerHeight - 250),
          };
        }
        return prev;
      });
    }
  }, [isCameraActive]);

  const handleCameraDragStart = (e) => {
    if (e.type === "mousedown" && e.button !== 0) return;

    isDraggingRef.current = true;
    const clientX = e.type === "touchstart" ? e.touches[0].clientX : e.clientX;
    const clientY = e.type === "touchstart" ? e.touches[0].clientY : e.clientY;

    dragStartRef.current = {
      startX: clientX,
      startY: clientY,
      initialX: cameraPosition.x,
      initialY: cameraPosition.y,
    };

    const handleDragMove = (moveEvent) => {
      if (!isDraggingRef.current) return;
      const currentX = moveEvent.type === "touchmove" ? moveEvent.touches[0].clientX : moveEvent.clientX;
      const currentY = moveEvent.type === "touchmove" ? moveEvent.touches[0].clientY : moveEvent.clientY;

      const deltaX = currentX - dragStartRef.current.startX;
      const deltaY = currentY - dragStartRef.current.startY;

      const newX = dragStartRef.current.initialX + deltaX;
      const newY = dragStartRef.current.initialY + deltaY;

      // Keep inside visible window viewport bounds
      const maxX = Math.max(0, window.innerWidth - 300);
      const maxY = Math.max(0, window.innerHeight - 240);

      const boundedX = Math.min(Math.max(10, newX), maxX);
      const boundedY = Math.min(Math.max(10, newY), maxY);

      setCameraPosition({ x: boundedX, y: boundedY });
    };

    const handleDragEnd = () => {
      isDraggingRef.current = false;
      window.removeEventListener("mousemove", handleDragMove);
      window.removeEventListener("mouseup", handleDragEnd);
      window.removeEventListener("touchmove", handleDragMove);
      window.removeEventListener("touchend", handleDragEnd);
    };

    window.addEventListener("mousemove", handleDragMove);
    window.addEventListener("mouseup", handleDragEnd);
    window.addEventListener("touchmove", handleDragMove);
    window.addEventListener("touchend", handleDragEnd);
  };

  // Toggle Contrast / Night Mode handler
  const handleToggleContrast = () => {
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
    try {
      const saved = localStorage.getItem("auralis_student_accessibility");
      const pref = saved ? JSON.parse(saved) : {};
      pref.isHighContrast = next;
      localStorage.setItem("auralis_student_accessibility", JSON.stringify(pref));
    } catch (e) {}
  };

  // Hydrate accessibility preferences from Student Dashboard & Instructor Settings
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem("auralis_theme");
      let shouldDark = savedTheme === "dark";

      const saved = localStorage.getItem("auralis_student_accessibility");
      if (saved) {
        const pref = JSON.parse(saved);
        if (pref.fontSize) setFontSize(pref.fontSize);
        if (typeof pref.isHighContrast === "boolean") {
          if (pref.isHighContrast) shouldDark = true;
        }
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

    try {
      const savedTeacher = localStorage.getItem("auralis_instructor_settings");
      if (savedTeacher) {
        const teacherPref = JSON.parse(savedTeacher);
        if (teacherPref.speechLanguage) setSpeechLanguage(teacherPref.speechLanguage);
      }
    } catch (e) {
      // ignore
    }
  }, []);

  // 1. Initial User & Classroom Authentication & Data Loading
  useEffect(() => {
    async function loadClassroomAndSession() {
      try {
        setIsLoading(true);
        setPageError(null);

        // Fetch user
        const meRes = await fetch("/api/auth/me");
        if (!meRes.ok) {
          router.push(`/login?redirect=/classroom/${classroomId}`);
          return;
        }
        const meData = await meRes.json();
        setUser(meData.user);

        // Fetch classroom details
        const classRes = await fetch(`/api/classrooms/${classroomId}`);
        if (!classRes.ok) {
          const classErr = await classRes.json();
          setPageError(classErr.error || "Failed to load classroom details");
          setIsLoading(false);
          return;
        }
        const classData = await classRes.json();
        setClassroom(classData.classroom);

        // Fetch active or most recent lecture for this classroom
        const lecRes = await fetch(`/api/lectures?classroomId=${classroomId}`);
        if (lecRes.ok) {
          const lecData = await lecRes.json();
          const active = lecData.lectures?.find((l) => l.status === "LIVE" || l.status === "SCHEDULED");
          if (active) {
            setCurrentLecture(active);
            currentLectureRef.current = active;
            setLectureStatus(active.status);

            // Hydrate past transcripts for this lecture
            const trRes = await fetch(`/api/lectures/${active.id}/transcripts`);
            if (trRes.ok) {
              const trData = await trRes.json();
              setTranscripts(trData.transcripts || []);
            }
          }
        }
      } catch (err) {
        console.error("Initialization error:", err);
        setPageError("Failed to initialize classroom workspace.");
      } finally {
        setIsLoading(false);
      }
    }

    if (classroomId) {
      loadClassroomAndSession();
    }
  }, [classroomId, router]);

  // Duration Timer
  useEffect(() => {
    let interval = null;
    if (lectureStatus === "LIVE") {
      interval = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [lectureStatus]);

  // Socket callbacks
  const handleSocketInterimCaption = useCallback((data) => {
    setInterimText(data?.text || "");
  }, []);

  const handleSocketFinalCaption = useCallback((incomingTranscript) => {
    if (!incomingTranscript) return;
    setTranscripts((prev) => {
      // Avoid duplicates
      if (prev.some((t) => t.id === incomingTranscript.id)) return prev;
      return [...prev, incomingTranscript];
    });
    setInterimText("");
  }, []);

  const handleSocketSignDetected = useCallback((data) => {
    setActiveSign(data);
    setTimeout(() => {
      setActiveSign((cur) => (cur?.timestamp === data?.timestamp ? null : cur));
    }, 4000);
  }, []);

  const handleSocketLectureStatusChange = useCallback(
    ({ status, lectureId }) => {
      if (status) {
        setLectureStatus(status);
        if (status === "COMPLETED") {
          const isCurrentTeacher = user?.role === "TEACHER" || classroom?.teacherId === user?.id || urlRole === "teacher";
          if (!isCurrentTeacher) {
            setIsClassConcluded(true);
            stopCamera();
          }
        }
      }
      if (lectureId) {
        setCurrentLecture((prev) => (prev?.id === lectureId ? prev : { id: lectureId, status }));
        currentLectureRef.current = { id: lectureId, status };
      }
    },
    [user?.role, classroom?.teacherId, urlRole]
  );

  // Student Doubt Socket Listeners
  const handleSocketStudentDoubtRaised = useCallback(
    (doubtData) => {
      if (isTeacher) {
        setPendingDoubts((prev) => [...prev, doubtData]);
      }
      const doubtTranscript = {
        id: `doubt-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        text: `✋ [Doubt / Question from ${doubtData.studentName}]: "${doubtData.question || doubtData.gesture}"`,
        source: "SIGN_LANGUAGE",
        confidence: 1.0,
        timestamp: doubtData.timestamp || new Date().toISOString(),
        speaker: { name: doubtData.studentName },
      };
      setTranscripts((prev) => [...prev, doubtTranscript]);
    },
    [isTeacher]
  );

  const handleSocketStudentDoubtAcknowledged = useCallback(
    (data) => {
      if (data?.studentId === user?.id) {
        setIsDoubtPending(false);
        setDoubtAcknowledgedToast("Instructor acknowledged your doubt! You have the floor.");
        setTimeout(() => setDoubtAcknowledgedToast(null), 5000);
      }
      setPendingDoubts((prev) => prev.filter((d) => d.studentId !== data.studentId));

      const ackTranscript = {
        id: `ack-${Date.now()}`,
        text: `✅ [Instructor Acknowledged Doubt]: Giving floor to ${data.studentName || "Student"}.`,
        source: "SPEECH",
        confidence: 1.0,
        timestamp: new Date().toISOString(),
        speaker: { name: "Instructor" },
      };
      setTranscripts((prev) => [...prev, ackTranscript]);
    },
    [user?.id]
  );

  // Live Poll Socket Listeners
  const handleSocketPollLaunch = useCallback((pollData) => {
    setActivePoll({
      ...pollData,
      votes: pollData.options.map(() => ({ count: 0 })),
      isEnded: false,
    });
    setUserVotedOptionIndex(null);
    setIsPollModalOpen(true);
  }, []);

  const handleSocketPollVoteUpdate = useCallback((voteData) => {
    setActivePoll((current) => {
      if (!current) return current;
      const updatedVotes = (current.votes || current.options.map(() => ({ count: 0 }))).map((v, idx) => {
        if (idx === voteData.optionIndex) {
          return { ...v, count: (v.count || 0) + 1 };
        }
        return v;
      });
      return { ...current, votes: updatedVotes };
    });
  }, []);

  const handleSocketPollEnd = useCallback((data) => {
    setActivePoll((current) => {
      if (!current) return null;
      return { ...current, isEnded: true };
    });
  }, []);

  // Auto-redirect countdown when class is concluded for student
  useEffect(() => {
    let timer = null;
    if (isClassConcluded) {
      if (autoRedirectCountdown > 0) {
        timer = setTimeout(() => {
          setAutoRedirectCountdown((prev) => prev - 1);
        }, 1000);
      } else {
        router.push("/student/dashboard");
      }
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isClassConcluded, autoRedirectCountdown, router]);

  // Download transcript summary helper
  const handleDownloadTranscript = () => {
    if (transcripts.length === 0) return;

    let content = `AURALIS LECTURE TRANSCRIPT\n`;
    content += `Classroom: ${classroom?.name || "Classroom"}\n`;
    content += `Generated: ${new Date().toLocaleString()}\n`;
    content += `Total Entries: ${transcripts.length}\n`;
    content += `====================================================\n\n`;

    transcripts.forEach((t) => {
      const time = t.timestamp ? new Date(t.timestamp).toLocaleTimeString() : "";
      const source = t.source === "SIGN_LANGUAGE" ? "[SIGN]" : "[SPEECH]";
      const speaker = t.speaker?.name ? `${t.speaker.name}: ` : "";
      content += `[${time}] ${source} ${speaker}${t.text}\n\n`;
    });

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Auralis-${classroom?.name || "Lecture"}-Transcript-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Initialize Socket connection
  const {
    connectionStatus,
    participantCount,
    sendInterimCaption,
    sendFinalCaption,
    sendSignGesture,
    updateLectureStatus,
    raiseStudentDoubt,
    acknowledgeStudentDoubt,
    launchLivePoll,
    submitPollVote,
    endLivePoll,
  } = useClassroomSocket({
    classroomId,
    lectureId: currentLecture?.id,
    user,
    onInterimCaption: handleSocketInterimCaption,
    onFinalCaption: handleSocketFinalCaption,
    onSignDetected: handleSocketSignDetected,
    onLectureStatusChange: handleSocketLectureStatusChange,
    onStudentDoubtRaised: handleSocketStudentDoubtRaised,
    onStudentDoubtAcknowledged: handleSocketStudentDoubtAcknowledged,
    onPollLaunch: handleSocketPollLaunch,
    onPollVoteUpdate: handleSocketPollVoteUpdate,
    onPollEnd: handleSocketPollEnd,
  });

  // Speech Recognition Final Transcript Handler
  const handleFinalTranscript = useCallback(
    async (finalEntry) => {
      if (!finalEntry?.text) return;

      const transcriptId = `tr-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
      const displayTranscript = {
        id: transcriptId,
        text: finalEntry.text,
        source: finalEntry.source || "SPEECH",
        confidence: finalEntry.confidence || 0.95,
        timestamp: finalEntry.timestamp || new Date().toISOString(),
        speaker: {
          id: user?.id,
          name: user?.name || classroom?.teacher?.name || "Instructor",
        },
      };

      // 1. Instantly display on teacher's own screen
      setTranscripts((prev) => [...prev, displayTranscript]);
      setInterimText("");

      // 2. Instantly broadcast to all students via Socket
      sendFinalCaption(displayTranscript);
      sendInterimCaption("", "SPEECH");

      // 3. Persist in background if active lecture is present
      const activeLec = currentLectureRef.current || currentLecture;
      if (activeLec?.id) {
        try {
          const res = await fetch("/api/transcripts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              lectureId: activeLec.id,
              text: finalEntry.text,
              source: finalEntry.source || "SPEECH",
              confidence: finalEntry.confidence || 0.95,
            }),
          });

          if (res.ok) {
            const data = await res.json();
            // Sync with DB ID
            setTranscripts((prev) =>
              prev.map((t) => (t.id === transcriptId ? data.transcript : t))
            );
          }
        } catch (err) {
          console.warn("Background transcript save warning:", err);
        }
      }
    },
    [user?.id, user?.name, classroom?.teacher?.name, currentLecture, sendFinalCaption, sendInterimCaption]
  );

  // Speech Recognition Interim Transcript Handler
  const handleInterimTranscript = useCallback(
    (interim) => {
      // 1. Immediately show typing words on instructor screen
      setInterimText(interim);
      // 2. Immediately stream typing words to student screen
      sendInterimCaption(interim, "SPEECH");
    },
    [sendInterimCaption]
  );

  // Initialize Web Speech Hook
  const {
    isListening,
    micLevel,
    isSpeaking,
    error: speechError,
    startListening,
    stopListening,
  } = useSpeechRecognition({
    language: speechLanguage,
    onFinalTranscript: handleFinalTranscript,
    onInterimTranscript: handleInterimTranscript,
  });

  // Computer Vision Gesture Detected Handler
  const handleGestureDetected = useCallback(
    async (stabilized) => {
      const signLabel = stabilized.label || stabilized.gesture;

      // 1. Show local sign alert toast
      setActiveSign({
        gesture: signLabel,
        confidence: stabilized.confidence,
        timestamp: stabilized.timestamp,
      });

      // Clear toast after 4s
      setTimeout(() => {
        setActiveSign((cur) => (cur?.timestamp === stabilized.timestamp ? null : cur));
      }, 4000);

      // 2. Broadcast gesture alert to room via Socket.IO
      sendSignGesture(signLabel, stabilized.confidence);

      // 3. Generate caption entry and broadcast immediately
      const transcriptId = `sign-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
      const signTranscript = {
        id: transcriptId,
        text: `[SIGN] ${signLabel}`,
        source: "SIGN_LANGUAGE",
        confidence: stabilized.confidence || 0.95,
        timestamp: stabilized.timestamp || new Date().toISOString(),
        speaker: {
          id: user?.id,
          name: user?.name || "Participant",
        },
      };

      setTranscripts((prev) => [...prev, signTranscript]);
      sendFinalCaption(signTranscript);

      // 4. If lecture is live, persist in background
      const activeLec = currentLectureRef.current || currentLecture;
      if (activeLec?.id) {
        try {
          const res = await fetch("/api/transcripts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              lectureId: activeLec.id,
              text: `[SIGN] ${signLabel}`,
              source: "SIGN_LANGUAGE",
              confidence: stabilized.confidence || 0.95,
            }),
          });

          if (res.ok) {
            const data = await res.json();
            setTranscripts((prev) =>
              prev.map((t) => (t.id === transcriptId ? data.transcript : t))
            );
          }
        } catch (err) {
          console.error("Failed to persist sign transcript:", err);
        }
      }
    },
    [user?.id, user?.name, currentLecture, sendSignGesture, sendFinalCaption]
  );

  // Initialize Computer Vision Gesture Recognition Hook
  const {
    isModelLoading: isGestureLoading,
    isModelReady: isGestureReady,
    activeGesture,
  } = useGestureRecognition({
    videoRef,
    canvasRef,
    onGestureDetected: handleGestureDetected,
    enabled: isCameraActive,
  });

  // Start Camera Feed safely
  const startCamera = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert("Camera is not supported on this device/browser.");
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: "user" },
        audio: false,
      });
      cameraStreamRef.current = stream;
      setIsCameraActive(true);

      // Attach stream to video DOM element
      requestAnimationFrame(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch((e) => console.warn("Video play exception:", e));
        }
      });
    } catch (err) {
      console.warn("Camera start exception:", err);
      alert("Camera access was not granted or camera is occupied by another app: " + err.message);
    }
  };

  // Stop Camera Feed safely
  const stopCamera = () => {
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach((track) => track.stop());
      cameraStreamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  // Toggle Camera Feed (for Sign Gesture capture)
  const toggleCamera = () => {
    if (isCameraActive) {
      stopCamera();
    } else {
      startCamera();
    }
  };

  // Ensure stream stays attached whenever video element is rendered or re-mounted
  useEffect(() => {
    if (isCameraActive && cameraStreamRef.current && videoRef.current) {
      if (videoRef.current.srcObject !== cameraStreamRef.current) {
        videoRef.current.srcObject = cameraStreamRef.current;
        videoRef.current.play().catch(() => {});
      }
    }
  }, [isCameraActive]);

  // Clean camera stream on unmount
  useEffect(() => {
    return () => {
      if (cameraStreamRef.current) {
        cameraStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Teacher Action: Start Live Lecture
  const handleStartLecture = async () => {
    // 1. Immediately activate speech recognition synchronously within click gesture
    startListening().catch(() => {});
    if (!isCameraActive) {
      startCamera().catch(() => {});
    }

    try {
      setIsActionLoading(true);

      const res = await fetch("/api/lectures", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classroomId,
          title: `${classroom?.name} Live Session`,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to start lecture");
        setIsActionLoading(false);
        return;
      }

      setCurrentLecture(data.lecture);
      currentLectureRef.current = data.lecture;
      setLectureStatus("LIVE");
      setTranscripts([]);
      updateLectureStatus("LIVE");
    } catch (err) {
      console.error("Start lecture error:", err);
      alert("Error starting lecture session");
    } finally {
      setIsActionLoading(false);
    }
  };

  // Teacher Action: Pause / Resume Speech Recognition
  const handlePauseResumeRecognition = () => {
    if (isListening) {
      stopListening();
      setLectureStatus("PAUSED");
      updateLectureStatus("PAUSED");
    } else {
      startListening();
      setLectureStatus("LIVE");
      updateLectureStatus("LIVE");
    }
  };

  // Teacher Action: Conclude Lecture
  const handleEndLecture = async () => {
    setIsActionLoading(true);
    stopListening();
    if (isCameraActive) {
      stopCamera();
    }

    const activeLec = currentLectureRef.current || currentLecture;
    try {
      if (activeLec?.id) {
        await fetch(`/api/lectures/${activeLec.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: "COMPLETED",
            transcripts: transcripts,
          }),
        });
      } else if (classroom?.id) {
        const res = await fetch("/api/lectures", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            classroomId: classroom.id,
            title: `${classroom.name} Lecture`,
            status: "COMPLETED",
            transcripts: transcripts,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.lecture) {
            setCurrentLecture(data.lecture);
            currentLectureRef.current = data.lecture;
          }
        }
      }
    } catch (err) {
      console.warn("Failed to conclude lecture:", err);
    } finally {
      setIsActionLoading(false);
      setLectureStatus("COMPLETED");
      updateLectureStatus("COMPLETED");
    }
  };

  // Teacher Action: Manually type and broadcast a verified caption block
  const handleManualCaptionSubmit = (e) => {
    e.preventDefault();
    if (!manualCaption.trim()) return;

    const text = manualCaption.trim();
    setManualCaption("");

    const transcriptId = `text-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    const displayTranscript = {
      id: transcriptId,
      text,
      source: "SPEECH",
      confidence: 1.0,
      timestamp: new Date().toISOString(),
      speaker: {
        id: user?.id,
        name: user?.name || classroom?.teacher?.name || "Instructor",
      },
    };

    setTranscripts((prev) => [...prev, displayTranscript]);
    sendFinalCaption(displayTranscript);

    const activeLec = currentLectureRef.current || currentLecture;
    if (activeLec?.id) {
      fetch("/api/transcripts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lectureId: activeLec.id,
          text,
          source: "SPEECH",
          confidence: 1.0,
        }),
      }).catch((err) => console.warn("Failed to persist manual caption:", err));
    }
  };

  // Teacher Doubt Handlers
  const handleTeacherAcknowledgeDoubt = (doubt) => {
    acknowledgeStudentDoubt({
      studentId: doubt.studentId,
      studentName: doubt.studentName,
    });
    setPendingDoubts((prev) => prev.filter((d) => d !== doubt));
  };

  const handleTeacherDismissDoubt = (doubt) => {
    setPendingDoubts((prev) => prev.filter((d) => d !== doubt));
  };

  // Student Doubt Handlers
  const handleStudentSubmitDoubt = (doubtPayload) => {
    setIsDoubtPending(true);
    raiseStudentDoubt(doubtPayload);
  };

  // Live Poll Handlers
  const handleTeacherLaunchPoll = (pollData) => {
    launchLivePoll(pollData);
    setActivePoll({
      ...pollData,
      votes: pollData.options.map(() => ({ count: 0 })),
      isEnded: false,
    });
    setIsPollModalOpen(true);
  };

  const handleStudentVotePoll = useCallback(
    (optionIndex, method = "CLICK") => {
      if (!activePoll || userVotedOptionIndex !== null) return;
      setUserVotedOptionIndex(optionIndex);
      submitPollVote({
        pollId: activePoll.id,
        optionIndex,
        voteMethod: method,
      });

      // Optimistic local update
      setActivePoll((current) => {
        if (!current) return current;
        const updatedVotes = (current.votes || current.options.map(() => ({ count: 0 }))).map((v, idx) => {
          if (idx === optionIndex) {
            return { ...v, count: (v.count || 0) + 1 };
          }
          return v;
        });
        return { ...current, votes: updatedVotes };
      });
    },
    [activePoll, userVotedOptionIndex, submitPollVote]
  );

  const handleTeacherEndPoll = (pollId) => {
    endLivePoll(pollId);
    setActivePoll((current) => (current ? { ...current, isEnded: true } : null));

    if (activePoll) {
      const total = (activePoll.votes || []).reduce((a, b) => a + (b.count || 0), 0);
      const breakdown = activePoll.options
        .map((opt, i) => {
          const count = activePoll.votes?.[i]?.count || 0;
          const pct = total > 0 ? Math.round((count / total) * 100) : 0;
          return `${opt}: ${pct}% (${count})`;
        })
        .join(", ");

      const resultTranscript = {
        id: `pollres-${Date.now()}`,
        text: `📊 [POLL RESULTS] "${activePoll.question}" — ${breakdown}`,
        source: "SPEECH",
        confidence: 1.0,
        timestamp: new Date().toISOString(),
        speaker: { name: "Live Class Poll" },
      };
      setTranscripts((prev) => [...prev, resultTranscript]);
      sendFinalCaption(resultTranscript);
    }
  };

  // Sign Language Multimodal Shortcut for Polls & Doubts
  useEffect(() => {
    if (!activeGesture?.isSign || isTeacher) return;

    const g = String(activeGesture.gesture).toUpperCase();

    // 1. If active poll is open and student hasn't voted: detect A, B, C, D gestures
    if (activePoll && !activePoll.isEnded && userVotedOptionIndex === null) {
      const letterIndex = ["A", "B", "C", "D"].indexOf(g);
      if (letterIndex !== -1 && letterIndex < activePoll.options.length) {
        handleStudentVotePoll(letterIndex, "SIGN_GESTURE");
      }
    }

    // 2. If student signs QUESTION or HELP: automatically raise doubt
    if ((g === "QUESTION" || g === "HELP") && !isDoubtPending) {
      setIsDoubtPending(true);
      raiseStudentDoubt({ gesture: g, question: `Raised doubt via sign gesture: ${g}` });
    }
  }, [
    activeGesture,
    isTeacher,
    activePoll,
    userVotedOptionIndex,
    isDoubtPending,
    handleStudentVotePoll,
    raiseStudentDoubt,
  ]);

  // Filter transcripts by search query if user searches
  const filteredTranscripts = searchQuery.trim()
    ? transcripts.filter((t) =>
        t.text.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : transcripts;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-auralis-bg">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-auralis-accent" />
          <span className="text-xs font-semibold text-auralis-muted uppercase tracking-wider">
            Entering Accessible Classroom Workspace...
          </span>
        </div>
      </div>
    );
  }

  if (pageError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-auralis-bg p-6">
        <div className="max-w-md w-full bg-white rounded-2xl border border-auralis-border p-8 text-center space-y-4 shadow-float">
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 mx-auto flex items-center justify-center">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-heading font-extrabold text-xl text-auralis-text">
              Unable to Join Classroom
            </h2>
            <p className="text-xs text-auralis-muted mt-1 leading-relaxed">
              {pageError}
            </p>
          </div>
          <button
            onClick={() => router.push(user?.role === "TEACHER" ? "/teacher/dashboard" : "/student/dashboard")}
            className="w-full py-2.5 rounded-xl bg-auralis-accent text-white text-xs font-bold"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors ${
        isHighContrast ? "bg-[#0B0F0E]" : "bg-auralis-bg"
      }`}
    >
      {/* 1. TOP SECTION */}
      <LiveHeader
        classroom={classroom}
        teacherName={classroom?.teacher?.name}
        lectureStatus={lectureStatus}
        duration={duration}
        participantCount={participantCount}
        isHighContrast={isHighContrast}
        toggleHighContrast={handleToggleContrast}
        fontSize={fontSize}
        setFontSize={setFontSize}
        userRole={user?.role}
      />

      {/* Movable & Draggable Camera Video with Hand Landmark Skeleton Overlay */}
      {isCameraActive && (
        <div
          style={{
            transform: `translate3d(${cameraPosition.x}px, ${cameraPosition.y}px, 0)`,
            top: 0,
            left: 0,
          }}
          className="fixed z-50 w-72 h-56 bg-black rounded-2xl overflow-hidden shadow-2xl border-2 border-auralis-accent flex flex-col select-none touch-none"
        >
          {/* Draggable Drag Header Bar */}
          <div
            onMouseDown={handleCameraDragStart}
            onTouchStart={handleCameraDragStart}
            className="absolute top-0 inset-x-0 h-9 z-20 bg-gradient-to-b from-black/90 via-black/60 to-transparent flex items-center justify-between px-2.5 cursor-grab active:cursor-grabbing text-white"
            title="Click and drag to move camera window anywhere"
          >
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-white/90 truncate pr-2 pointer-events-none">
              <GripHorizontal className="w-3.5 h-3.5 text-auralis-secondary shrink-0" />
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${
                  activeGesture?.isSign
                    ? "bg-amber-400 animate-ping"
                    : isGestureReady
                    ? "bg-emerald-500 animate-pulse"
                    : "bg-blue-400 animate-spin"
                }`}
              />
              <span className="truncate font-semibold">
                {isGestureLoading
                  ? "Loading CV..."
                  : activeGesture?.isSign
                  ? `${activeGesture.label} (${Math.round(activeGesture.confidence * 100)}%)`
                  : "ISL Camera (Movable)"}
              </span>
            </div>

            <button
              type="button"
              onClick={toggleCamera}
              className="p-1 rounded-lg bg-black/60 text-white hover:bg-red-600 transition-colors shrink-0"
              title="Close Camera"
            >
              <VideoOff className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="relative flex-1 w-full h-full pt-2">
            <video
              ref={(el) => {
                videoRef.current = el;
                if (el && cameraStreamRef.current && el.srcObject !== cameraStreamRef.current) {
                  el.srcObject = cameraStreamRef.current;
                  el.play().catch(() => {});
                }
              }}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover transform -scale-x-100"
            />
            <canvas
              ref={canvasRef}
              width={640}
              height={480}
              className="absolute inset-0 w-full h-full pointer-events-none transform -scale-x-100"
            />
          </div>
        </div>
      )}

      {/* MAIN WORKSPACE BODY */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-5">
        {/* Role Controls Bar */}
        {isTeacher ? (
          <TeacherControls
            lectureStatus={lectureStatus}
            isListening={isListening}
            isHighContrast={isHighContrast}
            language={speechLanguage}
            setLanguage={setSpeechLanguage}
            onStartLecture={handleStartLecture}
            onPauseResumeRecognition={handlePauseResumeRecognition}
            onEndLecture={handleEndLecture}
            speechError={speechError}
            isActionLoading={isActionLoading}
            isCameraActive={isCameraActive}
            onToggleCamera={toggleCamera}
            onOpenPollModal={() => setIsPollModalOpen(true)}
            micLevel={micLevel}
            isSpeaking={isSpeaking}
          />
        ) : (
          <StudentControls
            fontSize={fontSize}
            setFontSize={setFontSize}
            isHighContrast={isHighContrast}
            toggleHighContrast={handleToggleContrast}
            isCameraActive={isCameraActive}
            onToggleCamera={toggleCamera}
            onOpenDoubtModal={() => setIsDoubtModalOpen(true)}
            isDoubtPending={isDoubtPending}
            activePoll={activePoll}
            onOpenPollModal={() => setIsPollModalOpen(true)}
          />
        )}

        {/* 2. MAIN CAPTION VIEWPORT & 3. SIDE PANEL */}
        <div className="flex-1 flex flex-col lg:flex-row gap-5 items-stretch min-h-[500px]">
          <div className="flex-1 flex flex-col gap-3 min-h-[480px]">
            <CaptionView
              transcripts={filteredTranscripts}
              interimText={interimText}
              activeSign={activeSign}
              isListening={isListening}
              isHighContrast={isHighContrast}
              fontSize={fontSize}
              lectureStatus={lectureStatus}
              isTeacher={isTeacher}
              onStartSpeech={handlePauseResumeRecognition}
              micLevel={micLevel}
              isSpeaking={isSpeaking}
            />

            {/* Teacher Fast Announcement / Caption Block Creator */}
            {isTeacher && (
              <form
                onSubmit={handleManualCaptionSubmit}
                className={`flex items-center gap-2 p-2 rounded-2xl border transition-colors shadow-tactile ${
                  isHighContrast
                    ? "bg-[#0B0F0E] border-white/20"
                    : "bg-white border-auralis-border"
                }`}
              >
                <input
                  type="text"
                  value={manualCaption}
                  onChange={(e) => setManualCaption(e.target.value)}
                  placeholder="Type academic key phrase, formula, or announcement to broadcast into caption block..."
                  className={`flex-1 px-3 py-2 text-xs bg-transparent outline-none ${
                    isHighContrast ? "text-white placeholder:text-white/40" : "text-auralis-text placeholder:text-auralis-muted"
                  }`}
                />
                <button
                  type="submit"
                  disabled={!manualCaption.trim()}
                  className="px-4 py-2 rounded-xl bg-auralis-accent hover:bg-auralis-accent-hover text-white text-xs font-bold transition-all disabled:opacity-40 shadow-tactile"
                >
                  Write to Caption Block
                </button>
              </form>
            )}
          </div>

          <SidePanel
            isHighContrast={isHighContrast}
            isListening={isListening}
            micLevel={micLevel}
            language={speechLanguage}
            setLanguage={setSpeechLanguage}
            isCameraActive={isCameraActive}
            onToggleCamera={toggleCamera}
            connectionStatus={connectionStatus}
            participantCount={participantCount}
            transcripts={transcripts}
            onSearchChange={setSearchQuery}
            classroomTitle={classroom?.name}
            userRole={user?.role}
          />
        </div>
      </div>

      {/* CLASS CONCLUDED OVERLAY FOR STUDENTS */}
      {isClassConcluded && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="w-full max-w-lg bg-white rounded-3xl border border-auralis-border shadow-2xl p-6 sm:p-8 text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-800 mx-auto flex items-center justify-center shadow-inner">
              <GraduationCap className="w-9 h-9 text-auralis-accent" />
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-auralis-accent bg-auralis-highlight px-3 py-1 rounded-full border border-auralis-secondary/50">
                Live Session Concluded
              </span>
              <h2 className="font-heading font-extrabold text-2xl text-auralis-text">
                Class Concluded by Instructor
              </h2>
              <p className="text-xs text-auralis-muted max-w-sm mx-auto leading-relaxed">
                Your instructor has concluded today&apos;s live lecture. All real-time captions and transcripts have been safely archived to your dashboard.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-auralis-bg border border-auralis-border flex items-center justify-between text-xs">
              <span className="text-auralis-muted">Captions recorded:</span>
              <span className="font-mono font-bold text-auralis-text">{transcripts.length} entries</span>
            </div>

            <div className="space-y-3 pt-2">
              <div className="text-xs font-semibold text-auralis-muted flex items-center justify-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-auralis-accent animate-spin" />
                <span>Redirecting to Student Dashboard in <span className="font-bold text-auralis-accent font-mono text-sm">{autoRedirectCountdown}</span>s...</span>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3">
                <button
                  type="button"
                  onClick={handleDownloadTranscript}
                  className="w-full py-2.5 px-3 rounded-xl border border-auralis-border text-xs font-bold text-auralis-text hover:bg-auralis-bg transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4 text-auralis-accent" />
                  <span>Download Transcript</span>
                </button>

                <button
                  type="button"
                  onClick={() => router.push("/lectures")}
                  className="w-full py-2.5 px-3 rounded-xl bg-auralis-dark hover:bg-black text-white text-xs font-bold shadow-tactile transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>View Lecture History</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => router.push("/student/dashboard")}
                  className="w-full py-2.5 px-3 rounded-xl bg-auralis-accent hover:bg-auralis-accent-hover text-white text-xs font-bold shadow-tactile transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Dashboard</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Teacher Floating Student Doubt Notifications */}
      {isTeacher && (
        <TeacherDoubtAlert
          doubts={pendingDoubts}
          onAcknowledge={handleTeacherAcknowledgeDoubt}
          onDismiss={handleTeacherDismissDoubt}
          isHighContrast={isHighContrast}
        />
      )}

      {/* Student Doubt Acknowledged Toast Alert */}
      {!isTeacher && doubtAcknowledgedToast && (
        <div className="fixed top-20 right-4 z-50 p-4 rounded-2xl bg-emerald-600 text-white shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span className="text-xs font-bold">{doubtAcknowledgedToast}</span>
        </div>
      )}

      {/* In-Class Live Poll Modal (Teacher & Student) */}
      <LivePollModal
        isOpen={isPollModalOpen}
        onClose={() => {
          setIsPollModalOpen(false);
          if (activePoll?.isEnded) {
            setActivePoll(null);
            setUserVotedOptionIndex(null);
          }
        }}
        isTeacher={isTeacher}
        activePoll={activePoll}
        onLaunchPoll={handleTeacherLaunchPoll}
        onVote={handleStudentVotePoll}
        onEndPoll={handleTeacherEndPoll}
        isHighContrast={isHighContrast}
        userVotedOptionIndex={userVotedOptionIndex}
        activeSign={activeSign}
      />

      {/* Student Raise Hand / Ask Doubt Modal */}
      {!isTeacher && (
        <StudentDoubtModal
          isOpen={isDoubtModalOpen}
          onClose={() => setIsDoubtModalOpen(false)}
          onSubmitDoubt={handleStudentSubmitDoubt}
          isCameraActive={isCameraActive}
          isHighContrast={isHighContrast}
        />
      )}
    </div>
  );
}
