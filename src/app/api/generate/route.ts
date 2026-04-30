import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { callTextAI, callImageAI, parseAIResponse } from "@/lib/ai-client";
import { buildCopywritingPrompt } from "@/prompts/xhsCopywritingPrompt";
import { validateContent } from "@/lib/validation";
import { ok, badRequest, serverError } from "@/lib/api-response";
import { generateRequestSchema } from "@/lib/schemas";
import type { ContentType } from "@/types";

// POST - 生成内容
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = generateRequestSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest(
        parsed.error.issues.map((i) => i.message).join("; ")
      );
    }

    const {
      topicId,
      templateType,
      direction,
      content,
      keywords,
      withProduct,
      generateCover,
      generateImages,
      versionCount,
    } = parsed.data;

    // 获取默认用户画像
    const profile = await prisma.userProfile.findFirst({
      orderBy: { createdAt: "desc" },
    });

    if (!profile) {
      return badRequest("请先在「账号定位」页面创建账号定位后再生成内容", "NO_PROFILE");
    }

    // 获取 API 设置
    const settings = await prisma.apiSettings.findFirst();

    if (!settings?.aiApiKey) {
      return badRequest("请先在「系统设置」页面配置 AI API Key", "NO_API_KEY");
    }

    // 构建 prompt
    const prompt = buildCopywritingPrompt(
      profile,
      (templateType as ContentType) || "干货教程",
      direction || "",
      content || "",
      keywords || "",
      withProduct || false,
      versionCount
    );

    // 调用 AI 生成文案
    const { content: aiContent, tokensUsed } = await callTextAI([
      {
        role: "system",
        content:
          "你是一个小红书内容运营专家。请严格输出 JSON，不要输出 Markdown，不要输出 JSON 之外的任何文字。",
      },
      { role: "user", content: prompt },
    ]);

    // 解析 AI 返回结果
    const result = parseAIResponse(aiContent);

    // 内容合规检查
    const validation = validateContent(
      result.titles[0] || "",
      result.body,
      result.hashtags.join(","),
      profile.bannedWords,
      settings?.enableSensitiveCheck ?? true,
      settings?.enableAdCheck ?? true
    );

    // 合并合规警告
    if (validation.warnings.length > 0) {
      result.complianceWarnings = [
        ...result.complianceWarnings,
        ...validation.warnings,
      ];
    }
    if (validation.suggestions.length > 0) {
      result.publishChecklist = [
        ...result.publishChecklist,
        ...validation.suggestions,
      ];
    }

    // 生成封面图（如果配置了图片 API 且用户要求）
    let coverImageUrl = "";
    if (generateCover && settings?.aiApiKey) {
      try {
        const { url } = await callImageAI(
          result.coverImagePrompt,
          "1024x1024"
        );
        coverImageUrl = url;
      } catch {
        // 图片生成失败不影响文案生成
        result.complianceWarnings.push("封面图生成失败，请手动制作封面");
      }
    }

    // 生成正文配图（如果配置了图片 API 且用户要求）
    const contentImageUrls: string[] = [];
    if (generateImages && settings?.aiApiKey) {
      for (const imgPrompt of result.contentImagePrompts) {
        try {
          const { url } = await callImageAI(imgPrompt, "1024x1024");
          contentImageUrls.push(url);
        } catch {
          contentImageUrls.push("");
        }
      }
    }

    // 保存为草稿
    const draft = await prisma.draft.create({
      data: {
        titles: JSON.stringify(result.titles),
        hook: result.hook,
        body: result.body,
        bodyNoEmoji: result.bodyNoEmoji,
        hashtags: JSON.stringify(result.hashtags),
        coverText: result.coverText,
        coverImagePrompt: result.coverImagePrompt,
        coverImageUrl,
        contentImagePrompts: JSON.stringify(result.contentImagePrompts),
        contentImageUrls: JSON.stringify(contentImageUrls),
        commentGuide: result.commentGuide,
        complianceWarnings: JSON.stringify(result.complianceWarnings),
        publishChecklist: JSON.stringify(result.publishChecklist),
        riskDisclaimer: result.riskDisclaimer || "",
        templateType: templateType || "干货教程",
        status: "Draft",
        profileId: profile.id,
        topicId: topicId || null,
      },
      include: { topic: true, profile: true },
    });

    // 如果关联了选题，更新选题状态
    if (topicId) {
      await prisma.topic.update({
        where: { id: topicId },
        data: { status: "已生成" },
      });
    }

    return ok({
      draft,
      result,
      tokensUsed,
      validation,
    });
  } catch (error) {
    return serverError(error);
  }
}
