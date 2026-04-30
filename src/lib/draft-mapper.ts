// Draft 数据转换层
// 将数据库原始字段转为更适合前端使用的 ViewModel

import { parseStringArray, parseWarningList, parseChecklist } from "./json-fields";
import type { DraftStatus } from "./draft-status";

/** 数据库原始 Draft 的前端 ViewModel */
export interface DraftViewModel {
  id: string;
  /** 主标题（第一个标题） */
  primaryTitle: string;
  /** 所有标题列表 */
  titleList: string[];
  hook: string;
  body: string;
  bodyNoEmoji: string;
  /** 标签列表 */
  hashtagList: string[];
  coverText: string;
  coverImagePrompt: string;
  coverImageUrl: string;
  /** 正文配图提示词 */
  contentImagePromptList: string[];
  /** 正文配图 URL */
  contentImageUrlList: string[];
  commentGuide: string;
  /** 合规警告列表 */
  warningList: string[];
  /** 发布检查清单 */
  checklist: string[];
  riskDisclaimer: string;
  templateType: string;
  status: DraftStatus | string;
  publishLink: string;
  publishNote: string;
  publishPlatform: string;
  actualTitle: string;
  actualTags: string;
  publishedAt: string | null;
  scheduledDate: string;
  scheduledTime: string;
  createdAt: string;
  topicTitle?: string;
}

/** 数据库中 Draft 的原始类型（部分字段） */
interface RawDraft {
  id: string;
  titles: string;
  hook: string;
  body: string;
  bodyNoEmoji: string;
  hashtags: string;
  coverText: string;
  coverImagePrompt: string;
  coverImageUrl: string;
  contentImagePrompts: string;
  contentImageUrls: string;
  commentGuide: string;
  complianceWarnings: string;
  publishChecklist: string;
  riskDisclaimer: string;
  templateType: string;
  status: string;
  publishLink: string;
  publishNote: string;
  publishPlatform: string;
  actualTitle: string;
  actualTags: string;
  publishedAt: Date | string | null;
  scheduledDate: string;
  scheduledTime: string;
  createdAt: Date | string;
  topic?: { title: string } | null;
}

/**
 * 将数据库 Draft 转为前端 ViewModel
 */
export function toDraftViewModel(raw: RawDraft): DraftViewModel {
  const titleList = parseStringArray(raw.titles);
  return {
    id: raw.id,
    primaryTitle: titleList[0] || "无标题",
    titleList,
    hook: raw.hook,
    body: raw.body,
    bodyNoEmoji: raw.bodyNoEmoji,
    hashtagList: parseStringArray(raw.hashtags),
    coverText: raw.coverText,
    coverImagePrompt: raw.coverImagePrompt,
    coverImageUrl: raw.coverImageUrl,
    contentImagePromptList: parseStringArray(raw.contentImagePrompts),
    contentImageUrlList: parseStringArray(raw.contentImageUrls),
    commentGuide: raw.commentGuide,
    warningList: parseWarningList(raw.complianceWarnings),
    checklist: parseChecklist(raw.publishChecklist),
    riskDisclaimer: raw.riskDisclaimer,
    templateType: raw.templateType,
    status: raw.status,
    publishLink: raw.publishLink,
    publishNote: raw.publishNote,
    publishPlatform: raw.publishPlatform,
    actualTitle: raw.actualTitle,
    actualTags: raw.actualTags,
    publishedAt: raw.publishedAt ? String(raw.publishedAt) : null,
    scheduledDate: raw.scheduledDate,
    scheduledTime: raw.scheduledTime,
    createdAt: String(raw.createdAt),
    topicTitle: raw.topic?.title,
  };
}

/**
 * 批量转换
 */
export function toDraftViewModels(raws: RawDraft[]): DraftViewModel[] {
  return raws.map(toDraftViewModel);
}
