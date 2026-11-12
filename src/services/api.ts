import {
  User,
  Exam,
  Subject,
  Topic,
  Question,
  MockTest,
  PromoCode,
  PaymentRecord,
  TestAttempt,
  TestResult,
  TestPackage,
  PackageEnrollment
} from '../types';

const TOKEN_KEY = 'mpsc_auth_token';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeStoredToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>)
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers
  });

  if (!response.ok) {
    let errorMsg = `Request failed: ${response.statusText}`;
    try {
      const data = await response.json();
      if (data && data.error) {
        errorMsg = data.error;
      }
    } catch {
      // ignore
    }
    throw new Error(errorMsg);
  }

  return response.json();
}

export const api = {
  // Auth
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const data = await request<{ user: User; token: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    setStoredToken(data.token);
    return data;
  },

  async register(payload: { email: string; password: string; full_name: string; phone?: string; role?: 'student' | 'admin' }): Promise<{ user: User; token: string }> {
    const data = await request<{ user: User; token: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    setStoredToken(data.token);
    return data;
  },

  async getMe(): Promise<{ user: User }> {
    return request<{ user: User }>('/api/auth/me');
  },

  logout(): void {
    removeStoredToken();
  },

  // Metadata
  async getExams(): Promise<Exam[]> {
    const res = await request<{ exams: Exam[] }>('/api/exams');
    return res.exams;
  },

  async getSubjects(examId?: string): Promise<Subject[]> {
    const url = examId ? `/api/subjects?exam_id=${examId}` : '/api/subjects';
    const res = await request<{ subjects: Subject[] }>(url);
    return res.subjects;
  },

  async getTopics(subjectId?: string): Promise<Topic[]> {
    const url = subjectId ? `/api/topics?subject_id=${subjectId}` : '/api/topics';
    const res = await request<{ topics: Topic[] }>(url);
    return res.topics;
  },

  async addTopic(subjectId: string, nameEn: string, nameMr: string): Promise<Topic> {
    const res = await request<{ topic: Topic }>('/api/topics', {
      method: 'POST',
      body: JSON.stringify({ subject_id: subjectId, name_en: nameEn, name_mr: nameMr })
    });
    return res.topic;
  },

  // Questions
  async getQuestions(filters?: { exam_id?: string; subject_id?: string; difficulty?: string }): Promise<Question[]> {
    const params = new URLSearchParams();
    if (filters?.exam_id) params.set('exam_id', filters.exam_id);
    if (filters?.subject_id) params.set('subject_id', filters.subject_id);
    if (filters?.difficulty) params.set('difficulty', filters.difficulty);
    const res = await request<{ questions: Question[] }>(`/api/questions?${params.toString()}`);
    return res.questions;
  },

  async createQuestion(data: Omit<Question, 'id'>): Promise<Question> {
    const res = await request<{ question: Question }>('/api/questions', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return res.question;
  },

  async updateQuestion(id: string, data: Partial<Question>): Promise<Question> {
    const res = await request<{ question: Question }>(`/api/questions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
    return res.question;
  },

  async deleteQuestion(id: string): Promise<void> {
    await request(`/api/questions/${id}`, { method: 'DELETE' });
  },

  // Tests
  async getTests(): Promise<(MockTest & { is_enrolled?: boolean })[]> {
    const res = await request<{ tests: (MockTest & { is_enrolled?: boolean })[] }>('/api/tests');
    return res.tests;
  },

  async getTestById(id: string): Promise<{ test: MockTest; is_enrolled: boolean }> {
    return request<{ test: MockTest; is_enrolled: boolean }>(`/api/tests/${id}`);
  },

  async createTest(data: Omit<MockTest, 'id'> & { question_ids?: string[] }): Promise<MockTest> {
    const res = await request<{ test: MockTest }>('/api/tests', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return res.test;
  },

  async updateTest(id: string, data: Partial<MockTest> & { question_ids?: string[] }): Promise<MockTest> {
    const res = await request<{ test: MockTest }>(`/api/tests/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
    return res.test;
  },

  async deleteTest(id: string): Promise<void> {
    await request(`/api/tests/${id}`, { method: 'DELETE' });
  },

  // Packages
  async getPackages(): Promise<(TestPackage & { is_enrolled?: boolean })[]> {
    const res = await request<{ packages: (TestPackage & { is_enrolled?: boolean })[] }>('/api/packages');
    return res.packages;
  },

  async getPackageById(id: string): Promise<{ package: TestPackage; is_enrolled: boolean }> {
    return request<{ package: TestPackage; is_enrolled: boolean }>(`/api/packages/${id}`);
  },

  async createPackage(data: Omit<TestPackage, 'id'> & { test_ids?: string[] }): Promise<TestPackage> {
    const res = await request<{ package: TestPackage }>('/api/packages', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return res.package;
  },

  async updatePackage(id: string, data: Partial<TestPackage> & { test_ids?: string[] }): Promise<TestPackage> {
    const res = await request<{ package: TestPackage }>(`/api/packages/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
    return res.package;
  },

  async deletePackage(id: string): Promise<void> {
    await request(`/api/packages/${id}`, { method: 'DELETE' });
  },

  // Promo Codes
  async getPromoCodes(): Promise<PromoCode[]> {
    const res = await request<{ promos: PromoCode[] }>('/api/promos');
    return res.promos;
  },

  async createPromoCode(data: Omit<PromoCode, 'id' | 'times_used'>): Promise<PromoCode> {
    const res = await request<{ promo: PromoCode }>('/api/promos', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return res.promo;
  },

  async updatePromoCode(id: string, data: Partial<PromoCode>): Promise<PromoCode> {
    const res = await request<{ promo: PromoCode }>(`/api/promos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
    return res.promo;
  },

  async deletePromoCode(id: string): Promise<void> {
    await request(`/api/promos/${id}`, { method: 'DELETE' });
  },

  async validatePromo(code: string, target: string | { testId?: string; packageId?: string }): Promise<any> {
    const payload = typeof target === 'string'
      ? { code, test_id: target }
      : { code, test_id: target.testId, package_id: target.packageId };

    return request('/api/promos/validate', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  // Payments
  async getPayments(): Promise<PaymentRecord[]> {
    const res = await request<{ payments: PaymentRecord[] }>('/api/payments');
    return res.payments;
  },

  async createPaymentOrder(
    target: string | { testId?: string; packageId?: string; itemType?: 'test' | 'package'; promoCode?: string },
    promoCode?: string
  ): Promise<any> {
    let payload: any;
    if (typeof target === 'string') {
      payload = { test_id: target, promo_code: promoCode };
    } else {
      payload = {
        test_id: target.testId,
        package_id: target.packageId,
        item_type: target.itemType || (target.packageId ? 'package' : 'test'),
        promo_code: target.promoCode || promoCode
      };
    }

    return request('/api/payments/create-order', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async verifyPayment(orderId: string, paymentId: string, signature: string): Promise<any> {
    return request('/api/payments/verify', {
      method: 'POST',
      body: JSON.stringify({
        razorpay_order_id: orderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: signature
      })
    });
  },

  async simulatePaymentSuccess(orderId: string): Promise<any> {
    return request('/api/payments/simulate-success', {
      method: 'POST',
      body: JSON.stringify({ order_id: orderId })
    });
  },

  // Test Attempt & Engine
  async startAttempt(testId: string): Promise<{ attempt: TestAttempt; test: MockTest }> {
    return request<{ attempt: TestAttempt; test: MockTest }>('/api/attempts/start', {
      method: 'POST',
      body: JSON.stringify({ test_id: testId })
    });
  },

  async syncAttempt(attemptId: string, answers: Record<string, any>, timeSpentSeconds: number): Promise<void> {
    await request(`/api/attempts/${attemptId}/sync`, {
      method: 'POST',
      body: JSON.stringify({ answers, time_spent_seconds: timeSpentSeconds })
    });
  },

  async submitAttempt(attemptId: string, answers: Record<string, any>, timeSpentSeconds: number): Promise<{ result: TestResult }> {
    return request<{ result: TestResult }>(`/api/attempts/${attemptId}/submit`, {
      method: 'POST',
      body: JSON.stringify({ answers, time_spent_seconds: timeSpentSeconds })
    });
  },

  async getAttemptResult(attemptId: string): Promise<{ result: TestResult; attempt: TestAttempt; test: MockTest }> {
    return request<{ result: TestResult; attempt: TestAttempt; test: MockTest }>(`/api/attempts/${attemptId}/result`);
  },

  // Student Dashboard
  async getStudentDashboard(): Promise<{
    enrolledTests: MockTest[];
    enrolledPackages?: PackageEnrollment[];
    results: TestResult[];
    stats: {
      totalEnrolled: number;
      totalPackages?: number;
      totalAttempts: number;
      avgScore: number;
      highestScore: number;
    };
  }> {
    return request('/api/student/dashboard');
  },

  // Admin Stats & Backups
  async getAdminStats(): Promise<{
    totalStudents: number;
    totalQuestions: number;
    totalTests: number;
    totalPackages?: number;
    totalRevenue: number;
    totalOrders: number;
    totalAttempts: number;
    completedAttempts: number;
  }> {
    return request('/api/admin/stats');
  },

  async exportBackup(): Promise<any> {
    return request('/api/backup/export');
  },

  async restoreBackup(store: any): Promise<any> {
    return request('/api/backup/restore', {
      method: 'POST',
      body: JSON.stringify(store)
    });
  },

  async getHealthCheck(): Promise<any> {
    return request('/api/health');
  }
};
