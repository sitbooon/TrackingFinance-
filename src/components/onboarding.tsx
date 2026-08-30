import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { UserButton } from "@/lib/auth/gates";
import { createHousehold, joinHousehold } from "@/lib/kupa-data";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function Onboarding({ displayName }: { displayName: string | null }) {
  const [mode, setMode] = useState<"choose" | "create" | "join">("choose");
  const [name, setName] = useState("הבית שלנו");
  const [code, setCode] = useState("");
  const [myName, setMyName] = useState(displayName?.split(" ")[0] ?? "");
  const qc = useQueryClient();

  const create = useMutation({
    mutationFn: () =>
      createHousehold({
        data: { name: name.trim() || "הבית שלנו", displayName: myName },
      }),
    onSuccess: async () => {
      toast.success("הקופה נפתחה");
      await qc.invalidateQueries({ queryKey: ["kupa"] });
    },
    onError: (err) => toast.error(err.message),
  });

  const join = useMutation({
    mutationFn: () =>
      joinHousehold({ data: { code, displayName: myName } }),
    onSuccess: async () => {
      toast.success("הצטרפתם לקופה");
      await qc.invalidateQueries({ queryKey: ["kupa"] });
    },
    onError: (err) => toast.error(err.message),
  });

  return (
    <div className="flex min-h-dvh flex-col bg-bg px-5 py-8">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col">
        <div className="mb-10">
          <p className="text-sm font-medium tracking-wide text-muted">קופה</p>
          <h1 className="mt-2 text-4xl font-medium leading-tight tracking-tight">
            התקציב המשותף שלכם
          </h1>
          <p className="mt-3 max-w-sm text-muted">
            שניכם רואים את אותן הוצאות, אותן הכנסות, ואותו תקציב מול בפועל.
          </p>
        </div>

        {mode === "choose" && (
          <div className="flex flex-col gap-3">
            <Button size="lg" onClick={() => setMode("create")}>
              פתיחת קופה חדשה
            </Button>
            <Button size="lg" variant="outline" onClick={() => setMode("join")}>
              הצטרפות עם קוד
            </Button>
          </div>
        )}

        {mode === "create" && (
          <Card className="flex flex-col gap-4 rounded-2xl p-5">
            <div className="flex flex-col gap-2">
              <Label htmlFor="house-name">שם הקופה</Label>
              <Input
                id="house-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={40}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="my-name">איך לקרוא לך בקופה</Label>
              <Input
                id="my-name"
                value={myName}
                onChange={(e) => setMyName(e.target.value)}
                placeholder="למשל דנה"
                maxLength={40}
              />
            </div>
            <Button
              size="lg"
              onClick={() => create.mutate()}
              disabled={create.isPending}
            >
              {create.isPending ? "פותחים…" : "פתיחה"}
            </Button>
            <Button variant="ghost" onClick={() => setMode("choose")}>
              חזרה
            </Button>
          </Card>
        )}

        {mode === "join" && (
          <Card className="flex flex-col gap-4 rounded-2xl p-5">
            <div className="flex flex-col gap-2">
              <Label htmlFor="code">קוד הזמנה בן 6 ספרות</Label>
              <Input
                id="code"
                inputMode="numeric"
                dir="ltr"
                className="text-center text-xl tracking-widest"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="582193"
                maxLength={6}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="join-name">איך לקרוא לך בקופה</Label>
              <Input
                id="join-name"
                value={myName}
                onChange={(e) => setMyName(e.target.value)}
                placeholder="למשל יוסי"
                maxLength={40}
              />
            </div>
            <Button
              size="lg"
              onClick={() => join.mutate()}
              disabled={join.isPending || code.length < 6}
            >
              {join.isPending ? "מצטרפים…" : "הצטרפות"}
            </Button>
            <Button variant="ghost" onClick={() => setMode("choose")}>
              חזרה
            </Button>
          </Card>
        )}

        <div className="mt-auto pt-10">
          <UserButton />
        </div>
      </div>
    </div>
  );
}
