-- Production hardening: tenant integrity, effective RBAC and safe tenant bootstrap.

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
grant usage on schema private to authenticated;

create or replace function private.current_company_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select profile.company_id
  from public.profiles as profile
  where profile.id = (select auth.uid())
    and profile.active
$$;

create or replace function private.has_permission(permission_key text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles as profile
    join public.role_permissions as role_permission on role_permission.role_id = profile.role_id
    join public.permissions as permission on permission.id = role_permission.permission_id
    where profile.id = (select auth.uid())
      and profile.active
      and permission.key = permission_key
  )
$$;

revoke all on function private.current_company_id() from public, anon;
revoke all on function private.has_permission(text) from public, anon;
grant execute on function private.current_company_id() to authenticated;
grant execute on function private.has_permission(text) to authenticated;

-- Keep the legacy helper unavailable to API roles. Policies below use the private helper.
revoke all on function public.current_company_id() from public, anon, authenticated;

insert into public.permissions (key, module, description)
values ('finance.manage', 'Financeiro', 'Gerenciar lancamentos financeiros')
on conflict (key) do update
set module = excluded.module,
    description = excluded.description;

create unique index uq_companies_document
on public.companies (document)
where document is not null and btrim(document) <> '';

create unique index uq_profiles_email_lower on public.profiles (lower(email));
create unique index uq_clients_company_document on public.clients (company_id, document);
create unique index uq_equipment_company_patrimony
on public.equipment (company_id, patrimony)
where patrimony is not null and btrim(patrimony) <> '';

alter table public.equipment
  add constraint equipment_rates_nonnegative check (
    daily_rate >= 0 and weekend_rate >= 0 and weekly_rate >= 0
  );

alter table public.rentals
  add constraint rentals_values_nonnegative check (
    value >= 0 and discount >= 0 and freight >= 0 and assembly >= 0
  );

alter table public.rental_items
  add constraint rental_items_unit_value_nonnegative check (unit_value >= 0);

alter table public.expenses
  add constraint expenses_value_nonnegative check (value >= 0),
  add constraint expenses_payment_consistency check (
    status <> 'Pago' or payment_date is not null
  );

alter table public.revenues
  add constraint revenues_value_nonnegative check (value >= 0);

alter table public.cash_flow_entries
  add constraint cash_flow_value_nonnegative check (value >= 0),
  add constraint cash_flow_source_table_allowed check (
    source_table in ('rentals', 'revenues', 'expenses')
  );

alter table public.notifications
  add constraint notifications_source_allowed check (
    source in ('rental', 'expense', 'equipment', 'system')
  );

alter table public.attachments
  add constraint attachments_owner_table_allowed check (
    owner_table in ('clients', 'equipment', 'rentals', 'expenses')
  );

create index idx_profiles_company on public.profiles (company_id);
create index idx_profiles_role on public.profiles (role_id);
create index idx_role_permissions_permission on public.role_permissions (permission_id);
create index idx_clients_created_by on public.clients (created_by);
create index idx_equipment_category on public.equipment (category_id);
create index idx_equipment_created_by on public.equipment (created_by);
create index idx_equipment_photos_equipment on public.equipment_photos (equipment_id);
create index idx_rentals_client on public.rentals (client_id);
create index idx_rentals_created_by on public.rentals (created_by);
create index idx_rental_items_equipment on public.rental_items (equipment_id);
create index idx_rental_history_rental_changed on public.rental_status_history (rental_id, changed_at desc);
create index idx_expenses_created_by on public.expenses (created_by);
create index idx_revenues_rental on public.revenues (rental_id);
create index idx_notifications_user on public.notifications (user_id);
create index idx_attachments_owner on public.attachments (owner_table, owner_id);
create index idx_audit_logs_user on public.audit_logs (user_id);

