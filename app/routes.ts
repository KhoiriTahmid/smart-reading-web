import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  route("login", "routes/login.tsx"),
  route("register", "routes/register.tsx"),
  route("logout", "routes/logout.tsx"),
  route("dashboard", "routes/dashboard-redirect.tsx"),
  route("/", "routes/_layout.tsx", [
    index("routes/dashboard.tsx"),
    route("history", "routes/history.tsx"),
    route("ocr-tts", "routes/ocr-tts.tsx"),
    route("users", "routes/users.tsx"),
    route("roles", "routes/roles.tsx"),
    route("*", "routes/not-found.tsx"),
  ]),
] satisfies RouteConfig;
