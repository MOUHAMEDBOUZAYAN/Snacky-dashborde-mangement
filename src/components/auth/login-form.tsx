"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { t, type Locale } from "@/lib/i18n";
import type { AuthUser } from "@/lib/types/auth";

function createLoginSchema(locale: Locale) {
  return z.object({
    email: z
      .string()
      .min(1, t("emailRequired", locale))
      .email(t("emailInvalid", locale)),
    password: z.string().min(1, t("passwordRequired", locale)),
  });
}

type LoginValues = z.infer<ReturnType<typeof createLoginSchema>>;

function safeNextPath(raw: string | null): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) {
    return "/dashboard";
  }
  return raw;
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { locale, setSession } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const schema = useMemo(() => createLoginSchema(locale), [locale]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setSubmitting(true);
    setFormError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(values),
      });

      const data = (await res.json()) as {
        code?: string;
        message?: string;
        messageFr?: string;
        user?: AuthUser;
        accessToken?: string;
      };

      if (!res.ok) {
        const isRestricted =
          data.code === "ACCESS_RESTRICTED" ||
          data.message?.toLowerCase().includes("admin") ||
          Boolean(data.messageFr?.includes("administrateurs"));

        setFormError(
          isRestricted
            ? t("accessRestricted", locale)
            : t("invalidCredentials", locale),
        );
        return;
      }

      if (!data.user || !data.accessToken) {
        setFormError(t("invalidCredentials", locale));
        return;
      }

      setSession(data.user, data.accessToken);
      router.replace(safeNextPath(searchParams.get("next")));
      router.refresh();
    } catch {
      setFormError(t("invalidCredentials", locale));
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <form onSubmit={onSubmit} className="flex w-full flex-col gap-5" noValidate>
      {formError ? (
        <div
          role="alert"
          className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
        >
          {formError}
        </div>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="email">{t("email", locale)}</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="admin@snacky.local"
          aria-invalid={!!errors.email}
          className="h-10"
          {...register("email", {
            onChange: () => setFormError(null),
          })}
        />
        {errors.email ? (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <Label htmlFor="password">{t("password", locale)}</Label>
          <span className="cursor-default text-xs text-muted-foreground/80">
            {t("forgotPassword", locale)}
          </span>
        </div>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            aria-invalid={!!errors.password}
            className="h-10 pr-10"
            {...register("password", {
              onChange: () => setFormError(null),
            })}
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground"
            aria-label={
              showPassword
                ? t("hidePassword", locale)
                : t("showPassword", locale)
            }
          >
            {showPassword ? (
              <EyeOff className="size-4" />
            ) : (
              <Eye className="size-4" />
            )}
          </button>
        </div>
        {errors.password ? (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        ) : null}
      </div>

      <Button
        type="submit"
        size="lg"
        disabled={submitting}
        className="h-10 w-full bg-brand-orange text-white hover:bg-brand-orange-600"
      >
        {submitting ? (
          <>
            <Loader2 className="size-4 animate-spin" data-icon="inline-start" />
            {t("signingIn", locale)}
          </>
        ) : (
          t("signIn", locale)
        )}
      </Button>
    </form>
  );
}