create or replace function private.assert_tenant_relationships()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  row_company_id uuid := nullif(to_jsonb(new) ->> 'company_id', '')::uuid;
  role_id uuid := nullif(to_jsonb(new) ->> 'role_id', '')::uuid;
  created_by uuid := nullif(to_jsonb(new) ->> 'created_by', '')::uuid;
  category_id uuid := nullif(to_jsonb(new) ->> 'category_id', '')::uuid;
  client_id uuid := nullif(to_jsonb(new) ->> 'client_id', '')::uuid;
  rental_id uuid := nullif(to_jsonb(new) ->> 'rental_id', '')::uuid;
  equipment_id uuid := nullif(to_jsonb(new) ->> 'equipment_id', '')::uuid;
  changed_by uuid := nullif(to_jsonb(new) ->> 'changed_by', '')::uuid;
  user_id uuid := nullif(to_jsonb(new) ->> 'user_id', '')::uuid;
  parent_company_id uuid;
  related_company_id uuid;
begin
  if tg_table_name = 'profiles' and role_id is not null then
    select company_id into related_company_id from public.roles where id = role_id;
    if related_company_id is distinct from row_company_id then
      raise exception 'Profile role must belong to the same company';
    end if;
  elsif tg_table_name = 'clients' and created_by is not null then
    select company_id into related_company_id from public.profiles where id = created_by;
    if related_company_id is distinct from row_company_id then
      raise exception 'Client creator must belong to the same company';
    end if;
  elsif tg_table_name = 'equipment' then
    if category_id is not null then
      select company_id into related_company_id from public.equipment_categories where id = category_id;
      if related_company_id is distinct from row_company_id then
        raise exception 'Equipment category must belong to the same company';
      end if;
    end if;
    if created_by is not null then
      select company_id into related_company_id from public.profiles where id = created_by;
      if related_company_id is distinct from row_company_id then
        raise exception 'Equipment creator must belong to the same company';
      end if;
    end if;
  elsif tg_table_name = 'rentals' then
    select company_id into related_company_id from public.clients where id = client_id;
    if related_company_id is distinct from row_company_id then
      raise exception 'Rental client must belong to the same company';
    end if;
    if created_by is not null then
      select company_id into related_company_id from public.profiles where id = created_by;
      if related_company_id is distinct from row_company_id then
        raise exception 'Rental creator must belong to the same company';
      end if;
    end if;
  elsif tg_table_name = 'rental_items' then
    select company_id into parent_company_id from public.rentals where id = rental_id;
    select company_id into related_company_id from public.equipment where id = equipment_id;
    if parent_company_id is null or related_company_id is distinct from parent_company_id then
      raise exception 'Rental item equipment must belong to the rental company';
    end if;
  elsif tg_table_name = 'rental_status_history' and changed_by is not null then
    select company_id into parent_company_id from public.rentals where id = rental_id;
    select company_id into related_company_id from public.profiles where id = changed_by;
    if related_company_id is distinct from parent_company_id then
      raise exception 'Status author must belong to the rental company';
    end if;
  elsif tg_table_name = 'expenses' and created_by is not null then
    select company_id into related_company_id from public.profiles where id = created_by;
    if related_company_id is distinct from row_company_id then
      raise exception 'Expense creator must belong to the same company';
    end if;
  elsif tg_table_name = 'revenues' and rental_id is not null then
    select company_id into related_company_id from public.rentals where id = rental_id;
    if related_company_id is distinct from row_company_id then
      raise exception 'Revenue rental must belong to the same company';
    end if;
  elsif tg_table_name = 'notifications' and user_id is not null then
    select company_id into related_company_id from public.profiles where id = user_id;
    if related_company_id is distinct from row_company_id then
      raise exception 'Notification user must belong to the same company';
    end if;
  elsif tg_table_name = 'attachments' and created_by is not null then
    select company_id into related_company_id from public.profiles where id = created_by;
    if related_company_id is distinct from row_company_id then
      raise exception 'Attachment creator must belong to the same company';
    end if;
  elsif tg_table_name = 'audit_logs' and user_id is not null then
    select company_id into related_company_id from public.profiles where id = user_id;
    if related_company_id is distinct from row_company_id then
      raise exception 'Audit user must belong to the same company';
    end if;
  end if;

  return new;
