export type ChatMessage = { role: string; content: string };

export function unwrapCompletionPayload(data: unknown): Record<string, unknown> {
  if (!data || typeof data !== "object") return {};
  const b = data as Record<string, unknown>;
  if (Array.isArray(b.choices) && (b.choices as unknown[]).length > 0) return b;
  for (const key of ["data", "result", "output", "response"]) {
    const nest = b[key];
    if (
      nest &&
      typeof nest === "object" &&
      Array.isArray((nest as Record<string, unknown>).choices) &&
      ((nest as Record<string, unknown>).choices as unknown[]).length > 0
    ) {
      return { ...b, choices: (nest as Record<string, unknown>).choices };
    }
  }
  return b;
}

export function assistantTextFromPayload(data: unknown): string {
  const d = unwrapCompletionPayload(data);
  const choices = d.choices as Array<Record<string, unknown>> | undefined;
  const choice = choices?.[0];
  if (!choice) {
    if (typeof d.result === "string") return d.result;
    return "";
  }
  const msg = (choice.message ?? choice.delta) as Record<string, unknown> | undefined;
  if (!msg) return typeof d.result === "string" ? d.result : "";
  let raw = msg.content;
  if (raw == null && msg.reasoning_content != null) raw = msg.reasoning_content;
  if (typeof raw === "string") return raw;
  if (Array.isArray(raw)) {
    return raw
      .map((p: unknown) =>
        typeof p === "string" ? p : (p as { text?: string; content?: string })?.text ?? (p as { content?: string })?.content ?? ""
      )
      .join("");
  }
  if (typeof d.result === "string") return d.result;
  return "";
}
