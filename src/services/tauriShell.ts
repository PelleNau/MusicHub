export interface SidecarStatus {
  running: boolean;
  pid: number | null;
  restart_count: number;
  healthy: boolean;
  last_error: string | null;
}

export interface ShellInfo {
  shell: string;
  version: string;
  platform: string;
  arch: string;
}

type Unlisten = () => void;
export type AppScaleCommand = "up" | "down" | "reset";

export function isInTauriShell(): boolean {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

async function getTauriCore() {
  return import("@tauri-apps/api/core");
}

async function getTauriEvent() {
  return import("@tauri-apps/api/event");
}

class TauriShellBridge {
  get available(): boolean {
    return isInTauriShell();
  }

  async invoke<T>(command: string, args?: Record<string, unknown>): Promise<T> {
    const { invoke } = await getTauriCore();
    return invoke<T>(command, args);
  }

  async getSidecarStatus(): Promise<SidecarStatus> {
    return this.invoke<SidecarStatus>("get_sidecar_status");
  }

  async getShellInfo(): Promise<ShellInfo> {
    return this.invoke<ShellInfo>("get_shell_info");
  }

  async restartSidecar(): Promise<void> {
    await this.invoke("restart_sidecar");
  }

  async onSidecarStatus(fn: (payload: SidecarStatus) => void): Promise<Unlisten> {
    const { listen } = await getTauriEvent();
    return listen<SidecarStatus>("sidecar:status", (event) => {
      if (event.payload) fn(event.payload);
    });
  }

  async onSidecarStdout(fn: (line: string) => void): Promise<Unlisten> {
    const { listen } = await getTauriEvent();
    return listen<string>("sidecar:stdout", (event) => {
      if (typeof event.payload === "string") fn(event.payload);
    });
  }

  async onSidecarStderr(fn: (line: string) => void): Promise<Unlisten> {
    const { listen } = await getTauriEvent();
    return listen<string>("sidecar:stderr", (event) => {
      if (typeof event.payload === "string") fn(event.payload);
    });
  }

  async onAppScaleCommand(fn: (command: AppScaleCommand) => void): Promise<Unlisten> {
    const { listen } = await getTauriEvent();
    return listen<string>("app:interface-scale", (event) => {
      if (
        event.payload === "up" ||
        event.payload === "down" ||
        event.payload === "reset"
      ) {
        fn(event.payload);
      }
    });
  }
}

export const tauriShell = new TauriShellBridge();
