"use client";

import { useState, useEffect } from "react";

interface Profile {
  id: string;
  name: string;
  positioning: string;
  targetAudience: string;
  contentStyle: string;
  bannedWords: string;
  commonTags: string;
  productInfo: string;
  referralLink: string;
  adIntensity: string;
  allowMarketing: boolean;
  defaultLength: string;
}

const emptyProfile: Omit<Profile, "id"> = {
  name: "",
  positioning: "",
  targetAudience: "",
  contentStyle: "",
  bannedWords: "",
  commonTags: "",
  productInfo: "",
  referralLink: "",
  adIntensity: "中",
  allowMarketing: false,
  defaultLength: "中",
};

export default function ProfilePage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [form, setForm] = useState(emptyProfile);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    loadProfiles();
  }, []);

  function loadProfiles() {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((r) => {
        if (r.success) setProfiles(r.data);
      });
  }

  async function handleSave() {
    setSaving(true);
    setMsg("");
    try {
      const method = editingId ? "PUT" : "POST";
      const body = editingId ? { ...form, id: editingId } : form;
      const res = await fetch("/api/profile", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const r = await res.json();
      if (r.success) {
        setMsg(editingId ? "更新成功！" : "创建成功！");
        setForm(emptyProfile);
        setEditingId(null);
        loadProfiles();
      } else {
        setMsg("保存失败: " + r.error);
      }
    } catch (e) {
      setMsg("保存失败: " + String(e));
    }
    setSaving(false);
  }

  function handleEdit(profile: Profile) {
    setEditingId(profile.id);
    setForm({
      name: profile.name,
      positioning: profile.positioning,
      targetAudience: profile.targetAudience,
      contentStyle: profile.contentStyle,
      bannedWords: profile.bannedWords,
      commonTags: profile.commonTags,
      productInfo: profile.productInfo,
      referralLink: profile.referralLink,
      adIntensity: profile.adIntensity,
      allowMarketing: profile.allowMarketing,
      defaultLength: profile.defaultLength,
    });
  }

  async function handleDelete(id: string) {
    if (!confirm("确定删除此账号定位？")) return;
    await fetch(`/api/profile?id=${id}`, { method: "DELETE" });
    loadProfiles();
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">账号定位设置</h1>

      {msg && (
        <div className="p-3 rounded-lg bg-blue-50 text-blue-700 text-sm">
          {msg}
        </div>
      )}

      {/* Form */}
      <div className="card space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">账号名称</label>
            <input
              className="input"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="如：AI工具分享号"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">内容风格</label>
            <input
              className="input"
              value={form.contentStyle}
              onChange={(e) =>
                setForm({ ...form, contentStyle: e.target.value })
              }
              placeholder="如：干货实用、轻松亲切"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">账号定位</label>
          <textarea
            className="input"
            value={form.positioning}
            onChange={(e) =>
              setForm({ ...form, positioning: e.target.value })
            }
            placeholder="描述你的账号定位，如：分享实用AI工具和效率提升方法的知识博主"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">目标用户</label>
          <textarea
            className="input"
            value={form.targetAudience}
            onChange={(e) =>
              setForm({ ...form, targetAudience: e.target.value })
            }
            placeholder="如：20-35岁职场人、自由职业者"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">产品/服务介绍</label>
          <textarea
            className="input"
            value={form.productInfo}
            onChange={(e) =>
              setForm({ ...form, productInfo: e.target.value })
            }
            placeholder="你的产品或服务介绍"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">常用标签</label>
            <input
              className="input"
              value={form.commonTags}
              onChange={(e) =>
                setForm({ ...form, commonTags: e.target.value })
              }
              placeholder="#AI工具,#效率提升,#副业"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">引流链接</label>
            <input
              className="input"
              value={form.referralLink}
              onChange={(e) =>
                setForm({ ...form, referralLink: e.target.value })
              }
              placeholder="https://..."
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">禁用词</label>
          <input
            className="input"
            value={form.bannedWords}
            onChange={(e) =>
              setForm({ ...form, bannedWords: e.target.value })
            }
            placeholder="用逗号分隔，如：最好,第一,必须,绝对"
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">软广强度</label>
            <select
              className="input"
              value={form.adIntensity}
              onChange={(e) =>
                setForm({ ...form, adIntensity: e.target.value })
              }
            >
              <option value="低">低 - 几乎不植入</option>
              <option value="中">中 - 自然植入</option>
              <option value="高">高 - 明确推荐</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">默认文案长度</label>
            <select
              className="input"
              value={form.defaultLength}
              onChange={(e) =>
                setForm({ ...form, defaultLength: e.target.value })
              }
            >
              <option value="短">短 (200-400字)</option>
              <option value="中">中 (400-800字)</option>
              <option value="长">长 (800-1200字)</option>
            </select>
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.allowMarketing}
                onChange={(e) =>
                  setForm({ ...form, allowMarketing: e.target.checked })
                }
                className="w-4 h-4"
              />
              <span className="text-sm">允许使用营销语气</span>
            </label>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? "保存中..." : editingId ? "更新" : "创建"}
          </button>
          {editingId && (
            <button
              className="btn btn-outline"
              onClick={() => {
                setEditingId(null);
                setForm(emptyProfile);
              }}
            >
              取消编辑
            </button>
          )}
        </div>
      </div>

      {/* Profile List */}
      {profiles.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">已保存的账号定位</h2>
          {profiles.map((p) => (
            <div key={p.id} className="card flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold">{p.name}</h3>
                <p className="text-sm text-[var(--muted)] mt-1">
                  {p.positioning}
                </p>
                <div className="flex gap-2 mt-2">
                  <span className="tag tag-draft">{p.adIntensity}软广</span>
                  <span className="tag tag-draft">{p.defaultLength}文案</span>
                  {p.allowMarketing && (
                    <span className="tag tag-ready">允许营销</span>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  className="btn btn-outline text-xs"
                  onClick={() => handleEdit(p)}
                >
                  编辑
                </button>
                <button
                  className="btn btn-outline text-xs text-red-500"
                  onClick={() => handleDelete(p.id)}
                >
                  删除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
