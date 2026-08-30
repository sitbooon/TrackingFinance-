import { Link, useRouterState } from "@tanstack/react-router";
import {
  ChevronLeft,
  ChevronRight,
  Home,
  List,
  PieChart,
  Plus,
  Settings,
} from "lucide-react";
import type { ReactNode } from "react";
import { Onboarding } from "@/components/onboarding";
import { QuickAdd } from "@/components/quick-add";
import { Skeleton } from "@/components/ui/skeleton";
import { isUnauthorized, useSnapshot } from "@/hooks/use-snapshot";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { monthLabel, shiftMonth } from "@/lib/kupa";
import { useKupaUi } from "@/lib/kupa-ui";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "בית", icon: Home },
  { to: "/transactions", label: "תנועות", icon: List },
  { to: "/budget", label: "תקציב", icon: PieChart },
  { to: "/settings", label: "עוד", icon: Settings },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const { user, isPending } = useCurrentUserState();
  const snapshot = useSnapshot();

  if (isPending) return <AuthSkeleton />;
  if (!user) return <RedirectToSignIn />;
  if (snapshot.isPending) return <ShellSkeleton />;
  if (snapshot.error && isUnauthorized(snapshot.error)) {
    return <RedirectToSignIn />;
  }
  if (snapshot.error) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-bg px-6 text-center">
        <p className="text-lg font-medium">משהו השתבש</p>
        <p className="max-w-sm text-sm text-muted">
          {snapshot.error instanceof Error
            ? snapshot.error.message
            : "לא הצלחנו לטעון את הקופה"}
        </p>
      </div>
    );
  }

  if (!snapshot.data?.household) {
    return <Onboarding displayName={user.displayName} />;
  }

  return (
    <div className="min-h-dvh bg-bg text-ink">
      <TopBar householdName={snapshot.data.household.name} />
      <main className="mx-auto w-full max-w-lg px-4 pb-32 pt-3">{children}</main>
      <BottomNav />
      <QuickAdd snapshot={snapshot.data} />
    </div>
  );
}

function TopBar({ householdName }: { householdName: string }) {
  const month = useKupaUi((s) => s.month);
  const setMonth = useKupaUi((s) => s.setMonth);

  return (
    <header className="sticky top-0 z-30 border-b border-line/70 bg-bg/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-3">
        <div className="min-w-0">
          <p className="text-xs font-medium tracking-wide text-muted">קופה</p>
          <p className="truncate text-sm font-medium">{householdName}</p>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="חודש קודם"
            onClick={() => setMonth(shiftMonth(month, -1))}
            className="grid size-11 place-items-center rounded-md text-ink hover:bg-surface-2"
          >
            <ChevronRight className="size-5" />
          </button>
          <p className="min-w-28 text-center text-sm font-medium tabular-nums">
            {monthLabel(month)}
          </p>
          <button
            type="button"
            aria-label="חודש הבא"
            onClick={() => setMonth(shiftMonth(month, 1))}
            className="grid size-11 place-items-center rounded-md text-ink hover:bg-surface-2"
          >
            <ChevronLeft className="size-5" />
          </button>
        </div>
      </div>
    </header>
  );
}

function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const setAddOpen = useKupaUi((s) => s.setAddOpen);

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 backdrop-blur-sm"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-auto grid max-w-lg grid-cols-5 items-end px-2 pt-1">
        <NavLink item={NAV[0]} pathname={pathname} />
        <NavLink item={NAV[1]} pathname={pathname} />
        <button
          type="button"
          onClick={() => setAddOpen(true)}
          className="-mt-5 mb-1 flex flex-col items-center gap-1"
          aria-label="הוספת תנועה"
        >
          <span className="grid size-14 place-items-center rounded-full bg-accent text-accent-fg shadow-card">
            <Plus className="size-6" strokeWidth={2.25} />
          </span>
          <span className="text-xs font-medium text-accent">הוספה</span>
        </button>
        <NavLink item={NAV[2]} pathname={pathname} />
        <NavLink item={NAV[3]} pathname={pathname} />
      </div>
    </nav>
  );
}

function NavLink({
  item,
  pathname,
}: {
  item: (typeof NAV)[number];
  pathname: string;
}) {
  const active =
    item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
  const Icon = item.icon;
  return (
    <Link
      to={item.to}
      className={cn(
        "flex min-h-14 flex-col items-center justify-center gap-0.5 text-xs",
        active ? "font-medium text-accent" : "text-muted",
      )}
    >
      <Icon className="size-5" strokeWidth={active ? 2.25 : 1.75} />
      {item.label}
    </Link>
  );
}

function AuthSkeleton() {
  return (
    <div className="flex min-h-dvh flex-col justify-center bg-bg px-6">
      <div className="mx-auto flex w-full max-w-md flex-col gap-4">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-12 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="mt-6 h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    </div>
  );
}

function ShellSkeleton() {
  return (
    <div className="min-h-dvh bg-bg px-4 pt-6">
      <div className="mx-auto flex max-w-lg flex-col gap-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-28" />
          <Skeleton className="h-10 w-36" />
        </div>
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-16 w-full rounded-xl" />
        <Skeleton className="h-16 w-full rounded-xl" />
        <Skeleton className="h-16 w-full rounded-xl" />
      </div>
    </div>
  );
}
