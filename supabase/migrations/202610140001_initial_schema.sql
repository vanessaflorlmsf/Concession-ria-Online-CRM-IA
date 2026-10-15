-- Concessionária: schema inicial. Execute em um projeto Supabase novo.
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  role text not null default 'sales' check (role in ('admin','sales')),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.vehicles (
  id uuid primary key default gen_random_uuid(),
  brand text not null,
  model text not null,
  year integer not null check (year between 1950 and 2100),
  price numeric(12,2) not null check (price >= 0),
  cost_price numeric(12,2) check (cost_price is null or cost_price >= 0),
  mileage integer not null default 0 check (mileage >= 0),
  fuel text not null default 'Flex',
  transmission text not null default 'Automático',
  color text not null default '',
  image_url text not null default '',
  gallery jsonb not null default '[]'::jsonb,
  features jsonb not null default '[]'::jsonb,
  description text not null default '',
  is_new boolean not null default false,
  status text not null default 'available' check (status in ('available','reserved','sold','maintenance','hidden')),
  stock_number text unique,
  plate text,
  chassis text,
  acquired_at date,
  sold_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists vehicles_status_idx on public.vehicles(status);
create index if not exists vehicles_brand_model_idx on public.vehicles(brand, model);

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  email text,
  cpf text,
  address text,
  city text,
  state text,
  zip_code text,
  monthly_income numeric(12,2),
  contact_consent boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists customers_phone_idx on public.customers(phone);

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.customers(id) on delete set null,
  name text not null,
  phone text not null,
  email text,
  source text not null default 'site',
  stage text not null default 'new' check (stage in ('new','contacted','qualified','visit_scheduled','proposal','negotiation','won','lost')),
  interest text,
  vehicle_id uuid references public.vehicles(id) on delete set null,
  assigned_to uuid references public.profiles(id) on delete set null,
  notes text,
  consent_contact boolean not null default false,
  last_contact_at timestamptz,
  next_follow_up_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists leads_stage_created_idx on public.leads(stage, created_at desc);
create index if not exists leads_phone_idx on public.leads(phone);

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references public.leads(id) on delete set null,
  channel text not null default 'whatsapp' check (channel in ('whatsapp','site','email','instagram','other')),
  external_contact_id text,
  status text not null default 'open' check (status in ('open','waiting','closed','human_handoff')),
  assigned_to uuid references public.profiles(id) on delete set null,
  last_message_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists conversations_external_contact_idx on public.conversations(channel, external_contact_id);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  external_message_id text unique,
  direction text not null check (direction in ('inbound','outbound')),
  body text not null default '',
  status text not null default 'received',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists messages_conversation_created_idx on public.messages(conversation_id, created_at);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references public.leads(id) on delete cascade,
  assigned_to uuid references public.profiles(id) on delete set null,
  title text not null,
  due_at timestamptz,
  status text not null default 'pending' check (status in ('pending','done','cancelled')),
  created_by_agent boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.proposals (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete restrict,
  vehicle_id uuid not null references public.vehicles(id) on delete restrict,
  offered_price numeric(12,2) not null check (offered_price >= 0),
  status text not null default 'draft' check (status in ('draft','pending_approval','approved','rejected','accepted','expired')),
  valid_until timestamptz,
  terms jsonb not null default '{}'::jsonb,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.agent_runs (
  id uuid primary key default gen_random_uuid(),
  agent_name text not null,
  trigger_source text not null,
  status text not null default 'running' check (status in ('running','succeeded','failed','needs_review')),
  input_summary text,
  output_summary text,
  error_message text,
  started_at timestamptz not null default now(),
  finished_at timestamptz
);
create table if not exists public.agent_actions (
  id uuid primary key default gen_random_uuid(),
  run_id uuid references public.agent_runs(id) on delete set null,
  action_type text not null,
  target_table text,
  target_id text,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'pending' check (status in ('pending','approved','executed','rejected','failed')),
  approved_by uuid references public.profiles(id) on delete set null,
  executed_at timestamptz,
  created_at timestamptz not null default now()
);
create table if not exists public.audit_logs (
  id bigint generated always as identity primary key,
  actor_id uuid,
  actor_type text not null default 'user',
  action text not null,
  entity_table text not null,
  entity_id text,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create or replace function public.is_staff()
returns boolean language sql stable security definer set search_path = public
as $$ select exists(select 1 from public.profiles p where p.id = auth.uid() and p.active = true); $$;
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public
as $$ select exists(select 1 from public.profiles p where p.id = auth.uid() and p.active = true and p.role = 'admin'); $$;
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$ begin new.updated_at = now(); return new; end; $$;
create trigger vehicles_touch_updated before update on public.vehicles for each row execute function public.touch_updated_at();
create trigger customers_touch_updated before update on public.customers for each row execute function public.touch_updated_at();
create trigger leads_touch_updated before update on public.leads for each row execute function public.touch_updated_at();

alter table public.profiles enable row level security;
alter table public.vehicles enable row level security;
alter table public.customers enable row level security;
alter table public.leads enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.tasks enable row level security;
alter table public.proposals enable row level security;
alter table public.agent_runs enable row level security;
alter table public.agent_actions enable row level security;
alter table public.audit_logs enable row level security;

create policy "staff can read profiles" on public.profiles for select to authenticated using (public.is_staff());
create policy "admins manage profiles" on public.profiles for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "public reads available vehicles" on public.vehicles for select to anon, authenticated using (status = 'available' or public.is_staff());
create policy "staff manages vehicles" on public.vehicles for all to authenticated using (public.is_staff()) with check (public.is_staff());
create policy "public can submit lead" on public.leads for insert to anon, authenticated with check (length(trim(name)) between 2 and 120 and length(regexp_replace(phone, '[^0-9]', '', 'g')) between 10 and 15 and consent_contact = true and stage = 'new' and assigned_to is null and customer_id is null and source in ('site','whatsapp','instagram','other'));
create policy "staff manages leads" on public.leads for all to authenticated using (public.is_staff()) with check (public.is_staff());
create policy "staff manages customers" on public.customers for all to authenticated using (public.is_staff()) with check (public.is_staff());
create policy "staff manages conversations" on public.conversations for all to authenticated using (public.is_staff()) with check (public.is_staff());
create policy "staff manages messages" on public.messages for all to authenticated using (public.is_staff()) with check (public.is_staff());
create policy "staff manages tasks" on public.tasks for all to authenticated using (public.is_staff()) with check (public.is_staff());
create policy "staff manages proposals" on public.proposals for all to authenticated using (public.is_staff()) with check (public.is_staff());
create policy "staff reads agent runs" on public.agent_runs for select to authenticated using (public.is_staff());
create policy "admins manage agent runs" on public.agent_runs for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "staff reads agent actions" on public.agent_actions for select to authenticated using (public.is_staff());
create policy "admins manage agent actions" on public.agent_actions for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admins read audit logs" on public.audit_logs for select to authenticated using (public.is_admin());

-- Nunca conceda acesso anon/authenticated a tokens de integração. Webhooks usam secrets no ambiente Edge Functions.

-- Grants explícitos para a API REST do Supabase; RLS continua sendo a camada de autorização.
grant usage on schema public to anon, authenticated;
grant select on public.vehicles to anon, authenticated;
grant insert on public.leads to anon, authenticated;
grant select, insert, update, delete on public.profiles, public.vehicles, public.customers, public.leads, public.conversations, public.messages, public.tasks, public.proposals to authenticated;
grant select on public.agent_runs, public.agent_actions, public.audit_logs to authenticated;
grant usage, select on all sequences in schema public to authenticated;
