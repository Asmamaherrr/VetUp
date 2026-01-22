-- Insert sample categories
INSERT INTO public.categories (name, slug, description, icon) VALUES
  ('Web Development', 'web-development', 'Learn modern web development technologies', 'code'),
  ('Mobile Development', 'mobile-development', 'Build native and cross-platform mobile apps', 'smartphone'),
  ('Data Science', 'data-science', 'Master data analysis and machine learning', 'bar-chart'),
  ('Design', 'design', 'UI/UX design and graphic design courses', 'palette'),
  ('Business', 'business', 'Entrepreneurship and business skills', 'briefcase'),
  ('Marketing', 'marketing', 'Digital marketing and growth strategies', 'trending-up')
ON CONFLICT (slug) DO NOTHING;
