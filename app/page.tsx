"use client";
import { useState } from "react";

export default function Home() {
  const [jobTitle, setJobTitle] = useState("");
  const [experience, setExperience] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleGenerate() {
    if (!jobTitle || !experience) {
      alert("请填写目标岗位和工作经验");
      return;
    }

    setLoading(true);
    setResult("正在生成中，请稍候...");

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ jobTitle, experience }),
      });

      const data = await response.json();
      setResult(data.result || "生成失败，请重试");
    } catch (error) {
      setResult("请求出错了：" + error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow p-6">
        <h1 className="text-2xl font-bold mb-6 text-center">AI 简历优化工具</h1>

        <div className="mb-4">
          <label className="block mb-1 font-medium">目标岗位</label>
          <input
            type="text"
            className="w-full border rounded px-3 py-2"
            placeholder="例如：Product Manager"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <label className="block mb-1 font-medium">你的工作经验</label>
          <textarea
            className="w-full border rounded px-3 py-2"
            rows={6}
            placeholder="描述你的相关经验、成就..."
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
          />
        </div>

        <button
          className="w-full bg-blue-600 text-white py-2 rounded disabled:opacity-50"
          onClick={handleGenerate}
          disabled={loading}
        >
          {loading ? "生成中..." : "生成专业简历要点"}
        </button>

        <div className="mt-6">
          <h3 className="font-medium mb-2">生成结果：</h3>
          <pre className="bg-gray-100 p-4 rounded whitespace-pre-wrap text-sm">
            {result}
          </pre>
        </div>
      </div>
    </div>
  );
}