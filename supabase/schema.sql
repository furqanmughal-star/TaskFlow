-- TaskFlow cloud database. Run this ONCE in: Supabase dashboard -> SQL Editor -> New query -> Run.

create table if not exists public.tasks (
  user_id     uuid        not null references auth.users (id) on delete cascade,
  id          text        not null,
  title       text        not null default '',
  description text,
  priority    text        not null default 'medium' check (priority in ('low', 'medium', 'high')),
  due_date    date,
  completed   boolean     not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  deleted     boolean     not null default false,
  primary key (user_id, id)
);

create index if not exists tasks_user_updated_idx on public.tasks (user_id, updated_at desc);

-- Row Level Security: every person can only see and change their OWN tasks.
alter table public.tasks enable row level security;

drop policy if exists "tasks_select_own" on public.tasks;
drop policy if exists "tasks_insert_own" on public.tasks;
drop policy if exists "tasks_update_own" on public.tasks;
drop policy if exists "tasks_delete_own" on public.tasks;

create policy "tasks_select_own" on public.tasks for select to authenticated using (auth.uid() = user_id);
create policy "tasks_insert_own" on public.tasks for insert to authenticated with check (auth.uid() = user_id);
create policy "tasks_update_own" on public.tasks for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "tasks_delete_own" on public.tasks for delete to authenticated using (auth.uid() = user_id);

-- Live updates between devices (phone <-> laptop).
do $$
begin
  alter publication supabase_realtime add table public.tasks;
exception when duplicate_object then null;
end $$;
