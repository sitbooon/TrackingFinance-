import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { d as parseAmount, o as formatILS } from "./kupa-hDwYr6ll.mjs";
import { i as useQueryClient, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { f as saveBudgets, n as Card, r as Input, s as addCategory, t as AppShell, v as useSnapshot } from "./app-shell-DkaPgqbq.mjs";
import { i as cn, r as Button } from "./router-BANUKJte.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/budget-Bg10T_mz.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function BudgetPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BudgetEditor, {}) });
}
function BudgetEditor() {
	const { data } = useSnapshot();
	const qc = useQueryClient();
	const [draft, setDraft] = (0, import_react.useState)({});
	const [newName, setNewName] = (0, import_react.useState)("");
	const [newKind, setNewKind] = (0, import_react.useState)("expense");
	(0, import_react.useEffect)(() => {
		if (!data) return;
		const next = {};
		for (const c of data.categories) next[c.id] = c.monthlyBudget ? String(c.monthlyBudget) : "";
		setDraft(next);
	}, [data]);
	const save = useMutation({
		mutationFn: () => {
			if (!data) throw new Error("אין נתונים");
			const items = data.categories.filter((c) => c.kind === "expense").map((c) => ({
				id: c.id,
				monthlyBudget: parseAmount(draft[c.id] ?? "") ?? 0
			}));
			return saveBudgets({ data: { items } });
		},
		onSuccess: async () => {
			toast.success("התקציב נשמר");
			await qc.invalidateQueries({ queryKey: ["kupa"] });
		},
		onError: (err) => toast.error(err.message)
	});
	const add = useMutation({
		mutationFn: () => {
			const name = newName.trim();
			if (!name) throw new Error("הזינו שם לקטגוריה");
			return addCategory({ data: {
				name,
				kind: newKind
			} });
		},
		onSuccess: async () => {
			setNewName("");
			toast.success("הקטגוריה נוספה");
			await qc.invalidateQueries({ queryKey: ["kupa"] });
		},
		onError: (err) => toast.error(err.message)
	});
	if (!data?.household) return null;
	const expenses = data.categories.filter((c) => c.kind === "expense");
	const incomes = data.categories.filter((c) => c.kind === "income");
	const totalBudget = expenses.reduce((s, c) => {
		return s + (parseAmount(draft[c.id] ?? "") ?? 0);
	}, 0);
	const earned = incomes.reduce((s, c) => s + c.spent, 0);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "rounded-2xl p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted",
						children: "סך התקציב החודשי"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-3xl font-medium tabular-nums tracking-tight",
						children: formatILS(totalBudget)
					}),
					earned > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2 text-sm text-muted",
						children: [
							"מול הכנסות בפועל ",
							formatILS(earned),
							totalBudget > earned ? " — התקציב גבוה מההכנסה" : ""
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "flex flex-col gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-base font-medium",
						children: "קטגוריות הוצאה"
					}),
					expenses.map((c) => {
						const budget = parseAmount(draft[c.id] ?? "") ?? 0;
						const over = budget > 0 && c.spent > budget;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "rounded-xl border border-line bg-surface px-4 py-3",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "font-medium",
										children: c.name
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: cn("text-xs tabular-nums", over ? "text-danger" : "text-muted"),
										children: ["בפועל ", formatILS(c.spent)]
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "relative w-28 shrink-0",
									dir: "ltr",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "pointer-events-none absolute inset-y-0 start-2 flex items-center text-xs text-muted",
										children: "₪"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										dir: "ltr",
										inputMode: "decimal",
										className: "h-10 ps-6 text-end tabular-nums",
										placeholder: "0",
										value: draft[c.id] ?? "",
										onChange: (e) => setDraft((prev) => ({
											...prev,
											[c.id]: e.target.value
										}))
									})]
								})]
							})
						}, c.id);
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						onClick: () => save.mutate(),
						disabled: save.isPending,
						size: "lg",
						children: save.isPending ? "שומרים…" : "שמירת תקציב"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "flex flex-col gap-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-base font-medium",
						children: "קטגוריה חדשה"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-2 gap-1 rounded-lg bg-surface-2 p-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setNewKind("expense"),
							className: cn("h-10 rounded-md text-sm font-medium", newKind === "expense" ? "bg-surface shadow-card" : "text-muted"),
							children: "הוצאה"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setNewKind("income"),
							className: cn("h-10 rounded-md text-sm font-medium", newKind === "income" ? "bg-surface shadow-card" : "text-muted"),
							children: "הכנסה"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: newName,
							onChange: (e) => setNewName(e.target.value),
							placeholder: "למשל מתנות",
							maxLength: 32
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "secondary",
							onClick: () => add.mutate(),
							disabled: add.isPending,
							children: "הוספה"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs text-muted",
						children: ["קטגוריות הכנסה: ", incomes.map((c) => c.name).join(" · ") || "אין"]
					})
				]
			})
		]
	});
}
//#endregion
export { BudgetPage as component };
