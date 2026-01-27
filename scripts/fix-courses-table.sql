-- Add university_id column to courses table if it doesn't exist
ALTER TABLE courses ADD COLUMN IF NOT EXISTS university_id UUID REFERENCES public.universities(id) ON DELETE SET NULL;

-- Update the level check constraint to accept academic years
ALTER TABLE courses DROP CONSTRAINT IF EXISTS courses_level_check;
ALTER TABLE courses ADD CONSTRAINT courses_level_check CHECK (level IN ('1st', '2nd', '3rd', '4th', '5th'));
