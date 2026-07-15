-- Ensure views respect the RLS policies of the querying user.
alter view public.v_dashboard_month set (security_invoker = true);
alter view public.v_client_rental_history set (security_invoker = true);

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'rentals'
  ) then
    alter publication supabase_realtime add table public.rentals;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'notifications'
  ) then
    alter publication supabase_realtime add table public.notifications;
  end if;
end;
$$;

-- Storage object paths must start with the authenticated user's company UUID.
create policy "equipment photos read own company"
on storage.objects for select to authenticated
using (
  bucket_id = 'equipment-photos'
  and split_part(name, '/', 1) = public.current_company_id()::text
);

create policy "equipment photos write own company"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'equipment-photos'
  and split_part(name, '/', 1) = public.current_company_id()::text
);

create policy "equipment photos update own company"
on storage.objects for update to authenticated
using (
  bucket_id = 'equipment-photos'
  and split_part(name, '/', 1) = public.current_company_id()::text
)
with check (
  bucket_id = 'equipment-photos'
  and split_part(name, '/', 1) = public.current_company_id()::text
);

create policy "equipment photos delete own company"
on storage.objects for delete to authenticated
using (
  bucket_id = 'equipment-photos'
  and split_part(name, '/', 1) = public.current_company_id()::text
);

create policy "attachments read own company"
on storage.objects for select to authenticated
using (
  bucket_id = 'attachments'
  and split_part(name, '/', 1) = public.current_company_id()::text
);

create policy "attachments write own company"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'attachments'
  and split_part(name, '/', 1) = public.current_company_id()::text
);

create policy "attachments update own company"
on storage.objects for update to authenticated
using (
  bucket_id = 'attachments'
  and split_part(name, '/', 1) = public.current_company_id()::text
)
with check (
  bucket_id = 'attachments'
  and split_part(name, '/', 1) = public.current_company_id()::text
);

create policy "attachments delete own company"
on storage.objects for delete to authenticated
using (
  bucket_id = 'attachments'
  and split_part(name, '/', 1) = public.current_company_id()::text
);
