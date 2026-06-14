import api from './axios';
import type { Cours, Matiere, Chapitre, Lecon, Progression, CourseWithProgress } from '@/types/course.types';

export const coursesApi = {
  /**
   * Get all subjects
   * Laravel endpoint: GET /api/matieres
   */
  getSubjects: async (): Promise<Matiere[]> => {
    const response = await api.get('/matieres');
    return response.data;
  },

  /**
   * Get all courses with optional filters
   * Laravel endpoint: GET /api/cours
   */
  getCourses: async (filters?: {
    subject?: number;
    level?: string;
    search?: string;
  }): Promise<CourseWithProgress[]> => {
    const response = await api.get('/cours', { params: filters });
    return response.data;
  },

  /**
   * Get single course by ID
   * Laravel endpoint: GET /api/cours/:id
   */
  getCourse: async (id: number): Promise<CourseWithProgress> => {
    const response = await api.get(`/cours/${id}`);
    return response.data;
  },

  /**
   * Get chapters for a subject
   * Laravel endpoint: GET /api/matieres/:id/chapitres
   */
  getChapters: async (subjectId: number): Promise<Chapitre[]> => {
    const response = await api.get(`/matieres/${subjectId}/chapitres`);
    return response.data;
  },

  /**
   * Get lessons for a chapter
   * Laravel endpoint: GET /api/chapitres/:id/lecons
   */
  getLessons: async (chapterId: number): Promise<Lecon[]> => {
    const response = await api.get(`/chapitres/${chapterId}/lecons`);
    return response.data;
  },

  /**
   * Get single lesson
   * Laravel endpoint: GET /api/lecons/:id
   */
  getLesson: async (id: number): Promise<Lecon> => {
    const response = await api.get(`/lecons/${id}`);
    return response.data;
  },

  /**
   * Enroll in a course
   * Laravel endpoint: POST /api/cours/:id/enroll
   */
  enrollCourse: async (courseId: number): Promise<void> => {
    await api.post(`/cours/${courseId}/enroll`);
  },

  /**
   * Get user's enrolled courses
   * Laravel endpoint: GET /api/user/courses
   */
  getEnrolledCourses: async (): Promise<CourseWithProgress[]> => {
    const response = await api.get('/user/courses');
    return response.data;
  },

  /**
   * Update lesson progress
   * Laravel endpoint: POST /api/lecons/:id/complete
   */
  completeLesson: async (lessonId: number): Promise<void> => {
    await api.post(`/lecons/${lessonId}/complete`);
  },

  /**
   * Get user's progress for a course
   * Laravel endpoint: GET /api/cours/:id/progress
   */
  getCourseProgress: async (courseId: number): Promise<Progression> => {
    const response = await api.get(`/cours/${courseId}/progress`);
    return response.data;
  },
};
