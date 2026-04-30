"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "工作台", icon: " " },
  { href: "/profile", label: "账号定位", icon: " " },
  { href: "/topics", label: "选题库", icon: " " },
  { href: "/generate", label: "内容生成", icon: "✨" },
  { href: "/drafts", label: "草稿审核", icon: " " },
  { href: "/calendar", label: "发布日历", icon: " " },
  { href: "/export", label: "发布助手", icon: " " },
  { href: "/settings", label: "系统设置", icon: "⚙️" },
  { href: "/logs", label: "生成日志", icon: " " },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 bg-white border-r border-[var(--border)] flex flex-col h-screen fixed left-0 top-0">
      {/* Logo */}
      <div className="p-5 border-b border-[var(--border)]">
        <h1 className="text-lg font-bold text-[var(--primary)]">
          小红书 AI 助手
        </h1>
        <p className="text-xs text-[var(--muted)] mt-1">内容生产与发布面板</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                isActive
                  ? "bg-[var(--primary)] text-white font-medium"
                  : "text-[var(--secondary)] hover:bg-gray-50"
              }`}
            >
              <span className="text-base">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-[var(--border)]">
        <p className="text-xs text-[var(--muted)] text-center">
          v1.0.0 · 本地部署版
        </p>
        <p className="text-xs text-[var(--muted)] text-center mt-1">
          内容需人工审核后发布
        </p>
      </div>
    </aside>
  );
}
