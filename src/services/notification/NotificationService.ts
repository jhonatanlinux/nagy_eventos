import type { AppNotification, DatabaseShape } from "@/types/domain";
import { daysUntil, isDatePast } from "@/utils/dates";
import { createId } from "@/utils/ids";

import { readDatabase, updateDatabase } from "../storage/localRepository";

export type MudslideSettings = {
  serverUrl: string;
  authToken: string;
  instanceName: string;
  defaultGroup: string;
  testMessage: string;
};

function createNotification(
  input: Omit<AppNotification, "id" | "createdAt" | "updatedAt" | "read">,
) {
  const now = new Date().toISOString();

  return {
    ...input,
    id: createId("notification"),
    read: false,
    createdAt: now,
    updatedAt: now,
  } satisfies AppNotification;
}

function buildGeneratedNotifications(database: DatabaseShape) {
  const rentalAlerts = database.rentals.flatMap((rental) => {
    const pickupDistance = daysUntil(rental.pickupDate);
    const returnPast =
      isDatePast(rental.returnDate) &&
      !["Finalizado", "Cancelado"].includes(rental.status);
    const alerts: AppNotification[] = [];

    if ([3, 1, 0].includes(pickupDistance)) {
      alerts.push(
        createNotification({
          title:
            pickupDistance === 0
              ? "Aluguel hoje"
              : pickupDistance === 1
                ? "Aluguel amanha"
                : "Aluguel em 3 dias",
          description: `${rental.clientName} - retirada ${rental.pickupDate} as ${rental.pickupTime}.`,
          level: pickupDistance === 0 ? "danger" : "warning",
          source: "rental",
          sourceId: rental.id,
          dueAt: `${rental.pickupDate}T${rental.pickupTime}`,
        }),
      );
    }

    if (returnPast) {
      alerts.push(
        createNotification({
          title: "Devolucao atrasada",
          description: `${rental.clientName} deveria devolver em ${rental.returnDate}.`,
          level: "danger",
          source: "rental",
          sourceId: rental.id,
          dueAt: `${rental.returnDate}T${rental.returnTime}`,
        }),
      );
    }

    return alerts;
  });

  const expenseAlerts = database.expenses
    .filter(
      (expense) => expense.status !== "Pago" && isDatePast(expense.dueDate),
    )
    .map((expense) =>
      createNotification({
        title: "Despesa vencida",
        description: `${expense.description} - ${expense.supplier}.`,
        level: "danger",
        source: "expense",
        sourceId: expense.id,
        dueAt: `${expense.dueDate}T12:00:00`,
      }),
    );

  return [...rentalAlerts, ...expenseAlerts];
}

export const NotificationService = {
  async list() {
    const database = readDatabase();
    const generated = buildGeneratedNotifications(database);
    const persistedByKey = new Map(
      database.notifications.map((item) => [
        `${item.title}-${item.sourceId ?? item.id}`,
        item,
      ]),
    );
    const merged = generated.map((item) => {
      const persisted = persistedByKey.get(
        `${item.title}-${item.sourceId ?? item.id}`,
      );
      return persisted
        ? { ...item, id: persisted.id, read: persisted.read }
        : item;
    });

    updateDatabase((current) => ({
      ...current,
      notifications: [
        ...merged,
        ...current.notifications.filter((item) => item.source === "system"),
      ],
    }));

    return readDatabase().notifications;
  },

  async markAsRead(id: string) {
    updateDatabase((database) => ({
      ...database,
      notifications: database.notifications.map((notification) =>
        notification.id === id
          ? { ...notification, read: true, updatedAt: new Date().toISOString() }
          : notification,
      ),
    }));
  },

  prepareMudslideConnectionTest(settings: MudslideSettings) {
    return {
      ok: Boolean(
        settings.serverUrl && settings.authToken && settings.instanceName,
      ),
      message:
        settings.serverUrl && settings.authToken && settings.instanceName
          ? "Teste de conexao preparado para o backend."
          : "Preencha URL, token e instancia antes do teste.",
    };
  },

  prepareMudslideMessageTest(settings: MudslideSettings) {
    return {
      ok: Boolean(settings.defaultGroup && settings.testMessage),
      message:
        settings.defaultGroup && settings.testMessage
          ? "Mensagem de teste preparada para envio futuro."
          : "Informe grupo padrao e mensagem de teste.",
    };
  },
};
