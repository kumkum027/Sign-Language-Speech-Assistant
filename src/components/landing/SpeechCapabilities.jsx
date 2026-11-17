"use client";

import { Mic, Zap, ShieldCheck, Languages, RefreshCw, Sparkles } from "lucide-react";

export function SpeechCapabilities() {
  const features = [
    {
      icon: Zap,
      title: "Interim vs. Finalized Stream Separation",
      description:
        "Volatile interim text updates on every spoken syllable for instantaneous visual feedback, while finalized segments commit cleanly without duplication or buffer overflow.",
    },
    {
      icon: Languages,
      title: "Multilingual Indian Academic Context",
      description:
        "Optimized for Indian English (en-IN), General English (en-US), and regional classroom dialects, capturing academic terminology across STEM disciplines.",
    },
    {
      icon: RefreshCw,
      title: "Uninterrupted Continuous Recognition",
      description:
        "Browser speech timeouts and silent pauses are auto-healed through an intelligent keep-alive loop, eliminating manual restarts during long lectures.",
    },
    {
      icon: ShieldCheck,
      title: "Zero Audio Stored on Third-Party Servers",
      description:
        "Raw voice waveforms are converted on the teacher's device. Audio files are never recorded or leaked, guaranteeing complete student and faculty privacy.",
    },
  ];

  return (
    <section className="py-24 border-t border-auralis-border bg-white" id="speech-capabilities">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-auralis-accent bg-auralis-highlight px-3 py-1 rounded-full border border-auralis-secondary/60">
              Vocal Stream Perception
            </span>
            <h2 className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-5xl tracking-tight text-auralis-text mt-4 mb-6 leading-tight">
              Natural speech converted at the speed of thought.
            </h2>
            <p className="text-base text-auralis-muted leading-relaxed mb-8">
              Auralis utilizes native browser Web Speech pipelines to achieve zero-installation speech transcription. The teacher simply opens the classroom tab and starts teaching.
            </p>

            <div className="space-y-6">
              {features.map((feat, idx) => {
                const Icon = feat.icon;
                return (
                  <div key={idx} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-auralis-bg border border-auralis-border flex items-center justify-center text-auralis-accent shrink-0 shadow-tactile">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-heading font-bold text-base text-auralis-text mb-1">
                        {feat.title}
                      </h4>
                      <p className="text-xs text-auralis-muted leading-relaxed">
                        {feat.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-7 bg-auralis-dark text-white rounded-2xl p-7 sm:p-9 border border-auralis-border/30 shadow-float">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
              <div className="flex items-center gap-2">
                <Mic className="w-4 h-4 text-auralis-secondary" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                  Auralis Stream vs Standard Subtitles
                </span>
              </div>
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/30">
                ACTIVE BENCHMARK
              </span>
            </div>

            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 opacity-70">
                <div className="text-[11px] font-mono text-red-300 mb-1 flex items-center justify-between">
                  <span>TRADITIONAL POST-PROCESSED SUBTITLES</span>
                  <span>Latency: ~2400ms – 4000ms</span>
                </div>
                <p className="text-sm font-sans text-white/60 line-through">
                  [Lagging 4 sentences behind] ...so the energy of the photon...
                </p>
                <div className="text-[10px] text-red-300/80 mt-1">
                  Causes loss of context during real-time professor question prompts.
                </div>
              </div>

              <div className="p-5 rounded-xl bg-gradient-to-br from-auralis-accent/30 to-emerald-950/40 border-2 border-auralis-secondary/40 shadow-tactile">
                <div className="text-xs font-mono text-auralis-secondary mb-2 flex items-center justify-between">
                  <span className="font-bold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-auralis-secondary" />
                    AURALIS SYNCHRONIZED STREAM
                  </span>
                  <span className="font-bold text-white bg-auralis-accent px-2 py-0.5 rounded text-[11px]">
                    Sub-200ms
                  </span>
                </div>
                <p className="text-lg font-heading font-semibold text-white leading-relaxed">
                  &ldquo;Notice how the kinetic energy increases linearly with the frequency of incident radiation above the threshold frequency.&rdquo;
                </p>
                <div className="mt-3 flex items-center justify-between text-xs text-auralis-secondary/90 pt-3 border-t border-white/10 font-mono">
                  <span>Confidence: 98.4%</span>
                  <span>Word Error Rate (WER): &lt; 4.1%</span>
                  <span>Auto-Punctuated</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-2">
                <div className="p-3 rounded-lg bg-white/5 border border-white/10 text-center">
                  <div className="text-xl font-heading font-extrabold text-auralis-secondary">160ms</div>
                  <div className="text-[10px] text-white/60 uppercase tracking-wider mt-1">Average Latency</div>
                </div>
                <div className="p-3 rounded-lg bg-white/5 border border-white/10 text-center">
                  <div className="text-xl font-heading font-extrabold text-auralis-secondary">0.0 MB</div>
                  <div className="text-[10px] text-white/60 uppercase tracking-wider mt-1">Server Audio Storage</div>
                </div>
                <div className="p-3 rounded-lg bg-white/5 border border-white/10 text-center">
                  <div className="text-xl font-heading font-extrabold text-auralis-secondary">100%</div>
                  <div className="text-[10px] text-white/60 uppercase tracking-wider mt-1">Browser Native</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
