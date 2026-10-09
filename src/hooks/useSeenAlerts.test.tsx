import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { clearSession, setSession, type Clinician } from "@/lib/auth";
import type { AlertRow } from "@/hooks/useAlerts";
import { useSeenAlerts } from "./useSeenAlerts";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const clinician = (id: string): Clinician => ({
  id,
  name: "Nurse",
  email: `${id}@example.com`,
  role: "Midwife",
  hospital_id: "h1",
  hospital_name: "Korle Bu",
});

const alert = (id: string, severity: string) => ({ id, severity }) as AlertRow;

let root: Root;
let latest: ReturnType<typeof useSeenAlerts>;
function Harness({ alerts }: { alerts: AlertRow[] }) {
  latest = useSeenAlerts(alerts);
  return null;
}
async function render(alerts: AlertRow[]) {
  await act(async () => root.render(<Harness alerts={alerts} />));
}

beforeEach(() => {
  localStorage.clear();
  root = createRoot(document.createElement("div"));
});
afterEach(() => {
  act(() => root.unmount());
  clearSession();
});

describe("useSeenAlerts", () => {
  it("drops an opened alert from the badge count", async () => {
    setSession(clinician("c1"));
    const alerts = [alert("a1", "elevated"), alert("a2", "crisis")];
    await render(alerts);
    expect(latest.unseenCount).toBe(2);
    await act(async () => latest.markSeen(alerts[0]));
    expect(latest.unseenCount).toBe(1);
  });

  it("counts an alert again once its severity escalates", async () => {
    setSession(clinician("c1"));
    await render([alert("a1", "elevated")]);
    await act(async () => latest.markSeen(alert("a1", "elevated")));
    expect(latest.unseenCount).toBe(0);
    await render([alert("a1", "crisis")]);
    expect(latest.unseenCount).toBe(1);
  });

  it("does not let one clinician's marks silence the badge for the next", async () => {
    setSession(clinician("c1"));
    const alerts = [alert("a1", "crisis")];
    await render(alerts);
    await act(async () => latest.markSeen(alerts[0]));
    expect(latest.unseenCount).toBe(0);

    setSession(clinician("c2"));
    await render(alerts);
    expect(latest.unseenCount).toBe(1);

    setSession(clinician("c1"));
    await render(alerts);
    expect(latest.unseenCount).toBe(0);
  });
});
