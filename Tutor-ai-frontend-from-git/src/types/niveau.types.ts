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
