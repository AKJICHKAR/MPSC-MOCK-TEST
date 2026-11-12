import React from 'react';
import { User } from '../types';
import { Shield, BookOpen, Award, FileText, LogOut, User as UserIcon, Globe, Sparkles } from 'lucide-react';

interface NavbarProps {
  user: User | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  language: 'en' | 'mr';
  setLanguage: (lang: 'en' | 'mr') => void;
  onOpenAuth: () => void;
  onLogout: () => void;
  onQuickSwitchRole: (role: 'admin' | 'student') => void;
  onOpenDocs: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  activeTab,
  setActiveTab,
  language,
  setLanguage,
  onOpenAuth,
  onLogout,
  onQuickSwitchRole,
  onOpenDocs
}) => {
  const isMr = language === 'mr';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single element brand wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setActiveTab(user?.role === 'admin' ? 'admin_stats' : 'tests')}
              className="flex items-center gap-2.5 text-left group"
            >
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 font-bold text-xl group-hover:bg-amber-500 group-hover:text-white transition-colors">
                म
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold tracking-tight text-slate-900 group-hover:text-amber-700 transition-colors whitespace-nowrap">
                  MPSC Sarathi
                </span>
                <span className="text-[11px] text-slate-500 font-medium">
                  {isMr ? 'महाराष्ट्र लोकसेवा आयोग सराव मंच' : 'Maharashtra MPSC Test Portal'}
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: Navigation Links (single-line, concise) */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            {user?.role === 'admin' ? (
              <>
                <button
                  onClick={() => setActiveTab('admin_stats')}
                  className={`whitespace-nowrap transition-colors ${
                    activeTab === 'admin_stats' ? 'text-amber-600 font-semibold' : 'hover:text-slate-900'
                  }`}
                >
                  {isMr ? 'डॅशबोर्ड सारांश' : 'Dashboard'}
                </button>
                <button
                  onClick={() => setActiveTab('admin_packages')}
                  className={`whitespace-nowrap transition-colors ${
                    activeTab === 'admin_packages' ? 'text-amber-600 font-semibold' : 'hover:text-slate-900'
                  }`}
                >
                  {isMr ? 'पॅकेजेस' : 'Packages'}
                </button>
                <button
                  onClick={() => setActiveTab('admin_questions')}
                  className={`whitespace-nowrap transition-colors ${
                    activeTab === 'admin_questions' ? 'text-amber-600 font-semibold' : 'hover:text-slate-900'
                  }`}
                >
                  {isMr ? 'प्रश्न पेढी (CMS)' : 'Question Bank'}
                </button>
                <button
                  onClick={() => setActiveTab('admin_tests')}
                  className={`whitespace-nowrap transition-colors ${
                    activeTab === 'admin_tests' ? 'text-amber-600 font-semibold' : 'hover:text-slate-900'
                  }`}
                >
                  {isMr ? 'सराव चाचण्या' : 'Mock Tests'}
                </button>
                <button
                  onClick={() => setActiveTab('admin_promos')}
                  className={`whitespace-nowrap transition-colors ${
                    activeTab === 'admin_promos' ? 'text-amber-600 font-semibold' : 'hover:text-slate-900'
                  }`}
                >
                  {isMr ? 'प्रोमो कोड्स' : 'Promo Codes'}
                </button>
                <button
                  onClick={() => setActiveTab('admin_payments')}
                  className={`whitespace-nowrap transition-colors ${
                    activeTab === 'admin_payments' ? 'text-amber-600 font-semibold' : 'hover:text-slate-900'
                  }`}
                >
                  {isMr ? 'पेमेंट्स लेजर' : 'Payments'}
                </button>
                <button
                  onClick={() => setActiveTab('admin_backups')}
                  className={`whitespace-nowrap transition-colors ${
                    activeTab === 'admin_backups' ? 'text-amber-600 font-semibold' : 'hover:text-slate-900'
                  }`}
                >
                  {isMr ? 'बॅकअप व आरोग्य' : 'Health & Backup'}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setActiveTab('tests')}
                  className={`whitespace-nowrap transition-colors ${
                    activeTab === 'tests' ? 'text-amber-600 font-semibold' : 'hover:text-slate-900'
                  }`}
                >
                  {isMr ? 'सर्व सराव चाचण्या' : 'All Mock Tests'}
                </button>
                <button
                  onClick={() => setActiveTab('my_dashboard')}
                  className={`whitespace-nowrap transition-colors ${
                    activeTab === 'my_dashboard' ? 'text-amber-600 font-semibold' : 'hover:text-slate-900'
                  }`}
                >
                  {isMr ? 'माझी कामगिरी' : 'My Dashboard'}
                </button>
                <button
                  onClick={onOpenDocs}
                  className="whitespace-nowrap hover:text-slate-900 transition-colors flex items-center gap-1.5"
                >
                  <FileText className="w-4 h-4 text-slate-400" />
                  {isMr ? 'प्लॅटफॉर्म गाईड' : 'Docs & Setup'}
                </button>
              </>
            )}
          </nav>

          {/* Zone 3: Actions & Controls */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Language Switcher */}
            <div className="flex items-center p-0.5 bg-slate-100 rounded-lg border border-slate-200 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setLanguage('mr')}
                className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap ${
                  language === 'mr'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                मराठी
              </button>
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap ${
                  language === 'en'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                English
              </button>
            </div>

            {/* Quick Demo Switcher */}
            <div className="hidden lg:flex items-center gap-1 p-0.5 bg-slate-100 rounded-lg text-xs">
              <button
                onClick={() => onQuickSwitchRole('student')}
                className={`px-2 py-1 rounded-md transition-colors whitespace-nowrap ${
                  user?.role === 'student' ? 'bg-white text-slate-900 font-medium shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Switch to Student View"
              >
                {isMr ? 'विद्यार्थी दृश्य' : 'Student View'}
              </button>
              <button
                onClick={() => onQuickSwitchRole('admin')}
                className={`px-2 py-1 rounded-md transition-colors whitespace-nowrap ${
                  user?.role === 'admin' ? 'bg-amber-100 text-amber-900 font-medium shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Switch to Admin View"
              >
                {isMr ? 'प्रशासक दृश्य' : 'Admin View'}
              </button>
            </div>

            {/* User Profile or Login */}
            {user ? (
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-xs font-medium text-slate-900 truncate max-w-[130px]">
                    {user.full_name}
                  </span>
                  <span className="text-[10px] text-slate-500 capitalize">
                    {user.role === 'admin' ? (isMr ? 'मुख्य प्रशासक' : 'Administrator') : (isMr ? 'परीक्षार्थी' : 'Aspirant')}
                  </span>
                </div>
                <button
                  onClick={onLogout}
                  title={isMr ? 'लॉग आऊट' : 'Logout'}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="px-4 py-2 text-xs font-semibold text-white bg-amber-600 rounded-lg hover:bg-amber-700 transition-colors whitespace-nowrap"
              >
                {isMr ? 'प्रवेश / नोंदणी' : 'Login / Register'}
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
