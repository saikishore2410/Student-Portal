import { useState, useEffect, FormEvent } from 'react';
import { 
  OfflineStorage 
} from '../lib/database';
import { 
  UserProfile, 
  LearningPath, 
  CourseNotification,
  AnalyticMetric 
} from '../types';
import { 
  Users, 
  Sparkles, 
  FolderPlus, 
  BellRing, 
  Plus, 
  AlertTriangle, 
  CheckCircle, 
  BookOpen, 
  TrendingUp, 
  UserX,
  Mail,
  Zap,
  Trash2
} from 'lucide-react';

export default function TeacherDashboard() {
  const [analytics, setAnalytics] = useState<AnalyticMetric[]>([]);
  const [paths, setPaths] = useState<LearningPath[]>([]);
  
  // Custom Path author States
  const [newPathTitle, setNewPathTitle] = useState<string>("");
  const [newPathSubject, setNewPathSubject] = useState<string>("");
  const [newPathDesc, setNewPathDesc] = useState<string>("");
  const [newUnitTitle, setNewUnitTitle] = useState<string>("");
  const [newUnitMinutes, setNewUnitMinutes] = useState<number>(30);
  const [newUnitDesc, setNewUnitDesc] = useState<string>("");

  // Broadcast notifier States
  const [broadcastTitle, setBroadcastTitle] = useState<string>("");
  const [broadcastMessage, setBroadcastMessage] = useState<string>("");
  const [broadcastSuccess, setBroadcastSuccess] = useState<boolean>(false);

  useEffect(() => {
    setAnalytics(OfflineStorage.getAnalytics());
    setPaths(OfflineStorage.getPaths());
  }, []);

  const handleSendNotification = (e: FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle || !broadcastMessage) return;

    const notifs = OfflineStorage.getNotifications();
    notifs.unshift({
      id: `notif_prof_${Date.now()}`,
      title: `Broadcast: ${broadcastTitle}`,
      message: broadcastMessage,
      type: 'alert',
      createdAt: new Date().toISOString(),
      read: false
    });

    OfflineStorage.setNotifications(notifs);
    setBroadcastTitle("");
    setBroadcastMessage("");
    setBroadcastSuccess(true);
    setTimeout(() => setBroadcastSuccess(false), 3000);
  };

  const handleCreatePath = (e: FormEvent) => {
    e.preventDefault();
    if (!newPathTitle || !newPathSubject || !newPathDesc || !newUnitTitle) return;

    const currentPaths = OfflineStorage.getPaths();
    const newPathId = `path_custom_${Date.now()}`;
    const newQuizId = `quiz_custom_${Date.now()}`;

    const newPath: LearningPath = {
      id: newPathId,
      title: newPathTitle,
      subject: newPathSubject,
      description: newPathDesc,
      progress: 0,
      recommendedHoursPerWeek: 5,
      units: [
        {
          id: `unit_custom_${Date.now()}`,
          title: newUnitTitle,
          description: newUnitDesc || "An introductory conceptual review session covering the syllabus structures.",
          status: 'unlocked', // Initially available
          estimatedMinutes: newUnitMinutes,
          quizId: newQuizId,
          order: 1,
          aiInsights: "AI generated helper: Focus on first-principles reasoning to construct logical proofs."
        }
      ]
    };

    // Also inject corresponding empty baseline quiz so launching doesn't fail
    const quizzes = OfflineStorage.getQuizzes();
    quizzes.push({
      id: newQuizId,
      title: `${newUnitTitle} Quiz`,
      topic: newUnitTitle,
      passingScore: 70,
      questions: [
        {
          id: `qc_${Date.now()}`,
          question: `Which represents the primary operational model discussed in "${newUnitTitle}"?`,
          options: ["Linear computational execution matrices", "Normalized distribution functions", "Asymptotic system scaling", "Adaptive memoized arrays"],
          correctOptionIndex: 0,
          explanation: "Standard vector arrays maintain algebraic computational linearity."
        }
      ]
    });

    const updatedPaths = [...currentPaths, newPath];
    OfflineStorage.setPaths(updatedPaths);
    OfflineStorage.setQuizzes(quizzes);
    setPaths(updatedPaths);

    // Reset layout fields
    setNewPathTitle("");
    setNewPathSubject("");
    setNewPathDesc("");
    setNewUnitTitle("");
    setNewUnitDesc("");
    
    alert(`Successfully authored learning path: "${newPathTitle}" and uploaded assessment quizzes. Sync activated.`);
  };

  const handleDeletePath = (pathId: string) => {
    if (confirm("Are you sure you want to delete this custom learning module?")) {
      const updated = paths.filter(p => p.id !== pathId);
      OfflineStorage.setPaths(updated);
      setPaths(updated);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100">University Professor Control Deck</h1>
        <p className="text-xs text-slate-500">Monitor active student performance thresholds, create adaptive courses, and broadcast notifications.</p>
      </div>

      {/* Overview Analytics Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-indigo-50 p-2.5 text-indigo-600 dark:bg-indigo-950/50">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">REGISTERED CLASS SIZE</span>
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">4 Active</h3>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <div className={`rounded-lg bg-emerald-50 p-2.5 text-emerald-600 dark:bg-emerald-900/50`}>
              <CheckCircle className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">AVERAGE QUIZ YIELD</span>
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">81.0%</h3>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-orange-50 p-2.5 text-orange-600 dark:bg-orange-950/50">
              <AlertTriangle className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">RISK ESCALATION ALERTS</span>
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">1 Student</h3>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-violet-50 p-2.5 text-violet-600 dark:bg-violet-950/50">
              <TrendingUp className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">TOTAL STUDY CREDIT HOURS</span>
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 font-mono">56.6 hrs</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Student progress metrics & Risk alerts */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Risk Alerts & Metrics table */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:col-span-2">
          <h3 className="font-bold text-slate-800 dark:text-slate-200">Class Performance analytics</h3>
          <p className="text-xs text-slate-500 mb-4">Track progress thresholds. High risk alerts trigger on scores &lt;70% with low active study streak.</p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-500">
              <thead className="bg-slate-50 text-[10px] uppercase font-mono tracking-wider dark:bg-slate-950">
                <tr>
                  <th className="px-3 py-2.5 rounded-l-md">Student Profile</th>
                  <th className="px-3 py-2.5">Progress Units</th>
                  <th className="px-3 py-2.5">Avg Score</th>
                  <th className="px-3 py-2.5">Study Hours</th>
                  <th className="px-3 py-2.5">Active Streak</th>
                  <th className="px-3 py-2.5 rounded-r-md">Alert State</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {analytics.map(item => {
                  const student = OfflineStorage.getMockStudents().find(s => s.id === item.studentId);
                  
                  return (
                    <tr key={item.studentId} className="hover:bg-slate-50/50">
                      <td className="px-3 py-3 font-semibold text-slate-800 dark:text-slate-200">
                        <div className="flex items-center gap-2">
                          <img 
                            src={student?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50&auto=format"} 
                            className="h-6 w-6 rounded-full" 
                            alt={item.studentName} 
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <p className="truncate w-[100px] sm:w-auto">{item.studentName}</p>
                            <span className="text-[9px] text-slate-400 font-mono block">{student?.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3 font-sans font-medium">{item.unitsCompleted} Completed</td>
                      <td className={`px-3 py-3 font-mono font-bold ${item.averageQuizScore >= 80 ? 'text-emerald-600' : item.averageQuizScore >= 70 ? 'text-amber-600' : 'text-rose-600'}`}>
                        {item.averageQuizScore}%
                      </td>
                      <td className="px-3 py-3 font-mono">{item.studyTimeHours} hrs</td>
                      <td className="px-3 py-3 font-medium">{item.activeStreakDays} Days</td>
                      <td className="px-3 py-3">
                        <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                          item.alertLevel === 'low' 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : item.alertLevel === 'medium'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800 animate-pulse'
                        }`}>
                          {item.alertLevel === 'low' ? 'Good Standing' : item.alertLevel === 'medium' ? 'Review Warning' : 'Critical High Risk'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Global Alert Notification sender */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-1.5 text-violet-600 dark:text-violet-400">
            <BellRing className="h-5 w-5" id="teacher-notif-icon" />
            <h3 className="font-bold text-slate-800 dark:text-slate-200">Push Class Notification</h3>
          </div>
          <p className="text-xs text-slate-500 mt-1 mb-4">Send instant alerts to student notification centers, updating deadline constraints.</p>

          {broadcastSuccess && (
            <div className="mb-4 rounded-lg bg-emerald-50 p-2 text-xs font-semibold text-emerald-800">
              Broadcast updated successfully! Students notified.
            </div>
          )}

          <form onSubmit={handleSendNotification} className="space-y-3">
            <div>
              <label className="text-[10px] font-mono font-bold text-slate-400 block mb-1">ALERT TITLE</label>
              <input 
                type="text" 
                value={broadcastTitle}
                onChange={(e) => setBroadcastTitle(e.target.value)}
                placeholder="e.g. Rescheduled Whiteboard Lecture" 
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-violet-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                required
              />
            </div>
            <div>
              <label className="text-[10px] font-mono font-bold text-slate-400 block mb-1">BROADCAST MESSAGE BODY</label>
              <textarea 
                rows={3}
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
                placeholder="Attention: Unit 2 superposition calculations session starts at 4 PM in the lecture room. Access handouts." 
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-violet-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                required
              />
            </div>
            <button 
              type="submit" 
              className="w-full rounded-xl bg-slate-900 py-2 text-xs font-bold text-white hover:bg-slate-800 shadow"
            >
              Push Class alert
            </button>
          </form>
        </div>
      </div>

      {/* Dynamic Learning Path Creator Panel */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Creator Portal form */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-1.5 text-violet-600 dark:text-violet-400">
            <FolderPlus className="h-5 w-5" id="path-creator-icon" />
            <h3 className="font-bold text-slate-850">Syllabus Path Creator Tool</h3>
          </div>
          <p className="text-xs text-slate-500 mt-1 mb-4">Draft new learning modules. Upon submission, dynamic quiz and analytical schemas compile automatically.</p>

          <form onSubmit={handleCreatePath} className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="text-[10px] font-mono font-bold text-slate-400 block mb-1">COURSE NAME</label>
                <input 
                  type="text" 
                  value={newPathTitle}
                  onChange={(e) => setNewPathTitle(e.target.value)}
                  placeholder="Intro to Distributed Systems" 
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-violet-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                  required
                />
              </div>
              <div>
                <label className="text-[10px] font-mono font-bold text-slate-400 block mb-1">SUBJECT CATEGORY</label>
                <input 
                  type="text" 
                  value={newPathSubject}
                  onChange={(e) => setNewPathSubject(e.target.value)}
                  placeholder="Computer Science" 
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-violet-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-mono font-bold text-slate-400 block mb-1">PATH DESCRIPTION</label>
              <textarea 
                rows={2}
                value={newPathDesc}
                onChange={(e) => setNewPathDesc(e.target.value)}
                placeholder="Covers Raft consensuses, vector state machine operations, and transactional logs synchronization constraints..." 
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-violet-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950"
                required
              />
            </div>

            {/* Baseline Unit nested items */}
            <div className="rounded-lg border border-dashed border-violet-100 p-3 bg-violet-50/20 dark:border-slate-800">
              <span className="text-[9px] font-bold font-mono text-violet-600 block mb-2">INITIAL BASELINE STUDYSHEET</span>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="sm:col-span-2">
                  <input 
                    type="text" 
                    value={newUnitTitle}
                    onChange={(e) => setNewUnitTitle(e.target.value)}
                    placeholder="Unit 1: Raft State Consensuses" 
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs focus:border-violet-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950"
                    required
                  />
                </div>
                <div>
                  <input 
                    type="number" 
                    value={newUnitMinutes}
                    onChange={(e) => setNewUnitMinutes(Number(e.target.value))}
                    placeholder="45" 
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs focus:border-violet-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950"
                    required
                  />
                </div>
              </div>
              <input 
                type="text"
                value={newUnitDesc}
                onChange={(e) => setNewUnitDesc(e.target.value)}
                placeholder="Optional study guide insights and Planck duality math guidelines." 
                className="w-full mt-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs focus:border-violet-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950"
              />
            </div>

            <button 
              type="submit" 
              className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-violet-600 py-3 text-xs font-bold text-white shadow-md hover:bg-violet-500 transition-all"
            >
              <Plus className="h-4 w-4" />
              Compile & Inject Course Module
            </button>
          </form>
        </div>

        {/* List of current Active Modules with deletion capability */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h3 className="font-bold text-slate-800 dark:text-slate-200">Active Syllabus Inventory</h3>
          <p className="text-xs text-slate-500 mb-4">Click corresponding removal triggers to prune depleted courses or re-assess current syllabi.</p>

          <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
            {paths.map(path => (
              <div key={path.id} className="flex items-center justify-between border border-slate-50 p-3 rounded-lg dark:border-slate-800">
                <div className="min-w-0 flex-1">
                  <span className="text-[9px] font-mono font-medium text-violet-600 uppercase bg-violet-50 px-1.5 py-0.5 rounded dark:bg-violet-950/20">{path.subject}</span>
                  <h4 className="mt-1 text-sm font-semibold text-slate-800 truncate dark:text-slate-200">{path.title}</h4>
                  <p className="text-[10px] text-slate-400 truncate">{path.description}</p>
                </div>
                <button 
                  onClick={() => handleDeletePath(path.id)}
                  className="rounded-lg p-2 text-rose-500 hover:bg-rose-50"
                  title="Remove Path"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
