-- Universities RLS (public read)
CREATE POLICY "Universities are viewable by all"
ON public.universities FOR SELECT
USING (true);

-- User Devices RLS
CREATE POLICY "Users can view own devices"
ON public.user_devices FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own devices"
ON public.user_devices FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own devices"
ON public.user_devices FOR UPDATE
USING (auth.uid() = user_id);

-- Device Sessions RLS
CREATE POLICY "Users can view own device sessions"
ON public.device_sessions FOR SELECT
USING (
  auth.uid() IN (
    SELECT user_id FROM public.user_devices WHERE id = user_device_id
  )
);

CREATE POLICY "System can create device sessions"
ON public.device_sessions FOR INSERT
WITH CHECK (true);

-- Video Access Logs RLS
CREATE POLICY "Users can view own video access logs"
ON public.video_access_logs FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create video access logs"
ON public.video_access_logs FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Offline Videos RLS
CREATE POLICY "Users can view own offline videos"
ON public.offline_videos FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create offline videos"
ON public.offline_videos FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Device Violations RLS (admin only)
CREATE POLICY "Admins can view all device violations"
ON public.device_violations FOR SELECT
USING (
  auth.uid() IN (
    SELECT id FROM public.profiles WHERE role = 'admin'
  )
);

CREATE POLICY "System can insert device violations"
ON public.device_violations FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can update device violations"
ON public.device_violations FOR UPDATE
USING (
  auth.uid() IN (
    SELECT id FROM public.profiles WHERE role = 'admin'
  )
);

-- Update courses table RLS to include university_id filtering
CREATE POLICY "Students see only their university courses"
ON public.courses FOR SELECT
USING (
  is_published = true
  OR 
  auth.uid() IN (
    SELECT id FROM public.profiles 
    WHERE role = 'admin' 
    OR (role = 'instructor' AND id = courses.instructor_id)
  )
  OR
  (
    auth.uid() IN (
      SELECT id FROM public.profiles WHERE university_id = courses.university_id
    )
  )
);

-- Add profiles university constraint
CREATE POLICY "Students see profiles from same university"
ON public.profiles FOR SELECT
USING (
  auth.uid() = id
  OR
  role = 'public'
  OR
  (
    auth.uid() IN (
      SELECT id FROM public.profiles WHERE university_id = profiles.university_id
    )
  )
);

ALTER TABLE public.profiles ADD CONSTRAINT university_required_for_students
CHECK (
  role != 'student' OR university_id IS NOT NULL
);
