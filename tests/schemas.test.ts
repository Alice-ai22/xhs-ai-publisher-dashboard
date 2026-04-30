import { describe, it, expect } from "vitest";
import {
  generateRequestSchema,
  topicCreateSchema,
  topicUpdateSchema,
  draftUpdateSchema,
  settingsUpdateSchema,
  profileCreateSchema,
  scheduleCreateSchema,
} from "../src/lib/schemas";

describe("generateRequestSchema", () => {
  it("接受最小请求", () => {
    const result = generateRequestSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("接受完整请求", () => {
    const result = generateRequestSchema.safeParse({
      templateType: "干货教程",
      direction: "AI 工具教程",
      content: "详细内容",
      keywords: "AI,工具",
      withProduct: true,
      generateCover: false,
      generateImages: false,
      versionCount: 5,
    });
    expect(result.success).toBe(true);
  });

  it("拒绝无效模板类型", () => {
    const result = generateRequestSchema.safeParse({
      templateType: "不存在的类型",
    });
    expect(result.success).toBe(false);
  });

  it("拒绝 versionCount 超出范围", () => {
    const result = generateRequestSchema.safeParse({
      versionCount: 100,
    });
    expect(result.success).toBe(false);
  });
});

describe("topicCreateSchema", () => {
  it("接受有效选题", () => {
    const result = topicCreateSchema.safeParse({
      title: "测试选题",
      direction: "AI 工具教程",
      contentType: "干货教程",
    });
    expect(result.success).toBe(true);
  });

  it("拒绝空标题", () => {
    const result = topicCreateSchema.safeParse({
      title: "",
      direction: "方向",
      contentType: "干货教程",
    });
    expect(result.success).toBe(false);
  });

  it("拒绝缺少必填字段", () => {
    const result = topicCreateSchema.safeParse({
      title: "标题",
    });
    expect(result.success).toBe(false);
  });

  it("拒绝无效内容类型", () => {
    const result = topicCreateSchema.safeParse({
      title: "标题",
      direction: "方向",
      contentType: "无效类型",
    });
    expect(result.success).toBe(false);
  });
});

describe("topicUpdateSchema", () => {
  it("接受只更新 id", () => {
    const result = topicUpdateSchema.safeParse({
      id: "550e8400-e29b-41d4-a716-446655440000",
    });
    expect(result.success).toBe(true);
  });

  it("拒绝缺少 id", () => {
    const result = topicUpdateSchema.safeParse({
      title: "新标题",
    });
    expect(result.success).toBe(false);
  });

  it("接受更新状态", () => {
    const result = topicUpdateSchema.safeParse({
      id: "550e8400-e29b-41d4-a716-446655440000",
      status: "已归档",
    });
    expect(result.success).toBe(true);
  });
});

describe("draftUpdateSchema", () => {
  it("接受更新 id 和状态", () => {
    const result = draftUpdateSchema.safeParse({
      id: "550e8400-e29b-41d4-a716-446655440000",
      status: "ReadyToPublish",
    });
    expect(result.success).toBe(true);
  });

  it("拒绝无效状态", () => {
    const result = draftUpdateSchema.safeParse({
      id: "550e8400-e29b-41d4-a716-446655440000",
      status: "InvalidStatus",
    });
    expect(result.success).toBe(false);
  });

  it("拒绝缺少 id", () => {
    const result = draftUpdateSchema.safeParse({
      status: "Draft",
    });
    expect(result.success).toBe(false);
  });
});

describe("settingsUpdateSchema", () => {
  it("接受空对象（全用默认值）", () => {
    const result = settingsUpdateSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("接受完整设置", () => {
    const result = settingsUpdateSchema.safeParse({
      aiBaseUrl: "https://api.openai.com/v1",
      aiApiKey: "sk-test",
      textModel: "gpt-4o",
      imageModel: "dall-e-3",
      defaultCount: 5,
      localSavePath: "./data/assets",
      enableSensitiveCheck: true,
      enableAdCheck: false,
    });
    expect(result.success).toBe(true);
  });

  it("接受空 URL 字符串", () => {
    const result = settingsUpdateSchema.safeParse({
      aiBaseUrl: "",
    });
    expect(result.success).toBe(true);
  });
});

describe("profileCreateSchema", () => {
  it("接受最小画像", () => {
    const result = profileCreateSchema.safeParse({
      name: "测试账号",
      positioning: "AI 工具分享",
    });
    expect(result.success).toBe(true);
  });

  it("拒绝空名称", () => {
    const result = profileCreateSchema.safeParse({
      name: "",
      positioning: "定位",
    });
    expect(result.success).toBe(false);
  });

  it("拒绝无效软广强度", () => {
    const result = profileCreateSchema.safeParse({
      name: "账号",
      positioning: "定位",
      adIntensity: "超高",
    });
    expect(result.success).toBe(false);
  });
});

describe("scheduleCreateSchema", () => {
  it("接受有效排期", () => {
    const result = scheduleCreateSchema.safeParse({
      date: "2026-04-30",
      time: "12:00",
      draftId: "550e8400-e29b-41d4-a716-446655440000",
    });
    expect(result.success).toBe(true);
  });

  it("拒绝无效日期格式", () => {
    const result = scheduleCreateSchema.safeParse({
      date: "2026/04/30",
      time: "12:00",
      draftId: "550e8400-e29b-41d4-a716-446655440000",
    });
    expect(result.success).toBe(false);
  });

  it("拒绝无效时间格式", () => {
    const result = scheduleCreateSchema.safeParse({
      date: "2026-04-30",
      time: "noon",
      draftId: "550e8400-e29b-41d4-a716-446655440000",
    });
    expect(result.success).toBe(false);
  });
});
