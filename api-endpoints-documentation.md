# API Endpoints Documentation

## App Controller

| Method | Endpoint | Parameters | Response |
|---|---|---|---|
| `GET` | `/` | — | `"success"` |

## Auth Controller

**Base URL:** `/auth`

| Method | Endpoint | Query Parameters | Request Body | Response |
|---|---|---|---|---|
| `POST` | `/auth/signup-by-email` | — | `name: string` (max: `100` characters)<br>`email: string` (valid email)<br>`password: string` (8–128 characters) | Created user's auth tokens; sets `access_token` and `refresh_token` httpOnly cookies |
| `POST` | `/auth/signin-by-email` | `isRedirect?: boolean` (default: `true`) | `email: string`<br>`password: string` | Tokens when `isRedirect=false`; sets auth cookies. Redirects to the frontend dashboard otherwise |
| `GET` | `/auth/signin-by-google` | — | — | Redirects to Google OAuth. New Google accounts are registered automatically |
| `GET` | `/auth/signin-by-google/callback` | `isRedirect?: boolean` (default: `true`) | — | Tokens when `isRedirect=false`; sets auth cookies. Redirects to the frontend dashboard otherwise |
| `GET` | `/auth/me` | — | — | Current authenticated user (requires auth) |
| `GET` | `/auth/refresh` | `isRedirect?: boolean` (default: `true`) | — | Rotated auth tokens when `isRedirect=false`; sets new cookies |
| `GET` | `/auth/logout` | `isRedirect?: boolean` (default: `true`) | — | `{ ok: true }` when `isRedirect=false`; clears auth cookies |

## Devices Controller

**Base URL:** `/devices`

| Method | Endpoint | Query Parameters | Path Parameters | Request Body | Response |
|---|---|---|---|---|---|
| `GET` | `/devices` | `search?: string`<br>`limit?: number` (default: `10`)<br>`offset?: number` (default: `0`)<br>`status?: 'active' \| 'archive' \| 'all'` (default: `'all'`)<br>`connectionStatus?: 'CONNECTED' \| 'DISCONNECTED'` | — | — | Device list with pagination |
| `GET` | `/devices/:deviceId` | — | `deviceId: UUID` | — | Device object |
| `POST` | `/devices` | — | — | `serialNumber: string` (max: `100` characters) | Created device object |
| `PATCH` | `/devices/:deviceId` | — | `deviceId: UUID` | `serialNumber?: string` (max: `100` characters)<br>`status?: 'CONNECTED' \| 'DISCONNECTED'` | Updated device object |
| `POST` | `/devices/:deviceId/restore` | — | `deviceId: UUID` | — | Restored device object |
| `DELETE` | `/devices/:deviceId` | `isForceDelete?: boolean` | `deviceId: UUID` | — | Deletion result |

## Roles Controller

**Base URL:** `/roles`

| Method | Endpoint | Query Parameters | Path Parameters | Request Body | Response |
|---|---|---|---|---|---|
| `GET` | `/roles` | `search?: string`<br>`limit?: number` (default: `10`)<br>`offset?: number` (default: `0`)<br>`status?: 'active' \| 'archive' \| 'all'` (default: `'all'`) | — | — | Roles list with pagination |
| `GET` | `/roles/:roleId` | — | `roleId: UUID` | — | Role object |
| `POST` | `/roles` | — | — | `name: string` (required)<br>`description?: string`<br>`permissions: Obj (example: {USER.LIST: true, USER.UPDATE: true}))` (required) | Created role object |
| `PATCH` | `/roles/:roleId` | — | `roleId: UUID` | `name?: string`<br>`description?: string`<br>`permissions?: string` | Updated role object |
| `POST` | `/roles/:roleId/restore` | — | `roleId: UUID` | — | Restored role object |
| `DELETE` | `/roles/:roleId` | `isForceDelete?: boolean` | `roleId: UUID` | — | Deletion result |

## Users Controller

**Base URL:** `/users`

| Method | Endpoint | Query Parameters | Path Parameters | Request Body | Response |
|---|---|---|---|---|---|
| `GET` | `/users` | `search?: string`<br>`limit?: number` (default: `10`)<br>`offset?: number` (default: `0`)<br>`status?: 'active' \| 'archive' \| 'all'` (default: `'all'`) | — | — | Users list with pagination |
| `GET` | `/users/:userId` | — | `userId: UUID` | — | User object |
| `POST` | `/users` | — | — | `name: string` (required, max: `100` characters)<br>`email: string` (required)<br>`roleId: UUID` (required)<br>`deviceId: UUID` (required)<br>`passwordHash?: string`<br>`authProvider?: string` (max: `50` characters)<br>`providerId?: string`<br>`metaAdditionalData?: any` | Created user object |
| `PATCH` | `/users/:userId` | — | `userId: UUID` | `name?: string` (max: `100` characters)<br>`email?: string`<br>`roleId?: UUID`<br>`deviceId?: UUID`<br>`passwordHash?: string`<br>`authProvider?: string` (max: `50` characters)<br>`providerId?: string`<br>`metaAdditionalData?: any` | Updated user object |
| `POST` | `/users/:userId/restore` | — | `userId: UUID` | — | Restored user object |
| `DELETE` | `/users/:userId` | `isForceDelete?: boolean` | `userId: UUID` | — | Deletion result |

## General Notes

- Per now, all `POST` and `PATCH` endpoints not require authentication using a Bearer token.
- `createdAt` and `updatedAt` timestamps are generated automatically by the server.
- Soft delete is used by default (`isForceDelete=false`). Force delete permanently removes the record.
- Swagger documentation is available at `/docs`, or at the path configured through `SWAGGER_DOCS_PATH`.
- The server port defaults to `3000`.
