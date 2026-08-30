import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql, type Sql } from "@/lib/db";
import {
  DEFAULT_CATEGORIES,
  daysInMonth,
  money,
  monthBounds,
  todayIso,
  type TxKind,
} from "@/lib/kupa";

export type Member = {
  userId: string;
  displayName: string;
  role: string;
};

export type Category = {
  id: number;
  name: string;
  kind: TxKind;
  monthlyBudget: number;
  sortOrder: number;
  spent: number;
};

export type Transaction = {
  id: number;
  occurredOn: string;
  amount: number;
  kind: TxKind;
  categoryId: number;
  categoryName: string;
  note: string;
  createdBy: string;
  createdByName: string;
  recurrenceId: number | null;
};

export type Recurrence = {
  id: number;
  amount: number;
  kind: TxKind;
  categoryId: number;
  categoryName: string;
  note: string;
  dayOfMonth: number;
  active: boolean;
};

export type Household = {
  id: string;
  name: string;
  inviteCode: string;
  role: string;
};

export type MonthSnapshot = {
  household: Household | null;
  members: Member[];
  month: string;
  categories: Category[];
  transactions: Transaction[];
  recurrences: Recurrence[];
};

type MembershipRow = {
  household_id: string;
  name: string;
  invite_code: string;
  role: string;
};

async function getMembership(
  sql: Sql,
  userId: string,
): Promise<MembershipRow | null> {
  const rows = await sql<MembershipRow>`
    select h.id as household_id, h.name, h.invite_code, m.role
    from household_members m
    join households h on h.id = m.household_id
    where m.user_id = ${userId}
    limit 1
  `;
  return rows[0] ?? null;
}

function inviteCode(): string {
  return String(100000 + Math.floor(Math.random() * 900000));
}

async function seedCategories(sql: Sql, householdId: string) {
  for (const cat of DEFAULT_CATEGORIES) {
    await sql`
      insert into categories (household_id, name, kind, monthly_budget, sort_order)
      values (${householdId}, ${cat.name}, ${cat.kind}, 0, ${cat.sort})
    `;
  }
}

async function postDueRecurrences(
  sql: Sql,
  householdId: string,
  month: string,
  actorId: string,
) {
  const today = todayIso();
  const current = today.slice(0, 7);
  if (month > current) return;

  const recs = await sql<{
    id: number;
    amount: string;
    kind: TxKind;
    category_id: number;
    note: string;
    day_of_month: number;
    created_by: string;
  }>`
    select id, amount, kind, category_id, note, day_of_month, created_by
    from recurrences
    where household_id = ${householdId} and active = true
  `;

  const lastDay = daysInMonth(month);
  for (const rec of recs) {
    const day = Math.min(rec.day_of_month, lastDay);
    const occurredOn = `${month}-${String(day).padStart(2, "0")}`;
    if (occurredOn > today) continue;
    const existing = await sql<{ id: number }>`
      select id from transactions
      where recurrence_id = ${rec.id} and occurred_on = ${occurredOn}::date
      limit 1
    `;
    if (existing[0]) continue;
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

async function loadSnapshot(
  sql: Sql,
  membership: MembershipRow,
  month: string,
): Promise<MonthSnapshot> {
  const { start, end } = monthBounds(month);

  const members = await sql<{
    user_id: string;
    display_name: string;
    role: string;
  }>`
    select user_id, display_name, role
    from household_members
    where household_id = ${membership.household_id}
    order by joined_at asc
  `;

  const categories = await sql<{
    id: number;
    name: string;
    kind: TxKind;
    monthly_budget: string;
    sort_order: number;
  }>`
    select id, name, kind, monthly_budget, sort_order
    from categories
    where household_id = ${membership.household_id}
    order by kind desc, sort_order asc, id asc
  `;

  const transactions = await sql<{
    id: number;
    occurred_on: string;
    amount: string;
    kind: TxKind;
    category_id: number;
    category_name: string;
    note: string;
    created_by: string;
    created_by_name: string;
    recurrence_id: number | null;
  }>`
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

  const recurrences = await sql<{
    id: number;
    amount: string;
    kind: TxKind;
    category_id: number;
    category_name: string;
    note: string;
    day_of_month: number;
    active: boolean;
  }>`
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

  const spentByCategory = new Map<number, number>();
  for (const tx of transactions) {
    const prev = spentByCategory.get(tx.category_id) ?? 0;
    spentByCategory.set(tx.category_id, prev + money(tx.amount));
  }

  return {
    household: {
      id: membership.household_id,
      name: membership.name,
      inviteCode: membership.invite_code,
      role: membership.role,
    },
    members: members.map((m) => ({
      userId: m.user_id,
      displayName: m.display_name || "חבר",
      role: m.role,
    })),
    month,
    categories: categories.map((c) => ({
      id: c.id,
      name: c.name,
      kind: c.kind,
      monthlyBudget: money(c.monthly_budget),
      sortOrder: c.sort_order,
      spent: spentByCategory.get(c.id) ?? 0,
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
      recurrenceId: t.recurrence_id,
    })),
    recurrences: recurrences.map((r) => ({
      id: r.id,
      amount: money(r.amount),
      kind: r.kind,
      categoryId: r.category_id,
      categoryName: r.category_name,
      note: r.note,
      dayOfMonth: r.day_of_month,
      active: r.active,
    })),
  };
}

const monthSchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/),
});

