// 草稿状态常量 —— 全项目唯一定义，避免各处硬编码
export const DRAFT_STATUS = {
  Draft: "Draft",
  NeedsEdit: "NeedsEdit",
  ReadyToPublish: "ReadyToPublish",
  Published: "Published",
} as const;

export type DraftStatus = (typeof DRAFT_STATUS)[keyof typeof DRAFT_STATUS];

export const DRAFT_STATUS_LABELS: Record<DraftStatus, string> = {
  Draft: "草稿",
  NeedsEdit: "需修改",
  ReadyToPublish: "待发布",
  Published: "已发布",
};

export const DRAFT_STATUS_COLORS: Record<DraftStatus, string> = {
  Draft: "tag-draft",
  NeedsEdit: "tag-needs-edit",
  ReadyToPublish: "tag-ready",
  Published: "tag-published",
};

/** 所有合法草稿状态值，用于 schema 校验 */
export const ALL_DRAFT_STATUSES = Object.values(DRAFT_STATUS);
