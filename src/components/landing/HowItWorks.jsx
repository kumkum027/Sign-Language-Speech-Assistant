"use client";

import { Mic2, Cpu, Radio, FileText, CheckCircle2 } from "lucide-react";

export function HowItWorks() {
  const steps = [
    {
      number: "01",
      title: "Teacher Speaks & Student Gestures",
      subtitle: "Multi-Modal Classroom Stream",
      description:
        "The professor speaks naturally through any standard laptop or lapel microphone. In parallel, students wishing to respond or ask questions can enable their camera feed for Indian Sign Language gesture recognition.",
      icon: Mic2,
      tag: "Client Input",
      details: ["Continuous browser Web Speech stream", "Webcam 30 FPS MediaPipe tracking", "Zero external hardware required"],
    },
    {
      number: "02",
      title: "Real-Time Machine Perception",
      subtitle: "Zero-Python In-Browser Pipeline",
      description:
        "Continuous audio chunks are converted to interim text with fast latency. Simultaneously, the computer vision engine tracks 21 three-dimensional skeletal hand landmarks, normalizing coordinates to classify static and temporal signs.",
      icon: Cpu,
      tag: "Edge Processing",
      details: ["15-frame temporal sliding window", "Angle & displacement clustering", "Unknown gesture rejection filter"],
    },
    {
      number: "03",
      title: "Sub-200ms Socket Synchronization",
      subtitle: "Dedicated Real-Time Relay Daemon",
      description:
        "A robust Node.js Socket.IO server broadcasts finalized phrases and sign notifications to all authenticated students joined in the virtual classroom room, maintaining perfect synchronization across all devices.",
      icon: Radio,
      tag: "Real-Time Relay",
      details: ["Classroom room-isolated channels", "JWT handshake authentication", "Volatile interim vs batch final persistence"],
    },
    {
      number: "04",
      title: "Accessible Display & Searchable Archive",
      subtitle: "WCAG 2.2 AA Typography & Transcripts",
      description:
        "Students read crisp, customizable typography with high-contrast options, font scaling, and speaker tags. When the lecture concludes, the entire dual-stream transcript is archived for review and export.",
      icon: FileText,
      tag: "Review & Persistence",
      details: ["18px to 36px font scaler", "Full-text searchable history", "Clean .txt export for study notes"],
    },
  ];

  return (
    <section className="py-24 border-t border-auralis-border bg-auralis-bg" id="how-it-works">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-2xl">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-auralis-accent bg-auralis-highlight px-3 py-1 rounded-full border border-auralis-secondary/60">
              Technical Architecture
            </span>
            <h2 className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-5xl tracking-tight text-auralis-text mt-4">
              How Auralis bridges the sound barrier.
            </h2>
          </div>
          <p className="text-base text-auralis-muted max-w-md">
            Every step is engineered for sub-second delivery, privacy preservation, and seamless classroom integration.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className="rounded-2xl bg-white border border-auralis-border p-6 flex flex-col justify-between hover:border-auralis-accent/50 transition-all hover:shadow-tactile group"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <span className="font-heading font-extrabold text-3xl text-auralis-secondary group-hover:text-auralis-accent transition-colors">
                      {step.number}
                    </span>
                    <span className="text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded bg-auralis-bg text-auralis-muted border border-auralis-border">
                      {step.tag}
                    </span>
                  </div>

                  <div className="w-10 h-10 rounded-xl bg-auralis-highlight flex items-center justify-center text-auralis-accent mb-4">
                    <Icon className="w-5 h-5" />
                  </div>

                  <h3 className="font-heading font-bold text-lg text-auralis-text mb-1 leading-snug">
                    {step.title}
                  </h3>
                  <div className="text-xs font-semibold text-auralis-accent mb-3">
                    {step.subtitle}
                  </div>
                  <p className="text-xs text-auralis-muted leading-relaxed mb-6">
                    {step.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-auralis-border/60 space-y-2">
                  {step.details.map((detail, dIdx) => (
                    <div key={dIdx} className="flex items-start gap-2 text-[11px] text-auralis-text/80">
                      <CheckCircle2 className="w-3.5 h-3.5 text-auralis-success shrink-0 mt-0.5" />
                      <span>{detail}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
