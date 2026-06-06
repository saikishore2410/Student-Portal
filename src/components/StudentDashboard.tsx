import { useState, useEffect } from 'react';
import { 
  OfflineStorage 
} from '../lib/database';
import { 
  UserProfile, 
  LearningPath, 
  CalendarEvent,
  CourseNotification 
} from '../types';
import { 
  OverviewMetricsGrid, 
  PerformanceChart, 
  StudyTrendLineChart, 
  RadialCompletionHalo 
} from './AnalyticsCharts';
import { 
  Sparkles, 
  RefreshCw, 
  Wifi, 
  WifiOff, 
  AlertTriangle, 
  CheckCircle, 
  ArrowRight,
  BookOpen,
  Eye,
  Calendar,
  MessageSquare
} from 'lucide-react';

interface StudentDashboardProps {
  user: UserUserProfile;
  onNavigateToPath: (pathId: string) => void;
  onNavigateToSection: (section: string) => void;
}

// Handle naming type maps
type UserUserProfile = UserProfile;

export default function StudentDashboard({ user, onNavigateToPath, onNavigateToSection }: StudentDashboardProps) {
  const [paths, setPaths] = useState<LearningPath[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [notifs, setNotifs] = useState<CourseNotification[]>([]);
  const [isOnline, setIsOnline] = useState<boolean>(true);
  
  // AI Recommendations state
  const [aiDoc, setAiDoc] = useState<string>("");
  const [aiTips, setAiTips] = useState<string[]>([]);
  const [loadingAi, setLoadingAi] = useState<boolean>(false);
  const [syncing, setSyncing] = useState<boolean>(false);
  const [syncSuccess, setSyncSuccess] = useState<boolean>(false);

  useEffect(() => {
    setPaths(OfflineStorage.getPaths());
    setEvents(OfflineStorage.getCalendar().filter(e => !e.completed).slice(0, 3));
    setNotifs(OfflineStorage.getNotifications().filter(n => !n.read));
    setIsOnline(OfflineStorage.getOnlineMode());

    // Pull default local advice
    setAiDoc("Click below to utilize our server-side secure Gemini engine, generating highly personalized, mathematically rigorous study path recommendations based on your average quiz scores, active study streaks, and computational homework patterns.");
    setAiTips([
      "Complete Planck dual wave Mechanics quiz unit to advance.",
      "Review Big-O complex recursion formulas before examinations.",
      "Deregister offline study logs during live group study."
    ]);
  }, []);

  const handleToggleOnline = () => {
    const newVal = !isOnline;
    setIsOnline(newVal);
    OfflineStorage.setOnlineMode(newVal);
  };

  const syncStateWithCloud = async () => {
    setSyncing(true);
    // Simulate real cloud collection mapping syncing over full infrastructure
    await new Promise(resolve => setTimeout(resolve, 1400));
    const docs = OfflineStorage.getDocuments();
    const updatedDocs = docs.map(d => ({ ...d, synced: true }));
    OfflineStorage.setDocuments(updatedDocs);
    setSyncing(false);
    setSyncSuccess(true);
    setTimeout(() => setSyncSuccess(false), 3000);
  };

  const triggerGeminiAdvisor = async () => {
    setLoadingAi(true);
    try {
      const activePath = paths[0]; // Physics course metrics
      const response = await fetch("/api/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentName: user.name,
          averageQuizScore: 86,
          studyTimeHours: 12.5,
          activeStreakDays: 12,
          subjectName: activePath ? activePath.title : "Quantum Mechanics and Discrete Algorithms"
        })
      });

      if (!response.ok) {
        throw new Error("Advisor API offline or key missing");
      }

      const data = await response.json();
      if (data.recommendation) {
        setAiDoc(data.recommendation);
        setAiTips(data.tips || []);
      }
    } catch {
      // Offline fallback instructions
      setAiDoc("Socratic Advisor [Offline Fallback Mode]: Focus immediately on Unit 2's Superposition metrics. Your mathematical calculus scores are highly adequate, but visualising complex vector matrices in Hilbert space benefits significantly from repeated interactive evaluations. Practice for 15 minutes before the lab exam.");
      setAiTips([
        "Calculate bra-ket representations twice.",
        "Ensure memoization matrix fits bounds.",
        "Sync local note storage documents."
      ]);
    } finally {
      setLoadingAi(false);
    }
  };

  const getOverallProgress = () => {
    if (paths.length === 0) return 0;
    const total = paths.reduce((acc, p) => acc + p.progress, 0);
    return Math.round(total / paths.length);
  };

  return (
    <div className="space-y-6">
      {/* Dynamic Sync Status bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-900/60">
        <div className="flex items-center gap-3">
          <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${isOnline ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40' : 'bg-amber-100 text-amber-600 dark:bg-amber-950/40'}`}>
            {isOnline ? <Wifi className="h-5 w-5" /> : <WifiOff className="h-5 w-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                {isOnline ? "Operational Cloud Interface" : "Remote Local Offline Study Mode"}
              </span>
              <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${isOnline ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              {isOnline ? "Syncing data securely with full-stack academic servers." : "All edits cached locally. You can take quizzes, write notes fully offline!"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={handleToggleOnline}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            {isOnline ? "Simulate Going Offline" : "Connect Online"}
          </button>
          
          <button 
            onClick={syncStateWithCloud}
            disabled={syncing}
            className="flex items-center gap-1.5 rounded-lg bg-violet-600 px-4.5 py-2 text-xs font-semibold text-white shadow hover:bg-violet-500 disabled:opacity-50"
          >
            <RefreshCw className={`h-3 w-3 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Syncing...' : 'Sync Cloud Locker'}
          </button>
        </div>
      </div>

      {syncSuccess && (
        <div className="flex items-center gap-2 rounded-lg bg-emerald-50 p-3 text-xs font-medium text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400">
          <CheckCircle className="h-4 w-4" />
          Offline edits merged successfully! Local file locker synced to secure server-side storage databases.
        </div>
      )}

      {/* Overview stats grid */}
      <OverviewMetricsGrid />

      {/* Main split: Visual charts & Learning Paths */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left 2/3 column: Recommendation engine & Visual Charts */}
        <div className="space-y-6 lg:col-span-2">
          {/* AI-powered Personalized advice card */}
          <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-violet-50/50 p-6 shadow-sm dark:border-slate-800 dark:from-slate-900 dark:to-violet-950/20">
            <div className="absolute top-0 right-0 h-40 w-40 translate-x-12 -translate-y-12 rounded-full bg-violet-500/10 blur-2xl"></div>
            
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-2 text-violet-600 dark:text-violet-400">
                <Sparkles className="h-5 w-5" />
                <h2 className="text-sm font-bold uppercase tracking-wider">AI Personalized Socratic Advisor</h2>
              </div>
              
              <button 
                onClick={triggerGeminiAdvisor}
                disabled={loadingAi}
                className="flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-violet-700 shadow-sm border border-violet-100 hover:bg-violet-50 disabled:opacity-50 dark:bg-slate-900 dark:border-slate-800"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loadingAi ? 'animate-spin' : ''}`} />
                {loadingAi ? 'Advisor Analyzing...' : 'Rerun AI Advisor'}
              </button>
            </div>

            <p className="mt-4 leading-relaxed text-slate-700 dark:text-slate-300 text-sm">
              {aiDoc}
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {aiTips.map((tip, index) => (
                <div key={index} className="rounded-lg border border-violet-100/60 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
                  <span className="font-mono text-xs font-bold text-violet-500">TIP #{index + 1}</span>
                  <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 font-medium leading-normal">{tip}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive visual analytical graphs */}
          <div className="grid gap-6 sm:grid-cols-2">
            <PerformanceChart />
            <StudyTrendLineChart />
          </div>
        </div>

        {/* Right 1/3 column: Path mapping progress list & deadlines calendar */}
        <div className="space-y-6">
          {/* Circular total path accuracy completion widget */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h3 className="font-semibold text-slate-800 dark:text-slate-200">Aggregate Progress Track</h3>
            <p className="text-xs text-slate-500 mb-2">Classroom Syllabus completion index</p>
            <RadialCompletionHalo pct={getOverallProgress()} />
          </div>

          {/* Paths Quick Navigation */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h3 className="font-semibold text-slate-800 dark:text-slate-200">Learning Path Modules</h3>
            <p className="text-xs text-slate-500 mb-4">Click to open syllabus path mapping and launch lesson quizzes.</p>
            
            <div className="space-y-3">
              {paths.map(path => (
                <div 
                  key={path.id} 
                  onClick={() => onNavigateToPath(path.id)}
                  className="group flex cursor-pointer items-center justify-between rounded-lg border border-slate-100 p-3 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800"
                >
                  <div className="flex-1 min-w-0 pr-2">
                    <span className="text-[10px] font-mono text-slate-400 font-medium uppercase">{path.subject}</span>
                    <h4 className="truncate text-sm font-semibold text-slate-700 group-hover:text-violet-600 dark:text-slate-200 dark:group-hover:text-violet-400">
                      {path.title}
                    </h4>
                    <div className="mt-2 h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800">
                      <div 
                        className="h-1.5 rounded-full bg-emerald-500 transition-all duration-500" 
                        style={{ width: `${path.progress}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="rounded-full bg-slate-100 p-1.5 text-slate-400 group-hover:bg-violet-100 group-hover:text-violet-600 dark:bg-slate-800 dark:group-hover:bg-violet-950">
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming deliverables notifications */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold text-slate-800 dark:text-slate-200">Deadline Deadlines</h3>
              <button 
                onClick={() => onNavigateToSection('calendar')} 
                className="text-xs font-semibold text-violet-600 hover:underline dark:text-violet-400"
              >
                Calendar
              </button>
            </div>

            <div className="space-y-3">
              {events.map(item => (
                <div key={item.id} className="flex gap-3 rounded-lg border border-slate-50 p-2.5 dark:border-slate-800">
                  <div className="mt-0.5 rounded bg-amber-50 p-1.5 text-amber-600 dark:bg-amber-950/50">
                    <Calendar className="h-4 w-4" id={`evt-icon-${item.id}`} />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200">{item.title}</h4>
                    <p className="text-[10px] text-slate-500">{item.description}</p>
                    <span className="mt-1 inline-block text-[9px] font-mono font-medium text-rose-500">
                      Due: {new Date(item.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
