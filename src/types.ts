export type UserRole = 'admin' | 'student';

export interface User {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  role: UserRole;
  created_at: string;
}

export interface Exam {
  id: string;
  code: string;
  title_en: string;
  title_mr: string;
  description_en: string;
  description_mr: string;
  is_active: boolean;
}

export interface Subject {
  id: string;
  exam_id: string;
  code: string;
  name_en: string;
  name_mr: string;
  description_en?: string;
  description_mr?: string;
}

export interface Topic {
  id: string;
  subject_id: string;
  name_en: string;
  name_mr: string;
}

export interface QuestionOption {
  id: string;
  question_id: string;
  option_key: '1' | '2' | '3' | '4' | 'A' | 'B' | 'C' | 'D';
  text_en: string;
  text_mr: string;
  is_correct?: boolean; // Hidden from students before test submission
  sort_order: number;
}

export interface Question {
  id: string;
  exam_id: string;
  subject_id: string;
  topic_id?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  question_en: string;
  question_mr: string;
  explanation_en?: string;
  explanation_mr?: string;
  marks: number;
  negative_marks: number;
  is_active: boolean;
  options: QuestionOption[];
  created_at?: string;
}

export interface MockTest {
  id: string;
  exam_id: string;
  title_en: string;
  title_mr: string;
  description_en: string;
  description_mr: string;
  duration_minutes: number;
  total_marks: number;
  passing_marks: number;
  negative_mark_factor: number; // e.g. 0.25 (1/4th)
  price: number; // 0 for free, INR amount for paid
  is_published: boolean;
  question_count?: number;
  questions?: Question[];
  is_enrolled?: boolean;
  created_at?: string;
}

export interface PromoCode {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_amount: number;
  max_discount_amount?: number;
  usage_limit?: number | null;
  times_used: number;
  valid_from: string;
  valid_until: string;
  is_active: boolean;
  eligible_test_ids: string[]; // empty array = all tests
}

export interface TestPackage {
  id: string;
  name_en: string;
  name_mr: string;
  description_en: string;
  description_mr: string;
  image_url?: string;
  exam_id?: string;
  price: number;
  discount_price: number;
  validity_days: number;
  is_published: boolean;
  test_count?: number;
  test_ids?: string[];
  tests?: MockTest[];
  is_enrolled?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface PackageEnrollment {
  id: string;
  user_id: string;
  package_id: string;
  package_name_en?: string;
  package_name_mr?: string;
  payment_id?: string;
  enrolled_at: string;
  expires_at: string;
}

export interface PaymentRecord {
  id: string;
  user_id: string;
  user_name?: string;
  user_email?: string;
  item_type?: 'test' | 'package';
  test_id?: string;
  test_title?: string;
  package_id?: string;
  package_name?: string;
  razorpay_order_id: string;
  razorpay_payment_id?: string;
  razorpay_signature?: string;
  amount: number;
  original_amount: number;
  discount_amount: number;
  currency: string;
  status: 'created' | 'paid' | 'failed';
  promo_code?: string;
  verified_at?: string;
  created_at: string;
}

export interface TestEnrollment {
  id: string;
  user_id: string;
  test_id: string;
  payment_id?: string;
  package_id?: string; // If unlocked via package purchase
  enrolled_at: string;
}

export interface UserAnswer {
  question_id: string;
  selected_option_id: string | null;
  is_marked_for_review: boolean;
  time_spent_seconds?: number;
}

export interface TestAttempt {
  id: string;
  user_id: string;
  test_id: string;
  test_title_en?: string;
  test_title_mr?: string;
  started_at: string;
  completed_at?: string;
  status: 'in_progress' | 'submitted' | 'evaluated';
  time_spent_seconds: number;
  answers: Record<string, UserAnswer>;
}

export interface SubjectBreakdown {
  subject_id: string;
  subject_name_en: string;
  subject_name_mr: string;
  total_questions: number;
  correct: number;
  incorrect: number;
  unattempted: number;
  score: number;
}

export interface TestResult {
  id: string;
  attempt_id: string;
  user_id: string;
  test_id: string;
  total_questions: number;
  attempted_count: number;
  correct_count: number;
  incorrect_count: number;
  unattempted_count: number;
  positive_score: number;
  negative_penalty: number;
  net_score: number;
  total_marks: number;
  percentage: number;
  rank: number;
  total_participants: number;
  percentile: number;
  subject_analysis: SubjectBreakdown[];
  evaluated_at: string;
}
