import { describe, it, expect } from "vitest";
import {
  checkSensitiveWords,
  checkAbsoluteExpressions,
  checkIncomePromises,
  checkOfficialImpersonation,
  checkMarketingTone,
  checkTokenApiSensitive,
  validateContent,
} from "../src/lib/validation";

describe("checkSensitiveWords", () => {
  it("检测到默认敏感词", () => {
    const found = checkSensitiveWords("这是最好的产品");
    expect(found).toContain("最好");
  });

  it("检测到自定义禁用词", () => {
    const found = checkSensitiveWords("含有自定义词", ["自定义"]);
    expect(found).toContain("自定义");
  });

  it("无敏感词返回空数组", () => {
    expect(checkSensitiveWords("正常内容描述")).toEqual([]);
  });
});

describe("checkAbsoluteExpressions", () => {
  it("检测到绝对化表述", () => {
    expect(checkAbsoluteExpressions("全网最低价")).toContain("全网最低");
    expect(checkAbsoluteExpressions("绝对安全")).toContain("绝对安全");
  });

  it("无绝对化表述返回空数组", () => {
    expect(checkAbsoluteExpressions("性价比很高")).toEqual([]);
  });
});

describe("checkIncomePromises", () => {
  it("检测到收益承诺", () => {
    expect(checkIncomePromises("月入过万不是梦")).toContain("月入");
    expect(checkIncomePromises("稳赚不赔")).toContain("稳赚");
  });

  it("无收益承诺返回空数组", () => {
    expect(checkIncomePromises("分享使用经验")).toEqual([]);
  });
});

describe("checkOfficialImpersonation", () => {
  it("检测到官方伪装", () => {
    expect(checkOfficialImpersonation("官方授权代理")).toContain("官方授权");
  });

  it("无伪装返回空数组", () => {
    expect(checkOfficialImpersonation("个人使用心得")).toEqual([]);
  });
});

describe("checkMarketingTone", () => {
  it("检测到营销词", () => {
    expect(checkMarketingTone("限时抢购")).toContain("限时");
    expect(checkMarketingTone("最后机会")).toContain("最后");
  });
});

describe("checkTokenApiSensitive", () => {
  it("检测到 Token 领域敏感词", () => {
    expect(checkTokenApiSensitive("免费API无限调用")).toContain("免费API");
  });
});

describe("validateContent", () => {
  it("合规内容返回无警告", () => {
    const result = validateContent(
      "Claude Code 使用心得",
      "这是一篇关于 Claude Code 的使用经验分享，内容详实，包含了很多实用的技巧和注意事项。通过实际使用，我发现这个工具确实能够提升开发效率，特别是在代码补全和错误检查方面。当然，使用过程中也遇到了一些问题，比如偶尔的响应延迟和一些特定场景下的不准确。总的来说，这是一个值得尝试的 AI 编程助手。".repeat(2),
      "#Claude Code,#AI,#编程,#效率,#工具,#开发,#代码,#助手",
      "",
      true,
      true
    );
    expect(result.warnings.length).toBe(0);
  });

  it("标题过长给出建议", () => {
    const result = validateContent(
      "这是一个非常非常非常非常非常非常非常长的标题超过了二十个字",
      "正文内容",
      "#标签",
      "",
      false,
      false
    );
    expect(result.suggestions.some((s) => s.includes("标题"))).toBe(true);
  });

  it("正文过短给出建议", () => {
    const result = validateContent(
      "短标题",
      "太短了",
      "#标签1,#标签2,#标签3,#标签4,#标签5,#标签6,#标签7,#标签8",
      "",
      false,
      false
    );
    expect(result.suggestions.some((s) => s.includes("短"))).toBe(true);
  });

  it("标签过少给出建议", () => {
    const result = validateContent(
      "标题",
      "正文内容",
      "#标签1,#标签2",
      "",
      false,
      false
    );
    expect(result.suggestions.some((s) => s.includes("标签"))).toBe(true);
  });

  it("含敏感词给出警告", () => {
    const result = validateContent(
      "这是最好的",
      "正文",
      "#标签",
      "",
      true,
      false
    );
    expect(result.warnings.some((w) => w.includes("敏感词"))).toBe(true);
  });

  it("使用自定义禁用词", () => {
    const result = validateContent(
      "标题",
      "含有竞品名称的内容",
      "#标签",
      "竞品名称",
      true,
      false
    );
    expect(result.warnings.some((w) => w.includes("竞品名称"))).toBe(true);
  });
});
