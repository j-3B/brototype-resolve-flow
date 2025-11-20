-- Drop the recursive policy that's causing infinite recursion
DROP POLICY IF EXISTS "Enable read access for staff to all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for authenticated users to their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable update for users based on their own id" ON public.profiles;

-- Keep only simple, non-recursive policies
-- These policies exist and are working:
-- 1. "Users can view own profile" - uses auth.uid() = id
-- 2. "Users can update own profile" - uses auth.uid() = id  
-- 3. "Users can insert own profile" - uses auth.uid() = id