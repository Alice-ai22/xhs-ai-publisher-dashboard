import type { UserProfile } from "@prisma/client";
import type { ContentType } from "@/types";
import { getTemplate } from "./contentTemplates";

/**
 * 构建小红书内容生成 Prompt
 *
 * 基于用户提供的专业 prompt 模板，结合 5 种内容模板的结构化要求。
 * 输出纯 JSON，不包裹 markdown 代码块。
 */
export function buildCopywritingPrompt(
  profile: UserProfile,
  templateType: ContentType,
  direction: string,
  content: string,
  keywords: string,
  withProduct: boolean,
  versionCount: number
): string {
  const template = getTemplate(templateType);

  const bannedWordsList = profile.bannedWords
    ? profile.bannedWords
        .split(",")
        .map((w) => w.trim())
        .filter(Boolean)
    : [];

  const structureGuide = template.structure
    .map((s, i) => `${i + 1}. ${s}`)
    .join("\n");

  const titleExamples = template.titleStyles
    .map((t) => `  - "${t}"`)
    .join("\n");

  return `你是一个小红书内容运营专家，请根据以下信息生成小红书笔记内容。

## 账号定位
- 账号名称：${profile.name}
- 账号定位：${profile.positioning}
- 目标用户：${profile.targetAudience}
- 内容风格：${profile.contentStyle}
- 产品/服务介绍：${profile.productInfo}
- 引流链接：${profile.referralLink || "无"}
- 软广强度：${profile.adIntensity}
- 是否允许营销语气：${profile.allowMarketing ? "是" : "否"}
- 文案长度：${profile.defaultLength === "短" ? "200-400字" : profile.defaultLength === "中" ? "400-800字" : "800-1200字"}

## 今日选题
- 内容模板：【${template.label}】
- 模板说明：${template.description}
- 选题方向：${direction}
- 用户输入的大概内容：${content || "请根据选题方向自行发挥"}
- 关键词：${keywords || "无"}
- 是否带产品引流：${withProduct ? "是" : "否"}

## 内容结构要求（${template.label}）
请严格按照以下结构组织内容：
${structureGuide}

## 标题风格参考（${template.label}）
标题需要像真实小红书用户写的，不要像广告。参考以下风格：
${titleExamples}

## 引流植入方式
${template.adApproach}
${withProduct ? "本次需要带产品引流，请在合适的位置自然植入产品信息。" : "本次不带产品引流，专注内容价值。"}

## 生成要求
1. 生成 ${versionCount} 个标题，标题要像真实小红书用户写的，不要像广告。每个标题控制在 20 字以内。
2. 正文要有开头钩子，前 3 秒吸引人。
3. 正文要分段，适合手机阅读。
4. 适当使用 emoji，但不要过多。
5. 给出一个无 emoji 版本。
6. 给出 8-15 个话题标签。
7. 给出封面图大字标题（6-10 个字）。
8. 给出封面图提示词，适合 4:5 小红书封面，用于 Midjourney/DALL-E/即梦/可灵。
9. 给出 3-6 张正文配图提示词。
10. 给出评论区置顶引导语，语气自然亲切，不能太营销。
11. 给出合规风险提醒。
12. 给出发布前检查清单。
13. 给出一段简短的风险提示文案，提醒读者理性判断。

## 禁止事项（必须严格遵守）
- 不要夸大收益。
- 不要承诺稳赚。
- 不要虚假宣传。
- 不要说"官方合作""官方授权""官方推荐"。
- 不要使用"全网最低""永久稳定""绝对安全""100%""万能"等绝对化词汇。
- 不要诱导用户进行违规操作。
- 不要生成绕过平台规则的内容。
- 不要贬低竞品，对比时客观陈述。
- 不要伪装官方身份。
${bannedWordsList.length > 0 ? `- 以下词汇也必须避免使用：${bannedWordsList.join("、")}` : ""}

## 输出要求
请严格输出 JSON，不要输出 Markdown，不要输出 JSON 之外的任何文字，不要用 \`\`\`json 包裹。

{
  "titles": ["标题1", "标题2", "标题3"],
  "hook": "开头钩子，1-2句话，用好奇心或共鸣吸引读者继续阅读",
  "body": "完整正文（带表情符号版本），按照内容结构要求分段，每段之间空一行",
  "bodyNoEmoji": "完整正文（无表情符号版本），结构与带表情版本一致",
  "hashtags": ["标签1", "标签2", "标签3"],
  "coverText": "封面上的大标题文字，6-10个字，简洁有力",
  "coverImagePrompt": "封面图的AI绘图提示词，小红书封面风格、干净高级感、4:5竖版比例",
  "contentImagePrompts": ["配图1提示词", "配图2提示词", "配图3提示词"],
  "commentGuide": "评论区置顶话术，引导用户互动或私信",
  "complianceWarnings": ["可能的合规风险点"],
  "publishChecklist": ["发布前检查事项"],
  "riskDisclaimer": "一段简短的风险提示文案"
}`;
}
