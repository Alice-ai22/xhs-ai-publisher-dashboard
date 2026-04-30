"use client";

import { useState, useEffect } from "react";
import { parseStringArray, parseWarningList, parseChecklist } from "@/lib/json-fields";

// ============================================================
// 发布助手页面
//
// 流程：
// 1. 用户审核 AI 生成的笔记
// 2. 点击「生成发布包」查看完整内容
// 3. 复制文本 / 下载图片
// 4. 打开小红书创作服务平台手动发布
// 5. 回到本页粘贴笔记链接，标记已发布
//
// ⚠️ 本页面不提供任何形式的自动发布功能。
// ============================================================

interface Draft {
  id: string;
  titles: string;
  hook: string;
  body: string;
  bodyNoEmoji: string;
  hashtags: string;
  coverText: string;
  coverImagePrompt: string;
  coverImageUrl: string;
  contentImagePrompts: string;
  contentImageUrls: string;
  commentGuide: string;
  complianceWarnings: string;
  publishChecklist: string;
  riskDisclaimer: string;
  templateType: string;
  status: string;
  publishLink: string;
  publishNote: string;
  publishPlatform: string;
  actualTitle: string;
  actualTags: string;
  publishedAt: string | null;
  createdAt: string;
  topic?: { title: string } | null;
}

