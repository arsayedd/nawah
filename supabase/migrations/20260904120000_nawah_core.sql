-- Nawah Agency OS — core schema
-- Apply in Supabase SQL editor if the API cannot run DDL.

create table if not exists public.agencies (
  id text primary key,
  name text not null,
  locale text not null default 'ar',
  created_at timestamptz not null default now()
);

create table if not exists public.employees (
  id text primary key,
  agency_id text not null references public.agencies(id) on delete cascade,
  name text not null,
  name_ar text not null,
  role text not null,
  role_ar text not null,
  department text not null,
  hourly_cost numeric not null default 0,
  bill_rate numeric not null default 0,
  skills text[] not null default '{}',
  weekly_hours int not null default 40
);

create table if not exists public.clients (
  id text primary key,
  agency_id text not null references public.agencies(id) on delete cascade,
  name text not null,
  name_ar text not null,
  industry text,
  email text,
  phone text,
  tax_id text,
  address text,
  health int not null default 70,
  satisfaction int not null default 8,
  risk text,
  portal_enabled boolean not null default true,
  created_at date
);

create table if not exists public.contacts (
  id text primary key,
  agency_id text not null references public.agencies(id) on delete cascade,
  client_id text not null references public.clients(id) on delete cascade,
  name text not null,
  role text,
  email text,
  phone text,
  can_approve boolean not null default false
);

create table if not exists public.leads (
  id text primary key,
  agency_id text not null references public.agencies(id) on delete cascade,
  name text not null,
  company text not null,
  email text,
  phone text,
  source text,
  utm text,
  service text,
  budget numeric,
  start_date date,
  owner_id text,
  probability numeric not null default 0,
  value numeric not null default 0,
  last_contact date,
  next_step text,
  notes text,
  stage text not null default 'new',
  win_loss_reason text,
  created_at date
);

create table if not exists public.catalog_services (
  id text primary key,
  agency_id text not null references public.agencies(id) on delete cascade,
  name text not null,
  name_ar text not null,
  description text,
  description_ar text,
  items jsonb not null default '[]'
);

create table if not exists public.quotes (
  id text primary key,
  agency_id text not null references public.agencies(id) on delete cascade,
  number text not null,
  client_id text,
  lead_id text,
  title text not null,
  title_ar text not null,
  summary text,
  summary_ar text,
  lang text not null default 'ar',
  status text not null default 'draft',
  items jsonb not null default '[]',
  discount numeric not null default 0,
  tax_rate numeric not null default 0,
  deposit_percent numeric not null default 0.5,
  payment_terms text,
  duration_weeks int not null default 4,
  assumptions text,
  exclusions text,
  revision_policy text,
  expiry date,
  opened_at timestamptz,
  view_seconds int,
  created_at date,
  accepted_at timestamptz
);

create table if not exists public.projects (
  id text primary key,
  agency_id text not null references public.agencies(id) on delete cascade,
  client_id text not null,
  quote_id text,
  name text not null,
  name_ar text not null,
  status text not null default 'healthy',
  start_date date,
  due_date date,
  expected_revenue numeric not null default 0,
  expected_cost numeric not null default 0,
  expected_hours numeric not null default 0
);

create table if not exists public.tasks (
  id text primary key,
  agency_id text not null references public.agencies(id) on delete cascade,
  project_id text not null,
  milestone text,
  parent_id text,
  title text not null,
  title_ar text not null,
  status text not null default 'todo',
  priority text not null default 'med',
  assignee_id text,
  start_date date,
  due_date date,
  estimate_hours numeric not null default 0,
  actual_hours numeric not null default 0,
  billable boolean not null default true,
  checklist jsonb not null default '[]',
  revision_count int not null default 0,
  approval_status text not null default 'working'
);

create table if not exists public.invoices (
  id text primary key,
  agency_id text not null references public.agencies(id) on delete cascade,
  number text not null,
  client_id text not null,
  project_id text,
  quote_id text,
  amount numeric not null default 0,
  status text not null default 'draft',
  due_date date,
  paid_amount numeric not null default 0,
  issued_at date,
  note text
);

create table if not exists public.payments (
  id text primary key,
  agency_id text not null references public.agencies(id) on delete cascade,
  invoice_id text not null,
  amount numeric not null default 0,
  paid_on date,
  method text
);

create table if not exists public.expenses (
  id text primary key,
  agency_id text not null references public.agencies(id) on delete cascade,
  project_id text,
  category text not null,
  amount numeric not null default 0,
  spent_on date,
  note text
);

create table if not exists public.time_entries (
  id text primary key,
  agency_id text not null references public.agencies(id) on delete cascade,
  task_id text not null,
  user_id text not null,
  hours numeric not null default 0,
  billable boolean not null default true,
  logged_on date
);

create table if not exists public.docs (
  id text primary key,
  agency_id text not null references public.agencies(id) on delete cascade,
  title text not null,
  title_ar text not null,
  parent_id text,
  body text,
  body_ar text,
  client_id text,
  project_id text
);

create table if not exists public.tickets (
  id text primary key,
  agency_id text not null references public.agencies(id) on delete cascade,
  client_id text not null,
  project_id text,
  title text not null,
  title_ar text not null,
  priority text not null default 'med',
  in_scope boolean not null default true,
  status text not null default 'open'
);

create table if not exists public.meetings (
  id text primary key,
  agency_id text not null references public.agencies(id) on delete cascade,
  title text not null,
  title_ar text not null,
  client_id text,
  project_id text,
  starts_at timestamptz,
  notes text
);

create table if not exists public.alerts (
  id text primary key,
  agency_id text not null references public.agencies(id) on delete cascade,
  title text not null,
  title_ar text not null,
  kind text not null default 'info',
  href text
);

create table if not exists public.contracts (
  id text primary key,
  agency_id text not null references public.agencies(id) on delete cascade,
  quote_id text not null,
  client_id text not null,
  project_id text,
  status text not null default 'draft',
  start_date date,
  end_date date
);

create table if not exists public.portal_invites (
  id text primary key,
  agency_id text not null references public.agencies(id) on delete cascade,
  client_id text not null,
  email text,
  sent_at timestamptz
);

create table if not exists public.os_snapshots (
  agency_id text primary key references public.agencies(id) on delete cascade,
  locale text not null default 'ar',
  state jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.agencies enable row level security;
alter table public.employees enable row level security;
alter table public.clients enable row level security;
alter table public.contacts enable row level security;
alter table public.leads enable row level security;
alter table public.catalog_services enable row level security;
alter table public.quotes enable row level security;
alter table public.projects enable row level security;
alter table public.tasks enable row level security;
alter table public.invoices enable row level security;
alter table public.payments enable row level security;
alter table public.expenses enable row level security;
alter table public.time_entries enable row level security;
alter table public.docs enable row level security;
alter table public.tickets enable row level security;
alter table public.meetings enable row level security;
alter table public.alerts enable row level security;
alter table public.contracts enable row level security;
alter table public.portal_invites enable row level security;
alter table public.os_snapshots enable row level security;

-- No anon/authenticated policies: the Next.js server uses the service role
-- which bypasses RLS. Direct browser access to tables is denied.

revoke all on all tables in schema public from anon, authenticated;
grant usage on schema public to anon, authenticated;
