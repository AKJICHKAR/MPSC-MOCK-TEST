import crypto from 'crypto';
import { db } from './db';
import { TestAttempt, TestResult, SubjectBreakdown, Question } from '../src/types';

export function evaluateAttempt(attemptId: string, userId: string): TestResult {
  const attempt = db.getAttemptById(attemptId);
  if (!attempt) {
    throw new Error('Attempt not found');
  }

  const test = db.getTestById(attempt.test_id, true);
  if (!test) {
    throw new Error('Test not found');
  }

  const questions: Question[] = test.questions || [];
  const answers = attempt.answers || {};

  let totalQuestions = questions.length;
  let attemptedCount = 0;
  let correctCount = 0;
  let incorrectCount = 0;
  let unattemptedCount = 0;
  let positiveScore = 0;
  let negativePenalty = 0;

  // Group by subjects for breakdown
  const subjectMap = new Map<string, SubjectBreakdown>();
  const subjects = db.getSubjects(test.exam_id);

  // Initialize subjects map
  questions.forEach(q => {
    if (!subjectMap.has(q.subject_id)) {
      const subInfo = subjects.find(s => s.id === q.subject_id);
      subjectMap.set(q.subject_id, {
        subject_id: q.subject_id,
        subject_name_en: subInfo?.name_en || q.subject_id,
        subject_name_mr: subInfo?.name_mr || q.subject_id,
        total_questions: 0,
        correct: 0,
        incorrect: 0,
        unattempted: 0,
        score: 0
      });
    }
    const subStat = subjectMap.get(q.subject_id)!;
    subStat.total_questions += 1;
  });

  // Evaluate each question
  questions.forEach(q => {
    const userAns = answers[q.id];
    const subStat = subjectMap.get(q.subject_id);
    const marks = q.marks || 2;
    const negMarks = q.negative_marks !== undefined ? q.negative_marks : marks * (test.negative_mark_factor || 0.25);

    const correctOption = q.options.find(opt => opt.is_correct);

    if (!userAns || !userAns.selected_option_id) {
      unattemptedCount += 1;
      if (subStat) subStat.unattempted += 1;
    } else {
      attemptedCount += 1;
      const isCorrect = correctOption ? userAns.selected_option_id === correctOption.id : false;

      if (isCorrect) {
        correctCount += 1;
        positiveScore += marks;
        if (subStat) {
          subStat.correct += 1;
          subStat.score += marks;
        }
      } else {
        incorrectCount += 1;
        negativePenalty += negMarks;
        if (subStat) {
          subStat.incorrect += 1;
          subStat.score -= negMarks;
        }
      }
    }
  });

  // Net score rounded to 2 decimals
  const netScore = Math.max(0, Math.round((positiveScore - negativePenalty) * 100) / 100);
  const totalMarks = test.total_marks || (totalQuestions * 2);
  const percentage = Math.round(((netScore / totalMarks) * 100) * 10) / 10;

  // Round subject scores
  const subjectAnalysis: SubjectBreakdown[] = Array.from(subjectMap.values()).map(s => ({
    ...s,
    score: Math.max(0, Math.round(s.score * 100) / 100)
  }));

  // Fetch existing results for rank calculation
  const allResults = db.getAllResultsForTest(test.id);
  const allScores = [...allResults.map(r => r.net_score), netScore].sort((a, b) => b - a);
  const rank = allScores.indexOf(netScore) + 1;
  const totalParticipants = allScores.length;
  // Percentile: (Number of people behind + 0.5) / Total * 100
  const peopleBehind = allScores.filter(s => s < netScore).length;
  const percentile = totalParticipants > 1
    ? Math.round(((peopleBehind / totalParticipants) * 100) * 10) / 10
    : 100;

  const result: TestResult = {
    id: 'res_' + crypto.randomUUID().slice(0, 8),
    attempt_id: attemptId,
    user_id: userId,
    test_id: test.id,
    total_questions: totalQuestions,
    attempted_count: attemptedCount,
    correct_count: correctCount,
    incorrect_count: incorrectCount,
    unattempted_count: unattemptedCount,
    positive_score: Math.round(positiveScore * 100) / 100,
    negative_penalty: Math.round(negativePenalty * 100) / 100,
    net_score: netScore,
    total_marks: totalMarks,
    percentage,
    rank,
    total_participants: totalParticipants,
    percentile,
    subject_analysis: subjectAnalysis,
    evaluated_at: new Date().toISOString()
  };

  // Mark attempt status as evaluated
  attempt.status = 'evaluated';
  attempt.completed_at = new Date().toISOString();
  db.saveData();

  db.saveResult(result);
  return result;
}
