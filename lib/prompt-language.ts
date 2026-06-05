/** 根据用户输入拼接「用同语言回复」的系统提示 */
export function languageInstruction(...inputs: string[]): string {
  const sample = inputs.map((s) => s.trim()).filter(Boolean).join("\n");
  return `Language rule: Detect the primary language of the user's input below and write your ENTIRE response in that same language only.
- English input → English output
- Chinese input → Simplified Chinese output
- German input → German output
- French input → French output
- Any other language → match that language
Do not switch languages. Do not add translations or bilingual explanations unless the user explicitly asks.

User input:
---
${sample}
---`;
}

export const BULLET_SYSTEM_PROMPT =
  "You are a professional resume writer. Transform the candidate's experience into polished, concise, ATS-friendly resume bullet points. Use strong action verbs and quantify achievements when the details support it.";

export const COVER_SYSTEM_PROMPT =
  "You are a professional career writer. Write a clear, compelling cover letter tailored to the company and role.";
