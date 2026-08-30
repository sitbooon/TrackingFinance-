import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useSnapshot } from "@/hooks/use-snapshot";
import { formatDayHe, formatILS, initials } from "@/lib/kupa";
import { useKupaUi } from "@/lib/kupa-ui";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/transactions")({
  component: TransactionsPage,
});

function TransactionsPage() {
  return (
    <AppShell>
      <Transactions />
    </AppShell>
  );
}

function Transactions() {
  const { data } = useSnapshot();
  const setEditingId = useKupaUi((s) => s.setEditingId);
  const setAddOpen = useKupaUi((s) => s.setAddOpen);
  const [filter, setFilter] = useState<"all" | "expense" | "income">("all");

  const list = useMemo(() => {
    if (!data) return [];
    if (filter === "all") return data.transactions;
    return data.transactions.filter((t) => t.kind === filter);
  }, [data, filter]);

  if (!data?.household) return null;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-3 gap-1 rounded-lg bg-surface-2 p-1">
        {(
          [
            ["all", "הכל"],
            ["expense", "הוצאות"],
            ["income", "הכנסות"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilter(key)}
            className={cn(
              "h-10 rounded-md text-sm font-medium transition-colors duration-150",
              filter === key ? "bg-surface text-ink shadow-card" : "text-muted",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <Card className="rounded-2xl p-6 text-center">
          <p className="font-medium">אין תנועות להצגה</p>
          <button
            type="button"
            onClick={() => setAddOpen(true)}
            className="mt-3 text-sm font-medium text-accent underline-offset-4 hover:underline"
          >
            הוספת תנועה
          </button>
        </Card>
      ) : (
        <div className="flex flex-col overflow-hidden rounded-xl border border-line bg-surface">
          {list.map((t, i) => (
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
                  {t.recurrenceId ? <Badge tone="muted">קבוע</Badge> : null}
                </span>
                <span className="block truncate text-xs text-muted">
                  {formatDayHe(t.occurredOn)}
                  {t.note ? ` · ${t.note}` : ` · ${t.createdByName}`}
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
    </div>
  );
}
