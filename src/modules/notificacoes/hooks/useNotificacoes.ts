import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { NotificationService } from "@/services/notification/NotificationService";

export function useNotificacoes() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["notifications"],
    queryFn: NotificationService.list,
  });
  const markAsRead = useMutation({
    mutationFn: NotificationService.markAsRead,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["notifications"] });
      await queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });

  return {
    items: query.data ?? [],
    markAsRead: markAsRead.mutateAsync,
  };
}
