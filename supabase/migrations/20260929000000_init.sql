-- Prompt to Production: live event backend.
-- All tables are private (RLS on, no policies): only the Next.js server, using the
-- service-role key, reads and writes. Business rules that must never be bypassed
-- are enforced here as constraints and triggers.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------- config
create table event_config (
  id int primary key default 1 check (id = 1),
  name text not null default 'Prompt to Production',
  subtitle text not null default 'Paytm AI Workshop',
  organized_by text not null default 'Department of IT & AI&DS, N.B.K.R. Institute of Science & Technology',
  associated_with text not null default 'ISTE (Indian Society for Technical Education)',
  date date not null default '2026-09-30',
  date_formatted text not null default '30 September 2026',
  time text not null default '9:00 AM – 4:00 PM',
  venue text not null default 'Seminar Hall, New CSE Block',
  capacity int not null default 100 check (capacity > 0),
  registration_open boolean not null default true,
  iste_fee int not null default 50,
  non_iste_fee int not null default 100,
  max_team_size int not null default 4 check (max_team_size between 1 and 10),
  description text not null default 'An intensive full-day hands-on workshop and build challenge bridging cutting-edge Generative AI and production engineering, featuring virtual masterclasses by tech leaders from Paytm and Microsoft.',
  event_end_at timestamptz not null default '2026-09-30 16:00:00+05:30',
  submission_deadline_at timestamptz not null default '2026-09-30 16:00:00+05:30',
  upi_id text not null default '',
  updated_at timestamptz not null default now()
);
insert into event_config (id) values (1);

-- ---------------------------------------------------------------- people
create table app_users (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null,
  email text not null unique,
  phone text not null default '',
  role text not null default 'user' check (role in ('user', 'coordinator', 'admin')),
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now()
);

create table participant_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references app_users (id) on delete cascade,
  certificate_name text not null,
  mobile text not null,
  roll_number text not null,
  year text not null check (year in ('1st Year', '2nd Year', '3rd Year', '4th Year')),
  branch text not null check (branch in ('AI & DS', 'IT', 'CSE', 'ECE', 'EEE', 'Mechanical', 'Civil')),
  section text not null check (section in ('A', 'B', 'C', 'D')),
  iste_member boolean not null default false,
  iste_sm_number text,
  has_laptop boolean not null default true,
  linkedin_portfolio text,
  created_at timestamptz not null default now()
);
create unique index participant_roll_unique on participant_profiles (upper(roll_number));

create table coordinators (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references app_users (id) on delete cascade,
  employee_or_student_id text not null default '',
  status text not null default 'active' check (status in ('active', 'disabled')),
  permissions text[] not null default array['CHECKIN_VIEW', 'CHECKIN_MANAGE', 'PARTICIPANT_VIEW']::text[],
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------- registration & payment
-- Lifecycle: pending (UTR + proof submitted) -> success/confirmed (verified, ticket issued)
--                                             -> failed (rejected; participant may resubmit)
create table registrations (
  id uuid primary key default gen_random_uuid(),
  registration_number text not null unique,
  participant_id uuid not null unique references participant_profiles (id) on delete cascade,
  registration_type text not null check (registration_type in ('iste', 'non-iste')),
  fee int not null check (fee >= 0),
  payment_status text not null default 'pending' check (payment_status in ('pending', 'success', 'failed', 'refunded')),
  registration_status text not null default 'reserved' check (registration_status in ('reserved', 'confirmed', 'cancelled')),
  utr_number text,
  payment_proof_path text,
  payment_submitted_at timestamptz not null default now(),
  rejection_reason text,
  verified_by uuid references app_users (id),
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  constraint confirmed_needs_payment check (registration_status <> 'confirmed' or payment_status = 'success')
);
create unique index registrations_utr_unique on registrations (upper(utr_number)) where utr_number is not null;

create table payments (
  id uuid primary key default gen_random_uuid(),
  registration_id uuid not null references registrations (id) on delete cascade,
  amount int not null,
  status text not null check (status in ('pending', 'success', 'failed', 'refunded')),
  payment_method text not null default 'UPI',
  utr_number text,
  created_at timestamptz not null default now()
);

create table tickets (
  id uuid primary key default gen_random_uuid(),
  registration_id uuid not null unique references registrations (id) on delete cascade,
  ticket_number text not null unique,
  qr_token text not null unique,
  status text not null default 'active' check (status in ('active', 'used', 'cancelled')),
  created_at timestamptz not null default now()
);

create table attendance (
  id uuid primary key default gen_random_uuid(),
  registration_id uuid not null unique references registrations (id) on delete cascade,
  ticket_id uuid references tickets (id),
  checked_in_by uuid references app_users (id),
  checked_in_by_name text not null default '',
  check_in_at timestamptz not null default now(),
  status text not null default 'checked_in' check (status in ('checked_in', 'absent'))
);

-- ---------------------------------------------------------------- content
create table resources (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  resource_type text not null check (resource_type in ('pdf', 'guide', 'code', 'presentation', 'video', 'link')),
  file_url text not null,
  file_size text,
  published boolean not null default true,
  created_by text not null default '',
  created_at timestamptz not null default now()
);

create table announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  priority text not null default 'normal' check (priority in ('normal', 'urgent')),
  category text not null default 'general' check (category in ('general', 'schedule', 'challenge', 'wifi', 'certificate')),
  published boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------- build challenge
create table teams (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) between 2 and 60),
  invite_code text not null unique,
  leader_id uuid not null references participant_profiles (id) on delete cascade,
  created_at timestamptz not null default now()
);

