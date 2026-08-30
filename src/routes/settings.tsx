import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Copy, Download } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSnapshot } from "@/hooks/use-snapshot";
import { UserButton } from "@/lib/auth/gates";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import {
  addRecurrence,
  deleteRecurrence,
  exportCsv,
  renameHousehold,
  toggleRecurrence,
  updateDisplayName,
} from "@/lib/kupa-data";
import { formatILS, monthLabel, parseAmount, type TxKind } from "@/lib/kupa";
import { useKupaUi } from "@/lib/kupa-ui";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/settings")({ component: SettingsPage });

function SettingsPage() {
  return (
    <AppShell>
      <Settings />
    </AppShell>
  );
}

function Settings() {
  const { data } = useSnapshot();
  const user = useCurrentUser();
  const month = useKupaUi((s) => s.month);
  const qc = useQueryClient();

  const me = data?.members.find((m) => m.userId === user?.id);
  const [houseName, setHouseName] = useState(data?.household?.name ?? "");
  const [myName, setMyName] = useState(me?.displayName ?? "");

  useEffect(() => {
    if (data?.household?.name) setHouseName(data.household.name);
    if (me?.displayName) setMyName(me.displayName);
  }, [data?.household?.name, me?.displayName]);

  const rename = useMutation({
    mutationFn: () => renameHousehold({ data: { name: houseName } }),
    onSuccess: async () => {
      toast.success("השם עודכן");
      await qc.invalidateQueries({ queryKey: ["kupa"] });
    },
    onError: (err) => toast.error(err.message),
  });

  const renameMe = useMutation({
    mutationFn: () => updateDisplayName({ data: { displayName: myName } }),
    onSuccess: async () => {
      toast.success("השם שלך עודכן");
      await qc.invalidateQueries({ queryKey: ["kupa"] });
    },
    onError: (err) => toast.error(err.message),
  });

  if (!data?.household) return null;

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-3">
        <h2 className="text-base font-medium">הקופה</h2>
        <Card className="flex flex-col gap-4 rounded-2xl p-5">
          <div className="flex flex-col gap-2">
            <Label htmlFor="hname">שם</Label>
            <div className="flex gap-2">
              <Input
                id="hname"
                value={houseName}
                onChange={(e) => setHouseName(e.target.value)}
                maxLength={40}
              />
              <Button
                variant="secondary"
                onClick={() => rename.mutate()}
                disabled={rename.isPending}
              >
                שמירה
              </Button>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium">קוד הצטרפות</p>
            <p className="mt-1 text-sm text-muted">
              שתפו עם בת הזוג. אחרי ההתחברות היא מזינה את הקוד.
            </p>
            <div className="mt-3 flex items-center gap-2">
              <p
                dir="ltr"
                className="flex-1 rounded-md bg-surface-2 px-3 py-2 text-center text-2xl font-medium tracking-widest tabular-nums"
              >
                {data.household.inviteCode}
              </p>
              <Button
                variant="outline"
                size="icon"
                aria-label="העתקת קוד"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(data.household!.inviteCode);
                    toast.success("הקוד הועתק");
                  } catch {
                    toast.error("לא ניתן להעתיק");
                  }
                }}
              >
                <Copy />
              </Button>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium">חברים</p>
            <ul className="mt-2 flex flex-col gap-2">
              {data.members.map((m) => (
                <li key={m.userId} className="flex items-center justify-between text-sm">
                  <span>{m.displayName}</span>
                  <Badge tone={m.role === "owner" ? "accent" : "muted"}>
                    {m.role === "owner" ? "יצר/ה" : "חבר/ה"}
                  </Badge>
                </li>
              ))}
            </ul>
          </div>
        </Card>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-base font-medium">השם שלך בקופה</h2>
        <div className="flex gap-2">
          <Input
            value={myName}
            onChange={(e) => setMyName(e.target.value)}
            maxLength={40}
          />
          <Button
            variant="secondary"
            onClick={() => renameMe.mutate()}
            disabled={renameMe.isPending}
          >
            שמירה
          </Button>
        </div>
      </section>

      <RecurringBlock />

      <section className="flex flex-col gap-3">
        <h2 className="text-base font-medium">גיבוי לגיליון</h2>
        <p className="text-sm text-muted">
          ייצוא תנועות {monthLabel(month)} לקובץ שאפשר לפתוח ב-Google Sheets.
        </p>
        <Button
          variant="outline"
          onClick={async () => {
            try {
              const { csv } = await exportCsv({ data: { month } });
              const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `kupa-${month}.csv`;
              a.click();
              URL.revokeObjectURL(url);
              toast.success("הקובץ ירד");
            } catch (err) {
              toast.error(err instanceof Error ? err.message : "הייצוא נכשל");
            }
          }}
        >
          <Download />
          הורדת CSV
        </Button>
      </section>

      <section className="flex flex-col gap-3 pb-4">
        <h2 className="text-base font-medium">חשבון</h2>
        <UserButton />
      </section>
    </div>
  );
}

