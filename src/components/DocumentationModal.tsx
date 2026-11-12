import React, { useState } from 'react';
import { X, Book, Database, ShieldCheck, Tag, HelpCircle, Check, Copy } from 'lucide-react';

interface DocumentationModalProps {
  language: 'en' | 'mr';
  onClose: () => void;
}

export const DocumentationModal: React.FC<DocumentationModalProps> = ({ language, onClose }) => {
  const isMr = language === 'mr';
  const [activeSection, setActiveSection] = useState<'overview' | 'supabase' | 'razorpay' | 'promos' | 'troubleshoot'>('overview');
  const [copied, setCopied] = useState(false);

  const supabaseSql = `-- Supabase / PostgreSQL Tables Quick Setup
CREATE TABLE IF NOT EXISTS exams (id VARCHAR(64) PRIMARY KEY, code VARCHAR(32), title_en TEXT, title_mr TEXT);
CREATE TABLE IF NOT EXISTS subjects (id VARCHAR(64) PRIMARY KEY, exam_id VARCHAR(64), name_en TEXT, name_mr TEXT);
CREATE TABLE IF NOT EXISTS questions (id UUID PRIMARY KEY, exam_id VARCHAR(64), question_en TEXT, question_mr TEXT, marks NUMERIC);
CREATE TABLE IF NOT EXISTS tests (id VARCHAR(64) PRIMARY KEY, title_en TEXT, title_mr TEXT, duration_minutes INT, price NUMERIC);
CREATE TABLE IF NOT EXISTS payments (id UUID PRIMARY KEY, razorpay_order_id TEXT, razorpay_payment_id TEXT, status TEXT);
-- Full script available in supabase_schema.sql`;

  const handleCopySql = () => {
    navigator.clipboard.writeText(supabaseSql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-3xl w-full h-[85vh] overflow-hidden shadow-2xl border border-slate-100 flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600">
              <Book className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {isMr ? 'MPSC सारथी: प्लॅटफॉर्म मार्गदर्शक व दस्तऐवजीकरण' : 'MPSC Sarathi Platform Guide & Manual'}
              </h3>
              <p className="text-xs text-slate-500">
                {isMr ? 'तांत्रिक ज्ञान नसलेल्या मालकांसाठी संपूर्ण माहिती' : 'Non-technical owner architecture & operations guide'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation & Body */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <aside className="w-48 sm:w-56 bg-slate-50 border-r border-slate-200 p-3 space-y-1 shrink-0 overflow-y-auto text-xs font-semibold">
            <button
              onClick={() => setActiveSection('overview')}
              className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                activeSection === 'overview' ? 'bg-amber-100 text-amber-900 font-bold' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Book className="w-4 h-4 text-slate-400" />
              <span>{isMr ? '१. प्रणाली सारांश' : '1. Overview & Stack'}</span>
            </button>
            <button
              onClick={() => setActiveSection('supabase')}
              className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                activeSection === 'supabase' ? 'bg-amber-100 text-amber-900 font-bold' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Database className="w-4 h-4 text-slate-400" />
              <span>{isMr ? '२. सुपारेस (Supabase)' : '2. Supabase SQL'}</span>
            </button>
            <button
              onClick={() => setActiveSection('razorpay')}
              className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                activeSection === 'razorpay' ? 'bg-amber-100 text-amber-900 font-bold' : 'text-slate-600 hover:text-slate-100'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-slate-400" />
              <span>{isMr ? '३. Razorpay पेमेंट्स' : '3. Razorpay Payments'}</span>
            </button>
            <button
              onClick={() => setActiveSection('promos')}
              className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                activeSection === 'promos' ? 'bg-amber-100 text-amber-900 font-bold' : 'text-slate-600 hover:text-slate-100'
              }`}
            >
              <Tag className="w-4 h-4 text-slate-400" />
              <span>{isMr ? '४. प्रोमो कोड्स' : '4. Promo Engine'}</span>
            </button>
            <button
              onClick={() => setActiveSection('troubleshoot')}
              className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                activeSection === 'troubleshoot' ? 'bg-amber-100 text-amber-900 font-bold' : 'text-slate-600 hover:text-slate-100'
              }`}
            >
              <HelpCircle className="w-4 h-4 text-slate-400" />
              <span>{isMr ? '५. निवारण (Troubleshooting)' : '5. Troubleshooting'}</span>
            </button>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 p-6 overflow-y-auto space-y-4 text-xs leading-relaxed text-slate-700">
            {activeSection === 'overview' && (
              <div className="space-y-4">
                <h4 className="text-base font-bold text-slate-900">
                  {isMr ? 'MPSC सारथी: प्रणाली माहिती' : 'Platform Architecture & Scope'}
                </h4>
                <p>
                  This platform is purpose-built strictly for <strong>Maharashtra MPSC Mock Tests</strong> (Rajyaseva, Combine Group B & Group C). It is architected for maximum simplicity, zero technical overhead, and high scalability for a non-technical owner.
                </p>
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="font-bold text-slate-900 block mb-1">Backend</span>
                    <span>Node.js, Express, and TypeScript (`server.ts`) with zero client-side secret exposure.</span>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="font-bold text-slate-900 block mb-1">Database</span>
                    <span>Supabase (PostgreSQL) compatible with relational schema + local JSON disk fallback.</span>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="font-bold text-slate-900 block mb-1">Payments</span>
                    <span>Razorpay with server-side HMAC SHA-256 signature verification before unlocking tests.</span>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="font-bold text-slate-900 block mb-1">Bilingual Engine</span>
                    <span>Full Marathi (मराठी) and English support for questions, options, and explanations.</span>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'supabase' && (
              <div className="space-y-4">
                <h4 className="text-base font-bold text-slate-900">
                  {isMr ? 'सुपारेस (Supabase) डेटाबेस कॉन्फिगरेशन' : 'Supabase Database Migration'}
                </h4>
                <p>
                  To use your own cloud Supabase database, copy the contents of <code>supabase_schema.sql</code> into your Supabase project's SQL Editor.
                </p>
                <div className="relative">
                  <pre className="p-3 bg-slate-900 text-slate-100 rounded-xl overflow-x-auto font-mono text-[11px] leading-tight">
                    {supabaseSql}
                  </pre>
                  <button
                    onClick={handleCopySql}
                    className="absolute top-2 right-2 px-2.5 py-1 bg-white/20 hover:bg-white/30 text-white rounded text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
                <p className="text-slate-500">
                  Includes 15 relational tables: users, roles, exams, subjects, topics, questions, question_options, tests, test_questions, attempts, answers, results, promo_codes, payments, and test_enrollments.
                </p>
              </div>
            )}

            {activeSection === 'razorpay' && (
              <div className="space-y-4">
                <h4 className="text-base font-bold text-slate-900">
                  {isMr ? 'Razorpay पेमेंट्स व सर्व्हर-व्हेरिफिकेशन' : 'Razorpay Payments & Verification'}
                </h4>
                <p>
                  Payments must <strong>never</strong> be trusted blindly from the client. When a student pays:
                </p>
                <ol className="list-decimal pl-5 space-y-2">
                  <li>Client calls <code>POST /api/payments/create-order</code>. Server creates unique order with amount in paise.</li>
                  <li>Student completes payment in Razorpay standard modal.</li>
                  <li>Razorpay returns <code>razorpay_order_id</code>, <code>razorpay_payment_id</code>, and <code>razorpay_signature</code>.</li>
                  <li>Server calculates HMAC SHA-256 of <code>order_id|payment_id</code> using <code>RAZORPAY_KEY_SECRET</code>.</li>
                  <li>Only if match is verified does the server enroll the student and unlock the test.</li>
                </ol>
              </div>
            )}

            {activeSection === 'promos' && (
              <div className="space-y-4">
                <h4 className="text-base font-bold text-slate-900">
                  {isMr ? 'प्रोमो कोड व कूपन प्रणाली' : 'Promo Code System & Rules'}
                </h4>
                <p>
                  The platform supports both percentage discounts (e.g. 20% off) and fixed amount discounts (e.g. ₹50 off).
                </p>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li><strong>Active Promo Codes</strong>: <code>MPSC2026</code> (20% off) and <code>TOPPER50</code> (50% off).</li>
                  <li><strong>Validation Rules</strong>: Minimum order amount, maximum discount caps, expiration dates, and usage limits.</li>
                  <li><strong>Audit Ledger</strong>: Every payment logs which promo code was used and the exact discount granted.</li>
                </ul>
              </div>
            )}

            {activeSection === 'troubleshoot' && (
              <div className="space-y-4">
                <h4 className="text-base font-bold text-slate-900">
                  {isMr ? 'समस्या निवारण (Troubleshooting Guide)' : 'Troubleshooting Guide'}
                </h4>
                <div className="space-y-3">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="font-bold text-slate-900 block">Q: Payment signature verification fails?</span>
                    <span className="text-slate-600 block mt-1">
                      Check your <code>RAZORPAY_KEY_SECRET</code> in the <code>.env</code> file. In test mode, our verified simulated sandbox checkout tests the server verification flow automatically.
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="font-bold text-slate-900 block">Q: How to back up questions and student scores?</span>
                    <span className="text-slate-600 block mt-1">
                      Go to Admin Dashboard -&gt; Health &amp; Backup tab -&gt; Click "Download Backup JSON". To restore, select the JSON file and upload.
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="font-bold text-slate-900 block">Q: Is the Health Check API active?</span>
                    <span className="text-slate-600 block mt-1">
                      Yes! You can probe <code>/api/health</code> anytime for database connectivity, uptime, and system status.
                    </span>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};
