"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, Sun, Moon, ArrowRight } from "lucide-react";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [highContrast, setHighContrast] = useState(false);

  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem("auralis_theme");
      const isDark =
        savedTheme === "dark" ||
        document.documentElement.classList.contains("dark") ||
        document.documentElement.classList.contains("high-contrast");
      if (isDark) {
        setHighContrast(true);
        document.documentElement.classList.add("high-contrast", "dark");
      }
    } catch (e) {
      // ignore
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleHighContrast = () => {
    const nextState = !highContrast;
    setHighContrast(nextState);
    if (nextState) {
      document.documentElement.classList.add("high-contrast", "dark");
      try {
        localStorage.setItem("auralis_theme", "dark");
      } catch (e) {}
    } else {
      document.documentElement.classList.remove("high-contrast", "dark");
      try {
        localStorage.setItem("auralis_theme", "light");
      } catch (e) {}
    }
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-200 border-b ${
        scrolled
          ? "bg-auralis-bg/95 backdrop-blur-md border-auralis-border shadow-tactile"
          : "bg-auralis-bg border-auralis-border/60"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Brand Identity */}
          <Link
            href="/"
            className="flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-auralis-accent rounded-lg p-1"
            aria-label="AURALIS Home"
          >
            <div className="w-10 h-10 rounded-xl bg-auralis-dark text-white flex items-center justify-center font-bold text-lg tracking-wider transition-transform group-hover:scale-[1.02] shadow-tactile border border-auralis-accent/30">
              <span className="text-auralis-secondary font-heading text-xl">A</span>
            </div>
            <div className="flex flex-col">
              <span className="font-heading font-extrabold text-xl tracking-tight text-auralis-text leading-none">
                AURALIS
              </span>
              <span className="text-[11px] font-medium text-auralis-muted tracking-wider uppercase mt-1">
                Classroom Without Barriers
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-auralis-muted">
            <a
              href="#how-it-works"
              className="hover:text-auralis-accent transition-colors py-1 focus:outline-none focus-visible:text-auralis-accent"
            >
              How It Works
            </a>
            <a
              href="#speech-capabilities"
              className="hover:text-auralis-accent transition-colors py-1 focus:outline-none focus-visible:text-auralis-accent"
            >
              Speech Captions
            </a>
            <a
              href="#sign-language"
              className="hover:text-auralis-accent transition-colors py-1 focus:outline-none focus-visible:text-auralis-accent"
            >
              ISL Gestures
            </a>
            <a
              href="#accessibility"
              className="hover:text-auralis-accent transition-colors py-1 focus:outline-none focus-visible:text-auralis-accent"
            >
              Accessibility
            </a>
            <a
              href="#about"
              className="hover:text-auralis-accent transition-colors py-1 focus:outline-none focus-visible:text-auralis-accent"
            >
              About
            </a>
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {/* High Contrast Accessibility Quick-Toggle */}
            <button
              onClick={toggleHighContrast}
              className="p-2.5 rounded-lg border border-auralis-border text-auralis-text hover:bg-auralis-surface hover:border-auralis-muted transition-colors flex items-center gap-2 text-xs font-semibold cursor-pointer"
              title="Toggle Night Mode / High Contrast"
              aria-label="Toggle Night Mode"
            >
              {highContrast ? (
                <>
                  <Sun className="w-4 h-4 text-auralis-warning" />
                  <span>Standard</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-auralis-accent" />
                  <span>Night Mode</span>
                </>
              )}
            </button>

            <Link
              href="/login"
              className="text-sm font-semibold text-auralis-text hover:text-auralis-accent px-4 py-2.5 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-auralis-accent"
            >
              Sign In
            </Link>

            <Link
              href="/register"
              className="inline-flex items-center gap-2 text-sm font-semibold text-white bg-auralis-accent hover:bg-auralis-accent-hover px-5 py-2.5 rounded-lg transition-all shadow-tactile hover:shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-auralis-accent focus-visible:ring-offset-2"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={toggleHighContrast}
              className="p-2 rounded-lg border border-auralis-border text-auralis-text"
              aria-label="Toggle High Contrast"
            >
              {highContrast ? <Sun className="w-4 h-4 text-auralis-warning" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg border border-auralis-border text-auralis-text hover:bg-auralis-surface"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-auralis-border bg-auralis-surface px-6 pt-4 pb-6 space-y-4 shadow-float animate-in fade-in slide-in-from-top-2">
          <nav className="flex flex-col space-y-3 text-base font-medium text-auralis-text">
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-auralis-accent"
            >
              How It Works
            </a>
            <a
              href="#speech-capabilities"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-auralis-accent"
            >
              Speech Captions
            </a>
            <a
              href="#sign-language"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-auralis-accent"
            >
              ISL Gestures
            </a>
            <a
              href="#accessibility"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-auralis-accent"
            >
              Accessibility
            </a>
            <a
              href="#about"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-auralis-accent"
            >
              About
            </a>
          </nav>
          <div className="pt-4 border-t border-auralis-border flex flex-col gap-3">
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 rounded-lg border border-auralis-border font-semibold text-auralis-text"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 rounded-lg bg-auralis-accent text-white font-semibold"
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
