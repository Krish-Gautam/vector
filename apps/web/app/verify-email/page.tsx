"use client";

import { useEffect, useState, Suspense, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, ArrowLeft, CheckCircle2, AlertCircle, RefreshCw, Check } from "lucide-react";
import Link from "next/link";
import { supabase } from "../lib/supabase";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState<string>("");
  const [verified, setVerified] = useState<boolean>(false);
  const [resending, setResending] = useState<boolean>(false);
  const [cooldown, setCooldown] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string>("Waiting for email verification...");

  const mountedRef = useRef<boolean>(true);
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Extract email from query parameter on mount
  useEffect(() => {
    const qEmail = searchParams.get("email");
    if (qEmail) {
      setEmail(qEmail);
    } else {
      // Fallback: try storage
      const storedEmail = sessionStorage.getItem("verify_email_email");
      if (storedEmail) {
        setEmail(storedEmail);
      }
    }
  }, [searchParams]);

  // Cooldown timer effect
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((c) => c - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // Main polling & event listener for verification detection
  useEffect(() => {
    if (!email) return;

    let isMounted = true;
    let pollInterval: NodeJS.Timeout;

    const handleSuccess = async (user: any) => {
      if (verified) return;
      setVerified(true);
      setStatusMsg("Email verified! Preparing your space...");

      // Clean up cached password
      sessionStorage.removeItem(`verify_email_pwd_${email}`);
      sessionStorage.removeItem("verify_email_email");

      try {
        // Query user's profile to check if onboarding is complete
        const { data: profile } = await supabase
          .from("profiles")
          .select("onboarding_completed")
          .eq("id", user.id)
          .single();

        setTimeout(() => {
          if (mountedRef.current) {
            if (profile && profile.onboarding_completed) {
              router.replace("/dashboard");
            } else {
              router.replace("/onboarding");
            }
          }
        }, 1800); // Allow success checkmark animation to show
      } catch (err) {
        console.error("Error fetching user profile:", err);
        // Fallback to onboarding in case profile load fails or is missing
        setTimeout(() => {
          if (mountedRef.current) router.replace("/onboarding");
        }, 1800);
      }
    };

    // 1. Initial check (if user session is already set or confirmed)
    const checkCurrentSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!isMounted) return;

      if (session?.user && session.user.email === email) {
        if (session.user.email_confirmed_at) {
          await handleSuccess(session.user);
          return true;
        }
      }
      return false;
    };

    // 2. Poll for confirmation
    const startPolling = () => {
      const password = sessionStorage.getItem(`verify_email_pwd_${email}`);

      pollInterval = setInterval(async () => {
        // First check session again (in case auth listener updated it)
        const hasSession = await checkCurrentSession();
        if (hasSession) return;

        // If we have cached password, try logging in
        if (password) {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (!isMounted) return;

          if (data?.user && data.user.email_confirmed_at) {
            clearInterval(pollInterval);
            await handleSuccess(data.user);
          } else if (error && !error.message.toLowerCase().includes("confirm")) {
            // Log other unexpected errors, but keep polling
            console.warn("Polling sign-in failed:", error.message);
          }
        }
      }, 3000);
    };

    // 3. Setup auth listener for local redirects on same browser
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;
        if (session?.user && session.user.email === email && session.user.email_confirmed_at) {
          if (pollInterval) clearInterval(pollInterval);
          await handleSuccess(session.user);
        }
      }
    );

    // Initial trigger sequence
    checkCurrentSession().then((verifiedAlready) => {
      if (!verifiedAlready && isMounted) {
        startPolling();
      }
    });

    return () => {
      isMounted = false;
      if (pollInterval) clearInterval(pollInterval);
      authListener.subscription.unsubscribe();
    };
  }, [email, router, verified]);

  const handleResend = async () => {
    if (resending || cooldown > 0 || !email) return;

    setResending(true);
    setErrorMsg(null);

    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
      });

      if (error) {
        throw error;
      }

      setCooldown(60);
      setStatusMsg("Verification link resent! Check your inbox.");
    } catch (err: any) {
      console.error("Resend error:", err);
      setErrorMsg(err.message || "Failed to resend. Please try again later.");
    } fillly: {
      setResending(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-[480px] flex-col items-center justify-center p-6 text-center">
      <div
        className="w-full rounded-[28px] border border-[#1e252c] bg-[#0e1318]/90 p-8 shadow-2xl backdrop-blur-xl"
        style={{ animation: "fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both" }}
      >
        {/* HEADER */}
        <div className="mb-8 flex flex-col items-center">
          <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-white/5 bg-white/5 px-3.5 py-1.5 text-[10px] uppercase tracking-[0.2em] text-[#c4a27a]">
            Account Verification
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-[#f0ebe2]">
            Verify your email
          </h1>
          <p className="mt-2.5 text-sm leading-6 text-[#6b7580]">
            We sent a verification link to <br />
            <span className="font-medium text-[#c4a27a] break-all">{email || "your address"}</span>
          </p>
        </div>

        {/* LOADER ANIMATION */}
        <div className="my-10 flex flex-col items-center justify-center">
          {verified ? (
            <div className="relative flex h-24 w-24 items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-emerald-500/10 blur-md" />
              <div className="absolute inset-0 rounded-full border border-emerald-500/30 animate-pulse" />
              <div className="absolute inset-[-4px] rounded-full border-2 border-emerald-500 animate-ping [animation-duration:2s]" />
              <div
                className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-emerald-500 bg-[#0e1318]"
                style={{ animation: "scaleUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) both" }}
              >
                <Check className="h-10 w-10 text-emerald-400 stroke-[3]" />
              </div>
            </div>
          ) : (
            <div className="relative flex h-24 w-24 items-center justify-center">
              {/* Pulsing ambient glow */}
              <div className="absolute inset-0 rounded-full bg-[#c4a27a]/10 blur-lg animate-pulse" />
              {/* Outer fast spinning ring */}
              <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#c4a27a] border-r-[#c4a27a]/30 animate-spin" />
              {/* Inner slower reverse spinning ring */}
              <div className="absolute inset-2 rounded-full border-2 border-transparent border-b-[#c4a27a]/60 border-l-[#c4a27a]/10 animate-[spin_2s_linear_infinite_reverse]" />
              {/* Center Icon */}
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#0d1115] border border-[#1e252c]">
                <Mail className="h-6 w-6 text-[#c4a27a] animate-pulse" />
              </div>
            </div>
          )}

          {/* STATUS LABEL */}
          <p className={`mt-6 text-sm font-medium transition-colors duration-300 ${verified ? "text-emerald-400" : "text-[#9ca3af]"}`}>
            {statusMsg}
          </p>
        </div>

        {/* ERROR MESSAGE CONTAINER */}
        {errorMsg && (
          <div
            className="mb-6 flex items-start gap-3 rounded-2xl border border-red-500/10 bg-red-500/5 p-4 text-left text-xs text-red-400"
            style={{ animation: "fadeIn 0.3s ease both" }}
          >
            <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
            <p>{errorMsg}</p>
          </div>
        )}

        {/* ACTIONS */}
        <div className="space-y-4 border-t border-[#1e252c] pt-6">
          <button
            onClick={handleResend}
            disabled={resending || cooldown > 0}
            className={`flex w-full cursor-pointer items-center justify-center gap-2 rounded-full py-3 text-sm font-semibold transition-all duration-200 active:scale-98 ${cooldown > 0
                ? "bg-[#161a1f] text-[#4e5860] cursor-not-allowed"
                : "bg-[#c4a27a] text-[#0e1318] hover:bg-[#b08f69]"
              }`}
          >
            {resending ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Resending...
              </>
            ) : cooldown > 0 ? (
              `Resend verification link (${cooldown}s)`
            ) : (
              "Resend verification link"
            )}
          </button>

          <Link
            href="/login"
            className="inline-block text-xs font-semibold text-[#6b7580] transition hover:text-[#c4a27a]"
          >
            <span className="flex items-center gap-1.5">
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Sign In
            </span>
          </Link>
        </div>
      </div>

      <style jsx global>{`
        @keyframes scaleUp {
          from {
            transform: scale(0.85);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center bg-[#090c0f] px-4 font-(family-name:--font-inter)">
      {/* Background radial glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute left-1/2 top-1/2 h-[450px] w-[450px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#c4a27a]/5 blur-[120px]" />
      </div>

      <Suspense fallback={
        <div className="flex flex-col items-center justify-center text-zinc-400 font-mono text-sm">
          <RefreshCw className="h-6 w-6 animate-spin text-[#c4a27a] mb-2" />
          Loading...
        </div>
      }>
        <VerifyEmailContent />
      </Suspense>
    </main>
  );
}
