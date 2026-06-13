import api from './axios';
import type { Quiz, Question, QuizResult, Exercice, Evaluation, ResultatEvaluation } from '@/types/quiz.types';

export const quizzesApi = {
  /**
   * Get all available quizzes
   * Laravel endpoint: GET /api/quizzes
   */
  getQuizzes: async (filters?: {
    subject?: string;
    difficulty?: string;
  }): Promise<Quiz[]> => {
    const response = await api.get('/quizzes', { params: filters });
    return response.data;
  },

  /**
   * Get single quiz with questions
   * Laravel endpoint: GET /api/quizzes/:id
   */
  getQuiz: async (id: number): Promise<Quiz & { questions: Question[] }> => {
    const response = await api.get(`/quizzes/${id}`);
    return response.data;
  },

  /**
   * Submit quiz answers
   * Laravel endpoint: POST /api/quizzes/:id/submit
   */
  submitQuiz: async (quizId: number, answers: { questionId: number; answer: string }[]): Promise<QuizResult> => {
    const response = await api.post(`/quizzes/${quizId}/submit`, { answers });
    return response.data;
  },

  /**
   * Get quiz results
   * Laravel endpoint: GET /api/quizzes/:id/results
   */
  getQuizResults: async (quizId: number): Promise<QuizResult[]> => {
    const response = await api.get(`/quizzes/${quizId}/results`);
    return response.data;
  },

  /**
   * Get exercises for a course
   * Laravel endpoint: GET /api/cours/:id/exercices
   */
  getExercises: async (courseId: number): Promise<Exercice[]> => {
    const response = await api.get(`/cours/${courseId}/exercices`);
    return response.data;
  },

  /**
   * Get questions for an exercise
   * Laravel endpoint: GET /api/exercices/:id/questions
   */
  getQuestions: async (exerciseId: number): Promise<Question[]> => {
    const response = await api.get(`/exercices/${exerciseId}/questions`);
    return response.data;
  },

  /**
   * Submit exercise answer
   * Laravel endpoint: POST /api/questions/:id/answer
   */
  submitAnswer: async (questionId: number, answer: string): Promise<{ isCorrect: boolean; explanation?: string }> => {
    const response = await api.post(`/questions/${questionId}/answer`, { contenu_reponse: answer });
    return response.data;
  },

  /**
   * Get evaluations for a course
   * Laravel endpoint: GET /api/cours/:id/evaluations
   */
  getEvaluations: async (courseId: number): Promise<Evaluation[]> => {
    const response = await api.get(`/cours/${courseId}/evaluations`);
    return response.data;
  },

  /**
   * Get user's evaluation results
   * Laravel endpoint: GET /api/user/evaluation-results
   */
  getUserResults: async (): Promise<ResultatEvaluation[]> => {
    const response = await api.get('/user/evaluation-results');
    return response.data;
  },
};