end;
$$;

create trigger profiles_tenant_integrity before insert or update on public.profiles
for each row execute function private.assert_tenant_relationships();
create trigger clients_tenant_integrity before insert or update on public.clients
for each row execute function private.assert_tenant_relationships();
create trigger equipment_tenant_integrity before insert or update on public.equipment
for each row execute function private.assert_tenant_relationships();
create trigger rentals_tenant_integrity before insert or update on public.rentals
for each row execute function private.assert_tenant_relationships();
create trigger rental_items_tenant_integrity before insert or update on public.rental_items
for each row execute function private.assert_tenant_relationships();
create trigger rental_history_tenant_integrity before insert or update on public.rental_status_history
for each row execute function private.assert_tenant_relationships();
create trigger expenses_tenant_integrity before insert or update on public.expenses
for each row execute function private.assert_tenant_relationships();
create trigger revenues_tenant_integrity before insert or update on public.revenues
for each row execute function private.assert_tenant_relationships();
create trigger notifications_tenant_integrity before insert or update on public.notifications
for each row execute function private.assert_tenant_relationships();
create trigger attachments_tenant_integrity before insert or update on public.attachments
for each row execute function private.assert_tenant_relationships();
create trigger audit_logs_tenant_integrity before insert or update on public.audit_logs
for each row execute function private.assert_tenant_relationships();

create or replace function private.protect_profile_security_fields()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if old.id = (select auth.uid())
     and not private.has_permission('users.manage')
     and (
       new.company_id is distinct from old.company_id
       or new.role_id is distinct from old.role_id
       or new.email is distinct from old.email
       or new.active is distinct from old.active
     ) then
    raise exception 'Only user managers can change protected profile fields';
  end if;
  return new;
end;
$$;

create trigger profiles_protect_security_fields
before update on public.profiles
for each row execute function private.protect_profile_security_fields();

-- Aggregate each source independently to avoid multiplication caused by a many-to-many join.
create or replace view public.v_dashboard_month
with (security_invoker = true)
as
select
  company.id as company_id,
  coalesce(rental_totals.month_revenue, 0::numeric) as month_revenue,
  coalesce(expense_totals.month_expenses, 0::numeric) as month_expenses
from public.companies as company
left join lateral (
  select sum(rental.value) as month_revenue
  from public.rentals as rental
  where rental.company_id = company.id
    and rental.status <> 'Cancelado'
    and rental.pickup_at >= date_trunc('month', current_date)
    and rental.pickup_at < date_trunc('month', current_date) + interval '1 month'
) as rental_totals on true
left join lateral (
  select sum(expense.value) as month_expenses
  from public.expenses as expense
  where expense.company_id = company.id
    and expense.due_date >= date_trunc('month', current_date)::date
    and expense.due_date < (date_trunc('month', current_date) + interval '1 month')::date
) as expense_totals on true;

-- Remove broad policies before installing operation-specific RBAC policies.
drop policy if exists "company read own" on public.companies;
drop policy if exists "profiles read own company" on public.profiles;
drop policy if exists "profiles update self" on public.profiles;
drop policy if exists "permissions read authenticated" on public.permissions;
drop policy if exists "role permissions read own company" on public.role_permissions;
drop policy if exists "roles own company" on public.roles;
drop policy if exists "clients own company" on public.clients;
drop policy if exists "equipment categories own company" on public.equipment_categories;
drop policy if exists "equipment own company" on public.equipment;
drop policy if exists "equipment photos own company" on public.equipment_photos;
drop policy if exists "rentals own company" on public.rentals;
drop policy if exists "rental items own company" on public.rental_items;
drop policy if exists "rental history own company" on public.rental_status_history;
drop policy if exists "expenses own company" on public.expenses;
drop policy if exists "revenues own company" on public.revenues;
drop policy if exists "cash flow own company" on public.cash_flow_entries;
drop policy if exists "notifications own company" on public.notifications;
drop policy if exists "attachments own company" on public.attachments;
drop policy if exists "audit logs read own company" on public.audit_logs;
drop policy if exists "audit logs insert own company" on public.audit_logs;
drop policy if exists "settings own company" on public.settings;

