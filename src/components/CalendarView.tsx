import { useState, useEffect, FormEvent } from 'react';
import { 
  OfflineStorage 
} from '../lib/database';
import { useDbChange } from '../lib/useDbChange';
import { 
  CalendarEvent 
} from '../types';
import { 
  Calendar, 
  Clock, 
  Plus, 
  Trash2, 
  CheckSquare, 
  Square, 
  AlertTriangle,
  Info,
  BookOpen,
  Filter
} from 'lucide-react';

export default function CalendarView() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [filterType, setFilterType] = useState<string>("all");
  
  // Custom event compiler states
  const [newTitle, setNewTitle] = useState<string>("");
  const [newDesc, setNewDesc] = useState<string>("");
  const [newDate, setNewDate] = useState<string>("");
  const [newType, setNewType] = useState<'assignment' | 'lecture' | 'exam' | 'study'>("assignment");

  const dbChange = useDbChange();

  useEffect(() => {
    setEvents(OfflineStorage.getCalendar());
  }, [dbChange]);

  const handleToggleComplete = (id: string) => {
    const updated = events.map(evt => {
      if (evt.id === id) {
        return { ...evt, completed: !evt.completed };
      }
      return evt;
    });
    OfflineStorage.setCalendar(updated);
    setEvents(updated);
  };

  const handleCreateEvent = (e: FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newDate) return;

    const newEvt: CalendarEvent = {
      id: `evt_custom_${Date.now()}`,
      title: newTitle,
      description: newDesc || "Custom scheduled academic self study session.",
      dueDate: new Date(newDate).toISOString(),
      type: newType,
      completed: false
    };

    const updated = [...events, newEvt];
    OfflineStorage.setCalendar(updated);
    setEvents(updated);
    
    // Reset fields
    setNewTitle("");
    setNewDesc("");
    setNewDate("");
    
    // Add alert notification
    const notifs = OfflineStorage.getNotifications();
    notifs.unshift({
      id: `notif_cal_${Date.now()}`,
      title: 'Deadlines Agenda Updated',
      message: `"${newTitle}" successfully added into your lecture and homework tracker.`,
      type: 'info',
      createdAt: new Date().toISOString(),
      read: false
    });
    OfflineStorage.setNotifications(notifs);
  };

  const handleDeleteEvent = (id: string) => {
    if (confirm("Are you sure you want to remove this schedule event?")) {
      const updated = events.filter(e => e.id !== id);
      OfflineStorage.setCalendar(updated);
      setEvents(updated);
    }
  };

  const filteredEvents = events.filter(evt => {
    if (filterType === "all") return true;
    if (filterType === "pending") return !evt.completed;
    if (filterType === "completed") return evt.completed;
    return evt.type === filterType;
  });

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Event compiler drafting panel (Left Column 1/3) */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-1.5 text-violet-600 dark:text-violet-400">
          <Calendar className="h-5 w-5" id="compiler-calendar-icon" />
          <h3 className="font-bold text-slate-800 dark:text-slate-200">Compile Agenda Deliverable</h3>
        </div>
        <p className="text-xs text-slate-500 mt-1 mb-4">Append custom study dates, lab deadlines, or peer review clusters directly into your personal track.</p>

        <form onSubmit={handleCreateEvent} className="space-y-4">
          <div>
            <label className="text-[10px] font-mono font-bold text-slate-400 block mb-1">TASK / EVENT TITLE</label>
            <input 
              type="text" 
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Planck Matrix equations review" 
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-violet-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
              required
            />
          </div>

          <div>
            <label className="text-[10px] font-mono font-bold text-slate-400 block mb-1">DUE / EVENT DATE</label>
            <input 
              type="date" 
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-violet-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
              required
            />
          </div>

          <div>
            <label className="text-[10px] font-mono font-bold text-slate-400 block mb-1">EVENT TYPE</label>
            <select 
              value={newType}
              onChange={(e) => setNewType(e.target.value as any)}
              className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs focus:border-violet-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
            >
              <option value="assignment">Homework Assignment</option>
              <option value="lecture">Virtual Group Lecture</option>
              <option value="exam">Midterm Exam Sheet</option>
              <option value="study">Peer Study Cluster</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-mono font-bold text-slate-400 block mb-1">BRIEF ACTION STEPS</label>
            <textarea 
              rows={2}
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="Practice double-slit calculations and matrix conversions twice prior to submission..." 
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-violet-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-gradient-to-r"
            />
          </div>

          <button 
            type="submit" 
            className="w-full flex items-center justify-center gap-1 rounded-xl bg-violet-600 py-2.5 text-xs font-bold text-white shadow-md hover:bg-violet-500"
          >
            <Plus className="h-4 w-4" />
            Append to calendar track
          </button>
        </form>
      </div>

      {/* Interactive scheduling list panel (Right Column 2/3) */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:col-span-2">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-800 dark:text-slate-200">Syllabus Deadlines Map</h3>
            <p className="text-xs text-slate-500">Track and toggle syllabus completions. Prerequisite path unlock values are checked dynamically.</p>
          </div>

          {/* Filtering bar */}
          <div className="flex items-center gap-2 rounded-lg bg-slate-50 p-1 border border-slate-100 dark:bg-slate-950 dark:border-slate-800">
            <Filter className="h-3.5 w-3.5 text-slate-400 ml-1.5" />
            <select 
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-transparent text-xs text-slate-600 font-semibold focus:outline-none border-none cursor-pointer dark:text-slate-350"
            >
              <option value="all">Display All</option>
              <option value="pending">Deliverables Pending</option>
              <option value="completed">Completed Study Credits</option>
              <option value="assignment">Assignments Only</option>
              <option value="lecture">Lectures Only</option>
              <option value="exam">Exams Only</option>
            </select>
          </div>
        </div>

        {/* Deadlines stack */}
        <div className="space-y-3.5 max-h-[400px] overflow-y-auto pr-1">
          {filteredEvents.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-xs">
              No academic milestones matches this specific selection state.
            </div>
          ) : (
            filteredEvents.map(evt => {
              const isOverdue = new Date(evt.dueDate).getTime() < Date.now() && !evt.completed;
              
              return (
                <div 
                  key={evt.id} 
                  className={`flex items-start justify-between rounded-xl border p-4 shadow-sm transition-all ${
                    evt.completed 
                      ? 'border-slate-150 bg-slate-50 opacity-60 dark:border-slate-850' 
                      : isOverdue 
                        ? 'border-rose-200 bg-rose-50/20' 
                        : 'border-slate-100 bg-white hover:border-slate-200 dark:border-slate-800 dark:bg-slate-950/40'
                  }`}
                >
                  <div className="flex gap-3.5 min-w-0 flex-1">
                    {/* Tick box toggle */}
                    <button 
                      onClick={() => handleToggleComplete(evt.id)}
                      className="mt-0.5 rounded p-0.5 text-slate-400 hover:text-violet-600 transition-colors"
                    >
                      {evt.completed 
                        ? <CheckSquare className="h-5 w-5 text-emerald-500 fill-emerald-50 dark:fill-slate-900" /> 
                        : <Square className="h-5 w-5 text-slate-300 hover:text-slate-400" />
                      }
                    </button>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`rounded-full px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider ${
                          evt.type === 'assignment' ? 'bg-blue-100 text-blue-700' :
                          evt.type === 'lecture' ? 'bg-violet-100 text-violet-700' :
                          evt.type === 'exam' ? 'bg-rose-100 text-rose-700 font-extrabold' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {evt.type}
                        </span>
                        {isOverdue && (
                          <span className="flex items-center gap-1.5 rounded bg-rose-100 px-1.5 py-0.5 text-[8px] font-bold text-rose-700 uppercase tracking-widest leading-none">
                            <AlertTriangle className="h-2.5 w-2.5" />
                            Overdue deliverable
                          </span>
                        )}
                      </div>
                      <h4 className={`mt-1.5 text-xs font-bold truncate text-slate-800 dark:text-slate-200 ${evt.completed ? 'line-through' : ''}`}>
                        {evt.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5 whitespace-pre-wrap leading-normal font-medium">{evt.description}</p>
                    </div>
                  </div>

                  {/* Actions Right Side */}
                  <div className="flex flex-col items-end gap-1.5 shrink-0 ml-3.5">
                    <button 
                      onClick={() => handleDeleteEvent(evt.id)}
                      className="rounded p-1 text-slate-400 hover:text-rose-500 hover:bg-rose-50"
                      title="Prune milestone"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                    <span className="text-[9px] font-bold font-mono tracking-wide text-slate-400">
                      Due: {new Date(evt.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
