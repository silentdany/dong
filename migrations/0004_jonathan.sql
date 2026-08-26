-- One listing. The guy who started it. German average, rounded to a whole dollar.
delete from payments;
delete from listings;

insert into listings (
  id, display_name, target_type, target_key, target_url, description,
  all_time_cents, click_count, hidden, created_at, updated_at
) values (
  'lst_jonathan',
  'Jonathan Wilke',
  'handle',
  'handle:jonathan_wilke',
  'https://x.com/jonathan_wilke',
  'Started it. German average. You''re welcome.',
  1500,
  0,
  false,
  now(),
  now()
);

insert into payments (id, listing_id, amount_cents, stripe_session_id, created_at) values
  ('pay_jonathan', 'lst_jonathan', 1500, 'seed_session_jonathan_wilke', now());
