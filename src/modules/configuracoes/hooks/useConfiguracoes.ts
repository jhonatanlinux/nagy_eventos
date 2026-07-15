import { useQuery } from "@tanstack/react-query";

import { ConfiguracaoService } from "../services/ConfiguracaoService";

export function useConfiguracoes() {
  return useQuery({
    queryKey: ["settings"],
    queryFn: ConfiguracaoService.getSettings,
  });
}
