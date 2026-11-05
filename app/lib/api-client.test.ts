import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiFetch, apiFetchForm, CustomApiError } from "./api-client";

const json = (status: number, body?: unknown) =>
  new Response(body === undefined ? null : JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

const fetchMock = vi.fn<typeof fetch>();

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});

const calledUrls = () => fetchMock.mock.calls.map(([url]) => String(url));

describe("apiFetch", () => {
  it("unwraps the { code, payload } envelope", async () => {
    fetchMock.mockResolvedValueOnce(
      json(200, { code: "OK", message: "ok", payload: { id: 1 } }),
    );
    await expect(apiFetch("/x")).resolves.toEqual({ id: 1 });
  });

  it("returns plain JSON bodies as-is and handles 204", async () => {
    fetchMock.mockResolvedValueOnce(json(200, [1, 2]));
    await expect(apiFetch("/x")).resolves.toEqual([1, 2]);

    fetchMock.mockResolvedValueOnce(new Response(null, { status: 204 }));
    await expect(apiFetch("/x")).resolves.toBeUndefined();
  });

  it("sends cookies and a JSON content type", async () => {
    fetchMock.mockResolvedValueOnce(json(200, {}));
    await apiFetch("/x", { headers: { "X-Test": "1" } });
    const init = fetchMock.mock.calls[0][1]!;
    expect(init.credentials).toBe("include");
    expect(init.headers).toMatchObject({
      "Content-Type": "application/json",
      "X-Test": "1",
    });
  });

  it("throws CustomApiError with the backend message and status", async () => {
    fetchMock.mockResolvedValueOnce(json(403, { message: "Forbidden resource" }));
    const err = await apiFetch("/users").catch((e) => e) as CustomApiError;
    expect(err).toBeInstanceOf(CustomApiError);
    expect(err.status).toBe(403);
    expect(err.message).toBe("Forbidden resource");
  });

  it("refreshes the session once on 401 and retries the request", async () => {
    fetchMock
      .mockResolvedValueOnce(json(401))
      .mockResolvedValueOnce(json(200, {})) // /auth/refresh
      .mockResolvedValueOnce(json(200, { ok: true }));

    await expect(apiFetch("/users")).resolves.toEqual({ ok: true });
    expect(calledUrls()).toEqual([
      "/users",
      "/auth/refresh?isRedirect=false",
      "/users",
    ]);
  });

  it("gives up when the refresh fails", async () => {
    fetchMock
      .mockResolvedValueOnce(json(401, { message: "Unauthorized" }))
      .mockResolvedValueOnce(json(401)); // /auth/refresh

    const err = await apiFetch("/users").catch((e) => e) as CustomApiError;
    expect(err.status).toBe(401);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("does not loop: a second 401 after refresh is final", async () => {
    fetchMock
      .mockResolvedValueOnce(json(401))
      .mockResolvedValueOnce(json(200, {}))
      .mockResolvedValueOnce(json(401, { message: "still no" }));

    const err = await apiFetch("/users").catch((e) => e) as CustomApiError;
    expect(err.message).toBe("still no");
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("never tries to refresh for the sign-in endpoint", async () => {
    fetchMock.mockResolvedValueOnce(json(401, { message: "bad creds" }));
    await expect(apiFetch("/auth/signin-by-email")).rejects.toThrow(
      "bad creds",
    );
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("shares one refresh request between concurrent 401s", async () => {
    fetchMock.mockImplementation(async (url) =>
      String(url).startsWith("/auth/refresh")
        ? json(200, {})
        : json(401),
    );
    await Promise.allSettled([apiFetch("/a"), apiFetch("/b")]);
    const refreshCalls = calledUrls().filter((u) =>
      u.startsWith("/auth/refresh"),
    );
    expect(refreshCalls).toHaveLength(1);
  });
});

describe("apiFetchForm", () => {
  it("lets the browser set the multipart boundary (no Content-Type)", async () => {
    fetchMock.mockResolvedValueOnce(json(200, {}));
    await apiFetchForm("/upload", { method: "POST", body: new FormData() });
    const headers = fetchMock.mock.calls[0][1]!.headers as Headers;
    expect(headers.has("Content-Type")).toBe(false);
  });

  it("retries the upload as multipart after a token refresh", async () => {
    const body = new FormData();
    body.append("file", new Blob(["x"]), "a.png");
    fetchMock
      .mockResolvedValueOnce(json(401))
      .mockResolvedValueOnce(json(200, {}))
      .mockResolvedValueOnce(json(200, { historyId: "h1" }));

    await expect(
      apiFetchForm("/reading-histories", { method: "POST", body }),
    ).resolves.toEqual({ historyId: "h1" });

    const retryInit = fetchMock.mock.calls[2][1]!;
    expect(retryInit.body).toBe(body);
    expect((retryInit.headers as Headers).has("Content-Type")).toBe(false);
  });
});
