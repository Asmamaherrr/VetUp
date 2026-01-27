export interface University {
  id: string
  name: string
  slug: string
  description: string | null
  city: string | null
  country: string | null
  logo_url: string | null
  created_at: string
  updated_at: string
}

export interface Profile {
  id: string
  email?: string
  full_name: string | null
  avatar_url: string | null
  role: "student" | "instructor" | "admin"
  bio: string | null
  phone: string | null
  university_id: string | null
  created_at: string
  updated_at: string
  university?: University
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string | null
  created_at: string
}

export interface Course {
  total_duration: number
  id: string
  title: string
  slug: string
  description: string | null
  short_description: string | null
  thumbnail_url: string | null
  preview_video_url: string | null
  price: number
  original_price: number | null
  instructor_id: string
  category_id: string | null
  university_id: string 
  level: "1st" | "2nd" | "3rd" | "4th" | "5th"
  language: string
  duration_hours: number
  is_published: boolean
  is_featured: boolean
  created_at: string
  updated_at: string
  instructor?: Profile
  category?: Category
  university?: University
  enrollment_count?: number
  average_rating?: number
}

export interface Lesson {
  id: string
  course_id: string
  title: string
  description: string | null
  content_type: "video" | "text" | "quiz" | "resource" | "pdf"
  video_url: string | null
  text_content: string | null
  resource_url: string | null
  duration_minutes: number
  position: number
  is_free_preview: boolean
  created_at: string
  updated_at: string
}

export interface Enrollment {
  id: string
  user_id: string
  course_id: string
  progress_percentage: number
  completed_at: string | null
  enrolled_at: string
  course?: Course
}

export interface LessonProgress {
  id: string
  user_id: string
  lesson_id: string
  course_id: string
  is_completed: boolean
  progress_seconds: number
  completed_at: string | null
  last_watched_at: string
}

export interface Certificate {
  id: string
  user_id: string
  course_id: string
  certificate_number: string
  issued_at: string
  course?: Course
}

export interface Payment {
  id: string
  user_id: string
  course_id: string
  amount: number
  payment_method: "vodafone_cash" | "instapay" | "card"
  payment_reference: string | null
  phone_number: string | null
  status: "pending" | "processing" | "completed" | "failed" | "refunded"
  transaction_id: string | null
  notes: string | null
  created_at: string
  updated_at: string
  user?: Profile
  course?: Course
}

export interface Review {
  id: string
  user_id: string
  course_id: string
  rating: number
  comment: string | null
  created_at: string
  updated_at: string
  user?: Profile
}

export interface UserDevice {
  id: string
  user_id: string
  device_name: string
  device_type: "web" | "mobile" | "tablet" | "desktop"
  device_id: string
  user_agent: string
  ip_address: string
  is_active: boolean
  last_activity: string
  created_at: string
  updated_at: string
}

export interface DeviceSession {
  id: string
  user_id: string
  device_id: string
  session_token: string
  expires_at: string
  logged_out_at: string | null
  created_at: string
}

export interface Wishlist {
  id: string
  user_id: string
  course_id: string
  created_at: string
  course?: Course
}

export interface Quiz {
  id: string
  lesson_id: string
  title: string
  description: string | null
  pass_score: number
  attempts_allowed: number
  created_at: string
  updated_at: string
}

export interface QuizQuestion {
  id: string
  quiz_id: string
  question_text: string
  question_type: "multiple_choice" | "true_false" | "short_answer"
  options: string[] | null
  correct_answer: string
  position: number
  created_at: string
}

export interface QuizAttempt {
  id: string
  user_id: string
  quiz_id: string
  score: number
  passed: boolean
  attempted_at: string
  completed_at: string | null
}

export interface Coupon {
  id: string
  code: string
  discount_percentage: number
  max_uses: number
  current_uses: number
  valid_from: string
  valid_until: string
  is_active: boolean
  created_at: string
}

export interface CouponRedemption {
  id: string
  user_id: string
  coupon_id: string
  course_id: string
  redeemed_at: string
}

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: "enrollment" | "completion" | "message" | "update" | "warning"
  read: boolean
  data: Record<string, unknown> | null
  created_at: string
}

export interface OfflineVideo {
  id: string
  user_id: string
  lesson_id: string
  video_data: string
  downloaded_at: string
  expires_at: string
  file_size: number
}

export interface DeviceViolation {
  id: string
  user_id: string
  violation_type: "max_devices_exceeded" | "suspicious_location" | "concurrent_sessions"
  details: Record<string, unknown> | null
  status: "active" | "resolved" | "ignored"
  created_at: string
}
