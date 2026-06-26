export default function DashboardSkeleton() {
  return (
    <div className="max-w-[1400px] px-4 md:px-8 py-8 animate-pulse">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 md:mb-10 pb-6 border-b border-zinc-900">
                  <div className="space-y-3">
                    <div className="h-3 w-28 rounded-full bg-zinc-900" />
                    <div className="h-7 w-72 max-w-[70vw] rounded-lg bg-zinc-900" />
                    <div className="h-4 w-96 max-w-[80vw] rounded-lg bg-zinc-900" />
                  </div>
                  <div className="h-10 w-10 rounded-xl border border-zinc-800 bg-zinc-900/50" />
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div
                      key={index}
                      className="rounded-xl sm:rounded-2xl border border-zinc-800/70 bg-[#0d0e12]/30 p-3 sm:p-5 space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <div className="h-3 w-20 rounded-full bg-zinc-900" />
                        <div className="h-8 w-8 rounded-lg bg-zinc-900" />
                      </div>
                      <div className="h-8 w-16 rounded-lg bg-zinc-900" />
                      <div className="h-1.5 w-full rounded-full bg-zinc-900" />
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                  <div className="lg:col-span-2 space-y-6">
                    <div className="bg-[#0b0c10]/40 border border-zinc-800/60 rounded-2xl p-6 backdrop-blur-md space-y-6">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="space-y-3">
                          <div className="h-4 w-40 rounded-full bg-zinc-900" />
                          <div className="h-3 w-72 max-w-[75vw] rounded-full bg-zinc-900" />
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-28 rounded-lg bg-zinc-900" />
                          <div className="h-8 w-28 rounded-lg bg-zinc-900" />
                        </div>
                      </div>

                      <div className="flex gap-2 overflow-hidden pb-3">
                        {Array.from({ length: 7 }).map((_, index) => (
                          <div
                            key={index}
                            className="min-w-19 rounded-xl border border-zinc-800/70 bg-zinc-950/30 p-2.5 space-y-3"
                          >
                            <div className="h-3 w-10 mx-auto rounded-full bg-zinc-900" />
                            <div className="mx-auto h-6 w-6 rounded-full bg-zinc-900" />
                            <div className="h-3 w-8 mx-auto rounded-full bg-zinc-900" />
                          </div>
                        ))}
                      </div>

                      <div className="space-y-3 border-t border-zinc-900 pt-5">
                        {Array.from({ length: 4 }).map((_, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between gap-4 rounded-xl border border-zinc-800/80 bg-zinc-900/30 p-4"
                          >
                            <div className="flex items-center gap-4 min-w-0 flex-1">
                              <div className="h-6 w-6 rounded-lg bg-zinc-900" />
                              <div className="space-y-2 min-w-0 flex-1">
                                <div className="h-4 w-64 max-w-full rounded-full bg-zinc-900" />
                                <div className="h-3 w-24 rounded-full bg-zinc-900" />
                              </div>
                            </div>
                            <div className="h-5 w-16 rounded-full bg-zinc-900" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {Array.from({ length: 3 }).map((_, index) => (
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