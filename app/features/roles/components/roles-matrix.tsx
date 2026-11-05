import { useMemo, type ReactNode } from "react";
import { Lock } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Card } from "~/components/ui/card";
import { Checkbox } from "~/components/ui/checkbox";
import { Select } from "~/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
} from "~/components/ui/table";
import {
  PERMISSION_SUB_KEYS,
  PERMISSION_SUB_KEYS_ACTION,
  type PermissionAction,
  type PermissionKey,
  type PermissionSubKey,
  type Role,
} from "~/types/domain";

interface RolesMatrixProps {
  roles: Role[];
  onToggle: (
    roleId: string,
    permission: PermissionKey,
    enabled: boolean,
    currentPermissions?: Record<PermissionKey, boolean>,
  ) => void;
  onBatchToggle?: (
    roleId: string,
    patch: Partial<Record<PermissionKey, boolean>>,
    currentPermissions?: Record<PermissionKey, boolean>,
  ) => void;
}

interface Column<T> {
  key: string;
  title: ReactNode;
  className?: string;
  render: (record: T) => ReactNode;
}

const ALL = "ALL";
const toKey = (sub: PermissionSubKey, act: PermissionAction) =>
  `${sub}.${act}` as PermissionKey;

export function RolesMatrix({
  roles,
  onToggle,
  onBatchToggle,
}: RolesMatrixProps) {
  const { t } = useTranslation();

  const getActive = (role: Role, sub: PermissionSubKey) =>
    PERMISSION_SUB_KEYS_ACTION.filter((act) => role.permissions?.[toKey(sub, act)]);

  const getValue = (
    role: Role,
    sub: PermissionSubKey,
    fullAccess: boolean,
  ): string[] => {
    const active = getActive(role, sub);
    return active.length === PERMISSION_SUB_KEYS_ACTION.length || fullAccess
      ? [ALL]
      : active;
  };

  const handleChange = (
    role: Role,
    sub: PermissionSubKey,
    next: string[],
  ) => {
    const prev = getValue(role, sub, false);
    const prevAll = prev.includes(ALL);
    const nextAll = next.includes(ALL);

    let target: PermissionAction[];
    if (nextAll && prevAll) return;
    if (nextAll) target = [...PERMISSION_SUB_KEYS_ACTION];
    else if (prevAll) target = [];
    else target = next as PermissionAction[];

    const current = getActive(role, sub);
    const patch: Partial<Record<PermissionKey, boolean>> = {};
    let hasChanges = false;

    PERMISSION_SUB_KEYS_ACTION.forEach((act) => {
      const was = current.includes(act);
      const now = target.includes(act);
      if (was !== now) {
        patch[toKey(sub, act)] = now;
        hasChanges = true;
      }
    });

    if (!hasChanges) return;

    if (onBatchToggle) {
      onBatchToggle(role.id, patch, role.permissions);
    } else {
      for (const [k, val] of Object.entries(patch)) {
        onToggle(role.id, k as PermissionKey, Boolean(val), role.permissions);
      }
    }
  };

  const columns = useMemo<Column<Role>[]>(
    () => [
      {
        key: "name",
        title: t("roles.role", { defaultValue: "Role" }),
        className: "font-semibold",
        render: (r) => (
          <span className="inline-flex items-center gap-1.5">
            {r.locked && <Lock className="size-3" />}
            {r.name}
          </span>
        ),
      },
      ...PERMISSION_SUB_KEYS.map(
        (sub): Column<Role> => ({
          key: sub,
          title: t(sub),
          className: "text-center",
          render: (r) => {
            const fullAccess = Boolean((r.permissions as any)?.["FULL_ACCESS"]);
            if (sub === "DASHBOARD") {
              return (
                <Checkbox
                  checked={!!r.permissions?.DASHBOARD || fullAccess}
                  disabled={r.locked || fullAccess}
                  onChange={(e) =>
                    onToggle(
                      r.id,
                      "DASHBOARD",
                      e.target.checked,
                      r.permissions,
                    )
                  }
                  aria-label={`${r.name}: ${t(sub)}`}
                />
              );
            }
            return (
              <Select
                mode="multiple"
                disabled={r.locked || fullAccess}
                value={getValue(r, sub, fullAccess)}
                onChange={(next: string[]) => handleChange(r, sub, next)}
                options={[
                  { value: ALL, label: "ALL" },
                  ...PERMISSION_SUB_KEYS_ACTION.map((act) => ({
                    value: act,
                    label: act,
                  })),
                ]}
                aria-label={`${r.name}: ${t(sub)}`}
              />
            );
          },
        }),
      ),
    ],
    [t, onToggle, onBatchToggle],
  );

  return (
    <Card className="p-2">
      <div className="overflow-x-auto">
        <Table>
          <TableHead>
            <TableRow>
              {columns.map((col) => (
                <TableHeadCell key={col.key} className={col.className}>
                  {col.title}
                </TableHeadCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {roles.map((r) => (
              <TableRow key={r.id}>
                {columns.map((col) => (
                  <TableCell key={col.key} className={col.className}>
                    {col.render(r)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <p className="text-mute flex items-center gap-1.5 px-4 py-3 text-xs">
        <Lock className="size-3" />
        {t("roles.locked")}
      </p>
    </Card>
  );
}
