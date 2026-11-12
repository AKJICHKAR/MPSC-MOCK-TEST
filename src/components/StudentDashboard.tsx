import React, { useState, useEffect } from 'react';
import { MockTest, TestPackage, TestResult } from '../types';
import { api } from '../services/api';
import {
  BookOpen,
  Award,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  TrendingUp,
  RotateCcw,
  Tag,
  Layers,
  Calendar,
  Eye,
  X,
  FileCheck2
} from 'lucide-react';

interface StudentDashboardProps {
  language: 'en' | 'mr';
  onStartTest: (test: MockTest) => void;
  onOpenCheckout: (test: MockTest) => void;
  onOpenPackageCheckout: (pkg: TestPackage) => void;
  onViewResult: (attemptId: string) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  language,
  onStartTest,
  onOpenCheckout,
  onOpenPackageCheckout,
  onViewResult
}) => {
  const isMr = language === 'mr';
  const [activeCatalogView, setActiveCatalogView] = useState<'packages' | 'tests'>('packages');
  const [packages, setPackages] = useState<(TestPackage & { is_enrolled?: boolean })[]>([]);
  const [tests, setTests] = useState<(MockTest & { is_enrolled?: boolean })[]>([]);
  const [results, setResults] = useState<TestResult[]>([]);
  const [stats, setStats] = useState({
    totalEnrolled: 0,
    totalPackages: 0,
    totalAttempts: 0,
    avgScore: 0,
    highestScore: 0
  });
  const [selectedExamFilter, setSelectedExamFilter] = useState<string>('all');
  const [selectedPackageForModal, setSelectedPackageForModal] = useState<TestPackage | null>(null);
  const [packageTestsDetails, setPackageTestsDetails] = useState<MockTest[]>([]);
  const [loadingPackageTests, setLoadingPackageTests] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [packagesData, testsData, dashboardData] = await Promise.all([
        api.getPackages().catch(() => []),
        api.getTests(),
        api.getStudentDashboard().catch(() => ({
          enrolledTests: [],
          enrolledPackages: [],
          results: [],
          stats: { totalEnrolled: 0, totalPackages: 0, totalAttempts: 0, avgScore: 0, highestScore: 0 }
        }))
      ]);

      setPackages(packagesData);
      setTests(testsData);
      setResults(dashboardData.results);
      setStats({
        totalEnrolled: dashboardData.stats?.totalEnrolled || 0,
        totalPackages: dashboardData.enrolledPackages?.length || dashboardData.stats?.totalPackages || 0,
        totalAttempts: dashboardData.stats?.totalAttempts || 0,
        avgScore: dashboardData.stats?.avgScore || 0,
        highestScore: dashboardData.stats?.highestScore || 0
      });
    } catch (err) {
      console.error('Failed to load student dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPackageDetails = async (pkg: TestPackage) => {
    setSelectedPackageForModal(pkg);
    setLoadingPackageTests(true);
    try {
      const res = await api.getPackageById(pkg.id);
      setPackageTestsDetails(res.package.tests || []);
    } catch (err) {
      console.error('Failed to fetch package tests:', err);
    } finally {
      setLoadingPackageTests(false);
    }
  };

  const filteredTests = tests.filter(test => {
    if (selectedExamFilter === 'all') return true;
    if (selectedExamFilter === 'free') return test.price === 0;
    return test.exam_id === selectedExamFilter;
  });

  const filteredPackages = packages.filter(pkg => {
    if (selectedExamFilter === 'all') return true;
    return pkg.exam_id === selectedExamFilter;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 font-sans">
      {/* Student Welcome & Analytics Strip */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-amber-950 text-white rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>{isMr ? 'महाराष्ट्र लोकसेवा आयोग २०२६ सराव' : 'MPSC Exam Preparation 2026'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {isMr ? 'सराव चाचण्या आणि महा-पॅकेजेस' : 'MPSC Mock Tests & Master Packages'}
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              {isMr
                ? 'राज्यसेवा, गट-ब, गट-क व AMVI साठी संपूर्ण पॅकेज खरेदी करा किंवा स्वतंत्र चाचण्या सोडवा. सर्व्हर-व्हेरिफाइड डिजिटल टेस्ट इंजिन.'
                : 'Purchase all-inclusive mock test packages or individual tests with instant server-side Razorpay verification.'}
            </p>
          </div>

          {/* Quick KPIs Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 w-full md:w-auto">
            <div className="bg-white/10 backdrop-blur-xs rounded-xl p-3 border border-white/10 text-center min-w-[90px]">
              <span className="text-[10px] font-medium text-slate-300 uppercase tracking-wider block">
                {isMr ? 'पॅकेजेस' : 'Packages'}
              </span>
              <span className="text-xl font-bold font-mono tabular-nums text-amber-300">{stats.totalPackages}</span>
            </div>
            <div className="bg-white/10 backdrop-blur-xs rounded-xl p-3 border border-white/10 text-center min-w-[90px]">
              <span className="text-[10px] font-medium text-slate-300 uppercase tracking-wider block">
                {isMr ? 'चाचण्या' : 'Enrolled'}
              </span>
              <span className="text-xl font-bold font-mono tabular-nums">{stats.totalEnrolled}</span>
            </div>
            <div className="bg-white/10 backdrop-blur-xs rounded-xl p-3 border border-white/10 text-center min-w-[90px]">
              <span className="text-[10px] font-medium text-slate-300 uppercase tracking-wider block">
                {isMr ? 'प्रयत्न' : 'Attempts'}
              </span>
              <span className="text-xl font-bold font-mono tabular-nums">{stats.totalAttempts}</span>
            </div>
            <div className="bg-white/10 backdrop-blur-xs rounded-xl p-3 border border-white/10 text-center min-w-[90px]">
              <span className="text-[10px] font-medium text-slate-300 uppercase tracking-wider block">
                {isMr ? 'सरासरी' : 'Avg Score'}
              </span>
              <span className="text-xl font-bold font-mono tabular-nums text-amber-300">{stats.avgScore}</span>
            </div>
            <div className="bg-white/10 backdrop-blur-xs rounded-xl p-3 border border-white/10 text-center min-w-[90px]">
              <span className="text-[10px] font-medium text-slate-300 uppercase tracking-wider block">
                {isMr ? 'सर्वोच्च' : 'High Score'}
              </span>
              <span className="text-xl font-bold font-mono tabular-nums text-emerald-300">{stats.highestScore}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Catalog Category Segmented Control: Packages vs Individual Tests */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center p-1 bg-slate-100 rounded-xl text-xs font-bold border border-slate-200">
              <button
                type="button"
                onClick={() => setActiveCatalogView('packages')}
                className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
                  activeCatalogView === 'packages'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>{isMr ? 'टेस्ट पॅकेजेस (Packages)' : 'Test Packages'}</span>
                <span className="text-[10px] bg-black/20 px-1.5 py-0.5 rounded-full">
                  {packages.length}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setActiveCatalogView('tests')}
                className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
                  activeCatalogView === 'tests'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>{isMr ? 'स्वतंत्र चाचण्या (Individual Tests)' : 'Individual Tests'}</span>
                <span className="text-[10px] bg-black/20 px-1.5 py-0.5 rounded-full">
                  {tests.length}
                </span>
              </button>
            </div>
          </div>

          {/* Exam Filter Chips */}
          <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs font-semibold">
            <button
              onClick={() => setSelectedExamFilter('all')}
              className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                selectedExamFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {isMr ? 'सर्व (All)' : 'All'}
            </button>
            <button
              onClick={() => setSelectedExamFilter('exam_combine_c')}
              className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                selectedExamFilter === 'exam_combine_c' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {isMr ? 'गट-क (Group C)' : 'Group C'}
            </button>
            <button
              onClick={() => setSelectedExamFilter('exam_combine_b')}
              className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                selectedExamFilter === 'exam_combine_b' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {isMr ? 'गट-ब (Group B / AMVI)' : 'Group B / AMVI'}
            </button>
            <button
              onClick={() => setSelectedExamFilter('exam_rajyaseva')}
              className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                selectedExamFilter === 'exam_rajyaseva' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {isMr ? 'राज्यसेवा (Rajyaseva)' : 'Rajyaseva'}
            </button>
          </div>
        </div>

        {/* VIEW 1: TEST PACKAGES */}
        {activeCatalogView === 'packages' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPackages.map(pkg => {
              const isEnrolled = pkg.is_enrolled;
              const discountPercent =
                pkg.price > pkg.discount_price && pkg.discount_price > 0
                  ? Math.round(((pkg.price - pkg.discount_price) / pkg.price) * 100)
                  : 0;

              return (
                <div
                  key={pkg.id}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col justify-between hover:shadow-md transition-all group"
                >
                  <div>
                    {/* Package Header Banner Image / Pattern */}
                    <div className="h-36 bg-gradient-to-r from-amber-800 to-slate-900 relative p-4 flex flex-col justify-between overflow-hidden">
                      {pkg.image_url && (
                        <img
                          src={pkg.image_url}
                          alt={pkg.name_en}
                          referrerPolicy="no-referrer"
                          className="absolute inset-0 w-full h-full object-cover opacity-35 mix-blend-overlay group-hover:scale-105 transition-transform duration-500"
                        />
                      )}
                      <div className="relative z-10 flex items-center justify-between">
                        <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider bg-black/40 backdrop-blur-xs px-2.5 py-1 rounded-md">
                          {pkg.test_count || 10}+ {isMr ? 'सराव चाचण्या' : 'Mock Tests Included'}
                        </span>
                        {discountPercent > 0 && (
                          <span className="text-[11px] font-extrabold text-white bg-rose-600 px-2 py-0.5 rounded-md">
                            {discountPercent}% OFF
                          </span>
                        )}
                      </div>

                      <div className="relative z-10">
                        <span className="text-white text-xs font-semibold flex items-center gap-1.5 opacity-90">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{pkg.validity_days} {isMr ? 'दिवस प्रवेश वैधता' : 'Days Validity'}</span>
                        </span>
                      </div>
                    </div>

                    <div className="p-6 space-y-3">
                      {/* Name */}
                      <h3 className="text-base font-bold text-slate-900 group-hover:text-amber-700 transition-colors line-clamp-2 leading-snug font-marathi">
                        {isMr ? pkg.name_mr : pkg.name_en}
                      </h3>

                      {/* Description */}
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {isMr ? pkg.description_mr : pkg.description_en}
                      </p>

                      {/* Pricing Tag */}
                      <div className="pt-2 flex items-baseline gap-2">
                        <span className="text-2xl font-extrabold text-slate-900 font-mono tabular-nums">
                          ₹{pkg.discount_price > 0 ? pkg.discount_price : pkg.price}
                        </span>
                        {pkg.price > pkg.discount_price && pkg.discount_price > 0 && (
                          <span className="text-xs text-slate-400 line-through font-mono tabular-nums">
                            ₹{pkg.price}
                          </span>
                        )}
                        <span className="text-[11px] text-emerald-700 font-semibold ml-auto">
                          {isMr ? 'एकदा खरेदी · सर्व चाचण्या' : 'All-access Bundle'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="p-6 pt-0 space-y-2">
                    {isEnrolled ? (
                      <div className="w-full py-2.5 px-4 bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5">
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                        <span>{isMr ? 'पॅकेज सक्रिय · सर्व चाचण्या अनलॉक' : 'Package Active · All Tests Unlocked'}</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => onOpenPackageCheckout(pkg)}
                        className="w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                      >
                        <span>
                          {isMr
                            ? `संपूर्ण पॅकेज खरेदी करा (₹${pkg.discount_price > 0 ? pkg.discount_price : pkg.price})`
                            : `Buy Package for ₹${pkg.discount_price > 0 ? pkg.discount_price : pkg.price}`}
                        </span>
                        <ShieldCheck className="w-4 h-4" />
                      </button>
                    )}

                    <button
                      onClick={() => handleOpenPackageDetails(pkg)}
                      className="w-full py-2 px-3 text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{isMr ? 'समाविष्ट चाचण्यांची यादी पहा' : 'View Included Tests'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* VIEW 2: INDIVIDUAL MOCK TESTS */}
        {activeCatalogView === 'tests' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTests.map(test => {
              const isUnlocked = test.is_enrolled || test.price === 0;

              return (
                <div
                  key={test.id}
                  className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between hover:shadow-md transition-all group"
                >
                  <div>
                    {/* Category & Status Bar */}
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
                      <span className="font-semibold text-amber-700">
                        {test.exam_id === 'exam_rajyaseva'
                          ? 'MPSC Rajyaseva'
                          : test.exam_id === 'exam_combine_b'
                          ? 'MPSC Combine B'
                          : 'MPSC Exam'}
                      </span>
                      {isUnlocked ? (
                        <span className="text-emerald-700 font-semibold flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>{isMr ? 'सुलभ प्रवेश' : 'Unlocked'}</span>
                        </span>
                      ) : (
                        <span className="font-mono font-bold text-slate-900 text-sm">
                          ₹{test.price}
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-amber-700 transition-colors line-clamp-2 leading-snug font-marathi">
                      {isMr ? test.title_mr : test.title_en}
                    </h3>

                    {/* Description */}
                    <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                      {isMr ? test.description_mr : test.description_en}
                    </p>

                    {/* Unboxed Metadata */}
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-4 pt-3 border-t border-slate-100">
                      <span>{test.duration_minutes} {isMr ? 'मिनिटे' : 'mins'}</span>
                      <span aria-hidden="true">·</span>
                      <span>{test.total_marks} {isMr ? 'गुण' : 'marks'}</span>
                      <span aria-hidden="true">·</span>
                      <span>{test.question_count || 10} {isMr ? 'प्रश्न' : 'Qns'}</span>
                      <span aria-hidden="true">·</span>
                      <span>1/4 {isMr ? 'पेनल्टी' : 'neg'}</span>
                    </div>
                  </div>

                  {/* Primary Action Button */}
                  <div className="pt-6">
                    {isUnlocked ? (
                      <button
                        onClick={() => onStartTest(test)}
                        className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                      >
                        <span>{isMr ? 'सराव चाचणी सुरू करा' : 'Start Mock Test'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        onClick={() => onOpenCheckout(test)}
                        className="w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                      >
                        <span>{isMr ? `₹${test.price} मध्ये अनलॉक करा (Razorpay)` : `Unlock for ₹${test.price}`}</span>
                        <ShieldCheck className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Recent Attempts & Analysis History */}
      {results.length > 0 && (
        <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-amber-600" />
              <h3 className="text-base font-bold text-slate-900">
                {isMr ? 'मागील सोडवलेल्या चाचण्या' : 'Recent Test Attempts'}
              </h3>
            </div>
            <span className="text-xs text-slate-500 font-medium">
              {results.length} {isMr ? 'चाचण्या नोंदवल्या' : 'attempts recorded'}
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {results.map(res => (
              <div
                key={res.id}
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 px-2 rounded-lg transition-colors"
              >
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    {res.test_id === 'test_mpsc_gs1_full'
                      ? 'MPSC Rajyaseva Prelims GS-1 Mock'
                      : res.test_id === 'test_mpsc_combine_b_mock'
                      ? 'MPSC Combine Group B Prelims Mock'
                      : 'MPSC Mock Test'}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                    <span>
                      {new Date(res.evaluated_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>Rank #{res.rank}</span>
                    <span aria-hidden="true">·</span>
                    <span>Percentile {res.percentile}%</span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-base font-bold text-slate-900 font-mono tabular-nums">
                      {res.net_score} / {res.total_marks}
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium">
                      {res.percentage}% {isMr ? 'गुण' : 'score'}
                    </div>
                  </div>

                  <button
                    onClick={() => onViewResult(res.attempt_id)}
                    className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                  >
                    {isMr ? 'विश्लेषण पहा' : 'View Analysis'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Package Included Tests Details Drawer / Modal */}
      {selectedPackageForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden shadow-2xl border border-slate-100 flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-marathi">
                    {isMr ? selectedPackageForModal.name_mr : selectedPackageForModal.name_en}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {isMr ? 'या पॅकेजमध्ये समाविष्ट असलेल्या चाचण्यांची यादी' : 'Mock Tests Included in this Package'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedPackageForModal(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              {loadingPackageTests ? (
                <div className="text-center py-10 text-xs text-slate-500">Loading tests...</div>
              ) : packageTestsDetails.length === 0 ? (
                <div className="text-center py-10 text-xs text-slate-500">
                  No mock tests linked to this package yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {packageTestsDetails.map((t, idx) => (
                    <div
                      key={t.id}
                      className="p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50"
                    >
                      <div>
                        <div className="flex items-center gap-2 text-[11px] text-amber-700 font-semibold mb-1">
                          <span>Test #{idx + 1}</span>
                          <span aria-hidden="true">·</span>
                          <span>{t.duration_minutes} mins</span>
                          <span aria-hidden="true">·</span>
                          <span>{t.total_marks} Marks</span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 font-marathi">
                          {isMr ? t.title_mr : t.title_en}
                        </h4>
                      </div>

                      {selectedPackageForModal.is_enrolled ? (
                        <button
                          onClick={() => {
                            setSelectedPackageForModal(null);
                            onStartTest(t);
                          }}
                          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
                        >
                          <span>{isMr ? 'सराव सुरू करा' : 'Start Test'}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <span className="text-xs font-semibold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-md shrink-0">
                          {isMr ? 'पॅकेज खरेदीसह उपलब्ध' : 'Included with Bundle'}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between shrink-0 bg-slate-50">
              <div className="text-xs text-slate-600">
                <span>{packageTestsDetails.length} {isMr ? 'चाचण्या समाविष्ट' : 'Tests'}</span>
                <span aria-hidden="true" className="mx-2">·</span>
                <span className="font-bold text-slate-900">
                  ₹{selectedPackageForModal.discount_price > 0 ? selectedPackageForModal.discount_price : selectedPackageForModal.price}
                </span>
              </div>

              {!selectedPackageForModal.is_enrolled && (
                <button
                  onClick={() => {
                    const pkg = selectedPackageForModal;
                    setSelectedPackageForModal(null);
                    onOpenPackageCheckout(pkg);
                  }}
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  {isMr ? 'संपूर्ण पॅकेज खरेदी करा' : 'Unlock Complete Package'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
