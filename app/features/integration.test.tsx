import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { describe, expect, it, vi, beforeEach } from "vitest";

// Mock the backend services to simulate an authenticated end-to-end user session
vi.mock("~/services/auth.service", () => ({
  getCurrentUser: vi.fn(),
  logout: vi.fn(),
}));

vi.mock("~/services/ocr-tts.service", () => ({
  createOcrTtsJob: vi.fn(),
  getOcrTtsJob: vi.fn(),
  retryOcrTtsJob: vi.fn(),
}));

vi.mock("~/services/history.service", () => ({
  getHistory: vi.fn(),
  getHistoryDetail: vi.fn(),
  retryHistory: vi.fn(),
  deleteHistory: vi.fn(),
}));

vi.mock("~/hooks/use-device-context", () => ({
  useDevice: () => ({ send: vi.fn() }),
}));

import { getCurrentUser } from "~/services/auth.service";
import { createOcrTtsJob, getOcrTtsJob } from "~/services/ocr-tts.service";
import { getHistory, getHistoryDetail } from "~/services/history.service";
import { OcrTtsPanel } from "~/features/ocr-tts/components/ocr-tts-panel";
import { HistoryTable } from "~/features/history/components/history-table";
import { Sidebar } from "~/components/layout/sidebar";
import { useOcrTtsStore } from "~/stores/ocr-tts.store";
import type { AuthUser } from "~/types/auth";
import type { ReadingHistory } from "~/types/domain";

describe("Frontend Integration - Reading Workflows", () => {
  const adminUser: AuthUser = {
    userId: "admin-1",
    name: "Admin User",
    email: "admin@gmail.com",
    role: {
      roleId: "r-admin",
      name: "Super Admin",
      permissions: { FULL_ACCESS: true },
    },
  };

  const standardUser: AuthUser = {
    userId: "user-1",
    name: "Standard User",
    email: "user@gmail.com",
    role: {
      roleId: "r-user",
      name: "User",
      permissions: {
        DASHBOARD: true,
        "OCR.CREATE": true,
        "TTS.CREATE": true,
        "READING_HISTORY.LIST": true,
        "USER.LIST": false,
        "ROLE.LIST": false,
      },
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    useOcrTtsStore.getState().reset();
  });

  it("Integration 1: Sidebar respects RBAC - standard user cannot see Users & Roles links", () => {
    const { unmount } = render(
      <MemoryRouter>
        <Sidebar user={standardUser} />
      </MemoryRouter>,
    );

    const userLinks = screen.getAllByRole("link").map((a) => a.getAttribute("title"));
    expect(userLinks).toContain("Dashboard");
    expect(userLinks).toContain("OCR to Speech");
    expect(userLinks).toContain("History Read");
    expect(userLinks).not.toContain("Users");
    expect(userLinks).not.toContain("Roles");

    unmount();

    // Admin should see all
    render(
      <MemoryRouter>
        <Sidebar user={adminUser} />
      </MemoryRouter>,
    );

    const adminLinks = screen.getAllByRole("link").map((a) => a.getAttribute("title"));
    expect(adminLinks).toContain("Users");
    expect(adminLinks).toContain("Roles");
  });

  it("Integration 2: OCR-to-Speech Job Submission and Result Rendering", async () => {
    vi.mocked(createOcrTtsJob).mockResolvedValue({
      historyId: "hist-e2e-1",
      name: "sample.png",
      status: "COMPLETED",
      extractedText: "Halo ini teks hasil OCR terintegrasi.",
      audioUrl: "https://s3.mock/audio.mp3",
      imageUrl: "https://s3.mock/sample.png",
      voice: "female",
      remark: null,
      errorMessage: null,
      createdAt: new Date().toISOString(),
    });

    render(
      <MemoryRouter>
        <OcrTtsPanel />
      </MemoryRouter>,
    );

    // Pick file
    const fakeFile = new File([new Uint8Array(100)], "sample.png", { type: "image/png" });
    useOcrTtsStore.getState().pick(fakeFile);

    // Click Convert button
    const convertBtn = screen.getByRole("button", { name: /convert to speech/i });
    await userEvent.click(convertBtn);

    // Expect status to reach done and extracted text to be shown
    await waitFor(() => {
      expect(screen.getByText("Halo ini teks hasil OCR terintegrasi.")).toBeInTheDocument();
    });
    expect(createOcrTtsJob).toHaveBeenCalledWith(fakeFile, "female", "sample.png", "id");
  });

  it("Integration 3: Reading History Table opens Detail Modal with full metadata and playable audio", async () => {
    const mockDetail: ReadingHistory = {
      id: "hist-detail-1",
      title: "Dokumen Sejarah",
      reader: "Khoiri",
      extractedText: "Teks lengkap dokumen sejarah Indonesia.",
      audioUrl: "https://s3.mock/audio-detail.mp3",
      imageUrl: "https://s3.mock/img-detail.png",
      voice: "male",
      lang: "id",
      readAt: "2026-11-04T12:00:00Z",
      status: "done",
    };
    vi.mocked(getHistoryDetail).mockResolvedValue(mockDetail);

    const mockItems: ReadingHistory[] = [mockDetail];

    render(
      <MemoryRouter>
        <HistoryTable items={mockItems} />
      </MemoryRouter>,
    );

    // Verify row displays
    expect(screen.getByText("Dokumen Sejarah")).toBeInTheDocument();

    // Click the "Detail" button
    const detailBtn = screen.getByRole("button", { name: /detail/i });
    await userEvent.click(detailBtn);

    // Verify modal popped up with full text in modal and reader (found in table and in modal)
    await waitFor(() => {
      expect(screen.getAllByText("Teks lengkap dokumen sejarah Indonesia.")).toHaveLength(2);
      expect(screen.getAllByText("Khoiri")).toHaveLength(2);
    });
  });
});
