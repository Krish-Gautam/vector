"use client";

import { useState, useEffect, useRef, FC, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Eye, EyeOff, Check, X } from "lucide-react";
import { useAuth } from "../../providers/AuthProvider";
import { supabase } from "../../lib/supabase";

interface Rule {
  id: string;
  label: string;
  test: (value: string) => boolean;
}

interface RuleResult extends Rule {
  passed: boolean;
}

type FieldStatus = "idle" | "valid" | "invalid";

type TouchedFields = Partial<Record<"password" | "confirm", boolean>>;

interface FeatureItem {
  icon: string;
  label: string;
  sub: string;
}

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
}

interface FieldProps {
  label: string;
  status: FieldStatus;
  borderClass: string;
  children: ReactNode;
}

interface StatusIconProps {
  status: FieldStatus;
}

const RULES: Rule[] = [
  { id: "length", label: "At least 8 characters", test: (v) => v.length >= 8 },
  {
    id: "numSym",
    label: "One number or symbol",
    test: (v) => /[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(v),
  },
  {
    id: "case",
    label: "Upper & lowercase mix",
    test: (v) => /[A-Z]/.test(v) && /[a-z]/.test(v),
  },
];

const FEATURES: FeatureItem[] = [
  { icon: "🔐", label: "End-to-end encrypted", sub: "All messages, always" },
  {
    icon: "🧩",
    label: "Zero-knowledge architecture",
    sub: "We can't read your data",
  },
  {
    icon: "⚡",
    label: "40,000+ conversations",
    sub: "Trusted by growing teams",
  },
];

function RightPanel() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = (): void => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const nodes: Node[] = Array.from({ length: 28 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r: Math.random() * 2 + 1,
    }));

    const draw = (): void => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      nodes.forEach((n) => {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > canvas.width) n.vx *= -1;
        if (n.y < 0 || n.y > canvas.height) n.vy *= -1;
      });

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 130) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(196,162,122,${(1 - dist / 130) * 0.18})`;
            ctx.lineWidth = 0.8;
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      nodes.forEach((n) => {
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(196,162,122,0.35)";
        ctx.fill();
      });

      animRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animRef.current !== null) cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div className="relative hidden w-1/2 overflow-hidden border-l border-[#1e252c] bg-[#0d1115] md:flex flex-col justify-between px-12 py-14">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-10">
          <div className="h-2 w-2 rounded-full bg-[#c4a27a]" />
          <span className="text-xs tracking-[0.25em] uppercase text-[#5a6470]">
            Secure & Private
          </span>
        </div>

        <h2 className="text-[2.6rem] font-semibold leading-[1.15] text-[#f0ebe2] tracking-tight">
          A calm place
          <br />
          for your team
          <br />
          to connect.
        </h2>

        <p className="mt-5 text-sm leading-7 text-[#6b7580] max-w-[300px]">
          Clear controls, strong encryption, and a workflow that stays out of
          the way.
        </p>
      </div>

      <div className="relative z-10 space-y-3">
        {FEATURES.map((item) => (
          <div
            key={item.label}
            className="flex items-center gap-4 rounded-2xl border border-[#1e252c] bg-[#0f1418]/70 px-5 py-4 backdrop-blur-sm"
          >
            <span className="text-lg">{item.icon}</span>
            <div>
              <p className="text-sm font-medium text-[#ddd8d0]">{item.label}</p>
              <p className="text-xs text-[#4e5860]">{item.sub}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const Field: FC<FieldProps> = ({ label, children, borderClass }) => (
  <div>
    <label className="mb-1.5 block text-[10px] tracking-[0.15em] uppercase text-[#3e4850]">
      {label}
    </label>
    <div
      className={`flex items-center gap-3 border-b pb-2.5 transition-all duration-200 ${borderClass}`}
    >
      {children}
    </div>
  </div>
);

const StatusIcon: FC<StatusIconProps> = ({ status }) => {
  if (status === "valid")
    return <Check className="h-4 w-4 flex-shrink-0 text-[#4a9d74]" />;
  if (status === "invalid")
    return <X className="h-4 w-4 flex-shrink-0 text-[#b55a4a]" />;
  return null;
};

export default function ResetPasswordPage() {
  const { user, loading, signOut } = useAuth();
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [password, setPassword] = useState<string>("");
  const [confirm, setConfirm] = useState<string>("");
  const [touched, setTouched] = useState<TouchedFields>({});
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [redirectCount, setRedirectCount] = useState<number>(5);
  const router = useRouter();

  useEffect(() => {
    if (success) {
      const interval = setInterval(() => {
        setRedirectCount((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            router.push("/login");
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [success, router]);

  const ruleResults: RuleResult[] = RULES.map((r) => ({
    ...r,
    passed: r.test(password),
  }));

  const isPasswordValid: boolean = ruleResults.every((r) => r.passed);
  const isConfirmValid: boolean = confirm === password && confirm.length > 0;
  const allValid: boolean = isPasswordValid && isConfirmValid;

  const fieldStatus = (
    key: keyof TouchedFields,
    valid: boolean,
  ): FieldStatus => {
    if (!touched[key] && !submitted) return "idle";
    return valid ? "valid" : "invalid";
  };

  const borderClass = (status: FieldStatus): string => {
    if (status === "valid") return "border-[#4a9d74]";
    if (status === "invalid") return "border-[#b55a4a]";
    return "border-[#232b33]";
  };

  const handleBlur = (key: keyof TouchedFields): void => {
    setTouched((t) => ({ ...t, [key]: true }));
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    e.preventDefault();

    setSubmitted(true);
    setErrorText(null);

    setTouched({
      password: true,
      confirm: true,
    });

    if (!allValid || isSubmitting) return;

    try {
      setIsSubmitting(true);
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) throw error;

      // Reset successful. Sign out the user to terminate the recovery session securely
      await signOut();
      setSuccess(true);
    } catch (err: any) {
      console.error("Password reset error:", err);
      setErrorText(err.message || "Failed to update password. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#090c0f] flex items-center justify-center text-zinc-400 font-mono text-sm">
        Verifying security token...
      </div>
    );
  }

  // If no user is logged in, show an invalid session error state rather than blanking out
  if (!user) {
    return (
      <main className="min-h-screen bg-[#090c0f] flex items-center justify-center p-6">
        <div className="w-full max-w-[440px] rounded-[28px] border border-[#3a2623] bg-[#1c1211] p-8 text-center space-y-6">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#b55a4a]/10 border border-[#b55a4a]/20 text-[#b55a4a]">
            <X className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#f0ebe2]">
              Invalid or Expired Link
            </h1>
            <p className="mt-3 text-sm text-[#d28a7a] leading-6">
              The password reset link is invalid, expired, or has already been used. Please request a new reset link.
            </p>
          </div>
          <button
            onClick={() => router.push("/login")}
            className="w-full flex cursor-pointer items-center justify-center rounded-full bg-[#c4a27a] px-7 py-3 text-sm font-semibold text-[#0e1318] transition-all duration-200 hover:bg-[#b08f69] active:scale-95"
          >
            Go to login page
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen font-(family-name:--font-inter) bg-[#090c0f] p-3 md:p-6">
      <div
        className="mx-auto flex min-h-[96vh] max-w-[1200px] overflow-hidden rounded-[28px] border border-[#171d24] bg-[#0e1318] shadow-2xl"
        style={{ animation: "fadeIn 0.5s ease both" }}
      >
        {/* LEFT — FORM */}
        <div className="flex w-full flex-col justify-between px-6 py-8 md:w-1/2 md:px-14">
          {/* TOP NAV */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push("/login")}
              className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-[#232b33] text-[#c4c0b8] transition hover:border-[#c4a27a] hover:text-[#c4a27a] active:scale-95"
              aria-label="Cancel and go to login"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>

            <span className="text-xs text-[#4e5860]">
              Secure session active
            </span>
          </div>

          {/* FORM BODY */}
          <div
            className="mx-auto w-full max-w-[400px] py-8"
            style={{ animation: "fadeUp 0.6s ease both" }}
          >
            {success ? (
              <div className="space-y-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#4a9d74]/10 border border-[#4a9d74]/20 text-[#4a9d74]">
                  <Check className="h-6 w-6" />
                </div>
                <div>
                  <h1 className="text-4xl font-semibold tracking-tight text-[#f0ebe2]">
                    Password updated
                  </h1>
                  <p className="mt-3 text-sm text-[#6b7580] leading-6">
                    Your password has been reset successfully. You will be redirected to the login page in {redirectCount} seconds.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => router.push("/login")}
                  className="flex cursor-pointer items-center justify-center rounded-full bg-[#c4a27a] px-7 py-3 text-sm font-semibold text-[#0e1318] transition-all duration-200 hover:bg-[#b08f69] active:scale-95"
                >
                  Log in now
                </button>
              </div>
            ) : (
              <div>
                <p className="mb-2 text-xs tracking-[0.2em] uppercase text-[#4e5860]">
                  Security Update
                </p>
                <h1 className="text-4xl font-semibold tracking-tight text-[#f0ebe2]">
                  New password
                </h1>
                <p className="mt-2 text-sm text-[#4e5860]">
                  Please choose a strong, unique password for your account.
                </p>

                <form onSubmit={handleSubmit} className="mt-10 space-y-6">
                  {/* PASSWORD */}
                  <div>
                    <Field
                      label="New Password"
                      status={fieldStatus("password", isPasswordValid)}
                      borderClass={borderClass(
                        fieldStatus("password", isPasswordValid),
                      )}
                    >
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        placeholder="Create a strong password"
                        onChange={(e) => setPassword(e.target.value)}
                        onBlur={() => handleBlur("password")}
                        className="w-full bg-transparent text-sm text-[#e8e3d9] outline-none placeholder:text-[#2e363f]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="text-[#3e4850] transition hover:text-[#c4a27a]"
                        aria-label="Toggle password visibility"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </Field>

                    {(touched.password || password.length > 0) && (
                      <div
                        className="mt-3 space-y-1.5"
                        style={{ animation: "fadeUp 0.2s ease both" }}
                      >
                        {ruleResults.map((r) => (
                          <div
                            key={r.id}
                            className={`flex items-center gap-2 text-xs transition-all duration-300 ${
                              r.passed ? "text-[#4a9d74]" : "text-[#3e4850]"
                            }`}
                          >
                            <span
                              className={`flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${
                                r.passed
                                  ? "border-[#4a9d74] bg-[#4a9d74]/10"
                                  : "border-[#232b33]"
                              }`}
                            >
                              {r.passed && <Check className="h-2.5 w-2.5" />}
                            </span>
                            {r.label}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* CONFIRM PASSWORD */}
                  <Field
                    label="Confirm new password"
                    status={fieldStatus("confirm", isConfirmValid)}
                    borderClass={borderClass(
                      fieldStatus("confirm", isConfirmValid),
                    )}
                  >
                    <input
                      type="password"
                      value={confirm}
                      placeholder="Re-enter your password"
                      onChange={(e) => setConfirm(e.target.value)}
                      onBlur={() => handleBlur("confirm")}
                      className="w-full bg-transparent text-sm text-[#e8e3d9] outline-none placeholder:text-[#2e363f]"
                    />
                    {confirm.length > 0 && (
                      <span
                        className={`text-xs font-medium transition-all duration-300 whitespace-nowrap ${
                          isConfirmValid ? "text-[#4a9d74]" : "text-[#b55a4a]"
                        }`}
                      >
                        {isConfirmValid ? "Matches" : "No match"}
                      </span>
                    )}
                  </Field>

                  {errorText && (
                    <p className="rounded-2xl border border-[#3a2623] bg-[#1c1211] px-4 py-3 text-xs text-[#d28a7a]">
                      {errorText}
                    </p>
                  )}

                  {/* ACTIONS */}
                  <div className="mt-8">
                    <button
                      type="submit"
                      disabled={isSubmitting || !allValid}
                      className={`group flex w-full cursor-pointer items-center justify-between rounded-full px-7 py-3 text-sm font-semibold transition-all duration-200 active:scale-95 ${
                        allValid
                          ? "bg-[#c4a27a] text-[#0e1318] hover:bg-[#b08f69]"
                          : "bg-[#1a2028] text-[#3e4850] cursor-not-allowed"
                      }`}
                    >
                      Update password
                      <span
                        className={`flex h-6 w-6 items-center justify-center rounded-full transition-all ${
                          allValid ? "bg-black/10" : "bg-white/5"
                        }`}
                      >
                        <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* FOOTER */}
          <div className="text-xs text-[#2a3138]">© 2025 YourApp</div>
        </div>

        {/* RIGHT PANEL */}
        <RightPanel />
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
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
    </main>
  );
}