create policy "companies select own" on public.companies for select to authenticated
using (id = (select private.current_company_id()));
create policy "companies update managers" on public.companies for update to authenticated
using (id = (select private.current_company_id()) and (select private.has_permission('settings.manage')))
with check (id = (select private.current_company_id()) and (select private.has_permission('settings.manage')));

create policy "permissions select authenticated" on public.permissions for select to authenticated using (true);
create policy "roles select own" on public.roles for select to authenticated
using (company_id = (select private.current_company_id()));
create policy "roles manage own" on public.roles for all to authenticated
using (company_id = (select private.current_company_id()) and (select private.has_permission('permissions.manage')))
with check (company_id = (select private.current_company_id()) and (select private.has_permission('permissions.manage')));
create policy "role permissions select own" on public.role_permissions for select to authenticated
using (exists (select 1 from public.roles where roles.id = role_permissions.role_id and roles.company_id = (select private.current_company_id())));
create policy "role permissions manage own" on public.role_permissions for all to authenticated
using ((select private.has_permission('permissions.manage')) and exists (select 1 from public.roles where roles.id = role_permissions.role_id and roles.company_id = (select private.current_company_id())))
with check ((select private.has_permission('permissions.manage')) and exists (select 1 from public.roles where roles.id = role_permissions.role_id and roles.company_id = (select private.current_company_id())));

create policy "profiles select permitted" on public.profiles for select to authenticated
using (id = (select auth.uid()) or (company_id = (select private.current_company_id()) and (select private.has_permission('users.manage'))));
create policy "profiles insert managers" on public.profiles for insert to authenticated
with check (company_id = (select private.current_company_id()) and (select private.has_permission('users.manage')));
create policy "profiles update permitted" on public.profiles for update to authenticated
using (id = (select auth.uid()) or (company_id = (select private.current_company_id()) and (select private.has_permission('users.manage'))))
with check (company_id = (select private.current_company_id()));
create policy "profiles delete managers" on public.profiles for delete to authenticated
using (id <> (select auth.uid()) and company_id = (select private.current_company_id()) and (select private.has_permission('users.manage')));

create policy "clients select permitted" on public.clients for select to authenticated
using (company_id = (select private.current_company_id()) and ((select private.has_permission('clients.manage')) or (select private.has_permission('rentals.manage'))));
create policy "clients insert permitted" on public.clients for insert to authenticated
with check (company_id = (select private.current_company_id()) and (select private.has_permission('clients.manage')));
create policy "clients update permitted" on public.clients for update to authenticated
using (company_id = (select private.current_company_id()) and (select private.has_permission('clients.manage')))
with check (company_id = (select private.current_company_id()) and (select private.has_permission('clients.manage')));
create policy "clients delete permitted" on public.clients for delete to authenticated
using (company_id = (select private.current_company_id()) and (select private.has_permission('clients.manage')));

create policy "equipment categories select permitted" on public.equipment_categories for select to authenticated
using (company_id = (select private.current_company_id()) and ((select private.has_permission('equipment.manage')) or (select private.has_permission('rentals.manage'))));
create policy "equipment categories manage permitted" on public.equipment_categories for all to authenticated
using (company_id = (select private.current_company_id()) and (select private.has_permission('equipment.manage')))
with check (company_id = (select private.current_company_id()) and (select private.has_permission('equipment.manage')));
create policy "equipment select permitted" on public.equipment for select to authenticated
using (company_id = (select private.current_company_id()) and ((select private.has_permission('equipment.manage')) or (select private.has_permission('rentals.manage'))));
create policy "equipment manage permitted" on public.equipment for all to authenticated
using (company_id = (select private.current_company_id()) and (select private.has_permission('equipment.manage')))
with check (company_id = (select private.current_company_id()) and (select private.has_permission('equipment.manage')));
create policy "equipment photos select permitted" on public.equipment_photos for select to authenticated
using (exists (select 1 from public.equipment where equipment.id = equipment_photos.equipment_id and equipment.company_id = (select private.current_company_id())));
create policy "equipment photos manage permitted" on public.equipment_photos for all to authenticated
using ((select private.has_permission('equipment.manage')) and exists (select 1 from public.equipment where equipment.id = equipment_photos.equipment_id and equipment.company_id = (select private.current_company_id())))
with check ((select private.has_permission('equipment.manage')) and exists (select 1 from public.equipment where equipment.id = equipment_photos.equipment_id and equipment.company_id = (select private.current_company_id())));

