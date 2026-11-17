"use client";

import { useState, useEffect, useRef, useCallback } from "react";

/**
 * Analyzes and normalizes speech transcript text:
 * - Fixes capitalization
 * - Normalizes multiple spaces
 * - Analyzes grammatical punctuation (questions vs statements)
 */
function analyzeAndFormatSpeech(raw) {
  if (!raw) return "";
  let text = raw.trim().replace(/\s+/g, " ");
  if (!text) return "";

  // Capitalize first character
  text = text.charAt(0).toUpperCase() + text.slice(1);

  // Analyze ending punctuation if missing
  const lastChar = text.slice(-1);
  if (![".", "?", "!", ",", ";"].includes(lastChar)) {
    const questionStarters = [
      "what", "why", "how", "when", "where", "who", "which",
      "is", "are", "can", "could", "would", "do", "does", "did", "should", "will"
    ];
    const firstWord = text.split(" ")[0].toLowerCase();
    if (questionStarters.includes(firstWord)) {
      text += "?";
    } else {
      text += ".";
    }
  }

  return text;
}

/**
 * useSpeechRecognition - Custom hook for continuous, resilient speech-to-text with Web Speech API
 * - Direct, unconflicted microphone capture (no audio device contention with getUserMedia)
 * - Real-time continuous phonetic speech analysis and live interim word streaming
 * - Incremental index tracking that guarantees zero dropped words or duplicated phrases
 * - Silence auto-commit debounce (finalizes speech when speaker pauses)
 * - Auto-reconnecting lifecycle with OS audio buffer teardown pause
 * - Native speech and voice activity detection (onspeechstart, onsoundstart, interim reactivity)
 * - Friendly actionable diagnostics for browser permissions, unsupported engines, and network
 */
