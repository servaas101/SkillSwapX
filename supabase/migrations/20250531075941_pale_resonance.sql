-- Database schema for SkillSwapX

-- Profiles table
create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  uid uuid not null references auth.users(id) on delete cascade,
  em text, -- email
  fn text, -- first name
  ln text, -- last name
  bio text, -- bio
  img text, -- profile image url
  ph text, -- phone
  loc text, -- location
  cdt timestamp with time zone default now(), -- created date
  udt timestamp with time zone default now(), -- updated date
  set jsonb, -- settings
  gdp boolean default false, -- gdpr consent
  gdl timestamp with time zone, -- gdpr consent date

  unique(uid)
);

-- RLS policies for profiles
alter table public.profiles enable row level security;

-- Allow users to view and update only their own profile
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = uid);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = uid);

-- Consent logs table for GDPR compliance
create table public.consent_logs (
  id uuid primary key default gen_random_uuid(),
  uid uuid not null references auth.users(id) on delete cascade,
  typ text not null, -- type of consent/action
  dat jsonb not null, -- data about the consent
  ts timestamp with time zone default now(),
  ip text
);

-- RLS policies for consent logs
alter table public.consent_logs enable row level security;

-- Users can only view their own consent logs
create policy "Users can view own consent logs"
  on public.consent_logs for select
  using (auth.uid() = uid);

-- Only system can insert consent logs
create policy "System can insert consent logs"
  on public.consent_logs for insert
  with check (true); -- Will be controlled via functions with security definer

-- Create function to get a user's profile
create or replace function public.get_profile(p_uid uuid)
returns setof public.profiles
security definer
language sql
as $$
  select * from public.profiles where uid = p_uid
$$;

-- Create function to log consent actions
create or replace function public.log_consent(p_uid uuid, p_typ text, p_dat jsonb, p_ip text)
returns uuid
security definer
language plpgsql
as $$
declare
  v_id uuid;
begin
  insert into public.consent_logs(uid, typ, dat, ip)
  values (p_uid, p_typ, p_dat, p_ip)
  returning id into v_id;
  
  return v_id;
end;
$$;

-- Create function to delete user data (GDPR right to be forgotten)
create or replace function public.delete_user_data(p_uid uuid)
returns boolean
security definer
language plpgsql
as $$
begin
  -- Mark profile as deleted (in a real implementation, 
  -- you might anonymize data instead of deleting it)
  update public.profiles
  set fn = null,
      ln = null,
      bio = null,
      img = null,
      ph = null,
      loc = null,
      set = null,
      gdp = false
  where uid = p_uid;
  
  -- Keep consent logs for compliance
  -- but could anonymize personal data if needed
  
  return true;
end;
$$;

-- Trigger to update the 'udt' column on profiles
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.udt = now();
  return new;
end;
$$;

create trigger on_profile_update
  before update on public.profiles
  for each row
  execute procedure public.handle_updated_at();

-- Set up profile creation on user registration
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.profiles (uid, em, cdt, udt)
  values (new.id, new.email, now(), now());
  return new;
end;
$$;

-- Trigger for new user registration
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();