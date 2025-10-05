-- Migration: Enable Row Level Security (RLS)
-- Created: 2025-10-05
-- Purpose: Fix security vulnerability - enable RLS on all public tables

-- ===============================================
-- ENABLE ROW LEVEL SECURITY
-- ===============================================

-- Enable RLS on all public tables
ALTER TABLE public.appliances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- ===============================================
-- CREATE SECURITY POLICIES
-- ===============================================

-- APPLIANCES TABLE POLICIES
-- Allow all operations for now (single-user app)
-- Can be made more restrictive later when user auth is added

DROP POLICY IF EXISTS "appliances_policy_all" ON public.appliances;
CREATE POLICY "appliances_policy_all" ON public.appliances
    FOR ALL 
    USING (true) 
    WITH CHECK (true);

-- MAINTENANCE TASKS TABLE POLICIES
DROP POLICY IF EXISTS "maintenance_tasks_policy_all" ON public.maintenance_tasks;
CREATE POLICY "maintenance_tasks_policy_all" ON public.maintenance_tasks
    FOR ALL 
    USING (true) 
    WITH CHECK (true);

-- CONTACTS TABLE POLICIES
DROP POLICY IF EXISTS "contacts_policy_all" ON public.contacts;
CREATE POLICY "contacts_policy_all" ON public.contacts
    FOR ALL 
    USING (true) 
    WITH CHECK (true);

-- ===============================================
-- GRANT NECESSARY PERMISSIONS
-- ===============================================

-- Grant usage on schema to authenticated role
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;

-- Grant table permissions
GRANT ALL ON public.appliances TO authenticated;
GRANT ALL ON public.maintenance_tasks TO authenticated;
GRANT ALL ON public.contacts TO authenticated;

-- Grant sequence permissions for UUID generation
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ===============================================
-- VERIFY RLS IS ENABLED
-- ===============================================

-- Check RLS status (for verification)
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    hasexts as force_rls
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN ('appliances', 'maintenance_tasks', 'contacts');

-- List all policies (for verification)
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public'
    AND tablename IN ('appliances', 'maintenance_tasks', 'contacts')
ORDER BY tablename, policyname;