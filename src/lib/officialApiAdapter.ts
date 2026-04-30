// ============================================================
// 官方 API 适配器（预留接口）
//
// 当前状态：小红书没有面向普通个人创作者的公开笔记发布 API。
// 本模块仅定义接口规范，所有方法返回 NotImplementedError。
//
// 未来如果小红书开放官方发布 API，在此实现即可，
// 无需改动上层业务代码。
//
// ⚠️ 本项目不使用、也不提供以下方式：
//   - Cookie 自动登录
//   - 浏览器自动化模拟点击
//   - 绕过验证码
//   - 非官方接口发布
// ============================================================

export interface PublishNoteParams {
  title: string;
  body: string;
  hashtags: string[];
  coverImageUrl?: string;
  contentImageUrls?: string[];
}

export interface PublishNoteResult {
  success: boolean;
  noteId?: string;
  noteUrl?: string;
  error?: string;
}

export interface ApiAdapterStatus {
  available: boolean;
  provider: string;
  version?: string;
  error?: string;
}

/**
 * 检查官方发布 API 是否可用
 *
 * 当前始终返回不可用。未来接入官方 API 时修改此函数。
 */
export async function checkApiAvailability(): Promise<ApiAdapterStatus> {
  return {
    available: false,
    provider: "none",
    error:
      "小红书目前没有面向普通个人创作者的公开笔记发布 API。请手动在小红书创作服务平台发布内容。",
  };
}

/**
 * 发布笔记到小红书
 *
 * 当前始终抛出 NotImplementedError。
 * 未来接入官方 API 时实现此函数。
 */
export async function publishNote(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _params: PublishNoteParams
): Promise<PublishNoteResult> {
  throw new NotImplementedError("publishNote");
}

/**
 * 查询笔记发布状态
 *
 * 当前始终抛出 NotImplementedError。
 */
export async function getNoteStatus(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _noteId: string
): Promise<{ status: string; error?: string }> {
  throw new NotImplementedError("getNoteStatus");
}

/**
 * 删除已发布的笔记
 *
 * 当前始终抛出 NotImplementedError。
 */
export async function deleteNote(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _noteId: string
): Promise<{ success: boolean; error?: string }> {
  throw new NotImplementedError("deleteNote");
}

class NotImplementedError extends Error {
  constructor(methodName: string) {
    super(
      `${methodName} 尚未实现。小红书官方暂未开放个人创作者发布 API。` +
        `请通过小红书创作服务平台（creator.xiaohongshu.com）手动发布。`
    );
    this.name = "NotImplementedError";
  }
}
