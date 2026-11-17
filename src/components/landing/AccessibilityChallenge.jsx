"use client";

import { AlertCircle, Eye, VolumeX, Clock } from "lucide-react";

export function AccessibilityChallenge() {
  return (
    <section className="py-24 border-t border-auralis-border bg-white" id="challenge">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-auralis-bg border border-auralis-border text-xs font-bold uppercase tracking-wider text-auralis-accent mb-4">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>The Classroom Reality</span>
          </div>
          <h2 className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-5xl tracking-tight text-auralis-text leading-tight">
            Lip-reading captures only <span className="text-auralis-accent underline decoration-auralis-secondary decoration-4 underline-offset-4">30% to 40%</span> of spoken English.
          </h2>
          <p className="mt-5 text-lg text-auralis-muted leading-relaxed">
            In fast-paced lectures with technical jargon, mathematical derivations, and multiple speakers, deaf and hard-of-hearing students spend intense cognitive energy decoding fragmented speech instead of understanding core concepts.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch">
          <div className="md:col-span-4 p-8 rounded-2xl bg-auralis-bg border border-auralis-border flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-white border border-auralis-border flex items-center justify-center text-auralis-accent mb-6 shadow-tactile">
                <Eye className="w-6 h-6" />
              </div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-auralis-muted">Challenge 01</span>
              <h3 className="font-heading font-bold text-xl text-auralis-text mt-2 mb-3">
                Severe Cognitive Fatigue
              </h3>
              <p className="text-sm text-auralis-muted leading-relaxed">
                Lip-reading requires constant mental guesswork. Letters like &apos;p&apos;, &apos;b&apos;, and &apos;m&apos; appear identical on the lips. After 45 minutes of a STEM lecture, cognitive exhaustion severely impairs retention.
              </p>
            </div>
            <div className="mt-8 pt-4 border-t border-auralis-border text-xs font-semibold text-auralis-text">
              Result: 3.2× higher mental load compared to hearing peers.
            </div>
          </div>

          <div className="md:col-span-5 p-8 rounded-2xl bg-auralis-dark text-white border border-auralis-dark flex flex-col justify-between shadow-float">
            <div>
              <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-auralis-secondary mb-6">
                <VolumeX className="w-6 h-6" />
              </div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-auralis-secondary">Challenge 02</span>
              <h3 className="font-heading font-bold text-2xl text-white mt-2 mb-4">
                The Non-Verbal Participation Barrier
              </h3>
              <p className="text-sm text-white/80 leading-relaxed mb-4">
                Most accessibility tools only solve <em className="text-auralis-secondary not-italic font-semibold">one direction</em>: audio to text. When a deaf student who communicates in Indian Sign Language wants to ask a doubt or answer a question, they are silenced unless an expensive interpreter is physically present.
              </p>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-xs space-y-2">
                <div className="flex items-center gap-2 font-semibold text-auralis-secondary">
                  <span>How Auralis Solves This:</span>
                </div>
                <p className="text-white/70">
                  Dual-direction bridging: Teacher&apos;s voice becomes captions for students; student&apos;s ISL gestures become readable text for the teacher.
                </p>
              </div>
            </div>
            <div className="mt-8 pt-4 border-t border-white/15 flex items-center justify-between text-xs text-white/70">
              <span>Bilateral Equality</span>
              <span className="text-auralis-secondary font-mono">100% In-Browser</span>
            </div>
          </div>

          <div className="md:col-span-3 p-8 rounded-2xl bg-auralis-bg border border-auralis-border flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-white border border-auralis-border flex items-center justify-center text-auralis-accent mb-6 shadow-tactile">
                <Clock className="w-6 h-6" />
              </div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-auralis-muted">Challenge 03</span>
              <h3 className="font-heading font-bold text-xl text-auralis-text mt-2 mb-3">
                No Real-Time Autonomy
              </h3>
              <p className="text-sm text-auralis-muted leading-relaxed">
                Relying on peer notes after class robs students of immediate inquiry. By the time notes are transcribed hours later, the opportunity to clarify misconceptions has passed.
              </p>
            </div>
            <div className="mt-8 pt-4 border-t border-auralis-border text-xs font-semibold text-auralis-text">
              Real-time synchronization bridges this instantly.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
