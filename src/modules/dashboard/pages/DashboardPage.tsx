import { addDays, format, isSameDay, parseISO } from "date-fns";
import { motion } from "framer-motion";
import {
  AlertCircle,
  ArrowRight,
  Banknote,
  CalendarDays,
  CheckCircle2,
  Clock3,
  PackageCheck,
  Plus,
  ReceiptText,
  RefreshCw,
  Route,
  TrendingDown,
  TrendingUp,
  UserPlus,
  Users,
  WalletCards,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as ChartTooltip,
  XAxis,
  YAxis,
} from "recharts";

import { EmptyState } from "@/components/common/EmptyState";
import { Skeleton } from "@/components/common/Skeleton";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Rental } from "@/types/domain";
import { formatCurrency, formatDate, formatDateTime } from "@/utils/format";

import { useDashboard } from "../hooks/useDashboard";
import type { DashboardSummary } from "../services/DashboardService";

type SurfaceProps = {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
};

type MetricProps = {
  label: string;
  value: string;
  helper: string;
  icon: LucideIcon;
  tone?: "brand" | "success" | "danger" | "neutral";
  delay: number;
};

const toneClasses = {
  brand: "bg-primary/10 text-primary",
  success: "bg-emerald-500/10 text-emerald-500",
  danger: "bg-red-500/10 text-red-500",
  neutral: "bg-muted text-muted-foreground",
};

function Surface({
  title,
  description,
  action,
  children,
  className,
}: SurfaceProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <div className="flex items-start justify-between gap-4 border-b border-border/60 px-5 py-4">
        <div className="min-w-0">
          <h2 className="text-sm font-extrabold text-foreground">{title}</h2>
          {description ? (
            <p className="mt-1 text-xs text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      <div className="p-5">{children}</div>
    </Card>
  );
}

function Metric({
  label,
  value,
  helper,
  icon: Icon,
  tone = "neutral",
  delay,
}: MetricProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay }}
    >
      <Card className="h-full p-4 hover:border-primary/25 sm:p-5">
        <div className="mb-5 flex items-center justify-between">
          <span className="text-xs font-bold uppercase text-muted-foreground">
            {label}
          </span>
          <span
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-lg",
              toneClasses[tone],
            )}
          >
            <Icon className="h-4 w-4" aria-hidden />
          </span>
        </div>
        <p className="text-2xl font-black tabular-nums text-foreground">
          {value}
        </p>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">{helper}</p>
      </Card>
    </motion.div>
  );
}

function RentalRow({
  rental,
  compact = false,
}: {
  rental: Rental;
  compact?: boolean;
}) {
  return (
    <Link
      to="/agendamentos"
      className="group flex items-center gap-3 rounded-lg border border-transparent px-2 py-2.5 transition hover:border-border hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-lg bg-muted text-[10px] font-bold text-muted-foreground">
        <strong className="text-sm leading-4 text-foreground">
          {format(parseISO(rental.pickupDate), "dd")}
        </strong>
        {format(parseISO(rental.pickupDate), "MMM")}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-bold">
          {rental.clientName}
        </span>
        <span className="block truncate text-xs text-muted-foreground">
          {rental.pickupTime}{" "}
          {!compact ? `- ${formatCurrency(rental.value)}` : ""}
        </span>
      </span>
      <StatusBadge status={rental.status} />
    </Link>
  );
}

function DashboardSkeleton() {
  return (
    <div
      className="space-y-5"
      aria-label="Carregando dashboard"
      aria-busy="true"
    >
      <Skeleton className="h-36 w-full" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-36" />
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
        <Skeleton className="h-96" />
        <Skeleton className="h-96" />
      </div>
    </div>
  );
}

