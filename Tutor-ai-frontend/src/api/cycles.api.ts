import { api } from './axios';
import { Cycle, Niveau } from '@/types/niveau.types';

export const getCycles = async (): Promise<Cycle[]> => {
  const response = await api.get('/cycles');
  return response.data.data ?? response.data;
};

export const getNiveaux = async (): Promise<Niveau[]> => {
  const response = await api.get('/niveaux');
  return response.data.data ?? response.data;
};

export const getNiveauxByCycle = async (idCycle: number): Promise<Niveau[]> => {
  const response = await api.get('/niveaux', { params: { id_cycle: idCycle } });
  return response.data.data ?? response.data;
};
