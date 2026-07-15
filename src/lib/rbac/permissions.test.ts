import { describe, expect, it } from "vitest";

import { permissions, rolePermissions } from "./permissions";

describe("role permissions", () => {
  it("grants every registered permission to administrators", () => {
    expect(rolePermissions.Administrador).toEqual(
      permissions.map((permission) => permission.key),
    );
  });

  it("keeps permission keys unique", () => {
    const keys = permissions.map((permission) => permission.key);

    expect(new Set(keys).size).toBe(keys.length);
  });

  it("does not grant permission management outside administrators", () => {
    for (const [role, assignedPermissions] of Object.entries(rolePermissions)) {
      if (role !== "Administrador") {
        expect(assignedPermissions).not.toContain("permissions.manage");
      }
    }
  });
});
