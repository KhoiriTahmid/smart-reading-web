import { useEffect, useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "~/components/ui/button";
import { Card, CardHeader } from "~/components/ui/card";
import { Field, Input, Select } from "~/components/ui/field";
import type { NewUser, Role } from "~/types/domain";

export function UserForm({
  roles,
  onCreate,
}: {
  roles: Role[];
  onCreate: (u: NewUser) => Promise<void>;
}) {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [roleId, setRoleId] = useState(roles.at(-1)?.id ?? "");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!roleId && roles.length > 0) {
      setRoleId(roles.at(-1)?.id ?? roles[0].id);
    }
  }, [roles, roleId]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || password.length < 8 || !roleId) return;
    setBusy(true);
    try {
      await onCreate({
        name: name.trim(),
        email: email.trim(),
        password,
        roleId,
      });
      setName("");
      setEmail("");
      setPassword("");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card>
      <CardHeader title={t("users.add")} />
      <form
        onSubmit={submit}
        className="grid items-end gap-3 md:grid-cols-[1fr_1fr_1fr_160px_auto]"
      >
        <Field label={t("users.name")}>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("users.namePh")}
            required
          />
        </Field>
        <Field label={t("users.email")}>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("users.emailPh")}
            required
          />
        </Field>
        <Field label={t("users.password", { defaultValue: "Password" })}>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t("users.passwordPh", {
              defaultValue: "Min. 8 characters",
            })}
            minLength={8}
            maxLength={128}
            required
          />
        </Field>
        <Field label={t("users.role")}>
          <Select value={roleId} onChange={(e) => setRoleId(e.target.value)}>
            {roles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </Select>
        </Field>
        <Button type="submit" variant="primary" disabled={busy}>
          {t("users.addBtn")}
        </Button>
      </form>
    </Card>
  );
}
