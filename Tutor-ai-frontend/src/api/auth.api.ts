import api from './axios';
import type { User } from '@/types/user.types';
import type { LoginCredentials, RegisterData } from '@/types/auth.types';

interface AuthResponse {
  user:  User;
  token: string;
}

/**
 * POST /api/login
 */
export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/login', credentials);
  return response.data;
};

/**
 * POST /api/register
 */
export const register = async (data: RegisterData): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/register', data);
  return response.data;
};

/**
 * POST /api/logout
 */
export const logout = async (): Promise<void> => {
  await api.post('/logout');
};

/**
 * GET /api/user
 * Laravel retourne { data: { id_utilisateur, nom, prenom, email, ... } }
 * via UserResource — on doit unwrap le .data
 */
export const getAuthenticatedUser = async (): Promise<User> => {
  const response = await api.get('/user');
  // UserResource wrappe dans { data: {...} }
  return response.data?.data ?? response.data;
};

/**
 * CSRF cookie pour Sanctum SPA
 */
export const getCsrfCookie = async (): Promise<void> => {
  await api.get('/sanctum/csrf-cookie', {
    baseURL: import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:8000',
  });
};