import { AudioLines, Drum, Guitar, Mic, Music2, Piano, RotateCcw, Settings2, Speaker, Waves } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

type TrackTemplateAction = "audio" | "midi" | "return";

interface TrackTemplateMenuProps {
  onCreateAudioTrack: () => void;
  onCreateMidiTrack: () => void;
  onCreateReturnTrack: () => void;
  children: React.ReactNode;
}

interface TrackTemplateCard {
  title: string;
  type: "AUDIO" | "MIDI" | "RETURN";
  description: string;
  action: TrackTemplateAction;
  colorClass: string;
  icon: React.ComponentType<{ className?: string }>;
}

const TEMPLATE_CARDS: TrackTemplateCard[] = [
  {
    title: "Vocal",
    type: "AUDIO",
    description: "Recording vocals with compression",
    action: "audio",
    colorClass: "bg-[#ff6b6b]",
    icon: Mic,
  },
  {
    title: "Guitar",
    type: "AUDIO",
    description: "Electric or acoustic guitar",
    action: "audio",
    colorClass: "bg-[#ff9f0a]",
    icon: Guitar,
  },
  {
    title: "Drums",
    type: "MIDI",
    description: "MIDI drums with sampler",
    action: "midi",
    colorClass: "bg-[#ff5b4d]",
    icon: Drum,
  },
  {
    title: "Piano",
    type: "MIDI",
    description: "MIDI piano/keys",
    action: "midi",
    colorClass: "bg-[#3da5ff]",
    icon: Piano,
  },
  {
    title: "Synth",
    type: "MIDI",
    description: "MIDI synthesizer",
    action: "midi",
    colorClass: "bg-[#9b6bff]",
    icon: Music2,
  },
  {
    title: "Bass",
    type: "MIDI",
    description: "Bass instrument",
    action: "midi",
    colorClass: "bg-[#40b34f]",
    icon: Speaker,
  },
  {
    title: "Audio",
    type: "AUDIO",
    description: "Basic audio track",
    action: "audio",
    colorClass: "bg-[#57d6d0]",
    icon: AudioLines,
  },
  {
    title: "MIDI",
    type: "MIDI",
    description: "Basic MIDI track",
    action: "midi",
    colorClass: "bg-[#8aa0ff]",
    icon: Music2,
  },
  {
    title: "Return - Reverb",
    type: "RETURN",
    description: "Return track for reverb effects",
    action: "return",
    colorClass: "bg-[#3b82f6]",
    icon: RotateCcw,
  },
  {
    title: "Return - Delay",
    type: "RETURN",
    description: "Return track for delay effects",
    action: "return",
    colorClass: "bg-[#8b5cf6]",
    icon: Waves,
  },
];

export function TrackTemplateMenu({
  onCreateAudioTrack,
  onCreateMidiTrack,
  onCreateReturnTrack,
  children,
}: TrackTemplateMenuProps) {
  const runAction = (action: TrackTemplateAction) => {
    if (action === "audio") {
      onCreateAudioTrack();
      return;
    }
    if (action === "midi") {
      onCreateMidiTrack();
      return;
    }
    onCreateReturnTrack();
  };

  return (
    <Popover>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        align="start"
        side="bottom"
        sideOffset={10}
        className="w-[462px] rounded-[20px] border border-white/8 bg-[#232429] p-4 text-white shadow-[0_20px_60px_rgba(0,0,0,0.45)]"
      >
        <div className="mb-4 flex items-center justify-between">
          <div className="text-[14px] font-semibold uppercase tracking-[0.08em] text-white/84">Track Templates</div>
          <button className="inline-flex items-center gap-2 rounded-md px-2 py-1 text-[13px] text-white/62 transition-colors hover:bg-white/6 hover:text-white/84">
            <Settings2 className="h-3.5 w-3.5" />
            Manage
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {TEMPLATE_CARDS.map((template) => {
            const Icon = template.icon;
            return (
              <button
                key={template.title}
                onClick={() => runAction(template.action)}
                className="rounded-[18px] border border-white/8 bg-[#26272d] p-4 text-left transition-colors hover:border-white/14 hover:bg-[#2a2b31]"
              >
                <div className="mb-3 flex items-start gap-3">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl text-white ${template.colorClass}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-[16px] font-semibold text-white">{template.title}</div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-white/48">{template.type}</div>
                  </div>
                </div>
                <p className="text-[13px] leading-6 text-white/44">{template.description}</p>
              </button>
            );
          })}
        </div>

        <div className="mt-5 border-t border-white/8 pt-4">
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={onCreateAudioTrack}
              className="flex h-12 items-center justify-center gap-2 rounded-xl bg-white/5 text-[15px] font-semibold text-white/82 transition-colors hover:bg-white/8"
            >
              <span className="text-lg leading-none">+</span>
              Audio
            </button>
            <button
              onClick={onCreateMidiTrack}
              className="flex h-12 items-center justify-center gap-2 rounded-xl bg-white/5 text-[15px] font-semibold text-white/82 transition-colors hover:bg-white/8"
            >
              <span className="text-lg leading-none">+</span>
              MIDI
            </button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
