import React, { useState } from 'react';
import { TestResult, MockTest, TestAttempt, Question } from '../types';
import {
  Trophy,
  Award,
  CheckCircle,
  XCircle,
  HelpCircle,
  ArrowLeft,
  RotateCcw,
  BookOpen,
  Filter,
  BarChart3,
  Percent
} from 'lucide-react';

interface TestResultViewProps {
  result: TestResult;
  test: MockTest;
  attempt?: TestAttempt;
  language: 'en' | 'mr';
  onBackToDashboard: () => void;
  onRetakeTest: () => void;
}

export const TestResultView: React.FC<TestResultViewProps> = ({
  result,
  test,
  attempt,
  language,
  onBackToDashboard,
  onRetakeTest
}) => {
  const isMr = language === 'mr';
  const [filterType, setFilterType] = useState<'all' | 'correct' | 'incorrect' | 'unattempted'>('all');
  const [viewLang, setViewLang] = useState<'en' | 'mr'>(language);

  const questions: Question[] = test.questions || [];
  const answers = attempt?.answers || {};

  // Accuracy calculation
  const accuracy = result.attempted_count > 0
    ? Math.round((result.correct_count / result.attempted_count) * 100)
    : 0;

  // Filter questions
  const filteredQuestions = questions.filter(q => {
    const userAns = answers[q.id];
    const correctOpt = q.options.find(o => o.is_correct);
    const isAttempted = Boolean(userAns && userAns.selected_option_id);
    const isCorrect = isAttempted && userAns?.selected_option_id === correctOpt?.id;

    if (filterType === 'correct') return isCorrect;
    if (filterType === 'incorrect') return isAttempted && !isCorrect;
    if (filterType === 'unattempted') return !isAttempted;
    return true;
  });

  const isPassed = result.net_score >= test.passing_marks;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 font-sans">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <button
            onClick={onBackToDashboard}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors mb-2 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{isMr ? 'डॅशबोर्डवर परत जा' : 'Back to Dashboard'}</span>
          </button>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            {isMr ? test.title_mr : test.title_en}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {isMr ? 'मूल्यांकन निकाल व सविस्तर विश्लेषण' : 'Scorecard & Question-by-Question Analysis'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Solution Language Switcher */}
          <div className="flex items-center p-0.5 bg-slate-100 rounded-lg text-xs font-semibold border border-slate-200">
            <button
              onClick={() => setViewLang('mr')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                viewLang === 'mr' ? 'bg-amber-600 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              मराठी
            </button>
            <button
              onClick={() => setViewLang('en')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                viewLang === 'en' ? 'bg-amber-600 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              English
            </button>
          </div>

          <button
            onClick={onRetakeTest}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{isMr ? 'पुन्हा सराव करा' : 'Retake Test'}</span>
          </button>
        </div>
      </div>

      {/* Hero Scorecard */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 text-center">
          {/* Net Score */}
          <div className="p-4 bg-amber-500/10 rounded-xl border border-amber-500/20 col-span-2 sm:col-span-1">
            <div className="text-[11px] font-bold uppercase tracking-wider text-amber-800 mb-1">
              {isMr ? 'अंतिम गुण (Net Score)' : 'Net Score'}
            </div>
            <div className="text-3xl font-extrabold text-amber-700 font-mono tabular-nums">
              {result.net_score}
            </div>
            <div className="text-[11px] text-amber-900/70 mt-1 font-medium">
              {isMr ? `एकूण ${result.total_marks} पैकी` : `out of ${result.total_marks}`}
            </div>
          </div>

          {/* Accuracy */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              {isMr ? 'अचूकता (Accuracy)' : 'Accuracy'}
            </div>
            <div className="text-2xl font-bold text-slate-800 font-mono tabular-nums">
              {accuracy}%
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              {result.correct_count} / {result.attempted_count} {isMr ? 'बरोबर' : 'correct'}
            </div>
          </div>

          {/* Rank */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              {isMr ? 'क्रमांक (Rank)' : 'State Rank'}
            </div>
            <div className="text-2xl font-bold text-slate-800 font-mono tabular-nums">
              #{result.rank}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              {isMr ? `${result.total_participants} विद्यार्थ्यांमध्ये` : `in ${result.total_participants} students`}
            </div>
          </div>

          {/* Percentile */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              {isMr ? 'पर्सेंटाईल' : 'Percentile'}
            </div>
            <div className="text-2xl font-bold text-slate-800 font-mono tabular-nums">
              {result.percentile}%
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              {isMr ? 'विद्यार्थ्यांपेक्षा पुढे' : 'better than peers'}
            </div>
          </div>

          {/* Positive Marks */}
          <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
            <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 mb-1">
              {isMr ? 'प्राप्त गुण' : 'Positive Marks'}
            </div>
            <div className="text-2xl font-bold text-emerald-700 font-mono tabular-nums">
              +{result.positive_score}
            </div>
            <div className="text-[11px] text-emerald-600 mt-1">
              {result.correct_count} {isMr ? 'योग्य उत्तरे' : 'correct answers'}
            </div>
          </div>

          {/* Negative Marks */}
          <div className="p-4 bg-rose-50 rounded-xl border border-rose-100">
            <div className="text-[11px] font-bold uppercase tracking-wider text-rose-700 mb-1">
              {isMr ? 'निगेटिव्ह पेनल्टी' : 'Negative Penalty'}
            </div>
            <div className="text-2xl font-bold text-rose-600 font-mono tabular-nums">
              -{result.negative_penalty}
            </div>
            <div className="text-[11px] text-rose-500 mt-1">
              {result.incorrect_count} {isMr ? 'चुकीची उत्तरे' : 'incorrect'}
            </div>
          </div>
        </div>
      </div>

      {/* Subject-Wise Performance Breakdown */}
      {result.subject_analysis && result.subject_analysis.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-amber-600" />
            <h3 className="text-base font-bold text-slate-900">
              {isMr ? 'विषयनिहाय विश्लेषण (Subject-wise Performance)' : 'Subject-wise Performance Breakdown'}
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                  <th className="py-2.5 px-3">{isMr ? 'विषय' : 'Subject'}</th>
                  <th className="py-2.5 px-3 text-center">{isMr ? 'एकूण प्रश्न' : 'Total'}</th>
                  <th className="py-2.5 px-3 text-center text-emerald-700">{isMr ? 'बरोबर' : 'Correct'}</th>
                  <th className="py-2.5 px-3 text-center text-rose-600">{isMr ? 'चुकीचे' : 'Incorrect'}</th>
                  <th className="py-2.5 px-3 text-center text-slate-500">{isMr ? 'सोडवले नाही' : 'Skipped'}</th>
                  <th className="py-2.5 px-3 text-right">{isMr ? 'गुण' : 'Score'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {result.subject_analysis.map(sub => (
                  <tr key={sub.subject_id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-3 text-slate-900 font-semibold font-marathi">
                      {isMr ? sub.subject_name_mr : sub.subject_name_en}
                    </td>
                    <td className="py-3 px-3 text-center font-mono tabular-nums text-slate-600">
                      {sub.total_questions}
                    </td>
                    <td className="py-3 px-3 text-center font-mono tabular-nums text-emerald-700 font-bold">
                      {sub.correct}
                    </td>
                    <td className="py-3 px-3 text-center font-mono tabular-nums text-rose-600 font-bold">
                      {sub.incorrect}
                    </td>
                    <td className="py-3 px-3 text-center font-mono tabular-nums text-slate-400">
                      {sub.unattempted}
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums font-bold text-slate-900">
                      {sub.score}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Question by Question Review Header & Filter Controls */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-600" />
            <h3 className="text-base font-bold text-slate-900">
              {isMr ? 'प्रश्नांची उत्तरे व स्पष्टीकरण (Solutions & Explanations)' : 'Question Solutions & Explanations'}
            </h3>
          </div>

          {/* Interactive filter tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs font-semibold">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                filterType === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {isMr ? `सर्व (${questions.length})` : `All (${questions.length})`}
            </button>
            <button
              onClick={() => setFilterType('correct')}
              className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                filterType === 'correct' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {isMr ? `बरोबर (${result.correct_count})` : `Correct (${result.correct_count})`}
            </button>
            <button
              onClick={() => setFilterType('incorrect')}
              className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                filterType === 'incorrect' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {isMr ? `चुकीचे (${result.incorrect_count})` : `Incorrect (${result.incorrect_count})`}
            </button>
            <button
              onClick={() => setFilterType('unattempted')}
              className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                filterType === 'unattempted' ? 'bg-slate-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {isMr ? `सोडवले नाही (${result.unattempted_count})` : `Skipped (${result.unattempted_count})`}
            </button>
          </div>
        </div>

        {/* Questions List */}
        <div className="space-y-6">
          {filteredQuestions.map((q, qIndex) => {
            const userAns = answers[q.id];
            const correctOpt = q.options.find(o => o.is_correct);
            const userSelectedOpt = q.options.find(o => o.id === userAns?.selected_option_id);
            const isAttempted = Boolean(userAns && userAns.selected_option_id);
            const isCorrect = isAttempted && userSelectedOpt?.id === correctOpt?.id;

            return (
              <div
                key={q.id}
                className={`bg-white rounded-2xl border p-6 shadow-xs space-y-4 transition-all ${
                  !isAttempted
                    ? 'border-slate-200'
                    : isCorrect
                    ? 'border-emerald-200 bg-emerald-50/20'
                    : 'border-rose-200 bg-rose-50/20'
                }`}
              >
                {/* Question Status Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">
                      {isMr ? `प्रश्न ${questions.indexOf(q) + 1}` : `Q${questions.indexOf(q) + 1}`}
                    </span>
                    <span aria-hidden="true" className="text-slate-300">·</span>
                    <span className="text-xs text-slate-500 font-medium">
                      +{q.marks || 2} / -{q.negative_marks !== undefined ? q.negative_marks : ((q.marks || 2) * 0.25)} marks
                    </span>
                  </div>

                  <div>
                    {isCorrect ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-100/80 px-2.5 py-1 rounded-md">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>{isMr ? 'बरोबर उत्तर (+2)' : 'Correct (+2)'}</span>
                      </span>
                    ) : isAttempted ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-700 bg-rose-100/80 px-2.5 py-1 rounded-md">
                        <XCircle className="w-3.5 h-3.5" />
                        <span>{isMr ? 'चुकीचे उत्तर (-0.5)' : 'Incorrect (-0.5)'}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span>{isMr ? 'सोडवले नाही (0)' : 'Unattempted (0)'}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Question Text */}
                <p className="text-sm sm:text-base font-medium text-slate-900 leading-relaxed font-marathi">
                  {viewLang === 'mr' ? q.question_mr : q.question_en}
                </p>

                {/* Options Review */}
                <div className="space-y-2">
                  {q.options.map((opt, optIdx) => {
                    const isOptionCorrect = opt.is_correct;
                    const isUserPick = userSelectedOpt?.id === opt.id;

                    let optBg = 'bg-slate-50 border-slate-200 text-slate-700';

                    if (isOptionCorrect) {
                      optBg = 'bg-emerald-50 border-emerald-400 text-emerald-950 ring-1 ring-emerald-400';
                    } else if (isUserPick && !isOptionCorrect) {
                      optBg = 'bg-rose-50 border-rose-300 text-rose-950 ring-1 ring-rose-300';
                    }

                    return (
                      <div
                        key={opt.id}
                        className={`p-3 rounded-xl border text-xs sm:text-sm flex items-start gap-3 ${optBg}`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                            isOptionCorrect
                              ? 'bg-emerald-600 text-white'
                              : isUserPick
                              ? 'bg-rose-600 text-white'
                              : 'bg-white border border-slate-300 text-slate-600'
                          }`}
                        >
                          {opt.option_key || (optIdx + 1)}
                        </div>
                        <div className="flex-1 font-marathi pt-0.5">
                          {viewLang === 'mr' ? opt.text_mr : opt.text_en}
                        </div>
                        {isOptionCorrect && (
                          <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider shrink-0">
                            {isMr ? '✓ बरोबर पर्याय' : '✓ Correct'}
                          </span>
                        )}
                        {isUserPick && !isOptionCorrect && (
                          <span className="text-[11px] font-bold text-rose-600 uppercase tracking-wider shrink-0">
                            {isMr ? '✗ तुमची निवड' : '✗ Your Pick'}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Detailed Explanation */}
                {(q.explanation_en || q.explanation_mr) && (
                  <div className="p-4 bg-amber-500/5 rounded-xl border border-amber-500/15 text-xs text-slate-700 space-y-1">
                    <span className="font-bold text-amber-900 block">
                      {viewLang === 'mr' ? 'सविस्तर स्पष्टीकरण (Explanation):' : 'Explanation:'}
                    </span>
                    <p className="leading-relaxed font-marathi text-slate-800">
                      {viewLang === 'mr'
                        ? (q.explanation_mr || q.explanation_en)
                        : (q.explanation_en || q.explanation_mr)}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
