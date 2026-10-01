import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { EXPERT_HOSPITAL_NAME, clearSession, setSession, type Clinician } from "@/lib/auth";

// Route-level checks for the expert surface: landing, gating and the
// "experts never fire the hospital dashboard endpoints" rule.

const get = vi.fn();
vi.mock("@/lib/api", async (importActual) => ({
  ...(await importActual<typeof import("@/lib/api")>()),
  api: {
    get: (...args: unknown[]) => get(...args),
    post: vi.fn().mockResolvedValue({ data: {} }),
    patch: vi.fn(),
  },
}));

const { default: App } = await import("./App");

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
} as unknown as typeof ResizeObserver;

const PERMS = { view_mothers: true, message_mothers: true, escalate: false, create_discharges: false, manage_staff: false };

function respond(url: string) {
  if (url === "/auth/me") return Promise.resolve({ data: { permissions: PERMS } });
  if (url === "/expert-requests/stats")
    return Promise.resolve({
      data: {
        requests_this_week: 4,
        active_conversations: 2,
        completed_this_week: 1,
        rating_good_count: 3,
        rating_total_count: 4,
      },
    });
  if (url.startsWith("/expert-requests/")) return Promise.resolve({ data: { requests: [] } });
  if (url === "/alerts") return Promise.reject({ response: { status: 403, data: {} } });
  return Promise.resolve({ data: {} });
}

function signIn(hospital_name: string) {
  const clinician: Clinician = {
    id: `c-${hospital_name}`,
    name: "Esi Owusu",
    email: "esi@example.com",
    role: "Psychologist",
    hospital_id: "h1",
    hospital_name,
  };
  setSession(clinician);
}

let root: Root;
let container: HTMLDivElement;
async function renderAt(path: string) {
  window.history.pushState({}, "", path);
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
  await act(async () => root.render(<App />));
  await act(async () => {});
}

const requested = () => get.mock.calls.map((c) => c[0] as string);

beforeEach(() => {
  get.mockReset();
  get.mockImplementation(respond);
});
afterEach(() => {
  act(() => root.unmount());
  container.remove();
  clearSession();
});

describe("expert accounts", () => {
  it("get the expert dashboard and never fire the hospital dashboard endpoints", async () => {
    signIn(EXPERT_HOSPITAL_NAME);
    await renderAt("/dashboard");
    expect(container.textContent).toContain("Here's how your requests are going.");
    expect(container.textContent).toContain("75% good");
    expect(requested()).toEqual(
      expect.arrayContaining(["/expert-requests/stats", "/expert-requests/queue", "/expert-requests/mine"]),
    );
    for (const hospitalOnly of ["/mothers", "/calls", "/dashboard/stats"]) {
      expect(requested()).not.toContain(hospitalOnly);
    }
  });

  it("reach /expert-requests and see it in the sidebar", async () => {
    signIn(EXPERT_HOSPITAL_NAME);
    await renderAt("/expert-requests");
    expect(window.location.pathname).toBe("/expert-requests");
    expect(container.querySelector("h1")?.textContent).toBe("Expert requests");
    expect(container.querySelector('nav a[href="/expert-requests"]')).not.toBeNull();
    expect(container.querySelector('nav a[href="/mothers"]')).toBeNull();
  });

  it("land on their queue from the sign-in screen", async () => {
    signIn(EXPERT_HOSPITAL_NAME);
    await renderAt("/login");
    expect(window.location.pathname).toBe("/expert-requests");
  });
});

describe("hospital accounts", () => {
  it("are bounced off /expert-requests and don't see the nav item", async () => {
    signIn("Korle Bu Teaching Hospital");
    await renderAt("/expert-requests");
    expect(window.location.pathname).toBe("/dashboard");
    expect(requested().some((u) => u.startsWith("/expert-requests"))).toBe(false);
    expect(container.querySelector('nav a[href="/expert-requests"]')).toBeNull();
  });
});
