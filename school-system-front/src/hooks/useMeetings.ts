import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { meetingsApi, type MeetingRequest, type MeetingResponse } from "@/api/meetings.api";

const MEETINGS_KEY = "meetings";

export function useMeetings() {
  return useQuery<MeetingResponse[]>({
    queryKey: [MEETINGS_KEY],
    queryFn: () => meetingsApi.getAll(),
  });
}

export function useMeetingById(id: number) {
  return useQuery<MeetingResponse>({
    queryKey: [MEETINGS_KEY, id],
    queryFn: () => meetingsApi.getById(id),
    enabled: id > 0,
  });
}

export function useMeetingsByTeacher(enseignantId: number) {
  return useQuery<MeetingResponse[]>({
    queryKey: [MEETINGS_KEY, "teacher", enseignantId],
    queryFn: () => meetingsApi.getByTeacher(enseignantId),
    enabled: enseignantId > 0,
  });
}

export function useMeetingsByParent(parentId: number) {
  return useQuery<MeetingResponse[]>({
    queryKey: [MEETINGS_KEY, "parent", parentId],
    queryFn: () => meetingsApi.getByParent(parentId),
    enabled: parentId > 0,
  });
}

export function useMeetingsByStudent(studentId: number) {
  return useQuery<MeetingResponse[]>({
    queryKey: [MEETINGS_KEY, "student", studentId],
    queryFn: () => meetingsApi.getByStudent(studentId),
    enabled: studentId > 0,
  });
}

export function useCreateMeeting() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: MeetingRequest) => meetingsApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [MEETINGS_KEY] });
    },
  });
}

export function useUpdateMeeting() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: MeetingRequest }) =>
      meetingsApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [MEETINGS_KEY] });
    },
  });
}

export function useDeleteMeeting() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => meetingsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [MEETINGS_KEY] });
    },
  });
}
