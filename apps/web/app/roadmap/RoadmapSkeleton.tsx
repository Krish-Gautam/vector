export default function RoadmapSkeleton() {
  return (
    <div className="max-w-[1400px] px-4 md:px-8 py-8 animate-pulse">
      <div className="mb-6 md:mb-8 pb-5 md:pb-6 border-b border-zinc-900 space-y-4">
        <div className="h-3 w-32 rounded-full bg-zinc-900" />
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0 space-y-3 flex-1">
            <div className="h-7 w-80 max-w-[80vw] rounded-lg bg-zinc-900" />
            <div className="h-4 w-96 max-w-[85vw] rounded-lg bg-zinc-900" />
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <div className="h-10 w-full lg:w-65 rounded-xl bg-zinc-900" />
            <div className="flex gap-3">
              <div className="h-10 w-32 rounded-xl bg-zinc-900" />
              <div className="h-10 w-28 rounded-xl bg-zinc-900" />
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="bg-[#0d0e12]/30 border border-zinc-800/70 rounded-2xl p-5 space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="h-4 w-28 rounded-full bg-zinc-900" />
                <div className="h-10 w-10 rounded-xl bg-zinc-900" />
              </div>
              <div className="h-7 w-20 rounded-lg bg-zinc-900" />
              <div className="h-2.5 w-full rounded-full bg-zinc-900" />
            </div>
          ))}
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2 sm:hidden">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="shrink-0 flex items-center gap-3 bg-[#0d0e12]/30 border border-zinc-800/70 rounded-xl px-4 py-3 min-w-32.5"
            >
              <div className="h-8 w-8 rounded-lg bg-zinc-900" />
              <div className="min-w-0 flex-1 space-y-2">
                <div className="h-4 w-12 rounded-full bg-zinc-900" />
                <div className="h-3 w-16 rounded-full bg-zinc-900" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px] gap-6 items-start">
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="rounded-2xl border border-zinc-800/60 bg-[#0b0c10]/40 p-5 md:p-6 backdrop-blur-md space-y-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-3 min-w-0 flex-1">
                  <div className="h-4 w-28 rounded-full bg-zinc-900" />
                  <div className="h-6 w-80 max-w-full rounded-lg bg-zinc-900" />
                </div>
                <div className="h-8 w-8 rounded-lg bg-zinc-900" />
              </div>

              <div className="flex gap-3 overflow-hidden">
                {Array.from({ length: 4 }).map((__, phaseIndex) => (
                  <div
                    key={phaseIndex}
                    className="min-w-32.5 flex-1 rounded-xl border border-zinc-800/70 bg-zinc-950/30 p-3 space-y-3"
                  >
                    <div className="h-3 w-16 rounded-full bg-zinc-900" />
                    <div className="h-4 w-full rounded-lg bg-zinc-900" />
                    <div className="h-3 w-20 rounded-full bg-zinc-900" />
                  </div>
                ))}
              </div>

              <div className="space-y-3 border-t border-zinc-900 pt-4">
                {Array.from({ length: 3 }).map((__, taskIndex) => (
                  <div
                    key={taskIndex}
                    className="flex items-center justify-between gap-4 rounded-xl border border-zinc-800/80 bg-zinc-900/30 p-4"
                  >
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                      <div className="h-6 w-6 rounded-lg bg-zinc-900" />
                      <div className="space-y-2 min-w-0 flex-1">
                        <div className="h-4 w-64 max-w-full rounded-full bg-zinc-900" />
                        <div className="h-3 w-32 rounded-full bg-zinc-900" />
                      </div>
                    </div>
                    <div className="h-5 w-14 rounded-full bg-zinc-900" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-6">
          {Array.from({ length: 2 }).map((_, index) => (
            <div
              key={index}
              className="bg-[#0b0c10]/40 border border-zinc-800/60 rounded-2xl p-6 backdrop-blur-md space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="h-4 w-36 rounded-full bg-zinc-900" />
                <div className="h-3 w-12 rounded-full bg-zinc-900" />
              </div>
              <div className="space-y-3">
                <div className="h-3 w-28 rounded-full bg-zinc-900" />
                <div className="h-6 w-48 max-w-full rounded-lg bg-zinc-900" />
                <div className="h-3 w-40 rounded-full bg-zinc-900" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