function RecurringBlock() {
  const { data } = useSnapshot();
  const qc = useQueryClient();
  const [amount, setAmount] = useState("");
  const [kind, setKind] = useState<TxKind>("expense");
  const [categoryId, setCategoryId] = useState<number | "">("");
  const [day, setDay] = useState(1);
  const [note, setNote] = useState("");

  const categories = useMemo(
    () => (data?.categories ?? []).filter((c) => c.kind === kind),
    [data, kind],
  );

  const add = useMutation({
    mutationFn: () => {
      const parsed = parseAmount(amount);
      if (!parsed) throw new Error("הזינו סכום");
      if (!categoryId) throw new Error("בחרו קטגוריה");
      return addRecurrence({
        data: {
          amount: parsed,
          kind,
          categoryId: Number(categoryId),
          dayOfMonth: day,
          note,
        },
      });
    },
    onSuccess: async () => {
      setAmount("");
      setNote("");
      toast.success("התנועה הקבועה נוספה");
      await qc.invalidateQueries({ queryKey: ["kupa"] });
    },
    onError: (err) => toast.error(err.message),
  });

  if (!data) return null;

  return (
    <section className="flex flex-col gap-3">
      <div>
        <h2 className="text-base font-medium">תנועות קבועות</h2>
        <p className="mt-1 text-sm text-muted">
          שכירות, מנויים, משכורת — נרשמות אוטומטית ביום שנבחר.
        </p>
      </div>

      {data.recurrences.length > 0 && (
        <div className="flex flex-col overflow-hidden rounded-xl border border-line bg-surface">
          {data.recurrences.map((r, i) => (
            <div
              key={r.id}
              className={cn(
                "flex items-center gap-3 px-4 py-3",
                i !== 0 && "border-t border-line",
                !r.active && "opacity-50",
              )}
            >
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">
                  {r.note || r.categoryName}
                </p>
                <p className="text-xs text-muted">
                  כל {r.dayOfMonth} בחודש · {r.categoryName} · {formatILS(r.amount)}
                </p>
              </div>
              <button
                type="button"
                className="text-xs text-muted hover:text-ink"
                onClick={() =>
                  toggleRecurrence({ data: { id: r.id, active: !r.active } }).then(
                    () => qc.invalidateQueries({ queryKey: ["kupa"] }),
                  )
                }
              >
                {r.active ? "השהיה" : "הפעלה"}
              </button>
              <button
                type="button"
                className="text-xs text-danger"
                onClick={() =>
                  deleteRecurrence({ data: { id: r.id } }).then(() =>
                    qc.invalidateQueries({ queryKey: ["kupa"] }),
                  )
                }
              >
                מחיקה
              </button>
            </div>
          ))}
        </div>
      )}

      <Card className="flex flex-col gap-3 rounded-2xl p-4">
        <p className="text-sm font-medium">הוספת קבועה</p>
        <div className="grid grid-cols-2 gap-1 rounded-lg bg-surface-2 p-1">
          <button
            type="button"
            onClick={() => {
              setKind("expense");
              setCategoryId("");
            }}
            className={cn(
              "h-9 rounded-md text-sm font-medium",
              kind === "expense" ? "bg-surface shadow-card" : "text-muted",
            )}
          >
            הוצאה
          </button>
          <button
            type="button"
            onClick={() => {
              setKind("income");
              setCategoryId("");
            }}
            className={cn(
              "h-9 rounded-md text-sm font-medium",
              kind === "income" ? "bg-surface shadow-card" : "text-muted",
            )}
          >
            הכנסה
          </button>
        </div>
        <Input
          dir="ltr"
          inputMode="decimal"
          placeholder="סכום"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <select
          className="h-11 rounded-md border border-line bg-surface px-3 text-sm"
          value={categoryId}
          onChange={(e) =>
            setCategoryId(e.target.value ? Number(e.target.value) : "")
          }
        >
          <option value="">קטגוריה</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <div className="flex items-center gap-2">
          <Label htmlFor="dom" className="shrink-0 text-muted">
            ביום
          </Label>
          <select
            id="dom"
            className="h-11 flex-1 rounded-md border border-line bg-surface px-3 text-sm"
            value={day}
            onChange={(e) => setDay(Number(e.target.value))}
          >
            {Array.from({ length: 28 }, (_, i) => i + 1).map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
        <Input
          placeholder="הערה, למשל שכירות"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          maxLength={280}
        />
        <Button onClick={() => add.mutate()} disabled={add.isPending}>
          {add.isPending ? "מוסיפים…" : "הוספה"}
        </Button>
      </Card>
    </section>
  );
}
