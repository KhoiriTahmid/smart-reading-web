export interface AuthRole {
  roleId: string;
  name: string;
  permissions: Record<string, boolean>;
}

export interface AuthUser {
  userId: string;
  name: string;
  email: string;
  picture?: string;
  role?: AuthRole;
  device?: {
    deviceId: string;
    serialNumber: string;
  } | null;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

export interface MessageResponse {
  message: string;
}

export interface ResetPasswordInput {
  token: string;
  newPassword: string;
}

