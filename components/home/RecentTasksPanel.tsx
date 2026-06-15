"use client";

import { useTranslations } from "next-intl";
import type { RecentTask } from "@/lib/recent-tasks";

type RecentTasksPanelProps = {
  tasks: RecentTask[];
  onSelect: (task: RecentTask) => void;
};

export function RecentTasksPanel({ tasks, onSelect }: RecentTasksPanelProps) {
  const t = useTranslations("homepage.output");

  return (
    <div className="side-block" id="recent-tasks">
      <h3>{t("recentTitle")}</h3>
      {tasks.length === 0 ? (
        <p className="inspiration-box">{t("recentEmpty")}</p>
      ) : (
        <ul className="recent-list" aria-label="Recent generations">
          {tasks.map((task) => (
            <li key={task.id}>
              <button
                type="button"
                className="recent-item"
                aria-label={`Load generation for ${task.title}`}
                onClick={() => onSelect(task)}
              >
                <div className="recent-item-title">{task.title}</div>
                <div className="recent-item-meta">
                  {new Date(task.createdAt).toLocaleString()}
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
