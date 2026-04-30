"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { ContentType } from "@/types";
import { parseStringArray, parseWarningList } from "@/lib/json-fields";

interface Topic {
  id: string;
  title: string;
  direction: string;
  keywords: string;
  contentType: string;
  status: string;
}

// 内容模板选项
const TEMPLATE_OPTIONS: Array<{
  value: ContentType;
  label: string;
  description: string;
  exampleTitles: string[];
}> = [
  {
    value: "干货教程",
    label: "干货教程型",
    description: "以实用教程为核心，分享 AI 工具使用方法、API 调用教程等",
    exampleTitles: [
      "我终于搞懂了 xxx",
      "新手别再乱买 xxx",
      "xxx 其实没那么复杂",
    ],
  },
  {
    value: "避坑指南",
    label: "避坑指南型",
    description: "以踩坑经历为切入点，帮助规避常见错误",
    exampleTitles: [
      "买 Token 前一定要看",
      "新手用 API 最容易踩的坑",
      "为什么你总觉得 API 贵",
    ],
  },
  {
    value: "人设故事",
    label: "人设故事型",
    description: "以个人经历为线索，建立真实可信的人设",
    exampleTitles: [
      "我为什么开始自己搭建 AI 中转站",
      "一个普通学生怎么开始做 AI 工具副业",
      "聊聊我做 AI 副业这一个月",
    ],
  },
  {
    value: "工具评测",
    label: "工具评测型",
    description: "以对比和评测为核心，帮助用户做出选择",
    exampleTitles: [
      "Claude Code 和 Codex 到底怎么选",
      "我试了几个 API 平台后的真实感受",
      "用 AI 写代码到底能不能省钱",
    ],
  },
  {
    value: "引流软广",
    label: "引流软广型",
    description: "以解决需求为切入点，自然引导用户了解你的服务",
    exampleTitles: [
      "如果你也需要稳定的 AI Token",
      "我把自己用的中转服务整理出来了",
      "想少走弯路可以看看",
    ],
  },
];

/** 将后端错误码/消息转为用户可理解的提示 */
function friendlyError(msg: string): string {
  if (msg.includes("NO_PROFILE") || msg.includes("请先创建账号定位")) {
    return "请先在「账号定位」页面创建账号定位，AI 需要了解你的账号风格才能生成内容。";
  }
  if (msg.includes("NO_API_KEY") || msg.includes("未配置 AI API Key")) {
    return "请先在「系统设置」页面配置 AI API Key，否则无法调用 AI 生成内容。";
  }
  if (msg.includes("fetch") || msg.includes("network")) {
    return "网络请求失败，请检查开发服务器是否正常运行。";
  }
  if (msg.includes("429") || msg.includes("rate limit")) {
    return "AI 接口调用频率过高，请稍等片刻后重试。";
  }
  if (msg.includes("401") || msg.includes("unauthorized")) {
    return "AI API Key 无效或已过期，请在「系统设置」中更新。";
  }
  return msg;
}

