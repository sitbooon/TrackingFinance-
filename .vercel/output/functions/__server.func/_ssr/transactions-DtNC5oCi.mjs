import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { a as formatDayHe, o as formatILS, s as initials } from "./kupa-hDwYr6ll.mjs";
import { _ as useKupaUi, n as Card, t as AppShell, v as useSnapshot } from "./app-shell-DkaPgqbq.mjs";
import { i as cn } from "./router-BANUKJte.mjs";
import { t as Badge } from "./badge-DhF9hLSr.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/transactions-DtNC5oCi.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function TransactionsPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Transactions, {}) });
}
function Transactions() {
	const { data } = useSnapshot();
	const setEditingId = useKupaUi((s) => s.setEditingId);
	const setAddOpen = useKupaUi((s) => s.setAddOpen);
	const [filter, setFilter] = (0, import_react.useState)("all");
	const list = (0, import_react.useMemo)(() => {
		if (!data) return [];
		if (filter === "all") return data.transactions;
		return data.transactions.filter((t) => t.kind === filter);
	}, [data, filter]);
	if (!data?.household) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid grid-cols-3 gap-1 rounded-lg bg-surface-2 p-1",
			children: [
				["all", "הכל"],
				["expense", "הוצאות"],
				["income", "הכנסות"]
			].map(([key, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: () => setFilter(key),
				className: cn("h-10 rounded-md text-sm font-medium transition-colors duration-150", filter === key ? "bg-surface text-ink shadow-card" : "text-muted"),
				children: label
			}, key))
		}), list.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
			className: "rounded-2xl p-6 text-center",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-medium",
				children: "אין תנועות להצגה"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: () => setAddOpen(true),
				className: "mt-3 text-sm font-medium text-accent underline-offset-4 hover:underline",
				children: "הוספת תנועה"
			})]
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex flex-col overflow-hidden rounded-xl border border-line bg-surface",
			children: list.map((t, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				onClick: () => setEditingId(t.id),
				className: cn("flex items-center gap-3 px-4 py-3 text-start hover:bg-surface-2", i !== 0 && "border-t border-line"),
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "grid size-9 shrink-0 place-items-center rounded-full bg-surface-2 text-xs font-medium",
						children: initials(t.createdByName)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "min-w-0 flex-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "truncate font-medium",
								children: t.categoryName
							}), t.recurrenceId ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								tone: "muted",
								children: "קבוע"
							}) : null]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "block truncate text-xs text-muted",
							children: [formatDayHe(t.occurredOn), t.note ? ` · ${t.note}` : ` · ${t.createdByName}`]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: cn("shrink-0 font-medium tabular-nums", t.kind === "income" ? "text-income" : "text-ink"),
						children: [t.kind === "income" ? "+" : "−", formatILS(t.amount)]
					})
				]
			}, t.id))
		})]
	});
}
//#endregion
export { TransactionsPage as component };
