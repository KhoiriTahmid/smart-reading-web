import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router";
import { describe, expect, it } from "vitest";
import { NotFoundPage } from "./not-found-page";

const renderAt = (homeTo?: string | null) =>
  render(
    <MemoryRouter initialEntries={["/history", "/nope"]} initialIndex={1}>
      <Routes>
        <Route path="/nope" element={<NotFoundPage homeTo={homeTo} />} />
        <Route path="/history" element={<p>history page</p>} />
        <Route path="/" element={<p>home page</p>} />
      </Routes>
    </MemoryRouter>,
  );

describe("NotFoundPage", () => {
  it("renders the 404 message", () => {
    renderAt();
    expect(screen.getByText("404")).toBeInTheDocument();
    expect(screen.getByText("Page Not Found")).toBeInTheDocument();
  });

  it("Back to Home goes to the given route", async () => {
    renderAt("/");
    await userEvent.click(screen.getByRole("button", { name: /back to home/i }));
    expect(screen.getByText("home page")).toBeInTheDocument();
  });

  it("Go Back returns to the previous page", async () => {
    renderAt();
    await userEvent.click(screen.getByRole("button", { name: /go back/i }));
    expect(screen.getByText("history page")).toBeInTheDocument();
  });

  it("hides Back to Home when the user has no accessible page", () => {
    renderAt(null);
    expect(
      screen.queryByRole("button", { name: /back to home/i }),
    ).not.toBeInTheDocument();
  });
});
