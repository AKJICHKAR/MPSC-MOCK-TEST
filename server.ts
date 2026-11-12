import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { db } from './server/db';
import {
  authMiddleware,
  generateToken,
  hashPassword,
  requireAdmin,
  requireAuth,
  AuthenticatedRequest
} from './server/auth';
import {
  createOrder,
  verifyPayment,
  getRazorpayKeyId,
  isRazorpayConfigured,
  generateSimulationSignature
} from './server/payment';
import { validateAndApplyPromo } from './server/promo';
import { evaluateAttempt } from './server/testEngine';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(authMiddleware);

// --- HEALTH CHECK API ---
app.get('/api/health', (req: Request, res: Response) => {
  const mem = process.memoryUsage();
  res.json({
    status: 'healthy',
    platform: 'MPSC Sarathi Engine v1.0',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    database: {
      status: 'connected',
      questionsCount: db.getQuestions().length,
      testsCount: db.getTests().length,
      usersCount: db.getAllUsers().length
    },
    razorpay: {
      configured: isRazorpayConfigured(),
      keyId: getRazorpayKeyId()
    },
    memory: {
      rssMb: Math.round(mem.rss / (1024 * 1024)),
      heapUsedMb: Math.round(mem.heapUsed / (1024 * 1024))
    }
  });
});

