-- Add universities table (replaces categories for courses)
CREATE TABLE IF NOT EXISTS public.universities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  logo_url TEXT,
  country TEXT,
  city TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add university_id to profiles (each student belongs to a university)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS university_id UUID REFERENCES public.universities(id) ON DELETE SET NULL;

-- Add university_id to courses (each course belongs to a university)
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS university_id UUID REFERENCES public.universities(id) ON DELETE CASCADE;

-- Device tracking table for security (max 2 devices per account)
CREATE TABLE IF NOT EXISTS public.user_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  device_name TEXT NOT NULL,
  device_type TEXT NOT NULL CHECK (device_type IN ('web', 'mobile', 'tablet', 'desktop')),
  device_id TEXT NOT NULL,
  user_agent TEXT,
  ip_address TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  last_activity TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, device_id)
);

-- Device sessions for tracking active sessions
CREATE TABLE IF NOT EXISTS public.device_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_device_id UUID NOT NULL REFERENCES public.user_devices(id) ON DELETE CASCADE,
  session_token TEXT NOT NULL UNIQUE,
  login_at TIMESTAMPTZ DEFAULT NOW(),
  logout_at TIMESTAMPTZ,
  last_activity TIMESTAMPTZ DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT,
  is_active BOOLEAN DEFAULT TRUE
);

-- Video access logs table for offline viewing protection
CREATE TABLE IF NOT EXISTS public.video_access_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  access_type TEXT NOT NULL DEFAULT 'stream' CHECK (access_type IN ('stream', 'offline_download', 'view')),
  device_id TEXT NOT NULL,
  encryption_key TEXT,
  download_token TEXT UNIQUE,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Offline video storage (protected content for offline viewing within app)
CREATE TABLE IF NOT EXISTS public.offline_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  original_video_url TEXT NOT NULL,
  encrypted_storage_path TEXT NOT NULL,
  encryption_key TEXT NOT NULL,
  file_size BIGINT,
  is_expired BOOLEAN DEFAULT FALSE,
  device_limit INTEGER DEFAULT 2,
  access_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(lesson_id, user_id)
);

-- Admin device monitoring table
CREATE TABLE IF NOT EXISTS public.device_violations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  violation_type TEXT NOT NULL CHECK (violation_type IN ('too_many_devices', 'suspicious_activity', 'failed_login', 'unusual_location')),
  details JSONB,
  is_resolved BOOLEAN DEFAULT FALSE,
  action_taken TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on new tables
ALTER TABLE public.universities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.device_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_access_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offline_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.device_violations ENABLE ROW LEVEL SECURITY;
