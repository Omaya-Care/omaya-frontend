import { act } from "react";
import { createRoot } from "react-dom/client";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { afterEach, describe, expect, it } from "vitest";
import { clearSession, setSession } from "@/lib/auth";
import { DocsGate } from "./DocsGate";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

function Where() {
  const { pathname, search } = useLocation();
  return <p>{pathname + search}</p>;
}

async function render() {
  const el = document.createElement("div");
  const root = createRoot(el);
  await act(async () =>
    root.render(
      <MemoryRouter initialEntries={["/docs"]}>
        <Routes>
          <Route path="/docs" element={<DocsGate><p>docs</p></DocsGate>} />
          <Route path="*" element={<Where />} />
        </Routes>
      </MemoryRouter>,
    ),
  );
  const text = el.textContent;
  act(() => root.unmount());
  return text;
}

const CLINICIAN = {
  id: "c1",
  name: "Kofi Asante",
  email: "kofi@example.com",
  role: "Administrator" as const,
  hospital_id: "h1",
  hospital_name: "Omaya",
};

afterEach(() => clearSession());

describe("DocsGate", () => {
  it("sends a signed-out visitor to sign-in, returning to /docs", async () => {
    expect(await render()).toBe("/login?next=%2Fdocs");
  });

  it("forces a pending password rotation first", async () => {
    setSession(CLINICIAN, true);
    expect(await render()).toBe("/change-password");
  });

  it("renders the docs for a signed-in session (allowlist is server-side)", async () => {
    setSession(CLINICIAN);
    expect(await render()).toBe("docs");
  });
});
