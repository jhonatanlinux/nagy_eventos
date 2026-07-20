-- Development-only seed. Applied by local start/reset after all migrations.
insert into public.companies (id, name, document)
values ('00000000-0000-4000-8000-000000000001', 'NAGY Eventos - Desenvolvimento', '00000000000000')
on conflict (id) do nothing;

insert into public.roles (id, company_id, name, description)
values
  (
    '00000000-0000-4000-8000-000000000010',
    '00000000-0000-4000-8000-000000000001',
    'Administrador',
    'Acesso administrativo ao ambiente local'
  ),
  ('00000000-0000-4000-8000-000000000011', '00000000-0000-4000-8000-000000000001', 'Gerente', 'Gestao da operacao e da equipe'),
  ('00000000-0000-4000-8000-000000000012', '00000000-0000-4000-8000-000000000001', 'Financeiro', 'Gestao financeira e de despesas'),
  ('00000000-0000-4000-8000-000000000013', '00000000-0000-4000-8000-000000000001', 'Operacional', 'Operacao de clientes, estoque e alugueis'),
  ('00000000-0000-4000-8000-000000000014', '00000000-0000-4000-8000-000000000001', 'Estoque', 'Gestao de equipamentos e separacao'),
  ('00000000-0000-4000-8000-000000000015', '00000000-0000-4000-8000-000000000001', 'Vendedor', 'Gestao comercial e de alugueis')
on conflict (company_id, name) do update
set description = excluded.description;

insert into public.role_permissions (role_id, permission_id)
select role.id, permission.id
from public.roles as role
cross join public.permissions as permission
where role.company_id = '00000000-0000-4000-8000-000000000001'
  and (
    role.name = 'Administrador'
    or (role.name = 'Gerente' and permission.key = any (array['dashboard.read', 'clients.manage', 'equipment.manage', 'rentals.manage', 'finance.read', 'finance.manage', 'expenses.manage', 'users.manage']))
    or (role.name = 'Financeiro' and permission.key = any (array['dashboard.read', 'clients.manage', 'finance.read', 'finance.manage', 'expenses.manage']))
    or (role.name = 'Operacional' and permission.key = any (array['dashboard.read', 'clients.manage', 'equipment.manage', 'rentals.manage']))
    or (role.name = 'Estoque' and permission.key = any (array['dashboard.read', 'equipment.manage', 'rentals.manage']))
    or (role.name = 'Vendedor' and permission.key = any (array['dashboard.read', 'clients.manage', 'rentals.manage']))
  )
on conflict do nothing;

insert into public.equipment_categories (company_id, name)
values
  ('00000000-0000-4000-8000-000000000001', 'Som'),
  ('00000000-0000-4000-8000-000000000001', 'Iluminacao'),
  ('00000000-0000-4000-8000-000000000001', 'Estrutura'),
  ('00000000-0000-4000-8000-000000000001', 'Energia'),
  ('00000000-0000-4000-8000-000000000001', 'Video')
on conflict (company_id, name) do nothing;

insert into public.settings (company_id, key, value)
values
  ('00000000-0000-4000-8000-000000000001', 'company', '{"name": "NAGY Eventos - Desenvolvimento", "document": "00000000000000"}'::jsonb),
  ('00000000-0000-4000-8000-000000000001', 'notifications', '{"rental_reminders": true, "expense_alerts": true}'::jsonb)
on conflict (company_id, key) do update
set value = excluded.value;
