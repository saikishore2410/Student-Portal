import { useState, useEffect } from 'react';
import { 
  UserProfile 
} from './types';
import { 
  OfflineStorage 
} from './lib/database';
import { useDbChange } from './lib/useDbChange';
import AuthView from './components/AuthView';
import StudentDashboard from './components/StudentDashboard';
import TeacherDashboard from './components/TeacherDashboard';
import PathView from './components/PathView';
import QuizView from './components/QuizView';
import VideoRoom from './components/VideoRoom';
import Messaging from './components/Messaging';
import FileLocker from './components/FileLocker';
import CalendarView from './components/CalendarView';
import NotificationsPane from './components/NotificationsPane';

import { 
  Cpu, 
  Home, 
  BookOpen, 
  MessageSquare, 
  Database, 
  Calendar, 
  BellRing, 
  Video, 
  LogOut, 
  Menu, 
  X,
  BadgeAlert,
  UserCheck2,
  Lock
} from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [activePathId, setActivePathId] = useState<string | null>(null);
  const [activeQuizId, setActiveQuizId] = useState<string | null>(null);
  const [videoRoomOpen, setVideoRoomOpen] = useState<boolean>(false);
  
  // Mobile responsive sidebar toggle
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  useDbChange();

  useEffect(() => {
    const user = OfflineStorage.getUser();
    if (user) {
      setCurrentUser(user);
    }
  }, []);

  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    setActiveTab("dashboard");
  };

  const handleLogout = () => {
    OfflineStorage.setUser(null as any);
    setCurrentUser(null);
    setActiveTab("dashboard");
    setActivePathId(null);
  };

  const handleNavigateToPath = (pathId: string) => {
    setActivePathId(pathId);
    setActiveTab("paths");
    setSidebarOpen(false);
  };

  const handleNavigateToSection = (section: string) => {
    setActiveTab(section);
    setSidebarOpen(false);
  };

  if (!currentUser) {
    return <AuthView onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans transition-colors duration-300">
      
      {/* Top Banner Navigation Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm dark:bg-slate-900 dark:border-slate-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">
            
            <div className="flex items-center gap-3">
              {/* Mobile hamburger selector */}
              <button 
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden dark:hover:bg-slate-800"
              >
                {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>

              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-600 text-white shadow-md">
                  <Cpu className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[10px] font-mono tracking-wider text-violet-600 uppercase font-bold dark:text-violet-400">Personalized Academy</span>
                  <h1 className="text-sm font-black text-slate-900 leading-none dark:text-white">Student Portal</h1>
                </div>
              </div>
            </div>

            {/* Quick access conferencing buttons and user settings menu */}
            <div className="flex items-center gap-2.5">
              <button 
                onClick={() => setVideoRoomOpen(true)}
                className="flex items-center gap-1.5 rounded-full bg-red-600 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-red-500 transition-all cursor-pointer animate-pulse"
              >
                <Video className="h-4 w-4" />
                <span>Lecture Board (Live)</span>
              </button>

              <div className="h-8 w-px bg-slate-200 dark:bg-slate-850"></div>

              {/* User badge */}
              <div className="flex items-center gap-2">
                <img 
                  src={currentUser.avatar} 
                  className="h-8 w-8 rounded-full border border-violet-100/40" 
                  alt={currentUser.name} 
                  referrerPolicy="no-referrer"
                />
                <div className="hidden sm:block">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">{currentUser.name}</h4>
                  <span className="text-[9px] font-mono uppercase text-slate-400 tracking-wider">
                    {currentUser.role === 'teacher' ? 'Professor' : 'Research Student'}
                  </span>
                </div>
              </div>

              <button 
                onClick={handleLogout}
                className="rounded-lg p-2 text-slate-400 hover:text-slate-650 hover:bg-slate-50 dark:hover:bg-slate-800"
                title="Disconnect ssl session session"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* Main double column split layouts */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 gap-6">
        
        {/* Navigation Sidebar panel (Large screen display blocks) */}
        <aside className="hidden lg:block w-64 shrink-0 space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <span className="text-[9px] font-mono tracking-widest text-slate-400 font-extrabold uppercase uppercase">CAMPUS SYLLABI INDEX</span>
            
            <nav className="mt-3.5 space-y-1">
              <button 
                onClick={() => handleNavigateToSection('dashboard')}
                className={`flex w-full items-center gap-2.5 rounded-xl px-4 py-3 text-xs font-bold transition-all ${
                  activeTab === 'dashboard'
                    ? 'bg-violet-600 text-white shadow-md'
                    : 'text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-850'
                }`}
              >
                <Home className="h-4 w-4" />
                Flight Deck Dashboard
              </button>

              <button 
                onClick={() => handleNavigateToSection('paths')}
                className={`flex w-full items-center gap-2.5 rounded-xl px-4 py-3 text-xs font-bold transition-all ${
                  activeTab === 'paths'
                    ? 'bg-violet-600 text-white shadow-md'
                    : 'text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-850'
                }`}
              >
                <BookOpen className="h-4 w-4" />
                Learning Paths Map
              </button>

              <button 
                onClick={() => handleNavigateToSection('messaging')}
                className={`flex w-full items-center gap-2.5 rounded-xl px-4 py-3 text-xs font-bold transition-all ${
                  activeTab === 'messaging'
                    ? 'bg-violet-600 text-white shadow-md'
                    : 'text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-850'
                }`}
              >
                <MessageSquare className="h-4 w-4" />
                Direct Chat lanes
              </button>

              <button 
                onClick={() => handleNavigateToSection('locker')}
                className={`flex w-full items-center gap-2.5 rounded-xl px-4 py-3 text-xs font-bold transition-all ${
                  activeTab === 'locker'
                    ? 'bg-violet-600 text-white shadow-md'
                    : 'text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-850'
                }`}
              >
                <Database className="h-4 w-4" />
                Cloud File Locker
              </button>

              <button 
                onClick={() => handleNavigateToSection('calendar')}
                className={`flex w-full items-center gap-2.5 rounded-xl px-4 py-3 text-xs font-bold transition-all ${
                  activeTab === 'calendar'
                    ? 'bg-violet-600 text-white shadow-md'
                    : 'text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-850'
                }`}
              >
                <Calendar className="h-4 w-4" />
                Schedules Calendar
              </button>

              <button 
                onClick={() => handleNavigateToSection('notifications')}
                className={`flex w-full items-center gap-2.5 rounded-xl px-4 py-3 text-xs font-bold transition-all ${
                  activeTab === 'notifications'
                    ? 'bg-violet-600 text-white shadow-md'
                    : 'text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-850'
                }`}
              >
                <BellRing className="h-4 w-4" />
                Course Updates Pushes
              </button>
            </nav>
          </div>
        </aside>

        {/* Mobile slide-out overlay sidebar details */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setSidebarOpen(false)}></div>
            <div className="relative flex w-full max-w-xs flex-col bg-white p-5 shadow-2xl dark:bg-slate-900">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Academy Syllabus Index</span>
                <button onClick={() => setSidebarOpen(false)} className="text-slate-400">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <nav className="mt-4 space-y-1">
                <button 
                  onClick={() => handleNavigateToSection('dashboard')}
                  className={`flex w-full items-center gap-2.5 rounded-xl px-4 py-3 text-xs font-bold ${
                    activeTab === 'dashboard' ? 'bg-violet-600 text-white' : 'text-slate-605'
                  }`}
                >
                  <Home className="h-4 w-4" />
                  Flight Deck Dashboard
                </button>
                <button 
                  onClick={() => handleNavigateToSection('paths')}
                  className={`flex w-full items-center gap-2.5 rounded-xl px-4 py-3 text-xs font-bold ${
                    activeTab === 'paths' ? 'bg-violet-600 text-white' : 'text-slate-605'
                  }`}
                >
                  <BookOpen className="h-4 w-4" />
                  Learning Paths Map
                </button>
                <button 
                  onClick={() => handleNavigateToSection('messaging')}
                  className={`flex w-full items-center gap-2.5 rounded-xl px-4 py-3 text-xs font-bold ${
                    activeTab === 'messaging' ? 'bg-violet-600 text-white' : 'text-slate-605'
                  }`}
                >
                  <MessageSquare className="h-4 w-4" />
                  Direct Chat lanes
                </button>
                <button 
                  onClick={() => handleNavigateToSection('locker')}
                  className={`flex w-full items-center gap-2.5 rounded-xl px-4 py-3 text-xs font-bold ${
                    activeTab === 'locker' ? 'bg-violet-600 text-white' : 'text-slate-605'
                  }`}
                >
                  <Database className="h-4 w-4" />
                  Cloud File Locker
                </button>
                <button 
                  onClick={() => handleNavigateToSection('calendar')}
                  className={`flex w-full items-center gap-2.5 rounded-xl px-4 py-3 text-xs font-bold ${
                    activeTab === 'calendar' ? 'bg-violet-600 text-white' : 'text-slate-605'
                  }`}
                >
                  <Calendar className="h-4 w-4" />
                  Schedules Calendar
                </button>
                <button 
                  onClick={() => handleNavigateToSection('notifications')}
                  className={`flex w-full items-center gap-2.5 rounded-xl px-4 py-3 text-xs font-bold ${
                    activeTab === 'notifications' ? 'bg-violet-600 text-white' : 'text-slate-605'
                  }`}
                >
                  <BellRing className="h-4 w-4" />
                  Course Updates Pushes
                </button>
              </nav>
            </div>
          </div>
        )}

        {/* Core dynamic content controller viewport */}
        <main className="flex-1 min-w-0">
          
          {/* Substantive Panel routing toggle */}
          {activeTab === 'dashboard' && (
            currentUser.role === 'student' ? (
              <StudentDashboard 
                user={currentUser} 
                onNavigateToPath={handleNavigateToPath}
                onNavigateToSection={handleNavigateToSection}
              />
            ) : (
              <TeacherDashboard />
            )
          )}

          {activeTab === 'paths' && (
            activePathId ? (
              <PathView 
                pathId={activePathId} 
                onBack={() => setActivePathId(null)}
                onLaunchQuiz={(quizId) => setActiveQuizId(quizId)}
              />
            ) : (
              <div className="space-y-6">
                <div className="flex flex-col gap-1">
                  <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Learning Path Modules</h2>
                  <p className="text-xs text-slate-500">Pick any available syllabus path catalog card to review units notes and start assessment quizzes.</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {OfflineStorage.getPaths().map(path => (
                    <div 
                      key={path.id}
                      onClick={() => handleNavigateToPath(path.id)}
                      className="rounded-2xl border border-slate-200 bg-white p-5 hover:border-slate-350 cursor-pointer transition-all shadow-sm dark:border-slate-800 dark:bg-slate-900"
                    >
                      <span className="text-[10px] font-mono tracking-widest text-violet-600 uppercase font-bold">{path.subject}</span>
                      <h3 className="mt-1 font-bold text-lg text-slate-800 dark:text-slate-100 leading-snug">{path.title}</h3>
                      <p className="text-xs text-slate-500 mt-1 lines-clamp-3 leading-normal">{path.description}</p>
                      
                      <div className="mt-4 flex items-center justify-between border-t border-slate-50 pt-3 dark:border-slate-850">
                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Completion Track:</span>
                        <span className="text-xs font-mono font-bold text-violet-600">{path.progress}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          )}

          {/* Secure Messaging console viewport */}
          {activeTab === 'messaging' && <Messaging currentUser={currentUser} />}

          {/* Cloud document locker interface */}
          {activeTab === 'locker' && <FileLocker ownerId={currentUser.id} />}

          {/* Calendars Agenda tracking milestones */}
          {activeTab === 'calendar' && <CalendarView />}

          {/* High-priority updates notifications bulletins */}
          {activeTab === 'notifications' && <NotificationsPane />}

        </main>

      </div>

      {/* Video conferencing fullscreen popup layout channel */}
      {videoRoomOpen && <VideoRoom onClose={() => setVideoRoomOpen(false)} />}

      {/* Interactive Assessment Examinations cards overlay modal */}
      {activeQuizId && (
        <QuizView 
          quizId={activeQuizId} 
          onClose={() => setActiveQuizId(null)}
          onQuizCompleted={() => {
            // Recipient list stats recomputation
            setActiveQuizId(null);
          }}
        />
      )}

    </div>
  );
}
