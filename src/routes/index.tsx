import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useSnapshot } from "@/hooks/use-snapshot";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { formatDayHe, formatILS, initials } from "@/lib/kupa";
import { useKupaUi } from "@/lib/kupa-ui";
import { cn } from "@/lib/utils";
import { LoginScreen } from "@/routes/login";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const { user, isPending } = useCurrentUserState();
  if (isPending) {
    return (
      <div className="flex min-h-dvh flex-col justify-center bg-bg px-6">
        <div className="mx-auto flex w-full max-w-md flex-col gap-4">
          <p className="text-sm font-medium tracking-wide text-muted">קופה</p>
          <Skeleton className="h-12 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="mt-6 h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    );
  }
  if (!user) return <LoginScreen />;
  return (
    <AppShell>
      <Dashboard />
    </AppShell>
  );
}

function Dashboard() {
  const { data } = useSnapshot();
  const setAddOpen = useKupaUi((s) => s.setAddOpen);
  const setEditingId = useKupaUi((s) => s.setEditingId);
  if (!data?.household) return null;

  const expenses = data.categories.filter((c) => c.kind === "expense");
  const incomes = data.categories.filter((c) => c.kind === "income");
  const spent = expenses.reduce((s, c) => s + c.spent, 0);
  const earned = incomes.reduce((s, c) => s + c.spent, 0);
  const budgeted = expenses.reduce((s, c) => s + c.monthlyBudget, 0);
  const hasBudget = budgeted > 0;
  const remainingBudget = budgeted - spent;
  const balance = earned - spent;
  const budgetRatio = hasBudget ? Math.min(spent / budgeted, 1) : 0;
  const overBudget = hasBudget && spent > budgeted;

  const recent = data.transactions.slice(0, 6);

  return (
    <div className="flex flex-col gap-5">
      <Card className="rounded-2xl p-5">
        <p className="text-sm text-muted">
          {hasBudget ? "נשאר מהתקציב" : "מאזן החודש"}
        </p>
        <p
          className={cn(
            "mt-1 text-4xl font-medium tabular-nums tracking-tight",
            (hasBudget ? remainingBudget : balance) < 0 && "text-danger",
          )}
        >
          {formatILS(hasBudget ? remainingBudget : balance)}
        </p>

        {hasBudget && (
          <div className="mt-4">
            <div className="mb-1.5 flex items-center justify-between text-xs text-muted">
              <span>
                נוצל {formatILS(spent)} מתוך {formatILS(budgeted)}
              </span>
              <span className={overBudget ? "text-danger" : undefined}>
                {Math.round((spent / budgeted) * 100)}%
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-surface-2">
              <div
                className={cn(
                  "h-full rounded-full transition-[width] duration-300",
                  overBudget ? "bg-danger" : "bg-accent",
                )}
                style={{ width: `${Math.round(budgetRatio * 100)}%` }}
              />
            </div>
          </div>
        )}

        <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-lg bg-surface-2 px-3 py-2.5">
            <p className="text-xs text-muted">הכנסות</p>
            <p className="mt-0.5 font-medium tabular-nums text-income">
              {formatILS(earned)}
            </p>
          </div>
          <div className="rounded-lg bg-surface-2 px-3 py-2.5">
            <p className="text-xs text-muted">הוצאות</p>
            <p className="mt-0.5 font-medium tabular-nums">{formatILS(spent)}</p>
          </div>
        </div>
      </Card>

      <section>
        <div className="mb-2 flex items-end justify-between">
          <h2 className="text-base font-medium">תקציב מול בפועל</h2>
          <Link to="/budget" className="text-sm text-muted hover:text-ink">
            עריכה
          </Link>
        </div>
        {expenses.length === 0 ? (
          <p className="text-sm text-muted">אין קטגוריות עדיין.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {expenses.map((c) => (
              <BudgetRow
                key={c.id}
                name={c.name}
                spent={c.spent}
                budget={c.monthlyBudget}
              />
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="mb-2 flex items-end justify-between">
          <h2 className="text-base font-medium">תנועות אחרונות</h2>
          <Link to="/transactions" className="text-sm text-muted hover:text-ink">
            הכל
          </Link>
        </div>
        {recent.length === 0 ? (
          <Card className="rounded-2xl p-5 text-center">
            <p className="font-medium">עדיין שקט החודש</p>
            <p className="mt-1 text-sm text-muted">
              הוסיפו הוצאה או הכנסה — זה לוקח כמה שניות.
            </p>
            <button
              type="button"
              onClick={() => setAddOpen(true)}
              className="mt-4 text-sm font-medium text-accent underline-offset-4 hover:underline"
            >
              הוספת תנועה
            </button>
          </Card>
        ) : (
          <div className="flex flex-col overflow-hidden rounded-xl border border-line bg-surface">
            {recent.map((t, i) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setEditingId(t.id)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 text-start hover:bg-surface-2",
                  i !== 0 && "border-t border-line",
                )}
              >
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-surface-2 text-xs font-medium">
                  {initials(t.createdByName)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="truncate font-medium">{t.categoryName}</span>
                    {t.recurrenceId ? (
                      <Badge tone="muted">קבוע</Badge>
                    ) : null}
                  </span>
                  <span className="block truncate text-xs text-muted">
                    {formatDayHe(t.occurredOn)}
                    {t.note ? ` · ${t.note}` : ""}
                  </span>
                </span>
                <span
                  className={cn(
                    "shrink-0 font-medium tabular-nums",
                    t.kind === "income" ? "text-income" : "text-ink",
                  )}
                >
                  {t.kind === "income" ? "+" : "−"}
                  {formatILS(t.amount)}
                </span>
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function BudgetRow({
  name,
  spent,
  budget,
}: {
  name: string;
  spent: number;
  budget: number;
}) {
  const has = budget > 0;
  const ratio = has ? Math.min(spent / budget, 1) : spent > 0 ? 1 : 0;
  const over = has && spent > budget;
  return (
    <div className="rounded-xl border border-line bg-surface px-4 py-3">
      <div className="flex items-baseline justify-between gap-3">
        <p className="font-medium">{name}</p>
        <p className="text-sm tabular-nums text-muted">
          <span className={over ? "font-medium text-danger" : "text-ink"}>
            {formatILS(spent)}
          </span>
          {has ? ` / ${formatILS(budget)}` : " · בלי תקציב"}
        </p>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-2">
        <div
          className={cn(
            "h-full rounded-full",
            over ? "bg-danger" : "bg-accent",
          )}
          style={{ width: `${Math.round(ratio * 100)}%` }}
        />
      </div>
    </div>
  );
}
