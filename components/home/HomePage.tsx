"use client";

import { HomeNav } from "@/components/home/HomeNav";
import { LandingContent } from "@/components/home/LandingContent";
import { ToolConsole } from "@/components/home/ToolConsole";
import { useResumeGenerator } from "@/hooks/useResumeGenerator";
import { useSmoothAnchorScroll } from "@/hooks/useSmoothAnchorScroll";

export function HomePage() {
  const generator = useResumeGenerator();
  useSmoothAnchorScroll();

  return (
    <div className="home-page">
      <HomeNav />
      <ToolConsole
        form={generator.form}
        onPatch={generator.patchForm}
        generating={generator.generating}
        progress={generator.progress}
        activeTab={generator.activeTab}
        onTabChange={generator.setActiveTab}
        previewText={generator.previewText}
        hasOutput={generator.hasOutput}
        copyHint={generator.copyHint}
        recentTasks={generator.recentTasks}
        onGenerate={() => void generator.generateAll()}
        onRegenerate={() => void generator.generateAll(true)}
        onCopy={generator.copyActive}
        onLoadTask={generator.loadTask}
      />
      <LandingContent />
    </div>
  );
}
