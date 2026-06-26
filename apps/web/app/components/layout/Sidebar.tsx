"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Crown, Settings, LogOut, User } from "lucide-react";
import Image from "next/image";
import { sidebarGroups } from "./sidebarData";

type SidebarProps = {
  variant?: "desktop" | "mobile";
  onNavigate?: () => void;
};

export default function Sidebar({
  variant = "desktop",
  onNavigate,
}: SidebarProps) {
  const pathname = usePathname();
  const baseClasses =
    "w-[260px] h-screen flex-shrink-0 flex-col border-r border-zinc-800/50 bg-[#0A0A0A] px-4 py-2";
  const wrapperClasses =
    variant === "desktop"
      ? `hidden xl:flex ${baseClasses}`
      : `flex ${baseClasses}`;

  return (
    <aside className={wrapperClasses}>
      {/* Logo */}
      <div className="mb-8 flex items-center px-2">
        <Link href="/" className="">
          <Image src="/bird.png" alt="Vector Logo" width={50} height={50} />
        </Link>
        <div className="mt-3">
          <Image
            src="/vector1.png"
            alt="Vector Logo"
            width={100}
            height={100}
          />
          <p className="text-[10px] text-zinc-500 ml-2">Execution OS</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-6">
        {sidebarGroups.map((group) => (
          <div key={group.section}>
            <p className="mb-2 px-3 text-[10px] font-semibold tracking-wider text-zinc-600 uppercase">
              {group.section}
            </p>

            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href ||
                  pathname.startsWith(`${item.href}/`);

                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={isActive ? "page" : undefined}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-white text-black"
                        : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                    }`}
                  >
                    <Icon size={18} strokeWidth={2} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="space-y-3 border-t border-zinc-800/50 pt-4">
        <Link
          href="/profile"
          onClick={onNavigate}
          className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
            pathname === "/profile"
              ? "bg-white text-black"
              : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
          }`}
        >
          <User size={18} strokeWidth={2} />
          Profile
        </Link>
        <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-400 transition-colors hover:bg-zinc-900 hover:text-white">
          <Settings size={18} strokeWidth={2} />
          Settings
        </button>
        <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-400 transition-colors hover:bg-zinc-900 hover:text-white">
          <LogOut size={18} strokeWidth={2} />
          Logout
        </button>
      </div>
    </aside>
  );
}
