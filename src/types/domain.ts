export type EntityStatus = "active" | "inactive";

export type RentalStatus =
  | "Agendado"
  | "Separacao"
  | "Saiu para entrega"
  | "Em uso"
  | "Retornado"
  | "Finalizado"
  | "Cancelado";

export type EquipmentStatus =
  "Disponivel" | "Reservado" | "Em aluguel" | "Manutencao" | "Inativo";

export type ExpenseStatus = "Pendente" | "Pago" | "Vencido";

export type RoleName =
  | "Administrador"
  | "Gerente"
  | "Financeiro"
  | "Operacional"
  | "Estoque"
  | "Vendedor";

export type BaseEntity = {
  id: string;
  createdAt: string;
  updatedAt: string;
};

export type Client = BaseEntity & {
  name: string;
  document: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  city: string;
  state: string;
  notes: string;
};

export type Equipment = BaseEntity & {
  category: string;
  name: string;
  brand: string;
  model: string;
  patrimony: string;
  internalCode: string;
  quantity: number;
  dailyRate: number;
  weekendRate: number;
  weeklyRate: number;
  status: EquipmentStatus;
  photos: string[];
  notes: string;
};

export type RentalItem = {
  equipmentId: string;
  equipmentName: string;
  quantity: number;
  unitValue: number;
};

export type Rental = BaseEntity & {
  clientId: string;
  clientName: string;
  items: RentalItem[];
  pickupDate: string;
  pickupTime: string;
  returnDate: string;
  returnTime: string;
  value: number;
  discount: number;
  freight: number;
  assembly: number;
  status: RentalStatus;
  notes: string;
};

export type Expense = BaseEntity & {
  category: string;
  supplier: string;
  description: string;
  value: number;
  paymentMethod: string;
  dueDate: string;
  paymentDate: string;
  status: ExpenseStatus;
  attachments: string[];
  notes: string;
};

export type UserProfile = BaseEntity & {
  name: string;
  email: string;
  role: RoleName;
  avatarUrl: string;
  lastAccess: string;
  status: EntityStatus;
};

export type NotificationLevel = "info" | "warning" | "danger";

export type AppNotification = BaseEntity & {
  title: string;
  description: string;
  level: NotificationLevel;
  read: boolean;
  source: "rental" | "expense" | "equipment" | "system";
  sourceId?: string;
  dueAt?: string;
};

export type AuditLog = BaseEntity & {
  action: "login" | "logout" | "create" | "update" | "delete";
  module: string;
  entityId?: string;
  userName: string;
  description: string;
};

export type DatabaseShape = {
  clients: Client[];
  equipment: Equipment[];
  rentals: Rental[];
  expenses: Expense[];
  users: UserProfile[];
  notifications: AppNotification[];
  auditLogs: AuditLog[];
};
