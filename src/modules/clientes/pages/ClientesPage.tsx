import { Plus, Pencil, Trash2 } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Client } from "@/types/domain";

import { useAgendamentos } from "@/modules/agendamentos/hooks/useAgendamentos";
import { clienteSchema } from "../schemas/clienteSchema";
import type { ClientInput } from "../hooks/useClientes";
import { useClientes } from "../hooks/useClientes";

const fields: FieldConfig[] = [
  { name: "name", label: "Nome", placeholder: "Nome do cliente" },
  { name: "document", label: "CPF/CNPJ", placeholder: "000.000.000-00" },
  { name: "phone", label: "Telefone", placeholder: "(65) 0000-0000" },
  { name: "whatsapp", label: "WhatsApp", placeholder: "(65) 90000-0000" },
  {
    name: "email",
    label: "E-mail",
    type: "email",
    placeholder: "cliente@email.com",
  },
  { name: "address", label: "Endereco", placeholder: "Rua, numero, bairro" },
  { name: "city", label: "Cidade", placeholder: "Cuiaba" },
  { name: "state", label: "Estado", placeholder: "MT" },
  { name: "notes", label: "Observacoes", type: "textarea", colSpan: "full" },
];

const emptyValues: FormValues = {
  name: "",
  document: "",
  phone: "",
  whatsapp: "",
  email: "",
  address: "",
  city: "",
  state: "",
  notes: "",
};

function toClientInput(values: FormValues): ClientInput {
  return {
    name: String(values.name ?? ""),
    document: String(values.document ?? ""),
    phone: String(values.phone ?? ""),
    whatsapp: String(values.whatsapp ?? ""),
    email: String(values.email ?? ""),
    address: String(values.address ?? ""),
    city: String(values.city ?? ""),
    state: String(values.state ?? ""),
    notes: String(values.notes ?? ""),
  };
}

function clientToFormValues(client: Client | null): FormValues {
  if (!client) {
    return emptyValues;
  }

  return {
    name: client.name,
    document: client.document,
    phone: client.phone,
    whatsapp: client.whatsapp,
    email: client.email,
    address: client.address,
    city: client.city,
    state: client.state,
    notes: client.notes,
  };
}

export function ClientesPage() {
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selected, setSelected] = useState<Client | null>(null);
  const { items, create, update, remove } = useClientes();
  const { items: rentals } = useAgendamentos();

  const filtered = useMemo(() => {
    const term = search.toLowerCase();
    return items.filter((client) =>
      [client.name, client.document, client.email, client.city]
        .join(" ")
        .toLowerCase()
        .includes(term),
    );
  }, [items, search]);

  const columns: DataColumn<Client>[] = [
    { header: "Cliente", cell: (row) => <strong>{row.name}</strong> },
    { header: "Documento", cell: (row) => row.document },
    { header: "WhatsApp", cell: (row) => row.whatsapp },
    { header: "E-mail", cell: (row) => row.email },
    { header: "Cidade", cell: (row) => `${row.city}/${row.state}` },
    {
      header: "Historico",
      cell: (row) =>
        `${rentals.filter((rental) => rental.clientId === row.id).length} locacoes`,
    },
  ];

  function openCreate() {
    setSelected(null);
    setDialogOpen(true);
  }

  function openEdit(client: Client) {
    setSelected(client);
    setDialogOpen(true);
  }

  async function submit(values: FormValues) {
    const input = toClientInput(values);

    if (selected) {
      await update({ id: selected.id, input });
      return;
    }

    await create(input);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Clientes"
        description="Cadastro completo, contatos e historico de locacoes em um unico fluxo."
        actions={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" aria-hidden />
            Novo cliente
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Base de clientes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Pesquisar por nome, documento, e-mail ou cidade"
          />
          <DataTable
            rows={filtered}
            columns={columns}
            getRowId={(row) => row.id}
            emptyLabel="Nenhum cliente encontrado."
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
        title={selected ? "Editar cliente" : "Novo cliente"}
        description="Mantenha os dados completos para contratos, entregas e historico."
        fields={fields}
        schema={clienteSchema as ZodType<FormValues>}
        defaultValues={clientToFormValues(selected)}
        submitLabel={selected ? "Salvar alteracoes" : "Cadastrar cliente"}
        onSubmit={submit}
      />
    </div>
  );
}
