import React, { useState, useEffect } from 'react';
import {
  Exam,
  Subject,
  Topic,
  Question,
  MockTest,
  PromoCode,
  PaymentRecord,
  TestPackage
} from '../types';
import { api } from '../services/api';
import {
  Plus,
  Trash2,
  Edit2,
  Download,
  Upload,
  CheckCircle,
  AlertCircle,
  Activity,
  Layers,
  FileQuestion,
  CreditCard,
  Tag,
  Database,
  Search,
  Filter,
  RefreshCw,
  ExternalLink,
  Loader2,
  ArrowUp,
  ArrowDown,
  FolderPlus,
  Calendar,
  Eye
} from 'lucide-react';

interface AdminDashboardProps {
  language: 'en' | 'mr';
  initialTab?: string;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  language,
  initialTab = 'stats'
}) => {
  const isMr = language === 'mr';
  const [currentTab, setCurrentTab] = useState(initialTab.replace('admin_', ''));

  // Sync prop tab
  useEffect(() => {
    if (initialTab) {
      setCurrentTab(initialTab.replace('admin_', ''));
    }
  }, [initialTab]);

  // Master Data
  const [stats, setStats] = useState<any>(null);
  const [exams, setExams] = useState<Exam[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [tests, setTests] = useState<MockTest[]>([]);
  const [packages, setPackages] = useState<TestPackage[]>([]);
  const [promos, setPromos] = useState<PromoCode[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [healthData, setHealthData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Question Modal State
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [qFormData, setQFormData] = useState({
    exam_id: 'exam_rajyaseva',
    subject_id: 'sub_polity',
    topic_id: '',
    difficulty: 'medium' as 'easy' | 'medium' | 'hard',
    question_en: '',
    question_mr: '',
    explanation_en: '',
    explanation_mr: '',
    marks: 2,
    negative_marks: 0.5,
    options: [
      { option_key: '1', text_en: '', text_mr: '', is_correct: true, sort_order: 1 },
      { option_key: '2', text_en: '', text_mr: '', is_correct: false, sort_order: 2 },
      { option_key: '3', text_en: '', text_mr: '', is_correct: false, sort_order: 3 },
      { option_key: '4', text_en: '', text_mr: '', is_correct: false, sort_order: 4 }
    ]
  });

  // Test Modal State
  const [showTestModal, setShowTestModal] = useState(false);
  const [editingTestId, setEditingTestId] = useState<string | null>(null);
  const [testFormData, setTestFormData] = useState({
    exam_id: 'exam_rajyaseva',
    title_en: '',
    title_mr: '',
    description_en: '',
    description_mr: '',
    duration_minutes: 60,
    total_marks: 100,
    passing_marks: 40,
    negative_mark_factor: 0.25,
    price: 0,
    is_published: true,
    question_ids: [] as string[]
  });

  // Package Modal State
  const [showPackageModal, setShowPackageModal] = useState(false);
  const [editingPackageId, setEditingPackageId] = useState<string | null>(null);
  const [packageFormData, setPackageFormData] = useState({
    exam_id: 'exam_combine_c',
    name_en: '',
    name_mr: '',
    description_en: '',
    description_mr: '',
    image_url: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&auto=format&fit=crop&q=80',
    price: 499,
    discount_price: 299,
    validity_days: 180,
    is_published: true,
    test_ids: [] as string[]
  });

  // Promo Modal State
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [promoFormData, setPromoFormData] = useState({
    code: '',
    discount_type: 'percentage' as 'percentage' | 'fixed',
    discount_value: 20,
    min_order_amount: 100,
    max_discount_amount: 100,
    usage_limit: 100,
    valid_until: '2026-12-31'
  });

  // Filter States for Questions
  const [qSearch, setQSearch] = useState('');
  const [qSubjectFilter, setQSubjectFilter] = useState('all');

  useEffect(() => {
    loadAllAdminData();
  }, []);

  const loadAllAdminData = async () => {
    setLoading(true);
    try {
      const [
        statsData,
        examsData,
        subjectsData,
        topicsData,
        questionsData,
        testsData,
        packagesData,
        promosData,
        paymentsData,
        health
      ] = await Promise.all([
        api.getAdminStats(),
        api.getExams(),
        api.getSubjects(),
        api.getTopics(),
        api.getQuestions(),
        api.getTests(),
        api.getPackages().catch(() => []),
        api.getPromoCodes(),
        api.getPayments(),
        api.getHealthCheck()
      ]);

      setStats(statsData);
      setExams(examsData);
      setSubjects(subjectsData);
      setTopics(topicsData);
      setQuestions(questionsData);
      setTests(testsData);
      setPackages(packagesData);
      setPromos(promosData);
      setPayments(paymentsData);
      setHealthData(health);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  // --- QUESTION HANDLERS ---
  const handleOpenAddQuestion = () => {
    setEditingQuestionId(null);
    setQFormData({
      exam_id: exams[0]?.id || 'exam_rajyaseva',
      subject_id: subjects[0]?.id || 'sub_polity',
      topic_id: topics[0]?.id || '',
      difficulty: 'medium',
      question_en: '',
      question_mr: '',
      explanation_en: '',
      explanation_mr: '',
      marks: 2,
      negative_marks: 0.5,
      options: [
        { option_key: '1', text_en: '', text_mr: '', is_correct: true, sort_order: 1 },
        { option_key: '2', text_en: '', text_mr: '', is_correct: false, sort_order: 2 },
        { option_key: '3', text_en: '', text_mr: '', is_correct: false, sort_order: 3 },
        { option_key: '4', text_en: '', text_mr: '', is_correct: false, sort_order: 4 }
      ]
    });
    setShowQuestionModal(true);
  };

  const handleEditQuestion = (q: Question) => {
    setEditingQuestionId(q.id);
    setQFormData({
      exam_id: q.exam_id,
      subject_id: q.subject_id,
      topic_id: q.topic_id || '',
      difficulty: q.difficulty,
      question_en: q.question_en,
      question_mr: q.question_mr,
      explanation_en: q.explanation_en || '',
      explanation_mr: q.explanation_mr || '',
      marks: q.marks,
      negative_marks: q.negative_marks,
      options: q.options.map(o => ({
        option_key: o.option_key,
        text_en: o.text_en,
        text_mr: o.text_mr,
        is_correct: Boolean(o.is_correct),
        sort_order: o.sort_order
      }))
    });
    setShowQuestionModal(true);
  };

  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingQuestionId) {
        await api.updateQuestion(editingQuestionId, qFormData as any);
      } else {
        await api.createQuestion(qFormData as any);
      }
      setShowQuestionModal(false);
      loadAllAdminData();
    } catch (err: any) {
      alert('Error saving question: ' + err.message);
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    if (confirm(isMr ? 'हा प्रश्न नक्की हटवायचा आहे का?' : 'Are you sure you want to delete this question?')) {
      await api.deleteQuestion(id);
      loadAllAdminData();
    }
  };

  // --- TEST HANDLERS ---
  const handleOpenAddTest = () => {
    setEditingTestId(null);
    setTestFormData({
      exam_id: exams[0]?.id || 'exam_rajyaseva',
      title_en: '',
      title_mr: '',
      description_en: '',
      description_mr: '',
      duration_minutes: 60,
      total_marks: 100,
      passing_marks: 40,
      negative_mark_factor: 0.25,
      price: 199,
      is_published: true,
      question_ids: questions.slice(0, 5).map(q => q.id)
    });
    setShowTestModal(true);
  };

  const handleSaveTest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTestId) {
        await api.updateTest(editingTestId, testFormData as any);
      } else {
        await api.createTest(testFormData as any);
      }
      setShowTestModal(false);
      loadAllAdminData();
    } catch (err: any) {
      alert('Error saving test: ' + err.message);
    }
  };

  const handleDeleteTest = async (id: string) => {
    if (confirm(isMr ? 'ही टेस्ट नक्की हटवायची आहे का?' : 'Are you sure you want to delete this test?')) {
      await api.deleteTest(id);
      loadAllAdminData();
    }
  };

  // --- PACKAGE HANDLERS ---
  const handleOpenAddPackage = () => {
    setEditingPackageId(null);
    setPackageFormData({
      exam_id: exams[0]?.id || 'exam_combine_c',
      name_en: '',
      name_mr: '',
      description_en: '',
      description_mr: '',
      image_url: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&auto=format&fit=crop&q=80',
      price: 499,
      discount_price: 299,
      validity_days: 180,
      is_published: true,
      test_ids: tests.slice(0, 3).map(t => t.id)
    });
    setShowPackageModal(true);
  };

  const handleEditPackage = async (pkg: TestPackage) => {
    setEditingPackageId(pkg.id);
    try {
      const fullPkg = await api.getPackageById(pkg.id);
      setPackageFormData({
        exam_id: pkg.exam_id || exams[0]?.id || 'exam_combine_c',
        name_en: pkg.name_en,
        name_mr: pkg.name_mr,
        description_en: pkg.description_en || '',
        description_mr: pkg.description_mr || '',
        image_url: pkg.image_url || 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&auto=format&fit=crop&q=80',
        price: pkg.price,
        discount_price: pkg.discount_price,
        validity_days: pkg.validity_days || 180,
        is_published: pkg.is_published,
        test_ids: fullPkg.package.test_ids || pkg.test_ids || []
      });
    } catch {
      setPackageFormData({
        exam_id: pkg.exam_id || exams[0]?.id || 'exam_combine_c',
        name_en: pkg.name_en,
        name_mr: pkg.name_mr,
        description_en: pkg.description_en || '',
        description_mr: pkg.description_mr || '',
        image_url: pkg.image_url || 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&auto=format&fit=crop&q=80',
        price: pkg.price,
        discount_price: pkg.discount_price,
        validity_days: pkg.validity_days || 180,
        is_published: pkg.is_published,
        test_ids: pkg.test_ids || []
      });
    }
    setShowPackageModal(true);
  };

  const handleSavePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingPackageId) {
        await api.updatePackage(editingPackageId, packageFormData);
      } else {
        await api.createPackage(packageFormData);
      }
      setShowPackageModal(false);
      loadAllAdminData();
    } catch (err: any) {
      alert('Error saving package: ' + err.message);
    }
  };

  const handleDeletePackage = async (id: string) => {
    if (confirm(isMr ? 'हे पॅकेज नक्की हटवायचे आहे का?' : 'Are you sure you want to delete this package?')) {
      await api.deletePackage(id);
      loadAllAdminData();
    }
  };

  const handleMoveTestUp = (index: number) => {
    if (index <= 0) return;
    const updated = [...packageFormData.test_ids];
    const temp = updated[index - 1];
    updated[index - 1] = updated[index];
    updated[index] = temp;
    setPackageFormData({ ...packageFormData, test_ids: updated });
  };

  const handleMoveTestDown = (index: number) => {
    if (index >= packageFormData.test_ids.length - 1) return;
    const updated = [...packageFormData.test_ids];
    const temp = updated[index + 1];
    updated[index + 1] = updated[index];
    updated[index] = temp;
    setPackageFormData({ ...packageFormData, test_ids: updated });
  };

  const handleRemoveTestFromPackage = (testId: string) => {
    setPackageFormData({
      ...packageFormData,
      test_ids: packageFormData.test_ids.filter(id => id !== testId)
    });
  };

  const handleAddTestToPackage = (testId: string) => {
    if (!packageFormData.test_ids.includes(testId)) {
      setPackageFormData({
        ...packageFormData,
        test_ids: [...packageFormData.test_ids, testId]
      });
    }
  };

  // --- PROMO CODE HANDLERS ---
  const handleSavePromo = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createPromoCode({
        ...promoFormData,
        valid_from: new Date().toISOString(),
        valid_until: new Date(promoFormData.valid_until).toISOString(),
        is_active: true,
        eligible_test_ids: []
      });
      setShowPromoModal(false);
      loadAllAdminData();
    } catch (err: any) {
      alert('Error creating promo code: ' + err.message);
    }
  };

  const handleDeletePromo = async (id: string) => {
    if (confirm(isMr ? 'हा प्रोमो कोड हटवायचा आहे का?' : 'Delete promo code?')) {
      await api.deletePromoCode(id);
      loadAllAdminData();
    }
  };

  // --- BACKUP DOWNLOAD / RESTORE ---
  const handleExportBackup = async () => {
    try {
      const data = await api.exportBackup();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mpsc_sarathi_backup_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
    } catch (err: any) {
      alert('Failed to export backup: ' + err.message);
    }
  };

  const handleRestoreFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async event => {
      try {
        const json = JSON.parse(event.target?.result as string);
        await api.restoreBackup(json);
        alert(isMr ? 'डेटाबेस यशस्वीरीत्या पूर्ववत (Restore) करण्यात आला आहे!' : 'Database restored successfully!');
        loadAllAdminData();
      } catch (err: any) {
        alert('Invalid backup file: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  // Filtered questions in table
  const filteredQuestions = questions.filter(q => {
    const matchesSearch =
      q.question_en.toLowerCase().includes(qSearch.toLowerCase()) ||
      q.question_mr.toLowerCase().includes(qSearch.toLowerCase());
    const matchesSubject = qSubjectFilter === 'all' || q.subject_id === qSubjectFilter;
    return matchesSearch && matchesSubject;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            {isMr ? 'MPSC प्रशासकीय नियंत्रण कक्ष (Admin CMS)' : 'MPSC Admin Command Center'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {isMr
              ? 'प्रश्न पेढी, सराव चाचण्या, प्रोमो कोड्स, व Razorpay पेमेंट्सचे व्यवस्थापन.'
              : 'Manage bilingual questions, mock tests, promo codes, Razorpay transactions, and system health.'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs font-semibold">
          <button
            onClick={() => setCurrentTab('stats')}
            className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
              currentTab === 'stats' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {isMr ? 'सारांश' : 'Stats'}
          </button>
          <button
            onClick={() => setCurrentTab('packages')}
            className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
              currentTab === 'packages' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{isMr ? 'पॅकेजेस (Packages)' : 'Packages'}</span>
          </button>
          <button
            onClick={() => setCurrentTab('tests')}
            className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
              currentTab === 'tests' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {isMr ? 'चाचण्या (Tests)' : 'Tests'}
          </button>
          <button
            onClick={() => setCurrentTab('questions')}
            className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
              currentTab === 'questions' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {isMr ? 'प्रश्न पेढी (CMS)' : 'Questions'}
          </button>
          <button
            onClick={() => setCurrentTab('promos')}
            className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
              currentTab === 'promos' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {isMr ? 'प्रोमो कोड्स' : 'Promos'}
          </button>
          <button
            onClick={() => setCurrentTab('payments')}
            className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
              currentTab === 'payments' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {isMr ? 'पेमेंट्स' : 'Payments'}
          </button>
          <button
            onClick={() => setCurrentTab('backups')}
            className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
              currentTab === 'backups' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {isMr ? 'बॅकअप व आरोग्य' : 'Health & Backup'}
          </button>
        </div>
      </div>

      {/* TAB 1: STATS & OVERVIEW */}
      {currentTab === 'stats' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 block">{isMr ? 'नोंदणीकृत विद्यार्थी' : 'Total Students'}</span>
              <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums mt-1 block">
                {stats?.totalStudents || 0}
              </span>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 block">{isMr ? 'मॉक टेस्ट पॅकेजेस' : 'Test Packages'}</span>
              <span className="text-2xl font-bold text-amber-700 font-mono tabular-nums mt-1 block">
                {packages.length}
              </span>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 block">{isMr ? 'सक्रिय चाचण्या' : 'Active Tests'}</span>
              <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums mt-1 block">
                {stats?.totalTests || 0}
              </span>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 block">{isMr ? 'एकूण प्रश्न' : 'Total Questions'}</span>
              <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums mt-1 block">
                {stats?.totalQuestions || 0}
              </span>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 block">{isMr ? 'एकूण महसूल' : 'Total Revenue'}</span>
              <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums mt-1 block">
                ₹{stats?.totalRevenue || 0}
              </span>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 block">{isMr ? 'सोडवलेले पेपर्स' : 'Total Attempts'}</span>
              <span className="text-2xl font-bold text-emerald-700 font-mono tabular-nums mt-1 block">
                {stats?.totalAttempts || 0}
              </span>
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <button
              onClick={handleOpenAddPackage}
              className="p-5 bg-white rounded-2xl border border-slate-200 hover:border-amber-400 transition-colors text-left flex items-start gap-4 cursor-pointer"
            >
              <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">{isMr ? 'नवीन पॅकेज तयार करा' : 'Create Package'}</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isMr ? 'गट-क, AMVI किंवा सानुकूल पॅक' : 'Bundle 20-40 tests in one package'}
                </p>
              </div>
            </button>

            <button
              onClick={handleOpenAddTest}
              className="p-5 bg-white rounded-2xl border border-slate-200 hover:border-amber-400 transition-colors text-left flex items-start gap-4 cursor-pointer"
            >
              <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
                <FileQuestion className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">{isMr ? 'नवीन टेस्ट तयार करा' : 'Create Mock Test'}</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isMr ? 'कालावधी, निगेटिव्ह मार्किंग व मूल्य' : 'Duration, negative marks & price'}
                </p>
              </div>
            </button>

            <button
              onClick={handleOpenAddQuestion}
              className="p-5 bg-white rounded-2xl border border-slate-200 hover:border-amber-400 transition-colors text-left flex items-start gap-4 cursor-pointer"
            >
              <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
                <Plus className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">{isMr ? 'नवीन प्रश्न जोडा' : 'Add Question'}</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isMr ? 'मराठी व इंग्रजीमध्ये ४ पर्यायांसह' : 'Bilingual question with syllabus'}
                </p>
              </div>
            </button>

            <button
              onClick={() => setShowPromoModal(true)}
              className="p-5 bg-white rounded-2xl border border-slate-200 hover:border-amber-400 transition-colors text-left flex items-start gap-4 cursor-pointer"
            >
              <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
                <Tag className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">{isMr ? 'नवीन प्रोमो कोड' : 'New Promo Code'}</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isMr ? 'टक्केवारी किंवा निश्चित सूट' : 'Discount coupon configuration'}
                </p>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* TAB: PACKAGES MANAGEMENT */}
      {currentTab === 'packages' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {isMr ? 'मॉक टेस्ट पॅकेज व्यवस्थापन (Package Management)' : 'Mock Test Series Packages'}
              </h3>
              <p className="text-xs text-slate-500">
                {isMr
                  ? `${packages.length} सक्रिय पॅकेजेस. कोणत्याही कोड बदलाशिवाय अमर्यादित पॅकेजेस तयार करा व चाचण्यांची रचना बदला.`
                  : `${packages.length} active packages. Add unlimited test packages and rearrange tests easily without writing code.`}
              </p>
            </div>
            <button
              onClick={handleOpenAddPackage}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>{isMr ? 'नवीन पॅकेज तयार करा' : 'Create Package'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {packages.map(pkg => (
              <div
                key={pkg.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="h-28 bg-gradient-to-r from-slate-900 to-amber-900 relative p-3 flex flex-col justify-between">
                    {pkg.image_url && (
                      <img
                        src={pkg.image_url}
                        alt={pkg.name_en}
                        referrerPolicy="no-referrer"
                        className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-overlay"
                      />
                    )}
                    <div className="relative z-10 flex justify-between items-center">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 bg-black/40 px-2 py-0.5 rounded">
                        {pkg.test_count || pkg.test_ids?.length || 0} {isMr ? 'चाचण्या' : 'Tests'}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          pkg.is_published ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-200'
                        }`}
                      >
                        {pkg.is_published ? 'Published' : 'Draft'}
                      </span>
                    </div>

                    <div className="relative z-10 text-[11px] text-white/90 font-medium">
                      {pkg.validity_days} {isMr ? 'दिवस वैधता' : 'Days Validity'}
                    </div>
                  </div>

                  <div className="p-4 space-y-2">
                    <h4 className="text-sm font-bold text-slate-900 font-marathi line-clamp-1">
                      {isMr ? pkg.name_mr : pkg.name_en}
                    </h4>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {isMr ? pkg.description_mr : pkg.description_en}
                    </p>

                    <div className="pt-2 flex items-baseline gap-2">
                      <span className="text-lg font-bold font-mono text-slate-900">
                        ₹{pkg.discount_price > 0 ? pkg.discount_price : pkg.price}
                      </span>
                      {pkg.price > pkg.discount_price && pkg.discount_price > 0 && (
                        <span className="text-xs text-slate-400 line-through font-mono">
                          ₹{pkg.price}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-4 pt-0 border-t border-slate-100 flex items-center justify-between gap-2 mt-2">
                  <button
                    onClick={() => handleEditPackage(pkg)}
                    className="flex-1 py-1.5 px-3 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                    <span>{isMr ? 'संपादित व टेस्ट क्रम बदला' : 'Edit & Rearrange'}</span>
                  </button>
                  <button
                    onClick={() => handleDeletePackage(pkg.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title={isMr ? 'पॅकेज हटवा' : 'Delete Package'}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: QUESTION BANK CMS */}
      {currentTab === 'questions' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200">
            <div className="flex flex-1 items-center gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder={isMr ? 'प्रश्नांमध्ये शोधा...' : 'Search questions...'}
                  value={qSearch}
                  onChange={e => setQSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <select
                value={qSubjectFilter}
                onChange={e => setQSubjectFilter(e.target.value)}
                className="py-1.5 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
              >
                <option value="all">{isMr ? 'सर्व विषय' : 'All Subjects'}</option>
                {subjects.map(s => (
                  <option key={s.id} value={s.id}>
                    {isMr ? s.name_mr : s.name_en}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleOpenAddQuestion}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>{isMr ? 'नवीन प्रश्न जोडा' : 'Add Question'}</span>
            </button>
          </div>

          {/* Questions Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                    <th className="py-3 px-4 w-12">#</th>
                    <th className="py-3 px-4">{isMr ? 'प्रश्न (मराठी व इंग्रजी)' : 'Question (Bilingual)'}</th>
                    <th className="py-3 px-4">{isMr ? 'विषय' : 'Subject'}</th>
                    <th className="py-3 px-4">{isMr ? 'काठिण्य' : 'Difficulty'}</th>
                    <th className="py-3 px-4 text-center">{isMr ? 'गुण' : 'Marks'}</th>
                    <th className="py-3 px-4 text-right">{isMr ? 'क्रिया' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredQuestions.map((q, idx) => {
                    const sub = subjects.find(s => s.id === q.subject_id);
                    return (
                      <tr key={q.id} className="hover:bg-slate-50/50">
                        <td className="py-3 px-4 font-mono text-slate-400">{idx + 1}</td>
                        <td className="py-3 px-4 max-w-md">
                          <div className="font-semibold text-slate-900 font-marathi line-clamp-1">
                            {q.question_mr}
                          </div>
                          <div className="text-slate-500 text-[11px] line-clamp-1 mt-0.5">
                            {q.question_en}
                          </div>
                        </td>
                        <td className="py-3 px-4 font-marathi text-slate-700 font-medium">
                          {isMr ? sub?.name_mr : sub?.name_en}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`capitalize font-semibold ${
                              q.difficulty === 'hard'
                                ? 'text-rose-600'
                                : q.difficulty === 'medium'
                                ? 'text-amber-600'
                                : 'text-emerald-600'
                            }`}
                          >
                            {q.difficulty}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center font-mono tabular-nums">
                          +{q.marks} / -{q.negative_marks}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleEditQuestion(q)}
                              className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-slate-100 rounded-md transition-colors"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteQuestion(q.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: MOCK TESTS */}
      {currentTab === 'tests' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200">
            <span className="text-xs text-slate-500">
              {tests.length} {isMr ? 'चाचण्या सक्रिय' : 'mock tests configured'}
            </span>
            <button
              onClick={handleOpenAddTest}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{isMr ? 'नवीन चाचणी तयार करा' : 'Create Test'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tests.map(test => (
              <div key={test.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 font-marathi">
                      {isMr ? test.title_mr : test.title_en}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {test.price === 0 ? 'Free Starter Test' : `Price: ₹${test.price}`}
                    </p>
                  </div>
                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                      test.is_published ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {test.is_published ? 'Published' : 'Draft'}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-500 pt-2 border-t border-slate-100">
                  <span>{test.duration_minutes} mins</span>
                  <span aria-hidden="true">·</span>
                  <span>{test.total_marks} Marks</span>
                  <span aria-hidden="true">·</span>
                  <span>{test.question_count || 0} Questions</span>
                  <span aria-hidden="true">·</span>
                  <span>1/4 Negative</span>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    onClick={() => handleDeleteTest(test.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: PROMO CODES */}
      {currentTab === 'promos' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200">
            <span className="text-xs text-slate-500">
              {promos.length} {isMr ? 'सक्रिय कूपन्स' : 'promo codes available'}
            </span>
            <button
              onClick={() => setShowPromoModal(true)}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{isMr ? 'नवीन कूपन जोडा' : 'Add Promo Code'}</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">{isMr ? 'कूपन कोड' : 'Coupon Code'}</th>
                  <th className="py-3 px-4">{isMr ? 'सूट मूल्य' : 'Discount'}</th>
                  <th className="py-3 px-4">{isMr ? 'किमान ऑर्डर' : 'Min Order'}</th>
                  <th className="py-3 px-4">{isMr ? 'वापर मर्यादा' : 'Usage'}</th>
                  <th className="py-3 px-4">{isMr ? 'अंतिम तारीख' : 'Valid Until'}</th>
                  <th className="py-3 px-4 text-right">{isMr ? 'क्रिया' : 'Action'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {promos.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-mono font-bold text-amber-800">{p.code}</td>
                    <td className="py-3 px-4 font-semibold text-slate-800">
                      {p.discount_type === 'percentage' ? `${p.discount_value}%` : `₹${p.discount_value}`}
                    </td>
                    <td className="py-3 px-4 font-mono tabular-nums">₹{p.min_order_amount}</td>
                    <td className="py-3 px-4 font-mono tabular-nums">
                      {p.times_used} / {p.usage_limit || '∞'}
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {new Date(p.valid_until).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDeletePromo(p.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: PAYMENTS AUDIT LEDGER */}
      {currentTab === 'payments' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {isMr ? 'Razorpay सर्व्हर-व्हेरिफाइड ट्रान्झॅक्शन्स' : 'Razorpay Verified Payments'}
              </h3>
              <p className="text-xs text-slate-500">
                {isMr ? 'सर्व व्यवहारांचे HMAC SHA256 डिजिटल ऑडिट' : 'Complete HMAC SHA-256 verified transaction audit ledger'}
              </p>
            </div>
            <span className="font-mono text-sm font-bold text-amber-700 tabular-nums">
              {payments.filter(p => p.status === 'paid').length} Paid Orders
            </span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                    <th className="py-3 px-4">Order / Payment ID</th>
                    <th className="py-3 px-4">{isMr ? 'विद्यार्थी' : 'Student'}</th>
                    <th className="py-3 px-4">{isMr ? 'चाचणी' : 'Test'}</th>
                    <th className="py-3 px-4 text-right">{isMr ? 'रक्कम' : 'Amount'}</th>
                    <th className="py-3 px-4">{isMr ? 'कूपन' : 'Promo'}</th>
                    <th className="py-3 px-4">{isMr ? 'स्थिती' : 'Status'}</th>
                    <th className="py-3 px-4">{isMr ? 'वेळ' : 'Verified At'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payments.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-700">
                        <div>{p.razorpay_order_id}</div>
                        {p.razorpay_payment_id && (
                          <div className="text-slate-400 text-[10px]">{p.razorpay_payment_id}</div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{p.user_name || 'Student'}</div>
                        <div className="text-slate-500 text-[11px]">{p.user_email}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-800 font-medium max-w-xs truncate">
                        {p.test_title || p.test_id}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 tabular-nums">
                        ₹{p.amount.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-500">
                        {p.promo_code || '—'}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-md font-semibold text-[10px] uppercase ${
                            p.status === 'paid'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500 text-[11px]">
                        {p.verified_at ? new Date(p.verified_at).toLocaleTimeString() : 'Pending'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: BACKUPS, HEALTH & OPERATIONS */}
      {currentTab === 'backups' && (
        <div className="space-y-6">
          {/* System Health Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Activity className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">
                  {isMr ? 'सिस्टम आरोग्य स्थिती (Health Check API: /api/health)' : 'System Health Status (/api/health)'}
                </h3>
              </div>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>{healthData?.status || 'Active'}</span>
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-500 block">Uptime</span>
                <span className="font-mono font-bold text-slate-900 mt-1 block">
                  {Math.floor((healthData?.uptimeSeconds || 0) / 60)} mins
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-500 block">Database Status</span>
                <span className="font-mono font-bold text-emerald-700 mt-1 block">
                  {healthData?.database?.status || 'Connected'}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-500 block">Razorpay Verification</span>
                <span className="font-mono font-bold text-slate-900 mt-1 block">
                  {healthData?.razorpay?.configured ? 'Live Gateway' : 'HMAC Test Mode'}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-500 block">Memory RSS</span>
                <span className="font-mono font-bold text-slate-900 mt-1 block">
                  {healthData?.memory?.rssMb || 64} MB
                </span>
              </div>
            </div>
          </div>

          {/* Backup & Restore Deck */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3">
              <div className="flex items-center gap-2">
                <Download className="w-5 h-5 text-amber-600" />
                <h4 className="text-base font-bold text-slate-900">
                  {isMr ? '१-क्लिक संपूर्ण डेटाबेस बॅकअप (JSON)' : 'Instant 1-Click JSON Backup'}
                </h4>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {isMr
                  ? 'सर्व प्रश्न, सराव चाचण्या, विद्यार्थी प्रयत्न, प्रोमो कोड्स आणि पेमेंट रेकॉर्ड्सचा संपूर्ण बॅकअप डाऊनलोड करा.'
                  : 'Download complete state snapshot of questions, mock tests, promo codes, student attempts, and payment records.'}
              </p>
              <div className="pt-2">
                <button
                  onClick={handleExportBackup}
                  className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  <Download className="w-4 h-4" />
                  <span>{isMr ? 'बॅकअप फाईल डाऊनलोड करा' : 'Download Backup JSON'}</span>
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-amber-600" />
                <h4 className="text-base font-bold text-slate-900">
                  {isMr ? 'बॅकअप वरून पूर्ववत करा (Restore)' : 'Restore Database from Backup'}
                </h4>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {isMr
                  ? 'पूर्वी डाऊनलोड केलेली बॅकअप JSON फाईल अपलोड करून डेटा पूर्ववत करा.'
                  : 'Upload an existing JSON backup to restore questions and platform configuration.'}
              </p>
              <div className="pt-2">
                <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs rounded-xl transition-colors cursor-pointer shadow-xs">
                  <Upload className="w-4 h-4" />
                  <span>{isMr ? 'बॅकअप फाईल निवडा' : 'Select Backup JSON File'}</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleRestoreFile}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QUESTION FORM MODAL */}
      {showQuestionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 my-8 space-y-5 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-slate-900">
              {editingQuestionId
                ? (isMr ? 'प्रश्न संपादित करा' : 'Edit Question')
                : (isMr ? 'नवीन प्रश्न जोडा (Bilingual MPSC)' : 'Add New Question (Bilingual)')}
            </h3>

            <form onSubmit={handleSaveQuestion} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Exam</label>
                  <select
                    value={qFormData.exam_id}
                    onChange={e => setQFormData({ ...qFormData, exam_id: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                  >
                    {exams.map(e => (
                      <option key={e.id} value={e.id}>{e.title_en}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Subject</label>
                  <select
                    value={qFormData.subject_id}
                    onChange={e => setQFormData({ ...qFormData, subject_id: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                  >
                    {subjects.map(s => (
                      <option key={s.id} value={s.id}>{s.name_en}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Question Marathi & English */}
              <div>
                <label className="font-semibold text-slate-700 block mb-1">मराठी प्रश्न (Marathi Question Text)</label>
                <textarea
                  rows={2}
                  required
                  placeholder="उदा. कोणत्या घटनादुरुस्ती अन्वये पंचायत राज..."
                  value={qFormData.question_mr}
                  onChange={e => setQFormData({ ...qFormData, question_mr: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-marathi"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">English Question Text</label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g. Under which Constitutional Amendment Act..."
                  value={qFormData.question_en}
                  onChange={e => setQFormData({ ...qFormData, question_en: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              {/* Options */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <span className="font-bold text-slate-900 block">4 Options (Select correct radio)</span>
                {qFormData.options.map((opt, oIdx) => (
                  <div key={oIdx} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200">
                    <input
                      type="radio"
                      name="correct_option"
                      checked={opt.is_correct}
                      onChange={() => {
                        const updated = qFormData.options.map((o, i) => ({
                          ...o,
                          is_correct: i === oIdx
                        }));
                        setQFormData({ ...qFormData, options: updated });
                      }}
                      className="cursor-pointer"
                    />
                    <span className="font-bold font-mono text-slate-600">{opt.option_key}</span>
                    <input
                      type="text"
                      placeholder="मराठी पर्याय"
                      required
                      value={opt.text_mr}
                      onChange={e => {
                        const updated = [...qFormData.options];
                        updated[oIdx].text_mr = e.target.value;
                        setQFormData({ ...qFormData, options: updated });
                      }}
                      className="flex-1 p-1.5 bg-white border border-slate-200 rounded font-marathi text-xs"
                    />
                    <input
                      type="text"
                      placeholder="English Option"
                      required
                      value={opt.text_en}
                      onChange={e => {
                        const updated = [...qFormData.options];
                        updated[oIdx].text_en = e.target.value;
                        setQFormData({ ...qFormData, options: updated });
                      }}
                      className="flex-1 p-1.5 bg-white border border-slate-200 rounded text-xs"
                    />
                  </div>
                ))}
              </div>

              {/* Explanations */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">मराठी स्पष्टीकरण (Explanation)</label>
                  <textarea
                    rows={2}
                    value={qFormData.explanation_mr}
                    onChange={e => setQFormData({ ...qFormData, explanation_mr: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-marathi"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">English Explanation</label>
                  <textarea
                    rows={2}
                    value={qFormData.explanation_en}
                    onChange={e => setQFormData({ ...qFormData, explanation_en: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowQuestionModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg font-semibold text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold cursor-pointer"
                >
                  Save Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PROMO CODE MODAL */}
      {showPromoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              {isMr ? 'नवीन प्रोमो कोड तयार करा' : 'Create New Promo Code'}
            </h3>

            <form onSubmit={handleSavePromo} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Promo Code (e.g. DIWALI50)</label>
                <input
                  type="text"
                  required
                  value={promoFormData.code}
                  onChange={e => setPromoFormData({ ...promoFormData, code: e.target.value.toUpperCase() })}
                  className="w-full p-2 border border-slate-200 rounded-lg uppercase font-mono font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Discount Type</label>
                  <select
                    value={promoFormData.discount_type}
                    onChange={e => setPromoFormData({ ...promoFormData, discount_type: e.target.value as any })}
                    className="w-full p-2 border border-slate-200 rounded-lg"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Discount Value</label>
                  <input
                    type="number"
                    required
                    value={promoFormData.discount_value}
                    onChange={e => setPromoFormData({ ...promoFormData, discount_value: Number(e.target.value) })}
                    className="w-full p-2 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Min Order (₹)</label>
                  <input
                    type="number"
                    value={promoFormData.min_order_amount}
                    onChange={e => setPromoFormData({ ...promoFormData, min_order_amount: Number(e.target.value) })}
                    className="w-full p-2 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Usage Limit</label>
                  <input
                    type="number"
                    value={promoFormData.usage_limit}
                    onChange={e => setPromoFormData({ ...promoFormData, usage_limit: Number(e.target.value) })}
                    className="w-full p-2 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Valid Until</label>
                <input
                  type="date"
                  required
                  value={promoFormData.valid_until}
                  onChange={e => setPromoFormData({ ...promoFormData, valid_until: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowPromoModal(false)}
                  className="px-4 py-2 bg-slate-100 rounded-lg font-semibold text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold cursor-pointer"
                >
                  Create Promo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE TEST MODAL */}
      {showTestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 my-8 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-slate-900">
              {isMr ? 'नवीन सराव चाचणी तयार करा' : 'Create New Mock Test'}
            </h3>

            <form onSubmit={handleSaveTest} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Exam Category</label>
                <select
                  value={testFormData.exam_id}
                  onChange={e => setTestFormData({ ...testFormData, exam_id: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-lg"
                >
                  {exams.map(ex => (
                    <option key={ex.id} value={ex.id}>{ex.title_en}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">मराठी शीर्षक (Marathi Title)</label>
                <input
                  type="text"
                  required
                  placeholder="उदा. राज्यसेवा पूर्व परीक्षा सराव टेस्ट..."
                  value={testFormData.title_mr}
                  onChange={e => setTestFormData({ ...testFormData, title_mr: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-lg font-marathi"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">English Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MPSC Rajyaseva Prelims Full Mock #2"
                  value={testFormData.title_en}
                  onChange={e => setTestFormData({ ...testFormData, title_en: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Duration (mins)</label>
                  <input
                    type="number"
                    value={testFormData.duration_minutes}
                    onChange={e => setTestFormData({ ...testFormData, duration_minutes: Number(e.target.value) })}
                    className="w-full p-2 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Total Marks</label>
                  <input
                    type="number"
                    value={testFormData.total_marks}
                    onChange={e => setTestFormData({ ...testFormData, total_marks: Number(e.target.value) })}
                    className="w-full p-2 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Price (₹, 0=Free)</label>
                  <input
                    type="number"
                    value={testFormData.price}
                    onChange={e => setTestFormData({ ...testFormData, price: Number(e.target.value) })}
                    className="w-full p-2 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div className="pt-2">
                <span className="font-semibold text-slate-700 block mb-1">Select Questions to Include</span>
                <div className="max-h-36 overflow-y-auto border border-slate-200 rounded-lg p-2 space-y-1.5">
                  {questions.map(q => {
                    const isChecked = testFormData.question_ids.includes(q.id);
                    return (
                      <label key={q.id} className="flex items-center gap-2 p-1 hover:bg-slate-50 rounded cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            if (isChecked) {
                              setTestFormData({
                                ...testFormData,
                                question_ids: testFormData.question_ids.filter(id => id !== q.id)
                              });
                            } else {
                              setTestFormData({
                                ...testFormData,
                                question_ids: [...testFormData.question_ids, q.id]
                              });
                            }
                          }}
                        />
                        <span className="font-marathi truncate">{q.question_mr}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowTestModal(false)}
                  className="px-4 py-2 bg-slate-100 rounded-lg font-semibold text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold cursor-pointer"
                >
                  Save Test
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PACKAGE MANAGEMENT & TEST REORDERING MODAL */}
      {showPackageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 my-8 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {editingPackageId
                    ? (isMr ? 'पॅकेज संपादित करा व टेस्ट्सचा क्रम बदला' : 'Edit Package & Rearrange Tests')
                    : (isMr ? 'नवीन टेस्ट पॅकेज तयार करा' : 'Create New Mock Test Package')}
                </h3>
                <p className="text-xs text-slate-500">
                  {isMr ? 'पॅकेज तपशील आणि समाविष्ट चाचण्यांची रचना' : 'Configure package metadata and organize mock tests'}
                </p>
              </div>
            </div>

            <form onSubmit={handleSavePackage} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    {isMr ? 'परीक्षेचा वर्ग (Exam Category)' : 'Exam Category'}
                  </label>
                  <select
                    value={packageFormData.exam_id}
                    onChange={e => setPackageFormData({ ...packageFormData, exam_id: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg bg-slate-50"
                  >
                    {exams.map(ex => (
                      <option key={ex.id} value={ex.id}>{ex.title_en}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    {isMr ? 'वैधता कालावधी (दिवस)' : 'Validity Period (Days)'}
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="180 or 365"
                    value={packageFormData.validity_days}
                    onChange={e => setPackageFormData({ ...packageFormData, validity_days: Number(e.target.value) })}
                    className="w-full p-2 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  {isMr ? 'पॅकेजचे मराठी नाव (Name in Marathi)' : 'Package Marathi Name'}
                </label>
                <input
                  type="text"
                  required
                  placeholder="उदा. एमपीएससी गट-क सर्वसमावेशक टेस्ट सिरीज महा-पॅकेज (३५+ पेपर्स)"
                  value={packageFormData.name_mr}
                  onChange={e => setPackageFormData({ ...packageFormData, name_mr: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-lg font-marathi"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  {isMr ? 'पॅकेजचे इंग्रजी नाव (Name in English)' : 'Package English Name'}
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MPSC Group C Complete Mock Test Package (35+ Tests)"
                  value={packageFormData.name_en}
                  onChange={e => setPackageFormData({ ...packageFormData, name_en: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    {isMr ? 'मराठी वर्णन' : 'Description (Marathi)'}
                  </label>
                  <textarea
                    rows={2}
                    value={packageFormData.description_mr}
                    onChange={e => setPackageFormData({ ...packageFormData, description_mr: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg font-marathi"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    {isMr ? 'इंग्रजी वर्णन' : 'Description (English)'}
                  </label>
                  <textarea
                    rows={2}
                    value={packageFormData.description_en}
                    onChange={e => setPackageFormData({ ...packageFormData, description_en: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    {isMr ? 'मूळ मूल्य MRP (₹)' : 'MRP Price (₹)'}
                  </label>
                  <input
                    type="number"
                    required
                    value={packageFormData.price}
                    onChange={e => setPackageFormData({ ...packageFormData, price: Number(e.target.value) })}
                    className="w-full p-2 border border-slate-200 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    {isMr ? 'ऑफर / सवलत मूल्य (₹)' : 'Discount Price (₹)'}
                  </label>
                  <input
                    type="number"
                    required
                    value={packageFormData.discount_price}
                    onChange={e => setPackageFormData({ ...packageFormData, discount_price: Number(e.target.value) })}
                    className="w-full p-2 border border-slate-200 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    {isMr ? 'स्थिती (Status)' : 'Status'}
                  </label>
                  <label className="flex items-center gap-2 p-2 border border-slate-200 rounded-lg cursor-pointer bg-slate-50">
                    <input
                      type="checkbox"
                      checked={packageFormData.is_published}
                      onChange={e => setPackageFormData({ ...packageFormData, is_published: e.target.checked })}
                    />
                    <span className="font-semibold">Published</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  {isMr ? 'बॅनर इमेज URL' : 'Banner Image URL'}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={packageFormData.image_url}
                    onChange={e => setPackageFormData({ ...packageFormData, image_url: e.target.value })}
                    className="flex-1 p-2 border border-slate-200 rounded-lg text-xs"
                    placeholder="https://..."
                  />
                </div>
                {/* Image Presets */}
                <div className="flex items-center gap-1.5 pt-1.5 text-[11px] text-slate-500">
                  <span>Presets:</span>
                  <button
                    type="button"
                    onClick={() => setPackageFormData({ ...packageFormData, image_url: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&auto=format&fit=crop&q=80' })}
                    className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 rounded cursor-pointer"
                  >
                    Group C Study
                  </button>
                  <button
                    type="button"
                    onClick={() => setPackageFormData({ ...packageFormData, image_url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80' })}
                    className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 rounded cursor-pointer"
                  >
                    Technical / AMVI
                  </button>
                  <button
                    type="button"
                    onClick={() => setPackageFormData({ ...packageFormData, image_url: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&auto=format&fit=crop&q=80' })}
                    className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 rounded cursor-pointer"
                  >
                    Rajyaseva Books
                  </button>
                </div>
              </div>

              {/* INCLUDED TESTS & EASY REORDERING SECTION */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-900 block">
                    {isMr
                      ? `पॅकेजमधील चाचण्यांचा क्रम (${packageFormData.test_ids.length} चाचण्या समाविष्ट)`
                      : `Included Mock Tests & Sequence Order (${packageFormData.test_ids.length} Tests)`}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {isMr ? 'क्रम बदलण्यासाठी ↑ किंवा ↓ दाबा' : 'Use ↑ or ↓ to rearrange order'}
                  </span>
                </div>

                {/* Ordered List of Tests in Package */}
                <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-xl p-2 space-y-1.5 bg-slate-50/50">
                  {packageFormData.test_ids.length === 0 ? (
                    <div className="text-center py-6 text-slate-400 text-xs">
                      {isMr ? 'या पॅकेजमध्ये कोणतीही टेस्ट जोडलेली नाही. खालील यादीतून टेस्ट्स जोडा.' : 'No tests added yet. Select tests below to include.'}
                    </div>
                  ) : (
                    packageFormData.test_ids.map((tId, idx) => {
                      const testObj = tests.find(t => t.id === tId);
                      return (
                        <div
                          key={tId}
                          className="flex items-center justify-between gap-2 p-2 bg-white rounded-lg border border-slate-200 shadow-2xs"
                        >
                          <div className="flex items-center gap-2 flex-1 truncate">
                            <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold flex items-center justify-center shrink-0">
                              {idx + 1}
                            </span>
                            <span className="font-semibold text-slate-800 font-marathi truncate">
                              {testObj ? (isMr ? testObj.title_mr : testObj.title_en) : tId}
                            </span>
                            <span className="text-slate-400 text-[10px] shrink-0">
                              ({testObj?.duration_minutes || 60}m · {testObj?.total_marks || 100}M)
                            </span>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleMoveTestUp(idx)}
                              disabled={idx === 0}
                              className="p-1 text-slate-500 hover:text-slate-900 disabled:opacity-30 hover:bg-slate-100 rounded cursor-pointer"
                              title="Move Up"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveTestDown(idx)}
                              disabled={idx === packageFormData.test_ids.length - 1}
                              className="p-1 text-slate-500 hover:text-slate-900 disabled:opacity-30 hover:bg-slate-100 rounded cursor-pointer"
                              title="Move Down"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveTestFromPackage(tId)}
                              className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded cursor-pointer ml-1"
                              title="Remove from package"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Add Available Tests to Package */}
                <div className="pt-2">
                  <span className="font-semibold text-slate-700 block mb-1">
                    {isMr ? 'उपलब्ध चाचण्यांमधून आणखी चाचण्या पॅकेजमध्ये जोडा:' : 'Add Available Tests into Package:'}
                  </span>
                  <div className="flex items-center gap-2">
                    <select
                      id="package-test-picker"
                      className="flex-1 p-2 border border-slate-200 rounded-lg text-xs bg-white"
                      defaultValue=""
                    >
                      <option value="" disabled>
                        {isMr ? 'चाचणी निवडा...' : 'Select a mock test to add...'}
                      </option>
                      {tests
                        .filter(t => !packageFormData.test_ids.includes(t.id))
                        .map(t => (
                          <option key={t.id} value={t.id}>
                            {t.title_en} ({t.title_mr})
                          </option>
                        ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => {
                        const selectEl = document.getElementById('package-test-picker') as HTMLSelectElement;
                        if (selectEl && selectEl.value) {
                          handleAddTestToPackage(selectEl.value);
                          selectEl.value = '';
                        }
                      }}
                      className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg text-xs cursor-pointer"
                    >
                      {isMr ? 'पॅकेजमध्ये जोडा +' : 'Add to Package +'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowPackageModal(false)}
                  className="px-4 py-2 bg-slate-100 rounded-lg font-semibold text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold cursor-pointer shadow-xs"
                >
                  {isMr ? 'पॅकेज सेव्ह करा' : 'Save Package'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
