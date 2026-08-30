-- Household budget: shared ledger for a couple (or small household).
create table if not exists households (
  id          text primary key,
  name        text not null,
  invite_code text not null unique,
  created_by  text not null,
  created_at  timestamptz not null default now()
);

create table if not exists household_members (
  household_id text not null references households (id) on delete cascade,
  user_id      text not null,
  display_name text not null default '',
  role         text not null default 'member',
  joined_at    timestamptz not null default now(),
  primary key (household_id, user_id)
);

create index if not exists household_members_user_id_idx
  on household_members (user_id);

create table if not exists categories (
  id             serial primary key,
  household_id   text not null references households (id) on delete cascade,
  name           text not null,
  kind           text not null,
  monthly_budget numeric(12, 2) not null default 0,
  sort_order     int not null default 0,
  created_at     timestamptz not null default now()
);

create index if not exists categories_household_id_idx
  on categories (household_id);

create table if not exists recurrences (
  id           serial primary key,
  household_id text not null references households (id) on delete cascade,
  created_by   text not null,
  amount       numeric(12, 2) not null,
  kind         text not null,
  category_id  int not null references categories (id),
  note         text not null default '',
  day_of_month int not null,
  active       boolean not null default true,
  created_at   timestamptz not null default now()
);

create index if not exists recurrences_household_id_idx
  on recurrences (household_id);

create table if not exists transactions (
  id            serial primary key,
  household_id  text not null references households (id) on delete cascade,
  created_by    text not null,
  occurred_on   date not null,
  amount        numeric(12, 2) not null,
  kind          text not null,
  category_id   int not null references categories (id),
  note          text not null default '',
  recurrence_id int references recurrences (id) on delete set null,
  created_at    timestamptz not null default now()
);

create index if not exists transactions_household_month_idx
  on transactions (household_id, occurred_on desc);

create unique index if not exists transactions_recurrence_once_idx
  on transactions (recurrence_id, occurred_on)
  where recurrence_id is not null;
