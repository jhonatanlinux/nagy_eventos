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
import type { Expense, ExpenseStatus } from "@/types/domain";
import { formatCurrency, formatDate } from "@/utils/format";

import type { ExpenseInput } from "../hooks/useDespesas";
import { useDespesas } from "../hooks/useDespesas";
import { despesaSchema, expenseStatuses } from "../schemas/despesaSchema";

const fields: FieldConfig[] = [
  {
    name: "category",
    label: "Categoria",
    placeholder: "Transporte, manutencao, equipe",
  },
  { name: "supplier", label: "Fornecedor", placeholder: "Fornecedor" },
  {
    name: "description",
    label: "Descricao",
    placeholder: "Descricao da despesa",
  },
  { name: "value", label: "Valor", type: "number" },
  {
    name: "paymentMethod",
    label: "Forma de pagamento",
    placeholder: "Pix, boleto, cartao",
  },
  { name: "dueDate", label: "Data de vencimento", type: "date" },
  { name: "paymentDate", label: "Data de pagamento", type: "date" },
  {
    name: "status",
    label: "Status",
    type: "select",
    options: expenseStatuses.map((status) => ({
      label: status,
      value: status,
    })),
  },
  { name: "notes", label: "Observacoes", type: "textarea", colSpan: "full" },
];

const emptyValues: FormValues = {
  category: "",
  supplier: "",
  description: "",
  value: 0,
  paymentMethod: "",
  dueDate: "",
  paymentDate: "",
  status: "Pendente",
  notes: "",
};

function toExpenseInput(
  values: FormValues,
  current?: Expense | null,
): ExpenseInput {
  return {
    category: String(values.category ?? ""),
    supplier: String(values.supplier ?? ""),
    description: String(values.description ?? ""),
    value: Number(values.value ?? 0),
    paymentMethod: String(values.paymentMethod ?? ""),
    dueDate: String(values.dueDate ?? ""),
    paymentDate: String(values.paymentDate ?? ""),
    status: String(values.status ?? "Pendente") as ExpenseStatus,
    attachments: current?.attachments ?? [],
    notes: String(values.notes ?? ""),
  };
}

function expenseToFormValues(expense: Expense | null): FormValues {
  if (!expense) {
    return emptyValues;
  }

  return {
    category: expense.category,
    supplier: expense.supplier,
    description: expense.description,
    value: expense.value,
    paymentMethod: expense.paymentMethod,
    dueDate: expense.dueDate,
    paymentDate: expense.paymentDate,
    status: expense.status,
    notes: expense.notes,
  };
}

export function DespesasPage() {
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selected, setSelected] = useState<Expense | null>(null);
  const { items, create, update, remove } = useDespesas();

  const filtered = useMemo(() => {
    const term = search.toLowerCase();
    return items.filter((expense) =>
      [expense.category, expense.supplier, expense.description, expense.status]
        .join(" ")
        .toLowerCase()
        .includes(term),
    );
  }, [items, search]);

  const columns: DataColumn<Expense>[] = [
    { header: "Descricao", cell: (row) => <strong>{row.description}</strong> },
    { header: "Categoria", cell: (row) => row.category },
    { header: "Fornecedor", cell: (row) => row.supplier },
    { header: "Valor", cell: (row) => formatCurrency(row.value) },
    { header: "Vencimento", cell: (row) => formatDate(row.dueDate) },
    { header: "Status", cell: (row) => <StatusBadge status={row.status} /> },
  ];

  function openCreate() {
    setSelected(null);
    setDialogOpen(true);
  }

  function openEdit(expense: Expense) {
    setSelected(expense);
    setDialogOpen(true);
  }

  async function submit(values: FormValues) {
    const input = toExpenseInput(values, selected);

    if (selected) {
      await update({ id: selected.id, input });
      return;
    }

    await create(input);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Despesas"
        description="Controle de fornecedores, vencimentos, pagamentos, anexos e observacoes."
        actions={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" aria-hidden />
            Nova despesa
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Contas e compromissos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Pesquisar por categoria, fornecedor, descricao ou status"
          />
          <DataTable
            rows={filtered}
            columns={columns}
            getRowId={(row) => row.id}
            emptyLabel="Nenhuma despesa encontrada."
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
        title={selected ? "Editar despesa" : "Nova despesa"}
        description="Despesas vencidas geram alertas internos automaticamente."
        fields={fields}
        schema={despesaSchema as ZodType<FormValues>}
        defaultValues={expenseToFormValues(selected)}
        submitLabel={selected ? "Salvar alteracoes" : "Cadastrar despesa"}
        onSubmit={submit}
      />
    </div>
  );
}
