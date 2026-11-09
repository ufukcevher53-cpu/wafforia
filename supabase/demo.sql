-- Wafforia DEMO senkronu: tek satırlık paylaşılan durum + sürüm (rev) kontrollü yazma.
-- Gerçek sürümde ayrı tablolar (masa, oturum, sipariş) ve kasa girişi olacak.
create table if not exists public.wf_state (
  id text primary key,
  state jsonb not null,
  rev integer not null default 0,
  updated_at timestamptz not null default now(),
  constraint wf_state_size check (octet_length(state::text) < 1500000)
);
alter table public.wf_state enable row level security;
drop policy if exists wf_state_read on public.wf_state;
create policy wf_state_read on public.wf_state for select to anon, authenticated using (id = 'wafforia-demo');
revoke insert, update, delete on public.wf_state from anon, authenticated;
grant select on public.wf_state to anon, authenticated;

create or replace function public.wf_save(p_id text, p_base integer, p_state jsonb)
returns jsonb language plpgsql security definer set search_path = public as $$
declare cur public.wf_state%rowtype;
begin
  if p_id <> 'wafforia-demo' then raise exception 'izin yok'; end if;
  select * into cur from public.wf_state where id = p_id for update;
  if not found then
    if p_base <> 0 then return jsonb_build_object('ok', false, 'rev', 0, 'state', null); end if;
    insert into public.wf_state(id, state, rev) values (p_id, p_state, 1);
    return jsonb_build_object('ok', true, 'rev', 1);
  end if;
  if cur.rev <> p_base then
    return jsonb_build_object('ok', false, 'rev', cur.rev, 'state', cur.state);
  end if;
  update public.wf_state set state = p_state, rev = cur.rev + 1, updated_at = now() where id = p_id;
  return jsonb_build_object('ok', true, 'rev', cur.rev + 1);
end $$;
revoke all on function public.wf_save(text, integer, jsonb) from public;
grant execute on function public.wf_save(text, integer, jsonb) to anon, authenticated;

do $$ begin
  alter publication supabase_realtime add table public.wf_state;
exception when duplicate_object then null; end $$;
