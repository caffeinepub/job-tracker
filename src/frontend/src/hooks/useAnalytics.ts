import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';

export function useGetOpenJobsByFirm() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['analytics', 'jobsByFirm'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getOpenJobsByFirm();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetOpenJobsByCategory() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['analytics', 'jobsByCategory'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getOpenJobsByCategory();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetUserJobsByStatus() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery({
    queryKey: ['analytics', 'userJobsByStatus', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity) return [];
      return actor.getUserJobsByStatus(identity.getPrincipal());
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useGetJobPostingTrend() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['analytics', 'jobPostingTrend'],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getJobPostingTrend();
    },
    enabled: !!actor && !isFetching,
  });
}
