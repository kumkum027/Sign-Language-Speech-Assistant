"use client";

import { Eye, Keyboard, Sparkles, Sliders, ShieldCheck, SunDim } from "lucide-react";

export function AccessibilityFirstDesign() {
  const a11yPrinciples = [
    {
      icon: Eye,
      title: "WCAG 2.2 AA Contrast Compliance",
      description:
        "Every text token, caption element, and interactive button surpasses the 4.5:1 minimum contrast ratio. In high-contrast mode, contrast exceeds 14:1.",
    },
    {
      icon: Keyboard,
      title: "100% Keyboard Navigability",
      description:
        "No mouse required. Logical tab order, clear 2px focus rings with 2px offset, and hotkeys (e.g. Space to mute mic, Shift+H for high contrast).",
    },
    {
      icon: Sliders,
      title: "Dynamic Caption Scaler (18px – 36px)",
      description:
        "Captions can be enlarged up to 36px without breaking layouts or truncating sentences, catering to students with combined low vision.",
    },
    {
      icon: SunDim,
      title: "Reduced Motion & Sensory Comfort",
      description:
        "Respects OS prefers-reduced-motion settings. No dizzying 3D rotations, flashing indicators, or disorienting card flips.",
    },
    {
      icon: ShieldCheck,
      title: "Screen Reader Landmarks & ARIA Live",
      description:
        "Captions are announced via ARIA live regions (aria-live=\"polite\"), allowing assistive screen readers to convey incoming words smoothly.",
    },
    {
      icon: Sparkles,
      title: "Explicit Camera & Mic State Indicators",
      description:
        "Clear, accessible visual and tactile indicators show whether your camera and microphone are transmitting, preventing unintended streaming.",
    },
  ];

  return (
    <section className="py-24 border-t border-auralis-border bg-auralis-bg" id="accessibility">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-16">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-auralis-accent bg-auralis-highlight px-3 py-1 rounded-full border border-auralis-secondary/60">
            Design Philosophy
          </span>
          <h2 className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-5xl tracking-tight text-auralis-text mt-4 mb-4">
            Accessibility is not a feature. It is our entire foundation.
          </h2>
          <p className="text-base text-auralis-muted leading-relaxed">
            Many tools treat accessibility as an afterthought or a compliance checklist. In Auralis, every color, font weight, keybinding, and ARIA tag is engineered from the perspective of students with diverse sensory needs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {a11yPrinciples.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="p-7 rounded-2xl bg-white border border-auralis-border hover:border-auralis-accent/50 transition-all hover:shadow-tactile flex flex-col justify-between"
              >
                <div>
                  <div className="w-11 h-11 rounded-xl bg-auralis-highlight flex items-center justify-center text-auralis-accent mb-5">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-heading font-bold text-lg text-auralis-text mb-2">
                    {item.title}
                  </h3>
                  <p className="text-xs text-auralis-muted leading-relaxed">
                    {item.description}
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-auralis-border/60 flex items-center justify-between text-[11px] font-mono text-auralis-accent font-semibold">
                  <span>Standard WCAG 2.2</span>
                  <span>Level AA Compliant</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
