import { UserButton } from "@clerk/nextjs";
import { Bell } from "@phosphor-icons/react/dist/ssr";

export function AppTopbar({ title }: { title?: string }) {
  return (
    <header className="sticky top-0 z-30 h-16 border-b border-[color:var(--color-border)] bg-[color:var(--color-bg)]/80 backdrop-blur-xl">
      <div className="h-full px-5 md:px-7 flex items-center justify-between gap-4">
        <div className="min-w-0">
          {title && (
            <h1 className="font-display font-bold text-[16px] tracking-[-0.018em] truncate">
              {title}
            </h1>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="w-9 h-9 rounded-full grid place-items-center border border-[color:var(--color-border)] hover:border-[color:var(--color-accent)] transition-colors"
            aria-label="Notifications"
          >
            <Bell size={15} weight="regular" className="text-fg-muted" />
          </button>
          <UserButton
            appearance={{
              elements: { avatarBox: "w-9 h-9" },
            }}
          />
        </div>
      </div>
    </header>
  );
}
