export interface Exercice {
  id_exercice: number;
  enonce: string;
  type_exercice: 'multiple_choice' | 'true_false' | 'fill_blank' | 'open';
  date_creation: string;
  id_cours: number;
}

export interface Question {
  id_question: number;
  texte_question: string;
  id_exercice: number;
  date_creation: string;
  options?: QuestionOption[];
  correctAnswer?: string;
}

export interface QuestionOption {
  id: string;
  label: string;
  text: string;
  isCorrect?: boolean;
}

export interface ReponseExercice {
  id_reponse: number;
  contenu_reponse: string;
  est_correcte: boolean;
  date_reponse: string;
  id_utilisateur: number;
  id_question: number;
}

export interface Evaluation {
  id_evaluation: number;
  titre: string;
  date_evaluation: string;
  note_maximale: number;
  id_cours: number;
}

export interface ResultatEvaluation {
  id_resultat: number;
  note_obtenue: number;
  commentaire: string;
  date_resultat: string;
  id_utilisateur: number;
  id_evaluation: number;
}

export interface Quiz {
  id: number;
  title: string;
  subject: string;
  questionsCount: number;
  timeLimit: number; // in minutes
  difficulty: 'easy' | 'medium' | 'hard';
  bestScore?: number;
  attempts?: number;
}

export interface QuizResult {
  quizId: number;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeTaken: number;
  answeredQuestions: AnsweredQuestion[];
}

export interface AnsweredQuestion {
  questionId: number;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  explanation?: string;
}