function DashboardContent({ summary }: { summary: DashboardSummary }) {
  const criticalCount =
    summary.lateRentals.length + summary.pendingCollections.length;
  const totalPending = criticalCount + summary.pendingExpenses.length;
  const margin = summary.monthRevenue
    ? Math.round((summary.estimatedProfit / summary.monthRevenue) * 100)
    : 0;
  const operationalDays = Array.from({ length: 7 }, (_, index) => {
    const date = addDays(new Date(), index);
    const rentals = [
      ...summary.todayRentals,
      ...summary.upcomingRentals,
    ].filter((rental) => isSameDay(parseISO(rental.pickupDate), date));
    return { date, rentals };
  });
  const todayLabel = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  }).format(new Date());

  return (
    <motion.div
      className="space-y-5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <section className="relative overflow-hidden rounded-lg border border-border/70 bg-card px-5 py-5 shadow-panel sm:px-7 sm:py-6">
        <div className="enterprise-grid pointer-events-none absolute inset-0 opacity-30" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.12)]" />
              <span className="text-xs font-bold uppercase text-muted-foreground">
                Operacao em tempo real
              </span>
            </div>
            <h1 className="text-2xl font-black text-foreground sm:text-3xl">
              Visao geral da operacao
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground first-letter:uppercase">
              {todayLabel}. Acompanhe o que exige decisao agora.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <Link to="/clientes">
                <UserPlus className="h-4 w-4" />
                Novo cliente
              </Link>
            </Button>
            <Button asChild>
              <Link to="/agendamentos">
                <Plus className="h-4 w-4" />
                Novo aluguel
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric
          label="Receita do mes"
          value={formatCurrency(summary.monthRevenue)}
          helper="Faturamento no periodo atual"
          icon={TrendingUp}
          tone="success"
          delay={0}
        />
        <Metric
          label="Despesas do mes"
          value={formatCurrency(summary.monthExpenses)}
          helper={`${summary.pendingExpenses.length} lancamentos pendentes`}
          icon={TrendingDown}
          tone="danger"
          delay={0.04}
        />
        <Metric
          label="Lucro estimado"
          value={formatCurrency(summary.estimatedProfit)}
          helper={`Margem operacional de ${margin}%`}
          icon={Banknote}
          tone="brand"
          delay={0.08}
        />
        <Metric
          label="Equipamentos em uso"
          value={String(summary.rentedEquipment)}
          helper="Itens atualmente alocados"
          icon={PackageCheck}
          delay={0.12}
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
        <Surface
          title="Agenda operacional"
          description="Retiradas de hoje e proximos compromissos"
          action={
            <Button asChild size="sm" variant="ghost">
              <Link to="/agendamentos">
                Ver agenda
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          }
        >
          <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="border-b border-border/60 pb-5 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-5">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xs font-bold uppercase text-muted-foreground">
                  Hoje
                </p>
                <Badge variant="outline">
                  {summary.todayRentals.length} eventos
                </Badge>
              </div>
              <div className="space-y-1">
                {summary.todayRentals.length ? (
                  summary.todayRentals.map((rental) => (
                    <RentalRow key={rental.id} rental={rental} />
                  ))
                ) : (
                  <EmptyState
                    icon={CheckCircle2}
                    title="Agenda livre"
                    description="Nenhuma retirada programada para hoje."
                    className="min-h-48"
                  />
                )}
              </div>
            </div>
            <div>
              <p className="mb-3 text-xs font-bold uppercase text-muted-foreground">
                Proximos alugueis
              </p>
              <div className="space-y-1">
                {summary.upcomingRentals.length ? (
                  summary.upcomingRentals
                    .slice(0, 4)
                    .map((rental) => (
                      <RentalRow key={rental.id} rental={rental} compact />
                    ))
                ) : (
                  <EmptyState
                    icon={CalendarDays}
                    title="Sem compromissos"
                    description="Nao ha alugueis futuros cadastrados."
                    className="min-h-48"
                  />
                )}
              </div>
            </div>
          </div>
        </Surface>

        <Surface
          title="Central de atencao"
          description="Pendencias ordenadas por impacto"
          action={
            <span
              className={cn(
                "rounded-md px-2 py-1 text-xs font-black",
                totalPending
                  ? "bg-red-500/10 text-red-500"
                  : "bg-emerald-500/10 text-emerald-500",
              )}
            >
              {totalPending}
            </span>
          }
        >
          <div className="space-y-2">
            {[
              {
                label: "Alugueis atrasados",
                value: summary.lateRentals.length,
                icon: AlertCircle,
                path: "/agendamentos",
                danger: true,
              },
              {
                label: "Coletas pendentes",
                value: summary.pendingCollections.length,
                icon: Route,
                path: "/agendamentos",
              },
              {
                label: "Despesas pendentes",
                value: summary.pendingExpenses.length,
                icon: ReceiptText,
                path: "/despesas",
              },
            ].map((item) => (
              <Link
                key={item.label}
                to={item.path}
                className="flex items-center gap-3 rounded-lg border border-border/60 p-3 transition hover:border-primary/30 hover:bg-muted/40"
              >
                <span
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-lg",
                    item.danger && item.value
                      ? "bg-red-500/10 text-red-500"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  <item.icon className="h-4 w-4" />
                </span>
                <span className="flex-1 text-sm font-semibold">
                  {item.label}
                </span>
                <strong className="tabular-nums">{item.value}</strong>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            ))}
          </div>
          {!totalPending ? (
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-emerald-500/10 p-3 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
              Operacao sem pendencias criticas.
            </div>
          ) : null}
        </Surface>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Surface
          title="Desempenho financeiro"
          description="Receitas e despesas distribuidas por semana"
          action={
            <Button asChild size="sm" variant="ghost">
              <Link to="/financeiro">
                Detalhes
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          }
        >
          <div className="mb-5 flex flex-wrap gap-5 text-xs">
            <span className="flex items-center gap-2 text-muted-foreground">
              <i className="h-2 w-2 rounded-full bg-emerald-500" />
              Receitas{" "}
              <strong className="text-foreground">
                {formatCurrency(summary.monthRevenue)}
              </strong>
            </span>
            <span className="flex items-center gap-2 text-muted-foreground">
              <i className="h-2 w-2 rounded-full bg-red-500" />
              Despesas{" "}
              <strong className="text-foreground">
                {formatCurrency(summary.monthExpenses)}
              </strong>
            </span>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={summary.chart} margin={{ left: -20, right: 8 }}>
                <defs>
                  <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#10b981" stopOpacity={0.28} />
                    <stop offset="1" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="expenseFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#ef4444" stopOpacity={0.2} />
                    <stop offset="1" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  vertical={false}
                  stroke="hsl(var(--border))"
                  strokeDasharray="4 4"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                />
                <ChartTooltip
                  formatter={(value) => formatCurrency(Number(value))}
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="receitas"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fill="url(#revenueFill)"
                />
                <Area
                  type="monotone"
                  dataKey="despesas"
                  stroke="#ef4444"
                  strokeWidth={2.5}
                  fill="url(#expenseFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Surface>

        <Surface
          title="Proximos 7 dias"
          description="Densidade da agenda operacional"
        >
          <div className="grid grid-cols-7 gap-1.5">
            {operationalDays.map(({ date, rentals }, index) => (
              <div
                key={date.toISOString()}
                className={cn(
                  "flex min-w-0 flex-col items-center rounded-lg border px-1 py-3 text-center",
                  index === 0
                    ? "border-primary/40 bg-primary/10"
                    : "border-border/60 bg-muted/25",
                )}
              >
                <span className="text-[10px] font-bold uppercase text-muted-foreground">
                  {format(date, "EEE").slice(0, 3)}
                </span>
                <strong className="my-2 text-base">{format(date, "dd")}</strong>
                <span
                  className={cn(
                    "flex h-6 min-w-6 items-center justify-center rounded-md px-1 text-[10px] font-black",
                    rentals.length
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {rentals.length}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-5 space-y-3 border-t border-border/60 pt-5">
            <p className="text-xs font-bold uppercase text-muted-foreground">
              Atalhos
            </p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "Financeiro", icon: WalletCards, path: "/financeiro" },
                { label: "Clientes", icon: Users, path: "/clientes" },
                {
                  label: "Equipamentos",
                  icon: PackageCheck,
                  path: "/equipamentos",
                },
                { label: "Despesas", icon: ReceiptText, path: "/despesas" },
              ].map((item) => (
                <Button
                  key={item.path}
                  asChild
                  variant="outline"
                  className="h-11 justify-start px-3"
                >
                  <Link to={item.path}>
                    <item.icon className="h-4 w-4 text-primary" />
                    {item.label}
                  </Link>
                </Button>
              ))}
            </div>
          </div>
        </Surface>
      </section>

      <section className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        <Surface
          title="Equipamentos mais alugados"
          description="Itens com maior giro no periodo"
        >
          <div className="space-y-4">
            {summary.topEquipment.map((equipment, index) => {
              const max = summary.topEquipment[0]?.quantity || 1;
              return (
                <div key={equipment.name}>
                  <div className="mb-1.5 flex justify-between gap-3 text-xs">
                    <span className="truncate font-semibold">
                      {equipment.name}
                    </span>
                    <strong>{equipment.quantity}</strong>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <motion.div
                      className="h-full rounded-full bg-primary"
                      initial={{ width: 0 }}
                      animate={{
                        width: `${(equipment.quantity / max) * 100}%`,
                      }}
                      transition={{ delay: index * 0.06 }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Surface>
        <Surface
          title="Clientes recentes"
          description="Novos relacionamentos cadastrados"
        >
          <div className="space-y-1">
            {summary.recentClients.map((client) => (
              <Link
                key={client.id}
                to="/clientes"
                className="flex items-center gap-3 rounded-lg p-2.5 transition hover:bg-muted/50"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-xs font-black text-primary">
                  {client.name.slice(0, 2).toUpperCase()}
                </span>
                <span className="min-w-0 flex-1">
                  <strong className="block truncate text-sm">
                    {client.name}
                  </strong>
                  <span className="block truncate text-xs text-muted-foreground">
                    {client.city}/{client.state}
                  </span>
                </span>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            ))}
          </div>
        </Surface>
        <Surface
          title="Ultimas movimentacoes"
          description="Registro recente da operacao"
          className="lg:col-span-2 xl:col-span-1"
        >
          <div className="space-y-1">
            {summary.recentActivity.slice(0, 5).map((log) => (
              <div key={log.id} className="flex gap-3 rounded-lg p-2.5">
                <span className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                  <Clock3 className="h-3.5 w-3.5" />
                </span>
                <span className="min-w-0">
                  <strong className="block truncate text-xs">
                    {log.description}
                  </strong>
                  <span className="text-[11px] text-muted-foreground">
                    {log.module} - {formatDateTime(log.createdAt)}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </Surface>
      </section>

      {summary.pendingExpenses.length ? (
        <Surface
          title="Proximas contas"
          description="Compromissos financeiros ainda nao liquidados"
          action={
            <Button asChild size="sm" variant="ghost">
              <Link to="/despesas">
                Gerenciar
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          }
        >
          <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
            {summary.pendingExpenses.slice(0, 3).map((expense) => (
              <Link
                key={expense.id}
                to="/despesas"
                className="flex items-center gap-3 rounded-lg border border-border/60 p-3 transition hover:border-primary/30"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
                  <ReceiptText className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <strong className="block truncate text-sm">
                    {expense.description}
                  </strong>
                  <span className="text-xs text-muted-foreground">
                    Vence {formatDate(expense.dueDate)}
                  </span>
                </span>
                <strong className="text-sm">
                  {formatCurrency(expense.value)}
                </strong>
              </Link>
            ))}
          </div>
        </Surface>
      ) : null}
    </motion.div>
  );
}

export function DashboardPage() {
  const { data, isLoading, isError, refetch } = useDashboard();

  if (isLoading) return <DashboardSkeleton />;

  if (isError || !data) {
    return (
      <Card className="flex min-h-[420px] flex-col items-center justify-center p-8 text-center">
        <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-red-500/10 text-red-500">
          <AlertCircle className="h-6 w-6" />
        </span>
        <h1 className="text-lg font-black">
          Nao foi possivel carregar a dashboard
        </h1>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          Verifique a conexao e tente atualizar os indicadores.
        </p>
        <Button className="mt-5" onClick={() => void refetch()}>
          <RefreshCw className="h-4 w-4" />
          Tentar novamente
        </Button>
      </Card>
    );
  }

  return <DashboardContent summary={data} />;
}
