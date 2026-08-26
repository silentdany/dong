create table if not exists listings (
  id text primary key,
  display_name text not null,
  target_type text not null,
  target_key text not null unique,
  target_url text not null,
  description text not null default '',
  all_time_cents integer not null default 0,
  click_count integer not null default 0,
  hidden boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists listings_all_time_idx on listings (all_time_cents desc, created_at asc);
create index if not exists listings_hidden_all_time_idx on listings (hidden, all_time_cents desc);

create table if not exists payments (
  id text primary key,
  listing_id text not null references listings(id) on delete cascade,
  amount_cents integer not null,
  created_at timestamptz not null default now()
);

create index if not exists payments_created_idx on payments (created_at desc);
create index if not exists payments_listing_created_idx on payments (listing_id, created_at desc);

insert into listings (
  id, display_name, target_type, target_key, target_url, description,
  all_time_cents, click_count, hidden, created_at, updated_at
) values
  (
    'lst_founder',
    'Major Baguette',
    'handle',
    'handle:majorbaguette',
    'https://x.com/MajorBaguette',
    'stopped pretending',
    18000, 12, false,
    now() - interval '2 hours',
    now()
  ),
  (
    'lst_second',
    'ROI screenshot',
    'url',
    'url:https://example.com/ship',
    'https://example.com/ship',
    '$17k. called it marketing.',
    5500, 4, false,
    now() - interval '90 minutes',
    now()
  ),
  (
    'lst_third',
    'Building in public',
    'handle',
    'handle:buildinpublic',
    'https://x.com/buildinpublic',
    'day 47 of the costume',
    2200, 2, false,
    now() - interval '40 minutes',
    now()
  ),
  (
    'lst_fourth',
    'Lifestyle business',
    'url',
    'url:https://example.com/floor',
    'https://example.com/floor',
    'the minimum honesty',
    500, 1, false,
    now() - interval '15 minutes',
    now()
  )
on conflict (id) do nothing;

insert into payments (id, listing_id, amount_cents, created_at) values
  ('pay_founder', 'lst_founder', 18000, now() - interval '2 hours'),
  ('pay_second', 'lst_second', 5500, now() - interval '90 minutes'),
  ('pay_third', 'lst_third', 2200, now() - interval '40 minutes'),
  ('pay_fourth', 'lst_fourth', 500, now() - interval '15 minutes')
on conflict (id) do nothing;
