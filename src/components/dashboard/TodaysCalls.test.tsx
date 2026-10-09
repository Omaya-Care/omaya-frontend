import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it } from "vitest";
import { TodaysCalls } from "./TodaysCalls";
import type { TodayCall } from "@/hooks/useDashboardCards";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const row = (id: string, motherName: string, channel: string): TodayCall => ({
  id,
  motherName,
  channel,
  callType: "Day 3 check-in",
  status: "completed",
  scheduledAt: "2026-10-09T09:00:00Z",
});

const ROWS = [
  row("v", "Abena Mensah", "voice"),
  row("wc", "Akosua Boateng", "whatsapp_call"),
  row("chat", "Esi Owusu", "whatsapp"),
];

let root: Root;
let container: HTMLDivElement;
afterEach(() => {
  act(() => root?.unmount());
});

async function render(rows: TodayCall[]) {
  container = document.createElement("div");
  root = createRoot(container);
  await act(async () =>
    root.render(
      <MemoryRouter>
        <TodaysCalls rows={rows} loading={false} />
      </MemoryRouter>,
    ),
  );
}

const tab = (label: string) =>
  [...container.querySelectorAll<HTMLButtonElement>('[role="tab"]')].find((b) => b.textContent === label)!;
const viewAll = () => [...container.querySelectorAll("a")].find((a) => a.textContent?.includes("View all"))!;

describe("Today's conversations", () => {
  it("lists calls (phone + WhatsApp calls) by default, linking to /calls", async () => {
    await render(ROWS);
    expect(container.textContent).toContain("Today's conversations");
    expect(container.textContent).toContain("Abena Mensah");
    expect(container.textContent).toContain("Akosua Boateng");
    expect(container.textContent).not.toContain("Esi Owusu");
    expect(viewAll().getAttribute("href")).toBe("/calls");
  });

  it("the Chats tab lists only WhatsApp chats, linking to /chats", async () => {
    await render(ROWS);
    await act(async () => tab("Chats").click());
    expect(container.textContent).toContain("Esi Owusu");
    expect(container.textContent).not.toContain("Abena Mensah");
    expect(container.textContent).not.toContain("Akosua Boateng");
    expect(viewAll().getAttribute("href")).toBe("/chats");
  });

  it("shows the chats empty state when there are no chats", async () => {
    await render([row("v", "Abena Mensah", "voice")]);
    await act(async () => tab("Chats").click());
    expect(container.textContent).toContain("No chats today");
    expect(container.innerHTML).toContain("chat-bubbles.svg");
  });
});
