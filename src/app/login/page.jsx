"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@/lib/validations/auth";
import { Eye, EyeOff, ArrowRight, ShieldCheck, AlertCircle, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    setServerError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        setServerError(result.error || "Authentication failed. Please verify your credentials.");
        setIsLoading(false);
        return;
      }

      // Route based on authenticated user role
      if (result.user.role === "TEACHER") {
        router.push("/teacher/dashboard");
      } else if (result.user.role === "STUDENT") {
        router.push("/student/dashboard");
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      setServerError("Network error. Please ensure the server is reachable and try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-auralis-bg">
      <div className="lg:col-span-7 flex flex-col justify-between p-6 sm:p-12 lg:p-16">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-auralis-accent rounded-lg"
          >
            <div className="w-9 h-9 rounded-xl bg-auralis-dark text-white flex items-center justify-center font-bold text-base shadow-tactile border border-auralis-accent/30">
              <span className="text-auralis-secondary font-heading">A</span>
            </div>
            <span className="font-heading font-extrabold text-xl tracking-tight text-auralis-text">
              AURALIS
            </span>
          </Link>
        </div>

        <div className="max-w-md w-full mx-auto my-12">
          <div className="mb-8">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-auralis-accent bg-auralis-highlight px-3 py-1 rounded-full border border-auralis-secondary/60">
              Account Access
            </span>
            <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-auralis-text tracking-tight mt-3 mb-2">
              Welcome back to your inclusive classroom.
            </h1>
            <p className="text-sm text-auralis-muted">
              Sign in to manage your lectures or access live caption streams.
            </p>
          </div>

          {serverError && (
            <div
              className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-3 mb-6"
              role="alert"
            >
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
              <div>
                <span className="font-bold">Authentication failed: </span>
                {serverError}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-bold uppercase tracking-wider text-auralis-text mb-2"
              >
                Institutional or Personal Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                disabled={isLoading}
                {...register("email")}
                placeholder="name@university.edu"
                className={`w-full px-4 py-3 rounded-xl bg-white border text-sm text-auralis-text placeholder:text-auralis-muted/60 transition-colors shadow-tactile focus:outline-none focus:ring-2 focus:ring-auralis-accent ${
                  errors.email ? "border-red-400 bg-red-50/20" : "border-auralis-border"
                }`}
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? "email-error" : undefined}
              />
              {errors.email && (
                <p id="email-error" className="mt-1.5 text-xs text-red-600 font-medium">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="password"
                  className="block text-xs font-bold uppercase tracking-wider text-auralis-text"
                >
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-semibold text-auralis-accent hover:underline focus:outline-none focus-visible:ring-1 focus-visible:ring-auralis-accent"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  disabled={isLoading}
                  {...register("password")}
                  placeholder="Enter your password"
                  className={`w-full px-4 py-3 rounded-xl bg-white border text-sm text-auralis-text placeholder:text-auralis-muted/60 transition-colors shadow-tactile pr-11 focus:outline-none focus:ring-2 focus:ring-auralis-accent ${
                    errors.password ? "border-red-400 bg-red-50/20" : "border-auralis-border"
                  }`}
                  aria-invalid={Boolean(errors.password)}
                  aria-describedby={errors.password ? "password-error" : undefined}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-auralis-muted hover:text-auralis-text p-1 focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p id="password-error" className="mt-1.5 text-xs text-red-600 font-medium">
                  {errors.password.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3.5 px-6 rounded-xl bg-auralis-accent hover:bg-auralis-accent-hover text-white font-heading font-bold text-sm transition-all shadow-tactile flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-auralis-accent focus-visible:ring-offset-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-auralis-secondary" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Classroom</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-auralis-border/80 text-center text-xs text-auralis-muted">
            Don&apos;t have an Auralis account yet?{" "}
            <Link
              href="/register"
              className="font-bold text-auralis-accent hover:underline focus:outline-none"
            >
              Create an Account
            </Link>
          </div>
        </div>

        <div className="text-[11px] text-auralis-muted text-center sm:text-left flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-auralis-accent shrink-0" />
          <span>Encrypted with HTTP-Only JWT tokens. Compliant with WCAG 2.2 AA.</span>
        </div>
      </div>

      <div className="hidden lg:flex lg:col-span-5 bg-auralis-dark text-white p-12 lg:p-16 flex-col justify-between relative overflow-hidden border-l border-auralis-dark">
        <div className="absolute inset-0 bg-[radial-gradient(#2FE4BD10_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-mono font-bold tracking-wider text-auralis-secondary uppercase mb-8">
            <span>AURALIS ACCESS NETWORK</span>
          </div>

          <h2 className="font-heading font-extrabold text-3xl lg:text-4xl text-white tracking-tight leading-tight mb-6">
            &ldquo;Communication is the foundational right upon which all academic achievement is built.&rdquo;
          </h2>

          <p className="text-sm text-white/70 leading-relaxed mb-10">
            Auralis connects vocal expression and sign language gestures into a single unified classroom feed, removing the need for deaf students to rely on fragmented lip-reading.
          </p>

          <div className="space-y-4 pt-6 border-t border-white/15 text-xs text-white/80">
            <div className="flex items-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-auralis-secondary"></span>
              <span>Dual-direction speech-to-text and ISL gesture classification</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-auralis-secondary"></span>
              <span>Sub-200ms room synchronization via dedicated Socket.IO relay</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-auralis-secondary"></span>
              <span>Zero external microservices or third-party audio recording</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 pt-8 border-t border-white/15 flex items-center justify-between text-xs text-white/50 font-mono">
          <span>AURALIS CORE v1.0</span>
          <span>CAMPUS ACCESSIBILITY</span>
        </div>
      </div>
    </div>
  );
}
