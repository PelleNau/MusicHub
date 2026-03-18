import { describe, expect, it } from "vitest";
import { resolveInitialConnectorMode, shouldReconnectSocket } from "@/services/hostConnectorMode";

describe("hostConnectorMode", () => {
  it("only enters mock mode when explicitly forced", () => {
    expect(
      resolveInitialConnectorMode({
        forceMock: true,
        inShell: false,
        httpOk: false,
      }),
    ).toBe("mock");

    expect(
      resolveInitialConnectorMode({
        forceMock: false,
        inShell: false,
        httpOk: false,
      }),
    ).toBe("unavailable");
  });

  it("prefers real host when health succeeds", () => {
    expect(
      resolveInitialConnectorMode({
        forceMock: false,
        inShell: false,
        httpOk: true,
      }),
    ).toBe("real");
  });

  it("uses shell-degraded when desktop shell is present but host is not healthy", () => {
    expect(
      resolveInitialConnectorMode({
        forceMock: false,
        inShell: true,
        httpOk: false,
      }),
    ).toBe("shell-degraded");
  });

  it("reconnects websocket only when HTTP is healthy and WS is down", () => {
    expect(shouldReconnectSocket({ httpOk: true, wsOk: false })).toBe(true);
    expect(shouldReconnectSocket({ httpOk: true, wsOk: true })).toBe(false);
    expect(shouldReconnectSocket({ httpOk: false, wsOk: false })).toBe(false);
  });
});
