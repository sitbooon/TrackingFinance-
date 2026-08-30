import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { d as parseAmount, o as formatILS, u as monthLabel } from "./kupa-hDwYr6ll.mjs";
import { o as Download, s as Copy } from "../_libs/lucide-react.mjs";
import { i as useQueryClient, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { _ as useKupaUi, c as addRecurrence, d as renameHousehold, h as useCurrentUser, i as Label, l as deleteRecurrence, m as updateDisplayName, n as Card, o as UserButton, p as toggleRecurrence, r as Input, t as AppShell, u as exportCsv, v as useSnapshot } from "./app-shell-DkaPgqbq.mjs";
import { i as cn, r as Button } from "./router-BANUKJte.mjs";
import { t as Badge } from "./badge-DhF9hLSr.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/settings-B5mOinBu.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function SettingsPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings$1, {}) });
}
function Settings$1() {
	const { data } = useSnapshot();
	const user = useCurrentUser();
	const month = useKupaUi((s) => s.month);
	const qc = useQueryClient();
	const me = data?.members.find((m) => m.userId === user?.id);
	const [houseName, setHouseName] = (0, import_react.useState)(data?.household?.name ?? "");
	const [myName, setMyName] = (0, import_react.useState)(me?.displayName ?? "");
	(0, import_react.useEffect)(() => {
		if (data?.household?.name) setHouseName(data.household.name);
		if (me?.displayName) setMyName(me.displayName);
	}, [data?.household?.name, me?.displayName]);
	const rename = useMutation({
		mutationFn: () => renameHousehold({ data: { name: houseName } }),
		onSuccess: async () => {
			toast.success("השם עודכן");
			await qc.invalidateQueries({ queryKey: ["kupa"] });
		},
		onError: (err) => toast.error(err.message)
	});
	const renameMe = useMutation({
		mutationFn: () => updateDisplayName({ data: { displayName: myName } }),
		onSuccess: async () => {
			toast.success("השם שלך עודכן");
			await qc.invalidateQueries({ queryKey: ["kupa"] });
		},
		onError: (err) => toast.error(err.message)
	});
	if (!data?.household) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "flex flex-col gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-base font-medium",
					children: "הקופה"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "flex flex-col gap-4 rounded-2xl p-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-col gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "hname",
								children: "שם"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "hname",
									value: houseName,
									onChange: (e) => setHouseName(e.target.value),
									maxLength: 40
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "secondary",
									onClick: () => rename.mutate(),
									disabled: rename.isPending,
									children: "שמירה"
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm font-medium",
								children: "קוד הצטרפות"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-sm text-muted",
								children: "שתפו עם בת הזוג. אחרי ההתחברות היא מזינה את הקוד."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-3 flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									dir: "ltr",
									className: "flex-1 rounded-md bg-surface-2 px-3 py-2 text-center text-2xl font-medium tracking-widest tabular-nums",
									children: data.household.inviteCode
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "outline",
									size: "icon",
									"aria-label": "העתקת קוד",
									onClick: async () => {
										try {
											await navigator.clipboard.writeText(data.household.inviteCode);
											toast.success("הקוד הועתק");
										} catch {
											toast.error("לא ניתן להעתיק");
										}
									},
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, {})
								})]
							})
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-medium",
							children: "חברים"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "mt-2 flex flex-col gap-2",
							children: data.members.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "flex items-center justify-between text-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: m.displayName }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									tone: m.role === "owner" ? "accent" : "muted",
									children: m.role === "owner" ? "יצר/ה" : "חבר/ה"
								})]
							}, m.userId))
						})] })
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "flex flex-col gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-base font-medium",
					children: "השם שלך בקופה"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: myName,
						onChange: (e) => setMyName(e.target.value),
						maxLength: 40
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "secondary",
						onClick: () => renameMe.mutate(),
						disabled: renameMe.isPending,
						children: "שמירה"
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RecurringBlock, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "flex flex-col gap-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-base font-medium",
						children: "גיבוי לגיליון"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm text-muted",
						children: [
							"ייצוא תנועות ",
							monthLabel(month),
							" לקובץ שאפשר לפתוח ב-Google Sheets."
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "outline",
						onClick: async () => {
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
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, {}), "הורדת CSV"]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "flex flex-col gap-3 pb-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-base font-medium",
					children: "חשבון"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserButton, {})]
			})
		]
	});
}
function RecurringBlock() {
	const { data } = useSnapshot();
	const qc = useQueryClient();
	const [amount, setAmount] = (0, import_react.useState)("");
	const [kind, setKind] = (0, import_react.useState)("expense");
	const [categoryId, setCategoryId] = (0, import_react.useState)("");
	const [day, setDay] = (0, import_react.useState)(1);
	const [note, setNote] = (0, import_react.useState)("");
	const categories = (0, import_react.useMemo)(() => (data?.categories ?? []).filter((c) => c.kind === kind), [data, kind]);
	const add = useMutation({
		mutationFn: () => {
			const parsed = parseAmount(amount);
			if (!parsed) throw new Error("הזינו סכום");
			if (!categoryId) throw new Error("בחרו קטגוריה");
			return addRecurrence({ data: {
				amount: parsed,
				kind,
				categoryId: Number(categoryId),
				dayOfMonth: day,
				note
			} });
		},
		onSuccess: async () => {
			setAmount("");
			setNote("");
			toast.success("התנועה הקבועה נוספה");
			await qc.invalidateQueries({ queryKey: ["kupa"] });
		},
		onError: (err) => toast.error(err.message)
	});
	if (!data) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "flex flex-col gap-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-base font-medium",
				children: "תנועות קבועות"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted",
				children: "שכירות, מנויים, משכורת — נרשמות אוטומטית ביום שנבחר."
			})] }),
			data.recurrences.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-col overflow-hidden rounded-xl border border-line bg-surface",
				children: data.recurrences.map((r, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: cn("flex items-center gap-3 px-4 py-3", i !== 0 && "border-t border-line", !r.active && "opacity-50"),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0 flex-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "truncate font-medium",
								children: r.note || r.categoryName
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-xs text-muted",
								children: [
									"כל ",
									r.dayOfMonth,
									" בחודש · ",
									r.categoryName,
									" · ",
									formatILS(r.amount)
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "text-xs text-muted hover:text-ink",
							onClick: () => toggleRecurrence({ data: {
								id: r.id,
								active: !r.active
							} }).then(() => qc.invalidateQueries({ queryKey: ["kupa"] })),
							children: r.active ? "השהיה" : "הפעלה"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "text-xs text-danger",
							onClick: () => deleteRecurrence({ data: { id: r.id } }).then(() => qc.invalidateQueries({ queryKey: ["kupa"] })),
							children: "מחיקה"
						})
					]
				}, r.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "flex flex-col gap-3 rounded-2xl p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-medium",
						children: "הוספת קבועה"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-2 gap-1 rounded-lg bg-surface-2 p-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => {
								setKind("expense");
								setCategoryId("");
							},
							className: cn("h-9 rounded-md text-sm font-medium", kind === "expense" ? "bg-surface shadow-card" : "text-muted"),
							children: "הוצאה"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => {
								setKind("income");
								setCategoryId("");
							},
							className: cn("h-9 rounded-md text-sm font-medium", kind === "income" ? "bg-surface shadow-card" : "text-muted"),
							children: "הכנסה"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						dir: "ltr",
						inputMode: "decimal",
						placeholder: "סכום",
						value: amount,
						onChange: (e) => setAmount(e.target.value)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						className: "h-11 rounded-md border border-line bg-surface px-3 text-sm",
						value: categoryId,
						onChange: (e) => setCategoryId(e.target.value ? Number(e.target.value) : ""),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "",
							children: "קטגוריה"
						}), categories.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: c.id,
							children: c.name
						}, c.id))]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "dom",
							className: "shrink-0 text-muted",
							children: "ביום"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
							id: "dom",
							className: "h-11 flex-1 rounded-md border border-line bg-surface px-3 text-sm",
							value: day,
							onChange: (e) => setDay(Number(e.target.value)),
							children: Array.from({ length: 28 }, (_, i) => i + 1).map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: d,
								children: d
							}, d))
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						placeholder: "הערה, למשל שכירות",
						value: note,
						onChange: (e) => setNote(e.target.value),
						maxLength: 280
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						onClick: () => add.mutate(),
						disabled: add.isPending,
						children: add.isPending ? "מוסיפים…" : "הוספה"
					})
				]
			})
		]
	});
}
//#endregion
export { SettingsPage as component };
