import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { clearSession, setSession, type Clinician } from "@/lib/auth";

const get = vi.fn();
const post = vi.fn();
vi.mock("@/lib/api", async (importActual) => ({
  ...(await importActual<typeof import("@/lib/api")>()),
  api: {
    get: (...args: unknown[]) => get(...args),
    post: (...args: unknown[]) => post(...args),
  },
}));

const { RequirePermission } = await import("@/components/auth/RequirePermission");
const { resetPermissions, PERMISSION_RETRY_MS } = await import("./usePermissions");
const { invalidateMe, signIn } = await import("@/lib/auth-api");

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const CLINICIAN: Clinician = {
  id: "c1",
  name: "Efua Mensah",
  email: "efua@example.com",
  role: "Midwife",
  hospital_id: "h1",
  hospital_name: "Korle Bu",
};

const ALLOWED = { data: { permissions: { view_mothers: true } } };
const httpError = (status: number) => ({ isAxiosError: true, response: { status, data: {} } });

let root: Root;
let container: HTMLDivElement;

async function mount() {
  container = document.createElement("div");
  root = createRoot(container);
  await act(async () =>
    root.render(
      <MemoryRouter initialEntries={["/mothers"]}>
        <Routes>
          <Route element={<RequirePermission permission="view_mothers" />}>
            <Route path="/mothers" element={<p>mothers page</p>} />
          </Route>
          <Route path="/dashboard" element={<p>dashboard page</p>} />
        </Routes>
      </MemoryRouter>,
    ),
  );
}

const text = () => container.textContent ?? "";
const advance = (ms: number) => act(async () => void (await vi.advanceTimersByTimeAsync(ms)));
const meCalls = () => get.mock.calls.filter(([url]) => url === "/auth/me").length;

beforeEach(() => {
  vi.useFakeTimers();
  get.mockReset();
  post.mockReset();
  setSession(CLINICIAN);
  invalidateMe();
  resetPermissions();
});
afterEach(() => {
  act(() => root.unmount());
  resetPermissions();
  clearSession();
  vi.useRealTimers();
});

describe("usePermissions + RequirePermission", () => {
  it("a failed /auth/me shows a retry state, never a redirect, and recovers on its own", async () => {
    get.mockRejectedValueOnce(httpError(503)).mockResolvedValue(ALLOWED);
    await mount();

    expect(text()).toContain("Couldn’t verify your access");
    expect(text()).not.toContain("dashboard page");

    await advance(PERMISSION_RETRY_MS[0]);
    expect(meCalls()).toBe(2);
    expect(text()).toContain("mothers page");
  });

  it("backs off between retries (2s, 5s, …) while /auth/me keeps failing", async () => {
    get.mockRejectedValue(httpError(504));
    await mount();
    expect(meCalls()).toBe(1);

    await advance(PERMISSION_RETRY_MS[0]);
    expect(meCalls()).toBe(2);
    await advance(PERMISSION_RETRY_MS[1] - 1);
    expect(meCalls()).toBe(2);
    await advance(1);
    expect(meCalls()).toBe(3);
    expect(text()).toContain("Couldn’t verify your access");
  });

  it("the Retry button re-reads /auth/me immediately", async () => {
    get.mockRejectedValueOnce(httpError(500)).mockResolvedValue(ALLOWED);
    await mount();

    const button = [...container.querySelectorAll("button")].find((b) => b.textContent?.includes("Retry"));
    await act(async () => button!.click());

    expect(meCalls()).toBe(2);
    expect(text()).toContain("mothers page");
  });

  it("does not retry a 401 (the interceptor signs the user out)", async () => {
    get.mockRejectedValue(httpError(401));
    await mount();
    await advance(PERMISSION_RETRY_MS[PERMISSION_RETRY_MS.length - 1] * 3);
    expect(meCalls()).toBe(1);
  });

  it("a loaded answer without the permission still redirects", async () => {
    get.mockResolvedValue({ data: { permissions: { view_mothers: false } } });
    await mount();
    expect(text()).toContain("dashboard page");
  });

  it("signing in again as the same user re-reads permissions", async () => {
    get.mockResolvedValueOnce({ data: { permissions: { view_mothers: false } } });
    await mount();
    expect(text()).toContain("dashboard page");
    act(() => root.unmount());

    // The admin granted view_mothers; the user signs in again.
    get.mockResolvedValue(ALLOWED);
    post.mockResolvedValue({ data: { clinician: CLINICIAN, must_change_password: false } });
    await act(async () => void (await signIn(CLINICIAN.email, "pw")));
    await mount();

    expect(meCalls()).toBe(2);
    expect(text()).toContain("mothers page");
  });
});
