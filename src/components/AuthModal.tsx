import React, { useState } from 'react';
import { api } from '../services/api';
import { User } from '../types';
import { X, Lock, Mail, User as UserIcon, Phone, ShieldCheck, Loader2 } from 'lucide-react';

interface AuthModalProps {
  language: 'en' | 'mr';
  onClose: () => void;
  onSuccess: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ language, onClose, onSuccess }) => {
  const isMr = language === 'mr';
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'student' | 'admin'>('student');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === 'login') {
        const res = await api.login(email, password);
        onSuccess(res.user);
      } else {
        const res = await api.register({
          email,
          password,
          full_name: fullName,
          phone,
          role
        });
        onSuccess(res.user);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (userType: 'admin' | 'student') => {
    setLoading(true);
    setError(null);
    try {
      if (userType === 'admin') {
        const res = await api.login('admin@mpsc.gov', 'admin123');
        onSuccess(res.user);
      } else {
        const res = await api.login('student@mpsc.gov', 'student123');
        onSuccess(res.user);
      }
    } catch (err: any) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-100 flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {mode === 'login'
                ? (isMr ? 'लॉग इन करा' : 'Sign in to MPSC Sarathi')
                : (isMr ? 'नवीन विद्यार्थी नोंदणी' : 'Create an Account')}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {isMr ? 'सराव चाचण्या आणि प्रगती ट्रॅकिंग' : 'Access mock tests and syllabus reports'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Quick 1-Click Demo Buttons */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 space-y-2">
            <span className="text-[11px] font-semibold text-slate-500 block uppercase tracking-wider">
              {isMr ? 'त्वरित डेमो प्रवेश (1-Click Switch):' : 'Instant Demo Login:'}
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('student')}
                disabled={loading}
                className="py-1.5 px-3 bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 text-xs font-semibold rounded-lg transition-colors cursor-pointer shadow-2xs"
              >
                {isMr ? 'परीक्षार्थी (Student)' : 'Demo Student'}
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('admin')}
                disabled={loading}
                className="py-1.5 px-3 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 text-xs font-semibold rounded-lg transition-colors cursor-pointer shadow-2xs"
              >
                {isMr ? 'प्रशासक (Admin)' : 'Demo Admin'}
              </button>
            </div>
          </div>

          <div className="flex border-b border-slate-200 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`flex-1 py-2 text-center transition-colors border-b-2 cursor-pointer ${
                mode === 'login'
                  ? 'border-amber-600 text-amber-600 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              {isMr ? 'लॉग इन' : 'Login'}
            </button>
            <button
              type="button"
              onClick={() => setMode('register')}
              className={`flex-1 py-2 text-center transition-colors border-b-2 cursor-pointer ${
                mode === 'register'
                  ? 'border-amber-600 text-amber-600 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              {isMr ? 'नवीन खाते नोंदणी' : 'Register'}
            </button>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            {mode === 'register' && (
              <>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    {isMr ? 'पूर्ण नाव' : 'Full Name'}
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Kulkarni"
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    {isMr ? 'मोबाईल नंबर' : 'Phone Number'}
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="tel"
                      placeholder="+91 98000 00000"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                {isMr ? 'ईमेल पत्ता' : 'Email Address'}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  placeholder="student@mpsc.gov"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                {isMr ? 'पासवर्ड' : 'Password'}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
            </div>

            {mode === 'register' && (
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  {isMr ? 'खाते प्रकार' : 'Account Type'}
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="role"
                      value="student"
                      checked={role === 'student'}
                      onChange={() => setRole('student')}
                    />
                    <span>{isMr ? 'परीक्षार्थी (Student)' : 'Student'}</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="role"
                      value="admin"
                      checked={role === 'admin'}
                      onChange={() => setRole('admin')}
                    />
                    <span>{isMr ? 'प्रशासक (Admin)' : 'Admin'}</span>
                  </label>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>
                {mode === 'login'
                  ? (isMr ? 'प्रवेश करा' : 'Sign In')
                  : (isMr ? 'खाते तयार करा' : 'Create Account')}
              </span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
