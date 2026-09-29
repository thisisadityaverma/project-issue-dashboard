function RowSkeleton() {
  return (
    <li className="flex flex-col gap-3 px-5 py-4 sm:px-6 lg:flex-row lg:items-center lg:gap-6">
      <div className="flex-1 space-y-2.5">
        <div className="skeleton h-4 w-2/3" />
        <div className="skeleton h-3 w-full max-w-xl" />
      </div>
      <div className="flex items-center gap-3 lg:gap-4">
        <div className="skeleton h-6 w-20 rounded-full" />
        <div className="skeleton h-6 w-24 rounded-full" />
        <div className="skeleton h-7 w-7 rounded-full" />
        <div className="skeleton h-4 w-20" />
      </div>
    </li>
  );
}

export function LoadingState() {
  return (
    <div role="status" aria-live="polite">
      <span className="sr-only">Loading issues…</span>
      <div aria-hidden="true" className="space-y-6">
        <div className="glass rounded-3xl p-5 sm:p-7">
          <div className="flex items-end justify-between gap-6">
            <div className="space-y-3">
              <div className="skeleton h-14 w-24" />
              <div className="skeleton h-3 w-40" />
            </div>
            <div className="hidden gap-10 sm:flex">
              {[0, 1, 2].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="skeleton h-3 w-16" />
                  <div className="skeleton h-8 w-10" />
                </div>
              ))}
            </div>
          </div>
          <div className="skeleton mt-6 h-2.5 w-full rounded-full" />
        </div>

        <div className="glass grid gap-4 rounded-3xl p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-[1.9fr_1fr_1fr_1fr_auto]">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton h-[4.25rem] rounded-xl" />
          ))}
        </div>

        <ul className="glass divide-y divide-white/[0.07] overflow-hidden rounded-3xl">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <RowSkeleton key={i} />
          ))}
        </ul>
      </div>
    </div>
  );
}
