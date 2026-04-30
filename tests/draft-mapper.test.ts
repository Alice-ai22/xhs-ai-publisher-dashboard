import { describe, it, expect } from "vitest";
import { toDraftViewModel, toDraftViewModels } from "../src/lib/draft-mapper";

describe("toDraftViewModel", () => {
  const rawDraft = {
    id: "test-id",
    titles: '["标题1","标题2"]',
    hook: "开头钩子",
    body: "正文内容",
    bodyNoEmoji: "正文内容无表情",
    hashtags: '["标签1","标签2","标签3"]',
    coverText: "",
    coverImagePrompt: "封面提示词",
    coverImageUrl: "",
    contentImagePrompts: '["提示词1"]',
    contentImageUrls: '["url1"]',
    commentGuide: "评论话术",
    complianceWarnings: '["警告1"]',
    publishChecklist: '["检查项1"]',
    riskDisclaimer: "风险提示",
    templateType: "干货教程",
    status: "Draft",
    publishLink: "",
    publishNote: "",
    publishPlatform: "小红书",
    actualTitle: "",
    actualTags: "",
    publishedAt: null,
    scheduledDate: "",
    scheduledTime: "",
    createdAt: "2026-04-30T00:00:00.000Z",
    topic: { title: "选题标题" },
  };

  it("正确解析标题列表", () => {
    const vm = toDraftViewModel(rawDraft);
    expect(vm.titleList).toEqual(["标题1", "标题2"]);
    expect(vm.primaryTitle).toBe("标题1");
  });

  it("正确解析标签列表", () => {
    const vm = toDraftViewModel(rawDraft);
    expect(vm.hashtagList).toEqual(["标签1", "标签2", "标签3"]);
  });

  it("正确解析警告列表", () => {
    const vm = toDraftViewModel(rawDraft);
    expect(vm.warningList).toEqual(["警告1"]);
  });

  it("正确解析检查清单", () => {
    const vm = toDraftViewModel(rawDraft);
    expect(vm.checklist).toEqual(["检查项1"]);
  });

  it("正确解析配图列表", () => {
    const vm = toDraftViewModel(rawDraft);
    expect(vm.contentImagePromptList).toEqual(["提示词1"]);
    expect(vm.contentImageUrlList).toEqual(["url1"]);
  });

  it("正确提取选题标题", () => {
    const vm = toDraftViewModel(rawDraft);
    expect(vm.topicTitle).toBe("选题标题");
  });

  it("无选题时 topicTitle 为 undefined", () => {
    const vm = toDraftViewModel({ ...rawDraft, topic: null });
    expect(vm.topicTitle).toBeUndefined();
  });

  it("标题为空时 primaryTitle 为无标题", () => {
    const vm = toDraftViewModel({ ...rawDraft, titles: "[]" });
    expect(vm.primaryTitle).toBe("无标题");
  });

  it("JSON 格式异常时不崩溃", () => {
    const vm = toDraftViewModel({ ...rawDraft, titles: "bad json" });
    expect(vm.titleList).toEqual([]);
    expect(vm.primaryTitle).toBe("无标题");
  });

  it("保留非 JSON 字段", () => {
    const vm = toDraftViewModel(rawDraft);
    expect(vm.id).toBe("test-id");
    expect(vm.hook).toBe("开头钩子");
    expect(vm.body).toBe("正文内容");
    expect(vm.status).toBe("Draft");
    expect(vm.templateType).toBe("干货教程");
  });
});

describe("toDraftViewModels", () => {
  it("批量转换", () => {
    const raws = [
      {
        id: "1",
        titles: '["t1"]',
        hook: "",
        body: "",
        bodyNoEmoji: "",
        hashtags: "[]",
        coverText: "",
        coverImagePrompt: "",
        coverImageUrl: "",
        contentImagePrompts: "[]",
        contentImageUrls: "[]",
        commentGuide: "",
        complianceWarnings: "[]",
        publishChecklist: "[]",
        riskDisclaimer: "",
        templateType: "干货教程",
        status: "Draft",
        publishLink: "",
        publishNote: "",
        publishPlatform: "",
        actualTitle: "",
        actualTags: "",
        publishedAt: null,
        scheduledDate: "",
        scheduledTime: "",
        createdAt: "2026-04-30",
      },
    ];
    const vms = toDraftViewModels(raws);
    expect(vms).toHaveLength(1);
    expect(vms[0].primaryTitle).toBe("t1");
  });
});
