import { useState, useEffect, FormEvent } from 'react';
import { 
  OfflineStorage 
} from '../lib/database';
import { useDbChange } from '../lib/useDbChange';
import { 
  UserProfile, 
  SecureMessage,
  CloudDocument 
} from '../types';
import { 
  Send, 
  FileText, 
  Paperclip, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  ExternalLink, 
  ShieldCheck, 
  Search, 
  MessageSquare, 
  ChevronRight,
  X
} from 'lucide-react';

interface MessagingProps {
  currentUser: UserProfile;
}

export default function Messaging({ currentUser }: MessagingProps) {
  const [messages, setMessages] = useState<SecureMessage[]>([]);
  const [inputText, setInputText] = useState<string>("");
  const [docs, setDocs] = useState<CloudDocument[]>([]);
  
  // Attachments Dialog state
  const [isAttachOpen, setIsAttachOpen] = useState<boolean>(false);
  const [selectedAttachment, setSelectedAttachment] = useState<CloudDocument | null>(null);

  // Recipient profiles
  const [teacherProfile, setTeacherProfile] = useState<any>(null);

  const dbChange = useDbChange();

  useEffect(() => {
    setMessages(OfflineStorage.getMessages());
    setDocs(OfflineStorage.getDocuments());
    
    // Default mock profiles
    setTeacherProfile({
      name: "Dr. Sarah Jenkins",
      title: "Tenured Professor of Physics & Applied Computations",
      status: "Active study hours starting 2 PM",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format"
    });
  }, [dbChange]);

  const handleSendMessage = (e?: FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() && !selectedAttachment) return;

    const newMsg: SecureMessage = {
      id: `msg_custom_${Date.now()}`,
      senderId: currentUser.id,
      senderName: currentUser.name,
      receiverId: currentUser.id === 'student_1' ? 'teacher_sarah' : 'student_1',
      text: inputText.trim(),
      timestamp: new Date().toISOString(),
      ...(selectedAttachment && {
        fileAttachment: {
          name: selectedAttachment.title,
          url: "#",
          size: selectedAttachment.size
        }
      })
    };

    const updated = [...messages, newMsg];
    OfflineStorage.setMessages(updated);
    setMessages(updated);
    setInputText("");
    setSelectedAttachment(null);
    setIsAttachOpen(false);

    // Simulated reply after delay
    if (currentUser.id === 'student_1') {
      setTimeout(() => {
        const replyMsg: SecureMessage = {
          id: `msg_reply_${Date.now()}`,
          senderId: 'teacher_sarah',
          senderName: 'Dr. Sarah Jenkins',
          receiverId: 'student_1',
          text: `Hi Emily, I received your message. I checked your attached notes. Focusing on those Plank bounds is exactly right. Let us discuss this further during the live group video lecture.`,
          timestamp: new Date().toISOString()
        };
        const currentMsgs = OfflineStorage.getMessages();
        const finalMsgs = [...currentMsgs, replyMsg];
        OfflineStorage.setMessages(finalMsgs);
        setMessages(finalMsgs);
      }, 3500);
    }
  };

  const handleAttachDocument = (doc: CloudDocument) => {
    setSelectedAttachment(doc);
    setIsAttachOpen(false);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Target Recipient Sidebar Card details */}
      {teacherProfile && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-1 text-xs font-semibold py-0.5 px-2 rounded-full bg-violet-100 text-violet-700 w-fit mb-4">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Secure SSL Encrypted Connection</span>
          </div>

          <div className="text-center py-4 border-b border-slate-100 dark:border-slate-800">
            <img 
              src={teacherProfile.avatar} 
              className="mx-auto h-16 w-16 rounded-full ring-2 ring-violet-500/30 object-cover" 
              alt={teacherProfile.name} 
              referrerPolicy="no-referrer"
            />
            <h3 className="mt-3 font-bold text-slate-800 dark:text-slate-100">{teacherProfile.name}</h3>
            <p className="text-xs text-slate-400 mt-0.5 leading-normal">{teacherProfile.title}</p>
            <span className="mt-2 inline-block rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 uppercase font-mono tracking-wider dark:bg-emerald-950/20">{teacherProfile.status}</span>
          </div>

          {/* Quick instructions widget */}
          <div className="pt-4 space-y-3.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Class Syllabus Hours</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">Use direct messages to request custom quiz reviews or attach reference notes from your Cloud File Locker repository.</p>
            
            <div className="rounded-lg bg-slate-50 p-2.5 dark:bg-slate-950">
              <div className="flex items-center gap-1 text-slate-500 text-[10px] uppercase font-bold font-mono">
                <Clock className="h-3.5 w-3.5" />
                <span>Response rate</span>
              </div>
              <p className="text-[11px] text-slate-700 font-semibold mt-1">Usually responds under 2 hours</p>
            </div>
          </div>
        </div>
      )}

      {/* Main secure Chat Lane (Left column 2/3) */}
      <div className="flex flex-col h-[520px] rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden lg:col-span-2">
        <div className="bg-slate-50 border-b border-slate-200 p-4 shrink-0 flex items-center justify-between dark:bg-slate-950 dark:border-slate-800">
          <div>
            <span className="text-[10px] font-mono tracking-widest uppercase font-extrabold text-violet-600 block">Classroom Chatlane channel</span>
            <h2 className="text-sm font-bold text-slate-820 leading-snug">
              {currentUser.role === 'student' ? 'Sarah Jenkins (Physics Prof)' : 'Emily Chen (Quantum Student)'}
            </h2>
          </div>
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
        </div>

        {/* Messaging list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, i) => {
            const isSelf = msg.senderId === currentUser.id;
            
            return (
              <div key={msg.id} className={`flex ${isSelf ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex gap-2.5 max-w-[85%] ${isSelf ? 'flex-row-reverse' : 'flex-row'}`}>
                  {/* avatar */}
                  <div className="flex-none">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-bold dark:bg-slate-800">
                      {msg.senderName.charAt(0)}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 font-mono text-[9px] text-slate-400">
                      <span className="font-bold">{msg.senderName}</span>
                      <span>•</span>
                      <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>

                    <div className={`rounded-xl px-4 py-2.5 text-xs inline-block leading-relaxed border ${
                      isSelf 
                        ? 'bg-violet-600 text-white border-violet-500 font-medium' 
                        : 'bg-slate-50 text-slate-700 border-slate-100 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-800'
                    }`}>
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                      
                      {/* Attached cloud document representation payload */}
                      {msg.fileAttachment && (
                        <div className={`mt-2 flex items-center gap-2 rounded-lg border p-2.5 text-[11px] ${
                          isSelf 
                            ? 'bg-violet-700/50 border-violet-500 text-violet-100' 
                            : 'bg-white border-slate-200 text-slate-600 dark:bg-slate-950'
                        }`}>
                          <FileText className="h-4 w-4 text-emerald-500 shrink-0" id={`file-msg-icon-${msg.id}`} />
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-semibold">{msg.fileAttachment.name}</p>
                            <span className="text-[9px] font-mono tracking-wide opacity-80">{msg.fileAttachment.size} Locker File</span>
                          </div>
                          <ExternalLink className="h-3.5 w-3.5 opacity-60 shrink-0" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Draft send input footer track */}
        <div className="border-t border-slate-200 p-4 bg-slate-50 space-y-2 dark:border-slate-800 dark:bg-slate-950">
          {/* Active attachment line */}
          {selectedAttachment && (
            <div className="flex items-center justify-between rounded-lg bg-emerald-50 border border-emerald-100 p-2 text-xs font-semibold text-emerald-800">
              <div className="flex items-center gap-1.5">
                <FileText className="h-4 w-4 text-emerald-600" />
                <span className="truncate max-w-[200px]">{selectedAttachment.title} ({selectedAttachment.size})</span>
              </div>
              <button 
                onClick={() => setSelectedAttachment(null)}
                className="text-emerald-900 border border-emerald-200 bg-white rounded-full px-1.5 py-0.5 text-[10px]"
              >
                Clear attachment
              </button>
            </div>
          )}

          <form onSubmit={handleSendMessage} className="flex gap-2">
            <button 
              type="button"
              onClick={() => setIsAttachOpen(true)}
              className="rounded-lg border border-slate-200 bg-white p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900"
              title="Attach File from Locker"
            >
              <Paperclip className="h-4 w-4" />
            </button>
            <input 
              type="text" 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Draft secure ssl encoded message payload..." 
              className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:border-violet-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
            />
            <button 
              type="submit" 
              className="rounded-lg bg-violet-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-violet-500"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>
      </div>

      {/* Attach From Locker Dialog Modal overlay */}
      {isAttachOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4 dark:border-slate-800">
              <div className="flex items-center gap-1.5 text-violet-600 dark:text-violet-400">
                <Paperclip className="h-4 w-4 text-violet-500" />
                <h3 className="font-bold text-sm">Pick cloud storage attachment</h3>
              </div>
              <button onClick={() => setIsAttachOpen(false)} className="text-slate-400 hover:text-slate-500">
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500 mb-4 font-medium">Pick study calculations or Planck notes directly from your synchronized cloud locker to transmit securely.</p>

            <div className="space-y-2.5 max-h-[220px] overflow-y-auto">
              {docs.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">Your Cloud Locker has no active note draft sheets.</p>
              ) : (
                docs.map(doc => (
                  <div 
                    key={doc.id}
                    onClick={() => handleAttachDocument(doc)}
                    className="flex cursor-pointer items-center justify-between rounded-lg border border-slate-100 p-2.5 hover:bg-slate-50 hover:border-slate-300 dark:border-slate-800 dark:hover:bg-slate-850"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="h-4.5 w-4.5 text-emerald-500 shrink-0" id={`attach-doc-icon-${doc.id}`} />
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-xs leading-normal text-slate-800 dark:text-slate-200">{doc.title}</p>
                        <span className="text-[9px] font-mono tracking-wide text-slate-400 block mt-0.5">{doc.size} draft note</span>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
