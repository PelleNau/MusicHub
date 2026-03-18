import {
  tauriShell,
  type ShellInfo,
  type SidecarStatus,
} from "@/services/tauriShell";

type ShellEventName = "shell.info" | "sidecar.status";

export async function wireTauriShellBridge(
  emit: (event: ShellEventName, payload: ShellInfo | SidecarStatus) => void,
  onHealthySidecar: () => void,
): Promise<Array<() => void>> {
  const unsubs: Array<() => void> = [];

  try {
    const info = await tauriShell.getShellInfo();
    emit("shell.info", info);
  } catch {
    // Best-effort shell metadata only.
  }

  try {
    const status = await tauriShell.getSidecarStatus();
    emit("sidecar.status", status);
  } catch {
    // Best-effort sidecar status only.
  }

  try {
    const unlisten = await tauriShell.onSidecarStatus((status) => {
      emit("sidecar.status", status);
      if (status.healthy) onHealthySidecar();
    });
    unsubs.push(unlisten);
  } catch {
    // Event stream is optional for browser mode and early shell startup.
  }

  return unsubs;
}
