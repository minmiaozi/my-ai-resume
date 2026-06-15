"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { IndustrySelector } from "@/components/home/IndustrySelector";
import { GenerationProgress } from "@/components/home/GenerationProgress";
import { PromptInput } from "@/components/home/PromptInput";
import { TextInput } from "@/components/home/TextInput";
import type { ResumeFormState } from "@/hooks/useResumeGenerator";

const INDUSTRY_KEYS = [
  "technology",
  "marketing",
  "finance",
  "healthcare",
  "operations",
  "general",
] as const;

type ToolInputPanelProps = {
  form: ResumeFormState;
  onPatch: (patch: Partial<ResumeFormState>) => void;
  generating: boolean;
  progress: number;
  onGenerate: () => void;
};

export function ToolInputPanel({
  form,
  onPatch,
  generating,
  progress,
  onGenerate,
}: ToolInputPanelProps) {
  const t = useTranslations("homepage");
  const [focusField, setFocusField] = useState<string | null>(null);

  const industries = INDUSTRY_KEYS.map((key) => ({
    key,
    label: t(`tool.industries.${key}`),
  }));

  return (
    <div className="tool-panel">
      <h1 className="tool-hero-title home-serif">{t("hero.title")}</h1>
      <p className="tool-hero-sub">{t("hero.subtitle")}</p>

      <div className="stats-row" aria-label="Platform statistics">
        <div className="stat-item">
          <div className="stat-value">{t("stats.jobSeekersValue")}</div>
          <div className="stat-label">{t("stats.jobSeekersLabel")}</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{t("stats.satisfactionValue")}</div>
          <div className="stat-label">{t("stats.satisfactionLabel")}</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{t("stats.generationTimeValue")}</div>
          <div className="stat-label">{t("stats.generationTimeLabel")}</div>
        </div>
      </div>

      <div className="tools-section-intro">
        <h2 className="home-serif tools-section-title">{t("toolsSection.title")}</h2>
        <p className="tool-hero-sub">{t("toolsSection.subtitle")}</p>
      </div>

      <PromptInput
        id="experience-input"
        label={t("tool.experienceLabel")}
        placeholder={t("tool.experiencePlaceholder")}
        value={form.workExperience}
        onChange={(workExperience) => onPatch({ workExperience })}
        focused={focusField === "experience"}
        onFocus={() => setFocusField("experience")}
        onBlur={() => setFocusField(null)}
      />

      <div className="section-divider">{t("tool.tailorHeading")}</div>

      <TextInput
        id="job-title-input"
        label={t("tool.jobTitleLabel")}
        placeholder={t("tool.jobTitlePlaceholder")}
        value={form.jobTitle}
        onChange={(jobTitle) => onPatch({ jobTitle })}
        focused={focusField === "jobTitle"}
        onFocus={() => setFocusField("jobTitle")}
        onBlur={() => setFocusField(null)}
      />

      <IndustrySelector
        label={t("tool.industryLabel")}
        options={industries}
        value={form.industry}
        onChange={(industry) => onPatch({ industry })}
      />

      <PromptInput
        id="job-description-input"
        label={t("tool.jobDescriptionLabel")}
        placeholder={t("tool.jobDescriptionPlaceholder")}
        value={form.jobDescription}
        rows={4}
        onChange={(jobDescription) => onPatch({ jobDescription })}
        focused={focusField === "jobDescription"}
        onFocus={() => setFocusField("jobDescription")}
        onBlur={() => setFocusField(null)}
      />

      <TextInput
        id="company-input"
        label={t("tool.companyLabel")}
        placeholder={t("tool.companyPlaceholder")}
        value={form.companyName}
        onChange={(companyName) => onPatch({ companyName })}
        focused={focusField === "company"}
        onFocus={() => setFocusField("company")}
        onBlur={() => setFocusField(null)}
      />

      <button
        type="button"
        className="primary-cta"
        disabled={generating}
        aria-busy={generating}
        onClick={onGenerate}
      >
        {generating ? t("tool.generating") : t("tool.ctaButton")}
      </button>

      <GenerationProgress
        progress={progress}
        hint={t("tool.progressHint")}
        active={generating || progress > 0}
      />
    </div>
  );
}
