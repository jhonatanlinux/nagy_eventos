import { readDatabase } from "@/services/storage/localRepository";

export type GlobalSearchResultType =
  | "module"
  | "client"
  | "equipment"
  | "rental"
  | "expense"
  | "user"
  | "notification";

export type GlobalSearchResult = {
  id: string;
  type: GlobalSearchResultType;
  title: string;
  subtitle: string;
  path: string;
  keywords: string;
};

const moduleResults: GlobalSearchResult[] = [
  {
    id: "module-dashboard",
    type: "module",
    title: "Dashboard",
    subtitle: "Visao executiva da operacao",
    path: "/dashboard",
    keywords: "dashboard indicadores agenda receita despesas lucro graficos",
  },
  {
    id: "module-clientes",
    type: "module",
    title: "Clientes",
    subtitle: "Cadastro e historico de locacoes",
    path: "/clientes",
    keywords: "clientes cpf cnpj whatsapp email contato endereco",
  },
  {
    id: "module-equipamentos",
    type: "module",
    title: "Equipamentos",
    subtitle: "Inventario, patrimonio e disponibilidade",
    path: "/equipamentos",
    keywords: "equipamentos estoque patrimonio diaria status fotos",
  },
  {
    id: "module-agendamentos",
    type: "module",
    title: "Agendamentos",
    subtitle: "Calendario de alugueis",
    path: "/agendamentos",
    keywords: "agendamentos aluguel calendario retirada devolucao coleta",
  },
  {
    id: "module-financeiro",
    type: "module",
    title: "Financeiro",
    subtitle: "Fluxo de caixa, receitas e exportacoes",
    path: "/financeiro",
    keywords: "financeiro receita despesa fluxo caixa pdf excel lucro",
  },
  {
    id: "module-despesas",
    type: "module",
    title: "Despesas",
    subtitle: "Contas, fornecedores e vencimentos",
    path: "/despesas",
    keywords: "despesas fornecedor vencimento pagamento status anexos",
  },
  {
    id: "module-usuarios",
    type: "module",
    title: "Usuarios",
    subtitle: "Equipe, perfis e acessos",
    path: "/usuarios",
    keywords: "usuarios perfil senha ultimo acesso equipe",
  },
  {
    id: "module-permissoes",
    type: "module",
    title: "Permissoes",
    subtitle: "Matriz RBAC",
    path: "/permissoes",
    keywords: "permissoes rbac administrador gerente financeiro operacional",
  },
  {
    id: "module-notificacoes",
    type: "module",
    title: "Notificacoes",
    subtitle: "Alertas internos",
    path: "/notificacoes",
    keywords: "notificacoes alertas aluguel atrasado vencido mudslide",
  },
  {
    id: "module-configuracoes",
    type: "module",
    title: "Configuracoes",
    subtitle: "Empresa, sistema, Mudslide e logs",
    path: "/configuracoes",
    keywords: "configuracoes empresa sistema mudslide backup logs tema",
  },
];

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

function matches(result: GlobalSearchResult, term: string) {
  return normalize(
    `${result.title} ${result.subtitle} ${result.keywords}`,
  ).includes(term);
}

export const GlobalSearchService = {
  quickAccess(limit = 6) {
    return moduleResults.slice(0, limit);
  },

  search(query: string, limit = 8) {
    const term = normalize(query.trim());

    if (!term) {
      return [];
    }

    const database = readDatabase();
    const records: GlobalSearchResult[] = [
      ...database.clients.map((client) => ({
        id: `client-${client.id}`,
        type: "client" as const,
        title: client.name,
        subtitle: `${client.city}/${client.state} - ${client.whatsapp}`,
        path: "/clientes",
        keywords: `${client.document} ${client.email} ${client.phone} ${client.address} ${client.notes}`,
      })),
      ...database.equipment.map((equipment) => ({
        id: `equipment-${equipment.id}`,
        type: "equipment" as const,
        title: equipment.name,
        subtitle: `${equipment.category} - ${equipment.status}`,
        path: "/equipamentos",
        keywords: `${equipment.brand} ${equipment.model} ${equipment.patrimony} ${equipment.internalCode} ${equipment.notes}`,
      })),
      ...database.rentals.map((rental) => ({
        id: `rental-${rental.id}`,
        type: "rental" as const,
        title: rental.clientName,
        subtitle: `${rental.pickupDate} ${rental.pickupTime} - ${rental.status}`,
        path: "/agendamentos",
        keywords: `${rental.returnDate} ${rental.returnTime} ${rental.notes} ${rental.items
          .map((item) => item.equipmentName)
          .join(" ")}`,
      })),
      ...database.expenses.map((expense) => ({
        id: `expense-${expense.id}`,
        type: "expense" as const,
        title: expense.description,
        subtitle: `${expense.supplier} - ${expense.status}`,
        path: "/despesas",
        keywords: `${expense.category} ${expense.paymentMethod} ${expense.dueDate} ${expense.notes}`,
      })),
      ...database.users.map((user) => ({
        id: `user-${user.id}`,
        type: "user" as const,
        title: user.name,
        subtitle: `${user.role} - ${user.email}`,
        path: "/usuarios",
        keywords: `${user.status}`,
      })),
      ...database.notifications.map((notification) => ({
        id: `notification-${notification.id}`,
        type: "notification" as const,
        title: notification.title,
        subtitle: notification.description,
        path: "/notificacoes",
        keywords: `${notification.level} ${notification.source}`,
      })),
    ];

    return [...moduleResults, ...records]
      .filter((result) => matches(result, term))
      .slice(0, limit);
  },
};
