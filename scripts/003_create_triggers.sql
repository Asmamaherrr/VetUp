-- Create trigger to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data ->> 'full_name', new.email),
    COALESCE(new.raw_user_meta_data ->> 'role', 'student')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create trigger to update course duration when lessons change
CREATE OR REPLACE FUNCTION public.update_course_duration()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.courses
  SET duration_hours = (
    SELECT COALESCE(SUM(duration_minutes), 0) / 60.0
    FROM public.lessons
    WHERE course_id = COALESCE(NEW.course_id, OLD.course_id)
  ),
  updated_at = NOW()
  WHERE id = COALESCE(NEW.course_id, OLD.course_id);
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS on_lesson_change ON public.lessons;

CREATE TRIGGER on_lesson_change
  AFTER INSERT OR UPDATE OR DELETE ON public.lessons
  FOR EACH ROW
  EXECUTE FUNCTION public.update_course_duration();

-- Create trigger to update enrollment progress
CREATE OR REPLACE FUNCTION public.update_enrollment_progress()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  total_lessons INTEGER;
  completed_lessons INTEGER;
  new_progress INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_lessons FROM public.lessons WHERE course_id = NEW.course_id;
  SELECT COUNT(*) INTO completed_lessons FROM public.lesson_progress 
    WHERE course_id = NEW.course_id AND user_id = NEW.user_id AND is_completed = true;
  
  IF total_lessons > 0 THEN
    new_progress := (completed_lessons * 100) / total_lessons;
  ELSE
    new_progress := 0;
  END IF;
  
  UPDATE public.enrollments
  SET progress_percentage = new_progress,
      completed_at = CASE WHEN new_progress = 100 THEN NOW() ELSE NULL END
  WHERE user_id = NEW.user_id AND course_id = NEW.course_id;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_lesson_progress_change ON public.lesson_progress;

CREATE TRIGGER on_lesson_progress_change
  AFTER INSERT OR UPDATE ON public.lesson_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.update_enrollment_progress();
