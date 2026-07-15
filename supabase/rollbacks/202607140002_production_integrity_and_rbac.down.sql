-- Emergency rollback for 202607140002_production_integrity_and_rbac.sql.
-- Run only after a reviewed backup/restore decision. Forward-fix migrations are preferred.

drop function if exists public.bootstrap_company(text, text, text);
drop view if exists public.v_dashboard_month;

drop trigger if exists profiles_protect_security_fields on public.profiles;
drop function if exists private.protect_profile_security_fields();

drop trigger if exists profiles_tenant_integrity on public.profiles;
drop trigger if exists clients_tenant_integrity on public.clients;
drop trigger if exists equipment_tenant_integrity on public.equipment;
drop trigger if exists rentals_tenant_integrity on public.rentals;
drop trigger if exists rental_items_tenant_integrity on public.rental_items;
drop trigger if exists rental_history_tenant_integrity on public.rental_status_history;
drop trigger if exists expenses_tenant_integrity on public.expenses;
drop trigger if exists revenues_tenant_integrity on public.revenues;
drop trigger if exists notifications_tenant_integrity on public.notifications;
drop trigger if exists attachments_tenant_integrity on public.attachments;
drop trigger if exists audit_logs_tenant_integrity on public.audit_logs;
drop function if exists private.assert_tenant_relationships();

drop function if exists private.has_permission(text);
drop function if exists private.current_company_id();

-- Constraints, indexes and RLS policies are intentionally retained because dropping them can
-- reintroduce data corruption or expose tenant data. Restore the pre-migration backup when a full
-- rollback is required.
