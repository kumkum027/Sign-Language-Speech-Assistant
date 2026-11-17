"use client";

import React, { useState } from "react";
import {
  BarChart3,
  CheckCircle2,
  X,
  Play,
  Square,
  Sparkles,
  Hand,
  Check,
  AlertCircle,
} from "lucide-react";

export default function LivePollModal({
  isOpen,
  onClose,
  isTeacher,
  activePoll,
  onLaunchPoll,
  onVote,
  onEndPoll,
  isHighContrast = false,
  userVotedOptionIndex = null,
  activeSign = null,
}) {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["Option A", "Option B"]);
  const [pollPreset, setPollPreset] = useState("custom");

  if (!isOpen) return null;

  const presets = [
    {
      id: "comprehension",
      label: "Comprehension Check",
      q: "Did everyone follow this concept clearly?",
      opts: ["Yes, fully understood", "Somewhat, need 1 review", "No, please explain again"],
    },
    {
      id: "multiple_choice",
      label: "A / B / C / D Quiz",
      q: "Which option is correct for the problem above?",
      opts: ["Option A", "Option B", "Option C", "Option D"],
    },
    {
      id: "true_false",
      label: "True / False",
      q: "Is the statement presented by the instructor True or False?",
      opts: ["True", "False"],
    },
  ];

  const handleApplyPreset = (preset) => {
    setPollPreset(preset.id);
    setQuestion(preset.q);
    setOptions(preset.opts);
  };

  const handleAddOption = () => {
    if (options.length < 5) {
      setOptions([...options, `Option ${String.fromCharCode(65 + options.length)}`]);
    }
  };

  const handleRemoveOption = (idx) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== idx));
    }
  };

  const handleOptionChange = (idx, val) => {
    const updated = [...options];
    updated[idx] = val;
    setOptions(updated);
  };

  const handleLaunchSubmit = (e) => {
    e.preventDefault();
    if (!question.trim()) return;
    const cleanOptions = options.map((o) => o.trim()).filter(Boolean);
    if (cleanOptions.length < 2) return;

    onLaunchPoll({
      id: `poll-${Date.now()}`,
      question: question.trim(),
      options: cleanOptions,
    });
  };

  // If there is an active poll currently running
  if (activePoll) {
    const totalVotes = (activePoll.votes || []).reduce((acc, v) => acc + (v.count || 0), 0);

    return (
      <div
        onClick={(e) => {
          if (e.target === e.currentTarget && onClose) onClose();
        }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      >
        <div
          className={`w-full max-w-lg rounded-3xl p-6 border shadow-2xl transition-all ${
            isHighContrast
              ? "bg-[#0B0F0E] border-white/30 text-white"
              : "bg-white border-auralis-border text-auralis-text"
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-inherit">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-auralis-accent text-white flex items-center justify-center">
                <BarChart3 className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-auralis-accent font-bold">
                  {activePoll.isEnded ? "Live Poll Ended" : "Live In-Class Interactive Poll"}
                </span>
                <h3 className="font-heading font-extrabold text-base leading-snug">
                  {activePoll.question}
                </h3>
              </div>
            </div>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-xl hover:bg-black/10 dark:hover:bg-white/10 text-inherit transition-colors cursor-pointer"
                title="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Interactive Voting / Results Options */}
          <div className="py-5 space-y-3">
            {activePoll.options.map((opt, idx) => {
              const voteCount = activePoll.votes?.[idx]?.count || 0;
              const percent = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;
              const isSelected = userVotedOptionIndex === idx;

              return (
                <div key={idx} className="relative">
                  {/* For Student who hasn't voted yet and poll is active */}
                  {!isTeacher && userVotedOptionIndex === null && !activePoll.isEnded ? (
                    <button
                      onClick={() => onVote(idx, "CLICK")}
                      className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center justify-between group cursor-pointer ${
                        isHighContrast
                          ? "bg-white/10 hover:bg-[#FFE27A] hover:text-black border-white/20"
                          : "bg-auralis-bg hover:bg-auralis-highlight hover:border-auralis-accent border-auralis-border"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-lg bg-black/10 dark:bg-white/10 flex items-center justify-center text-xs font-mono font-bold">
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span className="text-sm font-semibold">{opt}</span>
                      </div>
                      <span className="text-xs font-bold text-auralis-accent opacity-0 group-hover:opacity-100 transition-opacity">
                        Vote &rarr;
                      </span>
                    </button>
                  ) : (
                    /* Display Results Bar */
                    <div
                      className={`relative overflow-hidden p-3.5 rounded-2xl border transition-all ${
                        isSelected
                          ? isHighContrast
                            ? "border-[#FFE27A] bg-white/15"
                            : "border-auralis-accent bg-auralis-highlight/40"
                          : isHighContrast
                          ? "border-white/15 bg-white/5"
                          : "border-auralis-border bg-auralis-bg/60"
                      }`}
                    >
                      {/* Animated Fill Bar */}
                      <div
                        style={{ width: `${percent}%` }}
                        className={`absolute inset-y-0 left-0 transition-all duration-500 rounded-2xl ${
                          isSelected
                            ? "bg-auralis-accent/25"
                            : isHighContrast
                            ? "bg-white/20"
                            : "bg-auralis-secondary/20"
                        }`}
                      />

                      <div className="relative flex items-center justify-between z-10">
                        <div className="flex items-center gap-2.5">
                          <span className="w-6 h-6 rounded-md bg-black/15 dark:bg-white/15 flex items-center justify-center text-xs font-mono font-bold">
                            {String.fromCharCode(65 + idx)}
                          </span>
                          <span className="text-sm font-semibold">{opt}</span>
                          {isSelected && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                              <Check className="w-3 h-3" /> Your Vote
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold">{percent}%</span>
                          <span className="text-[11px] text-auralis-muted">({voteCount})</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Footer Status and Actions */}
          <div className="pt-4 border-t border-inherit flex items-center justify-between text-xs">
            <span className="text-auralis-muted font-mono">
              Total Responses: <strong>{totalVotes}</strong>
            </span>

            {isTeacher && !activePoll.isEnded ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-2 rounded-xl border border-inherit text-xs font-semibold hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
                >
                  Minimize
                </button>
                <button
                  type="button"
                  onClick={() => onEndPoll(activePoll.id)}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold transition-all flex items-center gap-1.5 shadow-tactile cursor-pointer"
                >
                  <Square className="w-3.5 h-3.5 fill-white" />
                  <span>End Poll &amp; Broadcast</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 rounded-xl bg-auralis-accent hover:bg-auralis-accent-hover text-white font-bold transition-all shadow-tactile cursor-pointer"
              >
                Done / Close
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Teacher Launch Form (when no active poll is running)
  if (!isTeacher) return null;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget && onClose) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        className={`w-full max-w-md rounded-3xl p-6 border shadow-2xl transition-all ${
          isHighContrast
            ? "bg-[#0B0F0E] border-white/30 text-white"
            : "bg-white border-auralis-border text-auralis-text"
        }`}
      >
        <div className="flex items-center justify-between pb-3 border-b border-inherit">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-auralis-accent" />
            <h3 className="font-heading font-extrabold text-base">Launch Live In-Class Poll</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 text-inherit"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Presets */}
        <div className="mt-4">
          <label className="text-[11px] font-mono text-auralis-muted uppercase tracking-wider block mb-2">
            Quick 1-Click Presets
          </label>
          <div className="grid grid-cols-3 gap-2">
            {presets.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => handleApplyPreset(p)}
                className={`p-2 rounded-xl text-left border transition-all text-xs font-semibold ${
                  pollPreset === p.id
                    ? isHighContrast
                      ? "bg-[#FFE27A] text-black border-white"
                      : "bg-auralis-highlight text-auralis-accent border-auralis-accent shadow-sm"
                    : isHighContrast
                    ? "bg-white/10 hover:bg-white/20 border-white/20 text-white"
                    : "bg-auralis-bg hover:bg-auralis-surface text-auralis-text border-auralis-border"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleLaunchSubmit} className="mt-4 space-y-4">
          <div>
            <label className="text-xs font-bold block mb-1">Poll Question</label>
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g. Which layer does IP addressing belong to?"
              required
              className={`w-full px-3.5 py-2.5 rounded-xl text-xs border outline-none ${
                isHighContrast
                  ? "bg-white/10 border-white/20 text-white"
                  : "bg-auralis-bg border-auralis-border text-auralis-text"
              }`}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold">Answer Options</label>
              {options.length < 5 && (
                <button
                  type="button"
                  onClick={handleAddOption}
                  className="text-[11px] font-bold text-auralis-accent hover:underline"
                >
                  + Add Option
                </button>
              )}
            </div>
            <div className="space-y-2">
              {options.map((opt, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="w-6 text-center text-xs font-mono font-bold text-auralis-muted">
                    {String.fromCharCode(65 + i)}
                  </span>
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => handleOptionChange(i, e.target.value)}
                    required
                    className={`flex-1 px-3 py-2 rounded-xl text-xs border outline-none ${
                      isHighContrast
                        ? "bg-white/10 border-white/20 text-white"
                        : "bg-auralis-bg border-auralis-border text-auralis-text"
                    }`}
                  />
                  {options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(i)}
                      className="p-1 text-red-500 hover:text-red-700"
                      title="Remove Option"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-inherit text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!question.trim()}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-auralis-accent hover:bg-auralis-accent-hover text-white text-xs font-bold shadow-tactile transition-all disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Launch Live Poll</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
