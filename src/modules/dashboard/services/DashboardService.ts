import { isSameMonth, parseISO } from "date-fns";

import { NotificationService } from "@/services/notification/NotificationService";
import { readDatabase } from "@/services/storage/localRepository";
import type { AuditLog, Client, Expense, Rental } from "@/types/domain";
import { todayISO } from "@/utils/dates";

export type DashboardSummary = {
  todayRentals: Rental[];
  upcomingRentals: Rental[];
  pendingCollections: Rental[];
  lateRentals: Rental[];
  pendingExpenses: Expense[];
  recentClients: Client[];
  recentActivity: AuditLog[];
  topEquipment: { name: string; quantity: number }[];
  rentedEquipment: number;
  monthRevenue: number;
  monthExpenses: number;
  estimatedProfit: number;
  chart: { name: string; receitas: number; despesas: number }[];
  notifications: Awaited<ReturnType<typeof NotificationService.list>>;
};

export const DashboardService = {
  async getSummary(): Promise<DashboardSummary> {
    const database = readDatabase();
    const today = todayISO();
    const now = new Date();

    const todayRentals = database.rentals.filter(
      (rental) => rental.pickupDate === today,
    );
    const upcomingRentals = database.rentals
      .filter(
        (rental) => rental.pickupDate >= today && rental.status !== "Cancelado",
      )
      .slice(0, 5);
    const pendingCollections = database.rentals.filter((rental) =>
      ["Retornado", "Finalizado", "Cancelado"].includes(rental.status)
        ? false
        : rental.returnDate <= today,
    );
    const lateRentals = database.rentals.filter(
      (rental) =>
        rental.returnDate < today &&
        !["Finalizado", "Cancelado"].includes(rental.status),
    );
    const pendingExpenses = database.expenses
      .filter((expense) => expense.status !== "Pago")
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
      .slice(0, 5);
    const recentClients = [...database.clients]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 5);
    const recentActivity = database.auditLogs.slice(0, 6);
    const equipmentMap = new Map<string, number>();

    database.rentals.forEach((rental) => {
      rental.items.forEach((item) => {
        equipmentMap.set(
          item.equipmentName,
          (equipmentMap.get(item.equipmentName) ?? 0) + item.quantity,
        );
      });
    });

    const topEquipment = [...equipmentMap.entries()]
      .map(([name, quantity]) => ({ name, quantity }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);
    const rentedEquipment = database.rentals
      .filter((rental) =>
        ["Saiu para entrega", "Em uso"].includes(rental.status),
      )
      .flatMap((rental) => rental.items)
      .reduce((total, item) => total + item.quantity, 0);
    const monthRentals = database.rentals.filter((rental) =>
      isSameMonth(parseISO(rental.pickupDate), now),
    );
    const monthExpensesRows = database.expenses.filter((expense) =>
      isSameMonth(parseISO(expense.dueDate), now),
    );
    const monthRevenue = monthRentals.reduce(
      (total, rental) => total + rental.value,
      0,
    );
    const monthExpenses = monthExpensesRows.reduce(
      (total, expense) => total + expense.value,
      0,
    );
    const chart = Array.from({ length: 4 }, (_, index) => {
      const week = index + 1;
      return {
        name: `Sem ${week}`,
        receitas: Math.round(monthRevenue * (0.18 + index * 0.08)),
        despesas: Math.round(monthExpenses * (0.14 + index * 0.07)),
      };
    });

    return {
      todayRentals,
      upcomingRentals,
      pendingCollections,
      lateRentals,
      pendingExpenses,
      recentClients,
      recentActivity,
      topEquipment,
      rentedEquipment,
      monthRevenue,
      monthExpenses,
      estimatedProfit: monthRevenue - monthExpenses,
      chart,
      notifications: await NotificationService.list(),
    };
  },
};
