"use client";

import React from "react";

// ── Design System (mirrors ExecutionCirclePage) ────────────
const CardShell = ({
  children,
  className = "",
}: {
  children?: React.ReactNode;
  className?: string;
}) => (
  <div
    className={`bg-[#0d0e12]/30 border border-zinc-800/70 rounded-2xl ${className}`}
  >
    {children}
  </div>
);

const Pulse = ({ className = "" }: { className?: string }) => (
  <div className={`animate-pulse rounded-md bg-zinc-900 ${className}`} />
);

const PulseCircle = ({
  className = "",
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) => (
  <div
    className={`animate-pulse rounded-full bg-zinc-900 ${className}`}
    style={style}
  />
);

// ── Shared shimmer wrapper ──────────────────────────────────
// Slightly staggers opacity via CSS animation-delay for a subtle wave feel.
const shimmerStyle = (delayMs: number): React.CSSProperties => ({
  animationDelay: `${delayMs}ms`,
});

// ── Mobile skeleton pieces ──────────────────────────────────
function MobileHeroSkeleton() {
  return (
    <CardShell className="p-3">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="min-w-0 flex-1 space-y-2">
          <Pulse className="h-4 w-32" />
          <Pulse className="h-3 w-40" />
        </div>
        <Pulse className="h-3 w-16 shrink-0" />
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="rounded-xl bg-zinc-950/40 border border-zinc-900 p-2.5 text-center space-y-1.5"
          >
            <Pulse className="h-2 w-10 mx-auto" />
            <Pulse className="h-3 w-8 mx-auto" />
          </div>
        ))}
      </div>
    </CardShell>
  );
}

function MobileAccountabilityRowSkeleton() {
  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <Pulse className="h-3.5 w-40" />
        <Pulse className="h-2.5 w-16" />
      </div>
      <div className="flex overflow-x-auto gap-4 pb-1 no-scrollbar -mx-1 px-1">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="flex flex-col items-center gap-2 min-w-[72px] shrink-0"
          >
            <PulseCircle className="h-20 w-20" style={shimmerStyle(i * 60)} />
            <Pulse className="h-2.5 w-12" />
            <Pulse className="h-2 w-8" />
          </div>
        ))}
      </div>
    </div>
  );
}

function MobileFeedSectionSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      <Pulse className="h-3.5 w-24" />
      <CardShell className="p-0">
        <div className="flex flex-col gap-3 p-4">
          <Pulse className="h-20 w-full rounded-lg" />
          <Pulse className="h-9 w-full rounded-lg" />
        </div>
        <div className="h-px mx-4 bg-zinc-900" />
        <div className="flex items-center justify-between px-4 py-3">
          <Pulse className="h-2.5 w-16" />
          <Pulse className="h-9 w-24 rounded-lg" />
        </div>
      </CardShell>

      {[0, 1].map((i) => (
        <CardShell key={i} className="p-4">
          <div className="flex gap-3 mb-4">
            <PulseCircle className="h-10 w-10 shrink-0" />
            <div className="space-y-1.5 flex-1">
              <Pulse className="h-3 w-24" />
              <Pulse className="h-2.5 w-16" />
            </div>
          </div>
          <div className="space-y-2 mb-4">
            <Pulse className="h-3 w-full" />
            <Pulse className="h-3 w-4/5" />
          </div>
          <div className="flex items-center gap-4 border-t border-zinc-900 pt-3.5">
            <Pulse className="h-3 w-10" />
            <Pulse className="h-3 w-10" />
          </div>
        </CardShell>
      ))}
    </div>
  );
}

function MobileQuickStatsSkeleton() {
  return (
    <div>
      <Pulse className="h-3.5 w-24 mb-3" />
      <div className="grid grid-cols-2 gap-2">
        {[0, 1, 2, 3, 4].map((i) => (
          <CardShell key={i} className="p-3 space-y-2">
            <Pulse className="h-2.5 w-16" />
            <Pulse className="h-4 w-10" />
            <Pulse className="h-2 w-14" />
          </CardShell>
        ))}
      </div>
    </div>
  );
}

function MobileListCardSkeleton({
  titleWidth = "w-28",
  rows = 5,
}: {
  titleWidth?: string;
  rows?: number;
}) {
  return (
    <CardShell className="p-3">
      <Pulse className={`h-3.5 ${titleWidth} mb-3`} />
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-2 min-h-[36px]">
            <Pulse className="h-3 w-5 shrink-0" />
            <PulseCircle className="h-8 w-8 shrink-0" />
            <div className="flex-1 space-y-1.5">
              <Pulse className="h-2.5 w-24" />
              <Pulse className="h-2 w-14" />
            </div>
            <Pulse className="h-3 w-10 shrink-0" />
          </div>
        ))}
      </div>
    </CardShell>
  );
}

