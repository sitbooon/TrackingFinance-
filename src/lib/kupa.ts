export const MONTH_NAMES_HE = [
  "ינואר",
  "פברואר",
  "מרץ",
  "אפריל",
  "מאי",
  "יוני",
  "יולי",
  "אוגוסט",
  "ספטמבר",
  "אוקטובר",
  "נובמבר",
  "דצמבר",
] as const;

export type TxKind = "expense" | "income";

export const DEFAULT_CATEGORIES: { name: string; kind: TxKind; sort: number }[] =
  [
    { name: "דיור", kind: "expense", sort: 10 },
    { name: "חשבונות", kind: "expense", sort: 20 },
    { name: "סופר", kind: "expense", sort: 30 },
    { name: "אוכל בחוץ", kind: "expense", sort: 40 },
    { name: "תחבורה", kind: "expense", sort: 50 },
    { name: "בריאות", kind: "expense", sort: 60 },
    { name: "ביטוחים", kind: "expense", sort: 70 },
    { name: "מנויים", kind: "expense", sort: 80 },
    { name: "בילויים", kind: "expense", sort: 90 },
    { name: "אחר", kind: "expense", sort: 100 },
    { name: "משכורת", kind: "income", sort: 10 },
    { name: "אחר", kind: "income", sort: 20 },
  ];

export function currentMonth(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

export function todayIso(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function shiftMonth(month: string, delta: number): string {
  const [ys, ms] = month.split("-");
  const y = Number(ys);
  const m = Number(ms);
  const d = new Date(y, m - 1 + delta, 1);
  return currentMonth(d);
}

export function monthLabel(month: string): string {
  const [ys, ms] = month.split("-");
  const idx = Number(ms) - 1;
  const name = MONTH_NAMES_HE[idx] ?? month;
  return `${name} ${ys}`;
}

export function monthBounds(month: string): { start: string; end: string } {
  const [ys, ms] = month.split("-");
  const y = Number(ys);
  const m = Number(ms);
  const last = new Date(y, m, 0).getDate();
  return {
    start: `${month}-01`,
    end: `${month}-${String(last).padStart(2, "0")}`,
  };
}

export function daysInMonth(month: string): number {
  const [ys, ms] = month.split("-");
  return new Date(Number(ys), Number(ms), 0).getDate();
}

export function formatILS(value: number): string {
  const abs = Math.abs(value);
  const formatted = new Intl.NumberFormat("he-IL", {
    style: "currency",
    currency: "ILS",
    minimumFractionDigits: Number.isInteger(abs) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(abs);
  return value < 0 ? `−${formatted}` : formatted;
}

export function formatCompactILS(value: number): string {
  return new Intl.NumberFormat("he-IL", {
    maximumFractionDigits: 0,
  }).format(Math.round(value));
}

export function parseAmount(raw: string): number | null {
  const cleaned = raw.replace(/[^\d.]/g, "");
  if (!cleaned) return null;
  const n = Number(cleaned);
  if (!Number.isFinite(n) || n <= 0) return null;
  return Math.round(n * 100) / 100;
}

export function money(value: string | number | null | undefined): number {
  if (value == null) return 0;
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
}

export function formatDayHe(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return `${d} ב${MONTH_NAMES_HE[m - 1]}`;
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 1);
  return `${parts[0]!.slice(0, 1)}${parts[1]!.slice(0, 1)}`;
}
