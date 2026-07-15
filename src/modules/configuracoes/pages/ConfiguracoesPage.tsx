import {
  Bell,
  Building2,
  CloudUpload,
  Database,
  HardDrive,
  KeyRound,
  MessageCircle,
  Save,
  ShieldCheck,
  Smartphone,
  Users,
} from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";
import { Link } from "react-router-dom";

import { DataTable, type DataColumn } from "@/components/common/DataTable";
import { MetricCard } from "@/components/common/MetricCard";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { NotificationService } from "@/services/notification/NotificationService";
import { useThemeStore } from "@/stores/themeStore";
import type { AuditLog } from "@/types/domain";
import { formatDateTime } from "@/utils/format";

import { useConfiguracoes } from "../hooks/useConfiguracoes";

const sections = [
  { id: "empresa", label: "Empresa", icon: Building2 },
  { id: "sistema", label: "Sistema", icon: Database },
  { id: "notificacoes", label: "Notificacoes", icon: Bell },
  { id: "usuarios", label: "Usuarios", icon: Users },
  { id: "backup", label: "Backup", icon: CloudUpload },
  { id: "logs", label: "Logs", icon: ShieldCheck },
] as const;

type SectionId = (typeof sections)[number]["id"];

const auditColumns: DataColumn<AuditLog>[] = [
  {
    header: "Modulo",
    cell: (row) => row.module,
    sortValue: (row) => row.module,
  },
  {
    header: "Acao",
    cell: (row) => <StatusBadge status={row.action} />,
    sortValue: (row) => row.action,
  },
  {
    header: "Usuario",
    cell: (row) => row.userName,
    sortValue: (row) => row.userName,
  },
  {
    header: "Descricao",
    cell: (row) => row.description,
    sortValue: (row) => row.description,
  },
  {
    header: "Data",
    cell: (row) => formatDateTime(row.createdAt),
    sortValue: (row) => row.createdAt,
  },
];

function SettingsSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="border-b border-border bg-muted/25">
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-5">{children}</CardContent>
    </Card>
  );
}

