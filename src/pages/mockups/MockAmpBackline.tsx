import { useState, useCallback, useRef } from "react";
import { GlassCard } from "@/components/ui/glass-card";

import marshallImg from "@/assets/amps/marshall-jcm800.webp";
import orangeImg from "@/assets/amps/orange-rockerverb.webp";
import fenderImg from "@/assets/amps/fender-amp.avif";

/* ── Types ── */
type CardId = "british-highgain" | "orange-british" | "american-clean" | "british-chimey" | "american-highgain" | "chain" | "tone";

interface AmpDef {
  id: CardId;
  label: string;
  sub: string;
  img: string;
  colSpan?: string;
  rowSpan?: string;
  scaleFactor?: number;
}

const AMP_DEFS: AmpDef[] = [
  { id: "british-highgain", label: "British High-Gain", sub: "100W · EL34 · 1981 era", img: marshallImg, colSpan: "md:col-span-2", scaleFactor: 1.3 },
  { id: "orange-british", label: "Orange British Tube", sub: "50W · EL34 · Channel switching", img: orangeImg, rowSpan: "md:row-span-2", scaleFactor: 1.35 },
  { id: "american-clean", label: "American Clean", sub: "Clean · Tweed voicing", img: fenderImg, scaleFactor: 1.4 },
  { id: "british-chimey", label: "British Chimey", sub: "30W · EL84 · 1960s vibe", img: fenderImg, scaleFactor: 1.35 },
  { id: "american-highgain", label: "American High-Gain", sub: "Dual Rect · 6L6 · Modern", img: marshallImg, scaleFactor: 1.35 },
];

/* ── Signal Chain diagram ── */
function SignalChainCard() {
  const nodes = ["Guitar", "Pedals", "Amp", "Cab", "Mic"];
  return (
    <div className="flex flex-col justify-center h-full gap-3 p-5">
      <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
        Signal Chain
      </span>
      <div className="flex items-center gap-2">
        {nodes.map((n, i) => (
          <div key={n} className="flex items-center gap-2">
            <div className="px-2 py-1 rounded bg-white/[0.08] border border-white/[0.06] font-mono text-[10px] text-foreground">
              {n}
            </div>
            {i < nodes.length - 1 && (
              <span className="text-muted-foreground text-xs">→</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Tone Profile mini chart ── */
function ToneProfileCard() {
  const stats = [
    { label: "Gain", value: 85 },
    { label: "Headroom", value: 40 },
    { label: "Clarity", value: 70 },
    { label: "Warmth", value: 90 },
  ];
  return (
    <div className="flex flex-col justify-center h-full gap-3 p-5">
      <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
        Tone Profile
      </span>
      <div className="space-y-2">
        {stats.map((s) => (
          <div key={s.label} className="flex items-center gap-2">
            <span className="font-mono text-[10px] text-muted-foreground w-16">
              {s.label}
            </span>
            <div className="flex-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
              <div
                className="h-full rounded-full bg-primary/80"
                style={{ width: `${s.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Page ── */
export default function MockAmpBackline() {
  const [expandedCard, setExpandedCard] = useState<CardId | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const toggle = useCallback((id: CardId) => {
    setExpandedCard((prev) => (prev === id ? null : id));
  }, []);

  return (
    <div className="dark min-h-screen w-full bg-black">
      {/* Backdrop overlay */}
      {expandedCard && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          style={{ transition: "opacity 0.3s ease" }}
          onClick={() => setExpandedCard(null)}
        />
      )}

      <main className="relative pb-24">
        {/* Header */}
        <div className="max-w-6xl mx-auto px-5 pt-8 pb-4">
          <h1 className="font-mono text-lg font-bold text-white tracking-tight">
            Backline
          </h1>
          <p className="font-mono text-xs text-white/40 mt-1">
            The amps behind the sound.
          </p>
        </div>

        {/* Bento grid */}
        <div
          ref={gridRef}
          className="max-w-6xl mx-auto px-5 grid grid-cols-1 md:grid-cols-3 gap-3"
          style={{ gridAutoRows: "220px" }}
        >
          {AMP_DEFS.map((amp, i) => (
            <GlassCard
              key={amp.id}
              className={`${amp.colSpan || ""} ${amp.rowSpan || ""}`}
              staggerIndex={i}
              expanded={expandedCard === amp.id}
              containerRef={gridRef}
              scaleFactor={amp.scaleFactor}
              onClick={() => toggle(amp.id)}
            >
              <img
                src={amp.img}
                alt={amp.label}
                className="absolute inset-0 w-full h-full object-cover"
              />
              {/* Bottom vignette + label */}
              <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4 flex flex-col justify-end">
                <span className="font-mono text-sm font-bold text-white tracking-wide drop-shadow-lg">
                  {amp.label}
                </span>
                <span className="font-mono text-[10px] text-white/60 mt-0.5">
                  {amp.sub}
                </span>
              </div>
            </GlassCard>
          ))}

          {/* Signal Chain */}
          <GlassCard
            className="md:col-span-1"
            staggerIndex={AMP_DEFS.length}
            expanded={expandedCard === "chain"}
            containerRef={gridRef}
            onClick={() => toggle("chain")}
          >
            <SignalChainCard />
          </GlassCard>

          {/* Tone Profile */}
          <GlassCard
            className="md:col-span-1"
            staggerIndex={AMP_DEFS.length + 1}
            expanded={expandedCard === "tone"}
            containerRef={gridRef}
            onClick={() => toggle("tone")}
          >
            <ToneProfileCard />
          </GlassCard>
        </div>
      </main>
    </div>
  );
}