create table team_members (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references teams (id) on delete cascade,
  participant_id uuid not null unique references participant_profiles (id) on delete cascade, -- one team per person
  is_leader boolean not null default false,
  joined_at timestamptz not null default now()
);

create table submissions (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null unique references teams (id) on delete cascade,
  project_name text not null,
  problem_statement text not null default '',
  description text not null default '',
  technologies text[] not null default '{}',
  github_url text,
  demo_url text,
  presentation_url text,
  file_url text,
  status text not null default 'draft' check (status in ('not_started', 'draft', 'submitted', 'under_review', 'evaluated')),
  score_innovation int check (score_innovation between 0 and 25),
  score_ai_prompting int check (score_ai_prompting between 0 and 25),
  score_tech_execution int check (score_tech_execution between 0 and 25),
  score_presentation int check (score_presentation between 0 and 25),
  feedback text,
  evaluated_by uuid references app_users (id),
  submitted_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------- support
create sequence support_ticket_seq;
create table support_tickets (
  id uuid primary key default gen_random_uuid(),
  ticket_code text not null unique default ('SUP-2026-' || lpad(nextval('support_ticket_seq')::text, 3, '0')),
  user_id uuid not null references app_users (id) on delete cascade,
  registration_id uuid references registrations (id) on delete set null,
  category text not null,
  subject text not null,
  message text not null,
  attachment_url text,
  status text not null default 'open' check (status in ('open', 'in_progress', 'resolved', 'closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table support_messages (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references support_tickets (id) on delete cascade,
  sender_id uuid references app_users (id),
  sender_name text not null,
  sender_role text not null,
  message text not null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------- certificates
create table certificates (
  id uuid primary key default gen_random_uuid(),
  certificate_id text not null unique,
  registration_id uuid not null references registrations (id) on delete cascade,
  type text not null check (type in ('participation', 'winner', 'runner_up', 'merit')),
  rank text,
  issue_date timestamptz not null default now(),
  issued_by uuid references app_users (id),
  status text not null default 'issued' check (status in ('issued', 'revoked')),
  unique (registration_id, type)
);

-- ================================================================ rules

-- Seats: pending + confirmed registrations may not exceed capacity; registration must be open.
create or replace function enforce_registration_rules() returns trigger language plpgsql as $$
declare cfg event_config; taken int;
begin
  select * into cfg from event_config where id = 1;
  if tg_op = 'INSERT' then
    if not cfg.registration_open then
      raise exception 'REGISTRATION_CLOSED: Registration is closed.';
    end if;
    select count(*) into taken from registrations
      where registration_status <> 'cancelled' and payment_status <> 'failed';
    if taken >= cfg.capacity then
      raise exception 'SEATS_FULL: All % seats are taken.', cfg.capacity;
    end if;
  end if;
  return new;
end $$;
create trigger registrations_rules before insert on registrations
  for each row execute function enforce_registration_rules();

-- Gate: only confirmed (payment verified) registrations can be checked in.
create or replace function enforce_attendance_rules() returns trigger language plpgsql as $$
declare r registrations;
begin
  select * into r from registrations where id = new.registration_id;
  if r.registration_status <> 'confirmed' or r.payment_status <> 'success' then
    raise exception 'NOT_CONFIRMED: Payment for % has not been verified.', r.registration_number;
  end if;
  return new;
end $$;
create trigger attendance_rules before insert on attendance
  for each row execute function enforce_attendance_rules();

-- Teams: members must be confirmed participants; team size capped.
create or replace function enforce_team_member_rules() returns trigger language plpgsql as $$
declare cfg event_config; n int; ok boolean;
begin
  select * into cfg from event_config where id = 1;
  select exists(
    select 1 from registrations
    where participant_id = new.participant_id and registration_status = 'confirmed' and payment_status = 'success'
  ) into ok;
  if not ok then
    raise exception 'NOT_CONFIRMED: Only participants with a verified registration can join a team.';
  end if;
  select count(*) into n from team_members where team_id = new.team_id;
  if n >= cfg.max_team_size then
    raise exception 'TEAM_FULL: Team is full (max % members).', cfg.max_team_size;
  end if;
  return new;
end $$;
create trigger team_members_rules before insert on team_members
  for each row execute function enforce_team_member_rules();

-- Leaderboard rank of an evaluated submission (1 = best), ties broken by earliest submission.
create or replace function submission_rank(p_team uuid) returns int language sql stable as $$
  select rk from (
    select team_id, rank() over (
      order by (coalesce(score_innovation,0) + coalesce(score_ai_prompting,0)
              + coalesce(score_tech_execution,0) + coalesce(score_presentation,0)) desc,
               submitted_at asc) as rk
    from submissions where status = 'evaluated'
  ) t where team_id = p_team
$$;

-- Certificates: participation = verified payment + checked in + event over.
-- winner / runner_up additionally require the team's evaluated submission to rank 1 / 2.
create or replace function enforce_certificate_rules() returns trigger language plpgsql as $$
declare cfg event_config; r registrations; attended boolean; team uuid; rk int;
begin
  if new.status = 'revoked' then return new; end if;
  select * into cfg from event_config where id = 1;
  select * into r from registrations where id = new.registration_id;
  if r.registration_status <> 'confirmed' or r.payment_status <> 'success' then
    raise exception 'NOT_ELIGIBLE: payment not verified for %.', r.registration_number;
  end if;
  select exists(select 1 from attendance where registration_id = r.id and status = 'checked_in') into attended;
  if not attended then
    raise exception 'NOT_ELIGIBLE: % was not checked in at the event.', r.registration_number;
  end if;
  if now() < cfg.event_end_at then
    raise exception 'NOT_ELIGIBLE: certificates can only be issued after the event ends (%).', cfg.event_end_at;
  end if;
  if new.type in ('winner', 'runner_up') then
    select tm.team_id into team from team_members tm where tm.participant_id = r.participant_id;
    if team is null then
      raise exception 'NOT_ELIGIBLE: % is not in a team.', r.registration_number;
    end if;
    rk := submission_rank(team);
    if rk is null or (new.type = 'winner' and rk <> 1) or (new.type = 'runner_up' and rk <> 2) then
      raise exception 'NOT_ELIGIBLE: team rank % does not qualify for %.', coalesce(rk::text, 'unranked'), new.type;
    end if;
  end if;
  return new;
end $$;
create trigger certificates_rules before insert or update on certificates
  for each row execute function enforce_certificate_rules();

-- Lock everything down: only the service role (server) can touch these tables.
do $$ declare t text;
begin
  for t in select tablename from pg_tables where schemaname = 'public' loop
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on public.%I from anon, authenticated', t);
  end loop;
end $$;
revoke all on function submission_rank(uuid) from anon, authenticated;

-- Private bucket for payment screenshots (served only through signed URLs).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('payment-proofs', 'payment-proofs', false, 5242880, array['image/png', 'image/jpeg', 'image/webp', 'application/pdf'])
on conflict (id) do nothing;
