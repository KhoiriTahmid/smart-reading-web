import { ArrowLeft, KeyRound, Loader2 } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { Link, useSearchParams } from "react-router";
import { Button } from "~/components/ui/button";
import { Field } from "~/components/ui/field";
import { getAuthErrorMessage } from "~/features/auth/auth-error";
import { AuthShell } from "~/features/auth/components/auth-shell";
import {
  FormError,
  FormSuccess,
} from "~/features/auth/components/auth-form-parts";
import { PasswordInput } from "~/features/auth/components/password-input";
import { resetPassword } from "~/services/auth.service";

export function meta() {
  return [{ title: "Reset password · Smart Reading" }];
}

export default function ResetPasswordRoute() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token")?.trim() || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!token) {
      setError(t("auth.resetPassword.missingToken"));
      return;
    }

    if (newPassword.length < 8) {
      setError(t("auth.errors.passwordLength"));
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(t("auth.errors.passwordMismatch"));
      return;
    }

    setBusy(true);

    try {
      await resetPassword({ token, newPassword });
      setSuccess(t("auth.resetPassword.success"));
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(
        getAuthErrorMessage(err, {
          fallback: t("auth.errors.generic"),
          byStatus: { 400: t("auth.errors.invalidOrExpiredToken") },
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
          {t("auth.resetPassword.title")}
        </h2>
        <p className="text-mute mt-1.5 text-sm">
          {t("auth.resetPassword.subtitle")}
        </p>

        <div className="mt-6 flex flex-col gap-4">
          {!token && <FormError message={t("auth.resetPassword.missingToken")} />}
          {error && <FormError message={error} />}
          {success && <FormSuccess message={success} />}

          {!token ? (
            <Link to="/forgot-password" className="w-full">
              <Button type="button" variant="primary" className="h-11 w-full">
                {t("auth.resetPassword.requestNewLink")}
              </Button>
            </Link>
          ) : success ? (
            <Link to="/login" className="w-full">
              <Button type="button" variant="primary" className="h-11 w-full">
                {t("auth.resetPassword.goToLogin")}
              </Button>
            </Link>
          ) : (
            <form onSubmit={submit} className="flex flex-col gap-4">
              <Field label={t("auth.resetPassword.newPassword")}>
                <PasswordInput
                  name="newPassword"
                  autoComplete="new-password"
                  placeholder={t("auth.resetPassword.newPasswordPlaceholder")}
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  required
                  minLength={8}
                  maxLength={128}
                  autoFocus
                  disabled={busy}
                />
              </Field>

              <Field label={t("auth.confirmPassword")}>
                <PasswordInput
                  name="confirmPassword"
                  autoComplete="new-password"
                  placeholder={t("auth.confirmPasswordPlaceholder")}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  required
                  minLength={8}
                  maxLength={128}
                  disabled={busy}
                />
              </Field>

              <p className="text-mute -mt-1 text-xs">
                {t("auth.register.passwordHint")}
              </p>

              <Button
                type="submit"
                variant="primary"
                className="mt-1 h-11 w-full"
                disabled={busy}
              >
                {busy ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <KeyRound className="size-4" />
                )}
                {busy
                  ? t("auth.resetPassword.submitting")
                  : t("auth.resetPassword.submit")}
              </Button>
            </form>
          )}
        </div>

        <p className="text-mute mt-6 text-center text-sm">
          <Link
            to="/login"
            className="text-acc inline-flex items-center gap-1.5 font-semibold hover:underline"
          >
            <ArrowLeft className="size-3.5" />
            {t("auth.forgotPassword.backToLogin")}
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}
