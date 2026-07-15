-- Development-only seed. Do not execute this file against production.
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
  )
on conflict (id) do nothing;

insert into public.role_permissions (role_id, permission_id)
select '00000000-0000-4000-8000-000000000010', id
from public.permissions
on conflict do nothing;
