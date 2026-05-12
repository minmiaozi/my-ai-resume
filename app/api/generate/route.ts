import { assistantTextFromPayload } from "@/lib/completion";

type Body = {
  messages?: Array<{ role: string; content: string }>;
  jobTitle?: string;
  experience?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Body;
    const apiKey = process.env.DOUBAO_API_KEY;
    const modelId = process.env.DOUBAO_MODEL;

    if (!apiKey || !modelId) {
      return Response.json(
        { error: "服务器配置错误：请设置 DOUBAO_API_KEY 与 DOUBAO_MODEL" },
        { status: 500 }
      );
    }

    let messages = body.messages;
    if (!messages?.length && body.jobTitle && body.experience) {
      messages = [
        {
          role: "user",
          content: `请把以下工作经验，优化成专业的英文简历要点，目标岗位：${body.jobTitle}\n工作内容：${body.experience}`,
        },
      ];
    }

    if (!Array.isArray(messages) || messages.length === 0) {
      return Response.json({ error: "缺少 messages" }, { status: 400 });
    }

    const upstream = await fetch("https://ark.cn-beijing.volces.com/api/v3/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: modelId,
        messages,
        temperature: 0.7,
        stream: false,
      }),
    });

    const raw = await upstream.json();

    if (!upstream.ok) {
      const err = raw as { error?: { message?: string }; message?: string };
      const msg = err.error?.message ?? err.message ?? "上游 API 错误";
      return Response.json({ error: msg }, { status: 500 });
    }

    const result = assistantTextFromPayload(raw);

    if (!result) {
      console.error("Upstream missing choices/content:", JSON.stringify(raw).slice(0, 1200));
      return Response.json(
        { error: "模型未返回正文（响应格式异常）" },
        { status: 502 }
      );
    }

    return Response.json({ result });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "服务器内部错误" }, { status: 500 });
  }
}
