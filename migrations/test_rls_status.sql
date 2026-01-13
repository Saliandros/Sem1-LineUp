-- Test script to check RLS status
-- Run this in Supabase SQL Editor to debug

-- 1. Check if RLS is enabled on tables
SELECT 
    schemaname,
    tablename, 
    CASE 
        WHEN rowsecurity THEN 'ENABLED'
        ELSE 'DISABLED'
    END as rls_status
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- 2. List all active policies
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd as operation,
    qual as using_expression
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 3. Test if you can read profiles table (run as authenticated user)
SELECT COUNT(*) as profile_count FROM public.profiles;
