"use client";

import { ArrowLeft, ArrowRight, Eye, EyeOff, Check, X } from "lucide-react";
import { useState, useEffect, useRef, FC, ReactNode } from "react";
import { signUp } from "../../lib/auth";
import {signInWithGoogle} from "../../lib/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../providers/AuthProvider";

interface Rule {
  id: string;
  label: string;
  test: (value: string) => boolean;
}

interface RuleResult extends Rule {
  passed: boolean;
}

type FieldStatus = "idle" | "valid" | "invalid";

type TouchedFields = Partial<
  Record<"name" | "email" | "password" | "confirm", boolean>
>;

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

interface SocialBtnProps {
  alt: string;
  src: string;
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

const SocialBtn: FC<SocialBtnProps> = ({ alt, src }) => (
  <button className="flex h-10 w-10 items-center justify-center rounded-full border border-[#1e252c] bg-[#0d1115] transition hover:border-[#c4a27a] active:scale-95">
    <img src={src} alt={alt} width={18} height={18} />
  </button>
);

export default function SignUpPage() {
  const { user, loading } = useAuth();
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirm, setConfirm] = useState<string>("");
  const [touched, setTouched] = useState<TouchedFields>({});
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [isSubmitting,setIsSubmitting]=useState(false)
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace("/roadmap");
    }
  }, [user, loading, router]);

  const isEmailValid: boolean = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isNameValid: boolean = name.trim().length >= 2;

  const ruleResults: RuleResult[] = RULES.map((r) => ({
    ...r,
    passed: r.test(password),
  }));

  const isPasswordValid: boolean = ruleResults.every((r) => r.passed);
  const isConfirmValid: boolean = confirm === password && confirm.length > 0;
  const allValid: boolean =
    isNameValid && isEmailValid && isPasswordValid && isConfirmValid;

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

  const handleGoogleSignup = async (): Promise<void> => {
  try {
    await signInWithGoogle();
  } catch (error) {
    console.error("Google signup failed:", error);
  }
};

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    e.preventDefault();

    setSubmitted(true);
    if(isSubmitting) return;

    setIsSubmitting(true)

    setTouched({
      name: true,
      email: true,
      password: true,
      confirm: true,
    });

    try {
      await signUp(email, password, name);
      console.log("Signup successful");
      sessionStorage.setItem(`verify_email_pwd_${email}`, password);
      sessionStorage.setItem("verify_email_email", email);
      router.push(`/verify-email?email=${encodeURIComponent(email)}`);
    } catch (error) {
      console.error(error);
    }
    finally{

setIsSubmitting(false)

}
  };

  if (loading || user) {
    return null;
  }

  return (
    <main className="min-h-screen font-(family-name:--font-inter) bg-[#090c0f] p-3 md:p-6 ">
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
              Already a member?{" "}
              <Link
                href="/login"
                className="font-semibold text-[#c4a27a] underline-offset-2 hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>

          {/* FORM BODY */}
          <div
            className="mx-auto w-full max-w-[400px] py-8"
            style={{ animation: "fadeUp 0.6s ease both" }}
          >
            <p className="mb-2 text-xs tracking-[0.2em] uppercase text-[#4e5860]">
              Get started
            </p>
            <h1 className="text-4xl font-semibold tracking-tight text-[#f0ebe2]">
              Create account
            </h1>
            <p className="mt-2 text-sm text-[#4e5860]">
              Secure your team's conversations from day one.
            </p>

            <form onSubmit={handleSubmit} className="mt-10 space-y-6">
              {/* NAME */}
              <Field
                label="Full name"
                status={fieldStatus("name", isNameValid)}
                borderClass={borderClass(fieldStatus("name", isNameValid))}
              >
                <input
                  type="text"
                  value={name}
                  placeholder=""
                  onChange={(e) => setName(e.target.value)}
                  onBlur={() => handleBlur("name")}
                  className="w-full bg-transparent text-sm text-[#e8e3d9] outline-none placeholder:text-[#2e363f]"
                />
                <StatusIcon status={fieldStatus("name", isNameValid)} />
              </Field>

              {/* EMAIL */}
              <Field
                label="Email address"
                status={fieldStatus("email", isEmailValid)}
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
                label="Confirm password"
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

              {/* ACTIONS */}
              <div className="mt-8 flex items-center gap-5">
                <button
                  type="submit"
                  disabled={isSubmitting && !allValid}
                  className={`group flex cursor-pointer items-center gap-3 rounded-full px-7 py-3 text-sm font-semibold transition-all duration-200 active:scale-95 ${
                    allValid
                      ? "bg-[#c4a27a] text-[#0e1318] hover:bg-[#b08f69]"
                      : "bg-[#1a2028] text-[#3e4850] cursor-not-allowed"
                  }`}
                >
                  Create account
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full transition-all ${
                      allValid ? "bg-black/10" : "bg-white/5"
                    }`}
                  >
                    <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </button>

                <span className="text-xs text-[#2e363f]">or</span>

                <div className="flex gap-2">
                  <button
                  type="button"
                    onClick={handleGoogleSignup}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-[#1e252c] bg-[#0d1115] transition hover:border-[#c4a27a] active:scale-95"
                  >
                    <img src="https://cdn-icons-png.flaticon.com/512/300/300221.png" alt="Google" width={18} height={18} />
                  </button>
                  
                </div>
              </div>
            </form>

            <p className="mt-8 text-xs text-[#2e363f] leading-5">
              By creating an account, you agree to our{" "}
              <span className="text-[#4e5860] hover:text-[#c4a27a] cursor-pointer">
                Terms
              </span>{" "}
              and{" "}
              <span className="text-[#4e5860] hover:text-[#c4a27a] cursor-pointer">
                Privacy Policy
              </span>
              .
            </p>
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
