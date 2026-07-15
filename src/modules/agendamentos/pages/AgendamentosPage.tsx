import { addDays, format, isSameDay, parseISO } from "date-fns";
import { Copy, GripVertical, Pencil, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import type { ZodType } from "zod";

import { ActionMenu } from "@/components/common/ActionMenu";
import { DataTable, type DataColumn } from "@/components/common/DataTable";
import {
  EntityFormDialog,
  type FieldConfig,
  type FormValues,
} from "@/components/common/EntityFormDialog";
import { PageHeader } from "@/components/common/PageHeader";
import { SearchInput } from "@/components/common/SearchInput";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useClientes } from "@/modules/clientes/hooks/useClientes";
import { useEquipamentos } from "@/modules/equipamentos/hooks/useEquipamentos";
import type { Rental, RentalStatus } from "@/types/domain";
import { addDaysISO, todayISO } from "@/utils/dates";
import { formatCurrency, formatDate } from "@/utils/format";

import type { RentalInput } from "../hooks/useAgendamentos";
import { useAgendamentos } from "../hooks/useAgendamentos";
import {
  agendamentoSchema,
  rentalStatuses,
} from "../schemas/agendamentoSchema";

type CalendarView = "Dia" | "Semana" | "Mes";

const viewOptions: CalendarView[] = ["Dia", "Semana", "Mes"];

function emptyValues(): FormValues {
  return {
    clientName: "",
    equipmentName: "",
    quantity: 1,
    pickupDate: todayISO(),
    pickupTime: "08:00",
    returnDate: addDaysISO(1),
    returnTime: "18:00",
    value: 0,
    discount: 0,
    freight: 0,
    assembly: 0,
    status: "Agendado",
    notes: "",
  };
}

function rentalToFormValues(rental: Rental | null): FormValues {
  if (!rental) {
    return emptyValues();
  }

  const firstItem = rental.items[0];

  return {
    clientName: rental.clientName,
    equipmentName: firstItem?.equipmentName ?? "",
    quantity: firstItem?.quantity ?? 1,
    pickupDate: rental.pickupDate,
    pickupTime: rental.pickupTime,
    returnDate: rental.returnDate,
    returnTime: rental.returnTime,
    value: rental.value,
    discount: rental.discount,
    freight: rental.freight,
    assembly: rental.assembly,
    status: rental.status,
    notes: rental.notes,
  };
}

