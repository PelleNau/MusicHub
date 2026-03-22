import type { DeviceInstance, TrackSend } from "@/types/studio";

function ensureSendExists(sends: TrackSend[], returnTrackId: string) {
  const existing = sends.find((send) => send.return_track_id === returnTrackId);
  if (existing) {
    return sends;
  }

  return [...sends, { return_track_id: returnTrackId, level: 0 }];
}

export function setSendLevel(
  sends: TrackSend[] | null | undefined,
  returnTrackId: string,
  level: number,
) {
  const next = (sends ?? []).map((send) =>
    send.return_track_id === returnTrackId ? { ...send, level } : send,
  );

  return ensureSendExists(next, returnTrackId).map((send) =>
    send.return_track_id === returnTrackId ? { ...send, level } : send,
  );
}

export function toggleSendPreFader(
  sends: TrackSend[] | null | undefined,
  returnTrackId: string,
) {
  const next = ensureSendExists(sends ?? [], returnTrackId);

  return next.map((send) =>
    send.return_track_id === returnTrackId
      ? { ...send, pre_fader: !send.pre_fader }
      : send,
  );
}

export function routeSend(
  sends: TrackSend[] | null | undefined,
  currentTargetId: string | undefined,
  nextTargetId: string | undefined,
) {
  const next = [...(sends ?? [])];

  if (currentTargetId) {
    const currentIndex = next.findIndex((send) => send.return_track_id === currentTargetId);
    if (currentIndex >= 0) {
      if (!nextTargetId) {
        next.splice(currentIndex, 1);
        return next;
      }

      next[currentIndex] = {
        ...next[currentIndex],
        return_track_id: nextTargetId,
      };
      return next;
    }
  }

  if (!nextTargetId) {
    return next;
  }

  return ensureSendExists(next, nextTargetId);
}

export function appendDevice(
  devices: DeviceInstance[] | null | undefined,
  device: DeviceInstance,
) {
  return [...(devices ?? []), device];
}

export function toggleDeviceEnabled(
  devices: DeviceInstance[] | null | undefined,
  deviceId: string,
  enabled: boolean,
) {
  return (devices ?? []).map((device) =>
    device.id === deviceId ? { ...device, enabled } : device,
  );
}

export function removeDevice(
  devices: DeviceInstance[] | null | undefined,
  deviceId: string,
) {
  return (devices ?? []).filter((device) => device.id !== deviceId);
}

export function moveDevice(
  devices: DeviceInstance[] | null | undefined,
  deviceId: string,
  direction: -1 | 1,
) {
  const next = [...(devices ?? [])];
  const index = next.findIndex((device) => device.id === deviceId);
  const targetIndex = index + direction;

  if (index < 0 || targetIndex < 0 || targetIndex >= next.length) {
    return next;
  }

  [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
  return next;
}

export function updateDeviceParams(
  devices: DeviceInstance[] | null | undefined,
  deviceId: string,
  params: Record<string, number>,
) {
  return (devices ?? []).map((device) =>
    device.id === deviceId ? { ...device, params: { ...device.params, ...params } } : device,
  );
}