function MobileInsightsSkeleton() {
  return (
    <CardShell className="p-3">
      <Pulse className="h-3.5 w-28 mb-3" />
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <Pulse className="h-2.5 w-32" />
          <Pulse className="h-3.5 w-8" />
        </div>
        <Pulse className="h-2 w-full rounded-full" />
        <div className="grid grid-cols-2 gap-2 pt-1">
          <Pulse className="h-10 rounded-lg" />
        </div>
      </div>
    </CardShell>
  );
}

function MobileUpgradeSkeleton() {
  return (
    <CardShell className="p-3">
      <div className="flex items-center gap-2 mb-2">
        <PulseCircle className="h-4 w-4" />
        <Pulse className="h-3.5 w-32" />
      </div>
      <Pulse className="h-2.5 w-full mb-2" />
      <Pulse className="h-2.5 w-2/3 mb-2" />
      <Pulse className="h-2 w-full rounded-full mb-1.5" />
      <Pulse className="h-2 w-10 ml-auto" />
    </CardShell>
  );
}

function MobileRequestChangeSkeleton() {
  return (
    <CardShell className="p-3 text-center">
      <Pulse className="h-3.5 w-28 mx-auto mb-2" />
      <Pulse className="h-2.5 w-48 mx-auto mb-3" />
      <Pulse className="h-10 w-full rounded-xl" />
    </CardShell>
  );
}

// ── Desktop skeleton pieces ──────────────────────────────────
function HeroSkeleton() {
  return (
    <div className="mb-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6 pb-6 border-b border-zinc-900">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Pulse className="h-2.5 w-32" />
            <Pulse className="h-4 w-16 rounded-full" />
          </div>
          <Pulse className="h-6 w-56" />
          <Pulse className="h-3.5 w-72" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[0, 1, 2].map((i) => (
          <CardShell key={i} className="p-4 flex items-center gap-4">
            <Pulse className="h-11 w-11 rounded-xl shrink-0" />
            <div className="space-y-1.5 flex-1">
              <Pulse className="h-2.5 w-20" />
              <Pulse className="h-3.5 w-24" />
            </div>
          </CardShell>
        ))}
      </div>

      <div className="mt-4 p-3.5 rounded-xl border border-zinc-800 bg-[#0d0e12]/20 flex items-center justify-between gap-3">
        <Pulse className="h-3 w-80" />
        <Pulse className="h-3 w-24 shrink-0" />
      </div>
    </div>
  );
}

function AccountabilityRowSkeleton() {
  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-6">
        <Pulse className="h-4 w-56" />
        <Pulse className="h-3 w-32" />
      </div>
      <div className="flex overflow-x-auto gap-6 pb-4 no-scrollbar">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <PulseCircle
            key={i}
            className="h-20 w-20 shrink-0"
            style={shimmerStyle(i * 60)}
          />
        ))}
      </div>
      <div className="mt-6 p-4 rounded-xl border border-zinc-800 bg-zinc-950/20 grid grid-cols-1 md:grid-cols-3 gap-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <Pulse className="h-9 w-9 rounded-lg shrink-0" />
            <div className="space-y-1.5">
              <Pulse className="h-2.5 w-16" />
              <Pulse className="h-3.5 w-20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PerformanceSectionSkeleton() {
  return (
    <div className="mb-8">
      <Pulse className="h-4 w-40 mb-6" />
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[0, 1, 2, 3, 4].map((i) => (
          <CardShell key={i} className="p-4 space-y-3">
            <Pulse className="h-2.5 w-16" />
            <Pulse className="h-5 w-12" />
            <Pulse className="h-2.5 w-14" />
          </CardShell>
        ))}
      </div>
    </div>
  );
}

