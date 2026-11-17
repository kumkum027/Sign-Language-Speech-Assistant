"use client";

import { useState } from "react";
import { GraduationCap, BookOpen, CheckCircle, Mic, Download } from "lucide-react";

export function InclusiveClassrooms() {
  const [activeTab, setActiveTab] = useState("teacher");

  return (
    <section className="py-24 border-t border-auralis-border bg-white" id="inclusive-classrooms">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-auralis-accent bg-auralis-highlight px-3 py-1 rounded-full border border-auralis-secondary/60">
            Tailored Experiences
          </span>
          <h2 className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-5xl tracking-tight text-auralis-text mt-4 mb-4">
            Built for instructors. Crafted for students.
          </h2>
          <p className="text-base text-auralis-muted leading-relaxed">
            Both roles share the same live lecture, but with specialized interfaces tailored to teaching speed and reading comfort.
          </p>

          <div className="inline-flex p-1.5 rounded-xl bg-auralis-bg border border-auralis-border mt-8">
            <button
              onClick={() => setActiveTab("teacher")}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                activeTab === "teacher"
                  ? "bg-auralis-accent text-white shadow-tactile"
                  : "text-auralis-muted hover:text-auralis-text"
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>For Teachers</span>
            </button>
            <button
              onClick={() => setActiveTab("student")}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                activeTab === "student"
                  ? "bg-auralis-accent text-white shadow-tactile"
                  : "text-auralis-muted hover:text-auralis-text"
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>For Students</span>
            </button>
          </div>
        </div>

        {activeTab === "teacher" ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-auralis-bg rounded-2xl border border-auralis-border p-8 lg:p-12">
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-auralis-accent">
                <GraduationCap className="w-4 h-4" />
                <span>Instructor Command Workspace</span>
              </div>
              <h3 className="font-heading font-extrabold text-2xl sm:text-3xl text-auralis-text">
                Teach naturally without intrusive hardware or software setup.
              </h3>
              <p className="text-sm text-auralis-muted leading-relaxed">
                Generate a 6-character room code, share it on the projector, and start speaking. Auralis handles voice recognition, student join events, and sign language notifications automatically.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3 text-sm text-auralis-text">
                  <CheckCircle className="w-5 h-5 text-auralis-success shrink-0 mt-0.5" />
                  <span><strong>One-Click Classroom Launch:</strong> Instant room code generation with automatic roster management.</span>
                </div>
                <div className="flex items-start gap-3 text-sm text-auralis-text">
                  <CheckCircle className="w-5 h-5 text-auralis-success shrink-0 mt-0.5" />
                  <span><strong>Non-Intrusive Mic Control:</strong> Pause recognition when discussing administrative matters or taking quick sips of water.</span>
                </div>
                <div className="flex items-start gap-3 text-sm text-auralis-text">
                  <CheckCircle className="w-5 h-5 text-auralis-success shrink-0 mt-0.5" />
                  <span><strong>Student Doubt Alerts:</strong> Visual non-verbal indicator pops up whenever a deaf student signals a question via ISL.</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 bg-white rounded-xl border border-auralis-border p-6 shadow-tactile space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-auralis-border">
                <div className="text-xs font-mono font-bold text-auralis-muted">TEACHER CONSOLE PREVIEW</div>
                <div className="text-xs font-bold text-auralis-success bg-emerald-50 px-2 py-0.5 rounded">SESSION ACTIVE</div>
              </div>

              <div className="p-4 rounded-xl bg-auralis-bg border border-auralis-border flex items-center justify-between">
                <div>
                  <div className="text-xs text-auralis-muted">Classroom Code</div>
                  <div className="font-mono text-xl font-extrabold text-auralis-accent tracking-wider">AURA-842</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-auralis-muted">Enrolled Students</div>
                  <div className="font-heading text-lg font-bold text-auralis-text">38 Connected</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-auralis-dark text-white text-xs flex items-center gap-2 justify-center font-semibold">
                  <Mic className="w-4 h-4 text-auralis-secondary" />
                  <span>Mute Speech (Spacebar)</span>
                </div>
                <div className="p-3 rounded-lg bg-red-50 text-red-700 border border-red-200 text-xs flex items-center gap-2 justify-center font-semibold">
                  <span>End Lecture & Save</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-auralis-bg rounded-2xl border border-auralis-border p-8 lg:p-12">
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-auralis-accent">
                <BookOpen className="w-4 h-4" />
                <span>Student Accessibility Console</span>
              </div>
              <h3 className="font-heading font-extrabold text-2xl sm:text-3xl text-auralis-text">
                Read comfortably at your own pace with total control.
              </h3>
              <p className="text-sm text-auralis-muted leading-relaxed">
                No squinting at distant projections. Every student receives a crystal-clear, scalable caption stream directly on their laptop, tablet, or smartphone.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3 text-sm text-auralis-text">
                  <CheckCircle className="w-5 h-5 text-auralis-success shrink-0 mt-0.5" />
                  <span><strong>Granular Font Sizing:</strong> Scale typography from 18px up to 36px to suit personal visual comfort.</span>
                </div>
                <div className="flex items-start gap-3 text-sm text-auralis-text">
                  <CheckCircle className="w-5 h-5 text-auralis-success shrink-0 mt-0.5" />
                  <span><strong>OLED High-Contrast Mode:</strong> Black and mint theme eliminates glare and minimizes eye strain.</span>
                </div>
                <div className="flex items-start gap-3 text-sm text-auralis-text">
                  <CheckCircle className="w-5 h-5 text-auralis-success shrink-0 mt-0.5" />
                  <span><strong>Instant ISL Participation:</strong> Enable camera to signal doubts directly into the lecture feed.</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 bg-white rounded-xl border border-auralis-border p-6 shadow-tactile space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-auralis-border">
                <div className="text-xs font-mono font-bold text-auralis-muted">STUDENT DISPLAY CONTROLS</div>
                <div className="text-xs font-bold text-auralis-accent bg-auralis-highlight px-2 py-0.5 rounded">WCAG 2.2 AA</div>
              </div>

              <div className="space-y-3">
                <div className="p-3 rounded-lg border border-auralis-border flex items-center justify-between">
                  <span className="text-xs font-semibold text-auralis-text">Caption Font Size</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-auralis-accent bg-auralis-bg px-2 py-0.5 rounded">24px</span>
                  </div>
                </div>

                <div className="p-3 rounded-lg border border-auralis-border flex items-center justify-between">
                  <span className="text-xs font-semibold text-auralis-text">High Contrast (OLED)</span>
                  <span className="text-xs font-mono font-semibold text-auralis-muted">Toggle Shift+H</span>
                </div>

                <div className="p-3 rounded-lg bg-auralis-highlight border border-auralis-secondary flex items-center justify-between">
                  <span className="text-xs font-bold text-auralis-dark">Download Lecture Transcript (.txt)</span>
                  <Download className="w-4 h-4 text-auralis-accent" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
