"use client";

import { useState, useEffect } from "react";

interface Settings {
  id?: string;
  aiBaseUrl: string;
  aiApiKey: string;
  textModel: string;
  imageModel: string;
  defaultCount: number;
  localSavePath: string;
  enableSensitiveCheck: boolean;
  enableAdCheck: boolean;
  officialApiAdapter: string;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    aiBaseUrl: "https://api.openai.com/v1",
    aiApiKey: "",
    textModel: "gpt-4o",
    imageModel: "dall-e-3",
    defaultCount: 3,
    localSavePath: "./data/assets",
    enableSensitiveCheck: true,
    enableAdCheck: true,
    officialApiAdapter: "",
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((r) => {
        if (r.success && r.data) {
          setSettings(r.data);
        }
      });
  }, []);

  async function handleSave() {
    setSaving(true);
    setMsg("");
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const r = await res.json();
      if (r.success) {
        setMsg("设置已保存");
      } else {
        setMsg("保存失败: " + r.error);
      }
    } catch (e) {
      setMsg("保存失败: " + String(e));
    }
    setSaving(false);
    setTimeout(() => setMsg(""), 3000);
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">系统设置</h1>

      {msg && (
        <div
          className={`p-3 rounded-lg text-sm ${
            msg.includes("失败")
              ? "bg-red-50 text-red-700"
              : "bg-green-50 text-green-700"
          }`}
        >
          {msg}
        </div>
      )}

      {/* AI API Settings */}
      <div className="card space-y-4">
        <h2 className="font-semibold">AI API 配置</h2>

        <div>
          <label className="block text-sm font-medium mb-1">
            API Base URL
          </label>
          <input
            className="input"
            value={settings.aiBaseUrl}
            onChange={(e) =>
              setSettings({ ...settings, aiBaseUrl: e.target.value })
            }
            placeholder="https://api.openai.com/v1"
          />
          <p className="text-xs text-[var(--muted)] mt-1">
            支持 OpenAI 兼容接口，如 OpenRouter、中转站等
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">API Key</label>
          <div className="relative">
            <input
              className="input pr-20"
              type={showKey ? "text" : "password"}
              value={settings.aiApiKey}
              onChange={(e) =>
                setSettings({ ...settings, aiApiKey: e.target.value })
              }
              placeholder="sk-..."
            />
            <button
              className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-[var(--info)]"
              onClick={() => setShowKey(!showKey)}
            >
              {showKey ? "隐藏" : "显示"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              文案模型
            </label>
            <input
              className="input"
              value={settings.textModel}
              onChange={(e) =>
                setSettings({ ...settings, textModel: e.target.value })
              }
              placeholder="gpt-4o"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              图片模型
            </label>
            <input
              className="input"
              value={settings.imageModel}
              onChange={(e) =>
                setSettings({ ...settings, imageModel: e.target.value })
              }
              placeholder="dall-e-3"
            />
          </div>
        </div>
      </div>

      {/* Generation Settings */}
      <div className="card space-y-4">
        <h2 className="font-semibold">生成设置</h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              默认生成标题数
            </label>
            <select
              className="input"
              value={settings.defaultCount}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  defaultCount: Number(e.target.value),
                })
              }
            >
              <option value={3}>3 个</option>
              <option value={5}>5 个</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              本地保存路径
            </label>
            <input
              className="input"
              value={settings.localSavePath}
              onChange={(e) =>
                setSettings({ ...settings, localSavePath: e.target.value })
              }
              placeholder="./data/assets"
            />
          </div>
        </div>
      </div>

      {/* Compliance Settings */}
      <div className="card space-y-4">
        <h2 className="font-semibold">合规检查</h2>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={settings.enableSensitiveCheck}
            onChange={(e) =>
              setSettings({
                ...settings,
                enableSensitiveCheck: e.target.checked,
              })
            }
            className="w-4 h-4"
          />
          <div>
            <span className="text-sm font-medium">启用敏感词检查</span>
            <p className="text-xs text-[var(--muted)]">
              自动检测内容中的敏感词汇并提醒
            </p>
          </div>
        </label>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={settings.enableAdCheck}
            onChange={(e) =>
              setSettings({ ...settings, enableAdCheck: e.target.checked })
            }
            className="w-4 h-4"
          />
          <div>
            <span className="text-sm font-medium">启用软广检查</span>
            <p className="text-xs text-[var(--muted)]">
              检测过度营销语气，避免触发平台审核
            </p>
          </div>
        </label>
      </div>

      {/* Official API (Reserved) */}
      <div className="card space-y-4">
        <h2 className="font-semibold">官方 API 适配器（预留）</h2>
        <div>
          <label className="block text-sm font-medium mb-1">
            官方 API 接口地址
          </label>
          <input
            className="input"
            value={settings.officialApiAdapter}
            onChange={(e) =>
              setSettings({
                ...settings,
                officialApiAdapter: e.target.value,
              })
            }
            placeholder="暂不可用，等待小红书官方开放 API"
            disabled
          />
          <p className="text-xs text-[var(--muted)] mt-1">
            此功能预留，待小红书官方开放笔记发布 API 后启用。当前版本不支持自动发布。
          </p>
        </div>
      </div>

      {/* Save */}
      <button
        className="btn btn-primary w-full py-3"
        onClick={handleSave}
        disabled={saving}
      >
        {saving ? "保存中..." : "保存设置"}
      </button>
    </div>
  );
}
