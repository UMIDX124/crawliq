export default function DashboardLoading() {
  return (
    <div className="container-page py-10 md:py-12">
      <div className="flex items-center justify-between mb-8">
        <div className="space-y-3">
          <div className="skel h-3 w-32" />
          <div className="skel h-9 w-72" />
        </div>
        <div className="skel h-11 w-44" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[color:var(--color-border)] rounded-xl overflow-hidden border border-[color:var(--color-border)]">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-[color:var(--color-bg)] p-7">
            <div className="skel h-2.5 w-20 mb-4" />
            <div className="skel h-9 w-24 mb-3" />
            <div className="skel h-2 w-32" />
          </div>
        ))}
      </div>

      <div className="mt-10 rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-7">
        <div className="skel h-3 w-40 mb-6" />
        <div className="skel h-[160px] w-full" />
      </div>

      <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="skel h-3 w-24" />
              <div className="skel h-3 w-12" />
            </div>
            <div className="skel h-5 w-3/4 mb-2" />
            <div className="skel h-3 w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}
