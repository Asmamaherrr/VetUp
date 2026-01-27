-- Drop existing tables and policies if they exist
DROP POLICY IF EXISTS user_devices_select_own ON user_devices;
DROP POLICY IF EXISTS user_devices_update_own ON user_devices;
DROP POLICY IF EXISTS user_devices_insert_own ON user_devices;
DROP POLICY IF EXISTS user_devices_admin_all ON user_devices;
DROP POLICY IF EXISTS user_devices_admin_select ON user_devices;
DROP POLICY IF EXISTS device_sessions_select_own ON device_sessions;
DROP POLICY IF EXISTS device_sessions_insert_own ON device_sessions;
DROP POLICY IF EXISTS device_sessions_admin_all ON device_sessions;
DROP POLICY IF EXISTS device_violations_select_own ON device_violations;
DROP POLICY IF EXISTS device_violations_admin_all ON device_violations;

DROP TABLE IF EXISTS device_sessions;
DROP TABLE IF EXISTS device_violations;
DROP TABLE IF EXISTS user_devices;

-- Create user_devices table
CREATE TABLE user_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  device_name TEXT NOT NULL,
  device_type TEXT NOT NULL CHECK (device_type IN ('mobile', 'tablet', 'laptop', 'other')),
  ip_address TEXT,
  user_agent TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, device_name)
);

-- Create device_sessions table
CREATE TABLE device_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  device_id UUID NOT NULL REFERENCES user_devices(id) ON DELETE CASCADE,
  session_token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  logged_out_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create device_violations table
CREATE TABLE device_violations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  violation_type TEXT NOT NULL CHECK (violation_type IN ('max_devices_exceeded', 'suspicious_login', 'unusual_location', 'other')),
  details JSONB,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'ignored')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes
CREATE INDEX idx_user_devices_user_id ON user_devices(user_id);
CREATE INDEX idx_user_devices_is_active ON user_devices(is_active);
CREATE INDEX idx_device_sessions_user_id ON device_sessions(user_id);
CREATE INDEX idx_device_sessions_device_id ON device_sessions(device_id);
CREATE INDEX idx_device_violations_user_id ON device_violations(user_id);
CREATE INDEX idx_device_violations_status ON device_violations(status);

-- Enable RLS
ALTER TABLE user_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_violations ENABLE ROW LEVEL SECURITY;

-- User policies for user_devices - can view and manage their own devices
CREATE POLICY user_devices_select_own
  ON user_devices FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY user_devices_insert_own
  ON user_devices FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY user_devices_update_own
  ON user_devices FOR UPDATE
  USING (auth.uid() = user_id);

-- Admin policy for user_devices - admins can see all
CREATE POLICY user_devices_admin_select
  ON user_devices FOR SELECT
  USING (true);

CREATE POLICY user_devices_admin_all
  ON user_devices FOR ALL
  USING (true)
  WITH CHECK (true);

-- Device sessions policies
CREATE POLICY device_sessions_select_own
  ON device_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY device_sessions_insert_own
  ON device_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY device_sessions_admin_all
  ON device_sessions FOR ALL
  USING (true)
  WITH CHECK (true);

-- Device violations policies
CREATE POLICY device_violations_select_own
  ON device_violations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY device_violations_admin_all
  ON device_violations FOR ALL
  USING (true)
  WITH CHECK (true);
