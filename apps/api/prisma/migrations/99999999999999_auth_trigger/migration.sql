-- This trigger automatically creates a profile entry when a new user signs up via Supabase Auth.
-- See https://supabase.com/docs/guides/auth/managing-user-data#using-triggers for more details.
create function public.handle_new_user()
returns trigger
set search_path = ''
as $$
begin
  insert into public."User" (
    "id", 
    "email", 
    "role", 
    "avatarUrl", 
    "firstName", 
    "lastName" 
    )
  values (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'role', 
    new.raw_user_meta_data->>'avatarUrl', 
    new.raw_user_meta_data->>'firstName',
    new.raw_user_meta_data->>'lastName'
    );
  return new;
end;
$$ language plpgsql security definer;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();