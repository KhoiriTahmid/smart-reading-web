import { useTranslation } from "react-i18next";
import { Badge } from "~/components/ui/badge";
import { Card } from "~/components/ui/card";
import { ConfirmButton } from "~/components/ui/confirm-button";
import { Select } from "~/components/ui/field";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
} from "~/components/ui/table";
import type { Role, User } from "~/types/domain";

const initials = (name: string) =>
  name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

interface UsersTableProps {
  users: User[];
  roles: Role[];
  onChangeRole: (id: string, roleId: string) => void;
  onRemove: (id: string) => void;
}

export function UsersTable({
  users,
  roles,
  onChangeRole,
  onRemove,
}: UsersTableProps) {
  const { t } = useTranslation();

  return (
    <Card className="p-2">
      <Table>
        <TableHead>
          <TableRow>
            <TableHeadCell>{t("users.cols.user")}</TableHeadCell>
            <TableHeadCell>{t("users.cols.role")}</TableHeadCell>
            <TableHeadCell>{t("users.cols.status")}</TableHeadCell>
            <TableHeadCell />
          </TableRow>
        </TableHead>
        <TableBody>
          {users.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="text-mute py-10 text-center">
                {t("users.empty")}
              </TableCell>
            </TableRow>
          )}
          {users.map((u) => (
            <TableRow key={u.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="bg-infobg text-info grid size-9 shrink-0 place-items-center rounded-full text-xs font-bold">
                    {initials(u.name)}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{u.name}</p>
                    <p className="text-mute truncate text-xs">{u.email}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell className="w-44">
                <Select
                  value={u.roleId}
                  onChange={(e) => onChangeRole(u.id, e.target.value)}
                >
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </Select>
              </TableCell>
              <TableCell>
                <Badge tone={u.status === "active" ? "ok" : "warn"}>
                  {t(`users.status.${u.status}`)}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <ConfirmButton
                  size="sm"
                  variant="ghost"
                  label={t("users.remove")}
                  confirmLabel={t("users.confirm")}
                  onConfirm={() => onRemove(u.id)}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
