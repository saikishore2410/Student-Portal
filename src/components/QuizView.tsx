import { useState, useEffect } from 'react';
import { 
  InteractiveQuiz, 
  QuizQuestion,
  QuizAttempt 
} from '../types';
import { 
  OfflineStorage 
} from '../lib/database';
import { 
  X, 
  CheckCircle, 
  XCircle, 
  Award, 
  ArrowRight, 
  ChevronRight, 
  Sparkles, 
  RefreshCw, 
  RotateCcw,
  BookOpen
} from 'lucide-react';

interface QuizViewProps {
  quizId: string;
  onClose: () => void;
  onQuizCompleted: () => void;
}

export default function QuizView({ quizId, onClose, onQuizCompleted }: QuizViewProps) {
  const [quiz, setQuiz] = useState<InteractiveQuiz | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState<boolean>(false);
  const [correctAnswersCount, setCorrectAnswersCount] = useState<number>(0);
  const [quizFinished, setQuizFinished] = useState<boolean>(false);

  // AI-quiz generation state
  const [generatingAiQuiz, setGeneratingAiQuiz] = useState<boolean>(false);
  const [isAiQuiz, setIsAiQuiz] = useState<boolean>(false);

  useEffect(() => {
    const quizzes = OfflineStorage.getQuizzes();
    const foundQuiz = quizzes.find(q => q.id === quizId);
    if (foundQuiz) {
      setQuiz(JSON.parse(JSON.stringify(foundQuiz))); // deep copy
    }
  }, [quizId]);

  const loadAiGeneratedQuestions = async () => {
    if (!quiz) return;
    setGeneratingAiQuiz(true);
    try {
      const response = await fetch("/api/quiz-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: quiz.topic,
          subject: "Science & Engineering Operations"
        })
      });

      if (!response.ok) throw new Error("Quiz compilation error");
      const data = await response.json();
      if (data.questions && data.questions.length > 0) {
        setQuiz({
          ...quiz,
          title: data.title || `AI-Generated ${quiz.topic} Assessment`,
          questions: data.questions
        });
        setIsAiQuiz(true);
        // Reset quiz mechanics
        setCurrentIndex(0);
        setSelectedOption(null);
        setIsAnswerChecked(false);
        setCorrectAnswersCount(0);
        setQuizFinished(false);
      }
    } catch {
      alert("Note: Socratic Advisor offline. Proceeding with high-fidelity pre-compiled default homework sheet.");
    } finally {
      setGeneratingAiQuiz(false);
    }
  };

  const handleOptionSelect = (index: number) => {
    if (isAnswerChecked) return;
    setSelectedOption(index);
  };

  const handleCheckAnswer = () => {
    if (selectedOption === null || !quiz) return;
    const currentQuestion = quiz.questions[currentIndex];
    if (selectedOption === currentQuestion.correctOptionIndex) {
      setCorrectAnswersCount(prev => prev + 1);
    }
    setIsAnswerChecked(true);
  };

  const handleNextQuestion = () => {
    if (!quiz) return;
    setSelectedOption(null);
    setIsAnswerChecked(false);
    
    if (currentIndex < quiz.questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setQuizFinished(true);
      commitQuizResults();
    }
  };

  const commitQuizResults = () => {
    if (!quiz) return;
    const score = Math.round((correctAnswersCount / quiz.questions.length) * 100);
    const passed = score >= quiz.passingScore;

    // Get current paths and update progress accordingly
    const paths = OfflineStorage.getPaths();
    let madeChanges = false;

    paths.forEach(p => {
      p.units.forEach(u => {
        if (u.quizId === quizId) {
          if (passed) {
            u.status = 'completed';
            madeChanges = true;
          }
        }
      });

      // Recalculate course completion progress index
      const completedUnits = p.units.filter(u => u.status === 'completed').length;
      p.progress = Math.round((completedUnits / p.units.length) * 100);

      // Unlock next unit in line if this was passed
      if (passed && p.progress < 100) {
        const nextIdIndex = p.units.findIndex(u => u.status === 'completed');
        p.units.forEach((unit, idx) => {
          if (idx > 0 && p.units[idx - 1].status === 'completed' && unit.status === 'locked') {
            unit.status = 'unlocked';
          }
        });
      }
    });

    if (madeChanges) {
      OfflineStorage.setPaths(paths);
      // Award nice local points triggers and append nice alert message
      const notifs = OfflineStorage.getNotifications();
      notifs.unshift({
        id: `notif_quiz_${Date.now()}`,
        title: `Passed ${quiz.title}!`,
        message: `You scored ${score}% on the assessment, unlocking your advanced study path progress.`,
        type: 'success',
        createdAt: new Date().toISOString(),
        read: false
      });
      OfflineStorage.setNotifications(notifs);
    }
  };

  const handleResetQuiz = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswerChecked(false);
    setCorrectAnswersCount(0);
    setQuizFinished(false);
  };

  if (!quiz) {
    return (
      <div className="flex h-[300px] items-center justify-center text-slate-400">
        Reviewing homework assets...
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentIndex];
  const totalQuestions = quiz.questions.length;
  const progressPct = ((currentIndex + 1) / totalQuestions) * 100;
  
  // Scoring parameters
  const finalScorePct = Math.round((correctAnswersCount / totalQuestions) * 100);
  const hasPassed = finalScorePct >= quiz.passingScore;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        {/* Header toolbar */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 p-4.5 dark:border-slate-800 dark:bg-slate-950">
          <div>
            <span className="text-[10px] font-mono font-bold tracking-widest text-violet-600 uppercase">Interactive Examination Deck</span>
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate w-[300px] sm:w-[450px]">{quiz.title}</h2>
          </div>
          <button 
            onClick={onClose}
            className="rounded-full bg-slate-100 p-1.5 text-slate-400 hover:bg-slate-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* AI-generate trigger banner */}
        {!quizFinished && (
          <div className="flex flex-wrap items-center justify-between gap-3 bg-violet-50/50 px-5 py-2.5 dark:bg-violet-950/20">
            <div className="flex items-center gap-1.5 text-xs text-violet-700 dark:text-violet-300 font-medium">
              <Sparkles className="h-4 w-4 text-violet-500" />
              <span>{isAiQuiz ? "Active AI-generated syllabus exam paper paper" : "Want to test your limits with Gemini-generated custom challenges?"}</span>
            </div>
            {!isAiQuiz && (
              <button 
                onClick={loadAiGeneratedQuestions}
                disabled={generatingAiQuiz}
                className="flex items-center gap-1 rounded bg-violet-600 px-3 py-1 text-[10px] font-semibold text-white hover:bg-violet-500 disabled:opacity-40"
              >
                <RefreshCw className={`h-3 w-3 ${generatingAiQuiz ? 'animate-spin' : ''}`} />
                {generatingAiQuiz ? 'Generatig...' : 'Create AI Quiz'}
              </button>
            )}
          </div>
        )}

        {/* Progress tracker bar */}
        {!quizFinished && (
          <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800">
            <div className="h-1.5 bg-violet-600 transition-all duration-300" style={{ width: `${progressPct}%` }}></div>
          </div>
        )}

        {/* Main Quiz Sheet content */}
        <div className="p-6 md:p-8 max-h-[70vh] overflow-y-auto">
          {!quizFinished ? (
            <div className="space-y-6">
              {/* Question metadata */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-slate-400">QUESTION {currentIndex + 1} OF {totalQuestions}</span>
                <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">Pass limit: {quiz.passingScore}%</span>
              </div>

              {/* Formulation label */}
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 leading-snug">
                {currentQuestion.question}
              </h3>

              {/* Multiple choice selection cards */}
              <div className="space-y-3">
                {currentQuestion.options.map((option, idx) => {
                  const isSelected = selectedOption === idx;
                  const isCorrectAnswer = idx === currentQuestion.correctOptionIndex;
                  
                  let cardStyle = "border-slate-200 hover:border-slate-300 bg-white dark:border-slate-800 dark:bg-slate-950/40";
                  if (isSelected && !isAnswerChecked) {
                    cardStyle = "border-violet-600 bg-violet-50/20 text-violet-800 dark:text-violet-300";
                  } else if (isAnswerChecked) {
                    if (isCorrectAnswer) {
                      cardStyle = "border-emerald-500 bg-emerald-50/20 text-emerald-800 dark:text-emerald-400";
                    } else if (isSelected) {
                      cardStyle = "border-rose-500 bg-rose-50/20 text-rose-800 dark:text-rose-400";
                    } else {
                      cardStyle = "border-slate-100 opacity-60 bg-white dark:border-slate-800 dark:bg-slate-950/40";
                    }
                  }

                  return (
                    <div 
                      key={idx}
                      onClick={() => handleOptionSelect(idx)}
                      className={`flex cursor-pointer items-center justify-between rounded-xl border p-4 transition-all duration-150 ${cardStyle}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs font-extrabold text-slate-400 uppercase tracking-widest">{String.fromCharCode(65 + idx)}.</span>
                        <p className="text-xs tracking-wide leading-relaxed font-medium">{option}</p>
                      </div>

                      {/* Tick or Cross indicators */}
                      {isAnswerChecked && isCorrectAnswer && <CheckCircle className="h-5 w-5 shrink-0 text-emerald-500" />}
                      {isAnswerChecked && isSelected && !isCorrectAnswer && <XCircle className="h-5 w-5 shrink-0 text-rose-500" />}
                    </div>
                  );
                })}
              </div>

              {/* Visual scientific details validation block */}
              {isAnswerChecked && (
                <div className={`rounded-xl border p-4 space-y-1.5 transition-all duration-300 ${
                  selectedOption === currentQuestion.correctOptionIndex 
                    ? 'border-emerald-100 bg-emerald-50/30 text-emerald-900 dark:bg-slate-950 dark:border-slate-800' 
                    : 'border-rose-100 bg-rose-50/30 text-rose-900 dark:bg-slate-950 dark:border-slate-800'
                }`}>
                  <div className="flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider dark:text-slate-300">
                    <BookOpen className="h-4 w-4" />
                    <span>Academic Proof Explanation:</span>
                  </div>
                  <p className="text-xs leading-relaxed font-medium dark:text-slate-400">
                    {currentQuestion.explanation}
                  </p>
                </div>
              )}

              {/* Bottom toolbar mechanics check / next */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                {!isAnswerChecked ? (
                  <button 
                    onClick={handleCheckAnswer}
                    disabled={selectedOption === null}
                    className="flex items-center gap-1 rounded-xl bg-slate-900 px-6 py-2.5 text-xs font-bold text-white shadow-md disabled:opacity-40 hover:bg-slate-800 dark:bg-violet-600 dark:hover:bg-violet-500 whitespace-nowrap"
                  >
                    Submit Proof Answer
                  </button>
                ) : (
                  <button 
                    onClick={handleNextQuestion}
                    className="flex items-center gap-1.5 rounded-xl bg-violet-600 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-violet-500"
                  >
                    <span>{currentIndex === totalQuestions - 1 ? "Finish Exam Sheet" : "Next Question"}</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ) : (
            // Quiz Results review panel
            <div className="flex flex-col items-center justify-center text-center py-6 space-y-6">
              <div className={`rounded-full p-5 ${hasPassed ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                <Award className="h-12 w-12" />
              </div>

              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400">Assessment Analysis</span>
                <h3 className="text-xl font-black text-slate-800 dark:text-slate-100">{hasPassed ? "Passed Successfully!" : "Study Limit Not Reached"}</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm">
                  {hasPassed 
                    ? "Congratulations! Your syllabus progress map has been updated. Prerequisite modules are unlocked." 
                    : "Review Planck dual mechanics or Big-O complexities and retake the assessment quiz to unlock next learning paths."}
                </p>
              </div>

              {/* Score Display metrics */}
              <div className="flex gap-6 rounded-2xl border border-slate-100 bg-slate-50 p-4 shrink-0 dark:border-slate-800 dark:bg-slate-950">
                <div className="text-center px-4">
                  <span className="text-[10px] text-slate-400 uppercase font-mono font-bold">Accuracy</span>
                  <h4 className="text-2xl font-black text-slate-800 dark:text-slate-100">{finalScorePct}%</h4>
                </div>
                <div className="w-px bg-slate-200"></div>
                <div className="text-center px-4">
                  <span className="text-[10px] text-slate-400 uppercase font-mono font-bold">Correct Proofs</span>
                  <h4 className="text-2xl font-black text-slate-800 dark:text-slate-100">{correctAnswersCount} / {totalQuestions}</h4>
                </div>
              </div>

              {/* CTA Toggles */}
              <div className="flex items-center gap-3 pt-4">
                <button 
                  onClick={handleResetQuiz}
                  className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Try Again Analysis
                </button>
                <button 
                  onClick={() => {
                    onQuizCompleted();
                    onClose();
                  }}
                  className="rounded-xl bg-violet-600 px-6 py-2.5 text-xs font-bold text-white hover:bg-violet-500 shadow-md"
                >
                  Verify syllabus progress
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
