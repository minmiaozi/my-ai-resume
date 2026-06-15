"use client";

import type { KeyboardEvent } from "react";
import { useTranslations } from "next-intl";
import type { OutputTab } from "@/hooks/useResumeGenerator";

type OutputPreviewProps = {
  activeTab: OutputTab;
  onTabChange: (tab: OutputTab) => void;
  previewText: string;
  hasOutput: boolean;
  generating: boolean;
  copyHint: OutputTab | null;
  onCopy: () => void;
  onRegenerate: () => void;
};

export function OutputPreview({
  activeTab,
  onTabChange,
  previewText,
  hasOutput,
  generating,
  copyHint,
  onCopy,
  onRegenerate,
}: OutputPreviewProps) {
  const t = useTranslations("homepage.output");

  const tabs: { id: OutputTab; label: string }[] = [
    { id: "bullets", label: t("bulletsTab") },
    { id: "cover", label: t("coverTab") },
  ];

  function onTabKeyDown(e: KeyboardEvent<HTMLButtonElement>, tab: OutputTab) {
    const idx = tabs.findIndex((item) => item.id === tab);
    if (e.key === "ArrowRight") {
      e.preventDefault();
      onTabChange(tabs[(idx + 1) % tabs.length].id);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      onTabChange(tabs[(idx - 1 + tabs.length) % tabs.length].id);
    }
  }

  const panelId = `output-panel-${activeTab}`;

  return (
    <>
      <div className="output-header">
        <h2 className="home-serif">{t("previewTitle")}</h2>
      </div>

      <div className="output-tabs" role="tablist" aria-label="Generated content tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            id={`tab-${tab.id}`}
            className={`output-tab${activeTab === tab.id ? " active" : ""}`}
            aria-selected={activeTab === tab.id}
            aria-controls={panelId}
            tabIndex={activeTab === tab.id ? 0 : -1}
            onClick={() => onTabChange(tab.id)}
            onKeyDown={(e) => onTabKeyDown(e, tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div
        id={panelId}
        role="tabpanel"
        aria-labelledby={`tab-${activeTab}`}
        className={`output-preview${!hasOutput ? " empty" : ""}`}
      >
        {previewText}
      </div>

      <div className="output-actions">
        <button
          type="button"
          className="output-btn primary"
          disabled={!hasOutput || generating}
          aria-label={`Copy ${activeTab === "bullets" ? "resume bullets" : "cover letter"}`}
          onClick={onCopy}
        >
          {copyHint === activeTab ? t("copied") : t("copy")}
        </button>
        <button
          type="button"
          className="output-btn"
          disabled={generating}
          onClick={onRegenerate}
        >
          {t("regenerate")}
        </button>
        <button type="button" className="output-btn" disabled aria-disabled="true">
          {t("exportPdf")}
        </button>
        <button type="button" className="output-btn" disabled aria-disabled="true">
          {t("exportWord")}
        </button>
      </div>
    </>
  );
}
