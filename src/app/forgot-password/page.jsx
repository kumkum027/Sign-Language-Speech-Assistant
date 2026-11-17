"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema } from "@/lib/validations/auth";
import { ArrowRight, AlertCircle, Loader2, CheckCircle2, ArrowLeft, KeyRound } from "lucide-react";

export default function ForgotPasswordPage() {
  const [serverError, setServerError] = useState(null);
  const [resetData, setResetData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    setServerError(null);
    setResetData(null);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        setServerError(result.error || "Could not generate reset request. Please check the email.");
        setIsLoading(false);
        return;
      }

      setResetData(result);
    } catch (err) {
      setServerError("Network error. Please ensure the server is reachable and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-auralis-bg selection:bg-auralis-secondary selection:text-auralis-dark font-sans">
      {/* Left Column: Form Section */}
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
              Account Recovery
            </span>
            <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-auralis-text tracking-tight mt-3 mb-2">
              Forgot your password?
            </h1>
            <p className="text-sm text-auralis-muted">
              Enter your registered institutional or personal email address to create a new password.
            </p>
          </div>

          {serverError && (
            <div
              className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-3 mb-6"
              role="alert"
            >
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
              <div>
                <span className="font-bold">Reset Error: </span>
                {serverError}
              </div>
            </div>
          )}

          {resetData ? (
            <div className="p-6 rounded-2xl bg-white border border-emerald-200 shadow-tactile space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-auralis-success">
                <CheckCircle2 className="w-4 h-4 text-auralis-success" />
                <span>Authorization Verified</span>
              </div>
              <h3 className="font-heading font-bold text-lg text-auralis-text">
                Password Reset Link Generated
              </h3>
              <p className="text-xs text-auralis-muted leading-relaxed">
                A secure reset session for <span className="font-semibold text-auralis-text">{resetData.user?.email}</span> has been authorized.
              </p>

              <div className="pt-3 border-t border-auralis-border space-y-3">
                <Link
                  href={resetData.resetUrl}
                  className="w-full py-3.5 px-6 rounded-xl bg-auralis-accent hover:bg-auralis-accent-hover text-white font-heading font-bold text-sm transition-all shadow-tactile flex items-center justify-center gap-2"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>Set New Password Now</span>
                </Link>
                <Link
                  href="/login"
                  className="w-full py-2.5 text-center text-xs font-semibold text-auralis-muted hover:text-auralis-text block"
                >
                  Back to Sign In
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
              <div>
                <label
                  htmlFor="email"
                  className="block text-xs font-bold uppercase tracking-wider text-auralis-text mb-2"
                >
                  Registered Account Email
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

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3.5 px-6 rounded-xl bg-auralis-accent hover:bg-auralis-accent-hover text-white font-heading font-bold text-sm transition-all shadow-tactile flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-auralis-accent focus-visible:ring-offset-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying Email...</span>
                  </>
                ) : (
                  <>
                    <span>Continue to Reset Password</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="pt-4 border-t border-auralis-border text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-auralis-muted hover:text-auralis-text transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Return to Sign In</span>
                </Link>
              </div>
            </form>
          )}
        </div>

        <div className="text-xs text-auralis-muted">
          <span>&copy; {new Date().getFullYear()} AURALIS Accessibility Initiative.</span>
        </div>
      </div>

      {/* Right Column: Editorial Visual Panel */}
      <div className="hidden lg:flex lg:col-span-5 bg-auralis-dark text-white p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-auralis-accent/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-auralis-secondary/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mb-8 shadow-tactile">
            <KeyRound className="w-6 h-6 text-auralis-secondary" />
          </div>
          <h2 className="font-heading font-extrabold text-3xl xl:text-4xl leading-tight mb-4 text-white">
            Secure, barrier-free access for everyone.
          </h2>
          <p className="text-sm text-white/70 leading-relaxed max-w-sm">
            Regain access to your live lecture transcripts, Indian Sign Language workspace, and accessible study archive in seconds.
          </p>
        </div>

        <div className="relative z-10 pt-8 border-t border-white/15 text-xs text-white/50 font-mono">
          <span>WCAG 2.2 AAA ACCESSIBLE AUTHENTICATION</span>
        </div>
      </div>
    </div>
  );
}
