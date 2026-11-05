export interface ReadingHistory {
  id: string;
  bookTitle: string;
  duration: number;
  pagesRead: number;
  timestamp: string;
}

export interface Role {
  id: string;
  name: string;
  permissions: string[];
}

export interface User {
  id: string;
  username: string;
  email: string;
  roleId: string;
}

export type Permission = string;

export interface OcrTtsResult {
  text: string;
  audioUrl: string;
}

export interface ApiError {
  message: string;
  status: number;
  errors?: Record<string, string[]>;
}
