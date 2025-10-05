# 🔒 Row Level Security (RLS) Fix Guide

## 🚨 **URGENT: Security Vulnerability Detected**

**Issue**: RLS (Row Level Security) is disabled on `public.contacts` table and potentially other tables.
**Risk**: Unauthorized access to all contact data.
**Action Required**: Enable RLS immediately.

## 🛠️ **Step-by-Step Fix**

### Option 1: Quick Fix via Supabase Dashboard (Recommended)

1. **Open Supabase SQL Editor**:
   - Go to: https://app.supabase.com/project/llwasxekjvvezufpyolq
   - Navigate to: **SQL Editor**

2. **Run the Security Migration**:
   ```sql
   -- Enable RLS on all tables
   ALTER TABLE public.appliances ENABLE ROW LEVEL SECURITY;
   ALTER TABLE public.maintenance_tasks ENABLE ROW LEVEL SECURITY;
   ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

   -- Create permissive policies (single-user app)
   CREATE POLICY "Enable all for authenticated users" ON public.appliances
       FOR ALL USING (true) WITH CHECK (true);

   CREATE POLICY "Enable all for authenticated users" ON public.maintenance_tasks
       FOR ALL USING (true) WITH CHECK (true);

   CREATE POLICY "Enable all for authenticated users" ON public.contacts
       FOR ALL USING (true) WITH CHECK (true);
   ```

3. **Click "Run"** to execute the SQL

### Option 2: Using Migration File

1. **Copy the migration file content**:
   - File: `backend/src/db/migrations/0001_enable_rls_security.sql`

2. **Run in Supabase SQL Editor**:
   - Paste the entire content and execute

### Option 3: Command Line (Advanced)

```bash
# Connect to your Supabase database
psql "postgresql://postgres.llwasxekjvvezufpyolq:Srinithija02@aws-0-ap-south-1.pooler.supabase.com:5432/postgres?sslmode=require"

# Run the migration
\i backend/src/db/migrations/0001_enable_rls_security.sql
```

## ✅ **Verification Steps**

### 1. Check RLS Status
Run this query in SQL Editor:
```sql
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN ('appliances', 'maintenance_tasks', 'contacts');
```

**Expected Result**: All tables should show `rls_enabled = true`

### 2. Check Policies
```sql
SELECT 
    tablename,
    policyname,
    cmd
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename;
```

**Expected Result**: Each table should have at least one policy

### 3. Test Application
```bash
# Test your API endpoints
curl https://homebase-gear-guard.onrender.com/health/database
curl https://homebase-gear-guard.onrender.com/api/contacts
```

**Expected Result**: Application should work normally

## 🔧 **What the Fix Does**

### Current State (INSECURE):
```
Table: public.contacts
RLS: ❌ DISABLED
Access: 🚨 PUBLIC (anyone can read/write)
```

### After Fix (SECURE):
```
Table: public.contacts  
RLS: ✅ ENABLED
Access: 🔒 POLICY-CONTROLLED
Policy: "Enable all for authenticated users"
```

## 🛡️ **Security Policies Explained**

### Current Policy (Permissive):
```sql
CREATE POLICY "Enable all for authenticated users" ON public.contacts
    FOR ALL USING (true) WITH CHECK (true);
```
- **Effect**: Allows all operations for any authenticated user
- **Use Case**: Single-user application
- **Security Level**: Medium (requires authentication)

### Future Policy (Restrictive - Optional):
```sql
-- Add user_id column to tables first
ALTER TABLE public.contacts ADD COLUMN user_id UUID REFERENCES auth.users(id);

-- Create user-specific policy
CREATE POLICY "Users see only their contacts" ON public.contacts
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
```
- **Effect**: Users can only access their own data
- **Use Case**: Multi-user application
- **Security Level**: High (user isolation)

## 🚨 **Critical Actions After Applying Fix**

1. **✅ Immediate**: Run the SQL migration
2. **✅ Test**: Verify application functionality
3. **✅ Monitor**: Check for any access errors
4. **📋 Plan**: Consider adding user authentication for better security

## 🔄 **Rollback Plan (Emergency Only)**

If the application breaks after enabling RLS:

```sql
-- EMERGENCY: Temporarily disable RLS (NOT recommended for production)
ALTER TABLE public.contacts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.appliances DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_tasks DISABLE ROW LEVEL SECURITY;
```

**⚠️ WARNING**: Only use rollback in emergency. Fix the policies instead.

## 📚 **Additional Resources**

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL RLS Guide](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Security Best Practices](https://supabase.com/docs/guides/auth/security)

## 🎯 **Next Steps for Enhanced Security**

1. **Add User Authentication**:
   - Implement Supabase Auth
   - Add user_id columns to tables
   - Create user-specific policies

2. **Implement API Keys**:
   - Add API key authentication
   - Create service role policies

3. **Audit Logging**:
   - Enable Supabase audit logs
   - Monitor data access patterns

---

**🔐 Security is critical - apply this fix immediately to protect your data!**