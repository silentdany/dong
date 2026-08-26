-- One row per browser that has ever loaded the board. The row existing is a
-- visitor; the row being fresh is a visitor who is still here. Two counters,
-- one table, no second store.
create table if not exists visitors (
  id text primary key,
  first_seen timestamptz not null default now(),
  last_seen timestamptz not null default now()
);

create index if not exists visitors_last_seen_idx on visitors (last_seen desc);
