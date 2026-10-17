Attempting to perform the InitializeDefaultDrives operation on the 'FileSystem' provider failed.
-- Forma private account data and recipe photographs.
-- Apply with: supabase db push (or run this file in the Supabase SQL editor).

create table if not exists public.forma_user_data (
  user_id uuid primary key references auth.users (id) on delete cascade,
  payload jsonb not null default '{}'::jsonb check (jsonb_typeof(payload) = 'object'),
  updated_at timestamptz not null default now()
);

alter table public.forma_user_data enable row level security;
grant select, insert, update on public.forma_user_data to authenticated;

drop policy if exists "Users can read their Forma data" on public.forma_user_data;
create policy "Users can read their Forma data"
  on public.forma_user_data for select to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their Forma data" on public.forma_user_data;
create policy "Users can insert their Forma data"
  on public.forma_user_data for insert to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their Forma data" on public.forma_user_data;
create policy "Users can update their Forma data"
  on public.forma_user_data for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('recipe-photos', 'recipe-photos', false, 10485760, array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'])
on conflict (id) do update set public = false, file_size_limit = 10485760,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];

drop policy if exists "Users can view their Forma recipe photos" on storage.objects;
create policy "Users can view their Forma recipe photos"
  on storage.objects for select to authenticated
  using (bucket_id = 'recipe-photos' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Users can upload their Forma recipe photos" on storage.objects;
create policy "Users can upload their Forma recipe photos"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'recipe-photos' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Users can update their Forma recipe photos" on storage.objects;
create policy "Users can update their Forma recipe photos"
  on storage.objects for update to authenticated
  using (bucket_id = 'recipe-photos' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'recipe-photos' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Users can delete their Forma recipe photos" on storage.objects;
create policy "Users can delete their Forma recipe photos"
  on storage.objects for delete to authenticated
  using (bucket_id = 'recipe-photos' and (storage.foldername(name))[1] = auth.uid()::text);
