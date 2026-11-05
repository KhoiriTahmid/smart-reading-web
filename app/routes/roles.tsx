import { useRevalidator } from "react-router";
import { RolesMatrix } from "~/features/roles/components/roles-matrix";
import { CustomApiError } from "~/lib/api-client";
import {
  getRoles,
  updatePermission,
  updateRolePermissions,
} from "~/services/roles.service";
import type { PermissionKey } from "~/types/domain";
import type { Route } from "./+types/roles";

export function meta() {
  return [{ title: "Roles · Smart Reading" }];
}

export async function clientLoader() {
  try {
    const roles = await getRoles();
    return { roles };
  } catch (error) {
    if (
      error instanceof CustomApiError &&
      (error.status === 403 || error.status === 404)
    ) {
      return { roles: [] };
    }
    console.error("Failed to load roles:", error);
    throw error;
  }
}

export default function RolesRoute({ loaderData }: Route.ComponentProps) {
  const { revalidate } = useRevalidator();

  const handleToggle = async (
    roleId: string,
    permission: PermissionKey,
    enabled: boolean,
    currentPermissions?: Record<PermissionKey, boolean>,
  ) => {
    try {
      await updatePermission(roleId, permission, enabled, currentPermissions);
      await revalidate();
    } catch (error) {
      console.error("Failed to update permission:", error);
      throw error;
    }
  };

  const handleBatchToggle = async (
    roleId: string,
    patch: Partial<Record<PermissionKey, boolean>>,
    currentPermissions?: Record<PermissionKey, boolean>,
  ) => {
    try {
      await updateRolePermissions(roleId, patch, currentPermissions);
      await revalidate();
    } catch (error) {
      console.error("Failed to batch update permissions:", error);
      throw error;
    }
  };

  return (
    <RolesMatrix
      roles={loaderData.roles}
      onToggle={(roleId, perm, enabled, current) =>
        void handleToggle(roleId, perm, enabled, current)
      }
      onBatchToggle={(roleId, patch, current) =>
        void handleBatchToggle(roleId, patch, current)
      }
    />
  );
}
