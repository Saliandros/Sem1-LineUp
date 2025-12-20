-- Debug script to check if trigger exists and works

-- 1. Check if trigger function exists
SELECT 
    proname as function_name,
    prosrc as function_code
FROM pg_proc 
WHERE proname = 'handle_new_user';

-- 2. Check if trigger exists
SELECT 
    tgname as trigger_name,
    tgenabled as enabled,
    tgrelid::regclass as table_name
FROM pg_trigger 
WHERE tgname = 'on_auth_user_created';

-- 3. Check user count vs profile count
SELECT 
    'Users in auth.users' as table_name,
    COUNT(*) as count
FROM auth.users
UNION ALL
SELECT 
    'Profiles in public.profiles' as table_name,
    COUNT(*) as count
FROM public.profiles;

-- 4. Find users without profiles
SELECT 
    u.id,
    u.email,
    u.created_at
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL;
