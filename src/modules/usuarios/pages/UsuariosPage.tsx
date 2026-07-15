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
import type { EntityStatus, RoleName, UserProfile } from "@/types/domain";
import { formatDateTime } from "@/utils/format";

import type { UserInput } from "../hooks/useUsuarios";
import { useUsuarios } from "../hooks/useUsuarios";
import { roleNames, usuarioSchema } from "../schemas/usuarioSchema";

const fields: FieldConfig[] = [
  { name: "name", label: "Nome", placeholder: "Nome do usuario" },
  {
    name: "email",
    label: "E-mail",
    type: "email",
    placeholder: "usuario@email.com",
  },
  {
    name: "role",
    label: "Perfil",
    type: "select",
    options: roleNames.map((role) => ({ label: role, value: role })),
  },
  { name: "avatarUrl", label: "Foto", placeholder: "URL da foto" },
  {
    name: "status",
    label: "Status",
    type: "select",
    options: [
      { label: "Ativo", value: "active" },
      { label: "Inativo", value: "inactive" },
    ],
  },
];

const emptyValues: FormValues = {
  name: "",
  email: "",
  role: "Operacional",
  avatarUrl: "",
  status: "active",
};

function userToFormValues(user: UserProfile | null): FormValues {
  if (!user) {
    return emptyValues;
  }

  return {
    name: user.name,
    email: user.email,
    role: user.role,
    avatarUrl: user.avatarUrl,
    status: user.status,
  };
}

function toUserInput(
  values: FormValues,
  current?: UserProfile | null,
): UserInput {
  return {
    name: String(values.name ?? ""),
    email: String(values.email ?? ""),
    role: String(values.role ?? "Operacional") as RoleName,
    avatarUrl: String(values.avatarUrl ?? ""),
    status: String(values.status ?? "active") as EntityStatus,
    lastAccess: current?.lastAccess ?? new Date().toISOString(),
  };
}

export function UsuariosPage() {
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selected, setSelected] = useState<UserProfile | null>(null);
  const { items, create, update, remove } = useUsuarios();

  const filtered = useMemo(() => {
    const term = search.toLowerCase();
    return items.filter((user) =>
      [user.name, user.email, user.role, user.status]
        .join(" ")
        .toLowerCase()
        .includes(term),
    );
  }, [items, search]);

  const columns: DataColumn<UserProfile>[] = [
    { header: "Usuario", cell: (row) => <strong>{row.name}</strong> },
    { header: "E-mail", cell: (row) => row.email },
    { header: "Perfil", cell: (row) => row.role },
    { header: "Status", cell: (row) => <StatusBadge status={row.status} /> },
    { header: "Ultimo acesso", cell: (row) => formatDateTime(row.lastAccess) },
  ];

  async function submit(values: FormValues) {
    const input = toUserInput(values, selected);

    if (selected) {
      await update({ id: selected.id, input });
      return;
    }

    await create(input);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Usuarios"
        description="Cadastro, perfil, foto, controle de status e ultimo acesso."
        actions={
          <Button
            onClick={() => {
              setSelected(null);
              setDialogOpen(true);
            }}
          >
            <Plus className="h-4 w-4" aria-hidden />
            Novo usuario
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Equipe e acessos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Pesquisar por nome, e-mail, perfil ou status"
          />
          <DataTable
            rows={filtered}
            columns={columns}
            getRowId={(row) => row.id}
            emptyLabel="Nenhum usuario encontrado."
            actions={(row) => (
              <ActionMenu
                items={[
                  {
                    label: "Editar",
                    icon: <Pencil className="h-4 w-4" aria-hidden />,
                    onClick: () => {
                      setSelected(row);
                      setDialogOpen(true);
                    },
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
        title={selected ? "Editar usuario" : "Novo usuario"}
        description="Perfis alimentam a estrutura RBAC preparada para evolucao."
        fields={fields}
        schema={usuarioSchema as ZodType<FormValues>}
        defaultValues={userToFormValues(selected)}
        submitLabel={selected ? "Salvar alteracoes" : "Cadastrar usuario"}
        onSubmit={submit}
      />
    </div>
  );
}
