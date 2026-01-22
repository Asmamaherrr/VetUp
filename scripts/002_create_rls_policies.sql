-- Profiles policies
CREATE POLICY "profiles_select_all" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_delete_own" ON public.profiles FOR DELETE USING (auth.uid() = id);

-- Categories policies (public read, admin write)
CREATE POLICY "categories_select_all" ON public.categories FOR SELECT USING (true);
CREATE POLICY "categories_insert_admin" ON public.categories FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "categories_update_admin" ON public.categories FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "categories_delete_admin" ON public.categories FOR DELETE 
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Courses policies (public read for published, instructor/admin can manage)
CREATE POLICY "courses_select_published" ON public.courses FOR SELECT 
  USING (is_published = true OR instructor_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "courses_insert_instructor" ON public.courses FOR INSERT 
  WITH CHECK (instructor_id = auth.uid() AND 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('instructor', 'admin')));
CREATE POLICY "courses_update_instructor" ON public.courses FOR UPDATE 
  USING (instructor_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "courses_delete_instructor" ON public.courses FOR DELETE 
  USING (instructor_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Lessons policies
CREATE POLICY "lessons_select_enrolled_or_preview" ON public.lessons FOR SELECT 
  USING (
    is_free_preview = true OR
    EXISTS (SELECT 1 FROM public.enrollments WHERE user_id = auth.uid() AND course_id = lessons.course_id) OR
    EXISTS (SELECT 1 FROM public.courses WHERE id = lessons.course_id AND instructor_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
CREATE POLICY "lessons_insert_instructor" ON public.lessons FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM public.courses WHERE id = course_id AND instructor_id = auth.uid()));
CREATE POLICY "lessons_update_instructor" ON public.lessons FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM public.courses WHERE id = course_id AND instructor_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "lessons_delete_instructor" ON public.lessons FOR DELETE 
  USING (EXISTS (SELECT 1 FROM public.courses WHERE id = course_id AND instructor_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Enrollments policies
CREATE POLICY "enrollments_select_own" ON public.enrollments FOR SELECT 
  USING (user_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM public.courses WHERE id = course_id AND instructor_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "enrollments_insert_own" ON public.enrollments FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "enrollments_update_own" ON public.enrollments FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "enrollments_delete_admin" ON public.enrollments FOR DELETE 
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Lesson progress policies
CREATE POLICY "lesson_progress_select_own" ON public.lesson_progress FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "lesson_progress_insert_own" ON public.lesson_progress FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "lesson_progress_update_own" ON public.lesson_progress FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "lesson_progress_delete_own" ON public.lesson_progress FOR DELETE USING (user_id = auth.uid());

-- Certificates policies
CREATE POLICY "certificates_select_own" ON public.certificates FOR SELECT 
  USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "certificates_insert_system" ON public.certificates FOR INSERT 
  WITH CHECK (user_id = auth.uid());

-- Payments policies
CREATE POLICY "payments_select_own" ON public.payments FOR SELECT 
  USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "payments_insert_own" ON public.payments FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "payments_update_admin" ON public.payments FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Reviews policies
CREATE POLICY "reviews_select_all" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "reviews_insert_enrolled" ON public.reviews FOR INSERT 
  WITH CHECK (user_id = auth.uid() AND 
    EXISTS (SELECT 1 FROM public.enrollments WHERE user_id = auth.uid() AND course_id = reviews.course_id));
CREATE POLICY "reviews_update_own" ON public.reviews FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "reviews_delete_own" ON public.reviews FOR DELETE USING (user_id = auth.uid());
