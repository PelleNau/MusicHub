import { BookOpen, ChevronDown, Eye, Figma, Plus, Sparkles, ThumbsDown, ThumbsUp } from "lucide-react";

export function StudioAssistantRail() {
  return (
    <aside className="flex h-full w-[372px] shrink-0 flex-col border-r border-white/8 bg-[#2e2b2a] text-white">
      <div className="flex items-center gap-3 border-b border-white/8 px-5 py-4">
        <Figma className="h-4 w-4 text-white/82" />
        <ChevronDown className="h-3.5 w-3.5 text-white/38" />
        <div className="text-[15px] font-semibold">MusicHub</div>
        <ChevronDown className="h-3.5 w-3.5 text-white/38" />
      </div>

      <div className="flex items-center gap-3 border-b border-white/8 px-4 py-3">
        <div className="rounded-md border border-white/10 bg-white/4 px-2 py-1 text-[11px] uppercase tracking-[0.16em] text-white/56">
          AI
        </div>
        <button className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/4 text-white/68">
          <Eye className="h-4 w-4" />
        </button>
        <div className="flex h-9 min-w-0 items-center rounded-full border border-white/10 bg-[#373534] px-4 text-[14px] text-white/76">
          <span>/ home</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="text-[18px] text-white/92">XL(520), Fullscreen(800)</div>

        <ul className="mt-4 list-disc space-y-2 pl-5 text-[14px] leading-relaxed text-white/86">
          <li>Live height display with tabular-nums font</li>
        </ul>

        <div className="mt-7 text-[16px] font-semibold text-white/92">Viewing Modes:</div>
        <div className="mt-4 rounded-[18px] bg-[#3a3837] px-4 py-4 font-mono text-[13px] leading-8 text-[#96d5ff]">
          <div>Minimized: [◉ Mixer 4 tracks]</div>
          <div className="text-white/72">(40px bar)</div>
          <div className="mt-4">Normal: Full mixer (240-600px adjustable)</div>
          <div className="mt-4">Fullscreen: Maximum space (800px)</div>
        </div>

        <div className="mt-7 text-[16px] font-semibold text-white/92">Visual Polish:</div>
        <ul className="mt-4 space-y-2 text-[14px] leading-relaxed text-white/88">
          {[
            "Professional hover states",
            "Active preset highlighting",
            "Icon transitions",
            "Smooth animations",
            "Color-coded feedback",
            "Tooltips on all buttons",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="mt-0.5 text-[#7dde83]">✔</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>

        <div className="mt-7 text-[16px] font-semibold text-white/92">Technical:</div>
        <ul className="mt-4 list-disc space-y-3 pl-5 text-[14px] leading-relaxed text-white/84">
          <li>State managed in both <span className="rounded bg-[#41506a] px-1.5 py-0.5 text-[#8cc0ff]">Mixer.tsx</span> and <span className="rounded bg-[#41506a] px-1.5 py-0.5 text-[#8cc0ff]">StudioLayout.tsx</span></li>
          <li>Props: <span className="rounded bg-[#41506a] px-1.5 py-0.5 text-[#8cc0ff]">isMinimized</span>, <span className="rounded bg-[#41506a] px-1.5 py-0.5 text-[#8cc0ff]">onToggleMinimize</span></li>
          <li>Dynamic max height based on mode</li>
          <li>Smart UI (hides controls when not needed)</li>
          <li>No console errors</li>
          <li>Production-ready code</li>
        </ul>

        <p className="mt-8 text-[15px] leading-8 text-white/88">
          The Mixer now offers world-class workspace flexibility matching professional DAWs like Ableton Live and Logic Pro.
        </p>

        <div className="mt-8 rounded-[20px] border border-white/10 bg-[#32302f] px-5 py-4 shadow-[0_20px_60px_-34px_rgba(0,0,0,0.65)]">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[15px] font-semibold text-[#79e48b]">Make Mixer Expandable</div>
              <div className="mt-2 text-[14px] text-[#79e48b]/82">Version 153</div>
            </div>
            <div className="h-3.5 w-3.5 rounded-full bg-[#55d86a] shadow-[0_0_0_4px_rgba(85,216,106,0.12)]" />
          </div>
        </div>
      </div>

      <div className="border-t border-white/8 px-5 py-4">
        <div className="min-h-[138px] rounded-[20px] border border-white/10 bg-[#2d2b2a] px-4 py-4 text-[17px] text-white/26">
          Ask for changes
        </div>

        <div className="mt-5 flex items-center justify-between">
          <div className="flex items-center gap-4 text-white/74">
            <button className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-white/6">
              <Plus className="h-5 w-5" />
            </button>
            <button className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-white/6">
              <BookOpen className="h-5 w-5" />
            </button>
            <button className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-white/6">
              <Sparkles className="h-5 w-5" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-md px-3 py-2 text-[14px] text-white/76">Default</div>
            <button className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 text-white/72">
              <ChevronDown className="h-4 w-4 -rotate-90" />
            </button>
          </div>
        </div>

        <div className="mt-5 flex items-center gap-3 text-white/56">
          <ThumbsUp className="h-4 w-4" />
          <ThumbsDown className="h-4 w-4" />
          <div className="flex h-5 w-5 items-center justify-center rounded-full border border-white/12 text-[11px]">?</div>
        </div>
      </div>
    </aside>
  );
}
