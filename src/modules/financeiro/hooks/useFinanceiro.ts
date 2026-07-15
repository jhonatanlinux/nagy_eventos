import { useQuery } from "@tanstack/react-query";

import { FinanceiroService } from "../services/FinanceiroService";

export function useFinanceiro() {
  return useQuery({
    queryKey: ["financeiro"],
    queryFn: FinanceiroService.getSummary,
  });
}