create policy "rentals select permitted" on public.rentals for select to authenticated
using (company_id = (select private.current_company_id()) and ((select private.has_permission('rentals.manage')) or (select private.has_permission('dashboard.read')) or (select private.has_permission('finance.read'))));
create policy "rentals manage permitted" on public.rentals for all to authenticated
using (company_id = (select private.current_company_id()) and (select private.has_permission('rentals.manage')))
with check (company_id = (select private.current_company_id()) and (select private.has_permission('rentals.manage')));
create policy "rental items select permitted" on public.rental_items for select to authenticated
using (exists (select 1 from public.rentals where rentals.id = rental_items.rental_id and rentals.company_id = (select private.current_company_id())));
create policy "rental items manage permitted" on public.rental_items for all to authenticated
using ((select private.has_permission('rentals.manage')) and exists (select 1 from public.rentals where rentals.id = rental_items.rental_id and rentals.company_id = (select private.current_company_id())))
with check ((select private.has_permission('rentals.manage')) and exists (select 1 from public.rentals where rentals.id = rental_items.rental_id and rentals.company_id = (select private.current_company_id())));
create policy "rental history select permitted" on public.rental_status_history for select to authenticated
using (exists (select 1 from public.rentals where rentals.id = rental_status_history.rental_id and rentals.company_id = (select private.current_company_id())));
create policy "rental history insert permitted" on public.rental_status_history for insert to authenticated
with check ((select private.has_permission('rentals.manage')) and exists (select 1 from public.rentals where rentals.id = rental_status_history.rental_id and rentals.company_id = (select private.current_company_id())));

create policy "expenses select permitted" on public.expenses for select to authenticated
using (company_id = (select private.current_company_id()) and ((select private.has_permission('expenses.manage')) or (select private.has_permission('finance.read')) or (select private.has_permission('dashboard.read'))));
create policy "expenses manage permitted" on public.expenses for all to authenticated
using (company_id = (select private.current_company_id()) and (select private.has_permission('expenses.manage')))
with check (company_id = (select private.current_company_id()) and (select private.has_permission('expenses.manage')));
create policy "revenues select permitted" on public.revenues for select to authenticated
using (company_id = (select private.current_company_id()) and ((select private.has_permission('finance.read')) or (select private.has_permission('dashboard.read'))));
create policy "revenues manage permitted" on public.revenues for all to authenticated
using (company_id = (select private.current_company_id()) and (select private.has_permission('finance.manage')))
with check (company_id = (select private.current_company_id()) and (select private.has_permission('finance.manage')));
create policy "cash flow select permitted" on public.cash_flow_entries for select to authenticated
using (company_id = (select private.current_company_id()) and ((select private.has_permission('finance.read')) or (select private.has_permission('dashboard.read'))));
create policy "cash flow manage permitted" on public.cash_flow_entries for all to authenticated
using (company_id = (select private.current_company_id()) and (select private.has_permission('finance.manage')))
with check (company_id = (select private.current_company_id()) and (select private.has_permission('finance.manage')));

create policy "notifications select own" on public.notifications for select to authenticated
using (company_id = (select private.current_company_id()) and (user_id is null or user_id = (select auth.uid())));
create policy "notifications insert own" on public.notifications for insert to authenticated
with check (company_id = (select private.current_company_id()) and (user_id is null or user_id = (select auth.uid())));
create policy "notifications update own" on public.notifications for update to authenticated
using (company_id = (select private.current_company_id()) and (user_id is null or user_id = (select auth.uid())))
with check (company_id = (select private.current_company_id()) and (user_id is null or user_id = (select auth.uid())));
create policy "notifications delete own" on public.notifications for delete to authenticated
using (company_id = (select private.current_company_id()) and (user_id is null or user_id = (select auth.uid())));

