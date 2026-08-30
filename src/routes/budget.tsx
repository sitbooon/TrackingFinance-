import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useSnapshot } from "@/hooks/use-snapshot";
import { addCategory, saveBudgets } from "@/lib/kupa-data";
import { formatILS, parseAmount, type TxKind } from "@/lib/kupa";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/budget")({ component: BudgetPage });

function BudgetPage() {
  return (
    <AppShell>
      <BudgetEditor />
    </AppShell>
  );
}

function BudgetEditor() {
  const { data } = useSnapshot();
  const qc = useQueryClient();
  const [draft, setDraft] = useState<Record<number, string>>({});
  const [newName, setNewName] = useState("");
  const [newKind, setNewKind] = useState<TxKind>("expense");

  useEffect(() => {
    if (!data) return;
    const next: Record<number, string> = {};
    for (const c of data.categories) {
      next[c.id] = c.monthlyBudget ? String(c.monthlyBudget) : "";
    }
    setDraft(next);
  }, [data]);

  const save = useMutation({
    mutationFn: () => {
      if (!data) throw new Error("אין נתונים");
      const items = data.categories
        .filter((c) => c.kind === "expense")
        .map((c) => ({
          id: c.id,
          monthlyBudget: parseAmount(draft[c.id] ?? "") ?? 0,
        }));
      return saveBudgets({ data: { items } });
    },
    onSuccess: async () => {
      toast.success("התקציב נשמר");
      await qc.invalidateQueries({ queryKey: ["kupa"] });
    },
    onError: (err) => toast.error(err.message),
  });

  const add = useMutation({
    mutationFn: () => {
      const name = newName.trim();
      if (!name) throw new Error("הזינו שם לקטגוריה");
      return addCategory({ data: { name, kind: newKind } });
    },
    onSuccess: async () => {
      setNewName("");
      toast.success("הקטגוריה נוספה");
      await qc.invalidateQueries({ queryKey: ["kupa"] });
    },
    onError: (err) => toast.error(err.message),
  });

  if (!data?.household) return null;

  const expenses = data.categories.filter((c) => c.kind === "expense");
  const incomes = data.categories.filter((c) => c.kind === "income");
  const totalBudget = expenses.reduce((s, c) => {
    return s + (parseAmount(draft[c.id] ?? "") ?? 0);
  }, 0);
  const earned = incomes.reduce((s, c) => s + c.spent, 0);

  return (
    <div className="flex flex-col gap-5">
      <Card className="rounded-2xl p-5">
        <p className="text-sm text-muted">סך התקציב החודשי</p>
        <p className="mt-1 text-3xl font-medium tabular-nums tracking-tight">
          {formatILS(totalBudget)}
        </p>
        {earned > 0 && (
          <p className="mt-2 text-sm text-muted">
            מול הכנסות בפועל {formatILS(earned)}
            {totalBudget > earned ? " — התקציב גבוה מההכנסה" : ""}
          </p>
        )}
      </Card>

      <section className="flex flex-col gap-2">
        <h2 className="text-base font-medium">קטגוריות הוצאה</h2>
        {expenses.map((c) => {
          const budget = parseAmount(draft[c.id] ?? "") ?? 0;
          const over = budget > 0 && c.spent > budget;
          return (
            <div
              key={c.id}
              className="rounded-xl border border-line bg-surface px-4 py-3"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium">{c.name}</p>
                  <p className={cn("text-xs tabular-nums", over ? "text-danger" : "text-muted")}>
                    בפועל {formatILS(c.spent)}
                  </p>
                </div>
                <div className="relative w-28 shrink-0" dir="ltr">
                  <span className="pointer-events-none absolute inset-y-0 start-2 flex items-center text-xs text-muted">
                    ₪
                  </span>
                  <Input
                    dir="ltr"
                    inputMode="decimal"
                    className="h-10 ps-6 text-end tabular-nums"
                    placeholder="0"
                    value={draft[c.id] ?? ""}
                    onChange={(e) =>
                      setDraft((prev) => ({ ...prev, [c.id]: e.target.value }))
                    }
                  />
                </div>
              </div>
            </div>
          );
        })}
        <Button onClick={() => save.mutate()} disabled={save.isPending} size="lg">
          {save.isPending ? "שומרים…" : "שמירת תקציב"}
        </Button>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-base font-medium">קטגוריה חדשה</h2>
        <div className="grid grid-cols-2 gap-1 rounded-lg bg-surface-2 p-1">
          <button
            type="button"
            onClick={() => setNewKind("expense")}
            className={cn(
              "h-10 rounded-md text-sm font-medium",
              newKind === "expense" ? "bg-surface shadow-card" : "text-muted",
            )}
          >
            הוצאה
          </button>
          <button
            type="button"
            onClick={() => setNewKind("income")}
            className={cn(
              "h-10 rounded-md text-sm font-medium",
              newKind === "income" ? "bg-surface shadow-card" : "text-muted",
            )}
          >
            הכנסה
          </button>
        </div>
        <div className="flex gap-2">
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="למשל מתנות"
            maxLength={32}
          />
          <Button
            variant="secondary"
            onClick={() => add.mutate()}
            disabled={add.isPending}
          >
            הוספה
          </Button>
        </div>
        <p className="text-xs text-muted">
          קטגוריות הכנסה: {incomes.map((c) => c.name).join(" · ") || "אין"}
        </p>
      </section>
    </div>
  );
}