export default function ExportPage() {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [msg, setMsg] = useState({ text: "", type: "info" });
  const [showPublishForm, setShowPublishForm] = useState(false);

  // 发布表单状态
  const [publishForm, setPublishForm] = useState({
    publishLink: "",
    publishNote: "",
    publishPlatform: "小红书",
    actualTitle: "",
    actualTags: "",
  });

  useEffect(() => {
    fetch("/api/drafts?status=ReadyToPublish")
      .then((r) => r.json())
      .then((r) => {
        if (r.success) setDrafts(r.data);
      });
  }, []);

  function showMessage(text: string, type: "info" | "success" | "error" = "info") {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: "", type: "info" }), 3000);
  }

  function copyText(text: string, label: string) {
    navigator.clipboard.writeText(text).then(() => {
      showMessage(`${label} 已复制到剪贴板`, "success");
    });
  }

  async function downloadImage(url: string, filename: string) {
    if (!url) {
      showMessage("图片 URL 为空，无法下载", "error");
      return;
    }
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(blobUrl);
      showMessage(`${filename} 下载成功`, "success");
    } catch {
      showMessage("图片下载失败，请右键另存为", "error");
    }
  }

  async function handleMarkPublished() {
    if (!selectedId) return;

    if (!publishForm.publishLink) {
      showMessage("请填写笔记链接，方便后续追踪", "error");
      return;
    }

    await fetch("/api/drafts", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: selectedId,
        status: "Published",
        ...publishForm,
      }),
    });

    showMessage("已标记为已发布", "success");
    setShowPublishForm(false);
    setPublishForm({
      publishLink: "",
      publishNote: "",
      publishPlatform: "小红书",
      actualTitle: "",
      actualTags: "",
    });

    // 重新加载列表
    fetch("/api/drafts?status=ReadyToPublish")
      .then((r) => r.json())
      .then((r) => {
        if (r.success) {
          setDrafts(r.data);
          setSelectedId(null);
        }
      });
  }

  const selected = drafts.find((d) => d.id === selectedId);

  // 解析选中草稿的数据
  const parsed = selected
    ? {
        titles: parseStringArray(selected.titles),
        hashtags: parseStringArray(selected.hashtags),
        contentImageUrls: parseStringArray(selected.contentImageUrls),
        contentImagePrompts: parseStringArray(selected.contentImagePrompts),
        publishChecklist: parseChecklist(selected.publishChecklist),
        warnings: parseWarningList(selected.complianceWarnings),
      }
    : null;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">发布助手</h1>
        <p className="text-sm text-[var(--muted)] mt-1">
          审核内容 → 复制文案 → 手动发布到小红书 → 回来标记已发布
        </p>
      </div>

      {/* Toast */}
      {msg.text && (
        <div
          className={`p-3 rounded-lg text-sm ${
            msg.type === "error"
              ? "bg-red-50 text-red-700"
              : msg.type === "success"
                ? "bg-green-50 text-green-700"
                : "bg-blue-50 text-blue-700"
          }`}
        >
          {msg.text}
        </div>
      )}

      {drafts.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-[var(--muted)] text-lg mb-2">暂无待发布内容</p>
          <p className="text-sm text-[var(--muted)] mb-4">
            请先在草稿审核页面将内容标记为「待发布」
          </p>
          <a href="/drafts" className="btn btn-primary text-sm">
            前往草稿审核
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-6">
          {/* ── 左侧：待发布列表 ── */}
          <div className="space-y-3">
            <h2 className="font-semibold text-sm text-[var(--muted)]">
              待发布 ({drafts.length})
            </h2>
            {drafts.map((d) => {
              const titles = parseStringArray(d.titles);
              return (
                <button
                  key={d.id}
                  className={`card w-full text-left transition-all ${
                    selectedId === d.id
                      ? "border-[var(--primary)] ring-2 ring-red-100"
                      : "hover:border-[var(--primary)]"
                  }`}
                  onClick={() => {
                    setSelectedId(d.id);
                    setShowPublishForm(false);
                  }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs bg-gray-100 px-2 py-0.5 rounded shrink-0">
                      {d.templateType}
                    </span>
                  </div>
                  <p className="font-medium text-sm truncate">
                    {titles[0] || "无标题"}
                  </p>
                  <p className="text-xs text-[var(--muted)] mt-1">
                    {new Date(d.createdAt).toLocaleDateString("zh-CN")}
                  </p>
                </button>
              );
            })}
          </div>

          {/* ── 右侧：发布包详情 ── */}
          <div className="col-span-2">
            {selected && parsed ? (
              <div className="space-y-4">
                {/* ── 标题 ── */}
                <div className="card">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-[var(--muted)]">
                      标题（{parsed.titles.length} 个版本）
                    </h3>
                    <button
                      className="btn btn-outline text-xs"
                      onClick={() => copyText(parsed.titles[0], "标题")}
                    >
                      复制主标题
                    </button>
                  </div>
                  {parsed.titles.map((t, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-2 rounded hover:bg-gray-50"
                    >
                      <p className="text-sm">
                        <span className="text-[var(--muted)] mr-2">
                          {i + 1}.
                        </span>
                        {t}
                      </p>
                      <button
                        className="text-xs text-[var(--info)] hover:underline shrink-0 ml-2"
                        onClick={() => copyText(t, `标题${i + 1}`)}
                      >
                        复制
                      </button>
                    </div>
                  ))}
                </div>

                {/* ── 正文 ── */}
                <div className="card">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-[var(--muted)]">
                      正文
                    </h3>
                    <div className="flex gap-2">
                      <button
                        className="btn btn-outline text-xs"
                        onClick={() => copyText(selected.body, "正文(带表情)")}
                      >
                        复制(带表情)
                      </button>
                      <button
                        className="btn btn-outline text-xs"
                        onClick={() =>
                          copyText(selected.bodyNoEmoji, "正文(无表情)")
                        }
                      >
                        复制(无表情)
                      </button>
                    </div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded text-sm whitespace-pre-wrap max-h-80 overflow-y-auto">
                    {selected.body}
                  </div>
                </div>

                {/* ── 标签 ── */}
                <div className="card">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-[var(--muted)]">
                      标签（{parsed.hashtags.length} 个）
                    </h3>
                    <button
                      className="btn btn-outline text-xs"
                      onClick={() =>
                        copyText(
                          parsed.hashtags.map((h) => `#${h}`).join(" "),
                          "标签"
                        )
                      }
                    >
                      复制全部
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {parsed.hashtags.map((h, i) => (
                      <span
                        key={i}
                        className="tag tag-approved cursor-pointer hover:opacity-80"
                        onClick={() => copyText(`#${h}`, `标签 #${h}`)}
                      >
                        #{h}
                      </span>
                    ))}
                  </div>
                </div>

                {/* ── 封面图 ── */}
                <div className="card">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-[var(--muted)]">
                      封面图
                    </h3>
                    <div className="flex gap-2">
                      <button
                        className="btn btn-outline text-xs"
                        onClick={() =>
                          copyText(selected.coverImagePrompt, "封面提示词")
                        }
                      >
                        复制提示词
                      </button>
                      {selected.coverImageUrl && (
                        <button
                          className="btn btn-outline text-xs"
                          onClick={() =>
                            downloadImage(
                              selected.coverImageUrl,
                              `cover-${selected.id}.png`
                            )
                          }
                        >
                          下载封面图
                        </button>
                      )}
                    </div>
                  </div>
                  {selected.coverImageUrl ? (
                    <div className="relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={selected.coverImageUrl}
                        alt="封面图"
                        className="w-full max-w-sm rounded-lg border border-[var(--border)]"
                      />
                    </div>
                  ) : (
                    <div className="p-4 bg-gray-50 rounded text-sm text-[var(--muted)]">
                      <p className="mb-1">封面图提示词（用于 AI 绘图）：</p>
                      <p className="text-[var(--secondary)]">
                        {selected.coverImagePrompt || "无"}
                      </p>
                    </div>
                  )}
                </div>

                {/* ── 正文配图 ── */}
                {parsed.contentImageUrls.length > 0 && (
                  <div className="card">
                    <h3 className="text-sm font-semibold text-[var(--muted)] mb-2">
                      正文配图（{parsed.contentImageUrls.length} 张）
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      {parsed.contentImageUrls.map((url, i) => (
                        <div key={i} className="space-y-2">
                          {url ? (
                            <>
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={url}
                                alt={`配图 ${i + 1}`}
                                className="w-full rounded-lg border border-[var(--border)]"
                              />
                              <button
                                className="btn btn-outline text-xs w-full"
                                onClick={() =>
                                  downloadImage(
                                    url,
                                    `content-${selected.id}-${i + 1}.png`
                                  )
                                }
                              >
                                下载配图 {i + 1}
                              </button>
                            </>
                          ) : (
                            <div className="p-4 bg-gray-50 rounded text-sm">
                              <p className="text-[var(--muted)] mb-1">
                                配图 {i + 1} 提示词：
                              </p>
                              <p className="text-[var(--secondary)] text-xs">
                                {parsed.contentImagePrompts[i] || "无"}
                              </p>
                              <button
                                className="btn btn-outline text-xs mt-2"
                                onClick={() =>
                                  copyText(
                                    parsed.contentImagePrompts[i] || "",
                                    `配图${i + 1}提示词`
                                  )
                                }
                              >
                                复制提示词
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── 评论区置顶话术 ── */}
                {selected.commentGuide && (
                  <div className="card">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-semibold text-[var(--muted)]">
                        评论区置顶话术
                      </h3>
                      <button
                        className="btn btn-outline text-xs"
                        onClick={() =>
                          copyText(selected.commentGuide, "评论区话术")
                        }
                      >
                        复制
                      </button>
                    </div>
                    <p className="text-sm p-2 bg-gray-50 rounded">
                      {selected.commentGuide}
                    </p>
                  </div>
                )}

                {/* ── 风险提示 ── */}
                {selected.riskDisclaimer && (
                  <div className="card">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-semibold text-blue-600">
                        风险提示
                      </h3>
                      <button
                        className="btn btn-outline text-xs"
                        onClick={() =>
                          copyText(selected.riskDisclaimer, "风险提示")
                        }
                      >
                        复制
                      </button>
                    </div>
                    <p className="text-sm p-2 bg-blue-50 rounded text-blue-700">
                      {selected.riskDisclaimer}
                    </p>
                  </div>
                )}

                {/* ── 发布检查清单 ── */}
                {parsed.publishChecklist.length > 0 && (
                  <div className="card">
                    <h3 className="text-sm font-semibold text-[var(--muted)] mb-2">
                      发布检查清单
                    </h3>
                    <ul className="space-y-2">
                      {parsed.publishChecklist.map((item, i) => (
                        <li
                          key={i}
                          className="text-sm flex items-start gap-2"
                        >
                          <span className="text-[var(--muted)] mt-0.5">
                            ☐
                          </span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* ── 合规提醒 ── */}
                {parsed.warnings.length > 0 && (
                  <div className="card">
                    <h3 className="text-sm font-semibold text-yellow-600 mb-2">
                      合规提醒
                    </h3>
                    <ul className="space-y-1">
                      {parsed.warnings.map((w, i) => (
                        <li key={i} className="text-sm text-yellow-700">
                          ⚠️ {w}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* ── 操作区 ── */}
                <div className="card">
                  <h3 className="text-sm font-semibold text-[var(--muted)] mb-3">
                    发布操作
                  </h3>
                  <div className="flex gap-3">
                    <a
                      href="https://creator.xiaohongshu.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-primary flex-1 text-center"
                    >
                      打开小红书创作服务平台
                    </a>
                    <button
                      className="btn btn-success flex-1"
                      onClick={() => setShowPublishForm(true)}
                    >
                      我已发布，标记完成
                    </button>
                  </div>
                  <p className="text-xs text-[var(--muted)] mt-2 text-center">
                    请在小红书创作服务平台手动上传图片、粘贴文案、确认发布后，再回来标记
                  </p>
                </div>

                {/* ── 标记已发表单 ── */}
                {showPublishForm && (
                  <div className="card border-[var(--primary)]">
                    <h3 className="text-sm font-semibold mb-3">
                      填写发布信息
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          发布平台
                        </label>
                        <select
                          className="input"
                          value={publishForm.publishPlatform}
                          onChange={(e) =>
                            setPublishForm({
                              ...publishForm,
                              publishPlatform: e.target.value,
                            })
                          }
                        >
                          <option value="小红书">小红书</option>
                          <option value="小红书网页版">小红书网页版</option>
                          <option value="其他">其他</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          笔记链接 <span className="text-red-500">*</span>
                        </label>
                        <input
                          className="input"
                          placeholder="https://www.xiaohongshu.com/explore/..."
                          value={publishForm.publishLink}
                          onChange={(e) =>
                            setPublishForm({
                              ...publishForm,
                              publishLink: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          实际使用的标题
                        </label>
                        <input
                          className="input"
                          placeholder="如果发布时修改了标题，填写实际标题"
                          value={publishForm.actualTitle}
                          onChange={(e) =>
                            setPublishForm({
                              ...publishForm,
                              actualTitle: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          实际使用的标签
                        </label>
                        <input
                          className="input"
                          placeholder="如果发布时修改了标签，填写实际标签"
                          value={publishForm.actualTags}
                          onChange={(e) =>
                            setPublishForm({
                              ...publishForm,
                              actualTags: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          备注
                        </label>
                        <textarea
                          className="input"
                          rows={2}
                          placeholder="可选，记录发布相关的信息"
                          value={publishForm.publishNote}
                          onChange={(e) =>
                            setPublishForm({
                              ...publishForm,
                              publishNote: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="flex gap-3 pt-2">
                        <button
                          className="btn btn-success flex-1"
                          onClick={handleMarkPublished}
                        >
                          确认标记为已发布
                        </button>
                        <button
                          className="btn btn-outline"
                          onClick={() => setShowPublishForm(false)}
                        >
                          取消
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="card text-center py-20 text-[var(--muted)]">
                ← 请选择一篇待发布内容
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
