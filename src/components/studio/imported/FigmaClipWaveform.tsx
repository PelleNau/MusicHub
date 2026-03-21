export interface FigmaClipWaveformProps {
  waveformData?: number[];
  color?: string;
  className?: string;
}

export function FigmaClipWaveform({
  waveformData = [],
  color = "#6366f1",
  className = "",
}: FigmaClipWaveformProps) {
  if (waveformData.length === 0) {
    return <div className={`h-full w-full bg-gradient-to-r from-indigo-600/10 to-purple-600/10 ${className}`} />;
  }

  const points = waveformData
    .map((value, index) => {
      const x = (index / waveformData.length) * 100;
      const y = 50 + value * 50;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg className={`h-full w-full ${className}`} preserveAspectRatio="none">
      <polyline points={points} fill="none" stroke={color} strokeWidth="1" opacity="0.8" />
    </svg>
  );
}
