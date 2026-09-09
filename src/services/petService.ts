import { api } from './api';
import type { Pet } from '../types';

export const getPets = async (): Promise<Pet[]> => {
  const response = await api.get('/animals');
  return response.data.animals;
};