function FeedSectionSkeleton() {
  return (
    <div className="pt-8 border-t border-[#171d24]">
      <Pulse className="h-4 w-28 mb-6" />
      <CardShell className="p-0 mb-6">
        <div className="flex flex-col gap-3 p-4">
          <Pulse className="h-24 w-full rounded-lg" />
          <Pulse className="h-9 w-full rounded-lg" />
        </div>
        <div className="h-px mx-4 bg-zinc-900" />
        <div className="flex items-center justify-between px-4 py-3">
          <Pulse className="h-2.5 w-16" />
          <Pulse className="h-9 w-32 rounded-lg" />
        </div>
      </CardShell>

      <div className="space-y-4">
        {[0, 1, 2].map((i) => (
          <CardShell key={i} className="p-4">
            <div className="flex gap-3 mb-4">
              <PulseCircle className="h-10 w-10 shrink-0" />
              <div className="space-y-1.5 flex-1">
                <Pulse className="h-3 w-28" />
                <Pulse className="h-2.5 w-16" />
              </div>
            </div>
            <div className="space-y-2 mb-4">
              <Pulse className="h-3 w-full" />
              <Pulse className="h-3 w-5/6" />
              <Pulse className="h-3 w-2/3" />
            </div>
            <div className="flex items-center gap-4 border-t border-zinc-900 pt-3.5">
              <Pulse className="h-3 w-10" />
              <Pulse className="h-3 w-10" />
            </div>
          </CardShell>
        ))}
      </div>
    </div>
  );
}

function SidebarSkeleton() {
  return (
    <div className="space-y-6 lg:sticky lg:top-8">
      <CardShell className="p-5">
        <Pulse className="h-4 w-32 mb-4" />
        <div className="flex justify-between items-center mb-4">
          <Pulse className="h-2.5 w-32" />
          <Pulse className="h-3.5 w-8" />
        </div>
        <Pulse className="h-20 w-full rounded-xl mb-4" />
        <div className="space-y-2">
          <div className="flex justify-between">
            <Pulse className="h-2.5 w-16" />
            <Pulse className="h-2.5 w-8" />
          </div>
          <div className="flex justify-between">
            <Pulse className="h-2.5 w-20" />
            <Pulse className="h-2.5 w-8" />
          </div>
        </div>
      </CardShell>

      <CardShell className="p-5">
        <Pulse className="h-4 w-28 mb-4" />
        <div className="space-y-3">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <Pulse className="h-3 w-5 shrink-0" />
              <PulseCircle className="h-8 w-8 shrink-0" />
              <div className="flex-1 space-y-1.5">
                <Pulse className="h-2.5 w-24" />
                <Pulse className="h-2 w-14" />
              </div>
              <Pulse className="h-3 w-8 shrink-0" />
            </div>
          ))}
        </div>
      </CardShell>

      <CardShell className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <PulseCircle className="h-4 w-4" />
          <Pulse className="h-3.5 w-36" />
        </div>
        <Pulse className="h-2.5 w-full mb-1.5" />
        <Pulse className="h-2.5 w-2/3 mb-3" />
        <Pulse className="h-2 w-full rounded-full mb-1.5" />
        <Pulse className="h-2 w-10 ml-auto" />
      </CardShell>

      <CardShell className="p-5">
        <Pulse className="h-4 w-40 mb-4" />
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-start gap-2">
              <PulseCircle className="h-7 w-7 shrink-0" />
              <div className="flex-1 space-y-1.5">
                <Pulse className="h-2.5 w-32" />
              </div>
              <Pulse className="h-2 w-10 shrink-0" />
            </div>
          ))}
        </div>
      </CardShell>

      <CardShell className="p-5 text-center">
        <Pulse className="h-3.5 w-28 mx-auto mb-2" />
        <Pulse className="h-2.5 w-48 mx-auto mb-4" />
        <Pulse className="h-9 w-full rounded-xl" />
      </CardShell>
    </div>
  );
}

// ── Main export ──────────────────────────────────────────────
export default function ExecutionSkeleton() {
  return (
    <div className="flex-1 text-[#e8e2d9] px-3 py-4 md:p-8 w-full">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between mb-4">
        <Pulse className="h-5 w-40" />
        <Pulse className="h-10 w-10 rounded-xl" />
      </div>

      {/* Mobile layout (<768px) */}
      <div className="md:hidden max-w-7xl mx-auto space-y-4 pb-6">
        <MobileHeroSkeleton />
        <MobileAccountabilityRowSkeleton />
        <MobileFeedSectionSkeleton />
        <MobileQuickStatsSkeleton />
        <MobileListCardSkeleton titleWidth="w-32" rows={5} />
        <MobileInsightsSkeleton />
        <MobileUpgradeSkeleton />
        <MobileListCardSkeleton titleWidth="w-40" rows={3} />
        <MobileRequestChangeSkeleton />
      </div>

      {/* Desktop / tablet layout */}
      <div className="hidden md:grid max-w-7xl mx-auto lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-9 space-y-8 min-w-0">
          <HeroSkeleton />
          <AccountabilityRowSkeleton />
          <PerformanceSectionSkeleton />
          <FeedSectionSkeleton />
        </div>
        <div className="lg:col-span-3">
          <SidebarSkeleton />
        </div>
      </div>
    </div>
  );
}