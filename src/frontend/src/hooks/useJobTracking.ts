import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import { JobTrackingInput } from '../backend';

export function useGetUserJobTracking() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery({
    queryKey: ['userJobTracking', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity) return [];
      return actor.getUserJobTracking(identity.getPrincipal());
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useSaveJobTracking() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tracking: JobTrackingInput) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveJobTracking(tracking);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userJobTracking'] });
    },
  });
}
