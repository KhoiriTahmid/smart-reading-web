export const PERMISSION_SUB_KEYS = [
  "USER",
  "ROLE",
  "DEVICE",
  "OCR",
  "TTS",
  "DASHBOARD",
  "READING_HISTORY",
] as const;

export const PERMISSION_SUB_KEYS_ACTION = [
  "LIST",
  "UPDATE",
  "CREATE",
  "DETAIL",
  "DELETE",
] as const;

export type PermissionSubKey = (typeof PERMISSION_SUB_KEYS)[number];
export type PermissionAction = (typeof PERMISSION_SUB_KEYS_ACTION)[number];

export const PERMISSION_KEYS = PERMISSION_SUB_KEYS.flatMap((key) =>
  key === "DASHBOARD"
    ? [key]
    : PERMISSION_SUB_KEYS_ACTION.map((act) => `${key}.${act}` as const),
);

export type PermissionKey = (typeof PERMISSION_KEYS)[number];

export type ReadStatus = "done" | "processing" | "stopped" | "failed";
export interface ReadingHistory {
  id: string;
  title: string;
  reader: string;
  pages?: string;
  durationMin?: number;
  extractedText?: string | null;
  audioUrl?: string | null;
  imageUrl?: string | null;
  voice?: TtsVoice;
  lang?: OcrLang;
  sourceMimeType?: string | null;
  remark?: string | null;
  errorMessage?: string | null;
  rawStatus?: ReadingJobStatus;
  readAt: string; // ISO date
  updatedAt?: string;
  status: ReadStatus;
}

export interface Role {
  id: string;
  name: string;
  permissions: Record<PermissionKey, boolean>;
  locked?: boolean;
}

export type UserStatus = "active" | "invited" | "inactive";
export interface User {
  id: string;
  name: string;
  email: string;
  roleId: string;
  status: UserStatus;
}
export interface NewUser {
  name: string;
  email: string;
  password: string;
  roleId: string;
}

export type OcrLang = "id" | "en" | "auto";
export type TtsVoice = "female" | "male";

export type ReadingJobStatus =
  | "PENDING"
  | "OCR_PROCESSING"
  | "OCR_DONE"
  | "TTS_PROCESSING"
  | "COMPLETED"
  | "FAILED";

export interface ReadingHistoryResponse {
  historyId: string;
  name: string | null;
  extractedText: string | null;
  audioUrl: string | null;
  imageUrl: string | null;
  sourceMimeType?: string | null;
  voice: TtsVoice;
  status: ReadingJobStatus;
  remark: string | null;
  errorMessage?: string | null;
  metaDevice?: {
    lang?: OcrLang;
    [key: string]: unknown;
  } | null;
  createdAt: string;
  updatedAt?: string;
  createdByUser?: {
    name: string;
    email?: string;
  } | null;
}

export interface OcrTtsResult {
  text: string;
  audioUrl: string;
  historyId?: string;
  remark?: string | null;
}
