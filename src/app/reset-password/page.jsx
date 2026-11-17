'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, ArrowRight, CheckCircle2, AlertCircle, Eye, EyeOff, ShieldCheck, KeyRound, ArrowLeft, Loader2 } from 'lucide-react';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Missing or invalid reset token. Please request a new password reset link.');
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Password reset token is missing. Please request a new link.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to reset password.');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 2500);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full mx-auto my-12">
      <div className="mb-8">
        <span className="text-xs font-mono font-bold uppercase tracking-wider text-auralis-accent bg-auralis-highlight px-3 py-1 rounded-full border border-auralis-secondary/60">
          Security Update
        </span>
        <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-auralis-text tracking-tight mt-3 mb-2">
          Create new password
        </h1>
        <p className="text-sm text-auralis-muted">
          Your new password must be at least 8 characters long.
        </p>
      </div>

      {error && (
        <div
          className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-3 mb-6"
          role="alert"
        >
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
          <div>
            <span className="font-bold">Error: </span>
            {error}
          </div>
        </div>
      )}

      {success ? (
        <div className="p-6 rounded-2xl bg-white border border-emerald-200 shadow-tactile space-y-4 text-center">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6 text-auralis-success" />
          </div>
          <h3 className="font-heading font-bold text-lg text-auralis-text">
            Password Reset Successful!
          </h3>
          <p className="text-xs text-auralis-muted leading-relaxed">
            Your new password has been saved securely. Redirecting you to the sign-in page...
          </p>
          <div className="pt-2">
            <Link
              href="/login"
              className="w-full py-3 px-6 rounded-xl bg-auralis-accent hover:bg-auralis-accent-hover text-white font-heading font-bold text-sm transition-all shadow-tactile flex items-center justify-center gap-2"
            >
              <span>Sign In Immediately</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <div>
            <label
              htmlFor="new-password"
              className="block text-xs font-bold uppercase tracking-wider text-auralis-text mb-2"
            >
              New Password
            </label>
            <div className="relative">
              <input
                id="new-password"
                type={showPassword ? 'text' : 'password'}
                required
                disabled={!token || isLoading}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="w-full px-4 py-3 rounded-xl bg-white border border-auralis-border text-sm text-auralis-text placeholder:text-auralis-muted/60 transition-colors shadow-tactile focus:outline-none focus:ring-2 focus:ring-auralis-accent pr-11"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-auralis-muted hover:text-auralis-text p-1"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label
              htmlFor="confirm-password"
              className="block text-xs font-bold uppercase tracking-wider text-auralis-text mb-2"
            >
              Confirm New Password
            </label>
            <div className="relative">
              <input
                id="confirm-password"
                type={showConfirmPassword ? 'text' : 'password'}
                required
                disabled={!token || isLoading}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your new password"
                className="w-full px-4 py-3 rounded-xl bg-white border border-auralis-border text-sm text-auralis-text placeholder:text-auralis-muted/60 transition-colors shadow-tactile focus:outline-none focus:ring-2 focus:ring-auralis-accent pr-11"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-auralis-muted hover:text-auralis-text p-1"
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={!token || isLoading}
            className="w-full mt-2 py-3.5 px-6 rounded-xl bg-auralis-accent hover:bg-auralis-accent-hover text-white font-heading font-bold text-sm transition-all shadow-tactile flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-auralis-accent focus-visible:ring-offset-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Updating Password...</span>
              </>
            ) : (
              <>
                <span>Save New Password</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <div className="text-center pt-2">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-auralis-muted hover:text-auralis-text transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Sign In</span>
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
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

        <Suspense
          fallback={
            <div className="max-w-md w-full mx-auto my-12 p-8 rounded-2xl bg-white border border-auralis-border shadow-tactile text-center">
              <Loader2 className="w-6 h-6 animate-spin text-auralis-accent mx-auto mb-3" />
              <p className="text-xs text-auralis-muted">Loading reset credentials...</p>
            </div>
          }
        >
          <ResetPasswordForm />
        </Suspense>

        <div className="text-xs text-auralis-muted flex items-center justify-between border-t border-auralis-border pt-6">
          <span>&copy; {new Date().getFullYear()} Auralis Accessible Learning System</span>
          <span className="font-mono text-[10px]">WCAG 2.1 AAA Compliant</span>
        </div>
      </div>

      {/* Right Column: Visual Info Section */}
      <div className="hidden lg:flex lg:col-span-5 bg-auralis-dark p-12 text-white flex-col justify-between relative overflow-hidden border-l border-auralis-border">
        <div className="absolute inset-0 bg-[radial-gradient(#2a2d3d_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 text-xs font-mono text-auralis-secondary mb-6">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Cryptographic Verification</span>
          </div>
          <h2 className="font-heading font-extrabold text-2xl text-white tracking-tight leading-snug">
            Protected Academic Credentials
          </h2>
          <p className="text-sm text-slate-300 mt-2 leading-relaxed">
            Your Auralis account uses salted bcrypt hashing and scoped JWT cryptographic signatures. Passwords must be at least 8 characters long.
          </p>
        </div>

        <div className="relative z-10 space-y-4">
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm space-y-1">
            <div className="text-xs font-bold text-white">Password Requirements</div>
            <div className="text-xs text-slate-300">
              Minimum 8 characters with letters, numbers, and symbols recommended.
            </div>
          </div>
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm space-y-1">
            <div className="text-xs font-bold text-white">Instant Session Sync</div>
            <div className="text-xs text-slate-300">
              Resetting your password immediately invalidates prior tokens for your security.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
