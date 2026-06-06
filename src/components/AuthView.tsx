import React, { useState, FormEvent } from 'react';
import { 
  OfflineStorage 
} from '../lib/database';
import { 
  UserProfile,
  UserRole
} from '../types';
import { 
  ShieldAlert, 
  KeyRound, 
  GraduationCap, 
  UserSquare2, 
  Fingerprint, 
  TrendingUp, 
  BookOpen, 
  Cpu
} from 'lucide-react';

interface AuthViewProps {
  onLoginSuccess: (user: UserProfile) => void;
}

export default function AuthView({ onLoginSuccess }: AuthViewProps) {
  const [selectedRole, setSelectedRole] = useState<'student' | 'teacher'>('student');
  const [email, setEmail] = useState<string>('student.emily@academy.edu');
  const [password, setPassword] = useState<string>('quantum-physics-123');
  const [errorMsg, setErrorMsg] = useState<string>("");

  const handleRoleToggle = (role: 'student' | 'teacher') => {
    setSelectedRole(role);
    if (role === 'student') {
      setEmail('student.emily@academy.edu');
      setPassword('quantum-physics-123');
    } else {
      setEmail('prof.sarah@academy.edu');
      setPassword('teacher-academic-321');
    }
  };

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const mockStudents = OfflineStorage.getMockStudents();
    const studentsAndTeachers = [
      ...mockStudents,
      {
        id: 'teacher_sarah',
        name: 'Dr. Sarah Jenkins',
        email: 'prof.sarah@academy.edu',
        role: UserRole.TEACHER,
        avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format"
      }
    ];

    const matchUser = studentsAndTeachers.find(
      u => u.email.toLowerCase() === email.trim().toLowerCase()
    );

    if (matchUser) {
      // For absolute ease and fully robust interactive experience, let all credentials succeed
      const profile: UserProfile = {
        id: matchUser.id,
        name: matchUser.name,
        email: matchUser.email,
        role: matchUser.role,
        avatar: matchUser.avatar
      };
      
      // Save current session inside local storage
      OfflineStorage.setUser(profile);
      onLoginSuccess(profile);
    } else {
      setErrorMsg("Unauthorized academic account identifier mismatch.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-900 overflow-hidden relative">
      {/* Visual glowing space graphics backgrounds */}
      <div className="absolute top-0 left-0 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/10 blur-3xl"></div>
      <div className="absolute bottom-0 right-0 h-96 w-96 translate-x-1/2 translate-y-1/2 rounded-full bg-emerald-600/10 blur-3xl"></div>

      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-slate-800 bg-slate-950/40 backdrop-blur-xl p-8 sm:p-10 shadow-2xl space-y-6">
        
        {/* Academic logo assembly */}
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg text-white">
            <Cpu className="h-7 w-7" />
          </div>
          <span className="text-[10px] font-mono tracking-widest text-violet-400 font-extrabold uppercase uppercase">University Portal Interface</span>
          <h1 className="text-2xl font-black tracking-tight text-white leading-none">Personalized Learning Plat</h1>
          <p className="text-xs text-slate-400 font-medium max-w-xs mx-auto">Socratic AI Advisor, classroom telemetry, secure file storage, and group videoconferencing.</p>
        </div>

        {/* Roles choice selection splits */}
        <div className="grid grid-cols-2 gap-2 bg-slate-900 border border-slate-800 p-1.5 rounded-2xl">
          <button 
            type="button"
            onClick={() => handleRoleToggle('student')}
            className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition-all ${
              selectedRole === 'student' 
                ? 'bg-violet-600 text-white shadow-md' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <GraduationCap className="h-4 w-4" />
            Emily (Student)
          </button>
          
          <button 
            type="button"
            onClick={() => handleRoleToggle('teacher')}
            className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition-all ${
              selectedRole === 'teacher' 
                ? 'bg-violet-600 text-white shadow-md' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserSquare2 className="h-4 w-4" />
            Dr. Jenkins (Prof)
          </button>
        </div>

        {/* Auth form sheet cards */}
        <form onSubmit={handleFormSubmit} className="space-y-4">
          {errorMsg && (
            <div className="flex items-center gap-2 rounded-lg bg-rose-950/30 border border-rose-900/50 p-3 text-xs font-semibold text-rose-400">
              <ShieldAlert className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="text-[10px] font-mono font-bold text-slate-400 block mb-1">EMAIL ADDRESS</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. emily@academy.edu" 
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-3 text-xs text-slate-100 placeholder-slate-600 focus:border-violet-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="text-[10px] font-mono font-bold text-slate-400 block mb-1">PASSWORD CREDENTIALS</label>
            <div className="relative">
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••" 
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-3 text-xs text-slate-100 placeholder-slate-600 focus:border-violet-500 focus:outline-none"
                required
              />
              <KeyRound className="absolute right-3.5 top-3.5 h-4 w-4 text-slate-600" id="password-key-icon" />
            </div>
          </div>

          <button 
            type="submit"
            className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-violet-600 py-3.5 text-xs font-black text-white shadow-lg hover:bg-violet-500 transition-all font-sans"
          >
            <Fingerprint className="h-4 w-4" />
            Authenticate Secure SSL Session
          </button>
        </form>

        {/* Sandbox details summary notes */}
        <div className="border-t border-slate-850 pt-4 text-center">
          <p className="text-[10px] text-slate-500 font-mono">PASSCODE ASSIGNED SECURELY BY ACADEMIA</p>
        </div>
      </div>
    </div>
  );
}
