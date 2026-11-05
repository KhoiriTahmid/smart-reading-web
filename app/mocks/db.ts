import {
  PERMISSION_KEYS,
  type PermissionKey,
  type ReadingHistory,
  type Role,
  type User,
} from "~/types/domain";

const ago = (hours: number) =>
  new Date(Date.now() - hours * 3_600_000).toISOString();

const makePerms = (
  enabled: readonly PermissionKey[] = [],
): Record<PermissionKey, boolean> =>
  Object.fromEntries(
    PERMISSION_KEYS.map((k) => [k, enabled.includes(k)]),
  ) as Record<PermissionKey, boolean>;

export const db: { history: ReadingHistory[]; users: User[]; roles: Role[] } = {
  history: [
    {
      id: "h1",
      title: "Atomic Habits",
      reader: "Rina",
      pages: "12–38",
      durationMin: 48,
      readAt: ago(2),
      status: "done",
    },
    {
      id: "h2",
      title: "Pride and Prejudice",
      reader: "Dewi",
      pages: "1–14",
      durationMin: 31,
      readAt: ago(5),
      status: "done",
    },
    {
      id: "h3",
      title: "Biology Chapter 4.pdf",
      reader: "Budi",
      pages: "3–9",
      durationMin: 18,
      readAt: ago(26),
      status: "stopped",
    },
    {
      id: "h4",
      title: "The Little Prince",
      reader: "Rina",
      pages: "1–22",
      durationMin: 27,
      readAt: ago(30),
      status: "done",
    },
    {
      id: "h5",
      title: "Math Worksheet.jpg",
      reader: "Admin",
      pages: "1",
      durationMin: 2,
      readAt: ago(52),
      status: "failed",
    },
    {
      id: "h6",
      title: "Laskar Pelangi",
      reader: "Dewi",
      pages: "40–61",
      durationMin: 39,
      readAt: ago(75),
      status: "done",
    },
  ],
  roles: [
    {
      id: "admin",
      name: "Admin",
      locked: true,
      permissions: makePerms(PERMISSION_KEYS),
    },
    {
      id: "editor",
      name: "Editor",
      permissions: makePerms([
        "DASHBOARD",
        "DEVICE.LIST",
        "DEVICE.UPDATE",
        "READING_HISTORY.LIST",
        "READING_HISTORY.CREATE",
        "OCR.CREATE",
        "TTS.CREATE",
      ]),
    },
    {
      id: "reader",
      name: "Reader",
      permissions: makePerms([
        "DASHBOARD",
        "READING_HISTORY.LIST",
        "OCR.CREATE",
        "TTS.CREATE",
      ]),
    },
  ],
  users: [
    {
      id: "u1",
      name: "Rina Putri",
      email: "rina@mail.com",
      roleId: "admin",
      status: "active",
    },
    {
      id: "u2",
      name: "Dewi Lestari",
      email: "dewi@mail.com",
      roleId: "editor",
      status: "active",
    },
    {
      id: "u3",
      name: "Budi Santoso",
      email: "budi@mail.com",
      roleId: "reader",
      status: "active",
    },
    {
      id: "u4",
      name: "Sari Wulan",
      email: "sari@mail.com",
      roleId: "reader",
      status: "invited",
    },
  ],
};
