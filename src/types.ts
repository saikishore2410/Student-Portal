export enum UserRole {
  STUDENT = 'student',
  TEACHER = 'teacher'
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  grade?: string;
  studyHabitScore?: number; // 0-100 analytics metric
  averageScore?: number;
}

export interface LearningUnit {
  id: string;
  title: string;
  description: string;
  status: 'locked' | 'unlocked' | 'completed';
  quizId?: string;
  estimatedMinutes: number;
  aiInsights?: string;
  order: number;
}

export interface LearningPath {
  id: string;
  title: string;
  subject: string;
  description: string;
  progress: number; // 0-100
  units: LearningUnit[];
  recommendedHoursPerWeek: number;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
}

export interface InteractiveQuiz {
  id: string;
  title: string;
  topic: string;
  questions: QuizQuestion[];
  passingScore: number; // e.g. 70
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  studentId: string;
  score: number; // 0-100
  passed: boolean;
  takenAt: string;
  answers: { [questionId: string]: number };
}

export interface SecureMessage {
  id: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  text: string;
  timestamp: string;
  fileAttachment?: {
    name: string;
    url: string;
    size: string;
  };
}

export interface CloudDocument {
  id: string;
  title: string;
  content: string;
  fileType: 'note' | 'document' | 'pdf' | 'spreadsheet';
  size: string;
  ownerId: string;
  createdAt: string;
  synced: boolean;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  dueDate: string; // ISO String
  type: 'assignment' | 'lecture' | 'exam' | 'study';
  associatedPathId?: string;
  completed: boolean;
}

export interface CourseNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'alert' | 'success';
  createdAt: string;
  read: boolean;
}

export interface AnalyticMetric {
  studentId: string;
  studentName: string;
  unitsCompleted: number;
  averageQuizScore: number;
  studyTimeHours: number;
  activeStreakDays: number;
  alertLevel: 'low' | 'medium' | 'high';
}

export interface CloudSyncState {
  lastSyncedAt: string;
  isOnline: boolean;
  pendingSyncCount: number;
}
