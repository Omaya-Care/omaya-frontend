import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const get = vi.fn();
vi.mock("@/lib/api", async (importActual) => ({
  ...(await importActual<typeof import("@/lib/api")>()),
  api: { get: (...args: unknown[]) => get(...args) },
}));

const { useCalls } = await import("./useCalls");
type CallKind = Parameters<typeof useCalls>[0];

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

// A backend that predates `kind` ignores it and returns everything merged.
const MERGED = [
  { id: "v", channel: "voice" },
  { id: "wc", channel: "whatsapp_call" },
  { id: "chat", channel: "whatsapp" },
];

let root: Root;
beforeEach(() => {
  get.mockReset();
  get.mockResolvedValue({ data: { calls: MERGED } });
});
afterEach(() => {
  act(() => root?.unmount());
});

async function listedIds(kind: CallKind): Promise<string[]> {
  let ids: string[] = [];
  function Harness() {
    ids = useCalls(kind).data.map((c) => c.id);
    return null;
  }
  root = createRoot(document.createElement("div"));
  await act(async () => root.render(<Harness />));
  return ids;
}

describe("useCalls kind", () => {
  it("asks /calls for the requested kind", async () => {
    await listedIds("chats");
    expect(get).toHaveBeenCalledWith("/calls", { params: { all_dates: true, kind: "chats" } });
  });

  it("keeps WhatsApp calls with the calls, never the chats", async () => {
    expect(await listedIds("calls")).toEqual(["v", "wc"]);
  });

  it("shows only WhatsApp text chats on the chats list", async () => {
    expect(await listedIds("chats")).toEqual(["chat"]);
  });
});
