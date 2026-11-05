import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it, vi } from "vitest";
import type { AuthUser } from "~/types/auth";

vi.mock("~/services/auth.service", () => ({ logout: vi.fn() }));

import { Sidebar } from "./sidebar";

const renderSidebar = (permissions: Record<string, boolean>) => {
  const user: AuthUser = {
    userId: "u-1",
    name: "Siti Aminah",
    email: "siti@example.com",
    role: { roleId: "r", name: "Role", permissions },
  };
  return render(
    <MemoryRouter>
      <Sidebar user={user} />
    </MemoryRouter>,
  );
};

const navLabels = () =>
  screen.getAllByRole("link").map((a) => a.getAttribute("title"));

describe("Sidebar", () => {
  it("shows every page for FULL_ACCESS", () => {
    renderSidebar({ FULL_ACCESS: true });
    expect(navLabels()).toEqual([
      "Dashboard",
      "OCR to Speech",
      "History Read",
      "Users",
      "Roles",
    ]);
  });

  it("hides pages the role does not grant", () => {
    renderSidebar({
      DASHBOARD: true,
      "OCR.CREATE": true,
      "READING_HISTORY.LIST": true,
      "USER.LIST": false,
    });
    expect(navLabels()).toEqual(["Dashboard", "OCR to Speech", "History Read"]);
  });

  it("shows no links when the role has no permissions", () => {
    renderSidebar({});
    expect(screen.queryAllByRole("link")).toHaveLength(0);
  });

  it("shows the user's initials and email", () => {
    renderSidebar({});
    // rendered twice: compact (mobile) and full (desktop) layouts
    expect(screen.getAllByText("SA")).toHaveLength(2);
    expect(screen.getByText("siti@example.com")).toBeInTheDocument();
  });
});
