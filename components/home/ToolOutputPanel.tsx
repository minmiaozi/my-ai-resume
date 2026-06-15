"use client";

import { useTranslations } from "next-intl";
import { OutputPreview } from "@/components/home/OutputPreview";
import { RecentTasksPanel } from "@/components/home/RecentTasksPanel";
import type { OutputTab } from "@/hooks/useResumeGenerator";
import type { RecentTask } from "@/lib/recent-tasks";

type ToolOutputPanelProps = {
  activeTab: OutputTab;
  onTabChange: (tab: OutputTab) => void;
  previewText: string;
  hasOutput: boolean;
  generating: boolean;
  copyHint: OutputTab | null;
  recentTasks: RecentTask[];
  onCopy: () => void;
  onRegenerate: () => void;
  onLoadTask: (task: RecentTask) => void;
};

export function ToolOutputPanel({
  activeTab,
  onTabChange,
  previewText,
  hasOutput,
  generating,
  copyHint,
  recentTasks,
  onCopy,
  onRegenerate,
  onLoadTask,
}: ToolOutputPanelProps) {
  const t = useTranslations("homepage.output");

  return (
    <div className="tool-panel tool-panel-output">
      <OutputPreview
        activeTab={activeTab}
        onTabChange={onTabChange}
        previewText={previewText}
        hasOutput={hasOutput}
        generating={generating}
        copyHint={copyHint}
        onCopy={onCopy}
        onRegenerate={onRegenerate}
      />

      <RecentTasksPanel tasks={recentTasks} onSelect={onLoadTask} />

      <div className="side-block">
        <h3>{t("inspirationTitle")}</h3>
        <div className="inspiration-box" aria-label="Sample resume bullet inspiration">
          {t("inspirationText")}
        </div>
      </div>
    </div>
  );
}
