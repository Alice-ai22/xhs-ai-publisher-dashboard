import type { PublishPackage } from "@/types";

export function generateMarkdown(pkg: PublishPackage): string {
  let md = `# 小红书发布包

## 标题
${pkg.title}

## 正文
${pkg.body}

## 标签
${pkg.hashtags.map((t) => `#${t}`).join(" ")}

## 封面图提示词
${pkg.coverPrompt}

## 正文配图提示词
${pkg.imagePrompts.map((p, i) => `### 配图 ${i + 1}\n${p}`).join("\n\n")}

## 评论区置顶话术
${pkg.commentGuide || "无"}

## 发布注意事项
${pkg.publishChecklist.map((item) => `- ${item}`).join("\n")}`;

  if (pkg.riskDisclaimer) {
    md += `\n\n## 风险提示（建议附在正文末尾或评论区）\n${pkg.riskDisclaimer}`;
  }

  md += `\n\n---\n*由 xhs-ai-publisher-dashboard 生成*`;
  return md;
}

export function generateNoteJson(
  pkg: PublishPackage,
  profileName: string
): Record<string, unknown> {
  return {
    title: pkg.title,
    body: pkg.body,
    hashtags: pkg.hashtags,
    coverPrompt: pkg.coverPrompt,
    imagePrompts: pkg.imagePrompts,
    commentGuide: pkg.commentGuide || "",
    riskDisclaimer: pkg.riskDisclaimer || "",
    publishChecklist: pkg.publishChecklist,
    account: profileName,
    generatedAt: new Date().toISOString(),
    platform: "xiaohongshu",
    note: "此文件仅供参考，请通过小红书官方渠道发布",
  };
}

