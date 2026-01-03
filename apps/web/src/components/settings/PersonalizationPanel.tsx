"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button, cn, GlassCard, Input, Label } from "@morina/ui";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";

import { useThemeEngine } from "@/hooks/use-theme-engine";
import { normalizeCompanySettings } from "@/lib/company-settings";
import {
  type CompanySettingsPayload,
  companySettingsSchema,
  DEFAULT_COMPANY_SETTINGS,
} from "@/schemas/company-settings";
import { CinematicPresetPanel } from "./CinematicPresetPanel";

type FormValues = CompanySettingsPayload;

const THEME_OPTIONS = [
  { label: "Claro", value: "light" },
  { label: "Escuro", value: "dark" },
  { label: "Automático", value: "auto" },
] as const;

export function PersonalizationPanel() {
  const { companyTheme, updateCompanyTheme, persistCompanyTheme, loading, saving } =
    useThemeEngine();

  const [feedback, setFeedback] = useState<{ kind: "success" | "error"; message: string } | null>(
    null,
  );

  const normalizedTheme = useMemo(() => normalizeCompanySettings(companyTheme), [companyTheme]);

  const form = useForm<FormValues>({
    resolver: zodResolver(companySettingsSchema),
    mode: "onChange",
    defaultValues: {
      ...DEFAULT_COMPANY_SETTINGS,
      ...normalizedTheme,
    },
  });

  const watchedValues = useWatch<FormValues>({
    control: form.control,
  });

  useEffect(() => {
    if (loading) return;

    form.reset({
      logoUrl: normalizedTheme.logoUrl ?? "",
      primaryColor: normalizedTheme.primaryColor ?? DEFAULT_COMPANY_SETTINGS.primaryColor,
      secondaryColor: normalizedTheme.secondaryColor ?? DEFAULT_COMPANY_SETTINGS.secondaryColor,
      themeMode: normalizedTheme.themeMode ?? DEFAULT_COMPANY_SETTINGS.themeMode,
      videoLink: normalizedTheme.videoLink ?? "",
    });
  }, [form, loading, normalizedTheme]);

  useEffect(() => {
    if (loading || !watchedValues) return;
    updateCompanyTheme(watchedValues);
  }, [loading, updateCompanyTheme, watchedValues]);

  const handleLogoUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result;
        if (typeof result === "string") {
          form.setValue("logoUrl", result, { shouldDirty: true, shouldTouch: true });
          updateCompanyTheme({ logoUrl: result });
        }
      };

      reader.readAsDataURL(file);
    },
    [form, updateCompanyTheme],
  );

  const handleLogoRemove = useCallback(() => {
    form.setValue("logoUrl", "", { shouldDirty: true, shouldTouch: true });
    updateCompanyTheme({ logoUrl: undefined });
  }, [form, updateCompanyTheme]);

  async function onSubmit(values: FormValues) {
    setFeedback(null);
    try {
      const saved = await persistCompanyTheme(values);
      form.reset({
        logoUrl: saved.logoUrl ?? "",
        primaryColor: saved.primaryColor ?? DEFAULT_COMPANY_SETTINGS.primaryColor,
        secondaryColor: saved.secondaryColor ?? DEFAULT_COMPANY_SETTINGS.secondaryColor,
        themeMode: saved.themeMode ?? DEFAULT_COMPANY_SETTINGS.themeMode,
        videoLink: saved.videoLink ?? "",
      });

      setFeedback({
        kind: "success",
        message: "Personalização salva. O tema foi sincronizado com a empresa.",
      });
    } catch (error) {
      console.error(error);
      setFeedback({
        kind: "error",
        message: "Não foi possível salvar as preferências agora. Tente novamente em instantes.",
      });
    }
  }

  return (
    <section className="flex flex-col gap-[var(--space-6)]">
      <GlassCard glow className="bg-[color-mix(in oklab,var(--surface-color) 94%,transparent)]/70">
        <header className="flex flex-col gap-[var(--space-2)]">
          <span className="text-[var(--fs-xs)] uppercase tracking-[var(--tracking-wide)] text-[color-mix(in oklab,var(--muted-soft) 70%,var(--fg) 30%)]">
            Identidade Visual
          </span>
          <h2 className="text-[var(--fs-xl)] font-semibold leading-[var(--lh-tight)] text-[var(--fg)]">
            Personalização AlphaSysCore
          </h2>
          <p className="text-[var(--fs-sm)] leading-[var(--lh-base)] text-[color-mix(in oklab,var(--muted-soft) 72%,var(--fg) 28%)]">
            Ajuste logo, cores, vídeo institucional e modo padrão. Tudo é aplicado em tempo real na
            camada visual do cockpit.
          </p>
        </header>

        <div className="mt-[var(--space-6)] grid gap-[var(--space-6)] lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)]">
          <div className="flex flex-col gap-[var(--space-4)]">
            <div className="flex flex-col gap-[var(--space-3)]">
              <Label htmlFor="logo-upload">Identidade (logo)</Label>
              <div className="flex flex-col items-center gap-[var(--space-3)] rounded-[var(--r-lg)] border border-dashed border-[color-mix(in oklab,var(--border-color) 75%,transparent)] bg-[color-mix(in oklab,var(--surface-color) 92%,transparent)]/65 p-[var(--space-5)] text-center">
                {watchedValues?.logoUrl ? (
                  <div className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-[var(--r-md)] bg-[color-mix(in oklab,var(--surface-color) 88%,transparent)] shadow-[var(--shadow-soft)]">
                    <Image
                      src={watchedValues.logoUrl || ""}
                      alt="Logo da empresa"
                      fill
                      className="object-contain"
                    />
                  </div>
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-[var(--r-md)] border border-[color-mix(in oklab,var(--border-color) 80%,transparent)] bg-[color-mix(in oklab,var(--surface-color) 90%,transparent)] text-[var(--fs-xs)] text-[color-mix(in oklab,var(--muted-soft) 70%,var(--fg) 30%)]">
                    Sem logo
                  </div>
                )}
                <Input
                  id="logo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="cursor-pointer border-none bg-transparent text-[var(--fs-xs)] text-[color-mix(in oklab,var(--muted-soft) 70%,var(--fg) 30%)] file:mr-3 file:cursor-pointer file:rounded-[var(--r-md)] file:border-none file:bg-[color-mix(in oklab,var(--primary-color) 85%,var(--fg) 15%)] file:px-[var(--space-4)] file:py-[var(--space-2)] file:text-[var(--fs-xs)] file:font-medium file:uppercase file:tracking-[var(--tracking-wide)] file:text-[var(--primary-contrast)] hover:file:opacity-90"
                />
                {watchedValues?.logoUrl && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleLogoRemove}
                    className="text-[var(--fs-xs)] text-[color-mix(in oklab,var(--muted-soft) 65%,var(--fg) 35%)] hover:text-[color-mix(in oklab,var(--primary-color) 70%,var(--fg) 30%)]"
                  >
                    Remover logo
                  </Button>
                )}
              </div>
            </div>

            <div className="grid gap-[var(--space-3)]">
              <Label htmlFor="themeMode">Modo do tema</Label>
              <select
                id="themeMode"
                aria-describedby="themeMode-description"
                className="rounded-[var(--r-md)] border border-[color-mix(in oklab,var(--border-color) 82%,transparent)] bg-[color-mix(in oklab,var(--surface-color) 92%,transparent)] p-[var(--space-3)] text-[var(--fs-sm)] text-[var(--fg)] outline-none transition focus:border-[color-mix(in oklab,var(--primary-color) 50%,transparent)] focus:shadow-[0_0_0_2px_rgba(40,85,255,0.25)]"
                {...form.register("themeMode")}
              >
                {THEME_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <span
                id="themeMode-description"
                className="text-[var(--fs-xs)] text-[color-mix(in oklab,var(--muted-soft) 75%,var(--fg) 25%)]"
              >
                Escolha entre modo claro, escuro ou automático (baseado no sistema)
              </span>
            </div>
          </div>

          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-[var(--space-5)]"
            noValidate
          >
            <div className="grid gap-[var(--space-4)] sm:grid-cols-2">
              <div className="flex flex-col gap-[var(--space-2)]">
                <Label htmlFor="primaryColor">Cor primária</Label>
                <Input
                  id="primaryColor"
                  type="color"
                  {...form.register("primaryColor")}
                  className="h-12 w-full cursor-pointer"
                />
              </div>
              <div className="flex flex-col gap-[var(--space-2)]">
                <Label htmlFor="secondaryColor">Cor secundária</Label>
                <Input
                  id="secondaryColor"
                  type="color"
                  {...form.register("secondaryColor")}
                  className="h-12 w-full cursor-pointer"
                />
              </div>
            </div>

            <div className="flex flex-col gap-[var(--space-2)]">
              <Label htmlFor="videoLink">Vídeo institucional (Vimeo / YouTube)</Label>
              <Input
                id="videoLink"
                type="url"
                placeholder="https://player.vimeo.com/video/..."
                {...form.register("videoLink")}
              />
            </div>

            <div className="flex flex-col gap-[var(--space-2)]">
              <Label htmlFor="logoUrlManual">Logo (URL pública)</Label>
              <Input
                id="logoUrlManual"
                type="url"
                placeholder="https://cdn.morina.ai/logo.png"
                {...form.register("logoUrl")}
              />
            </div>

            {feedback && (
              <output
                aria-live="polite"
                aria-atomic="true"
                className={cn(
                  "rounded-[var(--r-md)] border px-[var(--space-4)] py-[var(--space-3)] text-[var(--fs-xs)]",
                  feedback.kind === "success"
                    ? "border-[color-mix(in oklab,var(--success-color) 45%,transparent)] bg-[color-mix(in oklab,var(--surface-color) 90%,var(--success-color) 12%)] text-[color-mix(in oklab,var(--success-color) 65%,var(--fg) 35%)]"
                    : "border-[color-mix(in oklab,var(--danger-color) 45%,transparent)] bg-[color-mix(in oklab,var(--surface-color) 90%,var(--danger-color) 12%)] text-[color-mix(in oklab,var(--danger-color) 70%,var(--fg) 30%)]",
                )}
              >
                {feedback.message}
              </output>
            )}

            <div className="flex flex-wrap items-center gap-[var(--space-3)]">
              <Button
                type="submit"
                disabled={saving}
                className="px-[var(--space-6)] py-[var(--space-3)] text-[var(--fs-sm)]"
              >
                {saving ? "Salvando..." : "Salvar personalização"}
              </Button>
              <span className="text-[var(--fs-xs)] text-[color-mix(in oklab,var(--muted-soft) 75%,var(--fg) 25%)]">
                Alterações são aplicadas em tempo real e persistidas ao salvar.
              </span>
            </div>
          </form>
        </div>
      </GlassCard>

      <CinematicPresetPanel />
    </section>
  );
}
