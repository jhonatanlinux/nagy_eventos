begin;

do $$
declare
  company_a constant uuid := '00000000-0000-4000-8000-000000000001';
  company_b constant uuid := '00000000-0000-4000-8000-000000000002';
  client_a constant uuid := '00000000-0000-4000-8000-000000000101';
  category_b constant uuid := '00000000-0000-4000-8000-000000000201';
  actual_revenue numeric;
  actual_expenses numeric;
  role_count integer;
  category_count integer;
begin
  select count(*) into role_count from public.roles where company_id = company_a;
  if role_count <> 6 then
    raise exception 'Expected 6 seeded roles, found %', role_count;
  end if;

  select count(*) into category_count from public.equipment_categories where company_id = company_a;
  if category_count <> 5 then
    raise exception 'Expected 5 seeded equipment categories, found %', category_count;
  end if;

  insert into public.clients (id, company_id, name, document)
  values (client_a, company_a, 'Cliente de teste', 'TEST-CLIENT-001');

  insert into public.rentals (company_id, client_id, pickup_at, return_at, value)
  values
    (company_a, client_a, date_trunc('month', current_date) + interval '1 day', date_trunc('month', current_date) + interval '2 days', 100),
    (company_a, client_a, date_trunc('month', current_date) + interval '3 days', date_trunc('month', current_date) + interval '4 days', 200);

  insert into public.expenses (company_id, category, description, value, due_date)
  values
    (company_a, 'Teste', 'Despesa A', 40, date_trunc('month', current_date)::date + 1),
    (company_a, 'Teste', 'Despesa B', 60, date_trunc('month', current_date)::date + 2);

  select month_revenue, month_expenses
  into actual_revenue, actual_expenses
  from public.v_dashboard_month
  where company_id = company_a;

  if actual_revenue <> 300 or actual_expenses <> 100 then
    raise exception 'Dashboard totals are incorrect: revenue %, expenses %', actual_revenue, actual_expenses;
  end if;

  begin
    insert into public.expenses (company_id, category, description, value, due_date)
    values (company_a, 'Teste', 'Valor invalido', -1, current_date);
    raise exception 'Negative expense constraint was not enforced';
  exception
    when check_violation then null;
  end;

  insert into public.companies (id, name, document)
  values (company_b, 'Outra empresa', 'TEST-COMPANY-002');

  insert into public.equipment_categories (id, company_id, name)
  values (category_b, company_b, 'Categoria externa');

  begin
    insert into public.equipment (company_id, category_id, name, internal_code)
    values (company_a, category_b, 'Equipamento invalido', 'INVALID-CROSS-TENANT');
    raise exception 'Cross-tenant equipment category was accepted';
  exception
    when raise_exception then
      if sqlerrm = 'Cross-tenant equipment category was accepted' then
        raise;
      end if;
  end;
end;
$$;

rollback;
