export interface InteractionIA {
  id_interaction: number;
  question_utilisateur: string;
  reponse_ia: string;
  date_interaction: string;
  id_utilisateur: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  reactions?: {
    helpful?: boolean;
    notHelpful?: boolean;
  };
  attachments?: Attachment[];
}

export interface Attachment {
  id: string;
  type: 'image' | 'file';
  name: string;
  url: string;
}

export interface ChatConversation {
  id: string;
  title: string;
  subject?: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Recommandation {
  id_recommandation: number;
  contenu: string;
  type_recommandation: string;
  date_creation: string;
  id_utilisateur: number;
}
