import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

export function NeuSurface({
  children,
  className,
  inset = false,
}: {
  children: ReactNode;
  className?: string;
  inset?: boolean;
}) {
  return (
    <div className={cn(inset ? "neu-panel-inset" : "neu-panel", "rounded-[28px]", className)}>
      {children}
    </div>
  );
}

export function NeuButton({
  children,
  className,
  pressed = false,
}: {
  children: ReactNode;
  className?: string;
  pressed?: boolean;
}) {
  return (
    <button className={cn("neu-button px-6 py-3 font-mono text-sm tracking-[0.08em]", className)} data-pressed={pressed ? "true" : "false"}>
      {children}
    </button>
  );
}

export function NeuIconButton({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <button className={cn("neu-tile flex h-14 w-14 items-center justify-center", className)}>
      {children}
    </button>
  );
}

export function NeuInput({
  placeholder,
  value,
  className,
  align = "left",
}: {
  placeholder?: string;
  value?: string;
  className?: string;
  align?: "left" | "center";
}) {
  return (
    <div className={cn("neu-input px-5 py-4 font-mono text-base", align === "center" && "text-center", className)}>
      {value ? <span>{value}</span> : <span className="opacity-70">{placeholder}</span>}
    </div>
  );
}

export function NeuTextarea({
  placeholder,
  value,
  className,
  rows = 4,
}: {
  placeholder?: string;
  value?: string;
  className?: string;
  rows?: number;
}) {
  return (
    <div className={cn("neu-input p-5 font-mono text-base", className)} style={{ minHeight: `${rows * 2.5}rem` }}>
      {value ? (
        <div className="whitespace-pre-line leading-7">{value}</div>
      ) : (
        <span className="opacity-70">{placeholder}</span>
      )}
    </div>
  );
}

export function NeuSlider({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  return (
    <div className={cn("relative h-4", className)}>
      <div className="neu-slider-track absolute inset-x-0 top-1/2 h-3 -translate-y-1/2" />
      <div className="neu-slider-fill absolute left-0 top-1/2 h-3 -translate-y-1/2 rounded-full" style={{ width: `${value}%` }} />
      <div className="neu-slider-thumb absolute top-1/2 h-8 w-8 -translate-y-1/2" style={{ left: `calc(${value}% - 16px)` }} />
    </div>
  );
}

export function NeuToggle({
  checked,
  className,
}: {
  checked: boolean;
  className?: string;
}) {
  return (
    <div className={cn("neu-toggle-track relative h-12 w-24 p-1", className)}>
      <div
        className={cn(
          "neu-toggle-thumb absolute top-1/2 h-10 w-10 -translate-y-1/2 transition-all duration-200",
          checked ? "left-[calc(100%-2.75rem)] neu-accent-bg" : "left-1",
        )}
      />
    </div>
  );
}

export function NeuSegmentedControl({
  options,
  value,
  className,
}: {
  options: string[];
  value: string;
  className?: string;
}) {
  return (
    <div className={cn("grid gap-3 rounded-[26px] p-2 neu-panel-soft", className)} style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}>
      {options.map((option) => {
        const active = option === value;

        return (
          <div
            key={option}
            className={cn(
              "rounded-[20px] px-5 py-3 text-center font-mono text-sm uppercase tracking-[0.12em] transition-all",
              active ? "neu-panel text-[var(--neu-text)]" : "text-[var(--neu-text-dim)]",
            )}
          >
            {option}
          </div>
        );
      })}
    </div>
  );
}

export function NeuSelect({
  label,
  value,
  className,
}: {
  label?: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={cn("neu-input flex items-center justify-between gap-4 px-5 py-4", className)}>
      <div className="space-y-1">
        {label ? <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--neu-text-dim)]">{label}</div> : null}
        <div className="font-mono text-base text-[var(--neu-text)]">{value}</div>
      </div>
      <div className="font-mono text-xl text-[var(--neu-text-dim)]">⌄</div>
    </div>
  );
}

