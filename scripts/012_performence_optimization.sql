-- Performance Optimization Script
-- Add indexes for faster queries on commonly filtered columns

-- Index on courses for published and instructor queries
CREATE INDEX IF NOT EXISTS idx_courses_is_published 
ON courses(is_published DESC);

CREATE INDEX IF NOT EXISTS idx_courses_instructor_id 
ON courses(instructor_id);

CREATE INDEX IF NOT EXISTS idx_courses_category_id 
ON courses(category_id);

-- Index on enrollments for student and course queries
CREATE INDEX IF NOT EXISTS idx_enrollments_user_id 
ON enrollments(user_id);

CREATE INDEX IF NOT EXISTS idx_enrollments_course_id 
ON enrollments(course_id);

CREATE INDEX IF NOT EXISTS idx_enrollments_course_user 
ON enrollments(course_id, user_id);

-- Index on lessons for course queries
CREATE INDEX IF NOT EXISTS idx_lessons_course_id 
ON lessons(course_id);

CREATE INDEX IF NOT EXISTS idx_lessons_position 
ON lessons(course_id, position);

-- Index on reviews for course and user queries
CREATE INDEX IF NOT EXISTS idx_reviews_course_id 
ON reviews(course_id);

CREATE INDEX IF NOT EXISTS idx_reviews_user_id 
ON reviews(user_id);

-- Index on lesson_progress for tracking
CREATE INDEX IF NOT EXISTS idx_lesson_progress_user_course 
ON lesson_progress(user_id, course_id);

CREATE INDEX IF NOT EXISTS idx_lesson_progress_user_id 
ON lesson_progress(user_id);

-- Index on profiles for role-based queries
CREATE INDEX IF NOT EXISTS idx_profiles_role 
ON profiles(role);

-- Index on payments
CREATE INDEX IF NOT EXISTS idx_payments_user_id 
ON payments(user_id);

CREATE INDEX IF NOT EXISTS idx_payments_course_id 
ON payments(course_id);

CREATE INDEX IF NOT EXISTS idx_payments_status 
ON payments(status);

-- Index on certificates
CREATE INDEX IF NOT EXISTS idx_certificates_user_id 
ON certificates(user_id);

CREATE INDEX IF NOT EXISTS idx_certificates_course_id 
ON certificates(course_id);

-- Analyze tables for query optimization
ANALYZE courses;
ANALYZE enrollments;
ANALYZE lessons;
ANALYZE reviews;
ANALYZE profiles;
ANALYZE lesson_progress;
ANALYZE payments;
ANALYZE certificates;
