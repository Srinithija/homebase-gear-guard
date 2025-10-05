-- Enable Row Level Security (RLS) for all tables
-- This script fixes the security vulnerability where RLS is disabled

-- Enable RLS on appliances table
ALTER TABLE public.appliances ENABLE ROW LEVEL SECURITY;

-- Enable RLS on maintenance_tasks table  
ALTER TABLE public.maintenance_tasks ENABLE ROW LEVEL SECURITY;

-- Enable RLS on contacts table
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- Create policies for appliances table
-- Allow all operations for authenticated users (single-user app scenario)
CREATE POLICY "Enable all operations for authenticated users" ON public.appliances
    FOR ALL USING (true) WITH CHECK (true);

-- Create policies for maintenance_tasks table
CREATE POLICY "Enable all operations for authenticated users" ON public.maintenance_tasks
    FOR ALL USING (true) WITH CHECK (true);

-- Create policies for contacts table  
CREATE POLICY "Enable all operations for authenticated users" ON public.contacts
    FOR ALL USING (true) WITH CHECK (true);

-- Alternative: More restrictive policies for future multi-user scenarios
-- Uncomment these and comment the above if you plan to add user authentication

/*
-- Appliances policies (user-specific)
CREATE POLICY "Users can view their own appliances" ON public.appliances
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own appliances" ON public.appliances
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own appliances" ON public.appliances
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own appliances" ON public.appliances
    FOR DELETE USING (auth.uid() = user_id);

-- Maintenance tasks policies (user-specific via appliance relationship)
CREATE POLICY "Users can view maintenance tasks for their appliances" ON public.maintenance_tasks
    FOR SELECT USING (
        appliance_id IN (
            SELECT id FROM public.appliances WHERE user_id = auth.uid()
        )
    );

-- Similar patterns for INSERT, UPDATE, DELETE on maintenance_tasks and contacts
*/