export function NeuProgressBar({
  value,
  label,
  className,
}: {
  value: number;
  label?: string;
  className?: string;
}) {
  const clamped = Math.max(0, Math.min(100, value));

  return (
    <div className={cn("space-y-3", className)}>
      {label ? <div className="font-mono text-sm tracking-[0.14em] text-[var(--neu-text-dim)]">{label}</div> : null}
      <div className="rounded-full p-1 neu-panel-inset">
        <div className="h-10 rounded-full bg-[var(--neu-surface-strong)]">
          <div
            className="h-full rounded-full neu-accent-bg shadow-[0_0_18px_color-mix(in_srgb,var(--neu-accent)_28%,transparent)]"
            style={{ width: `${clamped}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export function NeuSpinner({
  className,
  size = "md",
}: {
  className?: string;
  size?: "sm" | "md";
}) {
  const shell = size === "sm" ? "h-16 w-16" : "h-24 w-24";
  const spokeOffset = size === "sm" ? "translate-y-[-22px]" : "translate-y-[-34px]";

  return (
    <div className={cn("relative rounded-full neu-panel-inset", shell, className)}>
      {Array.from({ length: 12 }).map((_, index) => (
        <span
          key={index}
          className="absolute left-1/2 top-1/2 h-4 w-1.5 origin-center rounded-full bg-[var(--neu-text)]/35"
          style={{ transform: `translateX(-50%) ${spokeOffset} rotate(${index * 30}deg)`, opacity: 0.25 + index * 0.05 }}
        />
      ))}
    </div>
  );
}

export function NeuPhoneFrame({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto w-[280px] rounded-[40px] border border-white/30 p-4 neu-panel", className)}>
      <div className="rounded-[30px] p-5 neu-panel-inset">{children}</div>
    </div>
  );
}

export function NeuStatBars({
  values,
  activeIndex,
  className,
}: {
  values: number[];
  activeIndex?: number;
  className?: string;
}) {
  return (
    <div className={cn("grid grid-cols-7 items-end gap-3", className)}>
      {values.map((value, index) => {
        const active = index === activeIndex;
        return (
          <div key={index} className="flex flex-col items-center gap-2">
            <div className="relative flex h-40 w-8 items-end rounded-full p-1 neu-panel-inset">
              <div
                className={cn("w-full rounded-full", active ? "neu-accent-bg shadow-[0_0_16px_color-mix(in_srgb,var(--neu-accent)_28%,transparent)]" : "bg-[var(--neu-text)]/18")}
                style={{ height: `${Math.max(12, Math.min(100, value))}%` }}
              />
            </div>
            <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--neu-text-dim)]">
              {["M", "T", "W", "T", "F", "S", "S"][index] ?? ""}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function NeuRadioDot({
  active,
  className,
}: {
  active?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("relative h-14 w-14 rounded-full neu-panel-soft", className)}>
      <div className="absolute inset-[10px] rounded-full neu-panel-inset" />
      {active ? <div className="absolute inset-[18px] rounded-full neu-accent-bg shadow-[0_0_14px_color-mix(in_srgb,var(--neu-accent)_30%,transparent)]" /> : null}
    </div>
  );
}

export function NeuMetricCard({
  title,
  value,
  subtitle,
  accent = false,
  className,
}: {
  title: string;
  value: string;
  subtitle?: string;
  accent?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("neu-card p-6", className)}>
      <div className="font-mono text-sm tracking-[0.12em] text-[var(--neu-text-dim)]">{title}</div>
      <div className={cn("mt-6 font-mono text-5xl font-semibold tracking-tight", accent && "neu-accent")}>{value}</div>
      {subtitle ? <div className="mt-3 font-mono text-sm text-[var(--neu-text-dim)]">{subtitle}</div> : null}
    </div>
  );
}

export function NeuGauge({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  const clamped = Math.max(0, Math.min(100, value));
  const rotation = (clamped / 100) * 180 - 90;
  const style = {
    "--neu-rotation": `${rotation}deg`,
  } as CSSProperties;

  return (
    <div className={cn("neu-card p-6", className)}>
      <div className="mx-auto flex h-44 w-44 items-center justify-center rounded-full neu-panel-inset">
        <div className="relative h-28 w-28 rounded-full neu-panel-inset">
          <div
            className="absolute left-1/2 top-1/2 h-12 w-1.5 -translate-x-1/2 -translate-y-[90%] rounded-full neu-accent-bg"
            style={{ transform: `translateX(-50%) translateY(-90%) rotate(var(--neu-rotation))`, ...style }}
          />
          <div className="absolute inset-[34%] rounded-full neu-panel" />
        </div>
      </div>
    </div>
  );
}

export function NeuKnob({
  value,
  label,
  className,
  size = "md",
}: {
  value: number;
  label?: string;
  className?: string;
  size?: "sm" | "md";
}) {
  const clamped = Math.max(0, Math.min(100, value));
  const rotation = (clamped / 100) * 270 - 135;
  const shellClass = size === "sm" ? "h-16 w-16" : "h-24 w-24";
  const insetClass = size === "sm" ? "inset-[10px]" : "inset-[14px]";
  const coreClass = size === "sm" ? "inset-[18px]" : "inset-[26px]";
  const needleClass = size === "sm" ? "h-5 w-1" : "h-8 w-1.5";
  const labelClass = size === "sm" ? "text-[10px]" : "text-[11px]";

  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      <div className={cn("relative flex items-center justify-center rounded-full neu-panel", shellClass)}>
        <div className={cn("absolute rounded-full neu-panel-inset", insetClass)} />
        <div className={cn("absolute rounded-full bg-[var(--neu-surface-strong)]", coreClass)} />
        <div
          className={cn("absolute left-1/2 top-1/2 origin-bottom -translate-x-1/2 -translate-y-full rounded-full bg-[var(--neu-text)]", needleClass)}
          style={{ transform: `translateX(-50%) translateY(-100%) rotate(${rotation}deg)` }}
        />
        <div className="absolute inset-2 rounded-full border border-white/10" />
      </div>
      {label ? (
        <div className={cn("font-mono uppercase tracking-[0.18em] text-[var(--neu-text-dim)]", labelClass)}>{label}</div>
      ) : null}
    </div>
  );
}

export function NeuFader({
  value,
  label,
  className,
  size = "md",
}: {
  value: number;
  label?: string;
  className?: string;
  size?: "sm" | "md";
}) {
  const clamped = Math.max(0, Math.min(100, value));
  const shellClass = size === "sm" ? "h-52 w-14 rounded-[22px]" : "h-72 w-20 rounded-[28px]";
  const trackClass = size === "sm" ? "top-4 h-[calc(100%-32px)] w-3" : "top-5 h-[calc(100%-40px)] w-4";
  const thumbClass = size === "sm" ? "h-7 w-10 rounded-[14px]" : "h-9 w-14 rounded-[16px]";
  const thumbOffset = size === "sm" ? 14 : 18;
  const bottomInset = size === "sm" ? "bottom-4" : "bottom-5";
  const labelClass = size === "sm" ? "text-[10px]" : "text-[11px]";
  const thumbBottom = `calc(${clamped}% - ${thumbOffset}px)`;

  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      <div className={cn("relative flex items-center justify-center neu-panel-soft", shellClass)}>
        <div className={cn("absolute rounded-full neu-panel-inset", trackClass)} />
        <div className={cn("absolute w-4 rounded-full", bottomInset)} style={{ height: `calc(${clamped}% - 8px)` }}>
          <div className="h-full w-full rounded-full neu-accent-bg opacity-90 shadow-[0_0_18px_color-mix(in_srgb,var(--neu-accent)_24%,transparent)]" />
        </div>
        <div className={cn("absolute left-1/2 -translate-x-1/2 neu-panel", thumbClass)} style={{ bottom: thumbBottom }} />
      </div>
      {label ? (
        <div className={cn("font-mono uppercase tracking-[0.18em] text-[var(--neu-text-dim)]", labelClass)}>{label}</div>
      ) : null}
    </div>
  );
}

export function NeuMeter({
  value,
  className,
  size = "md",
}: {
  value: number;
  className?: string;
  size?: "sm" | "md";
}) {
  const clamped = Math.max(0, Math.min(100, value));
  const shellClass = size === "sm" ? "h-40 w-5" : "h-52 w-7";

  return (
    <div className={cn("flex items-end rounded-full p-1 neu-panel-inset", shellClass, className)}>
      <div
        className="w-full rounded-full bg-[var(--neu-accent)] shadow-[0_0_18px_color-mix(in_srgb,var(--neu-accent)_32%,transparent)]"
        style={{ height: `${clamped}%` }}
      />
    </div>
  );
}

export function NeuMixerStrip({
  title,
  source,
  fader,
  meter,
  pan,
  tone,
  active = false,
  className,
}: {
  title: string;
  source: string;
  fader: number;
  meter: number;
  pan: number;
  tone: number;
  active?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("neu-card flex min-h-[420px] flex-col gap-4 p-4", active && "ring-1 ring-[color:var(--neu-accent)]/35", className)}>
      <div className="space-y-1">
        <div className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-[var(--neu-text)]">{title}</div>
        <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--neu-text-dim)]">{source}</div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <NeuButton className="px-0 py-1.5 text-[10px]">M</NeuButton>
        <NeuButton className="px-0 py-1.5 text-[10px]">S</NeuButton>
      </div>

      <div className="space-y-3">
        <NeuKnob value={tone} label="Tone" size="sm" />
        <NeuKnob value={pan} label="Pan" size="sm" />
      </div>

      <div className="mt-auto flex items-end justify-center gap-3">
        <NeuMeter value={meter} size="sm" />
        <NeuFader value={fader} size="sm" className="scale-[0.92]" />
      </div>

      <div className="flex items-center justify-between rounded-[18px] px-3 py-2.5 neu-panel-inset">
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--neu-text-dim)]">Out</span>
        <span className="font-mono text-xs text-[var(--neu-text)]">-4 dB</span>
      </div>
    </div>
  );
}
