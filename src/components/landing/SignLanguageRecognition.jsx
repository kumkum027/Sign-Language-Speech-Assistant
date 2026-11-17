"use client";

import { useState } from "react";
import { Hand, Check, ShieldAlert } from "lucide-react";

export function SignLanguageRecognition() {
  const [selectedGesture, setSelectedGesture] = useState(0);

  const supportedGestures = [
    {
      name: "QUESTION / DOUBT",
      category: "Static Pose",
      description: "Raised index finger held steadily facing instructor. Signals a student doubt.",
      confidence: "95.4%",
      status: "Active",
      islGloss: "DOUBT_RAISE",
    },
    {
      name: "UNDERSTOOD",
      category: "Temporal Motion",
      description: "Open palm moving softly toward upper chest. Confirms comprehension of concept.",
      confidence: "91.8%",
      status: "Active",
      islGloss: "UNDERSTOOD_TAP",
    },
    {
      name: "REPEAT PLEASE",
      category: "Temporal Motion",
      description: "Circular motion of index finger clockwise. Requests professor to repeat last phrase.",
      confidence: "88.6%",
      status: "Active",
      islGloss: "AGAIN_REPEAT",
    },
    {
      name: "YES / AGREE",
      category: "Temporal Motion",
      description: "Closed fist with steady vertical nodding displacement. Indicates agreement.",
      confidence: "94.1%",
      status: "Active",
      islGloss: "AFFIRMATIVE_YES",
    },
    {
      name: "NO / DISAGREE",
      category: "Static Pose",
      description: "Index and middle finger snap swiftly against thumb. Indicates negative answer.",
      confidence: "92.7%",
      status: "Active",
      islGloss: "NEGATIVE_NO",
    },
    {
      name: "HELP",
      category: "Static Pose",
      description: "Closed fist thumbs-up resting upon flat horizontal palm. Asks for academic assistance.",
      confidence: "93.0%",
      status: "Active",
      islGloss: "HELP_SUPPORT",
    },
  ];

  return (
    <section className="py-24 border-t border-auralis-border bg-auralis-bg" id="sign-language">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-16">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-auralis-accent bg-auralis-highlight px-3 py-1 rounded-full border border-auralis-secondary/60">
            Computer Vision Innovation
          </span>
          <h2 className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-5xl tracking-tight text-auralis-text mt-4 mb-4">
            Indian Sign Language (ISL) recognition inside the browser.
          </h2>
          <p className="text-base text-auralis-muted leading-relaxed">
            Students who communicate using sign language can express questions, responses, and affirmations without needing an intermediary. We extract 21 three-dimensional skeletal coordinates in real-time.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-6 space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-auralis-muted mb-2">
              Select Validated Classroom Gesture:
            </div>
            {supportedGestures.map((gesture, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedGesture(idx)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  selectedGesture === idx
                    ? "bg-white border-auralis-accent shadow-tactile ring-2 ring-auralis-accent/10"
                    : "bg-white/60 hover:bg-white border-auralis-border"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        selectedGesture === idx
                          ? "bg-auralis-accent text-white"
                          : "bg-auralis-bg text-auralis-muted border border-auralis-border"
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <span className="font-heading font-bold text-base text-auralis-text">
                      {gesture.name}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-auralis-highlight text-auralis-accent font-semibold">
                    {gesture.category}
                  </span>
                </div>
                <p className="text-xs text-auralis-muted pl-8 leading-relaxed">
                  {gesture.description}
                </p>
              </div>
            ))}
          </div>

          <div className="lg:col-span-6 space-y-6">
            <div className="rounded-2xl bg-white border border-auralis-border p-6 shadow-tactile">
              <div className="flex items-center justify-between pb-4 border-b border-auralis-border/60 mb-5">
                <div className="flex items-center gap-2">
                  <Hand className="w-5 h-5 text-auralis-accent" />
                  <span className="font-heading font-bold text-base text-auralis-text">
                    Gesture Inspection: {supportedGestures[selectedGesture].name}
                  </span>
                </div>
                <span className="text-xs font-mono font-bold text-auralis-success bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {supportedGestures[selectedGesture].confidence} Confidence
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs mb-6">
                <div className="p-3 rounded-xl bg-auralis-bg border border-auralis-border">
                  <div className="text-auralis-muted text-[10px] uppercase font-mono">ISL Technical Gloss</div>
                  <div className="font-mono font-bold text-auralis-text text-sm mt-0.5">
                    {supportedGestures[selectedGesture].islGloss}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-auralis-bg border border-auralis-border">
                  <div className="text-auralis-muted text-[10px] uppercase font-mono">Motion Classification</div>
                  <div className="font-semibold text-auralis-accent text-sm mt-0.5">
                    {supportedGestures[selectedGesture].category}
                  </div>
                </div>
              </div>

              <div className="space-y-3 text-xs text-auralis-muted leading-relaxed">
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-auralis-success shrink-0 mt-0.5" />
                  <span><strong>Wrist-Relative Invariance:</strong> Keypoints are translated relative to Keypoint 0 (wrist), rendering detection position-independent.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-auralis-success shrink-0 mt-0.5" />
                  <span><strong>Scale Normalization:</strong> Landmark distances are divided by the distance between wrist and middle MCP keypoint to accommodate varying distances from the camera.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-auralis-success shrink-0 mt-0.5" />
                  <span><strong>Temporal Sliding FIFO Window:</strong> Movement signs evaluate coordinate vectors across a 15-frame history (~500ms) rather than isolated snapshots.</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-auralis-highlight/50 border border-auralis-secondary p-6">
              <div className="flex items-center gap-2.5 text-auralis-accent mb-2">
                <ShieldAlert className="w-5 h-5 text-auralis-accent" />
                <h4 className="font-heading font-bold text-base text-auralis-dark">
                  Responsible Perception: Explicit Rejection Filter
                </h4>
              </div>
              <p className="text-xs text-auralis-text/80 leading-relaxed mb-3">
                Real academic sign language is not a toy. If a student scratches their nose, raises a pencil, or produces an ambiguous gesture, Auralis does <strong>not</strong> invent a false prediction. Any prediction below <strong>78% confidence</strong> triggers an explicit <code className="bg-white/80 px-1.5 py-0.5 rounded font-mono text-auralis-accent font-bold">UNKNOWN_GESTURE</code> state.
              </p>
              <div className="text-[11px] text-auralis-muted italic">
                *Auralis focuses on core classroom interactions. We do not claim complete continuous sign-to-speech translation.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