create policy "attachments select permitted" on public.attachments for select to authenticated
using (company_id = (select private.current_company_id()) and ((select private.has_permission('clients.manage')) or (select private.has_permission('equipment.manage')) or (select private.has_permission('rentals.manage')) or (select private.has_permission('expenses.manage'))));
create policy "attachments manage permitted" on public.attachments for all to authenticated
using (company_id = (select private.current_company_id()) and ((select private.has_permission('clients.manage')) or (select private.has_permission('equipment.manage')) or (select private.has_permission('rentals.manage')) or (select private.has_permission('expenses.manage'))))
with check (company_id = (select private.current_company_id()) and ((select private.has_permission('clients.manage')) or (select private.has_permission('equipment.manage')) or (select private.has_permission('rentals.manage')) or (select private.has_permission('expenses.manage'))));
create policy "audit logs select managers" on public.audit_logs for select to authenticated
using (company_id = (select private.current_company_id()) and (select private.has_permission('settings.manage')));
create policy "audit logs insert own" on public.audit_logs for insert to authenticated
with check (company_id = (select private.current_company_id()) and (user_id is null or user_id = (select auth.uid())));
create policy "settings select own" on public.settings for select to authenticated
using (company_id = (select private.current_company_id()));
create policy "settings manage permitted" on public.settings for all to authenticated
using (company_id = (select private.current_company_id()) and (select private.has_permission('settings.manage')))
with check (company_id = (select private.current_company_id()) and (select private.has_permission('settings.manage')));

-- Tighten Storage policies with the same RBAC used by relational records.
drop policy if exists "equipment photos read own company" on storage.objects;
drop policy if exists "equipment photos write own company" on storage.objects;
drop policy if exists "equipment photos update own company" on storage.objects;
drop policy if exists "equipment photos delete own company" on storage.objects;
drop policy if exists "attachments read own company" on storage.objects;
drop policy if exists "attachments write own company" on storage.objects;
drop policy if exists "attachments update own company" on storage.objects;
drop policy if exists "attachments delete own company" on storage.objects;

create policy "equipment photos select permitted" on storage.objects for select to authenticated
using (bucket_id = 'equipment-photos' and split_part(name, '/', 1) = (select private.current_company_id())::text and (select private.has_permission('equipment.manage')));
create policy "equipment photos insert permitted" on storage.objects for insert to authenticated
with check (bucket_id = 'equipment-photos' and split_part(name, '/', 1) = (select private.current_company_id())::text and (select private.has_permission('equipment.manage')));
create policy "equipment photos update permitted" on storage.objects for update to authenticated
using (bucket_id = 'equipment-photos' and split_part(name, '/', 1) = (select private.current_company_id())::text and (select private.has_permission('equipment.manage')))
with check (bucket_id = 'equipment-photos' and split_part(name, '/', 1) = (select private.current_company_id())::text and (select private.has_permission('equipment.manage')));
create policy "equipment photos delete permitted" on storage.objects for delete to authenticated
using (bucket_id = 'equipment-photos' and split_part(name, '/', 1) = (select private.current_company_id())::text and (select private.has_permission('equipment.manage')));
create policy "attachments select permitted" on storage.objects for select to authenticated
using (bucket_id = 'attachments' and split_part(name, '/', 1) = (select private.current_company_id())::text and ((select private.has_permission('clients.manage')) or (select private.has_permission('rentals.manage')) or (select private.has_permission('expenses.manage'))));
create policy "attachments insert permitted" on storage.objects for insert to authenticated
with check (bucket_id = 'attachments' and split_part(name, '/', 1) = (select private.current_company_id())::text and ((select private.has_permission('clients.manage')) or (select private.has_permission('rentals.manage')) or (select private.has_permission('expenses.manage'))));
create policy "attachments update permitted" on storage.objects for update to authenticated
using (bucket_id = 'attachments' and split_part(name, '/', 1) = (select private.current_company_id())::text and ((select private.has_permission('clients.manage')) or (select private.has_permission('rentals.manage')) or (select private.has_permission('expenses.manage'))))
with check (bucket_id = 'attachments' and split_part(name, '/', 1) = (select private.current_company_id())::text and ((select private.has_permission('clients.manage')) or (select private.has_permission('rentals.manage')) or (select private.has_permission('expenses.manage'))));
create policy "attachments delete permitted" on storage.objects for delete to authenticated
using (bucket_id = 'attachments' and split_part(name, '/', 1) = (select private.current_company_id())::text and ((select private.has_permission('clients.manage')) or (select private.has_permission('rentals.manage')) or (select private.has_permission('expenses.manage'))));

