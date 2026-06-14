import api from './axios';
import type { ChatConversation, ChatMessage, InteractionIA } from '@/types/chat.types';

export const chatApi = {
  /**
   * Get all chat conversations for user
   * Laravel endpoint: GET /api/conversations
   */
  getConversations: async (): Promise<ChatConversation[]> => {
    const response = await api.get('/conversations');
    return response.data;
  },

  /**
   * Get single conversation with messages
   * Laravel endpoint: GET /api/conversations/:id
   */
  getConversation: async (id: string): Promise<ChatConversation> => {
    const response = await api.get(`/conversations/${id}`);
    return response.data;
  },

  /**
   * Create new conversation
   * Laravel endpoint: POST /api/conversations
   */
  createConversation: async (title?: string, subject?: string): Promise<ChatConversation> => {
    const response = await api.post('/conversations', { title, subject });
    return response.data;
  },

  /**
   * Send message to AI tutor
   * Laravel endpoint: POST /api/conversations/:id/messages
   */
  sendMessage: async (conversationId: string, message: string, attachments?: File[]): Promise<ChatMessage> => {
    const formData = new FormData();
    formData.append('message', message);
    if (attachments) {
      attachments.forEach(file => formData.append('attachments[]', file));
    }
    
    const response = await api.post(`/conversations/${conversationId}/messages`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  /**
   * Stream AI response (for real-time typing effect)
   * Laravel endpoint: POST /api/chat/stream
   * Uses Server-Sent Events
   */
  streamMessage: (conversationId: string, message: string): EventSource => {
    const token = localStorage.getItem('auth_token');
    const url = `${import.meta.env.VITE_API_URL}/chat/stream?conversation_id=${conversationId}&message=${encodeURIComponent(message)}&token=${token}`;
    return new EventSource(url);
  },

  /**
   * Delete conversation
   * Laravel endpoint: DELETE /api/conversations/:id
   */
  deleteConversation: async (id: string): Promise<void> => {
    await api.delete(`/conversations/${id}`);
  },

  /**
   * Add reaction to message
   * Laravel endpoint: POST /api/messages/:id/reaction
   */
  addReaction: async (messageId: string, reaction: 'helpful' | 'not_helpful'): Promise<void> => {
    await api.post(`/messages/${messageId}/reaction`, { reaction });
  },

  /**
   * Get AI recommendations
   * Laravel endpoint: GET /api/recommendations
   */
  getRecommendations: async (): Promise<any[]> => {
    const response = await api.get('/recommendations');
    return response.data;
  },

  /**
   * Send message to AI tutor and get response
   * Laravel endpoint: POST /api/ai/chat
   */
  sendAIMessage: async (message: string, subject?: string): Promise<{
    success: boolean;
    data: {
      id: number;
      user_message: string;
      ai_response: string;
      timestamp: string;
    };
  }> => {
    const response = await api.post('/ai/chat', {
      message,
      subject: subject || 'general',
    });
    return response.data;
  },

  /**
   * Get chat history for the user
   * Laravel endpoint: GET /api/ai/chat/history
   */
  getChatHistory: async (limit?: number): Promise<InteractionIA[]> => {
    const response = await api.get('/ai/chat/history', {
      params: { limit: limit || 50 },
    });
    return response.data.data || response.data;
  },
};
