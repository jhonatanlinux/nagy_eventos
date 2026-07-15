import { isSameMonth, parseISO } from "date-fns";

import { readDatabase } from "@/services/storage/localRepository";

export type CashFlowRow = {
  id: string;
  type: "Receita" | "Despesa";
  description: string;
  date: string;
  value: number;
  status: string;
};

export type FinanceSummary = {
  revenue: number;
  expenses: number;
  profit: number;
  rows: CashFlowRow[];
  chart: { name: string; valor: number }[];
};

export const FinanceiroService = {
  async getSummary(): Promise<FinanceSummary> {
    const database = readDatabase();
    const now = new Date();
    const rentalRows: CashFlowRow[] = database.rentals.map((rental) => ({
      id: rental.id,
      type: "Receita",
      description: `Aluguel - ${rental.clientName}`,
      date: rental.pickupDate,
      value: rental.value,
      status: rental.status,
    }));
    const expenseRows: CashFlowRow[] = database.expenses.map((expense) => ({
      id: expense.id,
      type: "Despesa",
      description: expense.description,
      date: expense.dueDate,
      value: expense.value,
      status: expense.status,
    }));
    const rows = [...rentalRows, ...expenseRows].sort((a, b) =>
      b.date.localeCompare(a.date),
    );
    const monthRows = rows.filter((row) =>
      isSameMonth(parseISO(row.date), now),
    );
    const revenue = monthRows
      .filter((row) => row.type === "Receita")
      .reduce((total, row) => total + row.value, 0);
    const expenses = monthRows
      .filter((row) => row.type === "Despesa")
      .reduce((total, row) => total + row.value, 0);

    return {
      revenue,
      expenses,
      profit: revenue - expenses,
      rows,
      chart: [
        { name: "Receitas", valor: revenue },
        { name: "Despesas", valor: expenses },
        { name: "Lucro", valor: revenue - expenses },
      ],
    };
  },
};
