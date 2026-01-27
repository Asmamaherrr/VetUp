-- Add university_id column to courses table
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS university_id UUID REFERENCES public.universities(id) ON DELETE SET NULL;
