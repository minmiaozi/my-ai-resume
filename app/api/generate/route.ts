export async function POST(request: Request) {
    const { jobTitle, experience } = await request.json();
  
    const prompt = `请把以下工作经验，优化成专业的英文简历要点，目标岗位：${jobTitle}
  工作内容：${experience}`;
  
    const response = await fetch(
      "https://ark.cn-beijing.volces.com/api/v3/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.DOUBAO_API_KEY}`,
        },
        body: JSON.stringify({
          // 这里替换成你自己的 Endpoint ID（ep-开头的）
          model: "ep-20260509132706-tm62s",
          messages: [{ role: "user", content: prompt }],
        }),
      }
    );
  
    const data = await response.json();
    const result = data.choices?.[0]?.message?.content || "生成失败";
  
    return Response.json({ result });
  }