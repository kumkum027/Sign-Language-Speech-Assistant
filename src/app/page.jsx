import Link from "next/link";
import { ArrowRight, Play, CheckCircle2 } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { HeroLiveInterface } from "@/components/landing/HeroLiveInterface";
import { AccessibilityChallenge } from "@/components/landing/AccessibilityChallenge";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { SpeechCapabilities } from "@/components/landing/SpeechCapabilities";
import { SignLanguageRecognition } from "@/components/landing/SignLanguageRecognition";
import { InclusiveClassrooms } from "@/components/landing/InclusiveClassrooms";
import { AccessibilityFirstDesign } from "@/components/landing/AccessibilityFirstDesign";
import { CallToAction } from "@/components/landing/CallToAction";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-auralis-bg selection:bg-auralis-secondary selection:text-auralis-dark">
      <Navbar />

      <main className="flex-1">
        <section className="relative pt-12 pb-20 lg:pt-16 lg:pb-28 overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#176B6008_1px,transparent_1px),linear-gradient(to_bottom,#176B6008_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
              <div className="lg:col-span-5 flex flex-col items-start">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-auralis-highlight/70 border border-auralis-secondary/60 text-xs font-mono font-bold tracking-wider text-auralis-accent uppercase mb-6 shadow-tactile">
                  <span className="w-2 h-2 rounded-full bg-auralis-accent animate-pulse" />
                  <span>ACCESSIBILITY, REIMAGINED</span>
                </div>

                <h1 className="font-heading font-extrabold text-4xl sm:text-5xl lg:text-6xl tracking-tight text-auralis-text leading-[1.12] mb-6">
                  Learning should{" "}
                  <span className="relative inline-block">
                    <span className="relative z-10 text-auralis-accent">never be limited</span>
                    <span className="absolute left-0 bottom-1.5 w-full h-3 bg-auralis-secondary/50 -rotate-1 z-0 rounded-sm" />
                  </span>{" "}
                  by how you hear.
                </h1>

                <p className="text-base sm:text-lg text-auralis-muted leading-relaxed mb-8 max-w-xl">
                  An intelligent classroom companion that transforms speech and supported sign language gestures into real-time captions, making education more inclusive and accessible.
                </p>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto mb-10">
                  <Link
                    href="/register"
                    className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-auralis-accent hover:bg-auralis-accent-hover text-white font-heading font-bold text-sm transition-all shadow-tactile hover:shadow group focus:outline-none focus-visible:ring-2 focus-visible:ring-auralis-accent"
                  >
                    <span>Explore the Platform</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Link>

                  <a
                    href="#how-it-works"
                    className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-white hover:bg-auralis-surface border border-auralis-border text-auralis-text font-heading font-semibold text-sm transition-all shadow-tactile focus:outline-none focus-visible:ring-2 focus-visible:ring-auralis-accent"
                  >
                    <Play className="w-4 h-4 text-auralis-accent fill-auralis-accent" />
                    <span>See How It Works</span>
                  </a>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-6 border-t border-auralis-border/80 w-full text-xs text-auralis-muted">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-auralis-success" />
                    <span>Real-Time Web Speech</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-auralis-success" />
                    <span>MediaPipe ISL Vision</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-auralis-success" />
                    <span>Socket.IO Sync</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-auralis-success" />
                    <span>WCAG 2.2 AA Standard</span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-7 relative">
                <div className="absolute -top-10 -right-10 w-96 h-96 bg-auralis-secondary/20 rounded-full blur-3xl pointer-events-none" />
                <div className="relative z-10">
                  <HeroLiveInterface />
                </div>
              </div>
            </div>
          </div>
        </section>

        <AccessibilityChallenge />
        <HowItWorks />
        <SpeechCapabilities />
        <SignLanguageRecognition />
        <InclusiveClassrooms />
        <AccessibilityFirstDesign />
        <CallToAction />
      </main>

      <Footer />
    </div>
  );
}
