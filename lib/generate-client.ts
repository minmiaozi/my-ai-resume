import { assistantTextFromPayload } from "@/lib/completion";

async function parseApiJson(res: Response): Promise<Record<string, unknown>> {
  try {
    return (await res.json()) as Record<string, unknown>;
  } catch {
    throw new Error(`Server returned non-JSON (HTTP ${res.status})`);
  }
}

function errorFromPayload(data: Record<string, unknown>): string | null {
  if (data.code != null && data.code !== 0 && typeof data.message === "string") {
    return data.message;
  }
  if (typeof data.error === "string") return data.error;
  return null;
}

export async function callGenerate(messages: { role: string; content: string }[]) {
  const res = await fetch("/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
  });
  const data = await parseApiJson(res);
  const err = errorFromPayload(data);
  if (err) throw new Error(err);
  if (!res.ok) throw new Error((data.error as string) || `Request failed (${res.status})`);
  const text =
    (typeof data.result === "string" && data.result) || assistantTextFromPayload(data);
  if (!text) throw new Error("Model returned empty content");
  return text;
}

export function fieldGroupClass(value: string, focused: boolean) {
  const parts = ["field-group"];
  if (focused) parts.push("focused");
  if (value.trim()) parts.push("filled");
  return parts.join(" ");
}