// --- AUTH APIS ---
app.post('/api/auth/register', (req: Request, res: Response) => {
  try {
    const { email, password, full_name, phone, role } = req.body;
    if (!email || !password || !full_name) {
      return res.status(400).json({ error: 'Email, password, and full name are required' });
    }

    const existing = db.findUserByEmail(email);
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    const assignedRole = role === 'admin' ? 'admin' : 'student';
    const newUser = db.createUser(email, hashPassword(password), full_name, assignedRole, phone);
    const token = generateToken(newUser);

    return res.status(201).json({
      user: {
        id: newUser.id,
        email: newUser.email,
        full_name: newUser.full_name,
        role: newUser.role,
        phone: newUser.phone
      },
      token
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Registration failed' });
  }
});

app.post('/api/auth/login', (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = db.findUserByEmail(email);
    if (!user || user.password_hash !== hashPassword(password)) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = generateToken(user);
    return res.json({
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        phone: user.phone
      },
      token
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Login failed' });
  }
});

app.get('/api/auth/me', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  return res.json({ user: req.user });
});

// --- METADATA (Exams, Subjects, Topics) ---
app.get('/api/exams', (req: Request, res: Response) => {
  res.json({ exams: db.getExams() });
});

app.get('/api/subjects', (req: Request, res: Response) => {
  const examId = req.query.exam_id as string | undefined;
  res.json({ subjects: db.getSubjects(examId) });
});

app.get('/api/topics', (req: Request, res: Response) => {
  const subjectId = req.query.subject_id as string | undefined;
  res.json({ topics: db.getTopics(subjectId) });
});

app.post('/api/topics', requireAdmin, (req: Request, res: Response) => {
  const { subject_id, name_en, name_mr } = req.body;
  if (!subject_id || !name_en || !name_mr) {
    return res.status(400).json({ error: 'subject_id, name_en, and name_mr are required' });
  }
  const topic = db.addTopic(subject_id, name_en, name_mr);
  res.status(201).json({ topic });
});

// --- QUESTIONS MANAGEMENT (Admin) ---
app.get('/api/questions', requireAdmin, (req: Request, res: Response) => {
  const { exam_id, subject_id, difficulty } = req.query as Record<string, string>;
  const questions = db.getQuestions({ exam_id, subject_id, difficulty });
  res.json({ questions });
});

app.post('/api/questions', requireAdmin, (req: Request, res: Response) => {
  try {
    const {
      exam_id,
      subject_id,
      topic_id,
      difficulty,
      question_en,
      question_mr,
      explanation_en,
      explanation_mr,
      marks,
      negative_marks,
      options
    } = req.body;

    if (!exam_id || !subject_id || !question_en || !question_mr) {
      return res.status(400).json({ error: 'Bilingual questions and subject mapping are required' });
    }

    if (!Array.isArray(options) || options.length < 2) {
      return res.status(400).json({ error: 'At least 2 options are required' });
    }

    const hasCorrect = options.some(opt => opt.is_correct);
    if (!hasCorrect) {
      return res.status(400).json({ error: 'At least one option must be marked as correct' });
    }

    const newQuestion = db.createQuestion({
      exam_id,
      subject_id,
      topic_id,
      difficulty: difficulty || 'medium',
      question_en,
      question_mr,
      explanation_en,
      explanation_mr,
      marks: Number(marks) || 2,
      negative_marks: Number(negative_marks) || 0.5,
      is_active: true,
      options
    });

    res.status(201).json({ question: newQuestion });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/questions/:id', requireAdmin, (req: Request, res: Response) => {
  try {
    const updated = db.updateQuestion(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Question not found' });
    }
    res.json({ question: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/questions/:id', requireAdmin, (req: Request, res: Response) => {
  const success = db.deleteQuestion(req.params.id);
  if (!success) {
    return res.status(404).json({ error: 'Question not found' });
  }
  res.json({ success: true, message: 'Question deleted successfully' });
});

// --- TESTS & ENROLLMENTS ---
app.get('/api/tests', (req: AuthenticatedRequest, res: Response) => {
  const isAdmin = req.user?.role === 'admin';
  const tests = db.getTests(!isAdmin); // Students only see published

  const testsWithStatus = tests.map(test => {
    const isEnrolled = req.user ? db.isUserEnrolled(req.user.id, test.id) : (test.price === 0);
    return {
      ...test,
      is_enrolled: isEnrolled
    };
  });

  res.json({ tests: testsWithStatus });
});

app.get('/api/tests/:id', (req: AuthenticatedRequest, res: Response) => {
  const isAdmin = req.user?.role === 'admin';
  const isEnrolled = req.user ? db.isUserEnrolled(req.user.id, req.params.id) : false;

  const test = db.getTestById(req.params.id, isAdmin || isEnrolled);
  if (!test) {
    return res.status(404).json({ error: 'Mock test not found' });
  }

  // If student is enrolled, return questions without exposing is_correct answer flag!
  if (test.questions && !isAdmin) {
    test.questions = test.questions.map(q => ({
      ...q,
      explanation_en: undefined,
      explanation_mr: undefined,
      options: q.options.map(({ is_correct, ...opt }) => opt as any)
    }));
  }

  res.json({
    test,
    is_enrolled: isEnrolled || test.price === 0
  });
});

app.post('/api/tests', requireAdmin, (req: Request, res: Response) => {
  try {
    const {
      exam_id,
      title_en,
      title_mr,
      description_en,
      description_mr,
      duration_minutes,
      total_marks,
      passing_marks,
      negative_mark_factor,
      price,
      is_published,
      question_ids
    } = req.body;

    if (!exam_id || !title_en || !title_mr) {
      return res.status(400).json({ error: 'Exam ID and bilingual titles are required' });
    }

    const test = db.createTest(
      {
        exam_id,
        title_en,
        title_mr,
        description_en: description_en || '',
        description_mr: description_mr || '',
        duration_minutes: Number(duration_minutes) || 60,
        total_marks: Number(total_marks) || 100,
        passing_marks: Number(passing_marks) || 40,
        negative_mark_factor: Number(negative_mark_factor) || 0.25,
        price: Number(price) || 0,
        is_published: is_published !== false
      },
      question_ids || []
    );

    res.status(201).json({ test });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/tests/:id', requireAdmin, (req: Request, res: Response) => {
  try {
    const { question_ids, ...updates } = req.body;
    const test = db.updateTest(req.params.id, updates, question_ids);
    if (!test) {
      return res.status(404).json({ error: 'Mock test not found' });
    }
    res.json({ test });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/tests/:id', requireAdmin, (req: Request, res: Response) => {
  const success = db.deleteTest(req.params.id);
  if (!success) {
    return res.status(404).json({ error: 'Mock test not found' });
  }
  res.json({ success: true, message: 'Test deleted successfully' });
});

// --- PACKAGE MANAGEMENT APIS ---
app.get('/api/packages', (req: AuthenticatedRequest, res: Response) => {
  const isAdmin = req.user?.role === 'admin';
  const packages = db.getPackages(!isAdmin);

  const packagesWithStatus = packages.map(pkg => {
    const isEnrolled = req.user ? db.isUserEnrolledInPackage(req.user.id, pkg.id) : false;
    return {
      ...pkg,
      is_enrolled: isEnrolled
    };
  });

  res.json({ packages: packagesWithStatus });
});

app.get('/api/packages/:id', (req: AuthenticatedRequest, res: Response) => {
  const pkg = db.getPackageById(req.params.id, true);
  if (!pkg) {
    return res.status(404).json({ error: 'Package not found' });
  }
  const isEnrolled = req.user ? db.isUserEnrolledInPackage(req.user.id, pkg.id) : false;
  res.json({
    package: pkg,
    is_enrolled: isEnrolled
  });
});

app.post('/api/packages', requireAdmin, (req: Request, res: Response) => {
  try {
    const {
      name_en,
      name_mr,
      description_en,
      description_mr,
      image_url,
      exam_id,
      price,
      discount_price,
      validity_days,
      is_published,
      test_ids
    } = req.body;

    if (!name_en || !name_mr) {
      return res.status(400).json({ error: 'Bilingual package names are required' });
    }

    const pkg = db.createPackage(
      {
        name_en,
        name_mr,
        description_en: description_en || '',
        description_mr: description_mr || '',
        image_url: image_url || '',
        exam_id: exam_id || undefined,
        price: Number(price) || 0,
        discount_price: Number(discount_price) || Number(price) || 0,
        validity_days: Number(validity_days) || 180,
        is_published: is_published !== false
      },
      test_ids || []
    );

    res.status(201).json({ package: pkg });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/packages/:id', requireAdmin, (req: Request, res: Response) => {
  try {
    const { test_ids, ...updates } = req.body;
    const pkg = db.updatePackage(req.params.id, updates, test_ids);
    if (!pkg) {
      return res.status(404).json({ error: 'Package not found' });
    }
    res.json({ package: pkg });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/packages/:id', requireAdmin, (req: Request, res: Response) => {
  const success = db.deletePackage(req.params.id);
  if (!success) {
    return res.status(404).json({ error: 'Package not found' });
  }
  res.json({ success: true, message: 'Package deleted successfully' });
});

// --- PROMO CODE MANAGEMENT & VALIDATION ---
app.get('/api/promos', requireAdmin, (req: Request, res: Response) => {
  res.json({ promos: db.getPromoCodes() });
});

app.post('/api/promos', requireAdmin, (req: Request, res: Response) => {
  try {
    const {
      code,
      discount_type,
      discount_value,
      min_order_amount,
      max_discount_amount,
      usage_limit,
      valid_from,
      valid_until,
      eligible_test_ids
    } = req.body;

    if (!code || !discount_value || !valid_until) {
      return res.status(400).json({ error: 'Code, discount value, and valid until date are required' });
    }

    const existing = db.findPromoCode(code);
    if (existing) {
      return res.status(409).json({ error: 'Promo code already exists' });
    }

    const promo = db.createPromoCode({
      code,
      discount_type: discount_type === 'fixed' ? 'fixed' : 'percentage',
      discount_value: Number(discount_value),
      min_order_amount: Number(min_order_amount) || 0,
      max_discount_amount: max_discount_amount ? Number(max_discount_amount) : undefined,
      usage_limit: usage_limit ? Number(usage_limit) : null,
      valid_from: valid_from || new Date().toISOString(),
      valid_until,
      is_active: true,
      eligible_test_ids: eligible_test_ids || []
    });

    res.status(201).json({ promo });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/promos/:id', requireAdmin, (req: Request, res: Response) => {
  const updated = db.updatePromoCode(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'Promo code not found' });
  }
  res.json({ promo: updated });
});

app.delete('/api/promos/:id', requireAdmin, (req: Request, res: Response) => {
  const success = db.deletePromoCode(req.params.id);
  if (!success) {
    return res.status(404).json({ error: 'Promo code not found' });
  }
  res.json({ success: true, message: 'Promo code deleted' });
});

app.post('/api/promos/validate', requireAuth, (req: Request, res: Response) => {
  const { code, test_id, package_id } = req.body;
  if (!code || (!test_id && !package_id)) {
    return res.status(400).json({ error: 'Coupon code and test_id or package_id are required' });
  }

  let originalPrice = 0;
  if (package_id) {
    const pkg = db.getPackageById(package_id);
    if (!pkg) return res.status(404).json({ error: 'Package not found' });
    originalPrice = pkg.discount_price > 0 ? pkg.discount_price : pkg.price;
  } else if (test_id) {
    const test = db.getTestById(test_id);
    if (!test) return res.status(404).json({ error: 'Test not found' });
    originalPrice = test.price;
  }

  const result = validateAndApplyPromo(code, originalPrice, test_id, package_id);
  if (!result.valid) {
    return res.status(400).json({ valid: false, message: result.message });
  }

  res.json({
    valid: true,
    code: result.promo?.code,
    discount_type: result.promo?.discount_type,
    discount_value: result.promo?.discount_value,
    original_price: result.originalPrice,
    discount_amount: result.discountAmount,
    final_price: result.finalPrice
  });
});

// --- PAYMENTS & RAZORPAY VERIFICATION ---
app.get('/api/payments', requireAdmin, (req: Request, res: Response) => {
  res.json({ payments: db.getAllPayments() });
});

app.post('/api/payments/create-order', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { test_id, package_id, item_type, promo_code } = req.body;
    if (!test_id && !package_id) {
      return res.status(400).json({ error: 'test_id or package_id is required' });
    }

    const orderData = createOrder({
      user: req.user!,
      itemType: item_type || (package_id ? 'package' : 'test'),
      testId: test_id,
      packageId: package_id,
      promoCode: promo_code
    });

    res.json(orderData);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to create payment order' });
  }
});

app.post('/api/payments/verify', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: 'Payment details incomplete for verification' });
    }

    const verification = verifyPayment({
      user: req.user!,
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature
    });

    res.json(verification);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Payment signature verification failed' });
  }
});

// Server-side simulated payment checkout for sandbox testing (generates real HMAC signature)
app.post('/api/payments/simulate-success', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { order_id } = req.body;
    if (!order_id) {
      return res.status(400).json({ error: 'order_id is required' });
    }

    const mockPaymentId = 'pay_sim_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6);
    const mockSignature = generateSimulationSignature(order_id, mockPaymentId);

    const verification = verifyPayment({
      user: req.user!,
      orderId: order_id,
      paymentId: mockPaymentId,
      signature: mockSignature
    });

    res.json(verification);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// --- TEST ATTEMPTS & MPSC EVALUATION ENGINE ---
app.post('/api/attempts/start', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { test_id } = req.body;
    if (!test_id) {
      return res.status(400).json({ error: 'test_id is required' });
    }

    // Verify enrollment
    if (!db.isUserEnrolled(req.user!.id, test_id)) {
      return res.status(403).json({ error: 'You must purchase or enroll in this mock test first' });
    }

    const attempt = db.createAttempt(req.user!.id, test_id);
    const test = db.getTestById(test_id, true);

    // Sanitize questions: do not send is_correct or explanations until submission
    const sanitizedQuestions = (test?.questions || []).map(q => ({
      id: q.id,
      exam_id: q.exam_id,
      subject_id: q.subject_id,
      topic_id: q.topic_id,
      difficulty: q.difficulty,
      question_en: q.question_en,
      question_mr: q.question_mr,
      marks: q.marks,
      negative_marks: q.negative_marks,
      is_active: q.is_active,
      options: q.options.map(opt => ({
        id: opt.id,
        question_id: opt.question_id,
        option_key: opt.option_key,
        text_en: opt.text_en,
        text_mr: opt.text_mr,
        sort_order: opt.sort_order
      }))
    }));

    res.json({
      attempt,
      test: {
        ...test,
        questions: sanitizedQuestions
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/attempts/:id/sync', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { answers, time_spent_seconds } = req.body;
    const attempt = db.saveAttemptAnswers(req.params.id, answers || {}, Number(time_spent_seconds) || 0);
    if (!attempt) {
      return res.status(404).json({ error: 'Attempt not found' });
    }
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/attempts/:id/submit', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { answers, time_spent_seconds } = req.body;
    db.saveAttemptAnswers(req.params.id, answers || {}, Number(time_spent_seconds) || 0);

    const result = evaluateAttempt(req.params.id, req.user!.id);
    res.json({ result });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/attempts/:id/result', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const result = db.getResultByAttemptId(req.params.id);
    if (!result) {
      return res.status(404).json({ error: 'Result not found' });
    }

    const attempt = db.getAttemptById(req.params.id);
    const test = db.getTestById(result.test_id, true);

    res.json({
      result,
      attempt,
      test
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- STUDENT DASHBOARD APIS ---
app.get('/api/student/dashboard', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const enrollments = db.getUserEnrollments(userId);
  const enrolledTestIds = enrollments.map(e => e.test_id);
  const allTests = db.getTests();

  const userTests = allTests.filter(t => t.price === 0 || enrolledTestIds.includes(t.id));
  const userResults = db.getUserResults(userId);

  const totalAttempts = userResults.length;
  const avgScore = totalAttempts > 0
    ? Math.round((userResults.reduce((sum, r) => sum + r.net_score, 0) / totalAttempts) * 10) / 10
    : 0;
  const highestScore = totalAttempts > 0
    ? Math.max(...userResults.map(r => r.net_score))
    : 0;

  res.json({
    enrolledTests: userTests,
    enrolledPackages: db.getUserPackageEnrollments(userId),
    results: userResults.sort((a, b) => new Date(b.evaluated_at).getTime() - new Date(a.evaluated_at).getTime()),
    stats: {
      totalEnrolled: userTests.length,
      totalPackages: db.getUserPackageEnrollments(userId).length,
      totalAttempts,
      avgScore,
      highestScore
    }
  });
});

// --- ADMIN STATS & BACKUPS ---
app.get('/api/admin/stats', requireAdmin, (req: Request, res: Response) => {
  res.json(db.getStats());
});

app.get('/api/backup/export', requireAdmin, (req: Request, res: Response) => {
  const fullStore = db.getFullStore();
  res.setHeader('Content-Disposition', 'attachment; filename="mpsc_sarathi_backup.json"');
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(fullStore, null, 2));
});

app.post('/api/backup/restore', requireAdmin, (req: Request, res: Response) => {
  try {
    const store = req.body;
    db.restoreStore(store);
    res.json({ success: true, message: 'Database restored successfully' });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Invalid backup payload' });
  }
});

// --- VITE & STATIC FILES MOUNTING ---
async function startServer() {
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MPSC Sarathi Platform running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
