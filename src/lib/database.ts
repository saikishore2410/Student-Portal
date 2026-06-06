import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  deleteDoc, 
  collection, 
  onSnapshot, 
  query, 
  where,
  getDocFromServer
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

import {
  UserProfile,
  UserRole,
  LearningPath,
  InteractiveQuiz,
  QuizAttempt,
  SecureMessage,
  CloudDocument,
  CalendarEvent,
  CourseNotification,
  AnalyticMetric
} from '../types';

// Initialize Firebase Core & Services
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth();

// Test Connection Immediately on Boot
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Please check your Firebase configuration or internet connection. Client is operating in offline mode.");
    }
  }
}
testConnection();

// --- FORCED ERROR HANDLING TYPE SYSTEM ---
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
        })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error Detailed Dispatch: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Default mock students for teacher visualization
const MOCK_STUDENTS: UserProfile[] = [
  { id: 'student_1', name: 'Emily Chen', email: 'emily.chen@university.edu', role: UserRole.STUDENT, avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80', averageScore: 88 } as any,
  { id: 'student_2', name: 'Marcus Sterling', email: 'm.sterling@university.edu', role: UserRole.STUDENT, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80', averageScore: 76 } as any,
  { id: 'student_3', name: 'Alina Popova', email: 'alina.p@university.edu', role: UserRole.STUDENT, avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80', averageScore: 92 } as any,
  { id: 'student_4', name: 'Devon Miller', email: 'd.miller@university.edu', role: UserRole.STUDENT, avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80', averageScore: 64 } as any,
];

const DEFAULT_PATHS: LearningPath[] = [
  {
    id: 'path_quantum',
    title: 'Intro to Quantum Computing & Mechanics',
    subject: 'Physics & Computing',
    description: 'Explore wave-particle duality, qubits, superposition, quantum gates, and physical entanglements from first principles.',
    progress: 33,
    recommendedHoursPerWeek: 6,
    units: [
      {
        id: 'unit_q1',
        title: 'Wave-Particle Duality & Planck Hypothesis',
        description: 'Understand key milestones of physics leading up to Bohr’s model and Planck’s formulation of light energy packets.',
        status: 'completed',
        quizId: 'quiz_q1',
        estimatedMinutes: 45,
        order: 1,
        aiInsights: 'Your background in calculus helps. Spend extra time reviewing double-slit experiments.'
      },
      {
        id: 'unit_q2',
        title: 'Superposition & Qubits Mechanics',
        description: 'Mathematical foundation of Hilbert spaces, Dirac notation, and vector space transitions representing a two-state quantum system.',
        status: 'unlocked',
        quizId: 'quiz_q2',
        estimatedMinutes: 60,
        order: 2,
        aiInsights: 'We recommend practicing matrix multiplications before loading this module.'
      },
      {
        id: 'unit_q3',
        title: 'Quantum Teleportation & Gates',
        description: 'Hands-on algorithms constructing Bell states and executing multi-qubit Hadamard, CNOT, and Phase shifts.',
        status: 'locked',
        quizId: 'quiz_q3',
        estimatedMinutes: 90,
        order: 3,
        aiInsights: 'Prerequisite logic gate foundations unlocked. Ready to learn after passing Unit 2 quiz.'
      }
    ]
  },
  {
    id: 'path_dsa',
    title: 'Advanced Algorithms & Dynamic Programming',
    subject: 'Computer Science',
    description: 'Master divide-and-conquer methodologies, memoization states, graph routing algorithms, and asymptotic complexity.',
    progress: 0,
    recommendedHoursPerWeek: 8,
    units: [
      {
        id: 'unit_d1',
        title: 'Asymptotic Analysis & Complexities',
        description: 'Analyze upper and lower operational bounds using Big-O, Big-Theta, and Big-Omega notation on core algorithms.',
        status: 'unlocked',
        quizId: 'quiz_d1',
        estimatedMinutes: 50,
        order: 1,
        aiInsights: 'Focus on recursive call-tree methods to quickly estimate space-time complexity.'
      },
      {
        id: 'unit_d2',
        title: 'Greedy Systems vs Memoization states',
        description: 'Solve the zero-one knapsack problem. Transition local-optimum greedy strategies to optimal overlapping subproblems.',
        status: 'locked',
        quizId: 'quiz_d2',
        estimatedMinutes: 75,
        order: 2
      },
      {
        id: 'unit_d3',
        title: 'Graph Traversal & Eulerian Paths',
        description: 'Implement Dijkstra, Prim, and Kruskal algorithms representing network packet transport mapping.',
        status: 'locked',
        quizId: 'quiz_d3',
        estimatedMinutes: 80,
        order: 3
      }
    ]
  }
];

const DEFAULT_QUIZZES: InteractiveQuiz[] = [
  {
    id: 'quiz_q1',
    title: 'Planck Wave Mechanics Assessment',
    topic: 'Wave-Particle Duality',
    passingScore: 70,
    questions: [
      {
        id: 'q1_1',
        question: 'Who formulated the relationship stating energy is directly proportional to wave frequency, and what is the factor?',
        options: [
          'Albert Einstein with Light Vector constant',
          'Max Planck with Plank’s Constant (h)',
          'Niels Bohr with Angular Momentum Scalar',
          'Erwin Schrödinger with Wave Probability density'
        ],
        correctOptionIndex: 1,
        explanation: 'Max Planck formulated E = h * nu in 1900, establishing the energy quantum and Planck’s constant.'
      },
      {
        id: 'q1_2',
        question: 'What interference phenomenon proved the wave packet theory of high-speed electrons?',
        options: [
          'Gold-foil Rutherford dispersion',
          'Davisson-Germer electron diffraction experiment',
          'Michelson-Morley interferometer vacuum test',
          'Faraday magnetic field bending'
        ],
        correctOptionIndex: 1,
        explanation: 'The Davisson–Germer experiment (1927) confirmed de Broglie’s wave hypothesis by diffracting electrons through nickel crystals.'
      }
    ]
  },
  {
    id: 'quiz_q2',
    title: 'Superposition & Qubit Linear State Review',
    topic: 'Superposition & Qubits Mechanics',
    passingScore: 70,
    questions: [
      {
        id: 'q2_1',
        question: 'If a qubit is in the state |ψ⟩ = (1/√2)|0⟩ + (i/√2)|1⟩, what is the probability of measuring |1⟩?',
        options: [
          '0 %',
          '25 %',
          '50 %',
          '100 %'
        ],
        correctOptionIndex: 2,
        explanation: 'The probability is the square of the absolute amplitude: |i/√2|^2 = (1/2) = 50%.'
      },
      {
        id: 'q2_2',
        question: 'Which bracket represents Dirac Bra notation for vector dual projections?',
        options: [
          '|ψ⟩',
          '⟨ψ|',
          '[ψ]',
          '⟨ψ|φ⟩'
        ],
        correctOptionIndex: 1,
        explanation: '⟨ψ| is the Bra (dual row vector), |ψ⟩ is the Ket (column vector), and combined they form the Inner Product Brac-ket: ⟨ψ|φ⟩.'
      }
    ]
  },
  {
    id: 'quiz_d1',
    title: 'Asymptotic Mechanics & Recursion Quiz',
    topic: 'Asymptotic Analysis & Complexities',
    passingScore: 70,
    questions: [
      {
        id: 'qd1_1',
        question: 'What is the tightest Big-O complexity of the recursive relation: T(n) = 2T(n/2) + O(n)?',
        options: [
          'O(n)',
          'O(n log n)',
          'O(n^2)',
          'O(2^n)'
        ],
        correctOptionIndex: 1,
        explanation: 'According to the Master Theorem, Case 2 applies where a = b^k (2 = 2^1), giving an asymptotic complexity of O(n log n).'
      },
      {
        id: 'qd1_2',
        question: 'Which notation specifically guarantees a tight bound mapping both upper and lower operational boundaries?',
        options: [
          'Big-O notation',
          'Big-Omega (Ω) notation',
          'Big-Theta (Θ) notation',
          'Little-o descriptor'
        ],
        correctOptionIndex: 2,
        explanation: 'Big-Theta (Θ) notation bound defines an asymptotically sandwiching constraint: f(n) lies within c1*g(n) and c2*g(n).'
      }
    ]
  }
];

const DEFAULT_CALENDAR: CalendarEvent[] = [
  {
    id: 'evt_1',
    title: 'Quantum Unit 1 Lab Due',
    description: 'Submit Planck Equation research calculation sheet.',
    dueDate: new Date(Date.now() + 2 * 24 * 3600 * 1000).toISOString(),
    type: 'assignment',
    associatedPathId: 'path_quantum',
    completed: false
  },
  {
    id: 'evt_2',
    title: 'VIRTUAL DISCUSSION: Superposition Lab',
    description: 'Live whiteboard lecture on Dirac matrices and gate calculations.',
    dueDate: new Date(Date.now() + 4 * 24 * 3600 * 1000).toISOString(),
    type: 'lecture',
    associatedPathId: 'path_quantum',
    completed: false
  },
  {
    id: 'evt_3',
    title: 'DSA: Big-O Homework submissions',
    description: 'Complete the 5 exercise sheets solving recursive trees.',
    dueDate: new Date(Date.now() + 1 * 24 * 3600 * 1000).toISOString(),
    type: 'assignment',
    associatedPathId: 'path_dsa',
    completed: false
  },
  {
    id: 'evt_4',
    title: 'Quantum Gates Exam Study Session',
    description: 'Peer-led review before midterms.',
    dueDate: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
    type: 'study',
    associatedPathId: 'path_quantum',
    completed: true
  }
];

const DEFAULT_DOCUMENTS: CloudDocument[] = [
  {
    id: 'doc_1',
    title: 'My Quantum Lecture Notes.note',
    content: 'Planck equation: E=hf. Waves act as particles (photons) when hitting nickel targets in double slit arrays. Superposition means system lies in multiple Hilbert spaces until measured.',
    fileType: 'note',
    size: '1.2 KB',
    ownerId: 'student_1',
    createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
    synced: true
  },
  {
    id: 'doc_2',
    title: 'Master Cheat Sheet: Recursive Relations',
    content: 'T(n) = aT(n/b) + f(n). Check master theorem cases: Case 1 is water tightness, Case 2 is dynamic split, Case 3 is polynomial growth check.',
    fileType: 'document',
    size: '4.8 KB',
    ownerId: 'student_1',
    createdAt: new Date().toISOString(),
    synced: true
  }
];

const DEFAULT_MESSAGES: SecureMessage[] = [
  {
    id: 'msg_1',
    senderId: 'teacher_sarah',
    senderName: 'Dr. Sarah Jenkins',
    receiverId: 'student_1',
    text: 'Hello Emily! I reviewed your dynamic programming preview. Your memoization logic is excellent, but make sure to check the boundary cases where knapsack capacity is zero.',
    timestamp: new Date(Date.now() - 5 * 3600 * 1000).toISOString()
  },
  {
    id: 'msg_2',
    senderId: 'student_1',
    senderName: 'Emily Chen',
    receiverId: 'teacher_sarah',
    text: 'Thank you, Professor! That makes total sense. I added a safeguard checking state capacity size first. Will upload the revision to my cloud documents shortly!',
    timestamp: new Date(Date.now() - 4 * 3600 * 1000).toISOString()
  }
];

const DEFAULT_NOTIFICATIONS: CourseNotification[] = [
  {
    id: 'notif_1',
    title: 'Urgent: Quiz Deadline approaching',
    message: 'Your Big-O analysis homework assessment is due in 24 hours.',
    type: 'alert',
    createdAt: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
    read: false
  },
  {
    id: 'notif_2',
    title: 'Dr. Sarah updated Quantum Unit 2 Insights',
    message: 'New personalized AI-assisted prerequisites tips are uploaded for your superposition studies.',
    type: 'success',
    createdAt: new Date(Date.now() - 10 * 3600 * 1000).toISOString(),
    read: false
  }
];

const DEFAULT_ANALYTICS: AnalyticMetric[] = [
  {
    studentId: 'student_1',
    studentName: 'Emily Chen',
    unitsCompleted: 4,
    averageQuizScore: 88,
    studyTimeHours: 18.5,
    activeStreakDays: 12,
    alertLevel: 'low'
  },
  {
    studentId: 'student_2',
    studentName: 'Marcus Sterling',
    unitsCompleted: 2,
    averageQuizScore: 76,
    studyTimeHours: 9.2,
    activeStreakDays: 3,
    alertLevel: 'medium'
  },
  {
    studentId: 'student_3',
    studentName: 'Alina Popova',
    unitsCompleted: 5,
    averageQuizScore: 92,
    studyTimeHours: 24.1,
    activeStreakDays: 14,
    alertLevel: 'low'
  },
  {
    studentId: 'student_4',
    studentName: 'Devon Miller',
    unitsCompleted: 1,
    averageQuizScore: 64,
    studyTimeHours: 4.8,
    activeStreakDays: 1,
    alertLevel: 'high'
  }
];

const MOCK_STUDENT: UserProfile = {
  id: 'student_1',
  name: 'Emily Chen',
  email: 'emily.chen@university.edu',
  role: UserRole.STUDENT,
  avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80'
};

// Automatic Auth session boot wrapper
let authInitialized = false;
let authPromise = signInAnonymously(auth)
  .then(() => {
    authInitialized = true;
    console.log("Firebase Authenticated anonymously successfully.");
  })
  .catch(e => {
    console.error("Firebase Anonymous auth initialization error:", e);
  });

export class OfflineStorage {
  private static syncActiveUser: string | null = null;
  private static unsubscribeSync: (() => void) | null = null;

  private static getKey(name: string): string {
    return `edtech_${name}`;
  }

  static get<T>(keyName: string, defaultValue: T): T {
    try {
      const data = localStorage.getItem(this.getKey(keyName));
      if (!data) return defaultValue;
      return JSON.parse(data);
    } catch {
      return defaultValue;
    }
  }

  static set<T>(keyName: string, value: T): void {
    try {
      localStorage.setItem(this.getKey(keyName), JSON.stringify(value));
    } catch (e) {
      console.error('Storage limits full or offline: ', e);
    }
  }

  private static cleanForFirestore(obj: any): any {
    if (obj === null || obj === undefined) return null;
    if (Array.isArray(obj)) {
      return obj.map(item => this.cleanForFirestore(item));
    }
    if (typeof obj === 'object') {
      const cleaned: any = {};
      for (const key of Object.keys(obj)) {
        if (obj[key] !== undefined) {
          cleaned[key] = this.cleanForFirestore(obj[key]);
        }
      }
      return cleaned;
    }
    return obj;
  }

  static async seedFirestoreIfEmpty() {
    await authPromise;
    if (localStorage.getItem(this.getKey('firebase_seeded_v1'))) return;
    try {
      // Seed paths
      for (const p of DEFAULT_PATHS) {
        await setDoc(doc(db, 'paths', p.id), this.cleanForFirestore(p));
      }
      // Seed quizzes
      for (const q of DEFAULT_QUIZZES) {
        await setDoc(doc(db, 'quizzes', q.id), this.cleanForFirestore(q));
      }
      // Seed calendar
      for (const e of DEFAULT_CALENDAR) {
        await setDoc(doc(db, 'calendar', e.id), this.cleanForFirestore(e));
      }
      // Seed documents
      for (const d of DEFAULT_DOCUMENTS) {
        await setDoc(doc(db, 'documents', d.id), this.cleanForFirestore(d));
      }
      // Seed messages
      for (const m of DEFAULT_MESSAGES) {
        await setDoc(doc(db, 'messages', m.id), this.cleanForFirestore(m));
      }
      // Seed notifications
      for (const n of DEFAULT_NOTIFICATIONS) {
        await setDoc(doc(db, 'notifications', n.id), this.cleanForFirestore(n));
      }
      // Seed analytics
      for (const a of DEFAULT_ANALYTICS) {
        await setDoc(doc(db, 'analytics', a.studentId), this.cleanForFirestore(a));
      }
      
      localStorage.setItem(this.getKey('firebase_seeded_v1'), 'true');
      console.log("Firebase Firestore initial state loaded and seeded successfully!");
    } catch (e) {
      console.warn("Seeding initial Firestore materials bypassed (likely due to secure policy limits):", e);
    }
  }

  static setupRealTimeSync(user: UserProfile) {
    if (this.syncActiveUser === user.id) return;
    if (this.unsubscribeSync) {
      this.unsubscribeSync();
    }
    this.syncActiveUser = user.id;

    const unsubscribeList: (() => void)[] = [];

    const addListener = (colName: string, queryRef: any, cacheKey: string) => {
      const unsub = onSnapshot(queryRef, (snapshot) => {
        const items: any[] = [];
        snapshot.forEach(docSnap => {
          items.push(docSnap.data());
        });
        
        const cached = this.get<any[]>(cacheKey, []);
        if (JSON.stringify(items) !== JSON.stringify(cached)) {
          this.set(cacheKey, items);
          window.dispatchEvent(new Event('edtech_db_update'));
        }
      }, (error) => {
        console.warn(`Firestore subscription sync read rejected on '${colName}':`, error.message);
      });
      unsubscribeList.push(unsub);
    };

    // 1. Core items (read/get allowed)
    addListener('quizzes', collection(db, 'quizzes'), 'quizzes');
    addListener('paths', collection(db, 'paths'), 'paths');
    addListener('calendar', collection(db, 'calendar'), 'calendar');
    addListener('notifications', collection(db, 'notifications'), 'notifications');
    addListener('users', collection(db, 'users'), 'users');

    // 2. Documents (Restricted by Role vs Owner)
    if (user.role === UserRole.TEACHER) {
      addListener('documents', collection(db, 'documents'), 'documents');
      addListener('analytics', collection(db, 'analytics'), 'analytics');
      addListener('messages', collection(db, 'messages'), 'messages');
    } else {
      addListener('documents', query(collection(db, 'documents'), where('ownerId', '==', user.id)), 'documents');
      addListener('analytics', query(collection(db, 'analytics'), where('studentId', '==', user.id)), 'analytics');
      
      // Messages tracking with twin filters (sent/received) merged dynamically
      let sentMsgs: any[] = [];
      let receivedMsgs: any[] = [];
      const mergeAndEmit = () => {
        const mergedMap = new Map();
        [...sentMsgs, ...receivedMsgs].forEach(m => mergedMap.set(m.id, m));
        const res = Array.from(mergedMap.values()).sort((a,b) => a.timestamp.localeCompare(b.timestamp));
        const cached = this.get<any[]>( 'messages', []);
        if (JSON.stringify(res) !== JSON.stringify(cached)) {
          this.set('messages', res);
          window.dispatchEvent(new Event('edtech_db_update'));
        }
      };

      const unsubSent = onSnapshot(query(collection(db, 'messages'), where('senderId', '==', user.id)), (snap) => {
        sentMsgs = [];
        snap.forEach(d => sentMsgs.push(d.data()));
        mergeAndEmit();
      }, (e) => console.log('Messages sent query bypassed', e));

      const unsubRecv = onSnapshot(query(collection(db, 'messages'), where('receiverId', '==', user.id)), (snap) => {
        receivedMsgs = [];
        snap.forEach(d => receivedMsgs.push(d.data()));
        mergeAndEmit();
      }, (e) => console.log('Messages received query bypassed', e));

      unsubscribeList.push(unsubSent, unsubRecv);
    }

    this.unsubscribeSync = () => {
      unsubscribeList.forEach(unsub => unsub());
      this.syncActiveUser = null;
    };
  }

  static async syncCollectionDelta<T extends { [key: string]: any }>(
    collectionName: string,
    newItems: T[],
    oldItems: T[],
    idField: keyof T = 'id' as keyof T
  ) {
    await authPromise;
    const oldMap = new Map(oldItems.map(item => [item[idField], item]));
    const newMap = new Map(newItems.map(item => [item[idField], item]));

    // Added or modified items
    for (const newItem of newItems) {
      const id = String(newItem[idField]);
      const oldItem = oldMap.get(newItem[idField]);
      if (!oldItem || JSON.stringify(newItem) !== JSON.stringify(oldItem)) {
        try {
          await setDoc(doc(db, collectionName, id), this.cleanForFirestore(newItem));
        } catch (error) {
          handleFirestoreError(error, OperationType.WRITE, `${collectionName}/${id}`);
        }
      }
    }

    // Deleted items
    for (const oldItem of oldItems) {
      const id = String(oldItem[idField]);
      if (!newMap.has(oldItem[idField])) {
        try {
          await deleteDoc(doc(db, collectionName, id));
        } catch (error) {
          handleFirestoreError(error, OperationType.DELETE, `${collectionName}/${id}`);
        }
      }
    }
  }

  static initializeDefaults() {
    if (!localStorage.getItem(this.getKey('initialized'))) {
      this.set('user', MOCK_STUDENT);
      this.set('paths', DEFAULT_PATHS);
      this.set('quizzes', DEFAULT_QUIZZES);
      this.set('calendar', DEFAULT_CALENDAR);
      this.set('documents', DEFAULT_DOCUMENTS);
      this.set('messages', DEFAULT_MESSAGES);
      this.set('notifications', DEFAULT_NOTIFICATIONS);
      this.set('analytics', DEFAULT_ANALYTICS);
      this.set('online_mode', true);
      this.set('initialized', true);
      
      // Trigger background seeding of Firestore on first ever initiation
      this.seedFirestoreIfEmpty();
    }
    
    // Auto-mount listeners for active logged-in profile
    const user = this.get<UserProfile | null>('user', null);
    if (user && !this.syncActiveUser) {
      this.setupRealTimeSync(user);
    }
  }

  static getUser(): UserProfile {
    this.initializeDefaults();
    return this.get('user', MOCK_STUDENT);
  }

  static setUser(user: UserProfile) {
    this.set('user', user);
    if (user) {
      setDoc(doc(db, 'users', user.id), this.cleanForFirestore(user)).catch(e => {
        console.warn("Failed to update user doc in Firestore:", e.message);
      });
      this.setupRealTimeSync(user);
    } else {
      if (this.unsubscribeSync) {
        this.unsubscribeSync();
        this.unsubscribeSync = null;
      }
    }
  }

  static getPaths(): LearningPath[] {
    this.initializeDefaults();
    return this.get('paths', DEFAULT_PATHS);
  }

  static setPaths(paths: LearningPath[]) {
    const old = this.getPaths();
    this.set('paths', paths);
    this.syncCollectionDelta('paths', paths, old);
  }

  static getQuizzes(): InteractiveQuiz[] {
    this.initializeDefaults();
    return this.get('quizzes', DEFAULT_QUIZZES);
  }

  static setQuizzes(quizzes: InteractiveQuiz[]) {
    const old = this.getQuizzes();
    this.set('quizzes', quizzes);
    this.syncCollectionDelta('quizzes', quizzes, old);
  }

  static getCalendar(): CalendarEvent[] {
    this.initializeDefaults();
    return this.get('calendar', DEFAULT_CALENDAR);
  }

  static setCalendar(calendar: CalendarEvent[]) {
    const old = this.getCalendar();
    this.set('calendar', calendar);
    this.syncCollectionDelta('calendar', calendar, old);
  }

  static getDocuments(): CloudDocument[] {
    this.initializeDefaults();
    return this.get('documents', DEFAULT_DOCUMENTS);
  }

  static setDocuments(docs: CloudDocument[]) {
    const old = this.getDocuments();
    this.set('documents', docs);
    this.syncCollectionDelta('documents', docs, old);
  }

  static getMessages(): SecureMessage[] {
    this.initializeDefaults();
    return this.get('messages', DEFAULT_MESSAGES);
  }

  static setMessages(msgs: SecureMessage[]) {
    const old = this.getMessages();
    this.set('messages', msgs);
    this.syncCollectionDelta('messages', msgs, old);
  }

  static getNotifications(): CourseNotification[] {
    this.initializeDefaults();
    return this.get('notifications', DEFAULT_NOTIFICATIONS);
  }

  static setNotifications(notifs: CourseNotification[]) {
    const old = this.getNotifications();
    this.set('notifications', notifs);
    this.syncCollectionDelta('notifications', notifs, old);
  }

  static getAnalytics(): AnalyticMetric[] {
    this.initializeDefaults();
    return this.get('analytics', DEFAULT_ANALYTICS);
  }

  static setAnalytics(analytics: AnalyticMetric[]) {
    const old = this.getAnalytics();
    this.set('analytics', analytics);
    this.syncCollectionDelta('analytics', analytics, old, 'studentId');
  }

  static getOnlineMode(): boolean {
    this.initializeDefaults();
    return this.get('online_mode', true);
  }

  static setOnlineMode(online: boolean) {
    this.set('online_mode', online);
  }

  static getPendingSync(): number {
    const docs = this.getDocuments().filter(d => !d.synced).length;
    return docs;
  }

  static getMockStudents(): UserProfile[] {
    return MOCK_STUDENTS;
  }
}
