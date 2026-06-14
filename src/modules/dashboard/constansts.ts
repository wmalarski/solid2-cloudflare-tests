export const STATUS_NEW = "new";
export const STATUS_IN_PROGRESS = "in-progress";
export const STATUS_REVIEWED = "reviewed";
export const STATUS_REWATCH = "rewatch";

export const BOOKMARK_STATUSES = [
  STATUS_NEW,
  STATUS_IN_PROGRESS,
  STATUS_REVIEWED,
  STATUS_REWATCH,
] as const;

export const FINISHED_BOOKMARK_STATUSES_SET = new Set<string>([STATUS_REVIEWED, STATUS_REWATCH]);
