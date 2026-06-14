export interface User {
  id_utilisateur: number;
  nom: string;
  prenom: string;
  email: string;
  statut: string;
  date_creation: string;
  id_role: number;
  id_cycle: number;
  id_niveau: number;
  avatar?: string;
}

export interface Role {
  id_role: number;
  nom_role: string;
  description: string;
}

export interface Cycle {
  id_cycle: number;
  nom_cycle: string;
}

export interface Niveau {
  id_niveau: number;
  nom_niveau: string;
  description: string;
  id_cycle: number;
  cycle?: Cycle;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginCredentials {
  email: string;
  mot_de_passe: string;
}

export interface RegisterData {
  nom: string;
  prenom: string;
  email: string;
  mot_de_passe: string;
  mot_de_passe_confirmation: string;
  id_niveau?: number;
  id_cycle?: number;
}

export interface UserStats {
  studyStreak: number;
  totalStudyHours: number;
  quizzesCompleted: number;
  currentLevel: number;
  xp: number;
  xpToNextLevel: number;
}
