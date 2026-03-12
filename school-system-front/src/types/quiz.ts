export type StatutQuiz = 'BROUILLON' | 'PUBLIE' | 'EN_COURS' | 'TERMINE';
export type TypeQuestion = 'QCM' | 'VRAI_FAUX' | 'TEXTE_LIBRE' | 'REPONSE_COURTE';
export type StatutTentative = 'EN_COURS' | 'SOUMISE' | 'CORRIGEE';

export interface Quiz {
  id: number;
  titre: string;
  description: string | null;
  moduleId: number | null;
  classeId: number | null;
  enseignantId: number | null;
  dureeMinutes: number;
  noteTotale: number;
  melangerQuestions: boolean;
  melangerReponses: boolean;
  afficherResultats: boolean;
  tentativesMax: number;
  dateDebut: string | null;
  dateFin: string | null;
  statut: StatutQuiz;
  totalQuestions: number;
  totalTentatives: number;
  createdAt: string;
  updatedAt: string;
}

export interface QuizDetail extends Quiz {
  questions: QuestionDTO[];
}

export interface CreateQuizRequest {
  titre: string;
  description?: string;
  moduleId?: number;
  classeId?: number;
  enseignantId?: number;
  dureeMinutes?: number;
  noteTotale?: number;
  melangerQuestions?: boolean;
  melangerReponses?: boolean;
  afficherResultats?: boolean;
  tentativesMax?: number;
  dateDebut?: string;
  dateFin?: string;
  statut?: StatutQuiz;
}

export interface ChoixReponseDTO {
  id?: number;
  texte: string;
  correct: boolean;
  ordre: number;
}

export interface QuestionDTO {
  id: number;
  quizId: number;
  texte: string;
  typeQuestion: TypeQuestion;
  points: number;
  ordre: number;
  explication: string | null;
  imageUrl: string | null;
  obligatoire: boolean;
  choix: ChoixReponseDTO[];
}

export interface CreateQuestionRequest {
  texte: string;
  typeQuestion: TypeQuestion;
  points?: number;
  ordre: number;
  explication?: string;
  imageUrl?: string;
  obligatoire?: boolean;
  choix?: ChoixReponseDTO[];
}

export interface Tentative {
  id: number;
  quizId: number;
  quizTitre: string;
  eleveId: number;
  dateDebut: string;
  dateFin: string | null;
  score: number | null;
  scorePourcentage: number | null;
  statut: StatutTentative;
  tempsPasseSecondes: number | null;
  reponses?: ReponseEleveDTO[];
  createdAt: string;
}

export interface CreateTentativeRequest {
  quizId: number;
  eleveId: number;
}

export interface ReponseEleveDTO {
  id: number;
  tentativeId: number;
  questionId: number;
  questionTexte: string;
  choixId: number | null;
  reponseTexte: string | null;
  correct: boolean | null;
  pointsObtenus: number;
}

export interface ReponseItem {
  questionId: number;
  choixId?: number;
  reponseTexte?: string;
}

export interface SubmitReponseRequest {
  tentativeId: number;
  reponses: ReponseItem[];
}

export interface QuizStats {
  totalTentatives: number;
  moyenneScore: number;
  tauxReussite: number;
  distributionNotes: Record<string, number>;
}
