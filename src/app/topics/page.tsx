"use client";

import { useState, useEffect } from "react";

interface Topic {
  id: string;
  title: string;
  direction: string;
  targetAudience: string;
  keywords: string;
  referenceContent: string;
  productHook: string;
  contentType: string;
  status: string;
  _count?: { drafts: number };
}

const CONTENT_TYPES = [
  "干货教程",
  "避坑指南",
  "人设故事",
  "工具评测",
  "引流软广",
];

const CONTENT_TYPE_INFO: Record<string, string> = {
  干货教程: "以实用教程为核心，分享 AI 工具使用方法、API 调用教程等",
  避坑指南: "以踩坑经历为切入点，帮助规避常见错误",
  人设故事: "以个人经历为线索，建立真实可信的人设",
  工具评测: "以对比和评测为核心，帮助用户做出选择",
  引流软广: "以解决需求为切入点，自然引导用户了解服务",
};

export default function TopicsPage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "",
    direction: "",
    targetAudience: "",
    keywords: "",
    referenceContent: "",
    productHook: "",
    contentType: "干货教程",
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filter, setFilter] = useState("all");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadTopics();
  }, []);

  function loadTopics() {
    fetch("/api/topics")
      .then((r) => r.json())
      .then((r) => {
        if (r.success) setTopics(r.data);
      });
  }

  async function handleSave() {
    setSaving(true);
    try {
      const method = editingId ? "PUT" : "POST";
      const body = editingId ? { ...form, id: editingId } : form;
      const res = await fetch("/api/topics", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const r = await res.json();
      if (r.success) {
        setShowForm(false);
        setForm({
          title: "",
          direction: "",
          targetAudience: "",
          keywords: "",
          referenceContent: "",
          productHook: "",
          contentType: "干货教程",
        });
        setEditingId(null);
        loadTopics();
      }
    } finally {
      setSaving(false);
    }
  }

  function handleEdit(topic: Topic) {
    setEditingId(topic.id);
    setForm({
      title: topic.title,
      direction: topic.direction,
      targetAudience: topic.targetAudience,
      keywords: topic.keywords,
      referenceContent: topic.referenceContent,
      productHook: topic.productHook,
      contentType: topic.contentType,
    });
    setShowForm(true);
  }

  async function handleDelete(id: string) {
    if (!confirm("确定删除此选题？")) return;
    await fetch(`/api/topics?id=${id}`, { method: "DELETE" });
    loadTopics();
  }

  async function handleArchive(id: string) {
    await fetch("/api/topics", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: "已归档" }),
    });
    loadTopics();
  }

  const filtered =
    filter === "all"
      ? topics
      : topics.filter((t) => t.status === filter);

  const statusColors: Record<string, string> = {
    未生成: "tag-draft",
    已生成: "tag-ready",
    已归档: "tag-needs-edit",
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">选题库</h1>
        <button
          className="btn btn-primary"
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
          }}
        >
          {showForm ? "收起" : " + 新建选题"}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="card space-y-4">
          <h2 className="font-semibold">
            {editingId ? "编辑选题" : "新建选题"}
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                选题标题
              </label>
              <input
                className="input"
                value={form.title}
                onChange={(e) =>
                  setForm({ ...form, title: e.target.value })
                }
                placeholder="如：Claude Code 和 Codex 到底怎么选"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                内容模板
              </label>
              <select
                className="input"
                value={form.contentType}
                onChange={(e) =>
                  setForm({ ...form, contentType: e.target.value })
                }
              >
                {CONTENT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              {CONTENT_TYPE_INFO[form.contentType] && (
                <p className="text-xs text-[var(--muted)] mt-1">
                  {CONTENT_TYPE_INFO[form.contentType]}
                </p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                选题方向
              </label>
              <input
                className="input"
                value={form.direction}
                onChange={(e) =>
                  setForm({ ...form, direction: e.target.value })
                }
                placeholder="如：AI 工具对比、API 使用教程"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                目标人群
              </label>
              <input
                className="input"
                value={form.targetAudience}
                onChange={(e) =>
                  setForm({
                    ...form,
                    targetAudience: e.target.value,
                  })
                }
                placeholder="如：开发者、AI 工具用户、想做副业的人"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                关键词
              </label>
              <input
                className="input"
                value={form.keywords}
                onChange={(e) =>
                  setForm({ ...form, keywords: e.target.value })
                }
                placeholder="用逗号分隔，如：Claude Code,Codex,AI编程"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                产品植入点
              </label>
              <input
                className="input"
                value={form.productHook}
                onChange={(e) =>
                  setForm({ ...form, productHook: e.target.value })
                }
                placeholder="如何自然带出产品，如：对比时提到中转站更划算"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              参考内容
            </label>
            <textarea
              className="input"
              value={form.referenceContent}
              onChange={(e) =>
                setForm({
                  ...form,
                  referenceContent: e.target.value,
                })
              }
              placeholder="可选，参考内容或灵感来源"
            />
          </div>
          <div className="flex gap-3">
            <button
              className="btn btn-primary"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "保存中..." : editingId ? "更新" : "创建"}
            </button>
            <button
              className="btn btn-outline"
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
              }}
            >
              取消
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2">
        {["all", "未生成", "已生成", "已归档"].map((f) => (
          <button
            key={f}
            className={`btn text-xs ${filter === f ? "btn-primary" : "btn-outline"}`}
            onClick={() => setFilter(f)}
          >
            {f === "all" ? "全部" : f}
          </button>
        ))}
      </div>

      {/* Topic List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-[var(--muted)] mb-2">
              {filter === "all" ? "还没有选题" : `没有「${filter}」状态的选题`}
            </p>
            {filter === "all" && (
              <p className="text-sm text-[var(--muted)]">
                点击上方「+ 新建选题」按钮创建你的第一个选题，然后去
                <a href="/generate" className="text-[var(--info)] hover:underline mx-1">
                  内容生成
                </a>
                页面使用 AI 生成内容。
              </p>
            )}
          </div>
        ) : (
          filtered.map((topic) => (
            <div key={topic.id} className="card">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{topic.title}</h3>
                    <span
                      className={`tag ${statusColors[topic.status] || "tag-draft"}`}
                    >
                      {topic.status}
                    </span>
                    <span className="tag tag-approved">
                      {topic.contentType}
                    </span>
                  </div>
                  <p className="text-sm text-[var(--muted)]">
                    {topic.direction} · {topic.targetAudience}
                  </p>
                  <div className="flex gap-1 mt-2">
                    {topic.keywords.split(",").map((k, i) => (
                      <span
                        key={i}
                        className="text-xs bg-gray-100 px-2 py-0.5 rounded"
                      >
                        {k.trim()}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    className="btn btn-outline text-xs"
                    onClick={() => handleEdit(topic)}
                  >
                    编辑
                  </button>
                  {topic.status !== "已归档" && (
                    <button
                      className="btn btn-outline text-xs"
                      onClick={() => handleArchive(topic.id)}
                    >
                      归档
                    </button>
                  )}
                  <button
                    className="btn btn-outline text-xs text-red-500"
                    onClick={() => handleDelete(topic.id)}
                  >
                    删除
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
