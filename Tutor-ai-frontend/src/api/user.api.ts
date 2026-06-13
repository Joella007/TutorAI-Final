import api from './axios';
import type { User, Role, Niveau } from '@/types/user.types';

export interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  studyReminders: boolean;
  reminderTime: string;
  weeklyReport: boolean;
}

export interface Subscription {
  plan: 'free' | 'pro' | 'enterprise';
  status: 'active' | 'cancelled' | 'expired';
  expiresAt?: string;
  features: string[];
}

export const userApi = {
  /**
   * Get all available levels
   * Laravel endpoint: GET /api/niveaux
   */
  getLevels: async (): Promise<Niveau[]> => {
    const response = await api.get('/niveaux');
    return response.data;
  },

  /**
   * Get all roles
   * Laravel endpoint: GET /api/roles
   */
  getRoles: async (): Promise<Role[]> => {
    const response = await api.get('/roles');
    return response.data;
  },

  /**
   * Update user preferences
   * Laravel endpoint: PUT /api/user/preferences
   */
  updatePreferences: async (preferences: {
    language?: string;
    timezone?: string;
    theme?: 'light' | 'dark';
    preferred_subjects?: number[];
  }): Promise<void> => {
    await api.put('/user/preferences', preferences);
  },

  /**
   * Get notification settings
   * Laravel endpoint: GET /api/user/notifications
   */
  getNotificationSettings: async (): Promise<NotificationSettings> => {
    const response = await api.get('/user/notifications');
    return response.data;
  },

  /**
   * Update notification settings
   * Laravel endpoint: PUT /api/user/notifications
   */
  updateNotificationSettings: async (settings: NotificationSettings): Promise<void> => {
    await api.put('/user/notifications', settings);
  },

  /**
   * Change password
   * Laravel endpoint: PUT /api/user/password
   */
  changePassword: async (data: {
    current_password: string;
    new_password: string;
    new_password_confirmation: string;
  }): Promise<void> => {
    await api.put('/user/password', data);
  },

  /**
   * Upload avatar
   * Laravel endpoint: POST /api/user/avatar
   */
  uploadAvatar: async (file: File): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append('avatar', file);
    const response = await api.post('/user/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  /**
   * Get subscription info
   * Laravel endpoint: GET /api/user/subscription
   */
  getSubscription: async (): Promise<Subscription> => {
    const response = await api.get('/user/subscription');
    return response.data;
  },

  /**
   * Delete account
   * Laravel endpoint: DELETE /api/user
   */
  deleteAccount: async (password: string): Promise<void> => {
    await api.delete('/user', { data: { password } });
  },

  /**
   * Get system logs for user
   * Laravel endpoint: GET /api/user/logs
   */
  getActivityLogs: async (): Promise<any[]> => {
    const response = await api.get('/user/logs');
    return response.data;
  },
};
