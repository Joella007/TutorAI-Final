export interface LoginCredentials {
  email: string;
  mot_de_passe: string;
}

export interface RegisterData {
  email: string;
  mot_de_passe: string;
  nom: string;
  prenom: string;
  id_niveau: number;
  id_cycle?: number;
}
