import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { a as formatDayHe, o as formatILS, s as initials } from "./kupa-hDwYr6ll.mjs";
import { _ as useKupaUi, a as Skeleton, g as useCurrentUserState, n as Card, t as AppShell, v as useSnapshot } from "./app-shell-DkaPgqbq.mjs";
import { i as cn, n as LoginScreen } from "./router-BANUKJte.mjs";
import { t as Badge } from "./badge-DhF9hLSr.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-B5EVBbzB.js
var import_jsx_runtime = require_jsx_runtime();
function Home() {
	const { user, isPending } = useCurrentUserState();
	if (isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-dvh flex-col justify-center bg-bg px-6",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto flex w-full max-w-md flex-col gap-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-medium tracking-wide text-muted",
					children: "קופה"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-12 w-3/4" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-4 w-full" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "mt-6 h-12 w-full" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-12 w-full" })
			]
		})
	});
	if (!user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoginScreen, {});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dashboard, {}) });
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
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "rounded-2xl p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted",
						children: hasBudget ? "נשאר מהתקציב" : "מאזן החודש"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: cn("mt-1 text-4xl font-medium tabular-nums tracking-tight", (hasBudget ? remainingBudget : balance) < 0 && "text-danger"),
						children: formatILS(hasBudget ? remainingBudget : balance)
					}),
					hasBudget && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mb-1.5 flex items-center justify-between text-xs text-muted",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
								"נוצל ",
								formatILS(spent),
								" מתוך ",
								formatILS(budgeted)
							] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: overBudget ? "text-danger" : void 0,
								children: [Math.round(spent / budgeted * 100), "%"]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "h-2 overflow-hidden rounded-full bg-surface-2",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: cn("h-full rounded-full transition-[width] duration-300", overBudget ? "bg-danger" : "bg-accent"),
								style: { width: `${Math.round(budgetRatio * 100)}%` }
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-5 grid grid-cols-2 gap-3 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-lg bg-surface-2 px-3 py-2.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted",
								children: "הכנסות"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-0.5 font-medium tabular-nums text-income",
								children: formatILS(earned)
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-lg bg-surface-2 px-3 py-2.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted",
								children: "הוצאות"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-0.5 font-medium tabular-nums",
								children: formatILS(spent)
							})]
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-2 flex items-end justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-base font-medium",
					children: "תקציב מול בפועל"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/budget",
					className: "text-sm text-muted hover:text-ink",
					children: "עריכה"
				})]
			}), expenses.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "אין קטגוריות עדיין."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-col gap-2",
				children: expenses.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BudgetRow, {
					name: c.name,
					spent: c.spent,
					budget: c.monthlyBudget
				}, c.id))
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-2 flex items-end justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-base font-medium",
					children: "תנועות אחרונות"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/transactions",
					className: "text-sm text-muted hover:text-ink",
					children: "הכל"
				})]
			}), recent.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "rounded-2xl p-5 text-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-medium",
						children: "עדיין שקט החודש"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted",
						children: "הוסיפו הוצאה או הכנסה — זה לוקח כמה שניות."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setAddOpen(true),
						className: "mt-4 text-sm font-medium text-accent underline-offset-4 hover:underline",
						children: "הוספת תנועה"
					})
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-col overflow-hidden rounded-xl border border-line bg-surface",
				children: recent.map((t, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
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
								children: [formatDayHe(t.occurredOn), t.note ? ` · ${t.note}` : ""]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: cn("shrink-0 font-medium tabular-nums", t.kind === "income" ? "text-income" : "text-ink"),
							children: [t.kind === "income" ? "+" : "−", formatILS(t.amount)]
						})
					]
				}, t.id))
			})] })
		]
	});
}
function BudgetRow({ name, spent, budget }) {
	const has = budget > 0;
	const ratio = has ? Math.min(spent / budget, 1) : spent > 0 ? 1 : 0;
	const over = has && spent > budget;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-xl border border-line bg-surface px-4 py-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-baseline justify-between gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-medium",
				children: name
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-sm tabular-nums text-muted",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: over ? "font-medium text-danger" : "text-ink",
					children: formatILS(spent)
				}), has ? ` / ${formatILS(budget)}` : " · בלי תקציב"]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-2 h-1.5 overflow-hidden rounded-full bg-surface-2",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: cn("h-full rounded-full", over ? "bg-danger" : "bg-accent"),
				style: { width: `${Math.round(ratio * 100)}%` }
			})
		})]
	});
}
//#endregion
export { Home as component };
