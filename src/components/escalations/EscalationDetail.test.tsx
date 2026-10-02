import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { AlertRow } from "@/hooks/useAlerts";
import type { CallDetailData } from "@/hooks/useCall";

const post = vi.fn();
vi.mock("@/lib/api", async (importActual) => ({
  ...(await importActual<typeof import("@/lib/api")>()),
  api: { get: vi.fn(), post: (...args: unknown[]) => post(...args) },
}));

const CALL = {
  id: "call-1",
  motherId: "m1",
  motherName: "Ama Serwaa",
  scheduledAt: "",
  startedAt: "",
  callType: "check_in",
  status: "completed",
  channel: "voice",
  direction: "outbound",
  durationSeconds: 120,
  dayInCare: 6,
  deliveryType: "",
  severity: "crisis",
  flagsRaised: 0,
  endReason: "",
  summary: "Heavy bleeding.",
  audioUrl: "",
  recordingConsent: null,
  transcript: [{ speaker: "mother", text: "I am bleeding." }],
  flagReasons: [],
} satisfies CallDetailData;

vi.mock("@/hooks/useCall", () => ({
  useCall: () => ({ data: CALL, loading: false, failed: false }),
}));
vi.mock("@/hooks/usePermissions", () => ({
  usePermissions: () => ({ can: () => true, loading: false, error: false }),
}));

const { EscalationDetail } = await import("./EscalationDetail");
const { signIn } = await import("@/lib/auth-api");

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

function alertRow(id: string, status: AlertRow["status"] = "open"): AlertRow {
  return {
    id,
    callId: "call-1",
    motherId: "m1",
    motherName: "Ama Serwaa",
    dayPostpartum: 6,
    severity: "crisis",
    createdAt: "2026-09-30T07:30:00Z",
    timeLeftMinutes: 30,
    status,
    pageStatus: "not_applicable",
    provisionalReason: null,
    acknowledgedAt: null,
    acknowledgedByName: null,
    resolvedAt: null,
    resolvedByName: null,
    resolutionNote: null,
  };
}

let root: Root;
let container: HTMLDivElement;

/** Mirrors Escalations.tsx, which keys the panel by alert id. */
async function render(alert: AlertRow | null) {
  await act(async () =>
    root.render(
      <MemoryRouter>
        <EscalationDetail key={alert?.id ?? "none"} alert={alert} onChanged={() => {}} />
      </MemoryRouter>,
    ),
  );
}

const noteInput = () => container.querySelector<HTMLInputElement>('input[aria-label="Resolution note"]');
const button = (label: string) =>
  [...container.querySelectorAll("button")].find((b) => b.textContent?.includes(label))!;

async function type(value: string) {
  const input = noteInput()!;
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!;
  await act(async () => {
    setter.call(input, value);
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
}

beforeEach(() => {
  post.mockReset();
  container = document.createElement("div");
  root = createRoot(container);
});
afterEach(() => {
  act(() => root.unmount());
});

describe("EscalationDetail resolution note", () => {
  it("survives opening the recording & transcript and coming back", async () => {
    await render(alertRow("a1"));
    await type("Called her, advised to come in.");

    await act(async () => button("Transcript").click());
    expect(noteInput()).toBeNull();
    // The transcript view's back button is the first button in its header.
    await act(async () => container.querySelector("button")!.click());

    expect(noteInput()!.value).toBe("Called her, advised to come in.");
  });

  it("is kept per alert when switching alerts, and across Acknowledge", async () => {
    await render(alertRow("a2"));
    await type("Spoke to husband.");

    await render(alertRow("a3"));
    expect(noteInput()!.value).toBe("");

    // Back to a2 after it was acknowledged (it left the Open list meanwhile).
    await render(null);
    await render(alertRow("a2", "acknowledged"));
    expect(noteInput()!.value).toBe("Spoke to husband.");
  });

  it("sends the note on resolve and then forgets it", async () => {
    post.mockResolvedValue({ data: {} });
    await render(alertRow("a4"));
    await type("  Seen at clinic.  ");

    await act(async () => button("Resolve").click());
    expect(post).toHaveBeenCalledWith("/alerts/a4/resolve", { resolution_note: "Seen at clinic." });

    await render(alertRow("a5"));
    await render(alertRow("a4"));
    expect(noteInput()!.value).toBe("");
  });

  it("is wiped when a new session starts", async () => {
    await render(alertRow("a6"));
    await type("Draft from the previous user.");
    await render(null);

    post.mockResolvedValue({
      data: {
        clinician: { id: "c2", name: null, email: "x@example.com", role: "Midwife", hospital_id: "h1", hospital_name: "H" },
        must_change_password: false,
      },
    });
    await act(async () => void (await signIn("x@example.com", "pw")));

    await render(alertRow("a6"));
    expect(noteInput()!.value).toBe("");
  });
});
