import { Pencil, Plus, Trash2 } from "lucide-react";
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
import type { Equipment, EquipmentStatus } from "@/types/domain";
import { formatCurrency } from "@/utils/format";

import type { EquipmentInput } from "../hooks/useEquipamentos";
import { useEquipamentos } from "../hooks/useEquipamentos";
import {
  equipamentoSchema,
  equipmentStatuses,
} from "../schemas/equipamentoSchema";

const fields: FieldConfig[] = [
  {
    name: "category",
    label: "Categoria",
    placeholder: "Som, iluminacao, estrutura",
  },
  { name: "name", label: "Nome", placeholder: "Nome do equipamento" },
  { name: "brand", label: "Marca", placeholder: "Marca" },
  { name: "model", label: "Modelo", placeholder: "Modelo" },
  { name: "patrimony", label: "Patrimonio", placeholder: "PAT-0001" },
  { name: "internalCode", label: "Codigo interno", placeholder: "SOM-001" },
  { name: "quantity", label: "Quantidade", type: "number" },
  { name: "dailyRate", label: "Valor diaria", type: "number" },
  { name: "weekendRate", label: "Valor final de semana", type: "number" },
  { name: "weeklyRate", label: "Valor semanal", type: "number" },
  {
    name: "status",
    label: "Status",
    type: "select",
    options: equipmentStatuses.map((status) => ({
      label: status,
      value: status,
    })),
  },
  { name: "notes", label: "Observacoes", type: "textarea", colSpan: "full" },
];

const emptyValues: FormValues = {
  category: "",
  name: "",
  brand: "",
  model: "",
  patrimony: "",
  internalCode: "",
  quantity: 1,
  dailyRate: 0,
  weekendRate: 0,
  weeklyRate: 0,
  status: "Disponivel",
  notes: "",
};

function toEquipmentInput(
  values: FormValues,
  current?: Equipment | null,
): EquipmentInput {
  return {
    category: String(values.category ?? ""),
    name: String(values.name ?? ""),
    brand: String(values.brand ?? ""),
    model: String(values.model ?? ""),
    patrimony: String(values.patrimony ?? ""),
    internalCode: String(values.internalCode ?? ""),
    quantity: Number(values.quantity ?? 0),
    dailyRate: Number(values.dailyRate ?? 0),
    weekendRate: Number(values.weekendRate ?? 0),
    weeklyRate: Number(values.weeklyRate ?? 0),
    status: String(values.status ?? "Disponivel") as EquipmentStatus,
    photos: current?.photos ?? [],
    notes: String(values.notes ?? ""),
  };
}

function equipmentToFormValues(equipment: Equipment | null): FormValues {
  if (!equipment) {
    return emptyValues;
  }

  return {
    category: equipment.category,
    name: equipment.name,
    brand: equipment.brand,
    model: equipment.model,
    patrimony: equipment.patrimony,
    internalCode: equipment.internalCode,
    quantity: equipment.quantity,
    dailyRate: equipment.dailyRate,
    weekendRate: equipment.weekendRate,
    weeklyRate: equipment.weeklyRate,
    status: equipment.status,
    notes: equipment.notes,
  };
}

export function EquipamentosPage() {
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selected, setSelected] = useState<Equipment | null>(null);
  const { items, create, update, remove } = useEquipamentos();

  const filtered = useMemo(() => {
    const term = search.toLowerCase();
    return items.filter((item) =>
      [
        item.category,
        item.name,
        item.brand,
        item.model,
        item.internalCode,
        item.status,
      ]
        .join(" ")
        .toLowerCase()
        .includes(term),
    );
  }, [items, search]);

  const columns: DataColumn<Equipment>[] = [
    { header: "Equipamento", cell: (row) => <strong>{row.name}</strong> },
    { header: "Categoria", cell: (row) => row.category },
    { header: "Codigo", cell: (row) => row.internalCode },
    { header: "Qtd.", cell: (row) => row.quantity },
    { header: "Diaria", cell: (row) => formatCurrency(row.dailyRate) },
    { header: "Status", cell: (row) => <StatusBadge status={row.status} /> },
  ];

  function openCreate() {
    setSelected(null);
    setDialogOpen(true);
  }

  function openEdit(equipment: Equipment) {
    setSelected(equipment);
    setDialogOpen(true);
  }

  async function submit(values: FormValues) {
    const input = toEquipmentInput(values, selected);

    if (selected) {
      await update({ id: selected.id, input });
      return;
    }

    await create(input);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Equipamentos"
        description="Controle de patrimonio, valores, disponibilidade, fotos e observacoes tecnicas."
        actions={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" aria-hidden />
            Novo equipamento
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Inventario operacional</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Pesquisar por equipamento, categoria, codigo ou status"
          />
          <DataTable
            rows={filtered}
            columns={columns}
            getRowId={(row) => row.id}
            emptyLabel="Nenhum equipamento encontrado."
            actions={(row) => (
              <ActionMenu
                items={[
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
        </CardContent>
      </Card>

      <EntityFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={selected ? "Editar equipamento" : "Novo equipamento"}
        description="Valores e status alimentam agenda, financeiro e alertas."
        fields={fields}
        schema={equipamentoSchema as ZodType<FormValues>}
        defaultValues={equipmentToFormValues(selected)}
        submitLabel={selected ? "Salvar alteracoes" : "Cadastrar equipamento"}
        onSubmit={submit}
      />
    </div>
  );
}
