import { prisma } from "./prisma";
import type { CopywritingResult } from "@/types";

// ============================================================
// AI 客户端 - 支持 OpenAI 和 Anthropic 两种 API 格式
// ============================================================

interface AIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface Settings {
  aiBaseUrl: string;
  aiApiKey: string;
  textModel: string;
  imageModel: string;
}

async function getSettings(): Promise<Settings> {
  const settings = await prisma.apiSettings.findFirst();
  return (
    settings || {
      aiBaseUrl: "https://api.openai.com/v1",
      aiApiKey: "",
      textModel: "gpt-4o",
      imageModel: "dall-e-3",
    }
  );
}

/**
 * 检测 API 类型：Anthropic 还是 OpenAI 兼容
 */
function detectApiType(
  baseUrl: string
): "anthropic" | "openai" {
  const url = baseUrl.toLowerCase();
  if (url.includes("anthropic") || url.includes("/anthropic")) {
    return "anthropic";
  }
  return "openai";
}

// ── Anthropic 格式调用 ──

interface AnthropicResponse {
  id: string;
  type: string;
  role: string;
  content: Array<{ type: string; text?: string }>;
  usage: { input_tokens: number; output_tokens: number };
}

async function callAnthropicText(
  settings: Settings,
  messages: AIMessage[]
): Promise<{ content: string; tokensUsed: number }> {
  // Anthropic 的 system message 是顶层字段，不在 messages 数组里
  const systemMsg = messages.find((m) => m.role === "system");
  const userMessages = messages
    .filter((m) => m.role !== "system")
    .map((m) => ({ role: m.role, content: m.content }));

  const url = `${settings.aiBaseUrl}/v1/messages`;

  const body: Record<string, unknown> = {
    model: settings.textModel,
    max_tokens: 4000,
    messages: userMessages,
  };
  if (systemMsg) {
    body.system = systemMsg.content;
  }

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": settings.aiApiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Anthropic API 调用失败 (${response.status}): ${errorText}`
    );
  }

  const data: AnthropicResponse = await response.json();
  const textBlock = data.content?.find((b) => b.type === "text");
  const content = textBlock?.text || "";
  const tokensUsed =
    (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0);

  return { content, tokensUsed };
}

// ── OpenAI 兼容格式调用 ──

interface OpenAIResponse {
  choices: { message: { content: string } }[];
  usage?: { total_tokens: number };
}

async function callOpenAIText(
  settings: Settings,
  messages: AIMessage[]
): Promise<{ content: string; tokensUsed: number }> {
  const url = `${settings.aiBaseUrl}/chat/completions`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${settings.aiApiKey}`,
    },
    body: JSON.stringify({
      model: settings.textModel,
      messages,
      temperature: 0.8,
      max_tokens: 4000,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `OpenAI API 调用失败 (${response.status}): ${errorText}`
    );
  }

  const data: OpenAIResponse = await response.json();
  const content = data.choices?.[0]?.message?.content || "";
  const tokensUsed = data.usage?.total_tokens || 0;

  return { content, tokensUsed };
}

// ── 统一调用入口 ──

export async function callTextAI(
  messages: AIMessage[]
): Promise<{ content: string; tokensUsed: number }> {
  const settings = await getSettings();

  if (!settings.aiApiKey) {
    throw new Error("未配置 AI API Key，请先在设置页面配置");
  }

  const apiType = detectApiType(settings.aiBaseUrl);
  const startTime = Date.now();

  try {
    const { content, tokensUsed } =
      apiType === "anthropic"
        ? await callAnthropicText(settings, messages)
        : await callOpenAIText(settings, messages);

    await prisma.generationLog.create({
      data: {
        type: "text",
        input: JSON.stringify(messages),
        output: content,
        status: "success",
        tokensUsed,
        duration: Date.now() - startTime,
      },
    });

    return { content, tokensUsed };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "未知错误";

    await prisma.generationLog.create({
      data: {
        type: "text",
        input: JSON.stringify(messages),
        status: "error",
        errorMsg,
        duration: Date.now() - startTime,
      },
    });

    throw error;
  }
}

// ── 图片生成（仅 OpenAI 兼容格式） ──

export async function callImageAI(
  prompt: string,
  size: string = "1024x1024"
): Promise<{ url: string }> {
  const settings = await getSettings();

  if (!settings.aiApiKey) {
    throw new Error("未配置 AI API Key，请先在设置页面配置");
  }

  const apiType = detectApiType(settings.aiBaseUrl);
  if (apiType === "anthropic") {
    throw new Error(
      "Anthropic API 不支持图片生成，请使用 OpenAI 兼容的图片模型"
    );
  }

  const startTime = Date.now();

  try {
    const response = await fetch(
      `${settings.aiBaseUrl}/images/generations`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${settings.aiApiKey}`,
        },
        body: JSON.stringify({
          model: settings.imageModel,
          prompt,
          n: 1,
          size,
          quality: "high",
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `图片生成 API 调用失败 (${response.status}): ${errorText}`
      );
    }

    const data = await response.json();
    const url = data.data?.[0]?.url || "";

    await prisma.generationLog.create({
      data: {
        type: "image",
        input: prompt,
        output: url,
        status: "success",
        duration: Date.now() - startTime,
      },
    });

    return { url };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "未知错误";

    await prisma.generationLog.create({
      data: {
        type: "image",
        input: prompt,
        status: "error",
        errorMsg,
        duration: Date.now() - startTime,
      },
    });

    throw error;
  }
}

// ── JSON 解析 ──

export function parseAIResponse(content: string): CopywritingResult {
  let jsonStr = content.trim();
  if (jsonStr.startsWith("```")) {
    jsonStr = jsonStr
      .replace(/^```(?:json)?\s*\n?/, "")
      .replace(/\n?```\s*$/, "")
      .trim();
  }

  try {
    const parsed = JSON.parse(jsonStr);
    return {
      titles: parsed.titles || [],
      hook: parsed.hook || "",
      body: parsed.body || "",
      bodyNoEmoji: parsed.bodyNoEmoji || "",
      hashtags: parsed.hashtags || [],
      coverText: parsed.coverText || "",
      coverImagePrompt: parsed.coverImagePrompt || "",
      contentImagePrompts: parsed.contentImagePrompts || [],
      commentGuide: parsed.commentGuide || "",
      complianceWarnings: parsed.complianceWarnings || [],
      publishChecklist: parsed.publishChecklist || [],
      riskDisclaimer: parsed.riskDisclaimer || "",
    };
  } catch {
    throw new Error("AI 返回的内容无法解析为 JSON，请重试");
  }
}
