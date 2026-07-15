import { useQuery } from "@tanstack/react-query";

import { DashboardService } from "../services/DashboardService";

export function useDashboard() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: DashboardService.getSummary,
  });
}
