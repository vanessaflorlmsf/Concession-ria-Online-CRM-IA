-- Endurecimento de segurança. Execute DEPOIS de 202610140001_initial_schema.sql.

-- 1) Visitantes anônimos NÃO podem ler custo, placa, chassi etc. dos veículos.
--    A vitrine pública precisa listar explicitamente estas colunas (select=id,brand,...).
revoke select on public.vehicles from anon;
grant select (id, brand, model, year, price, mileage, fuel, transmission, color,
              image_url, gallery, features, description, is_new, status, created_at)
  on public.vehicles to anon;

-- 2) Foto só por HTTPS (ou vazia).
alter table public.vehicles drop constraint if exists vehicles_image_url_https;
alter table public.vehicles add constraint vehicles_image_url_https
  check (image_url = '' or image_url ~* '^https://');

-- 3) Política de envio de lead mais restrita (campos só da equipe ficam fora do alcance do público).
drop policy if exists "public can submit lead" on public.leads;
create policy "public can submit lead" on public.leads for insert to anon, authenticated
with check (
  length(trim(name)) between 2 and 120
  and length(regexp_replace(phone, '[^0-9]', '', 'g')) between 10 and 15
  and length(phone) <= 30
  and consent_contact = true
  and stage = 'new'
  and assigned_to is null and customer_id is null and vehicle_id is null
  and notes is null and last_contact_at is null and next_follow_up_at is null
  and source in ('site','whatsapp','instagram','other')
  and (interest is null or length(interest) <= 300)
  and (email is null or length(email) <= 200)
);

-- 4) Anti-spam: limita envios repetidos pelo formulário público.
create or replace function public.limit_public_leads()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if auth.role() = 'service_role' or public.is_staff() then return new; end if;
  if (select count(*) from public.leads
        where phone = new.phone and created_at > now() - interval '1 hour') >= 5 then
    raise exception 'Muitas solicitações para este telefone. Tente novamente mais tarde.';
  end if;
  if (select count(*) from public.leads
        where source = 'site' and created_at > now() - interval '1 hour') >= 200 then
    raise exception 'Atendimento temporariamente indisponível. Tente novamente mais tarde.';
  end if;
  return new;
end; $$;
drop trigger if exists leads_limit_public on public.leads;
create trigger leads_limit_public before insert on public.leads
  for each row execute function public.limit_public_leads();

-- 5) Equipe comum não apaga registros. Exclusões (ex.: pedido LGPD) são feitas por admin no SQL Editor.
revoke delete on public.vehicles, public.customers, public.leads, public.conversations,
                 public.messages, public.tasks, public.proposals, public.profiles from authenticated;

-- 6) Auditoria automática (sem gravar dados pessoais: só nomes das colunas alteradas).
create or replace function public.audit_row()
returns trigger language plpgsql security definer set search_path = public as $$
declare changed text[]; rid text;
begin
  if tg_op = 'UPDATE' then
    select coalesce(array_agg(n.key), '{}') into changed
      from jsonb_each(to_jsonb(new)) n
      join jsonb_each(to_jsonb(old)) o using (key)
      where n.value is distinct from o.value and n.key <> 'updated_at';
    rid := to_jsonb(new)->>'id';
  else
    rid := to_jsonb(new)->>'id'; changed := '{}';
  end if;
  insert into public.audit_logs(actor_id, actor_type, action, entity_table, entity_id, details)
  values (auth.uid(), case when auth.uid() is null then 'system' else 'user' end,
          lower(tg_op), tg_table_name, rid, jsonb_build_object('changed_columns', changed));
  return new;
end; $$;
drop trigger if exists vehicles_audit on public.vehicles;
create trigger vehicles_audit after insert or update on public.vehicles for each row execute function public.audit_row();
drop trigger if exists leads_audit on public.leads;
create trigger leads_audit after update on public.leads for each row execute function public.audit_row();
drop trigger if exists customers_audit on public.customers;
create trigger customers_audit after insert or update on public.customers for each row execute function public.audit_row();
drop trigger if exists proposals_audit on public.proposals;
create trigger proposals_audit after insert or update on public.proposals for each row execute function public.audit_row();
drop trigger if exists profiles_audit on public.profiles;
create trigger profiles_audit after insert or update on public.profiles for each row execute function public.audit_row();
