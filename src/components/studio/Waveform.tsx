import { useMemo } from "react";

export interface WaveformData {
  peaks: number[];
  peaksRight?: number[];
  channels: 1 | 2;
}

interface WaveformProps {
  waveformData: WaveformData;
  width: number;
  height: number;
  color?: string;
  gain?: number;
  fadeIn?: number;
  fadeOut?: number;
  contentOffset?: number;
}

export function Waveform({
  waveformData,
  width,
  height,
  color = "#4ade80",
  gain = 1,
  fadeIn = 0,
  fadeOut = 0,
  contentOffset = 0,
}: WaveformProps) {
  const { leftPath, rightPath } = useMemo(() => {
    const { peaks, peaksRight, channels } = waveformData;
    if (!peaks || peaks.length === 0) return { leftPath: "", rightPath: "" };

    const peaksToRender = Math.min(peaks.length, Math.max(width * 2, 100));
    const skipFactor = Math.max(1, Math.floor(peaks.length / peaksToRender));
    const startPeakIndex = Math.floor(contentOffset * peaks.length);

    const channelHeight = channels === 2 ? height / 2 : height;
    const centerY = channels === 2 ? channelHeight / 2 : height / 2;

    const leftPath = generateChannelPath(
      peaks,
      startPeakIndex,
      skipFactor,
      width,
      centerY,
      channelHeight,
      gain,
      fadeIn,
      fadeOut,
    );

    let rightPath = "";
    if (channels === 2 && peaksRight) {
      const rightCenterY = height / 2 + channelHeight / 2;
      rightPath = generateChannelPath(
        peaksRight,
        startPeakIndex,
        skipFactor,
        width,
        rightCenterY,
        channelHeight,
        gain,
        fadeIn,
        fadeOut,
      );
    }

    return { leftPath, rightPath };
  }, [waveformData, width, height, gain, fadeIn, fadeOut, contentOffset]);

  return (
    <svg
      width={width}
      height={height}
      className="absolute inset-0 pointer-events-none"
      style={{ opacity: 0.7 }}
    >
      <path d={leftPath} fill={color} opacity={0.6} stroke={color} strokeWidth={0.5} />
      {rightPath ? <path d={rightPath} fill={color} opacity={0.6} stroke={color} strokeWidth={0.5} /> : null}
      {waveformData.channels === 2 ? (
        <line x1={0} y1={height / 2} x2={width} y2={height / 2} stroke="currentColor" strokeWidth={0.5} opacity={0.2} />
      ) : null}
    </svg>
  );
}

function generateChannelPath(
  peaks: number[],
  startIndex: number,
  skipFactor: number,
  width: number,
  centerY: number,
  channelHeight: number,
  gain: number,
  fadeIn: number,
  fadeOut: number,
) {
  const points: string[] = [];
  const step = width / Math.ceil(peaks.length / skipFactor);

  let x = 0;
  for (let index = startIndex; index < peaks.length; index += skipFactor) {
    const progress = index / peaks.length;
    let envelope = 1;
    if (fadeIn > 0 && progress < fadeIn) envelope = progress / fadeIn;
    else if (fadeOut > 0 && progress > 1 - fadeOut) envelope = (1 - progress) / fadeOut;

    const amplitude = peaks[index] * gain * envelope;
    const scaled = amplitude * (channelHeight / 2) * 0.9;
    const yTop = centerY - Math.abs(scaled);

    if (x === 0) points.push(`M ${x} ${centerY}`);
    points.push(`L ${x} ${yTop}`);
    x += step;
  }

  x = width;
  for (let index = peaks.length - 1; index >= startIndex; index -= skipFactor) {
    const progress = index / peaks.length;
    let envelope = 1;
    if (fadeIn > 0 && progress < fadeIn) envelope = progress / fadeIn;
    else if (fadeOut > 0 && progress > 1 - fadeOut) envelope = (1 - progress) / fadeOut;

    const amplitude = peaks[index] * gain * envelope;
    const scaled = amplitude * (channelHeight / 2) * 0.9;
    const yBottom = centerY + Math.abs(scaled);
    points.push(`L ${x} ${yBottom}`);
    x -= step;
  }

  points.push("Z");
  return points.join(" ");
}
