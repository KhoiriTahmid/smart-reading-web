import { NotFoundPage } from "~/components/layout/not-found-page";

export function meta() {
  return [{ title: "404 Not Found · Smart Reading" }];
}

export default function NotFoundRoute() {
  return <NotFoundPage />;
}
