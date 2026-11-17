import Link from "next/link";
import { Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-auralis-bg border-t border-auralis-border text-auralis-text" id="about">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          {/* Brand & Mission Statement (5 Cols) */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-auralis-dark text-white flex items-center justify-center font-bold text-base shadow-tactile border border-auralis-accent/30">
                <span className="text-auralis-secondary font-heading">A</span>
              </div>
              <span className="font-heading font-extrabold text-xl tracking-tight text-auralis-text">
                AURALIS
              </span>
            </div>
            <p className="text-xs text-auralis-muted leading-relaxed max-w-sm">
              An intelligent classroom accessibility ecosystem transforming spoken words and Indian Sign Language (ISL) gestures into real-time synchronized captions.
            </p>
            <div className="text-xs font-mono text-auralis-accent pt-1">
              &ldquo;Every Voice. Every Gesture. Every Student.&rdquo;
            </div>
          </div>

          {/* Navigation Links (2 Cols) */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-auralis-text">
              Platform
            </h4>
            <ul className="space-y-2 text-xs text-auralis-muted">
              <li>
                <a href="#how-it-works" className="hover:text-auralis-accent transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#speech-capabilities" className="hover:text-auralis-accent transition-colors">
                  Speech-to-Text
                </a>
              </li>
              <li>
                <a href="#sign-language" className="hover:text-auralis-accent transition-colors">
                  ISL Recognition
                </a>
              </li>
              <li>
                <a href="#inclusive-classrooms" className="hover:text-auralis-accent transition-colors">
                  Classroom Experience
                </a>
              </li>
            </ul>
          </div>

          {/* Accessibility & Standards (3 Cols) */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-auralis-text">
              Accessibility
            </h4>
            <ul className="space-y-2 text-xs text-auralis-muted">
              <li>
                <span className="text-auralis-text font-semibold">WCAG 2.2 Level AA</span>
              </li>
              <li>High-Contrast OLED Styling</li>
              <li>18px – 36px Scalable Typography</li>
              <li>Screen Reader ARIA Live Feed</li>
              <li>Full Keyboard Hotkey Support</li>
            </ul>
          </div>

          {/* User Access (2 Cols) */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-auralis-text">
              Get Started
            </h4>
            <ul className="space-y-2 text-xs text-auralis-muted">
              <li>
                <Link href="/login" className="hover:text-auralis-accent transition-colors">
                  Account Sign In
                </Link>
              </li>
              <li>
                <Link href="/register?role=teacher" className="hover:text-auralis-accent transition-colors">
                  Instructor Register
                </Link>
              </li>
              <li>
                <Link href="/register?role=student" className="hover:text-auralis-accent transition-colors">
                  Student Register
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-auralis-border/60 flex flex-col sm:flex-row items-center justify-between text-xs text-auralis-muted gap-4">
          <div>
            &copy; {new Date().getFullYear()} AURALIS Accessibility Project. Built for inclusive education.
          </div>
          <div className="flex items-center gap-1">
            <span>Engineered with</span>
            <Heart className="w-3.5 h-3.5 text-auralis-accent fill-auralis-accent" />
            <span>for deaf and hard-of-hearing learners.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
