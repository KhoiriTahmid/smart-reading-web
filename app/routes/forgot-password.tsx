import { ArrowLeft, Loader2, Mail } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { Button } from "~/components/ui/button";
import { Field, Input } from "~/components/ui/field";
import { getAuthErrorMessage } from "~/features/auth/auth-error";
import { AuthShell } from "~/features/auth/components/auth-shell";
import {
  FormError,
  FormSuccess,
} from "~/features/auth/components/auth-form-parts";
import { forgotPassword } from "~/services/auth.service";

export function meta() {
  return [{ title: "Forgot password · Smart Reading" }];
}

export default function ForgotPasswordRoute() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setError(t("auth.errors.emailRequired"));
      return;
    }

    setBusy(true);

    try {
      await forgotPassword(cleanEmail);
      setSuccess(t("auth.forgotPassword.success"));
    } catch (err) {
      setError(
        getAuthErrorMessage(err, {
          fallback: t("auth.errors.generic"),
          byStatus: { 404: t("auth.errors.accountNotFound") },
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
          {t("auth.forgotPassword.title")}
        </h2>
        <p className="text-mute mt-1.5 text-sm">
          {t("auth.forgotPassword.subtitle")}
        </p>

        <div className="mt-6 flex flex-col gap-4">
          {error && <FormError message={error} />}
          {success && <FormSuccess message={success} />}

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

            <Button
              type="submit"
              variant="primary"
              className="mt-1 h-11 w-full"
              disabled={busy}
            >
              {busy ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Mail className="size-4" />
              )}
              {busy
                ? t("auth.forgotPassword.submitting")
                : t("auth.forgotPassword.submit")}
            </Button>
          </form>
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
