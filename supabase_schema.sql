-- ============================================================================
-- MPSC Sarathi: Maharashtra MPSC Mock Test Platform
-- Supabase / PostgreSQL Schema Definition (v1.0)
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ROLES TABLE
CREATE TABLE IF NOT EXISTS roles (
    id VARCHAR(32) PRIMARY KEY,
    name VARCHAR(64) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO roles (id, name, description) VALUES
    ('admin', 'Platform Administrator', 'Full management access to questions, tests, promo codes, and reports'),
    ('student', 'MPSC Aspirant / Student', 'Can attempt mock tests, buy test series, and view results')
ON CONFLICT (id) DO NOTHING;

-- 2. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role_id VARCHAR(32) NOT NULL REFERENCES roles(id) DEFAULT 'student',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. EXAMS TABLE
CREATE TABLE IF NOT EXISTS exams (
    id VARCHAR(64) PRIMARY KEY,
    code VARCHAR(32) NOT NULL UNIQUE,
    title_en VARCHAR(255) NOT NULL,
    title_mr VARCHAR(255) NOT NULL,
    description_en TEXT,
    description_mr TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. SUBJECTS TABLE
CREATE TABLE IF NOT EXISTS subjects (
    id VARCHAR(64) PRIMARY KEY,
    exam_id VARCHAR(64) NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
    code VARCHAR(32) NOT NULL,
    name_en VARCHAR(255) NOT NULL,
    name_mr VARCHAR(255) NOT NULL,
    description_en TEXT,
    description_mr TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TOPICS TABLE
CREATE TABLE IF NOT EXISTS topics (
    id VARCHAR(64) PRIMARY KEY,
    subject_id VARCHAR(64) NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    name_en VARCHAR(255) NOT NULL,
    name_mr VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. QUESTIONS TABLE (Bilingual MPSC Questions)
CREATE TABLE IF NOT EXISTS questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_id VARCHAR(64) NOT NULL REFERENCES exams(id),
    subject_id VARCHAR(64) NOT NULL REFERENCES subjects(id),
    topic_id VARCHAR(64) REFERENCES topics(id),
    difficulty VARCHAR(16) NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
    question_en TEXT NOT NULL,
    question_mr TEXT NOT NULL,
    explanation_en TEXT,
    explanation_mr TEXT,
    marks NUMERIC(4, 2) NOT NULL DEFAULT 1.00,
    negative_marks NUMERIC(4, 2) NOT NULL DEFAULT 0.25,
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. QUESTION OPTIONS TABLE (Bilingual Options)
CREATE TABLE IF NOT EXISTS question_options (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    option_key VARCHAR(8) NOT NULL, -- e.g. '1', '2', '3', '4' or 'A', 'B', 'C', 'D'
    text_en TEXT NOT NULL,
    text_mr TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL DEFAULT FALSE,
    sort_order INT NOT NULL DEFAULT 1
);

-- 8. TESTS TABLE
CREATE TABLE IF NOT EXISTS tests (
    id VARCHAR(64) PRIMARY KEY,
    exam_id VARCHAR(64) NOT NULL REFERENCES exams(id),
    title_en VARCHAR(255) NOT NULL,
    title_mr VARCHAR(255) NOT NULL,
    description_en TEXT,
    description_mr TEXT,
    duration_minutes INT NOT NULL DEFAULT 60,
    total_marks NUMERIC(6, 2) NOT NULL DEFAULT 100.00,
    passing_marks NUMERIC(6, 2) NOT NULL DEFAULT 40.00,
    negative_mark_factor NUMERIC(3, 2) NOT NULL DEFAULT 0.25, -- MPSC standard 0.25 (1/4th)
    price NUMERIC(10, 2) NOT NULL DEFAULT 0.00, -- 0 for Free
    is_published BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. TEST QUESTIONS MAPPING
CREATE TABLE IF NOT EXISTS test_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    test_id VARCHAR(64) NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    question_order INT NOT NULL,
    UNIQUE(test_id, question_id)
);

-- 10. PROMO CODES TABLE
CREATE TABLE IF NOT EXISTS promo_codes (
    id VARCHAR(64) PRIMARY KEY,
    code VARCHAR(32) NOT NULL UNIQUE,
    discount_type VARCHAR(16) NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value NUMERIC(10, 2) NOT NULL,
    min_order_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    max_discount_amount NUMERIC(10, 2), -- useful for percentage caps
    usage_limit INT, -- NULL = unlimited
    times_used INT NOT NULL DEFAULT 0,
    valid_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    valid_until TIMESTAMPTZ NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    eligible_test_ids JSONB DEFAULT '[]'::jsonb, -- empty array = all tests
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. PAYMENTS TABLE (Razorpay Verified Server-side)
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    test_id VARCHAR(64) NOT NULL REFERENCES tests(id),
    razorpay_order_id VARCHAR(128) NOT NULL UNIQUE,
    razorpay_payment_id VARCHAR(128),
    razorpay_signature VARCHAR(255),
    amount NUMERIC(10, 2) NOT NULL,
    currency VARCHAR(8) NOT NULL DEFAULT 'INR',
    status VARCHAR(32) NOT NULL CHECK (status IN ('created', 'paid', 'failed', 'refunded')),
    promo_code_id VARCHAR(64) REFERENCES promo_codes(id),
    discount_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. TEST ENROLLMENTS / UNLOCKED TESTS
CREATE TABLE IF NOT EXISTS test_enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    test_id VARCHAR(64) NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
    payment_id UUID REFERENCES payments(id),
    enrolled_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, test_id)
);

-- 13. ATTEMPTS TABLE
CREATE TABLE IF NOT EXISTS attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    test_id VARCHAR(64) NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    status VARCHAR(32) NOT NULL CHECK (status IN ('in_progress', 'submitted', 'evaluated')),
    time_spent_seconds INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. ANSWERS TABLE
CREATE TABLE IF NOT EXISTS answers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    attempt_id UUID NOT NULL REFERENCES attempts(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    selected_option_id UUID REFERENCES question_options(id),
    is_marked_for_review BOOLEAN NOT NULL DEFAULT FALSE,
    is_correct BOOLEAN,
    marks_awarded NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    time_spent_seconds INT NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(attempt_id, question_id)
);

-- 15. RESULTS TABLE
CREATE TABLE IF NOT EXISTS results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    attempt_id UUID NOT NULL UNIQUE REFERENCES attempts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    test_id VARCHAR(64) NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
    total_questions INT NOT NULL,
    attempted_count INT NOT NULL,
    correct_count INT NOT NULL,
    incorrect_count INT NOT NULL,
    unattempted_count INT NOT NULL,
    positive_score NUMERIC(6, 2) NOT NULL,
    negative_penalty NUMERIC(6, 2) NOT NULL,
    net_score NUMERIC(6, 2) NOT NULL,
    percentage NUMERIC(5, 2) NOT NULL,
    rank INT,
    percentile NUMERIC(5, 2),
    subject_analysis JSONB,
    evaluated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. PACKAGES TABLE (Flexible MPSC Test Series Packages)
CREATE TABLE IF NOT EXISTS packages (
    id VARCHAR(64) PRIMARY KEY,
    name_en VARCHAR(255) NOT NULL,
    name_mr VARCHAR(255) NOT NULL,
    description_en TEXT,
    description_mr TEXT,
    image_url TEXT,
    exam_id VARCHAR(64) REFERENCES exams(id),
    price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    discount_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    validity_days INT NOT NULL DEFAULT 180,
    is_published BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17. PACKAGE TESTS MAPPING
CREATE TABLE IF NOT EXISTS package_tests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    package_id VARCHAR(64) NOT NULL REFERENCES packages(id) ON DELETE CASCADE,
    test_id VARCHAR(64) NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
    sort_order INT NOT NULL DEFAULT 1,
    UNIQUE(package_id, test_id)
);

-- 18. PACKAGE ENROLLMENTS
CREATE TABLE IF NOT EXISTS package_enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    package_id VARCHAR(64) NOT NULL REFERENCES packages(id) ON DELETE CASCADE,
    payment_id UUID REFERENCES payments(id),
    enrolled_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    UNIQUE(user_id, package_id)
);

-- INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_questions_exam_subject ON questions(exam_id, subject_id);
CREATE INDEX IF NOT EXISTS idx_options_question ON question_options(question_id);
CREATE INDEX IF NOT EXISTS idx_test_questions_test ON test_questions(test_id, question_order);
CREATE INDEX IF NOT EXISTS idx_package_tests_pkg ON package_tests(package_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_package_enrollments_user ON package_enrollments(user_id, package_id);
CREATE INDEX IF NOT EXISTS idx_attempts_user_test ON attempts(user_id, test_id);
CREATE INDEX IF NOT EXISTS idx_answers_attempt ON answers(attempt_id);
CREATE INDEX IF NOT EXISTS idx_results_test ON results(test_id, net_score DESC);
CREATE INDEX IF NOT EXISTS idx_payments_order ON payments(razorpay_order_id);

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE package_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE package_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE results ENABLE ROW LEVEL SECURITY;

-- Sample Policies
-- Exams & Tests: Public read
CREATE POLICY "Public read published tests" ON tests FOR SELECT USING (is_published = true);
CREATE POLICY "Public read published packages" ON packages FOR SELECT USING (is_published = true);
CREATE POLICY "Public read exams" ON exams FOR SELECT USING (is_active = true);
CREATE POLICY "Public read subjects" ON subjects FOR SELECT USING (true);
CREATE POLICY "Public read topics" ON topics FOR SELECT USING (true);