export const getMonthSnapshot = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((input: unknown) => monthSchema.parse(input))
  .handler(async ({ context, data }): Promise<MonthSnapshot> => {
    const sql = await getSql();
    const membership = await getMembership(sql, context.userId);
    if (!membership) {
      return {
        household: null,
        members: [],
        month: data.month,
        categories: [],
        transactions: [],
        recurrences: [],
      };
    }
    await postDueRecurrences(sql, membership.household_id, data.month, context.userId);
    return loadSnapshot(sql, membership, data.month);
  });

const createHouseholdSchema = z.object({
  name: z.string().trim().min(1).max(40),
  displayName: z.string().trim().max(40).optional(),
});

export const createHousehold = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => createHouseholdSchema.parse(input))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const existing = await getMembership(sql, context.userId);
    if (existing) throw new Error("כבר יש לכם קופה");

    const id = crypto.randomUUID();
    let code = inviteCode();
    for (let i = 0; i < 6; i += 1) {
      try {
        await sql`
          insert into households (id, name, invite_code, created_by)
          values (${id}, ${data.name}, ${code}, ${context.userId})
        `;
        break;
      } catch {
        code = inviteCode();
        if (i === 5) throw new Error("לא הצלחנו ליצור קופה, נסו שוב");
      }
    }

    const displayName = data.displayName?.trim() || "אני";
    await sql`
      insert into household_members (household_id, user_id, display_name, role)
      values (${id}, ${context.userId}, ${displayName}, 'owner')
    `;
    await seedCategories(sql, id);
    return { id, inviteCode: code };
  });

const joinHouseholdSchema = z.object({
  code: z.string().trim().min(4).max(8),
  displayName: z.string().trim().max(40).optional(),
});

export const joinHousehold = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => joinHouseholdSchema.parse(input))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const existing = await getMembership(sql, context.userId);
    if (existing) throw new Error("כבר יש לכם קופה");

    const code = data.code.replace(/\s/g, "");
    const houses = await sql<{ id: string }>`
      select id from households where invite_code = ${code} limit 1
    `;
    const house = houses[0];
    if (!house) throw new Error("הקוד לא נמצא");

    const displayName = data.displayName?.trim() || "אני";
    await sql`
      insert into household_members (household_id, user_id, display_name, role)
      values (${house.id}, ${context.userId}, ${displayName}, 'member')
    `;
    return { id: house.id };
  });

const saveTxSchema = z.object({
  id: z.number().int().positive().optional(),
  amount: z.number().positive().max(99_999_999),
  kind: z.enum(["expense", "income"]),
  categoryId: z.number().int().positive(),
  occurredOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  note: z.string().max(280).optional(),
});

export const saveTransaction = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => saveTxSchema.parse(input))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const membership = await getMembership(sql, context.userId);
    if (!membership) throw new Error("אין קופה");

    const cats = await sql<{ id: number; kind: TxKind }>`
      select id, kind from categories
      where id = ${data.categoryId} and household_id = ${membership.household_id}
      limit 1
    `;
    const cat = cats[0];
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

    const rows = await sql<{ id: number }>`
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
    `;
    return { id: rows[0]!.id };
  });

export const deleteTransaction = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => z.object({ id: z.number().int().positive() }).parse(input))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const membership = await getMembership(sql, context.userId);
    if (!membership) throw new Error("אין קופה");
    await sql`
      delete from transactions
      where id = ${data.id} and household_id = ${membership.household_id}
    `;
    return { ok: true };
  });

