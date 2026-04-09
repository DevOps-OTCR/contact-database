-- Run this in Supabase SQL Editor.
-- Purpose: Preserve pre-migration behavior on static hosting.
-- Result:
--   - Only allowlisted users can read contacts.
--   - Only admin allowlisted users can insert/update/delete contacts.
--   - Users can only read their own row in allowed_users.

alter table public.allowed_users enable row level security;
alter table public.contacts enable row level security;

-- Remove existing policies if present so this script is idempotent.
drop policy if exists "allowed_users_select_own_row" on public.allowed_users;
drop policy if exists "contacts_select_for_allowlisted_users" on public.contacts;
drop policy if exists "contacts_insert_for_admins" on public.contacts;
drop policy if exists "contacts_update_for_admins" on public.contacts;
drop policy if exists "contacts_delete_for_admins" on public.contacts;

-- Allow an authenticated user to read only their own allowlist row.
create policy "allowed_users_select_own_row"
on public.allowed_users
for select
to authenticated
using (lower(email) = lower(auth.jwt() ->> 'email'));

-- Allow allowlisted users to read contacts.
create policy "contacts_select_for_allowlisted_users"
on public.contacts
for select
to authenticated
using (
  exists (
    select 1
    from public.allowed_users au
    where lower(au.email) = lower(auth.jwt() ->> 'email')
  )
);

-- Allow only admin users to insert contacts.
create policy "contacts_insert_for_admins"
on public.contacts
for insert
to authenticated
with check (
  exists (
    select 1
    from public.allowed_users au
    where lower(au.email) = lower(auth.jwt() ->> 'email')
      and au.is_admin = true
  )
);

-- Allow only admin users to update contacts.
create policy "contacts_update_for_admins"
on public.contacts
for update
to authenticated
using (
  exists (
    select 1
    from public.allowed_users au
    where lower(au.email) = lower(auth.jwt() ->> 'email')
      and au.is_admin = true
  )
)
with check (
  exists (
    select 1
    from public.allowed_users au
    where lower(au.email) = lower(auth.jwt() ->> 'email')
      and au.is_admin = true
  )
);

-- Allow only admin users to delete contacts.
create policy "contacts_delete_for_admins"
on public.contacts
for delete
to authenticated
using (
  exists (
    select 1
    from public.allowed_users au
    where lower(au.email) = lower(auth.jwt() ->> 'email')
      and au.is_admin = true
  )
);
