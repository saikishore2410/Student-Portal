import { useState, useEffect } from 'react';
import { 
  LearningPath, 
  LearningUnit, 
  InteractiveQuiz 
} from '../types';
import { 
  OfflineStorage 
} from '../lib/database';
import { 
  ArrowLeft, 
  Sparkles, 
  BookOpen, 
  HelpCircle, 
  Lock, 
  CheckCircle, 
  Circle, 
  Send, 
  X,
  Play,
  Brain,
  MessageSquare,
  AlertCircle
} from 'lucide-react';

interface PathViewProps {
  pathId: string;
  onBack: () => void;
  onLaunchQuiz: (quizId: string) => void;
}

interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
}

export default function PathView({ pathId, onBack, onLaunchQuiz }: PathViewProps) {
  const [path, setPath] = useState<LearningPath | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<LearningUnit | null>(null);
  const [chatInput, setChatInput] = useState<string>("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [loadingChat, setLoadingChat] = useState<boolean>(false);

  useEffect(() => {
    const paths = OfflineStorage.getPaths();
    const foundPath = paths.find(p => p.id === pathId);
    if (foundPath) {
      setPath(foundPath);
      // Default to the first unlocked/uncompleted unit or first unit
      const activeUnit = foundPath.units.find(u => u.status === 'unlocked') || foundPath.units[0];
      setSelectedUnit(activeUnit || null);
    }
  }, [pathId]);

  useEffect(() => {
    if (selectedUnit) {
      // Refresh AI Tutor introductory remarks
      setChatMessages([
        { 
          sender: 'ai', 
          text: `Greetings! I am your AI Socratic Study Advisor. Ask me anything about "${selectedUnit.title}". I can clarify vector calculus dualities, complexity proofs, or provide practice prompts.` 
        }
      ]);
    }
  }, [selectedUnit]);

  const handleUnitSelect = (unit: LearningUnit) => {
    if (unit.status === 'locked') return; // Cannot access locked units
    setSelectedUnit(unit);
  };

  const handleSendChat = async () => {
    if (!chatInput.trim() || !selectedUnit) return;
    const userMsg = chatInput.trim();
    setChatMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setChatInput("");
    setLoadingChat(true);

    try {
      const response = await fetch("/api/tutor-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          unitTitle: selectedUnit.title,
          userMessage: userMsg,
          chatHistory: chatMessages.slice(-5) // limit context window cost
        })
      });

      if (!response.ok) {
        throw new Error("Chat gateway unavailable");
      }

      const data = await response.json();
      setChatMessages(prev => [...prev, { sender: 'ai', text: data.reply || "I apologize, could you rephrase?" }]);
    } catch {
      // Fallback
      setChatMessages(prev => [...prev, { 
        sender: 'ai', 
        text: `Socratic Advisor [Offline State]: To master, analyze the boundary limits. In physics, bounds determine probability limits. In algorithm recursion scales, analyze the tree base. Let me know if you would like me to test your theory.` 
      }]);
    } finally {
      setLoadingChat(false);
    }
  };

  if (!path) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-500">
        <AlertCircle className="h-8 w-8 text-rose-500 animate-pulse mb-2" />
        No path module found. Click back to reload assets.
        <button onClick={onBack} className="mt-4 rounded bg-slate-100 px-4 py-2 text-xs">Back to safety</button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Header anchor */}
      <div className="flex items-center gap-3">
        <button 
          onClick={onBack}
          className="rounded-lg border border-slate-200 bg-white p-2 text-slate-500 shadow-sm hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 uppercase tracking-widest">{path.subject}</span>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{path.title}</h1>
        </div>
      </div>

      {/* Main split: Map and Details */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Unit Pathway Map (Left column 2/3) */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:col-span-2">
          <div className="mb-6">
            <h2 className="font-bold text-slate-800 dark:text-slate-200">Personalized Learning Map</h2>
            <p className="text-xs text-slate-500">Visual unit sequence tracking milestones. Progress is updated upon passing assessment quizzes.</p>
          </div>

          <div className="relative flex flex-col gap-8 py-4">
            {/* Visual background sequence map connector path lines */}
            <div className="absolute left-[21px] top-6 bottom-6 w-0.5 border-l-2 border-dashed border-slate-200 dark:border-slate-800"></div>

            {path.units.map((unit, index) => {
              const num = index + 1;
              const isSelected = selectedUnit?.id === unit.id;
              
              return (
                <div 
                  key={unit.id}
                  onClick={() => handleUnitSelect(unit)}
                  className={`relative flex items-start gap-4 rounded-xl border p-4 transition-all duration-300 ${
                    unit.status === 'locked' 
                      ? 'border-slate-100 bg-slate-50/50 cursor-not-allowed opacity-60' 
                      : isSelected 
                        ? 'border-violet-500 bg-violet-50/20 shadow-sm' 
                        : 'border-slate-100 bg-white hover:border-slate-300 cursor-pointer shadow-sm dark:border-slate-800 dark:bg-slate-950'
                  }`}
                >
                  {/* Left indicator bubble */}
                  <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 bg-white font-mono text-sm font-bold shadow-sm dark:bg-slate-900">
                    {unit.status === 'completed' && (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-white stroke-2">
                        <CheckCircle className="h-5 w-5" />
                      </div>
                    )}
                    {unit.status === 'unlocked' && (
                      <div className={`flex h-10 w-10 items-center justify-center rounded-full ${isSelected ? 'border-violet-600 text-violet-600' : 'border-slate-300 text-slate-500'}`}>
                        {num}
                      </div>
                    )}
                    {unit.status === 'locked' && (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 text-slate-400">
                        <Lock className="h-4 w-4" />
                      </div>
                    )}
                  </div>

                  {/* Substantive content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">{unit.estimatedMinutes} mins study</span>
                      {unit.status === 'completed' && (
                        <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[9px] font-bold text-emerald-800 uppercase tracking-widest">Completed</span>
                      )}
                      {unit.status === 'unlocked' && (
                        <span className="rounded bg-violet-100 px-1.5 py-0.5 text-[9px] font-bold text-violet-800 uppercase tracking-widest">Available</span>
                      )}
                      {unit.status === 'locked' && (
                        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold text-slate-400 uppercase tracking-widest">Prerequisite</span>
                      )}
                    </div>
                    <h3 className={`mt-1 font-bold truncate text-base ${isSelected ? 'text-violet-600 dark:text-violet-400' : 'text-slate-800 dark:text-slate-200'}`}>
                      {unit.title}
                    </h3>
                    <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 leading-normal">{unit.description}</p>
                    
                    {unit.status !== 'locked' && (
                      <div className="mt-2 text-[10px] font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                        {isSelected ? "Currently viewing details" : "Click to select and study unit content"}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Unit Syllabus Detail Panel & Socratic Chat (Right column 1/3) */}
        <div className="space-y-6">
          {selectedUnit && (
            <>
              {/* Unit study details panel */}
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <span className="text-[10px] font-semibold font-mono text-slate-400 uppercase">ACTIVE MODULE STUDY SHEET</span>
                <h3 className="mt-1 font-bold text-lg text-slate-800 dark:text-slate-200">{selectedUnit.title}</h3>
                
                <p className="mt-3 text-xs leading-relaxed text-slate-600 dark:text-slate-400 bg-slate-50 p-3 rounded-lg dark:bg-slate-950">
                  {selectedUnit.description}
                </p>

                {selectedUnit.aiInsights && (
                  <div className="mt-4 rounded-lg bg-violet-50/50 border border-violet-100/40 p-3 dark:bg-violet-950/20 dark:border-slate-800">
                    <div className="flex items-center gap-1.5 text-violet-700 dark:text-violet-300">
                      <Brain className="h-4 w-4" />
                      <span className="text-xs font-bold uppercase tracking-wider">Plan Advisor Insight</span>
                    </div>
                    <p className="mt-1 text-xs text-slate-700 dark:text-slate-300 font-medium leading-normal">{selectedUnit.aiInsights}</p>
                  </div>
                )}

                {selectedUnit.quizId && (
                  <div className="mt-5 border-t border-slate-100 pt-4 dark:border-slate-800">
                    <button 
                      onClick={() => onLaunchQuiz(selectedUnit.quizId!)}
                      className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 px-4 text-xs font-bold text-white shadow-md transition-all ${
                        selectedUnit.status === 'completed'
                          ? 'bg-emerald-600 hover:bg-emerald-500'
                          : 'bg-violet-600 hover:bg-violet-500'
                      }`}
                    >
                      <Play className="h-3.5 w-3.5 fill-current" />
                      {selectedUnit.status === 'completed' ? 'Retake Unit Quiz' : 'Launch Unit Quiz Card'}
                    </button>
                  </div>
                )}
              </div>

              {/* Secure AI Socratic Tutor panel */}
              <div className="flex flex-col h-[320px] rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-200 p-3 flex items-center justify-between dark:bg-slate-950 dark:border-slate-800">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Socratic Chat-Advisor</span>
                  </div>
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" title="Connected"></span>
                </div>

                {/* Messages content */}
                <div className="flex-1 overflow-y-auto p-3 space-y-2.5 text-xs">
                  {chatMessages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] rounded-xl px-3 py-2 leading-relaxed ${
                        msg.sender === 'user' 
                          ? 'bg-violet-600 text-white font-medium' 
                          : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  {loadingChat && (
                    <div className="flex justify-start">
                      <div className="rounded-xl bg-slate-100 px-3 py-2 text-slate-400 animate-pulse dark:bg-slate-800">
                        Analyzing Socratic proofs...
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Send */}
                <div className="border-t border-slate-200 p-2 flex gap-1.5 dark:border-slate-800">
                  <input 
                    type="text" 
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                    placeholder="Ask vector calc or Big-O bounds..." 
                    className="flex-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:border-violet-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                  />
                  <button 
                    onClick={handleSendChat}
                    disabled={loadingChat || !chatInput.trim()}
                    className="rounded-lg bg-violet-600 p-2 text-white hover:bg-violet-500 disabled:opacity-40"
                  >
                    <Send className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
