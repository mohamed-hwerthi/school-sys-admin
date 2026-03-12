export type DocumentType =
  | 'CERTIFICAT_SCOLARITE'
  | 'CARTE_SCOLAIRE'
  | 'ATTESTATION_REUSSITE'
  | 'RELEVE_NOTES'
  | 'RECU_PAIEMENT';

export interface DocumentGenerationRequest {
  type: DocumentType;
  eleveId?: number;
  eleveIds?: number[];
  anneeScolaire?: string;
  trimestre?: number;
}

export interface DocumentTemplateConfig {
  schoolName: string;
  schoolLogo: string;
  address: string;
  directorName: string;
  signatures: string;
  headerText: string;
  footerText: string;
}

export interface DocumentHistory {
  id: number;
  type: DocumentType;
  eleveName: string | null;
  fileName: string;
  dateGeneration: string;
  anneeScolaire: string | null;
  trimestre: number | null;
}

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  CERTIFICAT_SCOLARITE: 'Certificat de Scolarite',
  CARTE_SCOLAIRE: 'Carte Scolaire',
  ATTESTATION_REUSSITE: 'Attestation de Reussite',
  RELEVE_NOTES: 'Releve de Notes',
  RECU_PAIEMENT: 'Recu de Paiement',
};
