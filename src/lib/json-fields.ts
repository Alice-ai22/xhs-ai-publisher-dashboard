// 安全解析数据库中以 JSON 字符串存储的字段
// 解析失败时返回安全默认值，不会抛出异常

/**
 * 安全解析任意 JSON 字符串
 * 失败时返回 fallback（默认 undefined）
 */
export function safeJsonParse<T>(raw: string | null | undefined, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

/**
 * 解析为字符串数组，典型字段：titles, hashtags, contentImagePrompts, contentImageUrls
 */
export function parseStringArray(raw: string | null | undefined): string[] {
  return safeJsonParse<string[]>(raw, []);
}

/**
 * 解析合规警告列表（complianceWarnings）
 */
export function parseWarningList(raw: string | null | undefined): string[] {
  return parseStringArray(raw);
}

/**
 * 解析发布检查清单（publishChecklist）
 */
export function parseChecklist(raw: string | null | undefined): string[] {
  return parseStringArray(raw);
}

/**
 * 将值序列化为 JSON 字符串，用于写入数据库
 */
export function stringifyJsonField(value: unknown): string {
  try {
    return JSON.stringify(value);
  } catch {
    return "[]";
  }
}
