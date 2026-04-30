"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  DRAFT_STATUS,
  DRAFT_STATUS_LABELS,
  DRAFT_STATUS_COLORS,
  ALL_DRAFT_STATUSES,
  type DraftStatus,
} from "@/lib/draft-status";
import { parseStringArray, parseWarningList } from "@/lib/json-fields";

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
  scheduledDate: string;
  scheduledTime: string;
  createdAt: string;
  topic?: { title: string } | null;
}

export default function DraftsPage() {
  const router = useRouter();
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [filter, setFilter] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editBody, setEditBody] = useState("");
  const [editTitles, setEditTitles] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    loadDrafts();
  }, []);

  function loadDrafts() {
    fetch("/api/drafts")
      .then((r) => r.json())
      .then((r) => {
        if (r.success) setDrafts(r.data);
      });
  }

  async function updateStatus(id: string, status: string) {
    await fetch("/api/drafts", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    loadDrafts();
    setMsg(`状态已更新为 ${DRAFT_STATUS_LABELS[status as DraftStatus] || status}`);
    setTimeout(() => setMsg(""), 3000);
  }

  async function handleSaveEdit(id: string) {
    await fetch("/api/drafts", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, body: editBody, titles: editTitles }),
    });
    setEditingId(null);
    loadDrafts();
    setMsg("内容已更新");
    setTimeout(() => setMsg(""), 3000);
  }

  function copyToClipboard(text: string, label: string) {
    navigator.clipboard.writeText(text).then(() => {
      setMsg(`${label} 已复制到剪贴板`);
      setTimeout(() => setMsg(""), 2000);
    });
  }

  async function handleDelete(id: string) {
    if (!confirm("确定删除此草稿？")) return;
    await fetch(`/api/drafts?id=${id}`, { method: "DELETE" });
    loadDrafts();
  }

  const filtered =
    filter === "all" ? drafts : drafts.filter((d) => d.status === filter);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">草稿审核</h1>
        <button
          className="btn btn-primary text-sm"
          onClick={() => router.push("/export")}
        >
          前往发布助手
        </button>
      </div>

      {msg && (
        <div className="p-3 rounded-lg bg-green-50 text-green-700 text-sm">
          {msg}
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {["all", ...ALL_DRAFT_STATUSES].map(
          (f) => (
            <button
              key={f}
              className={`btn text-xs ${filter === f ? "btn-primary" : "btn-outline"}`}
              onClick={() => setFilter(f)}
            >
              {f === "all" ? "全部" : DRAFT_STATUS_LABELS[f as DraftStatus] || f}
            </button>
          )
        )}
      </div>

      {/* Draft List */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-[var(--muted)] mb-2">
              {filter === "all" ? "还没有草稿" : `没有「${DRAFT_STATUS_LABELS[filter as DraftStatus] || filter}」状态的草稿`}
            </p>
            {filter === "all" && (
              <p className="text-sm text-[var(--muted)]">
                去
                <a href="/generate" className="text-[var(--info)] hover:underline mx-1">
                  内容生成
                </a>
                页面使用 AI 生成你的第一篇内容。
              </p>
            )}
          </div>
        ) : (
          filtered.map((draft) => {
            const titles = parseStringArray(draft.titles);
            const hashtags = parseStringArray(draft.hashtags);
            const warnings = parseWarningList(draft.complianceWarnings);
            const isExpanded = expandedId === draft.id;
            const isEditing = editingId === draft.id;

            return (
              <div key={draft.id} className="card">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-base">
                        {titles[0] || "无标题"}
                      </h3>
                      <span
                        className={`tag ${DRAFT_STATUS_COLORS[draft.status as DraftStatus] || "tag-draft"}`}
                      >
                        {DRAFT_STATUS_LABELS[draft.status as DraftStatus] || draft.status}
                      </span>
                      {draft.templateType && (
                        <span className="tag tag-approved">
                          {draft.templateType}
                        </span>
                      )}
                      {draft.topic && (
                        <span className="tag tag-draft">
                          {draft.topic.title}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[var(--muted)] mt-1">
                      生成时间:{" "}
                      {new Date(draft.createdAt).toLocaleString("zh-CN")}
                    </p>
                  </div>

                  <div className="flex gap-1 flex-wrap">
                    <button
                      className="btn btn-outline text-xs"
                      onClick={() =>
                        setExpandedId(isExpanded ? null : draft.id)
                      }
                    >
                      {isExpanded ? "收起" : "展开"}
                    </button>
                    <button
                      className="btn btn-outline text-xs"
                      onClick={() => {
                        setEditingId(isEditing ? null : draft.id);
                        setEditBody(draft.body);
                        setEditTitles(JSON.stringify(titles));
                      }}
                    >
                      {isEditing ? "取消编辑" : "编辑"}
                    </button>
                    <button
                      className="btn btn-outline text-xs text-red-500"
                      onClick={() => handleDelete(draft.id)}
                    >
                      删除
                    </button>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex gap-2 flex-wrap mb-3">
                  <button
                    className="btn btn-outline text-xs"
                    onClick={() =>
                      copyToClipboard(titles[0] || "", "标题")
                    }
                  >
                    复制标题
                  </button>
                  <button
                    className="btn btn-outline text-xs"
                    onClick={() => copyToClipboard(draft.body, "正文")}
                  >
                    复制正文
                  </button>
                  <button
                    className="btn btn-outline text-xs"
                    onClick={() =>
                      copyToClipboard(
                        hashtags.map((h) => `#${h}`).join(" "),
                        "标签"
                      )
                    }
                  >
                    复制标签
                  </button>
                  {draft.riskDisclaimer && (
                    <button
                      className="btn btn-outline text-xs"
                      onClick={() =>
                        copyToClipboard(draft.riskDisclaimer, "风险提示")
                      }
                    >
                      复制风险提示
                    </button>
                  )}

                  {/* 状态流转按钮 */}
                  {draft.status === DRAFT_STATUS.Draft && (
                    <>
                      <button
                        className="btn btn-warning text-xs"
                        onClick={() =>
                          updateStatus(draft.id, DRAFT_STATUS.NeedsEdit)
                        }
                      >
                        标记需修改
                      </button>
                      <button
                        className="btn btn-success text-xs"
                        onClick={() =>
                          updateStatus(draft.id, DRAFT_STATUS.ReadyToPublish)
                        }
                      >
                        标记待发布
                      </button>
                    </>
                  )}
                  {draft.status === DRAFT_STATUS.NeedsEdit && (
                    <button
                      className="btn btn-success text-xs"
                      onClick={() => updateStatus(draft.id, DRAFT_STATUS.Draft)}
                    >
                      退回草稿
                    </button>
                  )}
                  {draft.status === DRAFT_STATUS.ReadyToPublish && (
                    <button
                      className="btn btn-primary text-xs"
                      onClick={() => router.push("/export")}
                    >
                      前往发布
                    </button>
                  )}
                  {draft.status === DRAFT_STATUS.Published && draft.publishLink && (
                    <a
                      href={draft.publishLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-outline text-xs"
                    >
                      查看笔记
                    </a>
                  )}
                </div>

                {/* 已发布信息 */}
                {draft.status === DRAFT_STATUS.Published && (
                  <div className="p-3 bg-green-50 rounded-lg mb-3 text-sm">
                    <div className="flex items-center gap-4 flex-wrap">
                      {draft.publishPlatform && (
                        <span>
                          平台:{" "}
                          <strong>{draft.publishPlatform}</strong>
                        </span>
                      )}
                      {draft.publishedAt && (
                        <span>
                          发布时间:{" "}
                          <strong>
                            {new Date(draft.publishedAt).toLocaleString(
                              "zh-CN"
                            )}
                          </strong>
                        </span>
                      )}
                      {draft.publishLink && (
                        <a
                          href={draft.publishLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[var(--info)] hover:underline"
                        >
                          查看笔记 →
                        </a>
                      )}
                    </div>
                    {draft.actualTitle && (
                      <p className="mt-1 text-[var(--muted)]">
                        实际标题: {draft.actualTitle}
                      </p>
                    )}
                    {draft.actualTags && (
                      <p className="mt-1 text-[var(--muted)]">
                        实际标签: {draft.actualTags}
                      </p>
                    )}
                    {draft.publishNote && (
                      <p className="mt-1 text-[var(--muted)]">
                        备注: {draft.publishNote}
                      </p>
                    )}
                  </div>
                )}

                {/* Editing Mode */}
                {isEditing && (
                  <div className="space-y-3 p-3 bg-gray-50 rounded-lg mb-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        标题（JSON 数组格式）
                      </label>
                      <textarea
                        className="input font-mono text-sm"
                        rows={2}
                        value={editTitles}
                        onChange={(e) => setEditTitles(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        正文
                      </label>
                      <textarea
                        className="input text-sm"
                        rows={8}
                        value={editBody}
                        onChange={(e) => setEditBody(e.target.value)}
                      />
                    </div>
                    <button
                      className="btn btn-primary text-sm"
                      onClick={() => handleSaveEdit(draft.id)}
                    >
                      保存修改
                    </button>
                  </div>
                )}

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="space-y-3 mt-3 pt-3 border-t border-[var(--border)]">
                    {/* All Titles */}
                    <div>
                      <h4 className="text-sm font-medium mb-1">
                        所有标题
                      </h4>
                      {titles.map((t, i) => (
                        <p
                          key={i}
                          className="text-sm text-[var(--secondary)]"
                        >
                          {i + 1}. {t}
                        </p>
                      ))}
                    </div>

                    {/* Hook */}
                    <div>
                      <h4 className="text-sm font-medium mb-1">
                        开头钩子
                      </h4>
                      <p className="text-sm text-[var(--secondary)]">
                        {draft.hook}
                      </p>
                    </div>

                    {/* Body */}
                    <div>
                      <h4 className="text-sm font-medium mb-1">正文</h4>
                      <div className="text-sm text-[var(--secondary)] whitespace-pre-wrap max-h-60 overflow-y-auto p-2 bg-gray-50 rounded">
                        {draft.body}
                      </div>
                    </div>

                    {/* Hashtags */}
                    <div>
                      <h4 className="text-sm font-medium mb-1">标签</h4>
                      <div className="flex flex-wrap gap-1">
                        {hashtags.map((h, i) => (
                          <span key={i} className="tag tag-approved">
                            #{h}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Cover */}
                    {draft.coverImagePrompt && (
                      <div>
                        <h4 className="text-sm font-medium mb-1">
                          封面图提示词
                        </h4>
                        <p className="text-sm text-[var(--secondary)] p-2 bg-gray-50 rounded">
                          {draft.coverImagePrompt}
                        </p>
                      </div>
                    )}

                    {/* Comment Guide */}
                    {draft.commentGuide && (
                      <div>
                        <h4 className="text-sm font-medium mb-1">
                          评论区置顶话术
                        </h4>
                        <p className="text-sm text-[var(--secondary)]">
                          {draft.commentGuide}
                        </p>
                      </div>
                    )}

                    {/* Risk Disclaimer */}
                    {draft.riskDisclaimer && (
                      <div>
                        <h4 className="text-sm font-medium mb-1 text-blue-600">
                          风险提示
                        </h4>
                        <p className="text-sm text-blue-700 p-2 bg-blue-50 rounded">
                          {draft.riskDisclaimer}
                        </p>
                      </div>
                    )}

                    {/* Warnings */}
                    {warnings.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium mb-1 text-yellow-600">
                          合规提醒
                        </h4>
                        <ul className="space-y-1">
                          {warnings.map((w, i) => (
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
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
