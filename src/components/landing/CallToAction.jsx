"use client";

import Link from "next/link";
import { ArrowRight, GraduationCap, BookOpen, ShieldCheck } from "lucide-react";

export function CallToAction() {
  return (
    <section className="py-24 border-t border-auralis-border bg-white" id="about">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-auralis-dark text-white p-8 sm:p-12 lg:p-16 overflow-hidden border border-auralis-dark shadow-float">
          <div className="absolute inset-0 bg-[radial-gradient(#2FE4BD08_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

          <div className="relative z-10 max-w-3xl">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-auralis-secondary bg-white/10 px-3 py-1 rounded-full border border-white/20">
              Transform Your Classroom Today
            </span>
            <h2 className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-5xl tracking-tight text-white mt-6 mb-6 leading-tight">
              Bring barrier-free learning to every student in your institution.
            </h2>
            <p className="text-base sm:text-lg text-white/80 leading-relaxed mb-10">
              Join professors and students using Auralis to make technical lectures truly inclusive. No costly hardware, no complex installation—just pure, synchronized captioning.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <Link
                href="/register?role=teacher"
                className="inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-xl bg-auralis-accent text-white font-heading font-bold text-base hover:bg-auralis-accent-hover transition-all shadow-tactile group"
              >
                <GraduationCap className="w-5 h-5 text-auralis-secondary" />
                <span>Create Teacher Workspace</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>

              <Link
                href="/register?role=student"
                className="inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-xl bg-white/10 hover:bg-white/15 text-white font-heading font-bold text-base border border-white/20 transition-all"
              >
                <BookOpen className="w-5 h-5 text-auralis-secondary" />
                <span>Join as a Student</span>
              </Link>
            </div>

            <div className="mt-12 pt-8 border-t border-white/15 flex flex-wrap items-center gap-6 text-xs text-white/60">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-auralis-secondary" />
                <span>100% In-Browser Audio & Vision</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-auralis-secondary" />
                <span>Zero Server Audio Storage</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-auralis-secondary" />
                <span>Free for Educational Institutions</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
