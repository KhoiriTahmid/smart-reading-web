import { Loader2, MailCheck, RefreshCw, UserPlus } from "lucide-react";
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
  OrDivider,
} from "~/features/auth/components/auth-form-parts";
import { GoogleButton } from "~/features/auth/components/google-button";
import { PasswordInput } from "~/features/auth/components/password-input";
import {
  registerByEmail,
  resendVerificationEmail,
} from "~/services/auth.service";

export function meta() {
  return [{ title: "Create account · Smart Reading" }];
}

export default function RegisterRoute() {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);
  const [resending, setResending] = useState(false);
  const [resentMessage, setResentMessage] = useState<string | null>(null);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError(t("auth.errors.nameRequired"));
      return;
    }

    if (!email.trim()) {
      setError(t("auth.errors.emailRequired"));
      return;
    }

    if (password.length < 8) {
      setError(t("auth.errors.passwordLength"));
      return;
    }

    if (password !== confirmPassword) {
      setError(t("auth.errors.passwordMismatch"));
      return;
    }

    setBusy(true);

    try {
      const cleanEmail = email.trim();
      await registerByEmail({
        name: name.trim(),
        email: cleanEmail,
        password,
      });
      setRegisteredEmail(cleanEmail);
    } catch (err) {
      setError(
        getAuthErrorMessage(err, {
          fallback: t("auth.errors.generic"),
          byStatus: { 409: t("auth.errors.emailTaken") },
        }),
      );
    } finally {
      setBusy(false);
    }
  };

  const handleResend = async () => {
    if (!registeredEmail) return;
    setError(null);
    setResentMessage(null);
    setResending(true);

    try {
      await resendVerificationEmail(registeredEmail);
      setResentMessage(t("auth.register.resentSuccess"));
    } catch (err) {
      setError(
        getAuthErrorMessage(err, {
          fallback: t("auth.errors.generic"),
        }),
      );
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthShell>
      <div className="border-line bg-card rounded-3xl border p-6 shadow-[0_24px_70px_-36px_rgba(15,23,42,0.35)] sm:p-8">
        {registeredEmail ? (
          <div className="flex flex-col items-center text-center">
            <div className="bg-accbg text-acc mb-4 flex size-14 items-center justify-center rounded-2xl">
              <MailCheck className="size-7" />
            </div>

            <h2 className="text-2xl font-bold tracking-tight">
              {t("auth.register.verifyTitle")}
            </h2>
            <p className="text-mute mt-2 text-sm leading-relaxed">
              {t("auth.register.verifyDescription", { email: registeredEmail })}
            </p>

            <div className="mt-5 flex w-full flex-col gap-3 text-left">
              {error && <FormError message={error} />}
              {resentMessage && <FormSuccess message={resentMessage} />}
            </div>

            <div className="border-line bg-soft/60 mt-5 flex w-full flex-col items-center gap-2.5 rounded-2xl border p-4">
              <p className="text-mute text-xs">
                {t("auth.register.didNotReceive")}
              </p>
              <Button
                type="button"
                variant="ghost"
                className="h-9 w-full text-xs font-semibold"
                onClick={handleResend}
                disabled={resending}
              >
                {resending ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <RefreshCw className="size-3.5" />
                )}
                {resending
                  ? t("auth.register.resending")
                  : t("auth.register.resendBtn")}
              </Button>
            </div>

            <p className="text-mute mt-6 text-center text-sm">
              <Link
                to="/login"
                className="text-acc font-semibold hover:underline"
              >
                {t("auth.register.signIn")}
              </Link>
            </p>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold tracking-tight">
              {t("auth.register.title")}
            </h2>
            <p className="text-mute mt-1.5 text-sm">
              {t("auth.register.subtitle")}
            </p>

            <div className="mt-6 flex flex-col gap-4">
              <GoogleButton label={t("auth.googleSignup")} />
              <OrDivider label={t("auth.or")} />
              {error && <FormError message={error} />}

              <form onSubmit={submit} className="flex flex-col gap-4">
                <Field label={t("auth.name")}>
                  <Input
                    type="text"
                    name="name"
                    autoComplete="name"
                    placeholder={t("auth.namePlaceholder")}
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    required
                    maxLength={100}
                    autoFocus
                    disabled={busy}
                  />
                </Field>

                <Field label={t("auth.email")}>
                  <Input
                    type="email"
                    name="email"
                    autoComplete="email"
                    placeholder={t("auth.emailPlaceholder")}
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                    disabled={busy}
                  />
                </Field>

                <Field label={t("auth.password")}>
                  <PasswordInput
                    name="password"
                    autoComplete="new-password"
                    placeholder={t("auth.passwordPlaceholder")}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                    minLength={8}
                    maxLength={128}
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
                    <UserPlus className="size-4" />
                  )}
                  {busy
                    ? t("auth.register.submitting")
                    : t("auth.register.submit")}
                </Button>
              </form>
            </div>

            <p className="text-mute mt-6 text-center text-sm">
              {t("auth.register.haveAccount")}{" "}
              <Link
                to="/login"
                className="text-acc font-semibold hover:underline"
              >
                {t("auth.register.signIn")}
              </Link>
            </p>
          </>
        )}
      </div>
    </AuthShell>
  );
}

