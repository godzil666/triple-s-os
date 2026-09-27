-- Client Preview only. The existing validated V2 aggregate remains the source of
-- truth; one row lock serializes mutations across Vercel instances.
create schema if not exists client_preview;
revoke all on schema client_preview from public, anon, authenticated;

create table if not exists client_preview.documents (
  id text primary key check (id = 'app'),
  payload jsonb not null default '{}'::jsonb check (jsonb_typeof(payload) = 'object'),
  updated_at timestamptz not null default now()
);
revoke all on client_preview.documents from public, anon, authenticated;
insert into client_preview.documents (id, payload) values ('app', '{}'::jsonb)
on conflict (id) do nothing;
