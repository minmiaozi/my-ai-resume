"use client";

import { ToolInputPanel } from "@/components/home/ToolInputPanel";
import { ToolOutputPanel } from "@/components/home/ToolOutputPanel";
import type { OutputTab, ResumeFormState } from "@/hooks/useResumeGenerator";
import type { RecentTask } from "@/lib/recent-tasks";

type ToolConsoleProps = {
  form: ResumeFormState;
  onPatch: (patch: Partial<ResumeFormState>) => void;
  generating: boolean;
  progress: number;
  activeTab: OutputTab;
  onTabChange: (tab: OutputTab) => void;
  previewText: string;
  hasOutput: boolean;
  copyHint: OutputTab | null;
  recentTasks: RecentTask[];
  onGenerate: () => void;
  onRegenerate: () => void;
  onCopy: () => void;
  onLoadTask: (task: RecentTask) => void;
};

export function ToolConsole(props: ToolConsoleProps) {
  const {
    form,
    onPatch,
    generating,
    progress,
    activeTab,
    onTabChange,
    previewText,
    hasOutput,
    copyHint,
    recentTasks,
    onGenerate,
    onRegenerate,
    onCopy,
    onLoadTask,
  } = props;

  return (
    <section className="tool-console" id="tool-console" aria-label="AI resume and cover letter generator">
      <div className="tool-console-grid">
        <ToolInputPanel
          form={form}
          onPatch={onPatch}
          generating={generating}
          progress={progress}
          onGenerate={onGenerate}
        />
        <ToolOutputPanel
          activeTab={activeTab}
          onTabChange={onTabChange}
          previewText={previewText}
          hasOutput={hasOutput}
          generating={generating}
          copyHint={copyHint}
          recentTasks={recentTasks}
          onCopy={onCopy}
          onRegenerate={onRegenerate}
          onLoadTask={onLoadTask}
        />
      </div>
    </section>
  );
}
