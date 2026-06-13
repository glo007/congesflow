export type Role = "SALARIE" | "MANAGER" | "RH";

export type StatutDemande = "SOUMISE" | "VALIDEE" | "REFUSEE" | "ANNULEE";

export interface Employe {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  role: Role;
}

export interface Solde {
  type_absence_id: number;
  annee: number;
  jours_acquis: number;
  jours_pris: number;
  jours_restants: number;
}

export interface Demande {
  id: number;
  employe_id: number;
  type_absence_id: number;
  date_debut: string;
  date_fin: string;
  nb_jours_ouvres: number;
  motif: string | null;
  statut: StatutDemande;
  commentaire_manager: string | null;
  created_at: string;
}

export interface NouvelleDemande {
  type_absence_id: number;
  date_debut: string;
  date_fin: string;
  motif?: string;
}

export interface Stats {
  en_attente: number;
  validees: number;
  refusees: number;
  annulees: number;
  total: number;
  jours_valides_mois: number;
  effectif: number;
}
