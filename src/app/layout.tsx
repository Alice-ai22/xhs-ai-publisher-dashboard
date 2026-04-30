import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";

export const metadata: Metadata = {
  title: "小红书 AI 内容助手",
  description: "小红书 AI 内容生产与半自动发布面板",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 ml-60 p-6 bg-[var(--background)]">
          {children}
        </main>
      </body>
    </html>
  );
}
