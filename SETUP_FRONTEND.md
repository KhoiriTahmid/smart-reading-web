# TASK: Scaffold the frontend for "Smart Reading Books" (IoT reading device dashboard)

Set up the project from scratch until it is READY for building UI components.
Do NOT build any real UI components or page content. Only infrastructure, config,
types, stubs, and placeholder routes. The backend is half-done and separate: do not touch it.

## 1. Stack
- React Router v7 in FRAMEWORK MODE (Vite-based), TypeScript strict
- `ssr: false` for now (SPA), but the code must stay SSR-ready (see rules in section 8)
- Tailwind CSS v4 (as shipped by the template)
- i18next + react-i18next (Indonesian "id" default, English "en")
- Zustand for client state
- Recharts for charts, lucide-react for icons, clsx + tailwind-merge
- ESLint + Prettier (+ prettier-plugin-tailwindcss)
- Package manager: **yarn** (use yarn for every install/run command, never npm or pnpm)

## 2. Create the project
1. Check the yarn version with `yarn -v`.
   - If it is Yarn Berry (2+), make sure `.yarnrc.yml` contains `nodeLinker: node-modules`.
   - If it is Yarn Classic (1.x), proceed normally.
2. Run: `npx create-react-router@latest smart-reading-web` and choose **yarn** as the package manager
   (or pass `--package-manager yarn` if the CLI supports it). Accept TypeScript and install deps.
3. Set `ssr: false` in `react-router.config.ts`.
4. Install: `yarn add zustand recharts lucide-react clsx tailwind-merge i18next react-i18next js-cookie`
   and dev: `yarn add -D prettier prettier-plugin-tailwindcss @types/js-cookie`
