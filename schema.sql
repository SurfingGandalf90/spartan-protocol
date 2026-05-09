-- ─── SPARTAN PROTOCOL — SUPABASE SCHEMA ────────────────────────────────────
-- Run this entire file in Supabase SQL Editor → New Query

-- Enable RLS
alter database postgres set "app.jwt_secret" to 'super-secret';

-- ── PROFILES ──────────────────────────────────────────────────────────────
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  name text,
  created_at timestamptz default now()
);

alter table profiles enable row level security;

create policy "Users can view own profile"
  on profiles for select using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

create policy "Users can insert own profile"
  on profiles for insert with check (auth.uid() = id);

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, email, name)
  values (new.id, new.email, split_part(new.email, '@', 1));
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ── SESSION LOGS ──────────────────────────────────────────────────────────
create table if not exists session_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  week_num integer not null,
  day_id integer not null,
  day_title text,
  status text check (status in ('completed', 'skipped')),
  rpe text,
  exercises jsonb default '{}',
  unit text default 'lb',
  notes text,
  logged_date date default current_date,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, week_num, day_id)
);

alter table session_logs enable row level security;

create policy "Users can manage own logs"
  on session_logs for all using (auth.uid() = user_id);

-- ── RUN LOGS ──────────────────────────────────────────────────────────────
create table if not exists run_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  week_num integer not null,
  run_num integer not null,
  status text check (status in ('done', 'skipped')),
  logged_date date default current_date,
  created_at timestamptz default now(),
  unique(user_id, week_num, run_num)
);

alter table run_logs enable row level security;

create policy "Users can manage own run logs"
  on run_logs for all using (auth.uid() = user_id);

-- ── SCHEDULE ASSIGNMENTS ──────────────────────────────────────────────────
create table if not exists schedule_assignments (
  user_id uuid references auth.users on delete cascade primary key,
  assignments jsonb default '{}',
  dance_day text,
  updated_at timestamptz default now()
);

alter table schedule_assignments enable row level security;

create policy "Users can manage own schedule"
  on schedule_assignments for all using (auth.uid() = user_id);

-- ── USER PREFERENCES ──────────────────────────────────────────────────────
create table if not exists user_preferences (
  user_id uuid references auth.users on delete cascade primary key,
  weight_unit text default 'lb',
  current_week integer default 1,
  updated_at timestamptz default now()
);

alter table user_preferences enable row level security;

create policy "Users can manage own preferences"
  on user_preferences for all using (auth.uid() = user_id);

-- ── USER PROGRAMS ─────────────────────────────────────────────────────────
-- Stores per-user program overrides (wife gets different program)
create table if not exists user_programs (
  user_id uuid references auth.users on delete cascade primary key,
  program_type text default 'spartan_v1',
  program_data jsonb default '{}',
  updated_at timestamptz default now()
);

alter table user_programs enable row level security;

create policy "Users can manage own program"
  on user_programs for all using (auth.uid() = user_id);

-- ── UPDATED_AT TRIGGERS ───────────────────────────────────────────────────
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger session_logs_updated_at before update on session_logs
  for each row execute function update_updated_at();

create trigger schedule_updated_at before update on schedule_assignments
  for each row execute function update_updated_at();

create trigger prefs_updated_at before update on user_preferences
  for each row execute function update_updated_at();
