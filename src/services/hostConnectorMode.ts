export type InitialConnectorMode = "mock" | "real" | "shell-degraded" | "unavailable";

export function resolveInitialConnectorMode(opts: {
  forceMock: boolean;
  inShell: boolean;
  httpOk: boolean;
}): InitialConnectorMode {
  if (opts.forceMock) return "mock";
  if (opts.httpOk) return "real";
  if (opts.inShell) return "shell-degraded";
  return "unavailable";
}

export function shouldReconnectSocket(opts: {
  httpOk: boolean;
  wsOk: boolean;
}): boolean {
  return opts.httpOk && !opts.wsOk;
}
