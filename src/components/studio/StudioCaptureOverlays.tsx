import { ChevronRight, Sparkles, X } from "lucide-react";

import { cn } from "@/lib/utils";

type PianoRollOverlayMode = "transform-menu" | "humanize-dialog";

interface PianoRollCaptureOverlayProps {
  mode: PianoRollOverlayMode;
}

export function PianoRollCaptureOverlay({ mode }: PianoRollCaptureOverlayProps) {
  if (mode === "transform-menu") {
    return (
      <div className="pointer-events-none absolute inset-x-0 bottom-28 z-30 flex justify-center">
        <div className="flex rounded-[18px] border border-white/8 bg-[#2d2d32]/96 shadow-[0_30px_90px_-36px_rgba(0,0,0,0.78)] backdrop-blur-xl">
          <div className="min-w-[290px] border-r border-white/8 px-4 py-3">
            {[
              "Transform",
              "Pitch",
              "Duration",
              "Velocity",
              "Creative",
              "Notes",
              "Selection",
            ].map((item) => (
              <div key={item} className="flex items-center justify-between rounded-lg px-3 py-2.5 text-[15px] text-white/86">
                <span>{item}</span>
                <ChevronRight className="h-4 w-4 text-white/28" />
              </div>
            ))}
            <div className="mt-2 border-t border-white/6 pt-2">
              {[
                { label: "Cut", shortcut: "Ctrl+X", disabled: true },
                { label: "Copy", shortcut: "Ctrl+C", disabled: true },
                { label: "Paste", shortcut: "Ctrl+V", disabled: false },
                { label: "Duplicate", shortcut: "Ctrl+D", disabled: true },
                { label: "Delete", shortcut: "Del", disabled: true },
              ].map((item) => (
                <div
                  key={item.label}
                  className={cn(
                    "flex items-center justify-between rounded-lg px-3 py-2.5 text-[15px]",
                    item.disabled ? "text-white/28" : "text-white/88",
                  )}
                >
                  <span>{item.label}</span>
                  <span className="font-mono text-[13px] text-white/24">{item.shortcut}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="min-w-[258px] px-4 py-3">
            {[
              ["Quantize", "Q"],
              ["Humanize", "H"],
              ["Reverse Order", ""],
              ["Mirror (Time)", ""],
              ["Mirror (Pitch)", ""],
              ["Strumming", "S"],
            ].map(([label, shortcut]) => (
              <div key={label} className="flex items-center justify-between rounded-lg px-3 py-2.5 text-[15px] text-white/86">
                <span>{label}</span>
                {shortcut ? <span className="font-mono text-[13px] text-white/32">{shortcut}</span> : null}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pointer-events-none absolute inset-0 z-30 flex items-start justify-center bg-black/16 pt-14">
      <div className="w-[610px] rounded-[22px] border border-white/8 bg-[#2b2b31]/98 shadow-[0_32px_100px_-36px_rgba(0,0,0,0.86)] backdrop-blur-xl">
        <div className="flex items-center justify-between border-b border-white/6 px-5 py-4">
          <div className="flex items-center gap-3 text-[17px] font-semibold text-white">
            <Sparkles className="h-4 w-4 text-[#53a3ff]" />
            Humanize Notes
          </div>
          <X className="h-4 w-4 text-white/35" />
        </div>

        <div className="space-y-5 px-5 py-5 text-white/84">
          <div>
            <div className="mb-3 text-[13px] text-white/45">Quick Presets</div>
            <div className="grid grid-cols-4 gap-2">
              {["Subtle", "Moderate", "Strong", "Extreme"].map((item) => (
                <div key={item} className="rounded-xl bg-white/5 px-4 py-3 text-center text-[14px] font-medium text-white/88">
                  {item}
                </div>
              ))}
            </div>
          </div>

          {[
            ["Timing Variation", "±25 ticks", "~52ms at 120 BPM", "left-[24%]"],
            ["Velocity Variation", "±10 units", "Range: 70 - 90", "left-[32%]"],
            ["Duration Variation", "±8%", "Notes will be 92% - 108% of original length", "left-[38%]"],
            ["Overall Strength", "70%", "Controls intensity of all humanization", "left-[67%]"],
          ].map(([label, value, note, thumbPosition]) => (
            <div key={label}>
              <div className="mb-2 flex items-center justify-between text-[14px]">
                <span className="text-white/56">{label}</span>
                <span className="font-semibold text-white/84">{value}</span>
              </div>
              <div className="relative h-2 rounded-full bg-white/6">
                <div className={cn("absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-[#53a3ff] shadow-[0_0_0_4px_rgba(83,163,255,0.14)]", thumbPosition)} />
              </div>
              <div className="mt-2 text-[13px] text-white/32">{note}</div>
            </div>
          ))}

          <div className="rounded-2xl border border-[#325d92] bg-[#243147] px-4 py-3 text-[14px] text-[#78b4ff]">
            <div className="font-medium">Preview</div>
            <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2">
              <span>Timing: ±25 ticks (52ms at 120 BPM)</span>
              <span>Velocity: ±10 units</span>
              <span>Duration: ±8%</span>
              <span>Strength: 70%</span>
            </div>
          </div>

          <div className="rounded-2xl border border-[#5f4b1c] bg-[#3e3318] px-4 py-3 text-[14px] text-[#ffc44d]">
            Humanizing 17 notes. Each apply will create different random variations.
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-white/6 px-5 py-4">
          <button className="rounded-xl px-4 py-2.5 text-[15px] text-white/46">Cancel</button>
          <button className="rounded-xl bg-[#3d8fff] px-5 py-2.5 text-[15px] font-semibold text-white shadow-[0_12px_34px_-16px_rgba(61,143,255,0.75)]">
            Apply Humanize
          </button>
        </div>
      </div>
    </div>
  );
}
