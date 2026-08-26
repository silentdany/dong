alter table payments
  add column if not exists stripe_session_id text;

update payments
set stripe_session_id = id
where stripe_session_id is null;

alter table payments
  alter column stripe_session_id set not null;

create unique index if not exists payments_stripe_session_uidx
  on payments (stripe_session_id);
