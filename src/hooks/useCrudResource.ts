import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { BaseEntity } from "@/types/domain";

type CrudService<T extends BaseEntity, Input> = {
  list: () => Promise<T[]>;
  create: (input: Input) => Promise<T>;
  update: (id: string, input: Partial<Input>) => Promise<T | null>;
  remove: (id: string) => Promise<void>;
};

export function useCrudResource<T extends BaseEntity, Input>(
  queryKey: string,
  service: CrudService<T, Input>,
) {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: [queryKey],
    queryFn: service.list,
  });

  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey: [queryKey] });
    await queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    await queryClient.invalidateQueries({ queryKey: ["notifications"] });
  };

  const createMutation = useMutation({
    mutationFn: service.create,
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<Input> }) =>
      service.update(id, input),
    onSuccess: invalidate,
  });

  const removeMutation = useMutation({
    mutationFn: service.remove,
    onSuccess: invalidate,
  });

  return {
    items: query.data ?? [],
    isLoading: query.isLoading,
    create: createMutation.mutateAsync,
    update: updateMutation.mutateAsync,
    remove: removeMutation.mutateAsync,
    isMutating:
      createMutation.isPending ||
      updateMutation.isPending ||
      removeMutation.isPending,
  };
}
