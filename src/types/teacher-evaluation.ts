export interface TeacherEvaluation {
  id: number;
  teacherId: number;
  teacherName: string;
  evaluatorId: number | null;
  evaluatorName: string | null;
  anneeScolaire: string;
  trimestre: number;
  ponctualite: number;
  pedagogie: number;
  discipline: number;
  communication: number;
  implication: number;
  noteGlobale: number;
  commentaire: string;
  createdAt: string;
}

export interface TeacherEvaluationStats {
  teacherId: number;
  teacherName: string;
  avgPonctualite: number;
  avgPedagogie: number;
  avgDiscipline: number;
  avgCommunication: number;
  avgImplication: number;
  avgGlobale: number;
  totalEvaluations: number;
}
