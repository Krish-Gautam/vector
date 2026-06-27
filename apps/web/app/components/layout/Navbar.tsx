"use client";

import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import Link from "next/link";
import Image from "next/image";
import {
  ChevronDown,
  Home,
  LayoutDashboard,
  LogOut,
  Settings,
  User,
  Wrench,
} from "lucide-react";

import { useAuth } from "../../providers/AuthProvider";

const navItems = [
  { label: "Home", icon: Home, href: "/" },
  { label: "Roadmap", icon: Wrench, href: "/roadmap" },
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
];

const dropdownItems = [
  { label: "My Profile", icon: User, href: "/profile" },
  { label: "Account", icon: Settings, href: "/account" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, loading, signOut } = useAuth();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };

    window.addEventListener("mousedown", handleOutside);
    return () => window.removeEventListener("mousedown", handleOutside);
  }, []);

  const userEmail = user?.email ?? null;
  const userName =
    (user?.user_metadata?.username as string | undefined) ?? null;

  const handleLogout = async () => {
    await signOut();
    setOpen(false);
  };

  return (
    <header className="fixed left-1/2 top-4 md:top-6 z-50 w-[94%] max-w-6xl -translate-x-1/2 rounded-full border border-white/10 bg-black/80 shadow-[0_12px_40px_rgba(0,0,0,0.6)] backdrop-blur-2xl ring-1 ring-white/5">
      <div className="mx-auto flex h-12 md:h-14 max-w-6xl items-center justify-between px-3 md:px-5">
        {/* LOGO */}
        <Link href="/" className="hidden md:flex shrink-0">
          <Image src="/logo2.png" alt="Vector Logo" width={100} height={100} />
        </Link>

        <Link href="/" className="flex md:hidden shrink-0">
          {user ? (
            <Image src="/bird.png" alt="Vector Bird" width={32} height={32} />
          ) : (
            <Image src="/logo2.png" alt="Vector Logo" width={100} height={100} />
          )}
        </Link>

        {/* NAV (Only visible when logged in) */}
        <nav className="flex items-center gap-1 md:gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                href={item.href}
                key={item.label}
                className={clsx(
                  // Desktop: always visible
                  // Mobile: only visible when logged in
                  !user && "hidden md:block",
                )}
              >
                <button className="group flex cursor-pointer items-center gap-1.5 rounded-full border border-transparent px-1 py-2 text-xs text-zinc-300 transition hover:border-white/15 hover:bg-white/5 hover:text-white md:px-4 md:py-2 md:text-sm md:font-medium">
                  <Icon
                    size={16}
                    className="shrink-0 text-zinc-400 transition group-hover:text-white md:h-[18px] md:w-[18px]"
                  />
                  <span className="inline">{item.label}</span>
                </button>
              </Link>
            );
          })}
        </nav>

        {/* PROFILE / AUTH */}
        {loading ? (
          <div className="flex items-center gap-2 shrink-0">
            <div className="h-8 w-8 rounded-full border border-white/10 bg-zinc-950 md:h-11 md:w-11" />
            <ChevronDown
              size={16}
              className="hidden cursor-pointer text-zinc-400 transition duration-300 md:block"
            />
          </div>
        ) : userEmail ? (
          <div className="relative shrink-0" ref={dropdownRef}>
            <button
              onClick={() => setOpen((prev) => !prev)}
              className="flex items-center gap-1.5 md:gap-2"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-zinc-950 md:h-11 md:w-11">
                <User size={15} className="text-zinc-300 md:hidden" />
                <User size={18} className="hidden text-zinc-300 md:block" />
              </div>

              <ChevronDown
                size={16}
                className={clsx(
                  "hidden cursor-pointer text-zinc-400 transition duration-300 md:block",
                  open && "rotate-180",
                )}
              />
            </button>

            {/* DROPDOWN */}
            <div
              className={clsx(
                "absolute right-0 top-12 w-[260px] overflow-hidden rounded-2xl border border-white/10 bg-black/95 shadow-[0_20px_80px_rgba(0,0,0,0.8)] transition-all duration-200 md:top-16 md:w-[300px]",
                open
                  ? "visible translate-y-0 opacity-100"
                  : "invisible -translate-y-2 opacity-0",
              )}
            >
              {/* TOP */}
              <div className="flex items-center gap-3 border-b border-white/10 px-3 py-3 md:gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-800">
                  <User size={18} className="text-zinc-300" />
                </div>

                <div className="min-w-0">
                  <h3 className="truncate text-[13px] font-semibold text-white">
                    {userName ?? "Profile"}
                  </h3>

                  <p className="truncate text-[12px] text-zinc-400">
                    {userEmail}
                  </p>
                </div>
              </div>

              {/* MENU ITEMS */}
              <div className="py-2">
                {dropdownItems.map((item) => {
                  const Icon = item.icon;

                  return (
                    <Link href={item.href} key={item.label}>
                      <button
                        onClick={() => setOpen(false)}
                        className="flex w-full cursor-pointer items-center justify-between px-3 py-2 transition hover:bg-white/5"
                      >
                        <div className="flex items-center gap-3">
                          <Icon size={18} className="shrink-0 text-zinc-400" />
                          <span className="text-sm font-medium">
                            {item.label}
                          </span>
                        </div>
                      </button>
                    </Link>
                  );
                })}
              </div>

              {/* LOGOUT */}
              <div className="border-t border-white/10 p-2">
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-red-500 transition hover:bg-red-500/10"
                >
                  <LogOut size={18} />
                  <span className="text-sm font-medium">Logout</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/login"
              className="rounded-full border border-white/20 px-3 py-1.5 text-xs font-semibold text-white transition hover:border-white/40 hover:bg-white/5 md:px-4 md:py-2 md:text-sm"
            >
              Login
            </Link>

            <Link
              href="/signin"
              className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-black transition hover:opacity-90 md:px-4 md:py-2 md:text-sm"
            >
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
