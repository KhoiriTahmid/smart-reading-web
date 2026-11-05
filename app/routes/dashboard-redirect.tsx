import { redirect } from "react-router";

/**
 * The backend redirects OAuth and email logins to FRONTEND_URL/dashboard.
 * The dashboard lives at "/" in this app, so keep that URL working.
 */
export function clientLoader() {
  return redirect("/");
}