export function AgendamentosPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [view, setView] = useState<CalendarView>("Semana");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selected, setSelected] = useState<Rental | null>(null);
  const { items, create, update, remove } = useAgendamentos();
  const { items: clients } = useClientes();
  const { items: equipment } = useEquipamentos();

  const fields: FieldConfig[] = useMemo(
    () => [
      {
        name: "clientName",
        label: "Cliente",
        type: "select",
        options: clients.map((client) => ({
          label: client.name,
          value: client.name,
        })),
      },
      {
        name: "equipmentName",
        label: "Equipamento",
        type: "select",
        options: equipment.map((item) => ({
          label: item.name,
          value: item.name,
        })),
      },
      { name: "quantity", label: "Quantidade", type: "number" },
      { name: "pickupDate", label: "Data retirada", type: "date" },
      { name: "pickupTime", label: "Hora retirada", type: "time" },
      { name: "returnDate", label: "Data devolucao", type: "date" },
      { name: "returnTime", label: "Hora devolucao", type: "time" },
      { name: "value", label: "Valor", type: "number" },
      { name: "discount", label: "Desconto", type: "number" },
      { name: "freight", label: "Frete", type: "number" },
      { name: "assembly", label: "Montagem", type: "number" },
      {
        name: "status",
        label: "Status",
        type: "select",
        options: rentalStatuses.map((status) => ({
          label: status,
          value: status,
        })),
      },
      {
        name: "notes",
        label: "Observacoes",
        type: "textarea",
        colSpan: "full",
      },
    ],
    [clients, equipment],
  );

  const filtered = useMemo(() => {
    const term = search.toLowerCase();
    return items.filter((rental) => {
      const matchesSearch = [rental.clientName, rental.status, rental.notes]
        .join(" ")
        .toLowerCase()
        .includes(term);
      const matchesStatus =
        statusFilter === "Todos" || rental.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [items, search, statusFilter]);

  const calendarDays = useMemo(() => {
    const length = view === "Dia" ? 1 : view === "Semana" ? 7 : 30;
    return Array.from({ length }, (_, index) => {
      const date = addDays(new Date(), index);
      return {
        iso: format(date, "yyyy-MM-dd"),
        label: format(date, "dd/MM"),
      };
    });
  }, [view]);

  const columns: DataColumn<Rental>[] = [
    { header: "Cliente", cell: (row) => <strong>{row.clientName}</strong> },
    {
      header: "Retirada",
      cell: (row) => `${formatDate(row.pickupDate)} ${row.pickupTime}`,
    },
    {
      header: "Devolucao",
      cell: (row) => `${formatDate(row.returnDate)} ${row.returnTime}`,
    },
    { header: "Valor", cell: (row) => formatCurrency(row.value) },
    { header: "Status", cell: (row) => <StatusBadge status={row.status} /> },
  ];

  function toRentalInput(
    values: FormValues,
    current?: Rental | null,
  ): RentalInput {
    const clientName = String(values.clientName ?? "");
    const equipmentName = String(values.equipmentName ?? "");
    const selectedClient = clients.find((client) => client.name === clientName);
    const selectedEquipment = equipment.find(
      (item) => item.name === equipmentName,
    );
    const quantity = Number(values.quantity ?? 1);

    return {
      clientId: selectedClient?.id ?? current?.clientId ?? "",
      clientName,
      items: [
        {
          equipmentId:
            selectedEquipment?.id ?? current?.items[0]?.equipmentId ?? "",
          equipmentName,
          quantity,
          unitValue:
            selectedEquipment?.dailyRate ??
            Number(values.value ?? 0) / quantity,
        },
      ],
      pickupDate: String(values.pickupDate ?? ""),
      pickupTime: String(values.pickupTime ?? ""),
      returnDate: String(values.returnDate ?? ""),
      returnTime: String(values.returnTime ?? ""),
      value: Number(values.value ?? 0),
      discount: Number(values.discount ?? 0),
      freight: Number(values.freight ?? 0),
      assembly: Number(values.assembly ?? 0),
      status: String(values.status ?? "Agendado") as RentalStatus,
      notes: String(values.notes ?? ""),
    };
  }

  function openCreate() {
    setSelected(null);
    setDialogOpen(true);
  }

  function openEdit(rental: Rental) {
    setSelected(rental);
    setDialogOpen(true);
  }

  async function submit(values: FormValues) {
    const input = toRentalInput(values, selected);

    if (selected) {
      await update({ id: selected.id, input });
      return;
    }

    await create(input);
  }

  async function duplicate(rental: Rental) {
    await create({
      ...rental,
      pickupDate: addDaysISO(1),
      returnDate: addDaysISO(2),
      status: "Agendado",
    });
  }

  async function moveRental(id: string, pickupDate: string) {
    await update({ id, input: { pickupDate } });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Agendamentos"
        description="Calendario operacional para criar, editar, cancelar, duplicar e mover alugueis."
        actions={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" aria-hidden />
            Novo aluguel
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <CardTitle>Calendario</CardTitle>
            <div className="flex flex-wrap gap-2">
              {viewOptions.map((option) => (
                <Button
                  key={option}
                  type="button"
                  size="sm"
                  variant={view === option ? "default" : "outline"}
                  onClick={() => setView(option)}
                >
                  {option}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-[1fr_220px]">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Pesquisar por cliente, status ou observacao"
            />
            <Select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="Todos">Todos os status</option>
              {rentalStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </Select>
          </div>

          <div
            className={cn(
              "grid gap-3 overflow-x-auto pb-2",
              view === "Dia"
                ? "grid-cols-1"
                : view === "Semana"
                  ? "grid-cols-1 md:grid-cols-7"
                  : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-5",
            )}
          >
            {calendarDays.map((day) => {
              const dayRentals = filtered.filter((rental) =>
                isSameDay(parseISO(rental.pickupDate), parseISO(day.iso)),
              );

              return (
                <div
                  key={day.iso}
                  className="min-h-44 rounded-lg border border-border bg-muted/30 p-3"
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => {
                    const id = event.dataTransfer.getData("text/plain");
                    if (id) {
                      void moveRental(id, day.iso);
                    }
                  }}
                >
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-sm font-semibold">{day.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {dayRentals.length}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {dayRentals.map((rental) => (
                      <div
                        key={rental.id}
                        draggable
                        onDragStart={(event) =>
                          event.dataTransfer.setData("text/plain", rental.id)
                        }
                        className="cursor-grab rounded-md border border-border bg-card p-3 text-sm shadow-sm"
                      >
                        <div className="flex items-start gap-2">
                          <GripVertical className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                          <div className="min-w-0 space-y-1">
                            <p className="truncate font-semibold">
                              {rental.clientName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {rental.pickupTime} -{" "}
                              {formatCurrency(rental.value)}
                            </p>
                            <StatusBadge status={rental.status} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <DataTable
        rows={filtered}
        columns={columns}
        getRowId={(row) => row.id}
        emptyLabel="Nenhum aluguel encontrado."
        actions={(row) => (
          <ActionMenu
            items={[
              {
                label: "Duplicar",
                icon: <Copy className="h-4 w-4" aria-hidden />,
                onClick: () => void duplicate(row),
              },
              {
                label: "Editar",
                icon: <Pencil className="h-4 w-4" aria-hidden />,
                onClick: () => openEdit(row),
              },
              {
                label: "Excluir",
                icon: <Trash2 className="h-4 w-4" aria-hidden />,
                onClick: () => void remove(row.id),
                destructive: true,
              },
            ]}
          />
        )}
      />

      <EntityFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={selected ? "Editar aluguel" : "Novo aluguel"}
        description="Valores, equipamentos, retirada e devolucao alimentam dashboard e notificacoes."
        fields={fields}
        schema={agendamentoSchema as ZodType<FormValues>}
        defaultValues={rentalToFormValues(selected)}
        submitLabel={selected ? "Salvar alteracoes" : "Criar aluguel"}
        onSubmit={submit}
      />
    </div>
  );
}
