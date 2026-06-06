import { useState, useEffect } from 'react';
import { 
  OfflineStorage 
} from '../lib/database';
import { 
  CourseNotification 
} from '../types';
import { 
  BellRing, 
  Trash2, 
  CheckCircle2, 
  Info, 
  AlertTriangle, 
  Calendar,
  Sparkles,
  Plus,
  Compass,
  ArrowRight
} from 'lucide-react';

export default function NotificationsPane() {
  const [notifications, setNotifications] = useState<CourseNotification[]>([]);

  useEffect(() => {
    setNotifications(OfflineStorage.getNotifications());
  }, []);

  const handleMarkAllRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    OfflineStorage.setNotifications(updated);
    setNotifications(updated);
  };

  const handleClearNotification = (id: string) => {
    const updated = notifications.filter(n => n.id !== id);
    OfflineStorage.setNotifications(updated);
    setNotifications(updated);
  };

  const handleSimulateAlert = () => {
    const isOnline = OfflineStorage.getOnlineMode();
    const newNotif: CourseNotification = {
      id: `notif_sim_${Date.now()}`,
      title: 'Real-time alert: Midterm Grades Released',
      message: 'Professor sarah has uploaded evaluation metrics. Check your personalized recommendation card in the flight deck.',
      type: 'success',
      createdAt: new Date().toISOString(),
      read: false
    };

    const updated = [newNotif, ...notifications];
    OfflineStorage.setNotifications(updated);
    setNotifications(updated);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Simulation triggers (Left Column 1/3) */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-1.5 text-violet-600 dark:text-violet-400">
          <Sparkles className="h-5 w-5 animate-pulse" id="sim-sparkles-icon" />
          <h3 className="font-bold text-slate-800 dark:text-slate-200">Push Alert simulator</h3>
        </div>
        <p className="text-xs text-slate-500 mt-1 mb-4">Simulate incoming full-stack academic broadcast pushes to verify device responsiveness.</p>

        <button 
          onClick={handleSimulateAlert}
          className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-violet-600 py-3 text-xs font-bold text-white shadow-md hover:bg-violet-500 transition-all"
        >
          <Plus className="h-4 w-4" />
          Trigger Real-time course update alert
        </button>

        <div className="mt-4 rounded-lg bg-slate-50 p-3 text-[10px] text-slate-500 font-medium dark:bg-slate-950">
          <p className="leading-relaxed">Incoming triggers utilize synchronized WebSocket channels (simulated), rendering immediate notification popups on all registered student devices.</p>
        </div>
      </div>

      {/* Main real-time notifications tracker list (Right Column 2/3) */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:col-span-2">
        <div className="mb-4 flex items-center justify-between border-b border-rose-50 pb-3.5 dark:border-slate-850">
          <div>
            <h3 className="font-bold text-slate-800 dark:text-slate-200">Classroom Broadcast alerts</h3>
            <p className="text-xs text-slate-500">Alert warnings on syllabus modules, quiz scoring completions, and live study assignments.</p>
          </div>

          <button 
            onClick={handleMarkAllRead}
            disabled={notifications.every(n => n.read)}
            className="rounded border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm hover:bg-slate-50 disabled:opacity-40"
          >
            Mark all read
          </button>
        </div>

        {/* Notifications map queue */}
        <div className="space-y-3.5 max-h-[380px] overflow-y-auto pr-1">
          {notifications.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs font-semibold">
              No active notification alerts in this session thread.
            </div>
          ) : (
            notifications.map(notif => (
              <div 
                key={notif.id} 
                className={`flex gap-3.5 rounded-xl border p-4 shadow-sm transition-all relative ${
                  notif.read 
                    ? 'border-slate-100 bg-slate-50 opacity-60 dark:border-slate-850' 
                    : 'border-violet-100 bg-violet-50/10 dark:border-violet-950/10'
                }`}
              >
                {!notif.read && (
                  <span className="absolute top-4 left-4 flex h-2 w-2 rounded-full bg-violet-600" title="Unread font-medium"></span>
                )}

                <div className={`mt-0.5 rounded-lg p-2 ${
                  notif.type === 'alert' ? 'bg-amber-100 text-amber-600' :
                  notif.type === 'success' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'
                }`}>
                  {notif.type === 'alert' ? <AlertTriangle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                </div>

                <div className="min-w-0 flex-1 ml-1">
                  <h4 className="text-xs font-black text-slate-800 truncate dark:text-slate-200">{notif.title}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5 font-medium leading-normal">{notif.message}</p>
                  
                  <span className="text-[9px] font-mono text-slate-400 mt-2 block">
                    {new Date(notif.createdAt).toLocaleDateString()} at {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <button 
                  onClick={() => handleClearNotification(notif.id)}
                  className="rounded p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50"
                  title="Prune notifications trigger"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
