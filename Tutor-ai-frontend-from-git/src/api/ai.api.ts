// aether-learn/src/api/ai.api.ts

import api from './axios';

export interface ChatMessage {
  id?: number;
  user_message: string;
  ai_response: string;
  cours?: string;
  timestamp?: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;      // index 0-3 de la bonne réponse
  explication: string;
}

export interface QuizResponse {
  success: boolean;
  cours: string;
  difficulte: string;
  quiz: QuizQuestion[];
}

/**
 * POST /api/ai/chat
 * Envoie un message au tuteur IA avec contexte de cours optionnel.
 */
export const sendChatMessage = async (
  message: string,
  idCours?: number,
  withHistory: boolean = true
): Promise<ChatMessage> => {
  const response = await api.post('/ai/chat', {
    message,
    id_cours: idCours,
    with_history: withHistory,
  });
  return response.data.data;
};

/**
 * GET /api/ai/chat/history
 * Récupère l'historique des conversations.
 */
export const getChatHistory = async (): Promise<{ data: ChatMessage[] }> => {
  const response = await api.get('/ai/chat/history');
  return response.data;
};

/**
 * POST /api/ai/quiz
 * Génère un quiz automatique pour un cours.
 */
export const generateQuiz = async (
  idCours: number,
  nbQuestions: number = 5,
  difficulte: 'Facile' | 'Moyen' | 'Difficile' = 'Moyen'
): Promise<QuizResponse> => {
  const response = await api.post('/ai/quiz', {
    id_cours: idCours,
    nb_questions: nbQuestions,
    difficulte,
  });
  return response.data;
};
