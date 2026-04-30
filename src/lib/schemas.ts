import { z } from "zod";

// ── 通用枚举 ──

const contentTypeSchema = z.enum([
  "干货教程",
  "避坑指南",
  "人设故事",
  "工具评测",
  "引流软广",
]);

const draftStatusSchema = z.enum([
  "Draft",
  "NeedsEdit",
  "ReadyToPublish",
  "Published",
]);

const topicStatusSchema = z.enum(["未生成", "已生成", "已归档"]);

// ── /api/generate ──

export const generateRequestSchema = z.object({
  topicId: z.string().uuid().optional().or(z.literal("")),
  templateType: contentTypeSchema.optional().default("干货教程"),
  direction: z.string().max(500).optional().default(""),
  content: z.string().max(5000).optional().default(""),
  keywords: z.string().max(300).optional().default(""),
  withProduct: z.boolean().optional().default(false),
  generateCover: z.boolean().optional().default(false),
  generateImages: z.boolean().optional().default(false),
  versionCount: z.number().int().min(1).max(10).optional().default(3),
});

// ── /api/topics ──

export const topicCreateSchema = z.object({
  title: z.string().min(1, "标题不能为空").max(200),
  direction: z.string().min(1, "选题方向不能为空").max(500),
  targetAudience: z.string().max(300).optional().default(""),
  keywords: z.string().max(500).optional().default(""),
  referenceContent: z.string().max(5000).optional().default(""),
  productHook: z.string().max(500).optional().default(""),
  contentType: contentTypeSchema,
  profileId: z.string().uuid().optional().nullable(),
});

export const topicUpdateSchema = topicCreateSchema.partial().extend({
  id: z.string().uuid(),
  status: topicStatusSchema.optional(),
});

// ── /api/drafts ──

export const draftUpdateSchema = z.object({
  id: z.string().uuid(),
  status: draftStatusSchema.optional(),
  titles: z.string().optional(),
  body: z.string().optional(),
  bodyNoEmoji: z.string().optional(),
  hashtags: z.string().optional(),
  hook: z.string().optional(),
  coverText: z.string().optional(),
  coverImagePrompt: z.string().optional(),
  commentGuide: z.string().optional(),
  riskDisclaimer: z.string().optional(),
  scheduledDate: z.string().optional(),
  scheduledTime: z.string().optional(),
  publishLink: z.string().optional(),
  publishNote: z.string().optional(),
  publishPlatform: z.string().optional(),
  actualTitle: z.string().optional(),
  actualTags: z.string().optional(),
});

// ── /api/settings ──

export const settingsUpdateSchema = z.object({
  aiBaseUrl: z.string().url().optional().or(z.literal("")),
  aiApiKey: z.string().max(500).optional().default(""),
  textModel: z.string().max(100).optional().default("gpt-4o"),
  imageModel: z.string().max(100).optional().default("dall-e-3"),
  defaultCount: z.number().int().min(1).max(10).optional().default(3),
  localSavePath: z.string().max(500).optional().default("./data/assets"),
  enableSensitiveCheck: z.boolean().optional().default(true),
  enableAdCheck: z.boolean().optional().default(true),
  officialApiAdapter: z.string().max(500).optional().default(""),
});

// ── /api/profile ──

export const profileCreateSchema = z.object({
  name: z.string().min(1, "账号名称不能为空").max(100),
  positioning: z.string().min(1, "账号定位不能为空").max(1000),
  targetAudience: z.string().max(1000).optional().default(""),
  contentStyle: z.string().max(500).optional().default(""),
  bannedWords: z.string().max(1000).optional().default(""),
  commonTags: z.string().max(1000).optional().default(""),
  productInfo: z.string().max(2000).optional().default(""),
  referralLink: z.string().max(500).optional().default(""),
  adIntensity: z.enum(["低", "中", "高"]).optional().default("中"),
  allowMarketing: z.boolean().optional().default(false),
  defaultLength: z.enum(["短", "中", "长"]).optional().default("中"),
});

export const profileUpdateSchema = profileCreateSchema.partial().extend({
  id: z.string().uuid(),
});

// ── /api/schedule ──

export const scheduleCreateSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "日期格式应为 YYYY-MM-DD"),
  time: z.string().regex(/^\d{2}:\d{2}$/, "时间格式应为 HH:MM"),
  sortOrder: z.number().int().optional().default(0),
  draftId: z.string().uuid(),
});

export const scheduleUpdateSchema = scheduleCreateSchema.partial().extend({
  id: z.string().uuid(),
});
