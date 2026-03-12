import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { quizApi } from "@/api/quiz.api";
import type {
  Quiz,
  QuizDetail,
  CreateQuizRequest,
  QuestionDTO,
  CreateQuestionRequest,
  Tentative,
  CreateTentativeRequest,
  SubmitReponseRequest,
  QuizStats,
} from "@/types/quiz";

const QUIZ_KEY = "quiz";
const QUESTIONS_KEY = "quiz-questions";
const TENTATIVES_KEY = "tentatives";
const QUIZ_STATS_KEY = "quiz-stats";

// ── Quiz ──

export function useQuizzes(classeId?: number, statut?: string) {
  return useQuery<Quiz[]>({
    queryKey: [QUIZ_KEY, classeId, statut],
    queryFn: () => quizApi.getAll(classeId, statut),
  });
}

export function useQuizDetail(id?: number) {
  return useQuery<QuizDetail>({
    queryKey: [QUIZ_KEY, "detail", id],
    queryFn: () => quizApi.getDetail(id!),
    enabled: !!id,
  });
}

export function useCreateQuiz() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateQuizRequest) => quizApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUIZ_KEY] }),
  });
}

export function useUpdateQuiz() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CreateQuizRequest }) =>
      quizApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUIZ_KEY] }),
  });
}

export function usePublishQuiz() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => quizApi.publish(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUIZ_KEY] }),
  });
}

export function useDeleteQuiz() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => quizApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUIZ_KEY] }),
  });
}

// ── Questions ──

export function useQuestions(quizId?: number) {
  return useQuery<QuestionDTO[]>({
    queryKey: [QUESTIONS_KEY, quizId],
    queryFn: () => quizApi.getQuestions(quizId!),
    enabled: !!quizId,
  });
}

export function useCreateQuestion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ quizId, data }: { quizId: number; data: CreateQuestionRequest }) =>
      quizApi.createQuestion(quizId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUESTIONS_KEY] });
      qc.invalidateQueries({ queryKey: [QUIZ_KEY] });
    },
  });
}

export function useUpdateQuestion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ quizId, questionId, data }: { quizId: number; questionId: number; data: CreateQuestionRequest }) =>
      quizApi.updateQuestion(quizId, questionId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUESTIONS_KEY] });
      qc.invalidateQueries({ queryKey: [QUIZ_KEY] });
    },
  });
}

export function useDeleteQuestion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ quizId, questionId }: { quizId: number; questionId: number }) =>
      quizApi.deleteQuestion(quizId, questionId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUESTIONS_KEY] });
      qc.invalidateQueries({ queryKey: [QUIZ_KEY] });
    },
  });
}

// ── Tentatives ──

export function useTentativesByQuiz(quizId?: number) {
  return useQuery<Tentative[]>({
    queryKey: [TENTATIVES_KEY, "quiz", quizId],
    queryFn: () => quizApi.getTentativesByQuiz(quizId!),
    enabled: !!quizId,
  });
}

export function useTentativesByEleve(eleveId?: number) {
  return useQuery<Tentative[]>({
    queryKey: [TENTATIVES_KEY, "eleve", eleveId],
    queryFn: () => quizApi.getTentativesByEleve(eleveId!),
    enabled: !!eleveId,
  });
}

export function useTentativeDetail(id?: number) {
  return useQuery<Tentative>({
    queryKey: [TENTATIVES_KEY, "detail", id],
    queryFn: () => quizApi.getTentativeById(id!),
    enabled: !!id,
  });
}

export function useStartTentative() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTentativeRequest) => quizApi.startTentative(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [TENTATIVES_KEY] }),
  });
}

export function useSubmitTentative() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: SubmitReponseRequest) => quizApi.submitTentative(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [TENTATIVES_KEY] });
      qc.invalidateQueries({ queryKey: [QUIZ_STATS_KEY] });
    },
  });
}

export function useQuizStats(quizId?: number) {
  return useQuery<QuizStats>({
    queryKey: [QUIZ_STATS_KEY, quizId],
    queryFn: () => quizApi.getQuizStats(quizId!),
    enabled: !!quizId,
  });
}
