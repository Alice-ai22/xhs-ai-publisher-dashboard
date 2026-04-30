"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { parseStringArray } from "@/lib/json-fields";

interface DashboardData {
  pendingTopics: number;
  draftCount: number;
  readyToPublish: number;
  published: number;
  dailyStats: Record<string, number>;
  todaySchedules: Array<{
    id: string;
    time: string;
    draft: { titles: string; status: string };
  }>;
}

const GUIDE_STEPS = [
  { icon: " ", label: "设置账号定位", href: "/profile", desc: "定义你的账号风格和目标用户" },
  { icon: " ", label: "创建选题", href: "/topics", desc: "规划内容方向和关键词" },
  { icon: "✨", label: "AI 生成内容", href: "/generate", desc: "一键生成标题、正文、标签" },
  { icon: " ", label: "审核草稿", href: "/drafts", desc: "检查内容质量和合规性" },
  { icon: " ", label: "手动发布", href: "/export", desc: "复制文案到小红书发布" },
];

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then((r) => {
        if (r.success) setData(r.data);
        else setError(r.error || "加载失败");
      })
      .catch(() => setError("网络请求失败，请检查服务是否正常运行"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-[var(--muted)]">加载中...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">工作台</h1>
        <div className="card text-center py-16">
          <p className="text-[var(--muted)] mb-4">{error || "加载失败"}</p>
          <button
            className="btn btn-primary"
            onClick={() => {
              setLoading(true);
              setError("");
              fetch("/api/dashboard")
                .then((r) => r.json())
                .then((r) => {
                  if (r.success) setData(r.data);
                  else setError(r.error || "加载失败");
                })
                .catch(() => setError("网络请求失败"))
                .finally(() => setLoading(false));
            }}
          >
            重新加载
          </button>
        </div>
        {/* 即使数据加载失败也显示引导 */}
        <OnboardingGuide />
      </div>
    );
  }

  const statCards = [
    {
      label: "待生成选题",
      value: data.pendingTopics,
      color: "bg-blue-50 text-blue-600",
      icon: " ",
      href: "/topics",
    },
    {
      label: "待审核草稿",
      value: data.draftCount,
      color: "bg-yellow-50 text-yellow-600",
      icon: " ",
      href: "/drafts",
    },
    {
      label: "待发布内容",
      value: data.readyToPublish,
      color: "bg-green-50 text-green-600",
      icon: " ",
      href: "/export",
    },
    {
      label: "已发布内容",
      value: data.published,
      color: "bg-purple-50 text-purple-600",
      icon: "✅",
      href: "/drafts",
    },
  ];

  const maxDaily = Math.max(...Object.values(data.dailyStats), 1);

  // 判断是否为新用户（没有任何数据）
  const isNewUser =
    data.pendingTopics === 0 &&
    data.draftCount === 0 &&
    data.readyToPublish === 0 &&
    data.published === 0;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">工作台</h1>
          <p className="text-sm text-[var(--muted)] mt-1">
            小红书 AI 内容生产与发布管理
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/topics" className="btn btn-outline">
            选题库
          </Link>
          <Link href="/generate" className="btn btn-primary">
            ✨ 新建内容
          </Link>
        </div>
      </div>

      {/* 新用户引导 */}
      {isNewUser && <OnboardingGuide />}

      {/* Stat Cards */}
      <div className="grid grid-cols-4 gap-4">
        {statCards.map((card) => (
          <Link key={card.label} href={card.href} className="card hover:border-[var(--primary)] transition-colors">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${card.color}`}
              >
                {card.icon}
              </div>
              <div>
                <p className="text-sm text-[var(--muted)]">{card.label}</p>
                <p className="text-2xl font-bold">{card.value}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* 7 天统计 */}
        <div className="card col-span-2">
          <h2 className="text-base font-semibold mb-4">最近 7 天生成趋势</h2>
          {Object.values(data.dailyStats).every((v) => v === 0) ? (
            <div className="flex items-center justify-center h-40 text-[var(--muted)] text-sm">
              暂无生成记录，去
              <Link href="/generate" className="text-[var(--info)] hover:underline mx-1">
                生成内容
              </Link>
              吧
            </div>
          ) : (
            <div className="flex items-end gap-2 h-40">
              {Object.entries(data.dailyStats).map(([date, count]) => (
                <div key={date} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs text-[var(--muted)]">{count}</span>
                  <div
                    className="w-full bg-[var(--primary)] rounded-t-md transition-all"
                    style={{
                      height: `${Math.max((count / maxDaily) * 120, 4)}px`,
                    }}
                  />
                  <span className="text-xs text-[var(--muted)]">
                    {date.slice(5)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 今日排期 */}
        <div className="card">
          <h2 className="text-base font-semibold mb-4">今日排期</h2>
          {data.todaySchedules.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-[var(--muted)] mb-2">今日暂无排期</p>
              <Link href="/calendar" className="text-xs text-[var(--info)] hover:underline">
                前往排期 →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {data.todaySchedules.map((s) => {
                const titles = parseStringArray(s.draft.titles);
                return (
                  <div
                    key={s.id}
                    className="flex items-center gap-3 p-2 rounded-lg bg-gray-50"
                  >
                    <span className="text-sm font-mono text-[var(--info)]">
                      {s.time}
                    </span>
                    <span className="text-sm truncate flex-1">
                      {titles[0] || "无标题"}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h2 className="text-base font-semibold mb-4">快捷操作</h2>
        <div className="grid grid-cols-4 gap-4">
          <Link
            href="/topics"
            className="p-4 rounded-lg border border-dashed border-[var(--border)] hover:border-[var(--primary)] hover:bg-red-50 transition-all text-center"
          >
            <span className="text-2xl block mb-2"> </span>
            <span className="text-sm font-medium">新建选题</span>
          </Link>
          <Link
            href="/generate"
            className="p-4 rounded-lg border border-dashed border-[var(--border)] hover:border-[var(--primary)] hover:bg-red-50 transition-all text-center"
          >
            <span className="text-2xl block mb-2">✨</span>
            <span className="text-sm font-medium">批量生成</span>
          </Link>
          <Link
            href="/drafts"
            className="p-4 rounded-lg border border-dashed border-[var(--border)] hover:border-[var(--primary)] hover:bg-red-50 transition-all text-center"
          >
            <span className="text-2xl block mb-2"> </span>
            <span className="text-sm font-medium">审核草稿</span>
          </Link>
          <Link
            href="/calendar"
            className="p-4 rounded-lg border border-dashed border-[var(--border)] hover:border-[var(--primary)] hover:bg-red-50 transition-all text-center"
          >
            <span className="text-2xl block mb-2"> </span>
            <span className="text-sm font-medium">发布日历</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

function OnboardingGuide() {
  return (
    <div className="card border-[var(--primary)]">
      <h2 className="text-base font-semibold mb-3">使用流程</h2>
      <div className="flex items-start gap-3">
        {GUIDE_STEPS.map((step, i) => (
          <div key={step.href} className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-6 h-6 rounded-full bg-[var(--primary)] text-white text-xs flex items-center justify-center font-bold">
                {i + 1}
              </span>
              <span className="text-2xl">{step.icon}</span>
            </div>
            <Link href={step.href} className="text-sm font-medium hover:text-[var(--primary)]">
              {step.label}
            </Link>
            <p className="text-xs text-[var(--muted)] mt-0.5">{step.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
