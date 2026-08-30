import { r as createServerFn } from "./ssr.mjs";
import { t as createServerRpc } from "./createServerRpc-CcvdN_gc.mjs";
import { c as money, i as daysInMonth, l as monthBounds, n as authMiddleware, p as todayIso, t as DEFAULT_CATEGORIES } from "./kupa-hDwYr6ll.mjs";
import { Jt as number, Qt as string, Ut as array, Vt as _enum, Wt as boolean, Yt as object } from "../_libs/@better-auth/core+[...].mjs";
import { r as getSql } from "./db-BX507_RE.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/kupa-data-g9mw15Pr.js
async function getMembership(sql, userId) {
	return (await sql`
    select h.id as household_id, h.name, h.invite_code, m.role
    from household_members m
    join households h on h.id = m.household_id
    where m.user_id = ${userId}
    limit 1
  `)[0] ?? null;
}
function inviteCode() {
	return String(1e5 + Math.floor(Math.random() * 9e5));
}
async function seedCategories(sql, householdId) {
	for (const cat of DEFAULT_CATEGORIES) await sql`
      insert into categories (household_id, name, kind, monthly_budget, sort_order)
      values (${householdId}, ${cat.name}, ${cat.kind}, 0, ${cat.sort})
    `;
}
async function postDueRecurrences(sql, householdId, month, actorId) {
	const today = todayIso();
	if (month > today.slice(0, 7)) return;
	const recs = await sql`
    select id, amount, kind, category_id, note, day_of_month, created_by
    from recurrences
    where household_id = ${householdId} and active = true
  `;
	const lastDay = daysInMonth(month);
	for (const rec of recs) {
		const day = Math.min(rec.day_of_month, lastDay);
		const occurredOn = `${month}-${String(day).padStart(2, "0")}`;
		if (occurredOn > today) continue;
		if ((await sql`
      select id from transactions
      where recurrence_id = ${rec.id} and occurred_on = ${occurredOn}::date
      limit 1
    `)[0]) continue;
		await sql`
      insert into transactions (
        household_id, created_by, occurred_on, amount, kind, category_id, note, recurrence_id
      )
      values (
        ${householdId},
        ${rec.created_by || actorId},
        ${occurredOn}::date,
        ${money(rec.amount)},
        ${rec.kind},
        ${rec.category_id},
        ${rec.note},
        ${rec.id}
      )
    `;
	}
}
async function loadSnapshot(sql, membership, month) {
	const { start, end } = monthBounds(month);
	const members = await sql`
    select user_id, display_name, role
    from household_members
    where household_id = ${membership.household_id}
    order by joined_at asc
  `;
	const categories = await sql`
    select id, name, kind, monthly_budget, sort_order
    from categories
    where household_id = ${membership.household_id}
    order by kind desc, sort_order asc, id asc
  `;
	const transactions = await sql`
    select
      t.id,
      t.occurred_on,
      t.amount,
      t.kind,
      t.category_id,
      c.name as category_name,
      t.note,
      t.created_by,
      coalesce(nullif(m.display_name, ''), 'חבר') as created_by_name,
      t.recurrence_id
    from transactions t
    join categories c on c.id = t.category_id
    left join household_members m
      on m.household_id = t.household_id and m.user_id = t.created_by
    where t.household_id = ${membership.household_id}
      and t.occurred_on >= ${start}::date
      and t.occurred_on <= ${end}::date
    order by t.occurred_on desc, t.id desc
  `;
	const recurrences = await sql`
    select
      r.id,
      r.amount,
      r.kind,
      r.category_id,
      c.name as category_name,
      r.note,
      r.day_of_month,
      r.active
    from recurrences r
    join categories c on c.id = r.category_id
    where r.household_id = ${membership.household_id}
    order by r.day_of_month asc, r.id asc
  `;
	const spentByCategory = /* @__PURE__ */ new Map();
	for (const tx of transactions) {
		const prev = spentByCategory.get(tx.category_id) ?? 0;
		spentByCategory.set(tx.category_id, prev + money(tx.amount));
	}
	return {
		household: {
			id: membership.household_id,
			name: membership.name,
			inviteCode: membership.invite_code,
			role: membership.role
		},
		members: members.map((m) => ({
			userId: m.user_id,
			displayName: m.display_name || "חבר",
			role: m.role
		})),
		month,
		categories: categories.map((c) => ({
			id: c.id,
			name: c.name,
			kind: c.kind,
			monthlyBudget: money(c.monthly_budget),
			sortOrder: c.sort_order,
			spent: spentByCategory.get(c.id) ?? 0
		})),
		transactions: transactions.map((t) => ({
			id: t.id,
			occurredOn: t.occurred_on,
			amount: money(t.amount),
			kind: t.kind,
			categoryId: t.category_id,
			categoryName: t.category_name,
			note: t.note,
			createdBy: t.created_by,
			createdByName: t.created_by_name,
			recurrenceId: t.recurrence_id
		})),
		recurrences: recurrences.map((r) => ({
			id: r.id,
			amount: money(r.amount),
			kind: r.kind,
			categoryId: r.category_id,
			categoryName: r.category_name,
			note: r.note,
			dayOfMonth: r.day_of_month,
			active: r.active
		}))
	};
}
var monthSchema = object({ month: string().regex(/^\d{4}-\d{2}$/) });
var getMonthSnapshot_createServerFn_handler = createServerRpc({
	id: "3342e8224ff509eae7599a757dbdf7885e12bed791dbda88445401cdbd28c2c2",
	name: "getMonthSnapshot",
	filename: "src/lib/kupa-data.ts"
}, (opts) => getMonthSnapshot.__executeServer(opts));
var getMonthSnapshot = createServerFn({ method: "GET" }).middleware([authMiddleware]).validator((input) => monthSchema.parse(input)).handler(getMonthSnapshot_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const membership = await getMembership(sql, context.userId);
	if (!membership) return {
		household: null,
		members: [],
		month: data.month,
		categories: [],
		transactions: [],
		recurrences: []
	};
	await postDueRecurrences(sql, membership.household_id, data.month, context.userId);
	return loadSnapshot(sql, membership, data.month);
});
var createHouseholdSchema = object({
	name: string().trim().min(1).max(40),
	displayName: string().trim().max(40).optional()
});
var createHousehold_createServerFn_handler = createServerRpc({
	id: "0ac5ce044976862f643f09d5b0736019f780c9a227ecd7ca743edd10a838346d",
	name: "createHousehold",
	filename: "src/lib/kupa-data.ts"
}, (opts) => createHousehold.__executeServer(opts));
var createHousehold = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => createHouseholdSchema.parse(input)).handler(createHousehold_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	if (await getMembership(sql, context.userId)) throw new Error("כבר יש לכם קופה");
	const id = crypto.randomUUID();
	let code = inviteCode();
	for (let i = 0; i < 6; i += 1) try {
		await sql`
          insert into households (id, name, invite_code, created_by)
          values (${id}, ${data.name}, ${code}, ${context.userId})
        `;
		break;
	} catch {
		code = inviteCode();
		if (i === 5) throw new Error("לא הצלחנו ליצור קופה, נסו שוב");
	}
	const displayName = data.displayName?.trim() || "אני";
	await sql`
      insert into household_members (household_id, user_id, display_name, role)
      values (${id}, ${context.userId}, ${displayName}, 'owner')
    `;
	await seedCategories(sql, id);
	return {
		id,
		inviteCode: code
	};
});
var joinHouseholdSchema = object({
	code: string().trim().min(4).max(8),
	displayName: string().trim().max(40).optional()
});
var joinHousehold_createServerFn_handler = createServerRpc({
	id: "d82dcbac13446b5c5df210aa52f100ae8469376d143a1a73034604d984302957",
	name: "joinHousehold",
	filename: "src/lib/kupa-data.ts"
}, (opts) => joinHousehold.__executeServer(opts));
var joinHousehold = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => joinHouseholdSchema.parse(input)).handler(joinHousehold_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	if (await getMembership(sql, context.userId)) throw new Error("כבר יש לכם קופה");
	const house = (await sql`
      select id from households where invite_code = ${data.code.replace(/\s/g, "")} limit 1
    `)[0];
	if (!house) throw new Error("הקוד לא נמצא");
	const displayName = data.displayName?.trim() || "אני";
	await sql`
      insert into household_members (household_id, user_id, display_name, role)
      values (${house.id}, ${context.userId}, ${displayName}, 'member')
    `;
	return { id: house.id };
});
var saveTxSchema = object({
	id: number().int().positive().optional(),
	amount: number().positive().max(99999999),
	kind: _enum(["expense", "income"]),
	categoryId: number().int().positive(),
	occurredOn: string().regex(/^\d{4}-\d{2}-\d{2}$/),
	note: string().max(280).optional()
});
var saveTransaction_createServerFn_handler = createServerRpc({
	id: "5a63b77b15f8025bcb2a7a464297b09a27e8ef3eb8f805b0b61c35c82aef8c10",
	name: "saveTransaction",
	filename: "src/lib/kupa-data.ts"
}, (opts) => saveTransaction.__executeServer(opts));
var saveTransaction = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => saveTxSchema.parse(input)).handler(saveTransaction_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const membership = await getMembership(sql, context.userId);
	if (!membership) throw new Error("אין קופה");
	const cat = (await sql`
      select id, kind from categories
      where id = ${data.categoryId} and household_id = ${membership.household_id}
      limit 1
    `)[0];
	if (!cat) throw new Error("קטגוריה לא נמצאה");
	if (cat.kind !== data.kind) throw new Error("הקטגוריה לא מתאימה לסוג התנועה");
	const note = data.note?.trim() ?? "";
	if (data.id) {
		await sql`
        update transactions
        set amount = ${data.amount},
            kind = ${data.kind},
            category_id = ${data.categoryId},
            occurred_on = ${data.occurredOn}::date,
            note = ${note}
        where id = ${data.id} and household_id = ${membership.household_id}
      `;
		return { id: data.id };
	}
	return { id: (await sql`
      insert into transactions (
        household_id, created_by, occurred_on, amount, kind, category_id, note
      )
      values (
        ${membership.household_id},
        ${context.userId},
        ${data.occurredOn}::date,
        ${data.amount},
        ${data.kind},
        ${data.categoryId},
        ${note}
      )
      returning id
    `)[0].id };
});
var deleteTransaction_createServerFn_handler = createServerRpc({
	id: "d1a5131e37e9fdde305492c1c26089a8a9d30941d2a1de4ce7d062249654d976",
	name: "deleteTransaction",
	filename: "src/lib/kupa-data.ts"
}, (opts) => deleteTransaction.__executeServer(opts));
var deleteTransaction = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => object({ id: number().int().positive() }).parse(input)).handler(deleteTransaction_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const membership = await getMembership(sql, context.userId);
	if (!membership) throw new Error("אין קופה");
	await sql`
      delete from transactions
      where id = ${data.id} and household_id = ${membership.household_id}
    `;
	return { ok: true };
});
var budgetSchema = object({ items: array(object({
	id: number().int().positive(),
	monthlyBudget: number().min(0).max(99999999)
})) });
var saveBudgets_createServerFn_handler = createServerRpc({
	id: "485ab79be9af5d078631d2bb9eae5172f580f26abf0634477d4f355600e19e80",
	name: "saveBudgets",
	filename: "src/lib/kupa-data.ts"
}, (opts) => saveBudgets.__executeServer(opts));
var saveBudgets = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => budgetSchema.parse(input)).handler(saveBudgets_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const membership = await getMembership(sql, context.userId);
	if (!membership) throw new Error("אין קופה");
	for (const item of data.items) await sql`
        update categories
        set monthly_budget = ${item.monthlyBudget}
        where id = ${item.id} and household_id = ${membership.household_id}
      `;
	return { ok: true };
});
var addCategorySchema = object({
	name: string().trim().min(1).max(32),
	kind: _enum(["expense", "income"])
});
var addCategory_createServerFn_handler = createServerRpc({
	id: "fc308de8f896e955c3251195f285acd8ae1ea87de4c906ee08a45ae0edf0f4bd",
	name: "addCategory",
	filename: "src/lib/kupa-data.ts"
}, (opts) => addCategory.__executeServer(opts));
var addCategory = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => addCategorySchema.parse(input)).handler(addCategory_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const membership = await getMembership(sql, context.userId);
	if (!membership) throw new Error("אין קופה");
	const rows = await sql`
      select coalesce(max(sort_order), 0) as sort_order
      from categories
      where household_id = ${membership.household_id} and kind = ${data.kind}
    `;
	const sort = money(rows[0]?.sort_order) + 10;
	return { id: (await sql`
      insert into categories (household_id, name, kind, monthly_budget, sort_order)
      values (${membership.household_id}, ${data.name}, ${data.kind}, 0, ${sort})
      returning id
    `)[0].id };
});
var recurrenceSchema = object({
	amount: number().positive().max(99999999),
	kind: _enum(["expense", "income"]),
	categoryId: number().int().positive(),
	note: string().max(280).optional(),
	dayOfMonth: number().int().min(1).max(28)
});
var addRecurrence_createServerFn_handler = createServerRpc({
	id: "adb8fead2a4c44d1a277d68ae4034c0f7941c5cda0a8b8eabbfc99811bc0d856",
	name: "addRecurrence",
	filename: "src/lib/kupa-data.ts"
}, (opts) => addRecurrence.__executeServer(opts));
var addRecurrence = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => recurrenceSchema.parse(input)).handler(addRecurrence_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const membership = await getMembership(sql, context.userId);
	if (!membership) throw new Error("אין קופה");
	const cat = (await sql`
      select id, kind from categories
      where id = ${data.categoryId} and household_id = ${membership.household_id}
      limit 1
    `)[0];
	if (!cat) throw new Error("קטגוריה לא נמצאה");
	if (cat.kind !== data.kind) throw new Error("הקטגוריה לא מתאימה");
	return { id: (await sql`
      insert into recurrences (
        household_id, created_by, amount, kind, category_id, note, day_of_month, active
      )
      values (
        ${membership.household_id},
        ${context.userId},
        ${data.amount},
        ${data.kind},
        ${data.categoryId},
        ${data.note?.trim() ?? ""},
        ${data.dayOfMonth},
        true
      )
      returning id
    `)[0].id };
});
var toggleRecurrence_createServerFn_handler = createServerRpc({
	id: "780edf093c5debd09c6215b0a79193e4b229e4e70ade55f98915f62ef1db8c1d",
	name: "toggleRecurrence",
	filename: "src/lib/kupa-data.ts"
}, (opts) => toggleRecurrence.__executeServer(opts));
var toggleRecurrence = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => object({
	id: number().int().positive(),
	active: boolean()
}).parse(input)).handler(toggleRecurrence_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const membership = await getMembership(sql, context.userId);
	if (!membership) throw new Error("אין קופה");
	await sql`
      update recurrences
      set active = ${data.active}
      where id = ${data.id} and household_id = ${membership.household_id}
    `;
	return { ok: true };
});
var deleteRecurrence_createServerFn_handler = createServerRpc({
	id: "8c5899ec68b1950c1d12fd43244a6e2ab3b34c1bbf4bd17a26ed4f851a072a82",
	name: "deleteRecurrence",
	filename: "src/lib/kupa-data.ts"
}, (opts) => deleteRecurrence.__executeServer(opts));
var deleteRecurrence = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => object({ id: number().int().positive() }).parse(input)).handler(deleteRecurrence_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const membership = await getMembership(sql, context.userId);
	if (!membership) throw new Error("אין קופה");
	await sql`
      delete from recurrences
      where id = ${data.id} and household_id = ${membership.household_id}
    `;
	return { ok: true };
});
var renameSchema = object({ name: string().trim().min(1).max(40) });
var renameHousehold_createServerFn_handler = createServerRpc({
	id: "9fab3bb903db3a9651287ee69a1f19efc7cda541f732a9a52d2a96212ac2a698",
	name: "renameHousehold",
	filename: "src/lib/kupa-data.ts"
}, (opts) => renameHousehold.__executeServer(opts));
var renameHousehold = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => renameSchema.parse(input)).handler(renameHousehold_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const membership = await getMembership(sql, context.userId);
	if (!membership) throw new Error("אין קופה");
	await sql`
      update households set name = ${data.name}
      where id = ${membership.household_id}
    `;
	return { ok: true };
});
var updateDisplayName_createServerFn_handler = createServerRpc({
	id: "454b649734701fca4e2653e59678c32a14b7e2234717b3a5e336f7dea5ae53ff",
	name: "updateDisplayName",
	filename: "src/lib/kupa-data.ts"
}, (opts) => updateDisplayName.__executeServer(opts));
var updateDisplayName = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => object({ displayName: string().trim().min(1).max(40) }).parse(input)).handler(updateDisplayName_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const membership = await getMembership(sql, context.userId);
	if (!membership) throw new Error("אין קופה");
	await sql`
      update household_members
      set display_name = ${data.displayName}
      where household_id = ${membership.household_id} and user_id = ${context.userId}
    `;
	return { ok: true };
});
var exportCsv_createServerFn_handler = createServerRpc({
	id: "d5eba545fe0bf9a7f4083ccf454d80cd44f2f0ee6bea3b939b96f1635b46d42f",
	name: "exportCsv",
	filename: "src/lib/kupa-data.ts"
}, (opts) => exportCsv.__executeServer(opts));
var exportCsv = createServerFn({ method: "GET" }).middleware([authMiddleware]).validator((input) => monthSchema.parse(input)).handler(exportCsv_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const membership = await getMembership(sql, context.userId);
	if (!membership) throw new Error("אין קופה");
	const { start, end } = monthBounds(data.month);
	return { csv: `\uFEFFתאריך,סוג,קטגוריה,סכום,הערה,נוסף על ידי\n${(await sql`
      select
        t.occurred_on,
        t.kind,
        c.name as category_name,
        t.amount,
        t.note,
        coalesce(nullif(m.display_name, ''), '') as created_by_name
      from transactions t
      join categories c on c.id = t.category_id
      left join household_members m
        on m.household_id = t.household_id and m.user_id = t.created_by
      where t.household_id = ${membership.household_id}
        and t.occurred_on >= ${start}::date
        and t.occurred_on <= ${end}::date
      order by t.occurred_on asc, t.id asc
    `).map((r) => {
		const kind = r.kind === "income" ? "הכנסה" : "הוצאה";
		return [
			r.occurred_on,
			kind,
			r.category_name,
			money(r.amount).toString(),
			r.note.replaceAll("\"", "\"\""),
			r.created_by_name
		].map((c) => `"${c}"`).join(",");
	}).join("\n")}\n` };
});
//#endregion
export { addCategory_createServerFn_handler, addRecurrence_createServerFn_handler, createHousehold_createServerFn_handler, deleteRecurrence_createServerFn_handler, deleteTransaction_createServerFn_handler, exportCsv_createServerFn_handler, getMonthSnapshot_createServerFn_handler, joinHousehold_createServerFn_handler, renameHousehold_createServerFn_handler, saveBudgets_createServerFn_handler, saveTransaction_createServerFn_handler, toggleRecurrence_createServerFn_handler, updateDisplayName_createServerFn_handler };
