import { useEffect, useRef } from "react";
import type { SessionTrack } from "@/types/studio";

interface UseStudioRuntimeCoordinationOptions {
  timelineRef: React.RefObject<HTMLDivElement | null>;
  handleTimelineWheel: (event: WheelEvent) => void;
  isMock: boolean;
  tracks: SessionTrack[];
  buildGraph: (tracks: SessionTrack[]) => void;
}

export function useStudioRuntimeCoordination({
  timelineRef,
  handleTimelineWheel,
  isMock,
  tracks,
  buildGraph,
}: UseStudioRuntimeCoordinationOptions) {
  const handleWheelRef = useRef(handleTimelineWheel);
  handleWheelRef.current = handleTimelineWheel;

  useEffect(() => {
    const element = timelineRef.current;
    if (!element) return;

    const onWheel = (event: WheelEvent) => handleWheelRef.current(event);
    element.addEventListener("wheel", onWheel, { passive: false });

    return () => element.removeEventListener("wheel", onWheel);
  }, [timelineRef]);

  useEffect(() => {
    if (!isMock || tracks.length === 0) return;

    try {
      buildGraph(tracks);
    } catch (error) {
      console.error("[Studio] Audio graph build failed:", error);
    }
  }, [buildGraph, isMock, tracks]);
}