5. Make sure `"strict": true` is on and the path alias `~/*` -> `app/*` exists (keep the template's alias if present).
6. Add scripts: `typecheck` (`react-router typegen && tsc`), `lint`, `format`.

## 3. Folder structure (create folders with .gitkeep or stub files)
```
app/
  routes.ts                      # route config
  root.tsx                       # fonts, <html lang>, providers
  app.css                        # tailwind + design tokens
  routes/
    _layout.tsx                  # app shell: renders <Outlet/> inside a placeholder shell
    dashboard.tsx
    history.tsx
    ocr-tts.tsx
    users.tsx
    roles.tsx
  components/
    ui/                          # (empty) generic primitives later
    layout/                      # (empty) Sidebar, Header later
  features/
    dashboard/  history/  ocr-tts/  users/  roles/     # each: components/, hooks/ (empty)
  hooks/
    use-device-socket.ts
  lib/
    cn.ts                        # clsx + twMerge
    ws-client.ts                 # reconnecting WebSocket class
    api-client.ts                # fetch wrapper
    cookies.ts                   # get/set helpers for lang + theme
  services/
    ocr-tts.service.ts  history.service.ts  users.service.ts  roles.service.ts
  stores/
    device.store.ts
  i18n/
    index.ts  locales/id.json  locales/en.json
  types/
    device.ts  api.ts
  mocks/
    device.mock.ts               # fake telemetry generator for VITE_USE_MOCK=true
.env.example
```

## 4. Routes
`app/routes.ts`: one layout route (`routes/_layout.tsx`) with children:
`/` (index -> redirect to /dashboard), `/dashboard`, `/history`, `/ocr-tts`, `/users`, `/roles`.
Each route file exports a default component that only renders a heading with its translated title
(use `useTranslation`). No other markup.

## 5. Design tokens (`app.css`)
- Import Google Fonts: Plus Jakarta Sans (400-700) and JetBrains Mono (400, 500).
- Tailwind v4 `@theme` with fonts: `--font-sans`, `--font-mono`.
- CSS variables on `:root` for light and `.dark` / `[data-theme="dark"]` for dark:
  - Light: --bg #f6f7f9, --card #ffffff, --line #e8eaee, --ink #12151c, --mute #6b7280, --soft #f1f3f6,
    --acc #10b981, --accbg #e8f8f2, --warn #d97706, --warnbg #fef3e2, --bad #e11d48, --badbg #ffe9ee,
    --info #4f46e5, --infobg #eceafd
  - Dark: --bg #0d0f13, --card #15181e, --line #252a33, --ink #eef0f4, --mute #8d96a5, --soft #1c2028,
    --accbg #10281f, --warnbg #2c2210, --badbg #2d1219, --infobg #1e1d3a
- Expose them as Tailwind colors (bg-bg, bg-card, border-line, text-ink, text-mute, bg-soft, text-acc, etc.).
- Body: `bg-bg text-ink font-sans antialiased`.

## 6. Types (`app/types/device.ts`)
Use discriminated unions.
- Commands sent to the Raspberry Pi (JSON, field `type`):
  - `volume {value:number}`
  - `tts_speed {value:number}`
  - `flip {step:1|-1}`
  - `speech {action:"pause"|"resume"}`
  - `power {mode:"on"|"off"|"restart"}`
  - `play_text {text:string}`
  - NOTE: there is NO sleep mode.
- Messages received from the Pi:
  - `telemetry {cpuTemp:number, cpuLoad:number, ramUsage:number, wpm:number, ts:number}`
  - `state {mode:"reading"|"paused"|"standby"|"flipping"|"off"|"restarting", page:number, volume:number, speed:number}`
  - `ack {ok:boolean, ref?:string}`
- `ConnectionStatus = "connecting" | "open" | "closed"`.
- `app/types/api.ts`: types for `ReadingHistory`, `User`, `Role`, `Permission`,
  `OcrTtsResult {text:string, audioUrl:string}`, and `ApiError`.

## 7. Infrastructure to implement (real code, no UI)
- `lib/ws-client.ts`: class with `connect()`, `send(cmd)`, `close()`, `onMessage`, `onStatus`;
  auto-reconnect with exponential backoff (1s -> 10s max); JSON parse in try/catch; typed with the unions above.
- `stores/device.store.ts` (zustand): `status`, `state`, `telemetry` (keep the last 20 points as history arrays for charts),
  `logs` (max 200 lines). Actions: `pushTelemetry`, `setState`, `addLog`, `clearLogs`.
- `hooks/use-device-socket.ts`: creates the client ONLY inside `useEffect`, wires it into the store,
  returns `{ send, status }`. Reads `import.meta.env.VITE_WS_URL`. If `VITE_USE_MOCK === "true"`, use
  `mocks/device.mock.ts` (emit fake telemetry every 3s and fake `state`) instead of a real socket.
- `lib/api-client.ts`: `apiFetch<T>(path, init)` using `VITE_API_URL`, `credentials: "include"`,
  JSON handling, throws a typed `ApiError`.
- `services/*.service.ts`: typed functions calling `apiFetch`:
  `getHistory`, `getUsers` / `createUser` / `updateUserRole` / `deleteUser`, `getRoles` / `updatePermission`,
  `convertOcrTts(file, lang, voice)` using FormData -> POST `/ocr-tts`.
  Endpoints are best guesses; centralize paths in one constant so they are easy to change.
- i18n: `i18n/index.ts` initializes i18next with `id` and `en` resources, fallback `en`, default `id`.
  Language is stored in a COOKIE named `lang` (via `lib/cookies.ts`), not localStorage.
  Provide a `useLanguage()` hook -> `{ lang, setLang }`.
  Locale JSON must cover: nav labels (Dashboard, History Read, OCR to Speech, Users, Roles),
  page titles, and the dashboard control labels (volume, mute, speed, prev, next, pause, resume,
  power on, power off, restart, connected, offline, cpu temp, cpu load, ram, wpm).
- Theme: store in a cookie `theme` ("light" | "dark" | "system"); provide a `useTheme()` hook that toggles
  the `dark` class on `<html>` inside `useEffect`.
- `.env.example`:
  ```
  VITE_WS_URL=ws://raspi.local:8765
  VITE_API_URL=http://localhost:8000
  VITE_USE_MOCK=true
  ```
  Also create `.env` copied from it, and make sure `.env` is in `.gitignore`.

## 8. Rules (keep the code SSR-ready)
- Never touch `window`, `document`, `localStorage`, or `navigator` during render or at module top level;
  only inside `useEffect` or event handlers.
- WebSocket is client-only (inside effects).
- No auth token in localStorage; assume httpOnly session cookies from the backend.
- No `any`. No default exports except route modules and root.
- Keep route files thin; feature logic goes under `features/<name>/`.

## 9. Verify before finishing
1. `yarn typecheck` passes with zero errors.
2. `yarn lint` passes.
3. `yarn build` succeeds.
4. `yarn dev` starts; visiting each of the 5 routes shows its translated heading;
   switching language (via a temporary console call to `i18n.changeLanguage`) changes the text.
5. With `VITE_USE_MOCK=true`, telemetry arrives in the store (log one line per message, in dev only).

## 10. Final output
Print: the final folder tree, the list of installed packages with versions, any decisions you made
that deviate from this prompt (and why), and the exact commands to run the project.
Do not create any visual components (Sidebar, Header, Card, charts, etc.). Stop after the checks pass.
