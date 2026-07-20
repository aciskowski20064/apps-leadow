-- Leadow CRM — schemat Supabase
-- Uruchom w całości w Supabase Studio: SQL Editor -> New query -> wklej -> Run.
-- Bezpieczne do wielokrotnego uruchomienia (IF NOT EXISTS / OR REPLACE / DROP POLICY IF EXISTS).

-- ============================================================
-- TABELE
-- ============================================================

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,

  company_name text not null default '',
  industry text not null default 'Inne',
  city text not null default '',
  phone text not null default '',
  email text not null default '',
  social_link text not null default '',
  google_maps_link text not null default '',
  current_website text not null default '',
  demo_link text not null default '',
  source text not null default '',
  status text not null default 'Nowy lead',
  priority text not null default 'Średni',
  date_added text not null default '',
  last_contact_date text not null default '',
  notes text not null default '',
  archived boolean not null default false,

  -- dane z importu Google Maps (puste, jeśli lead nie pochodzi z importu)
  place_id text not null default '',
  full_address text not null default '',
  google_category text not null default '',
  google_rating numeric not null default 0,
  google_reviews_count integer not null default 0,
  business_status text not null default '',
  opening_hours text[] not null default '{}',

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  lead_id uuid references public.leads(id) on delete cascade,

  title text not null,
  description text not null default '',
  type text not null default 'Inne',
  priority text not null default 'Średni',
  due_date text not null default '',
  status text not null default 'Do zrobienia',
  completed_at text not null default '',
  is_automatically_created boolean not null default false,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.activities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  lead_id uuid not null references public.leads(id) on delete cascade,

  description text not null,
  date timestamptz not null default now()
);

-- ============================================================
-- INDEKSY
-- ============================================================

create index if not exists leads_user_id_idx on public.leads(user_id);
create index if not exists leads_place_id_idx on public.leads(place_id);
create index if not exists tasks_user_id_idx on public.tasks(user_id);
create index if not exists tasks_lead_id_idx on public.tasks(lead_id);
create index if not exists activities_user_id_idx on public.activities(user_id);
create index if not exists activities_lead_id_idx on public.activities(lead_id);

-- ============================================================
-- updated_at — automatyczne odświeżanie przy każdym UPDATE
-- ============================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists leads_set_updated_at on public.leads;
create trigger leads_set_updated_at
  before update on public.leads
  for each row execute function public.set_updated_at();

drop trigger if exists tasks_set_updated_at on public.tasks;
create trigger tasks_set_updated_at
  before update on public.tasks
  for each row execute function public.set_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY — każdy użytkownik widzi i modyfikuje wyłącznie własne dane
-- ============================================================

alter table public.leads enable row level security;
alter table public.tasks enable row level security;
alter table public.activities enable row level security;

drop policy if exists "leads_owner_access" on public.leads;
create policy "leads_owner_access" on public.leads
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "tasks_owner_access" on public.tasks;
create policy "tasks_owner_access" on public.tasks
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "activities_owner_access" on public.activities;
create policy "activities_owner_access" on public.activities
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
