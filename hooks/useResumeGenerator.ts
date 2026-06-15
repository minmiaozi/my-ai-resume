"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { canGenerate, incrementUsage } from "@/lib/billing";
import { callGenerate } from "@/lib/generate-client";
import {
  BULLET_SYSTEM_PROMPT,
  COVER_SYSTEM_PROMPT,
  languageInstruction,
} from "@/lib/prompt-language";
import { loadRecentTasks, saveRecentTask, type RecentTask } from "@/lib/recent-tasks";

export type OutputTab = "bullets" | "cover";

export type ResumeFormState = {
  workExperience: string;
  jobTitle: string;
  industry: string;
  jobDescription: string;
  companyName: string;
};

const initialForm: ResumeFormState = {
  workExperience: "",
  jobTitle: "",
  industry: "",
  jobDescription: "",
  companyName: "",
};

export function useResumeGenerator() {
  const t = useTranslations("homepage");
  const tOutput = useTranslations("homepage.output");
  const [form, setForm] = useState<ResumeFormState>(initialForm);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeTab, setActiveTab] = useState<OutputTab>("bullets");
  const [bulletText, setBulletText] = useState("");
  const [coverText, setCoverText] = useState("");
  const [hasOutput, setHasOutput] = useState(false);
  const [copyHint, setCopyHint] = useState<OutputTab | null>(null);
  const [recentTasks, setRecentTasks] = useState<RecentTask[]>([]);

  const refreshRecent = useCallback(() => {
    setRecentTasks(loadRecentTasks());
  }, []);

  useEffect(() => {
    refreshRecent();
    window.addEventListener("resumeaipro:recent-tasks", refreshRecent);
    return () => window.removeEventListener("resumeaipro:recent-tasks", refreshRecent);
  }, [refreshRecent]);

  const patchForm = useCallback((patch: Partial<ResumeFormState>) => {
    setForm((prev) => ({ ...prev, ...patch }));
  }, []);

  const generateAll = useCallback(
    async (regenerate = false) => {
      const content = form.workExperience.trim();
      if (!content) {
        alert("Please paste your work and experience details first.");
        return;
      }

      const limit = canGenerate();
      if (!limit.ok) {
        alert(`${limit.message}\n\nUpgrade at /pricing`);
        return;
      }

      const role =
        form.jobTitle.trim() ||
        (form.industry ? `${form.industry} Professional` : "Target Role");
      const company = form.companyName.trim() || "Target Company";
      const industryLine = form.industry ? `\nTarget industry: ${form.industry}` : "";

      setGenerating(true);
      setProgress(8);
      setHasOutput(true);
      setBulletText(t("tool.generating"));
      setCoverText(tOutput("coverWaiting"));

      const tick = window.setInterval(() => {
        setProgress((p) => (p >= 92 ? p : p + 4));
      }, 400);

      try {
        const bullets = await callGenerate([
          {
            role: "system",
            content: `${BULLET_SYSTEM_PROMPT}\n\n${languageInstruction(role, content)}`,
          },
          {
            role: "user",
            content: [
              `Target job title: ${role}${industryLine}`,
              `Work experience:\n${content}`,
              form.jobDescription.trim()
                ? `\nTarget job description:\n${form.jobDescription.trim()}`
                : "",
            ].join("\n"),
          },
        ]);
        setBulletText(bullets);
        setProgress(55);
        incrementUsage();

        const cover = await callGenerate([
          {
            role: "system",
            content: `${COVER_SYSTEM_PROMPT}\n\n${languageInstruction(company, role, content)}`,
          },
          {
            role: "user",
            content: `Company: ${company}\nPosition: ${role}\nCandidate background and fit:\n${content}${
              form.jobDescription.trim()
                ? `\n\nJob description context:\n${form.jobDescription.trim()}`
                : ""
            }`,
          },
        ]);
        setCoverText(cover);
        setProgress(100);
        incrementUsage();

        if (!regenerate) {
          saveRecentTask({ title: role, bullets, coverLetter: cover });
          refreshRecent();
        }

        setActiveTab("bullets");
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        setBulletText(`Error: ${msg}`);
        setCoverText("");
      } finally {
        window.clearInterval(tick);
        setGenerating(false);
        setTimeout(() => setProgress(0), 600);
      }
    },
    [form, refreshRecent, t, tOutput]
  );

  const loadTask = useCallback((task: RecentTask) => {
    setBulletText(task.bullets);
    setCoverText(task.coverLetter);
    setHasOutput(true);
    patchForm({ jobTitle: task.title });
    setActiveTab("bullets");
    document.getElementById("tool-console")?.scrollIntoView({ behavior: "smooth" });
  }, [patchForm]);

  const copyActive = useCallback(() => {
    const text = activeTab === "bullets" ? bulletText : coverText;
    void navigator.clipboard.writeText(text).then(() => {
      setCopyHint(activeTab);
      setTimeout(() => setCopyHint(null), 2000);
    });
  }, [activeTab, bulletText, coverText]);

  const previewText =
    activeTab === "bullets"
      ? bulletText || tOutput("emptyPreview")
      : coverText || tOutput("emptyPreview");

  return {
    form,
    patchForm,
    generating,
    progress,
    activeTab,
    setActiveTab,
    bulletText,
    coverText,
    hasOutput,
    copyHint,
    recentTasks,
    previewText,
    generateAll,
    loadTask,
    copyActive,
  };
}
