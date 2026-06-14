import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '@/types/user.types';
import { login as apiLogin, register as apiRegister, getAuthenticatedUser } from '@/api/auth.api';
import { LoginCredentials, RegisterData } from '@/types/auth.types';

interface AuthContextType {
  user:            User | null;
  token:           string | null;
  isAuthenticated: boolean;
  isLoading:       boolean;
  login:           (credentials: LoginCredentials) => Promise<void>;
  register:        (data: RegisterData) => Promise<any>;
  logout:          () => void;
  setUser:         (user: User | null) => void; // ← ajouté pour SettingsPage
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user,      setUser]      = useState<User | null>(null);
  const [token,     setToken]     = useState<string | null>(localStorage.getItem('auth_token'));
  const [isLoading, setIsLoading] = useState(true);

  const handleSetUserAndToken = useCallback((userData: User | null, authToken: string | null) => {
    setUser(userData);
    setToken(authToken);
    if (authToken) {
      localStorage.setItem('auth_token', authToken);
    } else {
      localStorage.removeItem('auth_token');
    }
  }, []);

  const logout = useCallback(() => {
    handleSetUserAndToken(null, null);
  }, [handleSetUserAndToken]);

  // ── Valider le token au chargement (ex: rafraîchissement de page) ──────────
  useEffect(() => {
    const validateToken = async () => {
      if (token && !user) {
        try {
          const fetchedUser = await getAuthenticatedUser();
          handleSetUserAndToken(fetchedUser, token);
        } catch (error) {
          console.error('Session validation failed:', error);
          logout();
        }
      }
      setIsLoading(false);
    };
    validateToken();
  }, [token, user, handleSetUserAndToken, logout]);

  const login = async (credentials: LoginCredentials) => {
    const { user: loggedInUser, token: authToken } = await apiLogin(credentials);
    handleSetUserAndToken(loggedInUser, authToken);
  };

  const register = async (data: RegisterData) => {
    const response = await apiRegister(data);
    handleSetUserAndToken(response.user, response.token);
    return response;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        setUser, // ← exposé pour permettre la mise à jour depuis SettingsPage
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}