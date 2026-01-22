-- Migrate existing data to support universities and security features
-- This script handles existing student records

-- Insert a default university
INSERT INTO universities (name, slug, description, country, city)
VALUES ('Default University', 'default-university', 'Default university for migrating existing courses', 'Global', 'Global')
ON CONFLICT (name) DO NOTHING;

-- Get the ID of the default university
DO $$
DECLARE
  default_uni_id UUID;
BEGIN
  SELECT id INTO default_uni_id FROM universities WHERE slug = 'default-university' LIMIT 1;
  
  -- Update existing student profiles without a university
  UPDATE profiles 
  SET university_id = default_uni_id 
  WHERE role = 'student' AND university_id IS NULL;
  
  -- Update existing instructor profiles to have the default university
  UPDATE profiles 
  SET university_id = default_uni_id 
  WHERE role = 'instructor' AND university_id IS NULL;
  
  -- Update existing courses without a university
  UPDATE courses 
  SET university_id = default_uni_id 
  WHERE university_id IS NULL;
END $$;

-- Verify all migrations completed
SELECT COUNT(*) as students_with_university FROM profiles WHERE role = 'student' AND university_id IS NOT NULL;
SELECT COUNT(*) as courses_with_university FROM courses WHERE university_id IS NOT NULL;
