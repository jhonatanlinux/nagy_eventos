create extension if not exists "pgcrypto";

create type rental_status as enum (
  'Agendado',
  'Separacao',
  'Saiu para entrega',
  'Em uso',
  'Retornado',
  'Finalizado',
  'Cancelado'
);

create type equipment_status as enum (
  'Disponivel',
  'Reservado',
  'Em aluguel',
  'Manutencao',
  'Inativo'
);

create type expense_status as enum ('Pendente', 'Pago', 'Vencido');
create type notification_level as enum ('info', 'warning', 'danger');
create type audit_action as enum ('login', 'logout', 'create', 'update', 'delete');

create table public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  document text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.roles (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies(id) on delete cascade,
  name text not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (company_id, name)
);

create table public.permissions (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  module text not null,
  description text not null,
  created_at timestamptz not null default now()
);

create table public.role_permissions (
  role_id uuid not null references public.roles(id) on delete cascade,
  permission_id uuid not null references public.permissions(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (role_id, permission_id)
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  company_id uuid references public.companies(id) on delete cascade,
  role_id uuid references public.roles(id),
  name text not null,
  email text not null,
  avatar_url text,
  last_access_at timestamptz,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.clients (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  name text not null,
  document text not null,
  phone text,
  whatsapp text,
  email text,
  address text,
  city text,
  state text,
  notes text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.equipment_categories (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (company_id, name)
);

create table public.equipment (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  category_id uuid references public.equipment_categories(id),
  name text not null,
  brand text,
  model text,
  patrimony text,
  internal_code text not null,
  quantity integer not null default 0 check (quantity >= 0),
  daily_rate numeric(12, 2) not null default 0,
  weekend_rate numeric(12, 2) not null default 0,
  weekly_rate numeric(12, 2) not null default 0,
  status equipment_status not null default 'Disponivel',
  notes text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (company_id, internal_code)
);

create table public.equipment_photos (
  id uuid primary key default gen_random_uuid(),
  equipment_id uuid not null references public.equipment(id) on delete cascade,
  storage_path text not null,
  created_at timestamptz not null default now()
);

create table public.rentals (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  client_id uuid not null references public.clients(id),
  pickup_at timestamptz not null,
  return_at timestamptz not null,
  value numeric(12, 2) not null default 0,
  discount numeric(12, 2) not null default 0,
  freight numeric(12, 2) not null default 0,
  assembly numeric(12, 2) not null default 0,
  status rental_status not null default 'Agendado',
  notes text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (return_at >= pickup_at)
);

create table public.rental_items (
  id uuid primary key default gen_random_uuid(),
  rental_id uuid not null references public.rentals(id) on delete cascade,
  equipment_id uuid not null references public.equipment(id),
  quantity integer not null check (quantity > 0),
  unit_value numeric(12, 2) not null default 0,
  created_at timestamptz not null default now()
);

create table public.rental_status_history (
  id uuid primary key default gen_random_uuid(),
  rental_id uuid not null references public.rentals(id) on delete cascade,
  status rental_status not null,
  changed_by uuid references public.profiles(id),
  changed_at timestamptz not null default now()
);

create table public.expenses (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  category text not null,
  supplier text,
  description text not null,
  value numeric(12, 2) not null default 0,
  payment_method text,
  due_date date not null,
  payment_date date,
  status expense_status not null default 'Pendente',
  notes text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.revenues (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  rental_id uuid references public.rentals(id) on delete set null,
  description text not null,
  value numeric(12, 2) not null default 0,
  received_at date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.cash_flow_entries (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  source_table text not null,
  source_id uuid not null,
  entry_type text not null check (entry_type in ('Receita', 'Despesa')),
  description text not null,
  value numeric(12, 2) not null default 0,
  due_date date not null,
  paid_at date,
  created_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  title text not null,
  description text not null,
  level notification_level not null default 'info',
  source text not null,
  source_id uuid,
  due_at timestamptz,
  read_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.attachments (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  owner_table text not null,
  owner_id uuid not null,
  storage_path text not null,
  file_name text not null,
  mime_type text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies(id) on delete cascade,
  user_id uuid references public.profiles(id),
  action audit_action not null,
  module text not null,
  entity_id uuid,
  description text not null,
  created_at timestamptz not null default now()
);

create table public.settings (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  key text not null,
  value jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (company_id, key)
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.current_company_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select company_id from public.profiles where id = auth.uid();
$$;

create trigger companies_updated_at before update on public.companies
for each row execute function public.set_updated_at();
create trigger roles_updated_at before update on public.roles
for each row execute function public.set_updated_at();
create trigger profiles_updated_at before update on public.profiles
for each row execute function public.set_updated_at();
create trigger clients_updated_at before update on public.clients
for each row execute function public.set_updated_at();
create trigger equipment_categories_updated_at before update on public.equipment_categories
for each row execute function public.set_updated_at();
create trigger equipment_updated_at before update on public.equipment
for each row execute function public.set_updated_at();
create trigger rentals_updated_at before update on public.rentals
for each row execute function public.set_updated_at();
create trigger expenses_updated_at before update on public.expenses
for each row execute function public.set_updated_at();
create trigger revenues_updated_at before update on public.revenues
for each row execute function public.set_updated_at();
create trigger notifications_updated_at before update on public.notifications
for each row execute function public.set_updated_at();
create trigger settings_updated_at before update on public.settings
for each row execute function public.set_updated_at();

create index idx_clients_company_name on public.clients(company_id, name);
create index idx_equipment_company_status on public.equipment(company_id, status);
create index idx_rentals_company_pickup on public.rentals(company_id, pickup_at);
create index idx_rentals_company_return on public.rentals(company_id, return_at);
create index idx_rental_items_rental on public.rental_items(rental_id);
create index idx_expenses_company_due on public.expenses(company_id, due_date, status);
create index idx_notifications_company_read on public.notifications(company_id, read_at);
create index idx_audit_logs_company_created on public.audit_logs(company_id, created_at desc);

create view public.v_dashboard_month as
select
  c.id as company_id,
  coalesce(sum(r.value) filter (where date_trunc('month', r.pickup_at) = date_trunc('month', now())), 0) as month_revenue,
  coalesce(sum(e.value) filter (where date_trunc('month', e.due_date::timestamptz) = date_trunc('month', now())), 0) as month_expenses
from public.companies c
left join public.rentals r on r.company_id = c.id and r.status <> 'Cancelado'
left join public.expenses e on e.company_id = c.id
group by c.id;

create view public.v_client_rental_history as
select
  c.company_id,
  c.id as client_id,
  c.name as client_name,
  r.id as rental_id,
  r.pickup_at,
  r.return_at,
  r.status,
  r.value
from public.clients c
left join public.rentals r on r.client_id = c.id;

alter table public.companies enable row level security;
alter table public.roles enable row level security;
alter table public.permissions enable row level security;
alter table public.role_permissions enable row level security;
alter table public.profiles enable row level security;
alter table public.clients enable row level security;
alter table public.equipment_categories enable row level security;
alter table public.equipment enable row level security;
alter table public.equipment_photos enable row level security;
alter table public.rentals enable row level security;
alter table public.rental_items enable row level security;
alter table public.rental_status_history enable row level security;
alter table public.expenses enable row level security;
alter table public.revenues enable row level security;
alter table public.cash_flow_entries enable row level security;
alter table public.notifications enable row level security;
alter table public.attachments enable row level security;
alter table public.audit_logs enable row level security;
alter table public.settings enable row level security;

create policy "company read own" on public.companies
for select using (id = public.current_company_id());

create policy "profiles read own company" on public.profiles
for select using (company_id = public.current_company_id() or id = auth.uid());

create policy "profiles update self" on public.profiles
for update using (id = auth.uid()) with check (id = auth.uid());

create policy "permissions read authenticated" on public.permissions
for select to authenticated using (true);

create policy "role permissions read own company" on public.role_permissions
for select using (
  exists (
    select 1 from public.roles r
    where r.id = role_permissions.role_id
    and r.company_id = public.current_company_id()
  )
);

create policy "roles own company" on public.roles
for all using (company_id = public.current_company_id())
with check (company_id = public.current_company_id());

create policy "clients own company" on public.clients
for all using (company_id = public.current_company_id())
with check (company_id = public.current_company_id());

create policy "equipment categories own company" on public.equipment_categories
for all using (company_id = public.current_company_id())
with check (company_id = public.current_company_id());

create policy "equipment own company" on public.equipment
for all using (company_id = public.current_company_id())
with check (company_id = public.current_company_id());

create policy "equipment photos own company" on public.equipment_photos
for all using (
  exists (
    select 1 from public.equipment e
    where e.id = equipment_photos.equipment_id
    and e.company_id = public.current_company_id()
  )
)
with check (
  exists (
    select 1 from public.equipment e
    where e.id = equipment_photos.equipment_id
    and e.company_id = public.current_company_id()
  )
);

create policy "rentals own company" on public.rentals
for all using (company_id = public.current_company_id())
with check (company_id = public.current_company_id());

create policy "rental items own company" on public.rental_items
for all using (
  exists (
    select 1 from public.rentals r
    where r.id = rental_items.rental_id
    and r.company_id = public.current_company_id()
  )
)
with check (
  exists (
    select 1 from public.rentals r
    where r.id = rental_items.rental_id
    and r.company_id = public.current_company_id()
  )
);

create policy "rental history own company" on public.rental_status_history
for all using (
  exists (
    select 1 from public.rentals r
    where r.id = rental_status_history.rental_id
    and r.company_id = public.current_company_id()
  )
)
with check (
  exists (
    select 1 from public.rentals r
    where r.id = rental_status_history.rental_id
    and r.company_id = public.current_company_id()
  )
);

create policy "expenses own company" on public.expenses
for all using (company_id = public.current_company_id())
with check (company_id = public.current_company_id());

create policy "revenues own company" on public.revenues
for all using (company_id = public.current_company_id())
with check (company_id = public.current_company_id());

create policy "cash flow own company" on public.cash_flow_entries
for all using (company_id = public.current_company_id())
with check (company_id = public.current_company_id());

create policy "notifications own company" on public.notifications
for all using (company_id = public.current_company_id())
with check (company_id = public.current_company_id());

create policy "attachments own company" on public.attachments
for all using (company_id = public.current_company_id())
with check (company_id = public.current_company_id());

create policy "audit logs read own company" on public.audit_logs
for select using (company_id = public.current_company_id());

create policy "audit logs insert own company" on public.audit_logs
for insert with check (company_id = public.current_company_id());

create policy "settings own company" on public.settings
for all using (company_id = public.current_company_id())
with check (company_id = public.current_company_id());

insert into public.permissions (key, module, description)
values
  ('dashboard.read', 'Dashboard', 'Visualizar dashboard'),
  ('clients.manage', 'Clientes', 'Gerenciar clientes'),
  ('equipment.manage', 'Equipamentos', 'Gerenciar equipamentos'),
  ('rentals.manage', 'Agendamentos', 'Gerenciar alugueis'),
  ('finance.read', 'Financeiro', 'Visualizar financeiro'),
  ('expenses.manage', 'Despesas', 'Gerenciar despesas'),
  ('users.manage', 'Usuarios', 'Gerenciar usuarios'),
  ('permissions.manage', 'Permissoes', 'Gerenciar permissoes'),
  ('settings.manage', 'Configuracoes', 'Gerenciar configuracoes')
on conflict (key) do nothing;

insert into storage.buckets (id, name, public)
values
  ('equipment-photos', 'equipment-photos', false),
  ('attachments', 'attachments', false)
on conflict (id) do nothing;
