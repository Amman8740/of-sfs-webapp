/**
* ONLYFANS_PROFILES
* Note: This table stores scraped OnlyFans profile data from the browser extension.
* Users can only view and update their own profile data.
*/

create table if not exists onlyfans_profiles (
  -- Auto-generated UUID for the profile
  id uuid default gen_random_uuid() primary key,
  -- Reference to the user who owns this profile data
  user_id uuid references auth.users not null,
  -- OnlyFans username (unique per user)
  username text not null,
  -- Display name from profile
  display_name text,
  -- Full OnlyFans profile URL
  onlyfans_url text not null,
  
  -- Profile statistics
  fans integer default 0,
  posts integer default 0,
  media integer default 0,
  photos integer default 0,
  videos integer default 0,
  likes integer default 0,
  
  -- Subscription information
  subscription_type text default 'Unknown',
  price decimal(10, 2) default 0,
  
  -- Profile details
  bio text,
  location text,
  website text,
  profile_image_url text,
  cover_image_url text,
  is_verified boolean default false,
  joined_date text,
  last_seen text,
  
  -- Social media links stored as JSON
  social_links jsonb default '{}'::jsonb,
  
  -- Metadata
  last_updated timestamp with time zone default timezone('utc'::text, now()) not null,
  scraped_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  -- Unique constraint: one username per user
  unique(username, user_id)
);

-- Create index on user_id for faster queries
create index if not exists onlyfans_profiles_user_id_idx on onlyfans_profiles(user_id);

-- Create index on username for faster lookups
create index if not exists onlyfans_profiles_username_idx on onlyfans_profiles(username);

-- Enable Row Level Security
alter table onlyfans_profiles enable row level security;

-- Policy: Users can view their own profiles
create policy "Users can view own profiles" 
  on onlyfans_profiles 
  for select 
  using (auth.uid() = user_id);

-- Policy: Allow public read access to all profiles (needed for Smart Match feature)
create policy "Public read access to all profiles" 
  on onlyfans_profiles 
  for select 
  using (true);

-- Policy: Users can insert their own profiles
create policy "Users can insert own profiles" 
  on onlyfans_profiles 
  for insert 
  with check (auth.uid() = user_id);

-- Policy: Users can update their own profiles
create policy "Users can update own profiles" 
  on onlyfans_profiles 
  for update 
  using (auth.uid() = user_id);

-- Policy: Users can delete their own profiles
create policy "Users can delete own profiles" 
  on onlyfans_profiles 
  for delete 
  using (auth.uid() = user_id);

-- Create function to update updated_at timestamp
create or replace function update_onlyfans_profiles_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Create trigger to automatically update updated_at
create trigger onlyfans_profiles_updated_at
  before update on onlyfans_profiles
  for each row
  execute procedure update_onlyfans_profiles_updated_at();

-- Add comment to table
comment on table onlyfans_profiles is 'Stores OnlyFans profile data scraped by the browser extension';

