import api from './axios';

export interface Matiere {
  id: number;
  name: string;
  slug?: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Récupère la liste de toutes les matières depuis l'API Laravel
 */
export const getMatieres = async (): Promise<Matiere[]> => {
  try {
    const response = await api.get('/matieres');
    return response.data.data || response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des matières:', error);
    throw error;
  }
};

/**
 * Récupère une matière par son ID
 */
export const getMatiere = async (id: number): Promise<Matiere> => {
  try {
    const response = await api.get(`/matieres/${id}`);
    return response.data.data || response.data;
  } catch (error) {
    console.error(`Erreur lors de la récupération de la matière ${id}:`, error);
    throw error;
  }
};
