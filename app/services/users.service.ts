// app/services/users.service.ts
import { apiFetch } from "~/lib/api-client";
import { delay, USE_MOCK } from "~/lib/env";
import { db } from "~/mocks/db";
import type { NewUser, User } from "~/types/domain";
import { PATHS } from "./paths";
import type { Pagiantion } from "./roles.service";

interface RawUser {
  id?: string;
  userId?: string;
  name: string;
  email: string;
  roleId?: string;
  role?: {
    roleId: string;
    name: string;
  };
  status?: "active" | "invited" | "inactive";
  deletedAt?: string | null;
}

interface UsersResponse extends Pagiantion<RawUser[]> {}

const json = (method: string, body: unknown): RequestInit => ({
  method,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

function toUser(raw: RawUser): User {
  return {
    id: raw.userId ?? raw.id ?? "",
    name: raw.name,
    email: raw.email,
    roleId: raw.roleId ?? raw.role?.roleId ?? "",
    status: raw.status ?? (raw.deletedAt ? "inactive" : "active"),
  };
}

export async function getUsers(): Promise<User[]> {
  if (USE_MOCK) {
    await delay();
    return structuredClone(db.users);
  }
  const response = await apiFetch<UsersResponse>(`${PATHS.users}?limit=100`);
  const items = Array.isArray(response) ? response : (response?.results ?? []);
  return items.map(toUser);
}

export async function createUser(input: NewUser): Promise<User> {
  if (USE_MOCK) {
    await delay();
    const user: User = {
      id: `u${Date.now()}`,
      status: "active",
      name: input.name,
      email: input.email,
      roleId: input.roleId,
    };
    db.users.push(user);
    return user;
  }
  const created = await apiFetch<RawUser>(PATHS.users, json("POST", input));
  return toUser({ ...input, ...created });
}

export async function updateUserRole(
  id: string,
  roleId: string,
): Promise<void> {
  if (USE_MOCK) {
    await delay(200);
    const user = db.users.find((u) => u.id === id);
    if (user) user.roleId = roleId;
    return;
  }
  await apiFetch<unknown>(`${PATHS.users}/${id}`, json("PATCH", { roleId }));
}

export async function deleteUser(id: string): Promise<void> {
  if (USE_MOCK) {
    await delay(200);
    db.users = db.users.filter((u) => u.id !== id);
    return;
  }
  await apiFetch<unknown>(`${PATHS.users}/${id}`, { method: "DELETE" });
}
