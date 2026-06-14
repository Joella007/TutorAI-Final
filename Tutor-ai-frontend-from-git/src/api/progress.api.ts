import api from './axios';
import type { UserStats } from '@/types/user.types';
import type { Progression } from '@/types/course.types';

export interface WeeklyProgress {
  day: string;
  hours: number;
  date: string;
}

export interface SubjectProgress {
  subject: string;
  progress: number;
  color: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'learning' | 'streak' | 'quiz' | 'social';
  isUnlocked: boolean;
  progress: number;
  maxProgress: number;
  unlockedAt?: string;
}

export const progressApi = {
  /**
   * Get user stats overview
   * Laravel endpoint: GET /api/user/stats
   */
  getUserStats: async (): Promise<UserStats> => {
    const response = await api.get('/user/stats');
    return response.data;
  },

  /**
   * Get weekly study progress
   * Laravel endpoint: GET /api/user/progress/weekly
   */
  getWeeklyProgress: async (): Promise<WeeklyProgress[]> => {
    const response = await api.get('/user/progress/weekly');
    return response.data;
  },

  /**
   * Get monthly study heatmap data
   * Laravel endpoint: GET /api/user/progress/heatmap
   */
  getHeatmapData: async (year: number, month: number): Promise<{ date: string; count: number }[]> => {
    const response = await api.get('/user/progress/heatmap', { params: { year, month } });
    return response.data;
  },

  /**
   * Get progress by subject
   * Laravel endpoint: GET /api/user/progress/subjects
   */
  getSubjectProgress: async (): Promise<SubjectProgress[]> => {
    const response = await api.get('/user/progress/subjects');
    return response.data;
  },

  /**
   * Get all course progressions
   * Laravel endpoint: GET /api/user/progressions
   */
  getAllProgressions: async (): Promise<Progression[]> => {
    const response = await api.get('/user/progressions');
    return response.data;
  },

  /**
   * Get achievements
   * Laravel endpoint: GET /api/user/achievements
   */
  getAchievements: async (): Promise<Achievement[]> => {
    const response = await api.get('/user/achievements');
    return response.data;
  },

  /**
   * Log study session
   * Laravel endpoint: POST /api/user/study-session
   */
  logStudySession: async (data: { courseId: number; duration: number }): Promise<void> => {
    await api.post('/user/study-session', data);
  },

  /**
   * Get leaderboard
   * Laravel endpoint: GET /api/leaderboard
   */
  getLeaderboard: async (period: 'daily' | 'weekly' | 'monthly' | 'all'): Promise<any[]> => {
    const response = await api.get('/leaderboard', { params: { period } });
    return response.data;
  },
};
