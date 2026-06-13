import { api } from './axios';
import { Niveau, Cycle } from '@/types/niveau.types';

export const getNiveaux = async (): Promise<Niveau[]> => {
  const response = await api.get('/niveaux');
  return response.data.data ?? response.data;
};

export const getCycles = async (): Promise<Cycle[]> => {
  const response = await api.get('/cycles');
  return response.data.data ?? response.data;
};
