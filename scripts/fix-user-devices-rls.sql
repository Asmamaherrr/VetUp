-- Add RLS policy to allow admins to read all user devices
-- This policy allows users with role='admin' to select all devices from any user

-- First, ensure RLS is enabled on user_devices table
ALTER TABLE user_devices ENABLE ROW LEVEL SECURITY;

-- Policy: Allow admins to read all devices
CREATE POLICY "Allow admins to view all devices" 
ON user_devices 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Policy: Allow users to read their own devices
CREATE POLICY "Users can view their own devices" 
ON user_devices 
FOR SELECT 
USING (auth.uid() = user_id);

-- Policy: Allow users to update their own devices
CREATE POLICY "Users can update their own devices" 
ON user_devices 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Policy: Allow users to insert their own devices
CREATE POLICY "Users can insert their own devices" 
ON user_devices 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Policy: Allow admins to update any device
CREATE POLICY "Allow admins to update any device" 
ON user_devices 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);
