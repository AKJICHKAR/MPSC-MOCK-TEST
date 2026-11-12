import React, { useState, useEffect, useRef } from 'react';
import { MockTest, Question, UserAnswer, TestResult } from '../types';
import { api } from '../services/api';
import {
  Clock,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  RotateCcw,
  CheckCircle2,
  Send,
  Loader2,
  Globe
} from 'lucide-react';

interface ExamEngineProps {
  test: MockTest;
  attemptId: string;
  initialLanguage: 'en' | 'mr';
  onTestSubmitted: (result: TestResult) => void;
  onExit: () => void;
}

export const ExamEngine: React.FC<ExamEngineProps> = ({
  test,
  attemptId,
  initialLanguage,
  onTestSubmitted,
  onExit
}) => {
  const questions: Question[] = test.questions || [];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, UserAnswer>>({});
  const [visited, setVisited] = useState<Record<string, boolean>>({});
  const [questionLang, setQuestionLang] = useState<'en' | 'mr'>(initialLanguage);
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState(test.duration_minutes * 60);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const timerRef = useRef<any>(null);
  const currentQ = questions[currentIndex];

  // Mark first question as visited
  useEffect(() => {
    if (currentQ) {
      setVisited(prev => ({ ...prev, [currentQ.id]: true }));
    }
  }, [currentIndex, currentQ]);

  // Timer countdown
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeRemainingSeconds(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Periodic autosave sync every 30 seconds
  useEffect(() => {
    const syncInterval = setInterval(() => {
      if (attemptId) {
        setSyncing(true);
        const timeSpent = (test.duration_minutes * 60) - timeRemainingSeconds;
        api.syncAttempt(attemptId, answers, timeSpent).finally(() => setSyncing(false));
      }
    }, 30000);

    return () => clearInterval(syncInterval);
  }, [attemptId, answers, timeRemainingSeconds, test.duration_minutes]);

  const handleSelectOption = (optionId: string) => {
    if (!currentQ) return;
    setAnswers(prev => ({
      ...prev,
      [currentQ.id]: {
        question_id: currentQ.id,
        selected_option_id: optionId,
        is_marked_for_review: prev[currentQ.id]?.is_marked_for_review || false
      }
    }));
  };

  const handleClearResponse = () => {
    if (!currentQ) return;
    setAnswers(prev => {
      const copy = { ...prev };
      if (copy[currentQ.id]) {
        copy[currentQ.id] = {
          ...copy[currentQ.id],
          selected_option_id: null
        };
      }
      return copy;
    });
  };

  const handleToggleReview = () => {
    if (!currentQ) return;
    setAnswers(prev => ({
      ...prev,
      [currentQ.id]: {
        question_id: currentQ.id,
        selected_option_id: prev[currentQ.id]?.selected_option_id || null,
        is_marked_for_review: !prev[currentQ.id]?.is_marked_for_review
      }
    }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleAutoSubmit = async () => {
    await doSubmit();
  };

  const doSubmit = async () => {
    setSubmitting(true);
    if (timerRef.current) clearInterval(timerRef.current);

    try {
      const timeSpent = (test.duration_minutes * 60) - timeRemainingSeconds;
      const res = await api.submitAttempt(attemptId, answers, timeSpent);
      onTestSubmitted(res.result);
    } catch (err: any) {
      alert('Error submitting test: ' + err.message);
      setSubmitting(false);
    }
  };

  // Status counters
  let answeredCount = 0;
  let markedCount = 0;
  let answeredAndMarkedCount = 0;
  let notVisitedCount = 0;
  let notAnsweredCount = 0;

  questions.forEach(q => {
    const ans = answers[q.id];
    const isAns = Boolean(ans && ans.selected_option_id);
    const isMark = Boolean(ans && ans.is_marked_for_review);
    const isVis = Boolean(visited[q.id]);

    if (isAns && isMark) {
      answeredAndMarkedCount += 1;
    } else if (isAns) {
      answeredCount += 1;
    } else if (isMark) {
      markedCount += 1;
    } else if (isVis) {
      notAnsweredCount += 1;
    } else {
      notVisitedCount += 1;
    }
  });

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const isLowTime = timeRemainingSeconds < 300; // < 5 minutes
  const isMr = questionLang === 'mr';

  if (!currentQ) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <p className="text-slate-600 mb-4">No questions loaded for this mock test.</p>
          <button onClick={onExit} className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm">
            Exit
          </button>
        </div>
      </div>
    );
  }

  const currentAns = answers[currentQ.id];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans select-none">
      {/* Test Top Bar */}
      <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3 shrink-0 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-600 text-white font-bold flex items-center justify-center text-sm">
              M
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-bold text-slate-900 truncate max-w-xs sm:max-w-md">
                {isMr ? test.title_mr : test.title_en}
              </h1>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span>{questions.length} Questions</span>
                <span aria-hidden="true">·</span>
                <span>{test.total_marks} Marks</span>
                {syncing && <span className="text-amber-600 animate-pulse text-[11px]">(Saving...)</span>}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Bilingual Switcher */}
            <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-lg text-xs font-semibold">
              <button
                type="button"
                onClick={() => setQuestionLang('mr')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  isMr ? 'bg-amber-600 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                मराठी
              </button>
              <button
                type="button"
                onClick={() => setQuestionLang('en')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  !isMr ? 'bg-amber-600 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                English
              </button>
            </div>

            {/* Countdown Timer */}
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border font-mono text-sm font-bold tabular-nums ${
                isLowTime
                  ? 'bg-rose-50 text-rose-700 border-rose-300 animate-pulse'
                  : 'bg-slate-50 text-slate-800 border-slate-200'
              }`}
            >
              <Clock className="w-4 h-4 text-slate-500" />
              <span>{formatTimer(timeRemainingSeconds)}</span>
            </div>

            {/* Submit Button */}
            <button
              onClick={() => setShowSubmitModal(true)}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors shadow-xs"
            >
              {isMr ? 'चाचणी सबमिट करा' : 'Submit Test'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Examination Viewport */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left 3 Columns: Active Question Stage */}
        <main className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 flex flex-col min-h-[580px] shadow-xs">
          {/* Question Header & Metadata */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
            <div className="flex items-center gap-3">
              <span className="text-base font-bold text-amber-800 bg-amber-50 px-3 py-1 rounded-lg">
                {isMr ? `प्रश्न ${currentIndex + 1}` : `Question ${currentIndex + 1}`}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {isMr ? `एकूण ${questions.length} पैकी` : `of ${questions.length}`}
              </span>
            </div>

            <div className="flex items-center gap-4 text-xs font-medium">
              <span className="text-emerald-700">+{currentQ.marks || 2} marks</span>
              <span className="text-rose-600">
                -{currentQ.negative_marks !== undefined ? currentQ.negative_marks : ((currentQ.marks || 2) * 0.25)} marks
              </span>
            </div>
          </div>

          {/* Question Text */}
          <div className="mb-8 flex-1">
            <h2 className="text-base sm:text-lg font-medium text-slate-900 leading-relaxed font-marathi">
              {isMr ? currentQ.question_mr : currentQ.question_en}
            </h2>
          </div>

          {/* Options List */}
          <div className="space-y-3 mb-8">
            {currentQ.options.map((option, optIdx) => {
              const isSelected = currentAns?.selected_option_id === option.id;
              const optionNumber = option.option_key || (optIdx + 1);

              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handleSelectOption(option.id)}
                  className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-3 cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500/10 border-amber-500 ring-1 ring-amber-500/30'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                      isSelected
                        ? 'bg-amber-600 text-white'
                        : 'border border-slate-300 text-slate-600 bg-slate-50'
                    }`}
                  >
                    {optionNumber}
                  </div>
                  <div className="text-sm text-slate-800 leading-normal font-marathi flex-1 pt-0.5">
                    {isMr ? option.text_mr : option.text_en}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Bottom Action Deck */}
          <div className="border-t border-slate-100 pt-5 flex flex-wrap items-center justify-between gap-3 mt-auto">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleToggleReview}
                className={`px-3.5 py-2 text-xs font-semibold rounded-lg border transition-colors flex items-center gap-1.5 ${
                  currentAns?.is_marked_for_review
                    ? 'bg-purple-100 text-purple-800 border-purple-300'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>
                  {currentAns?.is_marked_for_review
                    ? (isMr ? 'रिव्ह्यू वरून काढा' : 'Marked for Review')
                    : (isMr ? 'पुनरावलोकनासाठी ठेवा' : 'Mark for Review')}
                </span>
              </button>

              {currentAns?.selected_option_id && (
                <button
                  type="button"
                  onClick={handleClearResponse}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{isMr ? 'उत्तर रद्द करा' : 'Clear Response'}</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 rounded-lg transition-colors flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>{isMr ? 'मागील' : 'Previous'}</span>
              </button>

              <button
                type="button"
                onClick={handleNext}
                disabled={currentIndex === questions.length - 1}
                className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-40 rounded-lg transition-colors flex items-center gap-1"
              >
                <span>{isMr ? 'पुढील प्रश्न' : 'Save & Next'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </main>

        {/* Right 1 Column: Question Palette & Legend */}
        <aside className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            {isMr ? 'प्रश्न पॅलेट' : 'Question Palette'}
          </h3>

          {/* Palette Grid */}
          <div className="grid grid-cols-5 gap-2 max-h-64 overflow-y-auto p-1">
            {questions.map((q, idx) => {
              const ans = answers[q.id];
              const isSelected = currentIndex === idx;
              const hasAnswer = Boolean(ans && ans.selected_option_id);
              const isMarked = Boolean(ans && ans.is_marked_for_review);
              const isVis = Boolean(visited[q.id]);

              let bgClass = 'bg-slate-100 text-slate-600 border-slate-200'; // Not visited

              if (hasAnswer && isMarked) {
                bgClass = 'bg-purple-600 text-white border-purple-700 ring-2 ring-emerald-400';
              } else if (hasAnswer) {
                bgClass = 'bg-emerald-600 text-white border-emerald-700';
              } else if (isMarked) {
                bgClass = 'bg-purple-600 text-white border-purple-700';
              } else if (isVis) {
                bgClass = 'bg-rose-500 text-white border-rose-600'; // Not answered
              }

              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-9 rounded-lg font-mono text-xs font-bold border transition-all cursor-pointer flex items-center justify-center relative ${bgClass} ${
                    isSelected ? 'ring-2 ring-amber-500 scale-105 z-10' : ''
                  }`}
                >
                  {idx + 1}
                  {hasAnswer && isMarked && (
                    <span className="w-2 h-2 rounded-full bg-emerald-400 absolute top-0.5 right-0.5" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Palette Legend */}
          <div className="border-t border-slate-100 pt-4 space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-700">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-emerald-600 shrink-0" />
                <span>{isMr ? 'उत्तर दिलेले' : 'Answered'}</span>
              </div>
              <span className="font-mono font-bold">{answeredCount}</span>
            </div>

            <div className="flex items-center justify-between text-slate-700">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-rose-500 shrink-0" />
                <span>{isMr ? 'उत्तर न दिलेले' : 'Not Answered'}</span>
              </div>
              <span className="font-mono font-bold">{notAnsweredCount}</span>
            </div>

            <div className="flex items-center justify-between text-slate-700">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-purple-600 shrink-0" />
                <span>{isMr ? 'पुनरावलोकन बाकी' : 'Marked for Review'}</span>
              </div>
              <span className="font-mono font-bold">{markedCount}</span>
            </div>

            <div className="flex items-center justify-between text-slate-700">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-purple-600 relative shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 absolute -top-0.5 -right-0.5" />
                </span>
                <span>{isMr ? 'उत्तर + रिव्ह्यू' : 'Ans & Marked'}</span>
              </div>
              <span className="font-mono font-bold">{answeredAndMarkedCount}</span>
            </div>

            <div className="flex items-center justify-between text-slate-700">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-slate-200 shrink-0" />
                <span>{isMr ? 'भेट न दिलेले' : 'Not Visited'}</span>
              </div>
              <span className="font-mono font-bold">{notVisitedCount}</span>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={() => setShowSubmitModal(true)}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isMr ? 'अंतिम चाचणी सबमिशन' : 'Final Submit Test'}</span>
            </button>
          </div>
        </aside>
      </div>

      {/* Confirmation Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {isMr ? 'चाचणी सबमिट करण्याची खात्री करा' : 'Confirm Test Submission'}
                </h3>
                <p className="text-xs text-slate-500">
                  {isMr ? 'सबमिट केल्यानंतर उत्तरे बदलता येणार नाहीत.' : 'Once submitted, answers cannot be edited.'}
                </p>
              </div>
            </div>

            {/* Summary statistics */}
            <div className="bg-slate-50 rounded-xl p-4 mb-5 border border-slate-200/80 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>{isMr ? 'एकूण प्रश्न' : 'Total Questions'}:</span>
                <span className="font-mono font-bold text-slate-900">{questions.length}</span>
              </div>
              <div className="flex justify-between text-emerald-700">
                <span>{isMr ? 'उत्तर दिलेले प्रश्न' : 'Answered'}:</span>
                <span className="font-mono font-bold">{answeredCount + answeredAndMarkedCount}</span>
              </div>
              <div className="flex justify-between text-rose-600">
                <span>{isMr ? 'उत्तर न दिलेले प्रश्न' : 'Unanswered'}:</span>
                <span className="font-mono font-bold">{notAnsweredCount + notVisitedCount}</span>
              </div>
              <div className="flex justify-between text-purple-700">
                <span>{isMr ? 'रिव्ह्यू साठी ठेवलेले' : 'Marked for Review'}:</span>
                <span className="font-mono font-bold">{markedCount}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                disabled={submitting}
                className="flex-1 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                {isMr ? 'परत जा व पूर्ण करा' : 'Resume Test'}
              </button>
              <button
                type="button"
                onClick={doSubmit}
                disabled={submitting}
                className="flex-1 py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                <span>{isMr ? 'होय, सबमिट करा' : 'Yes, Submit'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
