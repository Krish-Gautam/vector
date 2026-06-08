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
    <header className="fixed left-1/2 top-6 z-50 w-[94%] max-w-6xl -translate-x-1/2 rounded-full border border-white/10 bg-black/80 shadow-[0_12px_40px_rgba(0,0,0,0.6)] backdrop-blur-2xl ring-1 ring-white/5">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5">
        {/* LOGO */}
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo2.png"
            alt="Vector Logo"
            width={100}
            height={100}
          />
        </Link>


        {/* NAV */}
        <nav className="hidden items-center gap-2 md:flex">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link href={item.href} key={item.label}>
                <button className="group cursor-pointer flex items-center gap-2 rounded-full border border-transparent px-4 py-2 text-sm font-medium text-zinc-300 transition hover:border-white/15 hover:bg-white/5 hover:text-white">
                  
                  <Icon
                    size={18}
                    className="text-zinc-400 transition group-hover:text-white"
                  />
                  {item.label}
                </button>
              </Link>
            );
          })}
        </nav>

        {/* PROFILE */}
        {loading ? (
          <div className="flex items-center gap-2">
            <div className="h-11 w-11 rounded-full border border-white/10 bg-zinc-950" />
            <ChevronDown
              size={18}
              className={clsx(
                "text-zinc-400 transition duration-300 cursor-pointer",
                open && "rotate-180",
              )}
            />
          </div>
        ) : userEmail ? (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setOpen((prev) => !prev)}
              className="flex items-center gap-2"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-zinc-950">
                <User size={18} className="text-zinc-300" />
              </div>
              <ChevronDown
                size={18}
                className={clsx(
                  "text-zinc-400 transition duration-300 cursor-pointer",
                  open && "rotate-180",
                )}
              />
            </button>

            {/* DROPDOWN */}
            <div
              className={clsx(
                "absolute right-0 top-16 w-[300px] overflow-hidden rounded-2xl border border-white/10 bg-black/95 shadow-[0_20px_80px_rgba(0,0,0,0.8)] transition-all duration-200",
                open
                  ? "visible translate-y-0 opacity-100"
                  : "invisible -translate-y-2 opacity-0",
              )}
            >
              {/* TOP */}
              <div className="flex items-center gap-4 border-b border-white/10 px-3 py-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800">
                  <User size={22} className="text-zinc-300" />
                </div>
                <div>
                  <h3 className="text-[13px] font-semibold text-white">
                    {userName ?? "Profile"}
                  </h3>
                  <p className="text-[12px] text-zinc-400">{userEmail}</p>
                </div>
              </div>

              {/* ITEMS */}
              <div className="py-2 ">
                {dropdownItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link href={item.href} key={item.label}>
                      <button className="flex w-full items-center cursor-pointer justify-between px-3 py-2 transition hover:bg-white/5">
                        <div className="flex items-center gap-3">
                          <Icon size={18} className="text-zinc-400" />
                          <span className={clsx("text-sm font-medium")}>
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
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/40 hover:bg-white/5"
            >
              Login
            </Link>
            <Link
              href="/signin"
              className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-black transition hover:opacity-90"
            >
              Sign Up
            </Link>
          </div>
        )}
      </div>
      {/* ↑ closes max-w-7xl div */}
    </header>
  );
}
