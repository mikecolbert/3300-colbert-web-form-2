-- Run this in your Supabase SQL editor to set up the survey_responses table.

create table if not exists public.survey_responses (
  id          uuid primary key default gen_random_uuid(),
  hometown    text not null,
  state       text not null,
  college_year text not null,
  hobbies     text[] not null default '{}',
  other_hobby text,
  created_at  timestamptz not null default now()
);

-- Enable Row Level Security
alter table public.survey_responses enable row level security;

-- Allow anyone to insert a response (anonymous survey)
create policy "allow_public_insert"
  on public.survey_responses
  for insert
  to anon
  with check (true);

-- Allow anyone to read all responses (for the results page)
create policy "allow_public_select"
  on public.survey_responses
  for select
  to anon
  using (true);
