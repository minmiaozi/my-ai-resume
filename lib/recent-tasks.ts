export type RecentTask = {
  id: string;
  title: string;
  createdAt: string;
  bullets: string;
  coverLetter: string;
};

const STORAGE_KEY = "resumeaipro:recent-tasks";
const MAX_TASKS = 8;

export function loadRecentTasks(): RecentTask[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as RecentTask[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveRecentTask(task: Omit<RecentTask, "id" | "createdAt">) {
  if (typeof window === "undefined") return;
  const entry: RecentTask = {
    ...task,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  const next = [entry, ...loadRecentTasks()].slice(0, MAX_TASKS);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent("resumeaipro:recent-tasks"));
  return entry;
}
