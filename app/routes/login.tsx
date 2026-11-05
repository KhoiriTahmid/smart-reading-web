import { Loader2, LogIn } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router";
import { Button } from "~/components/ui/button";
import { Field, Input } from "~/components/ui/field";
import { getAuthErrorMessage } from "~/features/auth/auth-error";
import { AuthShell } from "~/features/auth/components/auth-shell";
import {
  FormError,
  OrDivider,
} from "~/features/auth/components/auth-form-parts";
import { GoogleButton } from "~/features/auth/components/google-button";
import { PasswordInput } from "~/features/auth/components/password-input";
import { loginByEmail } from "~/services/auth.service";

export function meta() {
  return [{ title: "Sign in · Smart Reading" }];
}

export default function LoginRoute() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setBusy(true);

    try {
      await loginByEmail({ email: email.trim(), password });
      navigate("/", { replace: true });
    } catch (err) {
      setError(
        getAuthErrorMessage(err, {
          fallback: t("auth.errors.generic"),
          byStatus: { 401: t("auth.errors.invalidCredentials") },
        }),
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell>
      <div className="border-line bg-card rounded-3xl border p-6 shadow-[0_24px_70px_-36px_rgba(15,23,42,0.35)] sm:p-8">
        <h2 className="text-2xl font-bold tracking-tight">
          {t("auth.login.title")}
        </h2>
        <p className="text-mute mt-1.5 text-sm">{t("auth.login.subtitle")}</p>

        <div className="mt-6 flex flex-col gap-4">
          <GoogleButton label={t("auth.googleContinue")} />
          <OrDivider label={t("auth.or")} />
          {error && <FormError message={error} />}

          <form onSubmit={submit} className="flex flex-col gap-4">
            <Field label={t("auth.email")}>
              <Input
                type="email"
                name="email"
                autoComplete="email"
                placeholder={t("auth.emailPlaceholder")}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                autoFocus
                disabled={busy}
              />
            </Field>

            <Field label={t("auth.password")}>
              <PasswordInput
                name="password"
                autoComplete="current-password"
                placeholder={t("auth.passwordPlaceholder")}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                disabled={busy}
              />
            </Field>

            <Button
              type="submit"
              variant="primary"
              className="mt-1 h-11 w-full"
              disabled={busy}
            >
              {busy ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <LogIn className="size-4" />
              )}
              {busy ? t("auth.login.submitting") : t("auth.login.submit")}
            </Button>
          </form>
        </div>

        <p className="text-mute mt-6 text-center text-sm">
          {t("auth.login.noAccount")}{" "}
          <Link
            to="/register"
            className="text-acc font-semibold hover:underline"
          >
            {t("auth.login.createAccount")}
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}