export function ConfiguracoesPage() {
  const [activeSection, setActiveSection] = useState<SectionId>("empresa");
  const [mudslideStatus, setMudslideStatus] = useState(
    "Aguardando configuracao",
  );
  const [mudslideSettings, setMudslideSettings] = useState({
    serverUrl: "",
    authToken: "",
    instanceName: "",
    defaultGroup: "",
    testMessage: "Teste de notificacao interna NAGY EVENTOS.",
  });
  const { data } = useConfiguracoes();
  const theme = useThemeStore((state) => state.theme);
  const setTheme = useThemeStore((state) => state.setTheme);
  const settings = data ?? {
    supabaseConfigured: false,
    storageMode: "Local demo",
    pwaEnabled: true,
    auditLogs: [],
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Configuracoes"
        description="Centro administrativo para empresa, sistema, notificacoes, acessos, backup e logs."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Supabase"
          value={settings.supabaseConfigured ? "Conectado" : "Pendente"}
          helper="Auth, PostgreSQL, Storage e Realtime"
          icon={Database}
          tone={settings.supabaseConfigured ? "green" : "orange"}
        />
        <MetricCard
          title="Persistencia"
          value={settings.storageMode}
          helper="Camada desacoplada por services"
          icon={HardDrive}
          tone="neutral"
        />
        <MetricCard
          title="PWA"
          value={settings.pwaEnabled ? "Ativo" : "Inativo"}
          helper="Instalavel em Android e iOS"
          icon={Smartphone}
          tone="green"
        />
        <MetricCard
          title="RLS"
          value="Modelado"
          helper="Policies disponiveis nas migrations"
          icon={ShieldCheck}
          tone="orange"
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-[260px_1fr]">
        <Card className="h-fit p-2">
          <nav className="space-y-1">
            {sections.map((section) => (
              <button
                key={section.id}
                type="button"
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground",
                  activeSection === section.id && "bg-primary/10 text-primary",
                )}
                onClick={() => setActiveSection(section.id)}
              >
                <section.icon className="h-4 w-4" aria-hidden />
                {section.label}
              </button>
            ))}
          </nav>
        </Card>

        <div className="space-y-5">
          {activeSection === "empresa" ? (
            <SettingsSection title="Empresa">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Nome da empresa</Label>
                  <Input id="companyName" defaultValue="NAGY EVENTOS" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyDocument">CNPJ</Label>
                  <Input
                    id="companyDocument"
                    placeholder="00.000.000/0000-00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyPhone">Telefone</Label>
                  <Input id="companyPhone" placeholder="(65) 0000-0000" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyWhatsapp">WhatsApp</Label>
                  <Input id="companyWhatsapp" placeholder="(65) 90000-0000" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="companyAddress">Endereco</Label>
                  <Textarea
                    id="companyAddress"
                    placeholder="Rua, numero, bairro, cidade e UF"
                  />
                </div>
              </div>
              <div className="mt-5 flex justify-end">
                <Button type="button">
                  <Save className="h-4 w-4" aria-hidden />
                  Salvar empresa
                </Button>
              </div>
            </SettingsSection>
          ) : null}

          {activeSection === "sistema" ? (
            <SettingsSection title="Sistema">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="theme">Tema</Label>
                  <Select
                    id="theme"
                    value={theme}
                    onChange={(event) =>
                      setTheme(event.target.value as "light" | "dark")
                    }
                  >
                    <option value="dark">Escuro</option>
                    <option value="light">Claro</option>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="language">Idioma</Label>
                  <Select id="language" defaultValue="pt-BR">
                    <option value="pt-BR">Portugues Brasil</option>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select id="timezone" defaultValue="America/Cuiaba">
                    <option value="America/Cuiaba">America/Cuiaba</option>
                    <option value="America/Sao_Paulo">America/Sao Paulo</option>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateFormat">Formato de datas</Label>
                  <Select id="dateFormat" defaultValue="dd/MM/yyyy">
                    <option value="dd/MM/yyyy">dd/MM/yyyy</option>
                    <option value="yyyy-MM-dd">yyyy-MM-dd</option>
                  </Select>
                </div>
              </div>
            </SettingsSection>
          ) : null}

          {activeSection === "notificacoes" ? (
            <SettingsSection title="Notificacoes e Mudslide">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="mudslideUrl">URL do servidor Mudslide</Label>
                  <Input
                    id="mudslideUrl"
                    value={mudslideSettings.serverUrl}
                    placeholder="https://mudslide.exemplo.com"
                    onChange={(event) =>
                      setMudslideSettings((current) => ({
                        ...current,
                        serverUrl: event.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mudslideToken">Token de autenticacao</Label>
                  <Input
                    id="mudslideToken"
                    type="password"
                    value={mudslideSettings.authToken}
                    placeholder="Token seguro"
                    onChange={(event) =>
                      setMudslideSettings((current) => ({
                        ...current,
                        authToken: event.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mudslideInstance">Nome da instancia</Label>
                  <Input
                    id="mudslideInstance"
                    value={mudslideSettings.instanceName}
                    placeholder="nagy-eventos"
                    onChange={(event) =>
                      setMudslideSettings((current) => ({
                        ...current,
                        instanceName: event.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mudslideGroup">Grupo padrao</Label>
                  <Input
                    id="mudslideGroup"
                    value={mudslideSettings.defaultGroup}
                    placeholder="Operacao NAGY"
                    onChange={(event) =>
                      setMudslideSettings((current) => ({
                        ...current,
                        defaultGroup: event.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="testMessage">Mensagem de teste</Label>
                  <Textarea
                    id="testMessage"
                    value={mudslideSettings.testMessage}
                    onChange={(event) =>
                      setMudslideSettings((current) => ({
                        ...current,
                        testMessage: event.target.value,
                      }))
                    }
                  />
                </div>
              </div>
              <div className="mt-5 flex flex-col gap-3 rounded-lg border border-border bg-muted/25 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-md bg-primary/10 p-2 text-primary">
                    <MessageCircle className="h-5 w-5" aria-hidden />
                  </div>
                  <div>
                    <p className="font-semibold">Status da conexao</p>
                    <p className="text-sm text-muted-foreground">
                      {mudslideStatus}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      setMudslideStatus(
                        NotificationService.prepareMudslideConnectionTest(
                          mudslideSettings,
                        ).message,
                      )
                    }
                  >
                    Testar conexao
                  </Button>
                  <Button
                    type="button"
                    onClick={() =>
                      setMudslideStatus(
                        NotificationService.prepareMudslideMessageTest(
                          mudslideSettings,
                        ).message,
                      )
                    }
                  >
                    Enviar mensagem de teste
                  </Button>
                </div>
              </div>
            </SettingsSection>
          ) : null}

          {activeSection === "usuarios" ? (
            <div className="grid gap-5 lg:grid-cols-2">
              <SettingsSection title="Usuarios">
                <div className="flex items-start gap-3">
                  <Users className="mt-1 h-5 w-5 text-primary" aria-hidden />
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Acesse o cadastro de usuarios para criar perfis,
                      acompanhar ultimo acesso e status.
                    </p>
                    <Button asChild>
                      <Link to="/usuarios">Gerenciar usuarios</Link>
                    </Button>
                  </div>
                </div>
              </SettingsSection>
              <SettingsSection title="Grupos de acesso">
                <div className="flex items-start gap-3">
                  <KeyRound className="mt-1 h-5 w-5 text-primary" aria-hidden />
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Revise a matriz RBAC e os acessos por perfil operacional.
                    </p>
                    <Button asChild variant="outline">
                      <Link to="/permissoes">Abrir permissoes</Link>
                    </Button>
                  </div>
                </div>
              </SettingsSection>
            </div>
          ) : null}

          {activeSection === "backup" ? (
            <SettingsSection title="Backup">
              <div className="grid gap-4 md:grid-cols-3">
                {["Banco de dados", "Anexos", "Relatorios"].map((item) => (
                  <div
                    key={item}
                    className="rounded-lg border border-border bg-muted/25 p-4"
                  >
                    <CloudUpload
                      className="mb-3 h-5 w-5 text-primary"
                      aria-hidden
                    />
                    <p className="font-semibold">{item}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Estrutura preparada para automacao futura.
                    </p>
                  </div>
                ))}
              </div>
            </SettingsSection>
          ) : null}

          {activeSection === "logs" ? (
            <SettingsSection title="Logs do sistema">
              <DataTable
                rows={settings.auditLogs}
                columns={auditColumns}
                getRowId={(row) => row.id}
                emptyLabel="Nenhum log de auditoria encontrado."
                emptyDescription="As movimentacoes do sistema aparecerao aqui."
              />
            </SettingsSection>
          ) : null}
        </div>
      </div>
    </div>
  );
}
