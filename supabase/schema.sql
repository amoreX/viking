-- ============================================================
-- VIKING - Vibecoder Leaderboard
-- Simplified schema: just users
-- Run this in the Supabase SQL Editor
-- ============================================================

create table if not exists users (
  id text primary key default gen_random_uuid()::text,

  -- GitHub identity
  github_id integer unique not null,
  username text unique not null,
  avatar_url text,
  bio text,
  access_token text,

  -- Computed stats (updated on each sync)
  agent_lines integer not null default 0,
  vibe_hours integer not null default 0,
  vibe_score double precision not null default 0,
  streak integer not null default 0,
  total_prs integer not null default 0,
  peak_hour text not null default '12:00 UTC',
  top_repo text,
  badges text[] not null default '{}',

  -- Period scores
  score_daily double precision not null default 0,
  score_weekly double precision not null default 0,
  score_alltime double precision not null default 0,

  last_synced_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Leaderboard indexes
create index if not exists idx_users_score_daily on users(score_daily desc);
create index if not exists idx_users_score_weekly on users(score_weekly desc);
create index if not exists idx_users_score_alltime on users(score_alltime desc);
create index if not exists idx_users_vibe_score on users(vibe_score desc);

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists users_updated_at on users;
create trigger users_updated_at before update on users
  for each row execute function update_updated_at();