create or replace function public.bootstrap_company(
  company_name text,
  company_document text default null,
  profile_name text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  new_company_id uuid;
  administrator_role_id uuid;
  current_user_id uuid := (select auth.uid());
  current_user_email text;
begin
  if current_user_id is null then
    raise exception 'Authentication is required';
  end if;

  if nullif(btrim(company_name), '') is null then
    raise exception 'Company name is required';
  end if;

  if exists (select 1 from public.profiles where id = current_user_id) then
    raise exception 'The authenticated user already has a profile';
  end if;

  select email into current_user_email from auth.users where id = current_user_id;

  insert into public.companies (name, document)
  values (btrim(company_name), nullif(btrim(company_document), ''))
  returning id into new_company_id;

  insert into public.roles (company_id, name, description)
  values
    (new_company_id, 'Administrador', 'Acesso total ao sistema'),
    (new_company_id, 'Gerente', 'Gestao da operacao e da equipe'),
    (new_company_id, 'Financeiro', 'Gestao financeira e de despesas'),
    (new_company_id, 'Operacional', 'Operacao de clientes, estoque e alugueis'),
    (new_company_id, 'Estoque', 'Gestao de equipamentos e separacao'),
    (new_company_id, 'Vendedor', 'Gestao comercial e de alugueis');

  select id into administrator_role_id
  from public.roles
  where company_id = new_company_id and name = 'Administrador';

  insert into public.role_permissions (role_id, permission_id)
  select role.id, permission.id
  from public.roles as role
  cross join public.permissions as permission
  where role.company_id = new_company_id
    and (
      role.name = 'Administrador'
      or (role.name = 'Gerente' and permission.key = any (array['dashboard.read', 'clients.manage', 'equipment.manage', 'rentals.manage', 'finance.read', 'finance.manage', 'expenses.manage', 'users.manage']))
      or (role.name = 'Financeiro' and permission.key = any (array['dashboard.read', 'clients.manage', 'finance.read', 'finance.manage', 'expenses.manage']))
      or (role.name = 'Operacional' and permission.key = any (array['dashboard.read', 'clients.manage', 'equipment.manage', 'rentals.manage']))
      or (role.name = 'Estoque' and permission.key = any (array['dashboard.read', 'equipment.manage', 'rentals.manage']))
      or (role.name = 'Vendedor' and permission.key = any (array['dashboard.read', 'clients.manage', 'rentals.manage']))
    );

  insert into public.profiles (id, company_id, role_id, name, email)
  values (
    current_user_id,
    new_company_id,
    administrator_role_id,
    coalesce(nullif(btrim(profile_name), ''), split_part(current_user_email, '@', 1)),
    current_user_email
  );

  insert into public.settings (company_id, key, value)
  values
    (new_company_id, 'company', jsonb_build_object('name', btrim(company_name), 'document', nullif(btrim(company_document), ''))),
    (new_company_id, 'notifications', '{"rental_reminders": true, "expense_alerts": true}'::jsonb);

  return new_company_id;
end;
$$;

revoke all on function public.bootstrap_company(text, text, text) from public, anon;
grant execute on function public.bootstrap_company(text, text, text) to authenticated;
