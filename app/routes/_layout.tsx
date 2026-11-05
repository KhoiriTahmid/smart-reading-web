import { Navigate, Outlet, redirect, useLocation } from "react-router";
import { Header } from "~/components/layout/header";
import { NotFoundPage } from "~/components/layout/not-found-page";
import { Sidebar } from "~/components/layout/sidebar";
import type { DeviceOutletContext } from "~/hooks/use-device-context";
import { useDeviceSocket } from "~/hooks/use-device-socket";
import { CustomApiError } from "~/lib/api-client";
import {
  canAccessRoute,
  getFirstAccessibleRoute,
  isKnownAppRoute,
  normalizePathname,
} from "~/lib/permissions";
import { getCurrentUser } from "~/services/auth.service";
import type { Route } from "./+types/_layout";

export async function clientLoader() {
  try {
    return { user: await getCurrentUser() };
  } catch (error) {
    if (error instanceof CustomApiError && error.status === 401) {
      throw redirect("/login");
    }
    throw error;
  }
}

export default function AppLayout({ loaderData }: Route.ComponentProps) {
  const { send } = useDeviceSocket();
  const { user } = loaderData;
  const { pathname } = useLocation();
  const context: DeviceOutletContext = { send };

  const normalized = normalizePathname(pathname);
  const firstAccessible = getFirstAccessibleRoute(user);

  // If the user lands on "/" without Dashboard permission, send them to their first permitted page
  if (
    normalized === "/" &&
    !canAccessRoute(user, "/") &&
    firstAccessible &&
    firstAccessible !== "/"
  ) {
    return <Navigate to={firstAccessible} replace />;
  }

  const allowed =
    isKnownAppRoute(normalized) && canAccessRoute(user, normalized);

  return (
    <div className="flex h-dvh overflow-hidden">
      <Sidebar user={user} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header user={user} />
        <main className="flex-1 overflow-y-auto px-4 py-6 md:px-8 md:py-8">
          <div className="mx-auto w-full max-w-full">
            {allowed ? (
              <Outlet context={context} />
            ) : (
              <NotFoundPage homeTo={firstAccessible} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
