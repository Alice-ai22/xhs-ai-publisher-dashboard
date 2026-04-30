"use client";

import { useState, useEffect } from "react";

interface LogEntry {
  id: string;
  type: string;
  input: string;
  output: string;
  status: string;
  errorMsg: string;
  tokensUsed: number;
  duration: number;
  createdAt: string;
}

const STATUS_LABELS: Record<string, string> = {
  success: "成功",
  error: "失败",
  pending: "进行中",
};

const STATUS_COLORS: Record<string, string> = {
  success: "bg-green-50 text-green-700",
  error: "bg-red-50 text-red-700",
  pending: "bg-yellow-50 text-yellow-700",
};

export default function LogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    loadLogs();
  }, []);

  function loadLogs() {
    setLoading(true);
    fetch("/api/logs?limit=100")
      .then((r) => r.json())
      .then((r) => {
        if (r.success) setLogs(r.data);
      })
      .finally(() => setLoading(false));
  }

  const filtered = filter === "all" ? logs : logs.filter((l) => l.status === filter);

  function formatDuration(ms: number) {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  }

  function formatTime(dateStr: string) {
    return new Date(dateStr).toLocaleString("zh-CN");
  }

  function truncateInput(input: string, maxLen = 100) {
    try {
      const parsed = JSON.parse(input);
      if (Array.isArray(parsed)) {
        const userMsg = parsed.find((m: { role: string }) => m.role === "user");
        if (userMsg?.content) {
          const content = userMsg.content as string;
          return content.length > maxLen ? content.slice(0, maxLen) + "..." : content;
        }
      }
    } catch {
      // 不是 JSON，直接截断
    }
    return input.length > maxLen ? input.slice(0, maxLen) + "..." : input;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">生成日志</h1>
          <p className="text-sm text-[var(--muted)] mt-1">
            查看 AI 调用记录，排查生成失败原因
          </p>
        </div>
        <button className="btn btn-outline" onClick={loadLogs}>
          刷新
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {["all", "error", "success"].map((f) => (
          <button
            key={f}
            className={`btn text-xs ${filter === f ? "btn-primary" : "btn-outline"}`}
            onClick={() => setFilter(f)}
          >
            {f === "all" ? "全部" : STATUS_LABELS[f] || f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="card text-center py-12 text-[var(--muted)]">
          加载中...
        </div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-[var(--muted)] mb-2">
            {filter === "all" ? "暂无日志记录" : `没有${STATUS_LABELS[filter]}的日志`}
          </p>
          {filter === "all" && (
            <p className="text-sm text-[var(--muted)]">
              去
              <a href="/generate" className="text-[var(--info)] hover:underline mx-1">
                内容生成
              </a>
              页面生成内容后，日志会自动记录在这里。
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((log) => {
            const isExpanded = expandedId === log.id;
            return (
              <div key={log.id} className="card">
                <div
                  className="flex items-center gap-3 cursor-pointer"
                  onClick={() => setExpandedId(isExpanded ? null : log.id)}
                >
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-medium ${
                      STATUS_COLORS[log.status] || "bg-gray-100"
                    }`}
                  >
                    {STATUS_LABELS[log.status] || log.status}
                  </span>
                  <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                    {log.type === "text" ? "文案" : "图片"}
                  </span>
                  <span className="text-sm text-[var(--secondary)] flex-1 truncate">
                    {log.status === "error"
                      ? log.errorMsg || "未知错误"
                      : truncateInput(log.input)}
                  </span>
                  <span className="text-xs text-[var(--muted)] shrink-0">
                    {log.tokensUsed > 0 && `${log.tokensUsed} tokens · `}
                    {formatDuration(log.duration)}
                  </span>
                  <span className="text-xs text-[var(--muted)] shrink-0">
                    {formatTime(log.createdAt)}
                  </span>
                  <span className="text-xs text-[var(--info)]">
                    {isExpanded ? "收起" : "详情"}
                  </span>
                </div>

                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-[var(--border)] space-y-3">
                    {log.status === "error" && log.errorMsg && (
                      <div>
                        <h4 className="text-sm font-medium text-red-600 mb-1">
                          错误信息
                        </h4>
                        <p className="text-sm p-2 bg-red-50 rounded text-red-700 whitespace-pre-wrap">
                          {log.errorMsg}
                        </p>
                      </div>
                    )}
                    <div>
                      <h4 className="text-sm font-medium text-[var(--muted)] mb-1">
                        输入
                      </h4>
                      <pre className="text-xs p-2 bg-gray-50 rounded overflow-x-auto max-h-40 overflow-y-auto whitespace-pre-wrap">
                        {log.input.length > 2000
                          ? log.input.slice(0, 2000) + "\n...(截断)"
                          : log.input}
                      </pre>
                    </div>
                    {log.output && (
                      <div>
                        <h4 className="text-sm font-medium text-[var(--muted)] mb-1">
                          输出
                        </h4>
                        <pre className="text-xs p-2 bg-gray-50 rounded overflow-x-auto max-h-40 overflow-y-auto whitespace-pre-wrap">
                          {log.output.length > 2000
                            ? log.output.slice(0, 2000) + "\n...(截断)"
                            : log.output}
                        </pre>
                      </div>
                    )}
                    <div className="flex gap-4 text-xs text-[var(--muted)]">
                      <span>Token 消耗: {log.tokensUsed}</span>
                      <span>耗时: {formatDuration(log.duration)}</span>
                      <span>时间: {formatTime(log.createdAt)}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