const budgetSchema = z.object({
  items: z.array(
    z.object({
      id: z.number().int().positive(),
      monthlyBudget: z.number().min(0).max(99_999_999),
    }),
  ),
});

export const saveBudgets = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => budgetSchema.parse(input))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const membership = await getMembership(sql, context.userId);
    if (!membership) throw new Error("אין קופה");
    for (const item of data.items) {
      await sql`
        update categories
        set monthly_budget = ${item.monthlyBudget}
        where id = ${item.id} and household_id = ${membership.household_id}
      `;
    }
    return { ok: true };
  });

const addCategorySchema = z.object({
  name: z.string().trim().min(1).max(32),
  kind: z.enum(["expense", "income"]),
});

export const addCategory = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => addCategorySchema.parse(input))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const membership = await getMembership(sql, context.userId);
    if (!membership) throw new Error("אין קופה");
    const rows = await sql<{ sort_order: number }>`
      select coalesce(max(sort_order), 0) as sort_order
      from categories
      where household_id = ${membership.household_id} and kind = ${data.kind}
    `;
    const sort = money(rows[0]?.sort_order) + 10;
    const inserted = await sql<{ id: number }>`
      insert into categories (household_id, name, kind, monthly_budget, sort_order)
      values (${membership.household_id}, ${data.name}, ${data.kind}, 0, ${sort})
      returning id
    `;
    return { id: inserted[0]!.id };
  });

const recurrenceSchema = z.object({
  amount: z.number().positive().max(99_999_999),
  kind: z.enum(["expense", "income"]),
  categoryId: z.number().int().positive(),
  note: z.string().max(280).optional(),
  dayOfMonth: z.number().int().min(1).max(28),
});

export const addRecurrence = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => recurrenceSchema.parse(input))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const membership = await getMembership(sql, context.userId);
    if (!membership) throw new Error("אין קופה");
    const cats = await sql<{ id: number; kind: TxKind }>`
      select id, kind from categories
      where id = ${data.categoryId} and household_id = ${membership.household_id}
      limit 1
    `;
    const cat = cats[0];
    if (!cat) throw new Error("קטגוריה לא נמצאה");
    if (cat.kind !== data.kind) throw new Error("הקטגוריה לא מתאימה");

    const inserted = await sql<{ id: number }>`
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
    `;
    return { id: inserted[0]!.id };
  });

export const toggleRecurrence = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) =>
    z.object({ id: z.number().int().positive(), active: z.boolean() }).parse(input),
  )
  .handler(async ({ context, data }) => {
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

export const deleteRecurrence = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => z.object({ id: z.number().int().positive() }).parse(input))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const membership = await getMembership(sql, context.userId);
    if (!membership) throw new Error("אין קופה");
    await sql`
      delete from recurrences
      where id = ${data.id} and household_id = ${membership.household_id}
    `;
    return { ok: true };
  });

const renameSchema = z.object({
  name: z.string().trim().min(1).max(40),
});

export const renameHousehold = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => renameSchema.parse(input))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const membership = await getMembership(sql, context.userId);
    if (!membership) throw new Error("אין קופה");
    await sql`
      update households set name = ${data.name}
      where id = ${membership.household_id}
    `;
    return { ok: true };
  });

export const updateDisplayName = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) =>
    z.object({ displayName: z.string().trim().min(1).max(40) }).parse(input),
  )
  .handler(async ({ context, data }) => {
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

export const exportCsv = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((input: unknown) => monthSchema.parse(input))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const membership = await getMembership(sql, context.userId);
    if (!membership) throw new Error("אין קופה");
    const { start, end } = monthBounds(data.month);
    const rows = await sql<{
      occurred_on: string;
      kind: string;
      category_name: string;
      amount: string;
      note: string;
      created_by_name: string;
    }>`
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
    `;

    const header = "תאריך,סוג,קטגוריה,סכום,הערה,נוסף על ידי";
    const lines = rows.map((r) => {
      const kind = r.kind === "income" ? "הכנסה" : "הוצאה";
      const cells = [
        r.occurred_on,
        kind,
        r.category_name,
        money(r.amount).toString(),
        r.note.replaceAll('"', '""'),
        r.created_by_name,
      ].map((c) => `"${c}"`);
      return cells.join(",");
    });
    return { csv: `\uFEFF${header}\n${lines.join("\n")}\n` };
  });
