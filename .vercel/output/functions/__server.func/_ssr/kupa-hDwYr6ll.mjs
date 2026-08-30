import { n as createMiddleware } from "./ssr.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/kupa-hDwYr6ll.js
/**
* Auth middleware for server functions — the standard way to get the caller's
* verified user id. When deployed the session cookie is same-origin and rides
* along automatically. In the live preview the client also forwards the bearer
* token (partitioned cookies) via the `.client` hook below — call sites do not
* thread it themselves.
*
*   import { createServerFn } from "@tanstack/react-start";
*   import { getSql } from "@/lib/db";
*   import { authMiddleware } from "@/lib/auth/middleware";
*
*   export const listTodos = createServerFn({ method: "GET" })
*     .middleware([authMiddleware])
*     .handler(async ({ context }) => {
*       const sql = await getSql();
*       return sql`select * from todos where user_id = ${context.userId}`;
*     });
*
* Signed out with auth on (live preview included) -> throws `UnauthorizedError`
* (see `verify.server.ts`). With auth disabled (`VITE_AUTH_ENABLED=false`, the
* shipped default) it resolves the shared dev user — but throws instead when a
* `DATABASE_URL` is also set, so an app without sign-in must not use this at
* all. On the auth-on path, use it on every server function that touches
* per-user data and scope every query by `context.userId`.
*/
var authMiddleware = createMiddleware({ type: "function" }).client(async ({ next }) => {
	const { getBearerToken } = await import("./client-B40BzJxt.mjs").then((n) => n.n);
	return next({ sendContext: { bearerToken: getBearerToken() ?? void 0 } });
}).server(async ({ next, context }) => {
	const { assertSameSiteRequest } = await import("./isolation.server-CGNg1r0B.mjs");
	const { requireUserId } = await import("./verify.server-BL4Q8R0Y.mjs");
	assertSameSiteRequest();
	return next({ context: { userId: await requireUserId(context.bearerToken) } });
});
var MONTH_NAMES_HE = [
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
	"דצמבר"
];
var DEFAULT_CATEGORIES = [
	{
		name: "דיור",
		kind: "expense",
		sort: 10
	},
	{
		name: "חשבונות",
		kind: "expense",
		sort: 20
	},
	{
		name: "סופר",
		kind: "expense",
		sort: 30
	},
	{
		name: "אוכל בחוץ",
		kind: "expense",
		sort: 40
	},
	{
		name: "תחבורה",
		kind: "expense",
		sort: 50
	},
	{
		name: "בריאות",
		kind: "expense",
		sort: 60
	},
	{
		name: "ביטוחים",
		kind: "expense",
		sort: 70
	},
	{
		name: "מנויים",
		kind: "expense",
		sort: 80
	},
	{
		name: "בילויים",
		kind: "expense",
		sort: 90
	},
	{
		name: "אחר",
		kind: "expense",
		sort: 100
	},
	{
		name: "משכורת",
		kind: "income",
		sort: 10
	},
	{
		name: "אחר",
		kind: "income",
		sort: 20
	}
];
function currentMonth(d = /* @__PURE__ */ new Date()) {
	return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}
function todayIso(d = /* @__PURE__ */ new Date()) {
	return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function shiftMonth(month, delta) {
	const [ys, ms] = month.split("-");
	const y = Number(ys);
	const m = Number(ms);
	return currentMonth(new Date(y, m - 1 + delta, 1));
}
function monthLabel(month) {
	const [ys, ms] = month.split("-");
	return `${MONTH_NAMES_HE[Number(ms) - 1] ?? month} ${ys}`;
}
function monthBounds(month) {
	const [ys, ms] = month.split("-");
	const y = Number(ys);
	const m = Number(ms);
	const last = new Date(y, m, 0).getDate();
	return {
		start: `${month}-01`,
		end: `${month}-${String(last).padStart(2, "0")}`
	};
}
function daysInMonth(month) {
	const [ys, ms] = month.split("-");
	return new Date(Number(ys), Number(ms), 0).getDate();
}
function formatILS(value) {
	const abs = Math.abs(value);
	const formatted = new Intl.NumberFormat("he-IL", {
		style: "currency",
		currency: "ILS",
		minimumFractionDigits: Number.isInteger(abs) ? 0 : 2,
		maximumFractionDigits: 2
	}).format(abs);
	return value < 0 ? `−${formatted}` : formatted;
}
function parseAmount(raw) {
	const cleaned = raw.replace(/[^\d.]/g, "");
	if (!cleaned) return null;
	const n = Number(cleaned);
	if (!Number.isFinite(n) || n <= 0) return null;
	return Math.round(n * 100) / 100;
}
function money(value) {
	if (value == null) return 0;
	const n = typeof value === "number" ? value : Number(value);
	return Number.isFinite(n) ? n : 0;
}
function formatDayHe(iso) {
	const [y, m, d] = iso.split("-").map(Number);
	if (!y || !m || !d) return iso;
	return `${d} ב${MONTH_NAMES_HE[m - 1]}`;
}
function initials(name) {
	const parts = name.trim().split(/\s+/).filter(Boolean);
	if (parts.length === 0) return "?";
	if (parts.length === 1) return parts[0].slice(0, 1);
	return `${parts[0].slice(0, 1)}${parts[1].slice(0, 1)}`;
}
//#endregion
export { formatDayHe as a, money as c, parseAmount as d, shiftMonth as f, daysInMonth as i, monthBounds as l, authMiddleware as n, formatILS as o, todayIso as p, currentMonth as r, initials as s, DEFAULT_CATEGORIES as t, monthLabel as u };
