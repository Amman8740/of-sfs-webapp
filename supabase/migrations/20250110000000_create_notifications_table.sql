-- Create notifications table for user notifications
create table if not exists notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users on delete cascade,
  type text not null,
  title text not null,
  message text,
  action_url text,
  related_entity_id uuid,
  related_entity_type text,
  read_at timestamp with time zone,
  is_read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  constraint notifications_type_check check (type in ('info', 'success', 'warning', 'error', 'sfs_request', 'smart_match', 'scheduled_sfs', 'analytics'))
);

-- Enable RLS
alter table notifications enable row level security;

-- Create policy to allow users to view their own notifications
create policy "Users can view their own notifications" on notifications
  for select
  using (auth.uid() = user_id);

-- Create policy to allow authenticated users to insert notifications (for API routes)
create policy "Allow authenticated inserts" on notifications
  for insert
  with check (true);

-- Create policy to allow users to update their own notifications (mark as read)
create policy "Users can update their own notifications" on notifications
  for update
  using (auth.uid() = user_id);

-- Enable realtime for notifications
alter publication supabase_realtime add table notifications;

-- Create index for faster queries
create index idx_notifications_user_id on notifications(user_id);
create index idx_notifications_created_at on notifications(created_at desc);
