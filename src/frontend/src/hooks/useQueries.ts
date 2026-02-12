import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import { JobPostingInput, Firm, CSVJobInput, UserRole } from '../backend';

export function useGetAllOpenJobs() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['openJobs'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllOpenJobs();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllJobs() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['allJobs'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllJobs();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllFirms() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['firms'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllFirms();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetCallerUserRole() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<UserRole>({
    queryKey: ['userRole', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !isFetching && !!identity,
    retry: false,
  });
}

export function useCreateOrUpdateJobPosting() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: JobPostingInput) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createOrUpdateJobPosting(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['openJobs'] });
      queryClient.invalidateQueries({ queryKey: ['allJobs'] });
    },
  });
}

export function useCloseJobPosting() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (jobId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.closeJobPosting(jobId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['openJobs'] });
      queryClient.invalidateQueries({ queryKey: ['allJobs'] });
    },
  });
}

export function useBulkImportJobs() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (csvData: CSVJobInput[]) => {
      if (!actor) throw new Error('Actor not available');
      return actor.bulkImportJobs(csvData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['openJobs'] });
      queryClient.invalidateQueries({ queryKey: ['allJobs'] });
      queryClient.invalidateQueries({ queryKey: ['firms'] });
    },
  });
}
