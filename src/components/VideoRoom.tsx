import { useState, useEffect, useRef } from 'react';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  ScreenShare, 
  Hand, 
  Users, 
  PhoneOff, 
  Sparkles, 
  Send,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Smile,
  Radio
} from 'lucide-react';

interface Participant {
  name: string;
  avatar: string;
  isSpeaking: boolean;
  avatarColor: string;
  handRaised: boolean;
  cameraOn: boolean;
  micOn: boolean;
}

const DEFAULT_PARTICIPANTS: Participant[] = [
  { name: "Dr. Sarah Jenkins (Prof)", avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format", isSpeaking: true, avatarColor: "bg-slate-800", handRaised: false, cameraOn: true, micOn: true },
  { name: "Marcus Sterling (Peer)", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format", isSpeaking: false, avatarColor: "bg-emerald-600", handRaised: false, cameraOn: false, micOn: true },
  { name: "Alina Popova (Peer)", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format", isSpeaking: false, avatarColor: "bg-violet-600", handRaised: true, cameraOn: true, micOn: false },
  { name: "Devon Miller (Peer)", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format", isSpeaking: false, avatarColor: "bg-amber-600", handRaised: false, cameraOn: false, micOn: false }
];

const LECTURE_SLIDES = [
  {
    title: "1. Planck Duality Formulas",
    concept: "E = h * ν = h * (c / λ)",
    notes: "Plancks energy quantisation states that energy is packeted. The factor h remains constant (6.626 x 10^-34 Joule Seconds)."
  },
  {
    title: "2. Dirac Braket Vector Geometry",
    concept: "|ψ⟩ = α|0⟩ + β|1⟩  where  |α|^2 + |β|^2 = 1",
    notes: "Bra-ket representation maps probabilities of quantum superposition collapse. Hilbert space dimensions scale exponentially."
  },
  {
    title: "3. Big-O Complexity Master Bounds",
    concept: "T(n) = a * T(n/b) + Θ(n^d)",
    notes: "Master theorem computes fast asymptotic splits. If a > b^d, the overall computational limit operates as O(n ^ log_b(a))."
  }
];

const TRANSCRIPT_LOOP = [
  "Dr. Sarah: Let us begin by analyzing Planck’s equations for light emissions...",
  "Dr. Sarah: Remember that de Broglie hypothesized every physical particle possesses waves...",
  "Dr. Sarah: For our superposition midterms, review bra-ket dual calculus matrices...",
  "Dr. Sarah: Alina, you raised your hand? Yes, CNOT gates execute conditional entanglements.",
  "Dr. Sarah: I am slide-paging to dynamic programming knapsack bounds now..."
];

export default function VideoRoom({ onClose }: { onClose: () => void }) {
  const [participants, setParticipants] = useState<Participant[]>(DEFAULT_PARTICIPANTS);
  const [slideIndex, setSlideIndex] = useState<number>(0);
  const [transcript, setTranscript] = useState<string>("Initializing secure WebRTC channels...");
  const [chatLog, setChatLog] = useState<{ sender: string; text: string }[]>([
    { sender: "System", text: "Welcome to Quantum Physics 101 Lecture Discussion. Sync active." }
  ]);
  const [chatText, setChatText] = useState("");
  const [panelOpen, setPanelOpen] = useState<'chat' | 'members'>('chat');

  // Client call limits
  const [myMic, setMyMic] = useState<boolean>(true);
  const [myCam, setMyCam] = useState<boolean>(true);
  const [isScreenShared, setIsScreenShared] = useState<boolean>(false);
  const [myHand, setMyHand] = useState<boolean>(false);

  // Subtitle ticking loop simulation
  useEffect(() => {
    let tIndex = 0;
    const interval = setInterval(() => {
      setTranscript(TRANSCRIPT_LOOP[tIndex % TRANSCRIPT_LOOP.length]);
      // Cycle speaker status
      setParticipants(prev => prev.map((p, idx) => {
        if (p.name.includes("Sarah")) {
          return { ...p, isSpeaking: tIndex % 3 !== 0 };
        }
        return p;
      }));
      tIndex++;
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  const handleSendChat = () => {
    if (!chatText.trim()) return;
    setChatLog(prev => [...prev, { sender: "Emily Chen (Student)", text: chatText.trim() }]);
    setChatText("");
  };

  const toggleParticipantHand = (pName: string) => {
    setParticipants(prev => prev.map(p => 
      p.name === pName ? { ...p, handRaised: !p.handRaised } : p
    ));
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950 text-slate-100">
      {/* Top Banner Control Header */}
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-slate-800 bg-slate-900 px-4">
        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 items-center justify-center rounded-full bg-red-500 animate-pulse"></span>
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">PHYS-101 LIVE WEBCAST</span>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-slate-950 px-3 py-1 font-mono text-[10px] text-slate-400 font-bold">
          <Radio className="h-3 w-3 text-red-500 animate-pulse" />
          <span>RTC-CHANNELS STATUS: STABLE ONLINE</span>
        </div>
        <button 
          onClick={onClose}
          className="flex items-center gap-1.5 rounded bg-red-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-red-500 transition-all shadow"
        >
          <PhoneOff className="h-3.5 w-3.5" />
          <span>Exit Lecture Room</span>
        </button>
      </div>

      {/* Main workspace section */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left pane: Videotrack + Whiteboard projector (Col total 2/3) */}
        <div className="flex-1 flex flex-col p-4 space-y-4 overflow-y-auto">
          {/* Lecture projector screen and participant cams split */}
          <div className="grid gap-4 md:grid-cols-3 flex-1 min-h-[350px]">
            {/* Whiteboard module / Interactive presentation page */}
            <div className="md:col-span-2 rounded-xl border border-slate-800 bg-slate-900 flex flex-col overflow-hidden shadow-2xl relative">
              <div className="bg-slate-950 border-b border-slate-800 p-3.5 flex items-center justify-between">
                <span className="text-[10px] font-mono tracking-widest text-violet-400 font-extrabold uppercase uppercase">Digital whiteboard projector screen</span>
                <span className="rounded bg-violet-600 px-2 py-0.5 text-[9px] font-bold">Slide {slideIndex + 1} of {LECTURE_SLIDES.length}</span>
              </div>
              
              <div className="flex-1 p-6 flex flex-col justify-center items-center text-center space-y-4 max-w-lg mx-auto">
                <h3 className="text-sm font-semibold font-mono tracking-wide text-slate-400">{LECTURE_SLIDES[slideIndex].title}</h3>
                
                <div className="rounded-xl bg-slate-950 border border-slate-800 p-6 w-full shadow-inner transform hover:scale-[1.02] transition-transform">
                  <code className="text-xl font-mono text-emerald-400 block whitespace-pre-wrap leading-relaxed truncate md:whitespace-normal">
                    {LECTURE_SLIDES[slideIndex].concept}
                  </code>
                </div>

                <p className="text-xs text-slate-400 leading-normal bg-slate-950/40 p-3 rounded border border-slate-800/40">
                  {LECTURE_SLIDES[slideIndex].notes}
                </p>
              </div>

              {/* Slide pager coordinates */}
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3">
                <button 
                  disabled={slideIndex === 0}
                  onClick={() => setSlideIndex(prev => prev - 1)}
                  className="rounded bg-slate-800 p-1.5 text-slate-400 hover:bg-slate-700 disabled:opacity-20"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button 
                  disabled={slideIndex === LECTURE_SLIDES.length - 1}
                  onClick={() => setSlideIndex(prev => prev + 1)}
                  className="rounded bg-slate-800 p-1.5 text-slate-400 hover:bg-slate-700 disabled:opacity-20"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Video Streams Container (webcams grid) */}
            <div className="grid gap-3 content-start">
              {participants.map((p, idx) => (
                <div 
                  key={idx} 
                  className={`rounded-xl border bg-slate-900 overflow-hidden relative h-[100px] transition-all duration-300 ${
                    p.isSpeaking ? 'border-violet-500 shadow-md ring-1 ring-violet-500' : 'border-slate-800'
                  }`}
                >
                  {p.cameraOn ? (
                    <div className="absolute inset-0 bg-slate-800 flex items-center justify-center">
                      {/* Simulated Webcam pattern overlay */}
                      <img src={p.avatar} alt={p.name} className="h-full w-full object-cover opacity-60" referrerPolicy="no-referrer" />
                    </div>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-950">
                      <div className={`h-11 w-11 rounded-full ${p.avatarColor} flex items-center justify-center font-bold text-white shadow`}>
                        {p.name.charAt(0)}
                      </div>
                    </div>
                  )}

                  {/* Indicators overlay */}
                  <div className="absolute top-2 right-2 flex gap-1.5">
                    {p.handRaised && (
                      <span className="rounded bg-amber-500 p-1 text-slate-950 animate-bounce">
                        <Hand className="h-3 w-3 fill-current" />
                      </span>
                    )}
                    <span className="bg-slate-950/80 rounded px-1.5 py-0.5 text-[8px] font-mono text-slate-400 uppercase">
                      {p.micOn ? 'Mic On' : 'Muted'}
                    </span>
                  </div>

                  <div className="absolute bottom-2 left-2 bg-slate-950/70 rounded px-1.5 py-0.5 text-[10px] font-medium font-mono text-slate-300">
                    {p.name}
                  </div>
                </div>
              ))}

              {/* Student Client self stream */}
              <div className={`rounded-xl border bg-slate-900 overflow-hidden relative h-[100px] ${myCam ? 'border-violet-500' : 'border-slate-800'}`}>
                {myCam ? (
                  <div className="absolute inset-0 bg-slate-800 flex items-center justify-center">
                    <img src={DEFAULT_PARTICIPANTS[3].avatar} className="h-full w-full object-cover opacity-40 blur-[1px]" alt="Self" referrerPolicy="no-referrer" />
                    <span className="absolute text-xs text-slate-400 font-mono tracking-wider font-semibold">Self Video active</span>
                  </div>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-950">
                    <div className="h-11 w-11 rounded-full bg-violet-600 flex items-center justify-center font-bold text-white uppercase">
                      EC
                    </div>
                  </div>
                )}
                <div className="absolute bottom-2 left-2 bg-slate-950/70 rounded px-1.5 py-0.5 text-[10px] font-mono text-violet-400 font-bold">
                  Emily Chen (You)
                </div>
                <div className="absolute top-2 right-2 flex gap-1.5">
                  {myHand && (
                    <span className="rounded bg-amber-500 p-1 text-slate-950 animate-bounce">
                      <Hand className="h-3 w-3 fill-current" />
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Real-time automated captioned lecture transcript subtitled track */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 shrink-0 flex items-center gap-3">
            <span className="rounded bg-violet-950 border border-violet-800 px-3 py-1 text-[9px] font-mono text-violet-400 font-extrabold uppercase animate-pulse">Live Caption Track</span>
            <p className="text-xs text-slate-300 font-mono italic">
              &quot;{transcript}&quot;
            </p>
          </div>
        </div>

        {/* Right pane: Collapsible Room chat & Members inventory */}
        <div className="w-[300px] shrink-0 border-l border-slate-850 bg-slate-900 flex flex-col overflow-hidden">
          {/* Header tabs toggle */}
          <div className="flex h-11 border-b border-slate-800 text-xs font-semibold">
            <button 
              onClick={() => setPanelOpen('chat')}
              className={`flex-1 flex items-center justify-center gap-1 bg-slate-900/40 hover:bg-slate-950/40 ${panelOpen === 'chat' ? 'text-violet-400 font-bold border-b border-violet-400 bg-slate-950' : 'text-slate-400'}`}
            >
              <MessageSquare className="h-3.5 w-3.5" />
              Room Chat
            </button>
            <button 
              onClick={() => setPanelOpen('members')}
              className={`flex-1 flex items-center justify-center gap-1 bg-slate-900/40 hover:bg-slate-950/40 ${panelOpen === 'members' ? 'text-violet-400 font-bold border-b border-violet-400 bg-slate-950' : 'text-slate-400'}`}
            >
              <Users className="h-3.5 w-3.5" />
              Meeting ({participants.length + 1})
            </button>
          </div>

          {/* Panel: Room Chat logs */}
          {panelOpen === 'chat' && (
            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
                {chatLog.map((log, i) => (
                  <div key={i} className="space-y-1">
                    <span className="font-mono text-[10px] font-bold text-slate-400 block">{log.sender}</span>
                    <p className="bg-slate-950/40 border border-slate-850 p-2.5 rounded text-slate-300 leading-normal">
                      {log.text}
                    </p>
                  </div>
                ))}
              </div>

              {/* Chat Send footer block */}
              <div className="border-t border-slate-800 p-3.5 flex gap-2">
                <input 
                  type="text" 
                  value={chatText}
                  onChange={(e) => setChatText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                  placeholder="Post class query..." 
                  className="flex-1 rounded border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:border-violet-500 focus:outline-none"
                />
                <button 
                  onClick={handleSendChat}
                  className="rounded bg-violet-600 p-1.5 text-white hover:bg-violet-500"
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Panel: Student attendees inventory list */}
          {panelOpen === 'members' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
              <div className="space-y-2">
                <span className="text-[10px] font-mono font-bold tracking-wider text-slate-400 block pb-1">INSTRUCTORS</span>
                <div className="flex items-center justify-between bg-slate-950/30 p-2 rounded">
                  <div className="flex items-center gap-2">
                    <img src={DEFAULT_PARTICIPANTS[0].avatar} className="h-6 w-6 rounded-full" alt="" referrerPolicy="no-referrer" />
                    <span>Dr. Sarah Jenkins</span>
                  </div>
                  <span className="text-[9px] font-bold text-violet-400 font-mono">Presenting</span>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <span className="text-[10px] font-mono font-bold tracking-wider text-slate-400 block pb-1">ATTENDING PEERS</span>
                {participants.slice(1).map((p, i) => (
                  <div key={i} className="flex items-center justify-between p-2 hover:bg-slate-950/30 rounded">
                    <div className="flex items-center gap-2">
                      <img src={p.avatar} className="h-6 w-6 rounded-full" alt="" referrerPolicy="no-referrer" />
                      <span>{p.name}</span>
                    </div>
                    {p.handRaised && <span className="text-[9px] text-amber-500 font-bold uppercase animate-pulse">Raised limits</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Primary Toolbar Bottom Controller and Toggles */}
      <div className="h-16 shrink-0 bg-slate-900 border-t border-slate-800 flex items-center justify-center gap-3 px-4">
        <button 
          onClick={() => setMyMic(!myMic)}
          className={`rounded-xl p-3 shadow-md flex items-center gap-1.5 text-xs font-semibold ${
            myMic ? 'bg-slate-800 text-slate-200 hover:bg-slate-700' : 'bg-red-600 hover:bg-red-500 text-white animate-pulse'
          }`}
        >
          {myMic ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
          <span>{myMic ? 'Mute' : 'Mic Off'}</span>
        </button>

        <button 
          onClick={() => setMyCam(!myCam)}
          className={`rounded-xl p-3 shadow-md flex items-center gap-1.5 text-xs font-semibold ${
            myCam ? 'bg-slate-800 text-slate-200 hover:bg-slate-700' : 'bg-red-600 hover:bg-red-500 text-white animate-pulse'
          }`}
        >
          {myCam ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
          <span>{myCam ? 'Stop Video' : 'Video Off'}</span>
        </button>

        <button 
          onClick={() => setIsScreenShared(!isScreenShared)}
          className={`rounded-xl p-3 shadow-md flex items-center gap-1.5 text-xs font-semibold ${
            isScreenShared ? 'bg-emerald-600 text-white hover:bg-emerald-500' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
          }`}
        >
          <ScreenShare className="h-4 w-4" id="btn-screenshare-icon" />
          <span>{isScreenShared ? 'Stop Presenting' : 'Share Slate Screen'}</span>
        </button>

        <button 
          onClick={() => setMyHand(!myHand)}
          className={`rounded-xl p-3 shadow-md flex items-center gap-1.5 text-xs font-semibold ${
            myHand ? 'bg-amber-500 text-slate-950 hover:bg-amber-400' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
          }`}
        >
          <Hand className="h-4 w-4" id="btn-raisehand-icon" />
          <span>{myHand ? 'Lower Hand' : 'Raise hand threshold'}</span>
        </button>
      </div>
    </div>
  );
}
