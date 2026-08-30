import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  deleteTransaction,
  saveTransaction,
  type MonthSnapshot,
} from "@/lib/kupa-data";
import { parseAmount, todayIso, type TxKind } from "@/lib/kupa";
import { useKupaUi } from "@/lib/kupa-ui";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerTitle } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function QuickAdd({ snapshot }: { snapshot: MonthSnapshot }) {
  const open = useKupaUi((s) => s.addOpen);
  const setOpen = useKupaUi((s) => s.setAddOpen);
  const editingId = useKupaUi((s) => s.editingId);
  const setEditingId = useKupaUi((s) => s.setEditingId);

  const editing = snapshot.transactions.find((t) => t.id === editingId) ?? null;

  const [kind, setKind] = useState<TxKind>("expense");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [occurredOn, setOccurredOn] = useState(todayIso());
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!open) return;
    if (editing) {
      setKind(editing.kind);
      setAmount(String(editing.amount));
      setCategoryId(editing.categoryId);
      setOccurredOn(editing.occurredOn);
      setNote(editing.note);
      return;
    }
    setKind("expense");
    setAmount("");
    setCategoryId(null);
    setOccurredOn(todayIso());
    setNote("");
  }, [open, editing]);

  const categories = useMemo(
    () => snapshot.categories.filter((c) => c.kind === kind),
    [snapshot.categories, kind],
  );

  useEffect(() => {
    if (categoryId && categories.some((c) => c.id === categoryId)) return;
    setCategoryId(categories[0]?.id ?? null);
  }, [categories, categoryId]);

  const qc = useQueryClient();

  const save = useMutation({
    mutationFn: () => {
      const parsed = parseAmount(amount);
      if (!parsed) throw new Error("הזינו סכום");
      if (!categoryId) throw new Error("בחרו קטגוריה");
      return saveTransaction({
        data: {
          id: editing?.id,
          amount: parsed,
          kind,
          categoryId,
          occurredOn,
          note,
        },
      });
    },
    onSuccess: async () => {
      toast.success(editing ? "התנועה עודכנה" : "נשמר");
      setOpen(false);
      setEditingId(null);
      await qc.invalidateQueries({ queryKey: ["kupa"] });
    },
    onError: (err) => toast.error(err.message),
  });

  const remove = useMutation({
    mutationFn: () => deleteTransaction({ data: { id: editing!.id } }),
    onSuccess: async () => {
      toast.success("נמחק");
      setOpen(false);
      setEditingId(null);
      await qc.invalidateQueries({ queryKey: ["kupa"] });
    },
    onError: (err) => toast.error(err.message),
  });

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerContent>
        <form
          className="flex flex-col gap-4 overflow-y-auto px-5 pb-8 pt-4"
          onSubmit={(e) => {
            e.preventDefault();
            save.mutate();
          }}
        >
          <DrawerTitle>{editing ? "עריכת תנועה" : "תנועה חדשה"}</DrawerTitle>

          <div className="grid grid-cols-2 gap-1 rounded-lg bg-surface-2 p-1">
            <KindBtn
              active={kind === "expense"}
              onClick={() => setKind("expense")}
              label="הוצאה"
            />
            <KindBtn
              active={kind === "income"}
              onClick={() => setKind("income")}
              label="הכנסה"
            />
          </div>

          <div className="flex flex-col gap-1">
            <Label htmlFor="amount">סכום</Label>
            <div className="relative" dir="ltr">
              <span className="pointer-events-none absolute inset-y-0 start-3 flex items-center text-muted">
                ₪
              </span>
              <Input
                id="amount"
                inputMode="decimal"
                dir="ltr"
                autoFocus
                className="h-14 ps-8 text-2xl font-medium tabular-nums"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label>קטגוריה</Label>
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCategoryId(c.id)}
                  className={cn(
                    "h-10 rounded-full border px-3 text-sm transition-colors duration-150",
                    categoryId === c.id
                      ? "border-accent bg-accent text-accent-fg"
                      : "border-line bg-surface text-ink hover:bg-surface-2",
                  )}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <Label htmlFor="date">תאריך</Label>
            <Input
              id="date"
              type="date"
              dir="ltr"
              value={occurredOn}
              onChange={(e) => setOccurredOn(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1">
            <Label htmlFor="note">הערה</Label>
            <Textarea
              id="note"
              rows={2}
              maxLength={280}
              placeholder="אופציונלי"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          <Button type="submit" size="lg" disabled={save.isPending}>
            {save.isPending ? "שומרים…" : editing ? "שמירת שינויים" : "שמירה"}
          </Button>

          {editing && (
            <Button
              type="button"
              variant="ghost"
              className="text-danger"
              disabled={remove.isPending}
              onClick={() => remove.mutate()}
            >
              {remove.isPending ? "מוחקים…" : "מחיקת התנועה"}
            </Button>
          )}
        </form>
      </DrawerContent>
    </Drawer>
  );
}

function KindBtn({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "h-10 rounded-md text-sm font-medium transition-colors duration-150",
        active ? "bg-surface text-ink shadow-card" : "text-muted",
      )}
    >
      {label}
    </button>
  );
}
