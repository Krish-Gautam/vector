"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Eye, EyeOff, X } from "lucide-react";
import { useEffect, useRef, useState, FC, ReactNode } from "react";

import { login } from "../../lib/auth";
import api from "../../lib/api";

type FieldStatus = "idle" | "valid" | "invalid";

type TouchedFields = Partial<Record<"email" | "password", boolean>>;

interface FieldProps {
  label: string;
  borderClass: string;
  children: ReactNode;
}

interface StatusIconProps {
  status: FieldStatus;
}

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

const FEATURES: FeatureItem[] = [
  { icon: "🔐", label: "End-to-end encrypted", sub: "All messages, always" },
  {
    icon: "🧩",
    label: "Zero-knowledge architecture",
    sub: "We can't read your data",
  },
  { icon: "⚡", label: "40,000+ conversations", sub: "Trusted by teams" },
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
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

      <div className="relative z-10">
        <div className="mb-10 flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-[#c4a27a]" />
          <span className="text-xs uppercase tracking-[0.25em] text-[#5a6470]">
            Secure & Private
          </span>
        </div>

        <h2 className="text-[2.6rem] font-semibold leading-[1.15] tracking-tight text-[#f0ebe2]">
          A calm place
          <br />
          for your team
          <br />
          to connect.
        </h2>

        <p className="mt-5 max-w-[300px] text-sm leading-7 text-[#6b7580]">
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
              <p className="text-sm font-medium text-[#ddd8d0]">
                {item.label}
              </p>
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
    <label className="mb-1.5 block text-[10px] uppercase tracking-[0.15em] text-[#3e4850]">
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
  if (status === "valid") {
    return <Check className="h-4 w-4 flex-shrink-0 text-[#4a9d74]" />;
  }
  if (status === "invalid") {
    return <X className="h-4 w-4 flex-shrink-0 text-[#b55a4a]" />;
  }
  return null;
};

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [touched, setTouched] = useState<TouchedFields>({});
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const router = useRouter();

  const isEmailValid: boolean = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isPasswordValid: boolean = password.length >= 8;
  const allValid: boolean = isEmailValid && isPasswordValid;

  const fieldStatus = (key: keyof TouchedFields, valid: boolean): FieldStatus => {
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
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();

    setSubmitted(true);
    setTouched({ email: true, password: true });
    setErrorMessage(null);

    if (!allValid || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await login(email, password);
      let destination = "/dashboard";

      try {
        await api.get("/api/roadmap");
      } catch (error) {
        const message =
          typeof error === "object" && error && "response" in error
            ? (error as { response?: { data?: { error?: string } } }).response?.data
                ?.error
            : null;

        if (message?.toLowerCase().includes("no roadmap") || message?.toLowerCase().includes("no goal")) {
          destination = "/onboarding";
        }
      }

      router.replace(destination);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Login failed.";
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#090c0f] p-3 font-sans md:p-6">
      <div
        className="mx-auto flex min-h-[96vh] max-w-[1200px] overflow-hidden rounded-[28px] border border-[#171d24] bg-[#0e1318] shadow-2xl"
        style={{ animation: "fadeIn 0.5s ease both" }}
      >
        {/* LEFT — FORM */}
        <div className="flex w-full flex-col justify-between px-6 py-8 md:w-1/2 md:px-14">
          {/* TOP NAV */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-[#232b33] text-[#c4c0b8] transition hover:border-[#c4a27a] hover:text-[#c4a27a] active:scale-95"
              aria-label="Go back"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>

            <p className="text-sm text-[#4e5860]">
              New here?{" "}
              <Link
                href="/signin"
                className="font-semibold text-[#c4a27a] underline-offset-2 hover:underline"
              >
                Create account
              </Link>
            </p>
          </div>

          {/* FORM BODY */}
          <div
            className="mx-auto w-full max-w-[400px] py-8"
            style={{ animation: "fadeUp 0.6s ease both" }}
          >
            <p className="mb-2 text-xs uppercase tracking-[0.2em] text-[#4e5860]">
              Welcome back
            </p>
            <h1 className="text-4xl font-semibold tracking-tight text-[#f0ebe2]">
              Sign in
            </h1>
            <p className="mt-2 text-sm text-[#4e5860]">
              Access your secure workspace in seconds.
            </p>

            <form onSubmit={handleSubmit} className="mt-10 space-y-6">
              {/* EMAIL */}
              <Field
                label="Email address"
                borderClass={borderClass(fieldStatus("email", isEmailValid))}
              >
                <input
                  type="email"
                  value={email}
                  placeholder=""
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => handleBlur("email")}
                  className="w-full bg-transparent text-sm text-[#e8e3d9] outline-none placeholder:text-[#2e363f]"
                />
                <StatusIcon status={fieldStatus("email", isEmailValid)} />
              </Field>

              {/* PASSWORD */}
              <div>
                <Field
                  label="Password"
                  borderClass={borderClass(
                    fieldStatus("password", isPasswordValid)
                  )}
                >
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    placeholder=""
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

                <p className="mt-2 text-xs text-[#2e363f]">
                  Use at least 8 characters.
                </p>
              </div>

              {errorMessage && (
                <p className="rounded-2xl border border-[#3a2623] bg-[#1c1211] px-4 py-3 text-xs text-[#d28a7a]">
                  {errorMessage}
                </p>
              )}

              {/* ACTIONS */}
              <div className="mt-6 flex items-center gap-5">
                <button
                  type="submit"
                  disabled={!allValid || isSubmitting}
                  className={`group flex cursor-pointer items-center gap-3 rounded-full px-7 py-3 text-sm font-semibold transition-all duration-200 active:scale-95 ${
                    allValid
                      ? "bg-[#c4a27a] text-[#0e1318] hover:bg-[#b08f69]"
                      : "cursor-not-allowed bg-[#1a2028] text-[#3e4850]"
                  }`}
                >
                  {isSubmitting ? "Signing in" : "Sign in"}
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full transition-all ${
                      allValid ? "bg-black/10" : "bg-white/5"
                    }`}
                  >
                    <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </button>

                <span className="text-xs text-[#2e363f]">or</span>

                <div className="text-xs text-[#4e5860]">
                  Continue with SSO
                </div>
              </div>
            </form>
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