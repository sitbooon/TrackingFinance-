import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { d as useRouterState, v as Link, y as Navigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { r as createServerFn } from "./ssr.mjs";
import { d as parseAmount, f as shiftMonth, n as authMiddleware, p as todayIso, r as currentMonth, u as monthLabel } from "./kupa-hDwYr6ll.mjs";
import { Jt as number, Qt as string, Ut as array, Vt as _enum, Wt as boolean, Yt as object } from "../_libs/@better-auth/core+[...].mjs";
import { i as signOut, t as authClient } from "./client-B40BzJxt.mjs";
import { a as House, c as ChevronRight, i as List, l as ChevronLeft, n as Settings, r as Plus, u as ChartPie } from "../_libs/lucide-react.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as create } from "../_libs/zustand.mjs";
import { t as Drawer } from "../_libs/vaul.mjs";
import { a as createSsrRpc, i as cn, r as Button } from "./router-BANUKJte.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/app-shell-DkaPgqbq.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/**
* Current user + loading state. Same behavior in live preview and when deployed:
*   - Auth enabled -> the real signed-in user; `user` is `null` while
*                            the session resolves (`isPending: true`) and when
*                            signed out (`isPending: false`). Session comes from
*                            Better Auth `useSession()` → `/api/auth/get-session`
*                            (cookie when deployed; bearer in live preview).
*   - Auth disabled (`VITE_AUTH_ENABLED=false`) -> `DEV_USER`, never pending.
*
* Protect a route by waiting out `isPending` before acting on `user` —
* redirecting on `user: null` alone bounces signed-in visitors to sign-in on
* every hard reload:
*
*   import { RedirectToSignIn } from "@/lib/auth/gates";
*   const { user, isPending } = useCurrentUserState();
*   if (isPending) return null;              // still resolving — don't redirect yet
*   if (!user) return <RedirectToSignIn />;  // definitely signed out
*
* `authEnabled` is a module-level constant fixed at load, so the guarded hook
* call keeps a stable hook order across every render of a given component.
*/
function useCurrentUserState() {
	const { data, isPending } = authClient.useSession();
	const user = data?.user;
	return {
		user: user ? {
			id: user.id,
			displayName: user.name ?? null,
			primaryEmail: user.email ?? null,
			profileImageUrl: user.image ?? null,
			isDevFallback: false
		} : null,
		isPending
	};
}
/**
* Convenience view of `useCurrentUserState().user` for display (e.g.
* `user?.displayName ?? "Guest"`). NOTE: `null` means *loading OR signed out* —
* for redirects/guards use `useCurrentUserState()` and check `isPending`.
*/
function useCurrentUser() {
	return useCurrentUserState().user;
}
/**
* Auth state components — plain wrappers around `useCurrentUserState()`.
*
* With auth on, visitors are signed out until they authenticate — in the sandbox
* live preview too, which does real sign-in. The shared dev user appears only
* when auth is disabled (`VITE_AUTH_ENABLED=false`, the shipped default).
* While the session is still resolving, gates that care about signed-out state
* render nothing so there's no signed-out flash on hard reload.
*/
/** Where `RedirectToSignIn` sends signed-out visitors. Create this route. */
var SIGN_IN_PATH = "/login";
/**
* Client-side redirect to the sign-in route (TanStack `<Navigate>` — NOT a full
* `window.location` reload). A hard navigation re-bootstraps the SPA and re-runs
* session loading, which feels like a second "Loading…" on /login.
*
* Guard routes by waiting out `isPending` first (see `use-current-user`), then
* render this.
*/
function RedirectToSignIn({ to = SIGN_IN_PATH }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, { to });
}
/**
* Minimal signed-in identity chip + sign-out. Restyle freely (see the
* `design-ui` skill). Sign-out is only shown when auth is enabled (the
* disabled-auth dev user has nothing to sign out of).
*/
function UserButton() {
	const user = useCurrentUser();
	const [signingOut, setSigningOut] = (0, import_react.useState)(false);
	if (!user) return null;
	const label = user.displayName ?? user.primaryEmail ?? "Account";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center gap-2",
		children: [
			user.profileImageUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: user.profileImageUrl,
				alt: "",
				className: "h-8 w-8 rounded-full object-cover"
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "grid h-8 w-8 place-items-center rounded-full bg-black/10 text-sm font-medium dark:bg-white/20",
				children: label.charAt(0).toUpperCase()
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-sm font-medium",
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				disabled: signingOut,
				onClick: () => {
					setSigningOut(true);
					signOut().catch(() => setSigningOut(false));
				},
				className: "cursor-pointer text-sm underline-offset-4 opacity-70 hover:underline disabled:cursor-wait disabled:no-underline",
				children: signingOut ? "Signing out…" : "Sign out"
			})
		]
	});
}
var monthSchema = object({ month: string().regex(/^\d{4}-\d{2}$/) });
var getMonthSnapshot = createServerFn({ method: "GET" }).middleware([authMiddleware]).validator((input) => monthSchema.parse(input)).handler(createSsrRpc("3342e8224ff509eae7599a757dbdf7885e12bed791dbda88445401cdbd28c2c2"));
var createHouseholdSchema = object({
	name: string().trim().min(1).max(40),
	displayName: string().trim().max(40).optional()
});
var createHousehold = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => createHouseholdSchema.parse(input)).handler(createSsrRpc("0ac5ce044976862f643f09d5b0736019f780c9a227ecd7ca743edd10a838346d"));
var joinHouseholdSchema = object({
	code: string().trim().min(4).max(8),
	displayName: string().trim().max(40).optional()
});
var joinHousehold = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => joinHouseholdSchema.parse(input)).handler(createSsrRpc("d82dcbac13446b5c5df210aa52f100ae8469376d143a1a73034604d984302957"));
var saveTxSchema = object({
	id: number().int().positive().optional(),
	amount: number().positive().max(99999999),
	kind: _enum(["expense", "income"]),
	categoryId: number().int().positive(),
	occurredOn: string().regex(/^\d{4}-\d{2}-\d{2}$/),
	note: string().max(280).optional()
});
var saveTransaction = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => saveTxSchema.parse(input)).handler(createSsrRpc("5a63b77b15f8025bcb2a7a464297b09a27e8ef3eb8f805b0b61c35c82aef8c10"));
var deleteTransaction = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => object({ id: number().int().positive() }).parse(input)).handler(createSsrRpc("d1a5131e37e9fdde305492c1c26089a8a9d30941d2a1de4ce7d062249654d976"));
var budgetSchema = object({ items: array(object({
	id: number().int().positive(),
	monthlyBudget: number().min(0).max(99999999)
})) });
var saveBudgets = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => budgetSchema.parse(input)).handler(createSsrRpc("485ab79be9af5d078631d2bb9eae5172f580f26abf0634477d4f355600e19e80"));
var addCategorySchema = object({
	name: string().trim().min(1).max(32),
	kind: _enum(["expense", "income"])
});
var addCategory = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => addCategorySchema.parse(input)).handler(createSsrRpc("fc308de8f896e955c3251195f285acd8ae1ea87de4c906ee08a45ae0edf0f4bd"));
var recurrenceSchema = object({
	amount: number().positive().max(99999999),
	kind: _enum(["expense", "income"]),
	categoryId: number().int().positive(),
	note: string().max(280).optional(),
	dayOfMonth: number().int().min(1).max(28)
});
var addRecurrence = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => recurrenceSchema.parse(input)).handler(createSsrRpc("adb8fead2a4c44d1a277d68ae4034c0f7941c5cda0a8b8eabbfc99811bc0d856"));
var toggleRecurrence = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => object({
	id: number().int().positive(),
	active: boolean()
}).parse(input)).handler(createSsrRpc("780edf093c5debd09c6215b0a79193e4b229e4e70ade55f98915f62ef1db8c1d"));
var deleteRecurrence = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => object({ id: number().int().positive() }).parse(input)).handler(createSsrRpc("8c5899ec68b1950c1d12fd43244a6e2ab3b34c1bbf4bd17a26ed4f851a072a82"));
var renameSchema = object({ name: string().trim().min(1).max(40) });
var renameHousehold = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => renameSchema.parse(input)).handler(createSsrRpc("9fab3bb903db3a9651287ee69a1f19efc7cda541f732a9a52d2a96212ac2a698"));
var updateDisplayName = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => object({ displayName: string().trim().min(1).max(40) }).parse(input)).handler(createSsrRpc("454b649734701fca4e2653e59678c32a14b7e2234717b3a5e336f7dea5ae53ff"));
var exportCsv = createServerFn({ method: "GET" }).middleware([authMiddleware]).validator((input) => monthSchema.parse(input)).handler(createSsrRpc("d5eba545fe0bf9a7f4083ccf454d80cd44f2f0ee6bea3b939b96f1635b46d42f"));
function Card({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("rounded-2xl border border-line bg-surface p-4 shadow-card", className),
		...props
	});
}
function Input({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		className: cn("flex h-11 w-full rounded-md border border-line bg-surface px-3 text-base text-ink shadow-none outline-none transition-colors duration-150 placeholder:text-subtle focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/30 disabled:opacity-50", className),
		...props
	});
}
function Label({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
		className: cn("text-sm font-medium text-ink", className),
		...props
	});
}
function Onboarding({ displayName }) {
	const [mode, setMode] = (0, import_react.useState)("choose");
	const [name, setName] = (0, import_react.useState)("הבית שלנו");
	const [code, setCode] = (0, import_react.useState)("");
	const [myName, setMyName] = (0, import_react.useState)(displayName?.split(" ")[0] ?? "");
	const qc = useQueryClient();
	const create = useMutation({
		mutationFn: () => createHousehold({ data: {
			name: name.trim() || "הבית שלנו",
			displayName: myName
		} }),
		onSuccess: async () => {
			toast.success("הקופה נפתחה");
			await qc.invalidateQueries({ queryKey: ["kupa"] });
		},
		onError: (err) => toast.error(err.message)
	});
	const join = useMutation({
		mutationFn: () => joinHousehold({ data: {
			code,
			displayName: myName
		} }),
		onSuccess: async () => {
			toast.success("הצטרפתם לקופה");
			await qc.invalidateQueries({ queryKey: ["kupa"] });
		},
		onError: (err) => toast.error(err.message)
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-dvh flex-col bg-bg px-5 py-8",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto flex w-full max-w-md flex-1 flex-col",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-10",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-medium tracking-wide text-muted",
							children: "קופה"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "mt-2 text-4xl font-medium leading-tight tracking-tight",
							children: "התקציב המשותף שלכם"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 max-w-sm text-muted",
							children: "שניכם רואים את אותן הוצאות, אותן הכנסות, ואותו תקציב מול בפועל."
						})
					]
				}),
				mode === "choose" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "lg",
						onClick: () => setMode("create"),
						children: "פתיחת קופה חדשה"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "lg",
						variant: "outline",
						onClick: () => setMode("join"),
						children: "הצטרפות עם קוד"
					})]
				}),
				mode === "create" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "flex flex-col gap-4 rounded-2xl p-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-col gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "house-name",
								children: "שם הקופה"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "house-name",
								value: name,
								onChange: (e) => setName(e.target.value),
								maxLength: 40
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-col gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "my-name",
								children: "איך לקרוא לך בקופה"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "my-name",
								value: myName,
								onChange: (e) => setMyName(e.target.value),
								placeholder: "למשל דנה",
								maxLength: 40
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "lg",
							onClick: () => create.mutate(),
							disabled: create.isPending,
							children: create.isPending ? "פותחים…" : "פתיחה"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							onClick: () => setMode("choose"),
							children: "חזרה"
						})
					]
				}),
				mode === "join" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "flex flex-col gap-4 rounded-2xl p-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-col gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "code",
								children: "קוד הזמנה בן 6 ספרות"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "code",
								inputMode: "numeric",
								dir: "ltr",
								className: "text-center text-xl tracking-widest",
								value: code,
								onChange: (e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6)),
								placeholder: "582193",
								maxLength: 6
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-col gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "join-name",
								children: "איך לקרוא לך בקופה"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "join-name",
								value: myName,
								onChange: (e) => setMyName(e.target.value),
								placeholder: "למשל יוסי",
								maxLength: 40
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "lg",
							onClick: () => join.mutate(),
							disabled: join.isPending || code.length < 6,
							children: join.isPending ? "מצטרפים…" : "הצטרפות"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							onClick: () => setMode("choose"),
							children: "חזרה"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-auto pt-10",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserButton, {})
				})
			]
		})
	});
}
var useKupaUi = create((set) => ({
	month: currentMonth(),
	setMonth: (month) => set({ month }),
	addOpen: false,
	setAddOpen: (addOpen) => set(addOpen ? { addOpen: true } : {
		addOpen: false,
		editingId: null
	}),
	editingId: null,
	setEditingId: (editingId) => set({
		editingId,
		addOpen: editingId != null
	})
}));
function Drawer$1({ open, onOpenChange, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Drawer.Root, {
		open,
		onOpenChange,
		shouldScaleBackground: false,
		children
	});
}
function DrawerContent({ children, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Drawer.Portal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Drawer.Overlay, { className: "fixed inset-0 z-50 bg-ink/40" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Drawer.Content, {
		className: cn("fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[92dvh] w-full max-w-lg flex-col rounded-t-2xl border border-line bg-bg outline-none", className),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mx-auto mt-3 h-1 w-10 rounded-full bg-line" }), children]
	})] });
}
function DrawerTitle({ children, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Drawer.Title, {
		className: cn("text-lg font-medium tracking-tight", className),
		children
	});
}
function Textarea({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
		className: cn("flex min-h-20 w-full rounded-md border border-line bg-surface px-3 py-2 text-base text-ink outline-none transition-colors duration-150 placeholder:text-subtle focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/30 disabled:opacity-50", className),
		...props
	});
}
function QuickAdd({ snapshot }) {
	const open = useKupaUi((s) => s.addOpen);
	const setOpen = useKupaUi((s) => s.setAddOpen);
	const editingId = useKupaUi((s) => s.editingId);
	const setEditingId = useKupaUi((s) => s.setEditingId);
	const editing = snapshot.transactions.find((t) => t.id === editingId) ?? null;
	const [kind, setKind] = (0, import_react.useState)("expense");
	const [amount, setAmount] = (0, import_react.useState)("");
	const [categoryId, setCategoryId] = (0, import_react.useState)(null);
	const [occurredOn, setOccurredOn] = (0, import_react.useState)(todayIso());
	const [note, setNote] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
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
	const categories = (0, import_react.useMemo)(() => snapshot.categories.filter((c) => c.kind === kind), [snapshot.categories, kind]);
	(0, import_react.useEffect)(() => {
		if (categoryId && categories.some((c) => c.id === categoryId)) return;
		setCategoryId(categories[0]?.id ?? null);
	}, [categories, categoryId]);
	const qc = useQueryClient();
	const save = useMutation({
		mutationFn: () => {
			const parsed = parseAmount(amount);
			if (!parsed) throw new Error("הזינו סכום");
			if (!categoryId) throw new Error("בחרו קטגוריה");
			return saveTransaction({ data: {
				id: editing?.id,
				amount: parsed,
				kind,
				categoryId,
				occurredOn,
				note
			} });
		},
		onSuccess: async () => {
			toast.success(editing ? "התנועה עודכנה" : "נשמר");
			setOpen(false);
			setEditingId(null);
			await qc.invalidateQueries({ queryKey: ["kupa"] });
		},
		onError: (err) => toast.error(err.message)
	});
	const remove = useMutation({
		mutationFn: () => deleteTransaction({ data: { id: editing.id } }),
		onSuccess: async () => {
			toast.success("נמחק");
			setOpen(false);
			setEditingId(null);
			await qc.invalidateQueries({ queryKey: ["kupa"] });
		},
		onError: (err) => toast.error(err.message)
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Drawer$1, {
		open,
		onOpenChange: setOpen,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DrawerContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			className: "flex flex-col gap-4 overflow-y-auto px-5 pb-8 pt-4",
			onSubmit: (e) => {
				e.preventDefault();
				save.mutate();
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DrawerTitle, { children: editing ? "עריכת תנועה" : "תנועה חדשה" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-2 gap-1 rounded-lg bg-surface-2 p-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KindBtn, {
						active: kind === "expense",
						onClick: () => setKind("expense"),
						label: "הוצאה"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(KindBtn, {
						active: kind === "income",
						onClick: () => setKind("income"),
						label: "הכנסה"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col gap-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "amount",
						children: "סכום"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative",
						dir: "ltr",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "pointer-events-none absolute inset-y-0 start-3 flex items-center text-muted",
							children: "₪"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "amount",
							inputMode: "decimal",
							dir: "ltr",
							autoFocus: true,
							className: "h-14 ps-8 text-2xl font-medium tabular-nums",
							placeholder: "0",
							value: amount,
							onChange: (e) => setAmount(e.target.value)
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "קטגוריה" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-wrap gap-2",
						children: categories.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setCategoryId(c.id),
							className: cn("h-10 rounded-full border px-3 text-sm transition-colors duration-150", categoryId === c.id ? "border-accent bg-accent text-accent-fg" : "border-line bg-surface text-ink hover:bg-surface-2"),
							children: c.name
						}, c.id))
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col gap-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "date",
						children: "תאריך"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "date",
						type: "date",
						dir: "ltr",
						value: occurredOn,
						onChange: (e) => setOccurredOn(e.target.value)
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col gap-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "note",
						children: "הערה"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
						id: "note",
						rows: 2,
						maxLength: 280,
						placeholder: "אופציונלי",
						value: note,
						onChange: (e) => setNote(e.target.value)
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "submit",
					size: "lg",
					disabled: save.isPending,
					children: save.isPending ? "שומרים…" : editing ? "שמירת שינויים" : "שמירה"
				}),
				editing && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					variant: "ghost",
					className: "text-danger",
					disabled: remove.isPending,
					onClick: () => remove.mutate(),
					children: remove.isPending ? "מוחקים…" : "מחיקת התנועה"
				})
			]
		}) })
	});
}
function KindBtn({ active, onClick, label }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		onClick,
		className: cn("h-10 rounded-md text-sm font-medium transition-colors duration-150", active ? "bg-surface text-ink shadow-card" : "text-muted"),
		children: label
	});
}
function Skeleton({ className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("animate-pulse rounded-md bg-surface-2", className),
		"aria-hidden": true
	});
}
function useSnapshot() {
	const month = useKupaUi((s) => s.month);
	return useQuery({
		queryKey: ["kupa", month],
		queryFn: () => getMonthSnapshot({ data: { month } })
	});
}
function isUnauthorized(err) {
	if (!err || typeof err !== "object") return false;
	const e = err;
	return e.message === "Unauthorized" || e.status === 401;
}
var NAV = [
	{
		to: "/",
		label: "בית",
		icon: House
	},
	{
		to: "/transactions",
		label: "תנועות",
		icon: List
	},
	{
		to: "/budget",
		label: "תקציב",
		icon: ChartPie
	},
	{
		to: "/settings",
		label: "עוד",
		icon: Settings
	}
];
function AppShell({ children }) {
	const { user, isPending } = useCurrentUserState();
	const snapshot = useSnapshot();
	if (isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthSkeleton, {});
	if (!user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RedirectToSignIn, {});
	if (snapshot.isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShellSkeleton, {});
	if (snapshot.error && isUnauthorized(snapshot.error)) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RedirectToSignIn, {});
	if (snapshot.error) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-dvh flex-col items-center justify-center gap-3 bg-bg px-6 text-center",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-lg font-medium",
			children: "משהו השתבש"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "max-w-sm text-sm text-muted",
			children: snapshot.error instanceof Error ? snapshot.error.message : "לא הצלחנו לטעון את הקופה"
		})]
	});
	if (!snapshot.data?.household) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Onboarding, { displayName: user.displayName });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-dvh bg-bg text-ink",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TopBar, { householdName: snapshot.data.household.name }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
				className: "mx-auto w-full max-w-lg px-4 pb-32 pt-3",
				children
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BottomNav, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(QuickAdd, { snapshot: snapshot.data })
		]
	});
}
function TopBar({ householdName }) {
	const month = useKupaUi((s) => s.month);
	const setMonth = useKupaUi((s) => s.setMonth);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
		className: "sticky top-0 z-30 border-b border-line/70 bg-bg/90 backdrop-blur-sm",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto flex max-w-lg items-center justify-between px-4 py-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-medium tracking-wide text-muted",
					children: "קופה"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "truncate text-sm font-medium",
					children: householdName
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						"aria-label": "חודש קודם",
						onClick: () => setMonth(shiftMonth(month, -1)),
						className: "grid size-11 place-items-center rounded-md text-ink hover:bg-surface-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-5" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "min-w-28 text-center text-sm font-medium tabular-nums",
						children: monthLabel(month)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						"aria-label": "חודש הבא",
						onClick: () => setMonth(shiftMonth(month, 1)),
						className: "grid size-11 place-items-center rounded-md text-ink hover:bg-surface-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "size-5" })
					})
				]
			})]
		})
	});
}
function BottomNav() {
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const setAddOpen = useKupaUi((s) => s.setAddOpen);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
		className: "fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 backdrop-blur-sm",
		style: { paddingBottom: "env(safe-area-inset-bottom)" },
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto grid max-w-lg grid-cols-5 items-end px-2 pt-1",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavLink, {
					item: NAV[0],
					pathname
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavLink, {
					item: NAV[1],
					pathname
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => setAddOpen(true),
					className: "-mt-5 mb-1 flex flex-col items-center gap-1",
					"aria-label": "הוספת תנועה",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "grid size-14 place-items-center rounded-full bg-accent text-accent-fg shadow-card",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, {
							className: "size-6",
							strokeWidth: 2.25
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs font-medium text-accent",
						children: "הוספה"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavLink, {
					item: NAV[2],
					pathname
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavLink, {
					item: NAV[3],
					pathname
				})
			]
		})
	});
}
function NavLink({ item, pathname }) {
	const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
	const Icon = item.icon;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
		to: item.to,
		className: cn("flex min-h-14 flex-col items-center justify-center gap-0.5 text-xs", active ? "font-medium text-accent" : "text-muted"),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
			className: "size-5",
			strokeWidth: active ? 2.25 : 1.75
		}), item.label]
	});
}
function AuthSkeleton() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-dvh flex-col justify-center bg-bg px-6",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto flex w-full max-w-md flex-col gap-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-4 w-16" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-12 w-3/4" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-4 w-full" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "mt-6 h-12 w-full" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-12 w-full" })
			]
		})
	});
}
function ShellSkeleton() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "min-h-dvh bg-bg px-4 pt-6",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto flex max-w-lg flex-col gap-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-10 w-28" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-10 w-36" })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-40 w-full rounded-xl" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-16 w-full rounded-xl" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-16 w-full rounded-xl" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-16 w-full rounded-xl" })
			]
		})
	});
}
//#endregion
export { useKupaUi as _, Skeleton as a, addRecurrence as c, renameHousehold as d, saveBudgets as f, useCurrentUserState as g, useCurrentUser as h, Label as i, deleteRecurrence as l, updateDisplayName as m, Card as n, UserButton as o, toggleRecurrence as p, Input as r, addCategory as s, AppShell as t, exportCsv as u, useSnapshot as v };
