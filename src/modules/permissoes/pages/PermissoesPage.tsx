import { Check, LockKeyhole } from "lucide-react";

import { PageHeader } from "@/components/common/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { permissions, rolePermissions } from "@/lib/rbac/permissions";
import type { RoleName } from "@/types/domain";

const roles = Object.keys(rolePermissions) as RoleName[];

export function PermissoesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Permissoes"
        description="Estrutura RBAC preparada para configuracao fina de acessos por perfil."
      />

      <Card>
        <CardHeader>
          <CardTitle>Matriz de acesso</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-muted-foreground">
                  <th className="px-3 py-3">Permissao</th>
                  {roles.map((role) => (
                    <th key={role} className="px-3 py-3 text-center">
                      {role}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {permissions.map((permission) => (
                  <tr
                    key={permission.key}
                    className="border-b border-border last:border-b-0"
                  >
                    <td className="px-3 py-3">
                      <div className="space-y-1">
                        <p className="font-medium">{permission.label}</p>
                        <Badge variant="outline">{permission.module}</Badge>
                      </div>
                    </td>
                    {roles.map((role) => {
                      const allowed = rolePermissions[role].includes(
                        permission.key,
                      );
                      return (
                        <td key={role} className="px-3 py-3 text-center">
                          {allowed ? (
                            <span className="inline-flex rounded-md bg-emerald-500/10 p-1 text-emerald-500">
                              <Check className="h-4 w-4" aria-hidden />
                            </span>
                          ) : (
                            <span className="inline-flex rounded-md bg-muted p-1 text-muted-foreground">
                              <LockKeyhole className="h-4 w-4" aria-hidden />
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