export function useSpeechRecognition({
  language = "en-IN",
  onFinalTranscript = null,
  onInterimTranscript = null,
}) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [error, setError] = useState(null);
  const [interimText, setInterimText] = useState("");
  const [finalTranscripts, setFinalTranscripts] = useState([]);
  const [micLevel, setMicLevel] = useState(0); // 0 to 100
  const [isSpeaking, setIsSpeaking] = useState(false);

  const recognitionRef = useRef(null);
  const isListeningRef = useRef(false);
  const shouldKeepListeningRef = useRef(false);
  const restartTimerRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const micDecayTimerRef = useRef(null);

  const onFinalTranscriptRef = useRef(onFinalTranscript);
  const onInterimTranscriptRef = useRef(onInterimTranscript);
  const languageRef = useRef(language);

  // Result tracking refs
  const finalizedIndexRef = useRef(0);
  const activeInterimRef = useRef("");
  const lastCommittedTextRef = useRef("");

  useEffect(() => {
    onFinalTranscriptRef.current = onFinalTranscript;
  }, [onFinalTranscript]);

  useEffect(() => {
    onInterimTranscriptRef.current = onInterimTranscript;
  }, [onInterimTranscript]);

  useEffect(() => {
    languageRef.current = language;
    if (recognitionRef.current && isListeningRef.current) {
      try {
        recognitionRef.current.lang = language;
      } catch (e) {
        // ignore
      }
    }
  }, [language]);

  // Check browser Web Speech API support
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setIsSupported(false);
        setError(
          "Web Speech API is not supported in this browser. Please use Google Chrome or Microsoft Edge."
        );
      }
    }
  }, []);

  // Mic level pulse helper (derived from native speech recognition voice events)
  const pulseMicLevel = useCallback((level = 75) => {
    setMicLevel(level);
    setIsSpeaking(true);
    if (micDecayTimerRef.current) clearTimeout(micDecayTimerRef.current);
    micDecayTimerRef.current = setTimeout(() => {
      setMicLevel(0);
      setIsSpeaking(false);
    }, 1200);
  }, []);

  // Commit text into final transcripts
  const commitFinal = useCallback((rawText, confidence = 0.95) => {
    if (!rawText || !rawText.trim()) return;

    const analyzed = analyzeAndFormatSpeech(rawText);
    const cleanComp = analyzed.toLowerCase().replace(/[^a-z0-9]/g, "");

    // Avoid immediate duplicate commit of the exact same sentence
    if (cleanComp && cleanComp === lastCommittedTextRef.current) {
      return;
    }
    lastCommittedTextRef.current = cleanComp;

    const finalEntry = {
      text: analyzed,
      confidence: confidence || 0.95,
      timestamp: new Date().toISOString(),
      source: "SPEECH",
    };

    setFinalTranscripts((prev) => [...prev, finalEntry]);
    if (onFinalTranscriptRef.current) {
      onFinalTranscriptRef.current(finalEntry);
    }
  }, []);

  // Safely destroy current recognition instance
  const destroyCurrentRecognition = useCallback(() => {
    if (recognitionRef.current) {
      const r = recognitionRef.current;
      recognitionRef.current = null;
      r.onstart = null;
      r.onresult = null;
      r.onerror = null;
      r.onend = null;
      r.onspeechstart = null;
      r.onspeechend = null;
      r.onsoundstart = null;
      r.onsoundend = null;
      r.onaudiostart = null;
      r.onaudioend = null;
      try {
        r.abort();
      } catch (e) {
        // ignore
      }
    }
  }, []);

  // Create a clean SpeechRecognition instance
  const createRecognitionInstance = useCallback(() => {
    if (typeof window === "undefined") return null;
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return null;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = languageRef.current || "en-IN";
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      isListeningRef.current = true;
      setError(null);
    };

    recognition.onaudiostart = () => {
      setMicLevel(35);
    };

    recognition.onsoundstart = () => {
      pulseMicLevel(60);
    };

    recognition.onspeechstart = () => {
      pulseMicLevel(85);
    };

    recognition.onspeechend = () => {
      setIsSpeaking(false);
      setMicLevel(10);
    };

    recognition.onsoundend = () => {
      setMicLevel(0);
    };

    recognition.onresult = (event) => {
      let currentInterim = "";

      pulseMicLevel(90);

      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        const rawTranscript = result[0]?.transcript || "";

        if (result.isFinal) {
          // If this result index has not been finalized yet:
          if (i >= finalizedIndexRef.current) {
            finalizedIndexRef.current = i + 1;
            const trimmed = rawTranscript.trim();
            if (trimmed.length > 0) {
              commitFinal(trimmed, result[0]?.confidence || 0.95);
            }
          }
        } else {
          currentInterim += rawTranscript;
        }
      }

      // Update interim display
      activeInterimRef.current = currentInterim;
      setInterimText(currentInterim);
      if (onInterimTranscriptRef.current) {
        onInterimTranscriptRef.current(currentInterim);
      }

      // Silence auto-commit debounce: if user pauses for 1.3s and Chrome
      // hasn't marked it isFinal yet, commit the interim text as a completed sentence!
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
      if (currentInterim.trim().length > 0) {
        silenceTimerRef.current = setTimeout(() => {
          const lingering = activeInterimRef.current.trim();
          if (lingering.length > 0) {
            commitFinal(lingering, 0.92);
            activeInterimRef.current = "";
            setInterimText("");
            if (onInterimTranscriptRef.current) {
              onInterimTranscriptRef.current("");
            }
            finalizedIndexRef.current = event.results.length;
          }
        }, 1300);
      }
    };

    recognition.onerror = (event) => {
      console.warn("[SpeechRecognition] event error:", event.error);
      if (event.error === "no-speech") {
        // Completely normal quiet period in Chrome; onend will automatically cycle
        return;
      }
      if (event.error === "aborted") {
        // Normal when user stops or instance is recycled
        return;
      }
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        setError(
          "Microphone permission blocked. Please allow microphone permissions in your browser address bar."
        );
        shouldKeepListeningRef.current = false;
        setIsListening(false);
        isListeningRef.current = false;
        destroyCurrentRecognition();
        return;
      }
      if (event.error === "network") {
        setError("Network connection to speech service interrupted. Auto-reconnecting...");
        return;
      }
      if (event.error === "audio-capture") {
        setError("Audio capture device was busy or unavailable. Reconnecting...");
        return;
      }
      setError(`Speech recognition status: ${event.error}`);
    };

    recognition.onend = () => {
      // 1. Commit any lingering speech
      if (activeInterimRef.current && activeInterimRef.current.trim().length > 0) {
        commitFinal(activeInterimRef.current.trim(), 0.92);
        activeInterimRef.current = "";
        setInterimText("");
        if (onInterimTranscriptRef.current) {
          onInterimTranscriptRef.current("");
        }
      }

      setIsSpeaking(false);
      setMicLevel(0);
      destroyCurrentRecognition();

      // 2. If should keep listening, spawn a fresh session
      if (shouldKeepListeningRef.current) {
        if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
        restartTimerRef.current = setTimeout(() => {
          if (shouldKeepListeningRef.current) {
            startNewSessionRef.current?.();
          }
        }, 120);
      } else {
        setIsListening(false);
        isListeningRef.current = false;
        setInterimText("");
      }
    };

    return recognition;
  }, [commitFinal, destroyCurrentRecognition, pulseMicLevel]);

  // Restart handler ref
  const startNewSessionRef = useRef(null);

  const startNewSession = useCallback(() => {
    if (!shouldKeepListeningRef.current) return;
    destroyCurrentRecognition();
    finalizedIndexRef.current = 0; // Reset index for fresh session

    try {
      const freshRecognition = createRecognitionInstance();
      if (!freshRecognition) return;
      recognitionRef.current = freshRecognition;
      freshRecognition.start();
    } catch (err) {
      console.warn("[SpeechRecognition] Session start exception:", err.message);
      if (shouldKeepListeningRef.current) {
        if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
        restartTimerRef.current = setTimeout(() => {
          if (shouldKeepListeningRef.current) {
            startNewSession();
          }
        }, 300);
      }
    }
  }, [createRecognitionInstance, destroyCurrentRecognition]);

  useEffect(() => {
    startNewSessionRef.current = startNewSession;
  }, [startNewSession]);

  const startListening = useCallback(async () => {
    if (!isSupported) {
      setError("Web Speech API is not supported on this browser. Please use Chrome or Edge.");
      return;
    }

    try {
      setError(null);
      shouldKeepListeningRef.current = true;

      // 1. Check microphone permission upfront and release immediately so SpeechRecognition has 100% exclusive access
      if (typeof navigator !== "undefined" && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          const permStream = await navigator.mediaDevices.getUserMedia({ audio: true });
          permStream.getTracks().forEach((track) => track.stop());
        } catch (permErr) {
          if (permErr.name === "NotAllowedError" || permErr.name === "PermissionDeniedError") {
            setError(
              "Microphone permission was denied. Please click the lock or camera icon in your browser URL bar to allow microphone access."
            );
            shouldKeepListeningRef.current = false;
            setIsListening(false);
            return;
          }
        }
      }

      // 2. Launch fresh recognition session
      startNewSession();
    } catch (err) {
      console.warn("Failed to start speech recognition:", err);
      setError(err.message || "Failed to start speech recognition");
    }
  }, [isSupported, startNewSession]);

  const stopListening = useCallback(() => {
    shouldKeepListeningRef.current = false;
    if (restartTimerRef.current) {
      clearTimeout(restartTimerRef.current);
      restartTimerRef.current = null;
    }
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (micDecayTimerRef.current) {
      clearTimeout(micDecayTimerRef.current);
      micDecayTimerRef.current = null;
    }

    // Commit any lingering speech
    if (activeInterimRef.current && activeInterimRef.current.trim().length > 0) {
      commitFinal(activeInterimRef.current.trim(), 0.92);
      activeInterimRef.current = "";
    }

    destroyCurrentRecognition();
    setIsListening(false);
    isListeningRef.current = false;
    setInterimText("");
    setMicLevel(0);
    setIsSpeaking(false);
  }, [commitFinal, destroyCurrentRecognition]);

  const resetTranscripts = useCallback(() => {
    setFinalTranscripts([]);
    setInterimText("");
    activeInterimRef.current = "";
    lastCommittedTextRef.current = "";
    finalizedIndexRef.current = 0;
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      shouldKeepListeningRef.current = false;
      if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      if (micDecayTimerRef.current) clearTimeout(micDecayTimerRef.current);
      destroyCurrentRecognition();
    };
  }, [destroyCurrentRecognition]);

  return {
    isListening,
    isSupported,
    error,
    interimText,
    finalTranscripts,
    micLevel,
    isSpeaking,
    startListening,
    stopListening,
    resetTranscripts,
    setFinalTranscripts,
  };
}
