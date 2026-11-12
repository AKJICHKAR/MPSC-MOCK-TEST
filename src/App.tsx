/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { User, MockTest, TestResult, TestAttempt, TestPackage } from './types';
import { api, getStoredToken } from './services/api';
import { Navbar } from './components/Navbar';
import { StudentDashboard } from './components/StudentDashboard';
import { ExamEngine } from './components/ExamEngine';
import { TestResultView } from './components/TestResultView';
import { CheckoutModal } from './components/CheckoutModal';
import { AdminDashboard } from './components/AdminDashboard';
import { AuthModal } from './components/AuthModal';
import { DocumentationModal } from './components/DocumentationModal';
import { Loader2 } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [language, setLanguage] = useState<'en' | 'mr'>('mr'); // Default Marathi
  const [activeTab, setActiveTab] = useState<string>('tests');
  const [loadingUser, setLoadingUser] = useState<boolean>(true);

  // Active Test Engine & Results State
  const [activeExamSession, setActiveExamSession] = useState<{
    test: MockTest;
    attemptId: string;
  } | null>(null);

  const [activeResult, setActiveResult] = useState<{
    result: TestResult;
    test: MockTest;
    attempt?: TestAttempt;
  } | null>(null);

  // Modals
  const [checkoutTest, setCheckoutTest] = useState<MockTest | null>(null);
  const [checkoutPackage, setCheckoutPackage] = useState<TestPackage | null>(null);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [showDocsModal, setShowDocsModal] = useState<boolean>(false);

  // Check auth on mount
  useEffect(() => {
    checkCurrentUser();
  }, []);

  const checkCurrentUser = async () => {
    setLoadingUser(true);
    try {
      const token = getStoredToken();
      if (token) {
        const res = await api.getMe();
        setUser(res.user);
      } else {
        // Pre-authenticate as demo student so preview is instantly interactive without typing
        const loginRes = await api.login('student@mpsc.gov', 'student123');
        setUser(loginRes.user);
      }
    } catch (err) {
      console.warn('Initial session check note:', err);
    } finally {
      setLoadingUser(false);
    }
  };

  const handleLogout = () => {
    api.logout();
    setUser(null);
    setActiveTab('tests');
  };

  const handleQuickSwitchRole = async (targetRole: 'admin' | 'student') => {
    setLoadingUser(true);
    try {
      if (targetRole === 'admin') {
        const res = await api.login('admin@mpsc.gov', 'admin123');
        setUser(res.user);
        setActiveTab('admin_stats');
      } else {
        const res = await api.login('student@mpsc.gov', 'student123');
        setUser(res.user);
        setActiveTab('tests');
      }
      // Exit test or result if open
      setActiveExamSession(null);
      setActiveResult(null);
    } catch (err) {
      console.error('Failed to switch role:', err);
    } finally {
      setLoadingUser(false);
    }
  };

  // Start a mock test attempt
  const handleStartTest = async (test: MockTest) => {
    try {
      if (!user) {
        setShowAuthModal(true);
        return;
      }
      const data = await api.startAttempt(test.id);
      setActiveExamSession({
        test: data.test,
        attemptId: data.attempt.id
      });
      setActiveResult(null);
    } catch (err: any) {
      if (err.message.includes('enroll') || err.message.includes('purchase')) {
        setCheckoutTest(test);
      } else {
        alert('Could not start test: ' + err.message);
      }
    }
  };

  // When test is submitted
  const handleTestSubmitted = async (result: TestResult) => {
    if (activeExamSession) {
      try {
        const res = await api.getAttemptResult(result.attempt_id);
        setActiveResult({
          result: res.result,
          test: res.test,
          attempt: res.attempt
        });
      } catch {
        setActiveResult({
          result,
          test: activeExamSession.test
        });
      }
    }
    setActiveExamSession(null);
  };

  const handleViewResult = async (attemptId: string) => {
    try {
      const res = await api.getAttemptResult(attemptId);
      setActiveResult({
        result: res.result,
        test: res.test,
        attempt: res.attempt
      });
      setActiveExamSession(null);
    } catch (err: any) {
      alert('Could not fetch result details: ' + err.message);
    }
  };

  if (loadingUser) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center space-y-3">
        <div className="w-12 h-12 rounded-xl bg-amber-600 text-white font-bold text-2xl flex items-center justify-center shadow-xs">
          म
        </div>
        <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
          <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
          <span>MPSC Sarathi Engine लोड होत आहे...</span>
        </div>
      </div>
    );
  }

  // If student is currently taking an exam, render exam engine in fullscreen layout
  if (activeExamSession) {
    return (
      <ExamEngine
        test={activeExamSession.test}
        attemptId={activeExamSession.attemptId}
        initialLanguage={language}
        onTestSubmitted={handleTestSubmitted}
        onExit={() => setActiveExamSession(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Universal Top Bar */}
      <Navbar
        user={user}
        activeTab={activeTab}
        setActiveTab={tab => {
          setActiveTab(tab);
          setActiveResult(null);
        }}
        language={language}
        setLanguage={setLanguage}
        onOpenAuth={() => setShowAuthModal(true)}
        onLogout={handleLogout}
        onQuickSwitchRole={handleQuickSwitchRole}
        onOpenDocs={() => setShowDocsModal(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* If viewing a completed scorecard */}
        {activeResult ? (
          <TestResultView
            result={activeResult.result}
            test={activeResult.test}
            attempt={activeResult.attempt}
            language={language}
            onBackToDashboard={() => setActiveResult(null)}
            onRetakeTest={() => {
              setActiveResult(null);
              handleStartTest(activeResult.test);
            }}
          />
        ) : user?.role === 'admin' ? (
          <AdminDashboard
            language={language}
            initialTab={activeTab}
          />
        ) : (
          <StudentDashboard
            language={language}
            onStartTest={handleStartTest}
            onOpenCheckout={test => setCheckoutTest(test)}
            onOpenPackageCheckout={pkg => setCheckoutPackage(pkg)}
            onViewResult={handleViewResult}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 px-4 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">MPSC Sarathi v1.0</span>
            <span aria-hidden="true">·</span>
            <span>{language === 'mr' ? 'महाराष्ट्र लोकसेवा आयोग सराव मंच' : 'Maharashtra Public Service Commission Portal'}</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowDocsModal(true)}
              className="hover:text-slate-900 transition-colors cursor-pointer"
            >
              {language === 'mr' ? 'प्लॅटफॉर्म गाईड व दस्तऐवजीकरण' : 'Documentation & Setup Guide'}
            </button>
            <span aria-hidden="true">·</span>
            <span>Razorpay Verified</span>
            <span aria-hidden="true">·</span>
            <span>Supabase Ready</span>
          </div>
        </div>
      </footer>

      {/* Individual Test Checkout Modal */}
      {checkoutTest && (
        <CheckoutModal
          test={checkoutTest}
          language={language}
          onClose={() => setCheckoutTest(null)}
          onSuccess={() => {
            const currentTest = checkoutTest;
            setCheckoutTest(null);
            // Auto start test after unlock
            handleStartTest(currentTest);
          }}
        />
      )}

      {/* Complete Package Checkout Modal */}
      {checkoutPackage && (
        <CheckoutModal
          packageItem={checkoutPackage}
          language={language}
          onClose={() => setCheckoutPackage(null)}
          onSuccess={() => {
            setCheckoutPackage(null);
            // Stay on tests tab to see newly unlocked package tests
            setActiveTab('tests');
          }}
        />
      )}

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal
          language={language}
          onClose={() => setShowAuthModal(false)}
          onSuccess={loggedInUser => {
            setUser(loggedInUser);
            setShowAuthModal(false);
            if (loggedInUser.role === 'admin') {
              setActiveTab('admin_stats');
            } else {
              setActiveTab('tests');
            }
          }}
        />
      )}

      {/* Documentation Modal */}
      {showDocsModal && (
        <DocumentationModal
          language={language}
          onClose={() => setShowDocsModal(false)}
        />
      )}
    </div>
  );
}
