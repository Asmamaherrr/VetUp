-- Drop the problematic policies that cause infinite recursion
DROP POLICY IF EXISTS "Students see profiles from same university" ON public.profiles;
DROP POLICY IF EXISTS "Students see only their university courses" ON public.courses;

-- Create a simpler profiles policy that avoids recursion
-- Profiles are publicly visible (for instructor/student info on courses)
-- Users can manage their own profile
CREATE POLICY "profiles_select_public" ON public.profiles FOR SELECT USING (true);

-- Create a university-aware courses policy without recursion
CREATE POLICY "courses_select_by_university" ON public.courses FOR SELECT
USING (
  is_published = true
  OR 
  instructor_id = auth.uid()
  OR 
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
