// ============================================================
// 内容合规检查模块
// 针对 AI 工具 / Token 中转 / API 使用 / AI 副业领域优化
// ============================================================

// 常见敏感词列表（基础版，可在设置中自定义）
const DEFAULT_SENSITIVE_WORDS = [
  "最好", "第一", "必须", "绝对", "保证", "100%", "永久",
  "万能", "神效", "特效", "根治", "治愈", "药到病除",
  "国家认证", "官方推荐", "权威认证", "央视推荐",
];

// 绝对化表述检测（AI 工具/Token 领域常见）
const ABSOLUTE_WORDS = [
  "全网最低", "永久稳定", "绝对安全", "零风险", "无风险",
  "100%稳定", "100%安全", "永不封号", "绝对不会",
  "最强", "最便宜", "最好用", "最稳定", "最安全",
  "完美", "无敌", "碾压", "吊打", "秒杀一切",
];

// 收益承诺检测
const INCOME_PROMISE_WORDS = [
  "稳赚", "保证收益", "保证赚钱", "月入", "日赚", "年入",
  "被动收入", "躺赚", "零成本", "无成本", "暴富",
  "回本", "翻倍", "稳赚不赔", "保本", "保底",
  "赚到", "赚了", "收入达到", "收益达到",
];

// 官方身份伪装检测
const OFFICIAL_IMPERSONATION_WORDS = [
  "官方合作", "官方授权", "官方认证", "官方推荐", "官方代理",
  "官方指定", "官方渠道", "战略合作", "深度合作",
  "独家代理", "唯一授权", "正式授权",
];

// 营销语气检测词
const MARKETING_WORDS = [
  "限时", "抢购", "秒杀", "仅剩", "最后", "错过就没",
  "立即购买", "下单", "优惠券", "打折", "促销",
  "赚钱", "暴富", "月入", "日赚", "躺赚",
  "名额有限", "先到先得", "手慢无", "最后机会",
];

// Token/API 领域专属敏感词
const TOKEN_API_SENSITIVE_WORDS = [
  "免费API", "无限调用", "破解", "盗版", "白嫖",
  "免费Token", "无限Token", "永久免费", "零成本搭建",
  "黑科技", "灰色地带", "擦边",
];

export interface ValidationResult {
  isValid: boolean;
  warnings: string[];
  suggestions: string[];
}

/**
 * 检测文本中是否包含指定词汇列表中的词
 */
function findMatches(text: string, wordList: string[]): string[] {
  const found: string[] = [];
  for (const word of wordList) {
    if (text.includes(word)) {
      found.push(word);
    }
  }
  return found;
}

export function checkSensitiveWords(
  text: string,
  customBannedWords: string[] = []
): string[] {
  const allWords = [...DEFAULT_SENSITIVE_WORDS, ...customBannedWords];
  return findMatches(text, allWords);
}

export function checkMarketingTone(text: string): string[] {
  return findMatches(text, MARKETING_WORDS);
}

/**
 * 检测绝对化表述
 */
export function checkAbsoluteExpressions(text: string): string[] {
  return findMatches(text, ABSOLUTE_WORDS);
}

/**
 * 检测收益承诺
 */
export function checkIncomePromises(text: string): string[] {
  return findMatches(text, INCOME_PROMISE_WORDS);
}

/**
 * 检测官方身份伪装
 */
export function checkOfficialImpersonation(text: string): string[] {
  return findMatches(text, OFFICIAL_IMPERSONATION_WORDS);
}

/**
 * 检测 Token/API 领域专属敏感词
 */
export function checkTokenApiSensitive(text: string): string[] {
  return findMatches(text, TOKEN_API_SENSITIVE_WORDS);
}

/**
 * 综合内容合规检查
 */
export function validateContent(
  title: string,
  body: string,
  hashtags: string,
  bannedWords: string = "",
  enableSensitiveCheck: boolean = true,
  enableAdCheck: boolean = true
): ValidationResult {
  const warnings: string[] = [];
  const suggestions: string[] = [];
  const bannedList = bannedWords
    .split(",")
    .map((w) => w.trim())
    .filter(Boolean);

  const fullText = title + " " + body;

  // ── 敏感词检查 ──
  if (enableSensitiveCheck) {
    const sensitiveInTitle = checkSensitiveWords(title, bannedList);
    const sensitiveInBody = checkSensitiveWords(body, bannedList);

    if (sensitiveInTitle.length > 0) {
      warnings.push(`标题含敏感词: ${sensitiveInTitle.join("、")}`);
    }
    if (sensitiveInBody.length > 0) {
      warnings.push(`正文含敏感词: ${sensitiveInBody.join("、")}`);
    }

    // 绝对化表述检查
    const absoluteWords = checkAbsoluteExpressions(fullText);
    if (absoluteWords.length > 0) {
      warnings.push(
        `含绝对化表述，建议修改: ${absoluteWords.join("、")}`
      );
    }

    // 收益承诺检查
    const incomeWords = checkIncomePromises(fullText);
    if (incomeWords.length > 0) {
      warnings.push(
        `含收益承诺用语，存在违规风险: ${incomeWords.join("、")}`
      );
    }

    // 官方身份伪装检查
    const officialWords = checkOfficialImpersonation(fullText);
    if (officialWords.length > 0) {
      warnings.push(
        `含官方身份伪装用语，必须修改: ${officialWords.join("、")}`
      );
    }

    // Token/API 领域专属敏感词
    const tokenWords = checkTokenApiSensitive(fullText);
    if (tokenWords.length > 0) {
      warnings.push(
        `含 Token/API 领域敏感词: ${tokenWords.join("、")}`
      );
    }
  }

  // ── 营销语气检查 ──
  if (enableAdCheck) {
    const marketingInTitle = checkMarketingTone(title);
    const marketingInBody = checkMarketingTone(body);

    if (marketingInTitle.length > 0) {
      warnings.push(`标题含营销词: ${marketingInTitle.join("、")}`);
    }
    if (marketingInBody.length > 0) {
      warnings.push(`正文含营销词: ${marketingInBody.join("、")}`);
    }
  }

  // ── 内容规范检查 ──
  if (title.length > 20) {
    suggestions.push("标题建议控制在 20 字以内");
  }
  if (body.length > 1200) {
    suggestions.push("正文较长，建议控制在 1200 字以内以提高完读率");
  }
  if (body.length < 100) {
    suggestions.push("正文较短，建议丰富内容以提高价值感");
  }

  const hashtagList = hashtags
    .split(/[#\s,，]+/)
    .filter(Boolean);
  if (hashtagList.length < 8) {
    suggestions.push("标签较少，建议添加 8-15 个标签以提高曝光");
  }
  if (hashtagList.length > 15) {
    suggestions.push("标签过多，建议控制在 8-15 个");
  }

  // ── 风险提示检查 ──
  const hasRiskDisclaimer =
    fullText.includes("风险") ||
    fullText.includes("注意") ||
    fullText.includes("提醒") ||
    fullText.includes("理性");
  if (!hasRiskDisclaimer) {
    suggestions.push("建议在内容中包含风险提示或理性提醒");
  }

  return {
    isValid: warnings.length === 0,
    warnings,
    suggestions,
  };
}
