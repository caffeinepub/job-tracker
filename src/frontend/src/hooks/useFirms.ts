import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { Firm } from '../backend';

export { useGetAllFirms } from './useQueries';

export function useAddOrUpdateFirm() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (firm: Firm) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addOrUpdateFirm(firm);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['firms'] });
    },
  });
}