export default function GeneratePage() {
  const router = useRouter();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState("");
  const [precheck, setPrecheck] = useState<{
    hasProfile: boolean;
    hasApiKey: boolean;
    checked: boolean;
  }>({ hasProfile: false, hasApiKey: false, checked: false });
  const [form, setForm] = useState({
    topicId: "",
    templateType: "干货教程" as ContentType,
    direction: "",
    content: "",
    keywords: "",
    withProduct: false,
    generateCover: false,
    generateImages: false,
    versionCount: 3,
  });

  // 当前选中模板的信息
  const selectedTemplate = TEMPLATE_OPTIONS.find(
    (t) => t.value === form.templateType
  );

  useEffect(() => {
    // 并行加载选题和前置检查
    Promise.all([
      fetch("/api/topics?status=未生成").then((r) => r.json()),
      fetch("/api/profile").then((r) => r.json()),
      fetch("/api/settings").then((r) => r.json()),
    ]).then(([topicsRes, profileRes, settingsRes]) => {
      if (topicsRes.success) setTopics(topicsRes.data);
      setPrecheck({
        hasProfile: profileRes.success && profileRes.data?.length > 0,
        hasApiKey: settingsRes.success && !!settingsRes.data?.aiApiKey,
        checked: true,
      });
    });
  }, []);

  function handleTopicSelect(topicId: string) {
    const topic = topics.find((t) => t.id === topicId);
    if (topic) {
      const matchedTemplate = TEMPLATE_OPTIONS.find(
        (t) => t.value === topic.contentType
      );
      setForm({
        ...form,
        topicId,
        direction: topic.direction,
        keywords: topic.keywords,
        templateType: matchedTemplate
          ? matchedTemplate.value
          : form.templateType,
      });
    } else {
      setForm({ ...form, topicId: "" });
    }
  }

  async function handleGenerate() {
    if (!form.direction && !form.content) {
      setError("请至少填写选题方向或大概内容");
      return;
    }

    setGenerating(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (data.success) {
        setResult(data.data);
      } else {
        setError(friendlyError(data.error || "生成失败"));
      }
    } catch {
      setError("网络请求失败，请检查服务是否正常运行");
    }

    setGenerating(false);
  }

  // 前置检查未通过时显示提示
  const showProfileWarning = precheck.checked && !precheck.hasProfile;
  const showApiKeyWarning = precheck.checked && !precheck.hasApiKey;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">内容生成</h1>
        <button
          className="btn btn-outline"
          onClick={() => router.push("/drafts")}
        >
          查看草稿
        </button>
      </div>

      {/* 前置检查警告 */}
      {showProfileWarning && (
        <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200 text-sm">
          <p className="text-yellow-800 font-medium mb-1">尚未设置账号定位</p>
          <p className="text-yellow-700">
            AI 需要了解你的账号风格和目标用户才能生成合适的内容。请先
            <Link href="/profile" className="text-[var(--info)] hover:underline mx-1">
              创建账号定位
            </Link>
            后再使用生成功能。
          </p>
        </div>
      )}

      {showApiKeyWarning && (
        <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200 text-sm">
          <p className="text-yellow-800 font-medium mb-1">未配置 AI API Key</p>
          <p className="text-yellow-700">
            请先在
            <Link href="/settings" className="text-[var(--info)] hover:underline mx-1">
              系统设置
            </Link>
            中配置 AI API Key，否则无法调用 AI 生成内容。
          </p>
        </div>
      )}

      {/* Form */}
      <div className="card space-y-4">
        {/* 内容模板选择 */}
        <div>
          <label className="block text-sm font-medium mb-2">
            内容模板 <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-5 gap-2">
            {TEMPLATE_OPTIONS.map((t) => (
              <button
                key={t.value}
                className={`p-3 rounded-lg border text-left transition-all ${
                  form.templateType === t.value
                    ? "border-[var(--primary)] bg-red-50 ring-2 ring-red-100"
                    : "border-[var(--border)] hover:border-[var(--primary)]"
                }`}
                onClick={() =>
                  setForm({ ...form, templateType: t.value })
                }
              >
                <p className="text-sm font-medium">{t.label}</p>
                <p className="text-xs text-[var(--muted)] mt-1 line-clamp-2">
                  {t.description}
                </p>
              </button>
            ))}
          </div>
          {selectedTemplate && (
            <div className="mt-2 p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-[var(--muted)] mb-1">
                标题风格参考：
              </p>
              <div className="flex flex-wrap gap-1">
                {selectedTemplate.exampleTitles.map((t, i) => (
                  <span
                    key={i}
                    className="text-xs bg-white px-2 py-1 rounded border border-[var(--border)]"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 选择选题 */}
        <div>
          <label className="block text-sm font-medium mb-1">
            选择选题（可选）
          </label>
          {topics.length === 0 ? (
            <div className="p-3 bg-gray-50 rounded-lg text-sm text-[var(--muted)]">
              暂无可用选题。你可以手动输入方向，或先去
              <Link href="/topics" className="text-[var(--info)] hover:underline mx-1">
                创建选题
              </Link>
              。
            </div>
          ) : (
            <select
              className="input"
              value={form.topicId}
              onChange={(e) => handleTopicSelect(e.target.value)}
            >
              <option value="">不关联选题，手动输入</option>
              {topics.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title} ({t.contentType})
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              选题方向 <span className="text-red-500">*</span>
            </label>
            <input
              className="input"
              value={form.direction}
              onChange={(e) =>
                setForm({ ...form, direction: e.target.value })
              }
              placeholder="如：Claude Code 使用教程、Token 中转站搭建"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">关键词</label>
            <input
              className="input"
              value={form.keywords}
              onChange={(e) =>
                setForm({ ...form, keywords: e.target.value })
              }
              placeholder="用逗号分隔，如：Claude Code,API,中转站"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">大概内容</label>
          <textarea
            className="input"
            rows={4}
            value={form.content}
            onChange={(e) =>
              setForm({ ...form, content: e.target.value })
            }
            placeholder="描述你想写的内容，越详细生成效果越好。如：分享我搭建 Token 中转站的完整过程，包括技术选型、成本、踩过的坑"
          />
        </div>

        <div className="grid grid-cols-4 gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.withProduct}
              onChange={(e) =>
                setForm({ ...form, withProduct: e.target.checked })
              }
              className="w-4 h-4"
            />
            <span className="text-sm">带产品引流</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.generateCover}
              onChange={(e) =>
                setForm({ ...form, generateCover: e.target.checked })
              }
              className="w-4 h-4"
            />
            <span className="text-sm">生成封面图</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.generateImages}
              onChange={(e) =>
                setForm({ ...form, generateImages: e.target.checked })
              }
              className="w-4 h-4"
            />
            <span className="text-sm">生成正文配图</span>
          </label>
          <div>
            <label className="block text-sm mb-1">生成标题数</label>
            <select
              className="input"
              value={form.versionCount}
              onChange={(e) =>
                setForm({
                  ...form,
                  versionCount: Number(e.target.value),
                })
              }
            >
              <option value={3}>3 个</option>
              <option value={5}>5 个</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm">
            {error}
          </div>
        )}

        <button
          className="btn btn-primary w-full py-3"
          onClick={handleGenerate}
          disabled={generating || (precheck.checked && !precheck.hasProfile)}
        >
          {generating
            ? "正在生成中，请稍候..."
            : `✨ 开始生成「${selectedTemplate?.label || "内容"}」`}
        </button>
      </div>

      {/* Result */}
      {result && (
        <div className="card space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">生成结果</h2>
            <button
              className="btn btn-primary text-sm"
              onClick={() => router.push("/drafts")}
            >
              前往审核
            </button>
          </div>

          {(() => {
            const r = result as {
              draft: {
                id: string;
                titles: string;
                hook: string;
                body: string;
                hashtags: string;
                complianceWarnings: string;
                riskDisclaimer: string;
                templateType: string;
              };
              tokensUsed: number;
            };
            const titles = parseStringArray(r.draft.titles);
            const hashtags = parseStringArray(r.draft.hashtags);
            const warnings = parseWarningList(r.draft.complianceWarnings);

            return (
              <>
                <div className="flex items-center gap-2">
                  <span className="tag tag-approved">
                    {r.draft.templateType}
                  </span>
                  <span className="text-xs text-[var(--muted)]">
                    Token 消耗: {r.tokensUsed}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-2">标题选项</h3>
                  <div className="space-y-1">
                    {titles.map((t: string, i: number) => (
                      <p
                        key={i}
                        className="text-sm p-2 bg-gray-50 rounded"
                      >
                        {i + 1}. {t}
                      </p>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-2">开头钩子</h3>
                  <p className="text-sm p-2 bg-gray-50 rounded">
                    {r.draft.hook}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-2">正文</h3>
                  <div className="text-sm p-3 bg-gray-50 rounded whitespace-pre-wrap max-h-60 overflow-y-auto">
                    {r.draft.body}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-2">标签</h3>
                  <div className="flex flex-wrap gap-1">
                    {hashtags.map((h: string, i: number) => (
                      <span key={i} className="tag tag-approved">
                        #{h}
                      </span>
                    ))}
                  </div>
                </div>

                {r.draft.riskDisclaimer && (
                  <div>
                    <h3 className="text-sm font-medium mb-2 text-blue-600">
                      风险提示
                    </h3>
                    <p className="text-sm p-2 bg-blue-50 rounded text-blue-700">
                      {r.draft.riskDisclaimer}
                    </p>
                  </div>
                )}

                {warnings.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium mb-2 text-yellow-600">
                      合规提醒
                    </h3>
                    <ul className="space-y-1">
                      {warnings.map((w: string, i: number) => (
                        <li
                          key={i}
                          className="text-sm text-yellow-700"
                        >
                          ⚠️ {w}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
}
