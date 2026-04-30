// 内容模板类型
export type ContentType =
  | "干货教程"
  | "避坑指南"
  | "人设故事"
  | "工具评测"
  | "引流软广";

// 选题状态
export type TopicStatus = "未生成" | "已生成" | "已归档";

// 草稿状态（统一定义见 src/lib/draft-status.ts）
export type DraftStatus =
  | "Draft"
  | "NeedsEdit"
  | "ReadyToPublish"
  | "Published";

// 软广强度
export type AdIntensity = "低" | "中" | "高";

// 文案长度
export type ContentLength = "短" | "中" | "长";

// 内容模板配置
export interface ContentTemplate {
  type: ContentType;
  label: string;
  description: string;
  titleStyles: string[];
  structure: string[];
  adApproach: string;
  defaultAdIntensity: AdIntensity;
  exampleTopics: string[];
}

// AI 生成的文案结果
export interface CopywritingResult {
  titles: string[];
  hook: string;
  body: string;
  bodyNoEmoji: string;
  hashtags: string[];
  coverText: string;
  coverImagePrompt: string;
  contentImagePrompts: string[];
  commentGuide: string;
  complianceWarnings: string[];
  publishChecklist: string[];
  riskDisclaimer: string;
}

// 生成请求参数
export interface GenerateRequest {
  topicId?: string;
  templateType: ContentType;
  direction: string;
  content: string;
  keywords: string;
  withProduct: boolean;
  generateCover: boolean;
  generateImages: boolean;
  versionCount: number;
}

// 发布包导出
export interface PublishPackage {
  title: string;
  body: string;
  hashtags: string[];
  coverPrompt: string;
  imagePrompts: string[];
  commentGuide: string;
  publishChecklist: string[];
  riskDisclaimer: string;
  noteJson: Record<string, unknown>;
}

// API 响应
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// 日历事件
export interface CalendarEvent {
  id: string;
  date: string;
  time: string;
  title: string;
  status: DraftStatus;
  draftId: string;
}
