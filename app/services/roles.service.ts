// app/services/roles.service.ts
import { apiFetch } from "~/lib/api-client";
import { delay, USE_MOCK } from "~/lib/env";
import { db } from "~/mocks/db";
import type { PermissionKey, Role } from "~/types/domain";
import { PATHS } from "./paths";

export interface Pagiantion<T> {
  count: number;
  results: T;
  nextQuery?: string;
  prevQuery?: string;
}

interface RawRole {
  id?: string;
  roleId?: string;
  name: string;
  permissions: Record<PermissionKey, boolean>;
  locked?: boolean;
}

interface RolesResponse extends Pagiantion<RawRole[]> {}

function toRole(raw: RawRole): Role {
  const id = raw.roleId ?? raw.id ?? "";
  const fullAccess = Boolean((raw.permissions as Record<string, boolean>)?.FULL_ACCESS);
  return {
    id,
    name: raw.name,
    permissions: raw.permissions ?? ({} as Record<PermissionKey, boolean>),
    locked: Boolean(raw.locked || fullAccess),
  };
}

export async function getRoles(): Promise<Role[]> {
  if (USE_MOCK) {
    await delay();
    return structuredClone(db.roles);
  }
  const response = await apiFetch<RolesResponse>(`${PATHS.roles}?limit=100`);
  const items = Array.isArray(response) ? response : (response?.results ?? []);
  return items.map(toRole);
}

export async function updateRolePermissions(
  roleId: string,
  permissionsPatch: Partial<Record<PermissionKey, boolean>>,
  currentPermissions?: Record<PermissionKey, boolean>,
): Promise<void> {
  if (USE_MOCK) {
    await delay(150);
    const role = db.roles.find((r) => r.id === roleId);
    if (!role || role.locked) return;
    role.permissions = {
      ...role.permissions,
      ...permissionsPatch,
    } as Record<PermissionKey, boolean>;
    return;
  }

  let basePermissions = currentPermissions;
  if (!basePermissions) {
    const existing = await apiFetch<RawRole>(`${PATHS.roles}/${roleId}`);
    basePermissions = existing.permissions ?? ({} as Record<PermissionKey, boolean>);
  }

  const updatedPermissions = {
    ...basePermissions,
    ...permissionsPatch,
  };

  await apiFetch<unknown>(`${PATHS.roles}/${roleId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ permissions: updatedPermissions }),
  });
}

export async function updatePermission(
  roleId: string,
  permission: PermissionKey,
  enabled: boolean,
  currentPermissions?: Record<PermissionKey, boolean>,
): Promise<void> {
  await updateRolePermissions(
    roleId,
    { [permission]: enabled },
    currentPermissions,
  );
}
