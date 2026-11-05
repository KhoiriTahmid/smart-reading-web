import { useRevalidator } from "react-router";
import { UserForm } from "~/features/users/components/user-form";
import { UsersTable } from "~/features/users/components/users-table";
import { CustomApiError } from "~/lib/api-client";
import { getRoles } from "~/services/roles.service";
import {
  createUser,
  deleteUser,
  getUsers,
  updateUserRole,
} from "~/services/users.service";
import type { NewUser } from "~/types/domain";
import type { Route } from "./+types/users";

export function meta() {
  return [{ title: "Users · Smart Reading" }];
}

export async function clientLoader() {
  try {
    const [users, roles] = await Promise.all([
      getUsers(),
      getRoles().catch(() => []),
    ]);
    return { users, roles };
  } catch (error) {
    if (
      error instanceof CustomApiError &&
      (error.status === 403 || error.status === 404)
    ) {
      return { users: [], roles: [] };
    }
    console.error("Failed to load users and roles:", error);
    throw error;
  }
}

export default function UsersRoute({ loaderData }: Route.ComponentProps) {
  const { users, roles } = loaderData;
  const { revalidate } = useRevalidator();

  const create = async (input: NewUser) => {
    try {
      await createUser(input);
      await revalidate();
    } catch (error) {
      console.error("Failed to create user:", error);
      throw error;
    }
  };
  const changeRole = async (id: string, roleId: string) => {
    try {
      await updateUserRole(id, roleId);
      await revalidate();
    } catch (error) {
      console.error("Failed to update user role:", error);
      throw error;
    }
  };
  const remove = async (id: string) => {
    try {
      await deleteUser(id);
      await revalidate();
    } catch (error) {
      console.error("Failed to delete user:", error);
      throw error;
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <UserForm roles={roles} onCreate={create} />
      <UsersTable
        users={users}
        roles={roles}
        onChangeRole={(id, roleId) => void changeRole(id, roleId)}
        onRemove={(id) => void remove(id)}
      />
    </div>
  );
}
