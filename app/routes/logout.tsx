import { useEffect } from "react";
import { useNavigate } from "react-router";
import { LoadingScreen } from "~/components/layout/loading-screen";
import { logout } from "~/services/auth.service";
import { useOcrTtsStore } from "~/stores/ocr-tts.store";

/**
 * Landing page for the backend's /logout redirect. Clears the session cookies
 * (if they are still valid) and returns the user to the sign-in page.
 */
export default function LogoutRoute() {
  const navigate = useNavigate();

  useEffect(() => {
    void logout()
      .catch(() => undefined)
      .finally(() => {
        useOcrTtsStore.getState().reset();
        navigate("/login", { replace: true });
      });
  }, [navigate]);

  return <LoadingScreen />;
}
