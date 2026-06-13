export interface Matiere {
  id_matiere: number;
  nom_matiere: string;
  description: string;
  date_creation: string;
  icon?: string;
  color?: string;
}

export interface Chapitre {
  id_chapitre: number;
  titre: string;
  description: string;
  id_matiere: number;
  date_creation: string;
}

export interface Lecon {
  id_lecon: number;
  titre: string;
  contenu: string;
  id_chapitre: number;
  date_creation: string;
  type: 'video' | 'text' | 'quiz' | 'exercise';
  duration?: number;
  completed?: boolean;
}

export interface Cours {
  id_cours: number;
  titre: string;
  description: string;
  niveau: string;
  id_chapitre: number;
  date_creation: string;
  thumbnail?: string;
  duration?: number;
  lessonsCount?: number;
  rating?: number;
  enrolledCount?: number;
}

export interface InscriptionCours {
  id_inscription: number;
  date_inscription: string;
  statut: string;
  id_utilisateur: number;
  id_cours: number;
}

export interface Progression {
  id_progression: number;
  pourcentage: number;
  date_mise_a_jour: string;
  id_utilisateur: number;
  id_cours: number;
}

export interface CourseWithProgress extends Cours {
  progress?: number;
  isEnrolled?: boolean;
  lastAccessed?: string;
}
