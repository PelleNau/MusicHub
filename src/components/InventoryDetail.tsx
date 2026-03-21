import React, { useState, useCallback, useMemo } from "react";
import { HardwareSpecs, InventoryItem } from "@/types/inventory";
import { ItemMeta } from "@/lib/itemMeta";
import {
  Package, Cpu, Music, Zap, Star, X, Plus,
  Monitor, Guitar, Disc, Sliders,
  Keyboard, Speaker, Mic, Volume2, Cable,
  ExternalLink, Calendar, DollarSign, Tag, Info,
  Layers, Activity, CircuitBoard, Pencil, Trash2,
  FileText, Settings, Hash, Search, Loader2, BookOpen,
  Link, MessageSquare, Download, Sparkles, CheckCircle,
  ThumbsUp, ThumbsDown, Lightbulb, Zap as ZapIcon, ArrowRight,
  Save,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getCategoryFallbackIcon } from "@/lib/categoryIcons";
import type { Json } from "@/integrations/supabase/types";

interface InventoryDetailProps {
  item: InventoryItem | null;
  meta?: ItemMeta;
  onSetRating: (id: string, rating: number) => void;
  onAddTag: (id: string, tag: string) => void;
  onRemoveTag: (id: string, tag: string) => void;
  onEdit?: (item: InventoryItem) => void;
  onDelete?: (item: InventoryItem) => void;
}

type InventorySpecs = HardwareSpecs & {
  manualUrl?: string;
};

const ecosystemIcons: Record<string, typeof Package> = {
  Hardware: Cpu, NI: Music, Reason: Zap, Ableton: Music,
};

const ecosystemLabels: Record<string, string> = {
  Hardware: "Hardware", NI: "Native Instruments", Reason: "Reason Studios", Ableton: "Ableton Live",
};

const hardwareCategoryIcons: Record<string, typeof Package> = {
  Synth: Keyboard, Keyboard: Keyboard, "Drum Machine": Disc, Percussion: Disc, Drums: Disc,
  Guitar: Guitar, FX: Sliders, "DJ System": Disc, Controller: Sliders,
  "Audio Interface": Cable, "MIDI Interface": Cable, Monitor: Speaker, Subwoofer: Volume2,
  Turntable: Disc, Computer: Monitor, Furniture: Package, Microphone: Mic, Other: Package,
};

const synthesisColors: Record<string, string> = {
  "Analog subtractive": "from-orange-500/20 to-red-500/20 border-orange-500/30",
  "Digital / hybrid": "from-blue-500/20 to-purple-500/20 border-blue-500/30",
  "Wavetable": "from-cyan-500/20 to-blue-500/20 border-cyan-500/30",
  "FM": "from-green-500/20 to-emerald-500/20 border-green-500/30",
  "Granular": "from-violet-500/20 to-pink-500/20 border-violet-500/30",
  "Physical modeling": "from-amber-500/20 to-yellow-500/20 border-amber-500/30",
  "Sampler": "from-slate-400/20 to-gray-500/20 border-slate-400/30",
  "DSP": "from-indigo-500/20 to-blue-500/20 border-indigo-500/30",
  "Additive": "from-lime-500/20 to-green-500/20 border-lime-500/30",
  "Modular": "from-pink-500/20 to-rose-500/20 border-pink-500/30",
  "Drum synthesis": "from-amber-500/20 to-orange-500/20 border-amber-500/30",
  "Analog processing": "from-red-500/20 to-orange-500/20 border-red-500/30",
  "Sample": "from-slate-400/20 to-gray-500/20 border-slate-400/30",
};

const ECOSYSTEM_GLOW: Record<string, string> = {
  Hardware: "shadow-primary/10",
  NI: "shadow-orange-500/10",
  Kontakt: "shadow-amber-500/10",
  Reaktor: "shadow-fuchsia-500/10",
  Reason: "shadow-red-500/10",
  Ableton: "shadow-blue-500/10",
};

function getSynthColor(synthesis?: string) {
  if (!synthesis) return "from-secondary to-secondary border-border/50";
  for (const [key, val] of Object.entries(synthesisColors)) {
    if (synthesis.toLowerCase().includes(key.toLowerCase())) return val;
  }
  return "from-secondary to-secondary border-border/50";
}

/* ─── Shared Sub-Components ─── */

const DetailCard = React.forwardRef<HTMLDivElement, { children: React.ReactNode; className?: string }>(
  ({ children, className = "" }, ref) => (
    <div ref={ref} className={`rounded-xl bg-card/60 border border-border/60 p-4 backdrop-blur-sm ${className}`}>
      {children}
    </div>
  )
);
DetailCard.displayName = "DetailCard";

function SectionLabel({ icon: Icon, label }: { icon: typeof Package; label: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <Icon className="h-3.5 w-3.5 text-primary" />
      <h3 className="font-mono text-[10px] uppercase tracking-widest text-primary">{label}</h3>
    </div>
  );
}

function MetaChip({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={`p-3 rounded-lg ${accent ? 'bg-primary/5 border border-primary/15' : 'bg-secondary/60 border border-border/50'}`}>
      <span className="block font-mono text-[9px] uppercase tracking-widest text-muted-foreground mb-1">{label}</span>
      <span className={`font-mono text-xs ${accent ? 'text-primary font-medium' : 'text-foreground'}`}>{value}</span>
    </div>
  );
}

function StarRating({ rating, onRate, itemId }: { rating: number; onRate: (id: string, r: number) => void; itemId: string }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button key={star} onMouseEnter={() => setHover(star)} onMouseLeave={() => setHover(0)}
          onClick={() => onRate(itemId, star === rating ? 0 : star)} className="transition-transform hover:scale-110">
          <Star className={`h-5 w-5 transition-colors ${star <= (hover || rating) ? "fill-warning text-warning" : "text-muted-foreground/50"}`} />
        </button>
      ))}
      {rating > 0 && <span className="font-mono text-xs text-muted-foreground ml-2">{rating}/5</span>}
    </div>
  );
}

function TagEditor({ tags, itemId, onAdd, onRemove }: { tags: string[]; itemId: string; onAdd: (id: string, tag: string) => void; onRemove: (id: string, tag: string) => void }) {
  const [input, setInput] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const suggestions = ["favorite", "go-to", "needs-repair", "for-sale", "legacy", "essential", "underused", "live-set", "studio-only"];
  const unusedSuggestions = suggestions.filter((s) => !tags.includes(s));

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {tags.map((tag) => (
          <span key={tag} className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary font-mono text-xs border border-primary/20">
            {tag}
            <button onClick={() => onRemove(itemId, tag)} className="hover:text-accent transition-colors"><X className="h-3 w-3" /></button>
          </span>
        ))}
        {!isAdding && (
          <button onClick={() => setIsAdding(true)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full border border-dashed border-muted-foreground/30 text-muted-foreground font-mono text-xs hover:border-primary/50 hover:text-primary transition-colors">
            <Plus className="h-3 w-3" />Add tag
          </button>
        )}
      </div>
      {isAdding && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Input value={input} onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && input.trim()) { onAdd(itemId, input.trim().toLowerCase()); setInput(""); setIsAdding(false); } if (e.key === "Escape") setIsAdding(false); }}
              placeholder="Type tag name..." className="h-7 bg-secondary border-0 font-mono text-xs w-40" autoFocus />
            <button onClick={() => setIsAdding(false)} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
          </div>
          {unusedSuggestions.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {unusedSuggestions.slice(0, 5).map((s) => (
                <button key={s} onClick={() => { onAdd(itemId, s); setIsAdding(false); }}
                  className="px-2 py-0.5 rounded bg-secondary text-muted-foreground font-mono text-[10px] hover:text-foreground hover:bg-muted transition-colors">{s}</button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Tab Content: Overview (merged info + notes + tags) ─── */

function OverviewTab({ item, rating, tags, onSetRating, onAddTag, onRemoveTag }: {
  item: InventoryItem; rating: number; tags: string[];
  onSetRating: (id: string, r: number) => void;
  onAddTag: (id: string, tag: string) => void;
  onRemoveTag: (id: string, tag: string) => void;
}) {
  return (
    <div className="space-y-3 animate-fade-in">
      {/* Description */}
      {item.description && (
        <DetailCard>
          <SectionLabel icon={FileText} label="Description" />
          <p className="font-mono text-xs leading-relaxed text-foreground">{item.description}</p>
        </DetailCard>
      )}

      {/* Quick Stats Grid */}
      <DetailCard>
        <SectionLabel icon={Info} label="Details" />
        <div className="grid grid-cols-2 gap-2">
          <MetaChip label="Category" value={item.category} />
          <MetaChip label="Type" value={item.type} />
          {item.soundCategory && <MetaChip label="Sound Role" value={item.soundCategory} accent />}
          {item.sonicRole && <MetaChip label="Character" value={item.sonicRole} />}
          {item.synthesis && <MetaChip label="Synthesis" value={item.synthesis} accent />}
          {item.yearReleased && <MetaChip label="Released" value={String(item.yearReleased)} />}
          {item.msrp && <MetaChip label="MSRP" value={item.msrp} />}
        </div>
      </DetailCard>

      {/* Use Cases */}
      {item.useCases && (
        <DetailCard>
          <SectionLabel icon={Tag} label="Use Cases" />
          <div className="flex flex-wrap gap-1.5">
            {item.useCases.split(",").map((uc, i) => (
              <span key={i} className="px-2.5 py-1 rounded-md bg-primary/10 text-primary font-mono text-[10px] border border-primary/15">{uc.trim()}</span>
            ))}
          </div>
        </DetailCard>
      )}

      {/* Rating & Tags */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <DetailCard>
          <SectionLabel icon={Star} label="Your Rating" />
          <StarRating rating={rating} onRate={onSetRating} itemId={item.id} />
        </DetailCard>
        <DetailCard>
          <SectionLabel icon={Tag} label="Tags" />
          <TagEditor tags={tags} itemId={item.id} onAdd={onAddTag} onRemove={onRemoveTag} />
        </DetailCard>
      </div>

      {/* Notes */}
      {item.notes && (
        <DetailCard>
          <SectionLabel icon={FileText} label="Notes" />
          <p className="font-mono text-xs text-foreground/85 leading-relaxed">{item.notes}</p>
        </DetailCard>
      )}

      {/* Keywords */}
      {item.keywords && (
        <DetailCard>
          <SectionLabel icon={Hash} label="Keywords" />
          <div className="flex flex-wrap gap-1">
            {item.keywords.split(" ").filter(Boolean).slice(0, 30).map((kw, i) => (
              <span key={i} className="px-1.5 py-0.5 rounded bg-secondary text-muted-foreground/80 font-mono text-[9px]">{kw}</span>
            ))}
          </div>
        </DetailCard>
      )}
    </div>
  );
}

/* ─── Tab Content: Specs (hardware/software specs + research) ─── */

function SpecsTab({ item }: { item: InventoryItem }) {
  return (
    <div className="space-y-3 animate-fade-in">
      {item.ecosystem === "Hardware" ? <HardwareSpecs item={item} /> : <SoftwareSpecs item={item} />}
      <div className="border-t border-border/30 pt-3 mt-3">
        <ResearchTab key={item.id} item={item} />
      </div>
    </div>
  );
}

function HardwareSpecs({ item }: { item: InventoryItem }) {
  const s = item.specs;
  const connectivity: string[] = [];
  if (s?.midiIn) connectivity.push("MIDI In");
  if (s?.midiOut) connectivity.push("MIDI Out");
  if (s?.midiThru) connectivity.push("MIDI Thru");
  if (s?.usb) connectivity.push("USB");
  if (s?.cv) connectivity.push("CV");
  if (s?.gate) connectivity.push("Gate");
  if (s?.spdif) connectivity.push("S/PDIF");
  if (s?.adat) connectivity.push("ADAT");
  if (s?.bluetooth) connectivity.push("Bluetooth");
  if (s?.wifi) connectivity.push("Wi-Fi");
  if (s?.expression) connectivity.push("Expression");
  if (s?.sustainPedal) connectivity.push("Sustain");
  if (s?.headphones) connectivity.push("Headphones");

  const ioStats: { label: string; value: string }[] = [];
  if (s?.audioIn) ioStats.push({ label: "Audio In", value: String(s.audioIn) });
  if (s?.audioOut) ioStats.push({ label: "Audio Out", value: String(s.audioOut) });
  if (s?.xlr) ioStats.push({ label: "XLR", value: String(s.xlr) });
  if (s?.keys) ioStats.push({ label: "Keys", value: String(s.keys) });
  if (s?.pads) ioStats.push({ label: "Pads", value: String(s.pads) });
  if (s?.knobs) ioStats.push({ label: "Knobs", value: String(s.knobs) });
  if (s?.faders) ioStats.push({ label: "Faders", value: String(s.faders) });
  if (s?.polyphony) ioStats.push({ label: "Polyphony", value: String(s.polyphony) });

  return (
    <div className="space-y-2 animate-fade-in">
      {/* Compact I/O + Connectivity row */}
      {(ioStats.length > 0 || connectivity.length > 0) && (
        <DetailCard className="p-3">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
            {ioStats.map(({ label, value }) => (
              <span key={label} className="font-mono text-xs text-foreground/80">
                <span className="text-primary font-bold">{value}</span>
                <span className="text-[9px] uppercase tracking-wider text-muted-foreground ml-1">{label}</span>
              </span>
            ))}
            {ioStats.length > 0 && connectivity.length > 0 && (
              <span className="w-px h-4 bg-border/40" />
            )}
            {connectivity.map((c) => (
              <span key={c} className="px-1.5 py-0.5 rounded bg-primary/10 text-primary font-mono text-[9px] font-medium border border-primary/15">{c}</span>
            ))}
          </div>
        </DetailCard>
      )}

      {/* Custom specs inline */}
      {s?.custom && s.custom.length > 0 && (
        <DetailCard className="p-3">
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {s.custom.map(({ label, value }) => (
              <span key={label} className="font-mono text-xs text-foreground/80">
                <span className="text-[9px] uppercase tracking-wider text-muted-foreground mr-1">{label}:</span>
                {value}
              </span>
            ))}
          </div>
        </DetailCard>
      )}

      {/* Logistics as single compact row */}
      <DetailCard className="p-3">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-xs text-foreground/70">
          <span><span className="text-[9px] uppercase tracking-wider text-muted-foreground mr-1">Loc:</span>{item.location || "—"}</span>
          <span><span className="text-[9px] uppercase tracking-wider text-muted-foreground mr-1">Qty:</span>{item.quantity || 1}</span>
          {item.serialNumber && <span><span className="text-[9px] uppercase tracking-wider text-muted-foreground mr-1">S/N:</span>{item.serialNumber}</span>}
          {item.purchaseYear && <span><span className="text-[9px] uppercase tracking-wider text-muted-foreground mr-1">Purchased:</span>{item.purchaseYear}</span>}
        </div>
      </DetailCard>
    </div>
  );
}

function SoftwareSpecs({ item }: { item: InventoryItem }) {
  const synthColor = getSynthColor(item.synthesis);
  return (
    <div className="space-y-3 animate-fade-in">
      {item.synthesis && (
        <DetailCard>
          <SectionLabel icon={Activity} label="Synthesis Engine" />
          <div className={`px-4 py-3 rounded-lg bg-gradient-to-r ${synthColor} border`}>
            <span className="font-mono text-sm font-medium text-foreground">{item.synthesis}</span>
          </div>
        </DetailCard>
      )}
      <DetailCard>
        <SectionLabel icon={Layers} label="Sonic Profile" />
        <div className="grid grid-cols-2 gap-2">
          {item.soundCategory && <MetaChip label="Sound Role" value={item.soundCategory} accent />}
          {item.sonicRole && <MetaChip label="Character" value={item.sonicRole} />}
          <MetaChip label="Category" value={item.category} />
          <MetaChip label="Type" value={item.type} />
        </div>
      </DetailCard>
    </div>
  );
}



/* ─── Tab Content: Research ─── */

type ResearchResult = {
  url: string;
  title: string;
  description: string;
  markdown?: string;
};

type ResearchData = {
  searchResults?: ResearchResult[];
  manualResults?: ResearchResult[];
  productPage?: { markdown: string; links: string[] };
  reviews?: ResearchResult[];
};

type DistilledData = {
  summary: string;
  keyFeatures: string[];
  technicalSpecs: { label: string; value: string }[];
  signalFlow?: string;
  bestUseCases: string[];
  pros?: string[];
  cons?: string[];
  tipsAndTricks?: string[];
  relatedProducts?: string[];
  manualHighlights?: string;
};

function DistilledInsights({ data }: { data: DistilledData }) {
  return (
    <div className="space-y-3 animate-fade-in">
      {/* Summary */}
      <DetailCard className="border-primary/20 bg-primary/[0.03]">
        <SectionLabel icon={Sparkles} label="Summary" />
        <p className="font-mono text-xs leading-relaxed text-foreground/90">{data.summary}</p>
      </DetailCard>

      {/* Key Features */}
      {data.keyFeatures?.length > 0 && (
        <DetailCard>
          <SectionLabel icon={CheckCircle} label="Key Features" />
          <ul className="space-y-1.5">
            {data.keyFeatures.map((f, i) => (
              <li key={i} className="flex items-start gap-2">
                <ArrowRight className="h-3 w-3 text-primary mt-0.5 shrink-0" />
                <span className="font-mono text-[11px] text-foreground/80">{f}</span>
              </li>
            ))}
          </ul>
        </DetailCard>
      )}

      {/* Technical Specs */}
      {data.technicalSpecs?.length > 0 && (
        <DetailCard>
          <SectionLabel icon={CircuitBoard} label="Technical Specifications" />
          <div className="grid grid-cols-2 gap-2">
            {data.technicalSpecs.map((s, i) => (
              <MetaChip key={i} label={s.label} value={s.value} accent={i === 0} />
            ))}
          </div>
        </DetailCard>
      )}

      {/* Signal Flow */}
      {data.signalFlow && (
        <DetailCard>
          <SectionLabel icon={Activity} label="Signal Flow" />
          <p className="font-mono text-[11px] text-foreground/75 leading-relaxed">{data.signalFlow}</p>
        </DetailCard>
      )}

      {/* Best Use Cases */}
      {data.bestUseCases?.length > 0 && (
        <DetailCard>
          <SectionLabel icon={Zap} label="Best Use Cases" />
          <div className="flex flex-wrap gap-1.5">
            {data.bestUseCases.map((uc, i) => (
              <span key={i} className="px-2.5 py-1 rounded-md bg-primary/10 text-primary font-mono text-[10px] border border-primary/15">{uc}</span>
            ))}
          </div>
        </DetailCard>
      )}

      {/* Pros & Cons side by side */}
      {((data.pros && data.pros.length > 0) || (data.cons && data.cons.length > 0)) && (
        <div className="grid grid-cols-2 gap-3">
          {data.pros && data.pros.length > 0 && (
            <DetailCard>
              <SectionLabel icon={ThumbsUp} label="Strengths" />
              <ul className="space-y-1">
                {data.pros.map((p, i) => (
                  <li key={i} className="font-mono text-[10px] text-success flex items-start gap-1.5">
                    <span className="shrink-0 mt-0.5">+</span>{p}
                  </li>
                ))}
              </ul>
            </DetailCard>
          )}
          {data.cons && data.cons.length > 0 && (
            <DetailCard>
              <SectionLabel icon={ThumbsDown} label="Limitations" />
              <ul className="space-y-1">
                {data.cons.map((c, i) => (
                  <li key={i} className="font-mono text-[10px] text-destructive/70 flex items-start gap-1.5">
                    <span className="shrink-0 mt-0.5">−</span>{c}
                  </li>
                ))}
              </ul>
            </DetailCard>
          )}
        </div>
      )}

      {/* Tips & Tricks */}
      {data.tipsAndTricks && data.tipsAndTricks.length > 0 && (
        <DetailCard>
          <SectionLabel icon={Lightbulb} label="Tips & Tricks" />
          <ul className="space-y-1.5">
            {data.tipsAndTricks.map((t, i) => (
              <li key={i} className="flex items-start gap-2">
                <Lightbulb className="h-3 w-3 text-warning mt-0.5 shrink-0" />
                <span className="font-mono text-[10px] text-foreground/75">{t}</span>
              </li>
            ))}
          </ul>
        </DetailCard>
      )}

      {/* Manual Highlights */}
      {data.manualHighlights && (
        <DetailCard>
          <SectionLabel icon={BookOpen} label="Manual Highlights" />
          <p className="font-mono text-[11px] text-foreground/75 leading-relaxed whitespace-pre-wrap">{data.manualHighlights}</p>
        </DetailCard>
      )}

      {/* Related Products */}
      {data.relatedProducts && data.relatedProducts.length > 0 && (
        <DetailCard>
          <SectionLabel icon={Layers} label="Related Products" />
          <div className="flex flex-wrap gap-1.5">
            {data.relatedProducts.map((rp, i) => (
              <span key={i} className="px-2.5 py-1 rounded-md bg-secondary/80 text-foreground/70 font-mono text-[10px] border border-border/30">{rp}</span>
            ))}
          </div>
        </DetailCard>
      )}
    </div>
  );
}

function ResearchTab({ item }: { item: InventoryItem }) {
  const queryClient = useQueryClient();

  // Reconstruct distilled data from saved item fields if available
  const savedDistilled = useMemo((): DistilledData | null => {
    const notes = item.notes || '';
    const hasResearch = notes.includes('--- AI Research ---');
    if (!item.description && !hasResearch) return null;

    // Parse notes sections
    const researchBlock = hasResearch ? notes.split('--- AI Research ---').pop() || '' : '';
    const lines = researchBlock.split('\n').filter(Boolean);
    const extract = (prefix: string) => {
      const line = lines.find(l => l.startsWith(prefix));
      return line ? line.slice(prefix.length).trim() : undefined;
    };

    const pros = extract('Strengths: ')?.split('; ').filter(Boolean);
    const cons = extract('Limitations: ')?.split('; ').filter(Boolean);
    const tips = extract('Tips: ')?.split('; ').filter(Boolean);
    const signalFlow = extract('Signal Flow: ');
    const manualHighlights = extract('Manual: ');
    const related = extract('Related: ')?.split(', ').filter(Boolean);

    const specs = item.specs as InventorySpecs | undefined;
    const custom = (specs?.custom || []) as { label: string; value: string }[];

    return {
      summary: item.description || '',
      keyFeatures: item.keywords?.split(' ').filter(Boolean).slice(0, 8) || [],
      technicalSpecs: custom,
      signalFlow,
      bestUseCases: item.useCases?.split(', ').filter(Boolean) || [],
      pros,
      cons,
      tipsAndTricks: tips,
      relatedProducts: related,
      manualHighlights,
    };
  }, [item]);

  const [rawData, setRawData] = useState<ResearchData | null>(null);
  const [distilled, setDistilled] = useState<DistilledData | null>(savedDistilled);
  const [manualUrl, setManualUrl] = useState<string | null>(null);
  const [phase, setPhase] = useState<'idle' | 'searching' | 'distilling' | 'downloading' | 'saving' | 'done' | 'error'>(savedDistilled ? 'done' : 'idle');
  const [error, setError] = useState<string | null>(null);
  const [showRaw, setShowRaw] = useState(false);
  const [expandedResult, setExpandedResult] = useState<number | null>(null);
  const [saved, setSaved] = useState(!!savedDistilled);

  const tryDownloadManual = useCallback(async (manualResults: ResearchResult[], productPageLinks?: string[]): Promise<string | null> => {
    // Collect candidate manual URLs — prefer PDFs
    const candidates: { url: string; title: string }[] = [];

    // From manual search results
    if (manualResults) {
      for (const r of manualResults) {
        if (r.url && /\.(pdf|doc|docx)(\?|$)/i.test(r.url)) {
          candidates.push({ url: r.url, title: r.title || 'manual' });
        }
      }
      // Also add non-PDF manual results as fallback
      for (const r of manualResults) {
        if (r.url && !candidates.some(c => c.url === r.url)) {
          candidates.push({ url: r.url, title: r.title || 'manual' });
        }
      }
    }

    // From product page scraped links
    if (productPageLinks) {
      for (const link of productPageLinks) {
        if (/\.(pdf)(\?|$)/i.test(link) && /manual|guide|user|doc/i.test(link)) {
          if (!candidates.some(c => c.url === link)) {
            candidates.push({ url: link, title: link.split('/').pop() || 'manual' });
          }
        }
      }
    }

    // Try downloading the top candidates (max 3 attempts)
    for (const candidate of candidates.slice(0, 3)) {
      try {
        console.log('Attempting manual download:', candidate.url);
        const sanitizedTitle = `${item.vendor}_${item.product}_${candidate.title}`
          .replace(/[^a-zA-Z0-9_-]/g, '_')
          .substring(0, 80);

        const { data, error: fnErr } = await supabase.functions.invoke('download-manual', {
          body: { url: candidate.url, itemId: item.id, fileName: sanitizedTitle },
        });

        if (fnErr) {
          console.warn('Download function error:', fnErr);
          continue;
        }

        if (data?.success && data?.data?.url) {
          console.log('Manual downloaded successfully:', data.data.url);
          return data.data.url;
        } else {
          console.warn('Download failed:', data?.error);
        }
    } catch (e) {
      console.warn('Manual download attempt failed:', e);
      }
    }

    return null;
  }, [item]);

  const saveDistilledData = useCallback(async (data: DistilledData, downloadedManualUrl: string | null) => {
    setPhase('saving');
    try {
      // Build notes from all text fields
      const notesParts: string[] = [];
      if (data.signalFlow) notesParts.push(`Signal Flow: ${data.signalFlow}`);
      if (data.pros?.length) notesParts.push(`Strengths: ${data.pros.join('; ')}`);
      if (data.cons?.length) notesParts.push(`Limitations: ${data.cons.join('; ')}`);
      if (data.tipsAndTricks?.length) notesParts.push(`Tips: ${data.tipsAndTricks.join('; ')}`);
      if (data.manualHighlights) notesParts.push(`Manual: ${data.manualHighlights}`);
      if (data.relatedProducts?.length) notesParts.push(`Related: ${data.relatedProducts.join(', ')}`);

      // Merge existing specs.custom with new technicalSpecs
      const existingCustom = (item.specs?.custom || []) as { label: string; value: string }[];
      const newSpecLabels = new Set(data.technicalSpecs.map(s => s.label.toLowerCase()));
      const mergedCustom = [
        ...existingCustom.filter(c => !newSpecLabels.has(c.label.toLowerCase())),
        ...data.technicalSpecs,
      ];

      const updatedSpecs: Record<string, unknown> = { ...(item.specs || {}), custom: mergedCustom };
      if (downloadedManualUrl) {
        updatedSpecs.manualUrl = downloadedManualUrl;
      }

      const updatePayload: Record<string, unknown> = {
        description: data.summary || item.description || null,
        use_cases: data.bestUseCases?.join(', ') || item.useCases || null,
        notes: notesParts.length > 0
          ? [item.notes, notesParts.join('\n')].filter(Boolean).join('\n\n--- AI Research ---\n')
          : item.notes || null,
        specs: updatedSpecs as unknown as Json,
        keywords: data.keyFeatures
          ? [item.keywords, data.keyFeatures.join(' ')].filter(Boolean).join(' ')
          : item.keywords || null,
      };

      const { error: updateErr } = await supabase
        .from("inventory_items")
        .update(updatePayload)
        .eq("id", item.id);

      if (updateErr) throw updateErr;

      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      setSaved(true);
      toast.success("Research data saved to item");

      // Trigger manual digestion if we downloaded a manual
      if (downloadedManualUrl) {
        toast.info("Digesting manual for AI knowledge...");
        supabase.functions.invoke("digest-manual", {
          body: { itemId: item.id, manualUrl: downloadedManualUrl },
        }).then(({ data, error: digestErr }) => {
          if (digestErr) {
            console.warn("Manual digestion failed:", digestErr);
          } else if (data?.success) {
            toast.success("Manual digested — the AI assistant now knows it in detail");
          }
        });
      }
    } catch (e: unknown) {
      console.error("Failed to save research data:", e);
      toast.error("Failed to save research data");
    }
  }, [item, queryClient]);

  const handleResearch = useCallback(async () => {
    setPhase('searching');
    setError(null);
    setDistilled(null);
    setRawData(null);
    setSaved(false);
    setManualUrl(null);

    try {
      // Step 1: Fetch raw research data
      const { data: res, error: err } = await supabase.functions.invoke("research-product", {
        body: { vendor: item.vendor, product: item.product, category: item.category, url: item.url },
      });
      if (err) throw err;
      if (!res?.success) throw new Error(res?.error || "Research failed");

      const raw = res.data as ResearchData;
      setRawData(raw);

      // Step 2: Build raw content blob for AI distillation
      setPhase('distilling');
      const contentParts: string[] = [];

      if (raw.productPage?.markdown) {
        contentParts.push(`=== PRODUCT PAGE ===\n${raw.productPage.markdown}`);
      }
      if (raw.searchResults) {
        for (const r of raw.searchResults) {
          if (r.markdown) {
            contentParts.push(`=== WEB: ${r.title} ===\n${r.markdown}`);
          } else if (r.description) {
            contentParts.push(`=== WEB: ${r.title} ===\n${r.description}`);
          }
        }
      }
      if (raw.manualResults) {
        for (const r of raw.manualResults) {
          if (r.description) contentParts.push(`=== MANUAL: ${r.title} ===\n${r.description}`);
        }
      }
      if (raw.reviews) {
        for (const r of raw.reviews) {
          if (r.description) contentParts.push(`=== REVIEW: ${r.title} ===\n${r.description}`);
        }
      }

      const rawContent = contentParts.join('\n\n');

      // Step 3: Try downloading a manual in parallel with distillation
      const manualPromise = (raw.manualResults?.length || raw.productPage?.links?.length)
        ? tryDownloadManual(raw.manualResults || [], raw.productPage?.links)
        : Promise.resolve(null);

      let distilledResult: DistilledData | null = null;

      if (rawContent.trim().length >= 50) {
        // Step 4: Distill with AI
        const [distillRes, downloadedUrl] = await Promise.all([
          supabase.functions.invoke("distill-product", {
            body: {
              vendor: item.vendor,
              product: item.product,
              category: item.category,
              type: item.type,
              ecosystem: item.ecosystem,
              rawContent,
            },
          }),
          manualPromise,
        ]);

        if (downloadedUrl) setManualUrl(downloadedUrl);

        if (distillRes.error) throw distillRes.error;
        if (distillRes.data?.success && distillRes.data?.data) {
          distilledResult = distillRes.data.data as DistilledData;
          setDistilled(distilledResult);

          // Step 5: Auto-save to database
          await saveDistilledData(distilledResult, downloadedUrl);
        }
      } else {
        // Still try to download manual even without distillation
        setPhase('downloading');
        const downloadedUrl = await manualPromise;
        if (downloadedUrl) {
          setManualUrl(downloadedUrl);
          // Save just the manual URL to specs
          const updatedSpecs = { ...(item.specs || {}), manualUrl: downloadedUrl };
          await supabase
            .from("inventory_items")
            .update({ specs: updatedSpecs as unknown as Json })
            .eq("id", item.id);
          queryClient.invalidateQueries({ queryKey: ["inventory"] });
          toast.success("Manual downloaded and saved");
        }
      }

      setPhase('done');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Research failed");
      setPhase('error');
    }
  }, [item, saveDistilledData, tryDownloadManual, queryClient]);

  const existingManualUrl = (item.specs as InventorySpecs | undefined)?.manualUrl;

  if (phase === 'idle') {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4 animate-fade-in">
        {existingManualUrl && (
          <DetailCard className="w-full max-w-xs border-primary/20 bg-primary/[0.03]">
            <SectionLabel icon={BookOpen} label="Product Manual" />
            <a href={existingManualUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 font-mono text-xs text-primary hover:text-primary/80 transition-colors">
              <Download className="h-4 w-4" />
              <span>Open / Download Manual</span>
              <ExternalLink className="h-3 w-3 ml-auto text-primary/40" />
            </a>
          </DetailCard>
        )}
        <div className="w-16 h-16 rounded-2xl bg-primary/5 border border-primary/15 flex items-center justify-center">
          <Sparkles className="h-7 w-7 text-primary/40" />
        </div>
        <div className="text-center space-y-1">
          <p className="font-mono text-sm text-foreground/70">Deep research</p>
          <p className="font-mono text-[11px] text-muted-foreground/50 max-w-xs">
            Search the web for {item.vendor} {item.product}, then use AI to distill the most valuable product-specific insights
          </p>
        </div>
        <Button onClick={handleResearch} className="font-mono text-xs gap-2">
          <Sparkles className="h-3.5 w-3.5" />
          Research & Distill
        </Button>
      </div>
    );
  }

  if (phase === 'searching' || phase === 'distilling' || phase === 'downloading' || phase === 'saving') {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4 animate-fade-in">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
        <div className="text-center space-y-1">
          <p className="font-mono text-sm text-foreground/70">
            {phase === 'searching' ? `Searching the web for ${item.product}...` : phase === 'distilling' ? `AI is distilling insights...` : phase === 'downloading' ? 'Downloading manual...' : `Saving to database...`}
          </p>
          <p className="font-mono text-[10px] text-muted-foreground/40">
            {phase === 'searching' ? 'Finding specs, manuals, reviews' : phase === 'distilling' ? 'Extracting info & downloading manuals' : phase === 'downloading' ? 'Trying to fetch product documentation' : 'Persisting research data'}
          </p>
        </div>
        {(phase === 'distilling' || phase === 'saving') && (
          <div className="flex items-center gap-2 mt-2">
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-success" />
              <span className="font-mono text-[9px] text-success/70">Search complete</span>
            </div>
            <ArrowRight className="h-3 w-3 text-muted-foreground/30" />
            <div className="flex gap-1">
              <div className={`w-1.5 h-1.5 rounded-full ${phase === 'saving' ? 'bg-success' : 'bg-primary animate-pulse'}`} />
              <span className={`font-mono text-[9px] ${phase === 'saving' ? 'text-success/70' : 'text-primary/70'}`}>Analyzing</span>
            </div>
            {phase === 'saving' && (
              <>
                <ArrowRight className="h-3 w-3 text-muted-foreground/30" />
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  <span className="font-mono text-[9px] text-primary/70">Saving</span>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    );
  }

  if (phase === 'error') {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3 animate-fade-in">
        <p className="font-mono text-sm text-destructive">{error}</p>
        <Button variant="outline" size="sm" onClick={handleResearch} className="font-mono text-xs gap-1.5">
          <Search className="h-3 w-3" /> Retry
        </Button>
      </div>
    );
  }

  const ResultLink = ({ result, icon: LinkIcon }: { result: ResearchResult; icon: typeof ExternalLink }) => (
    <a href={result.url} target="_blank" rel="noopener noreferrer"
      className="flex items-start gap-3 p-3 rounded-lg hover:bg-secondary/60 transition-colors group">
      <LinkIcon className="h-4 w-4 text-primary/60 mt-0.5 shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="font-mono text-xs text-foreground group-hover:text-primary transition-colors truncate">{result.title || result.url}</p>
        {result.description && (
          <p className="font-mono text-[10px] text-muted-foreground mt-0.5 line-clamp-2">{result.description}</p>
        )}
        <span className="font-mono text-[9px] text-muted-foreground/40 truncate block mt-0.5">{result.url}</span>
      </div>
      <ExternalLink className="h-3 w-3 text-muted-foreground/30 group-hover:text-primary/60 transition-colors shrink-0 mt-1" />
    </a>
  );

  return (
    <div className="space-y-3 animate-fade-in">
      {/* Distilled insights (primary view) */}
      {distilled && <DistilledInsights data={distilled} />}

      {saved && (
        <DetailCard className="border-success/20 bg-success/[0.03]">
          <div className="flex items-center gap-2">
            <Save className="h-3.5 w-3.5 text-success" />
            <p className="font-mono text-[11px] text-success">Research data saved to item (description, specs, notes, keywords)</p>
          </div>
        </DetailCard>
      )}

      {/* Manual download link */}
      {(manualUrl || (item.specs as InventorySpecs | undefined)?.manualUrl) && (
        <DetailCard className="border-primary/20 bg-primary/[0.03]">
          <SectionLabel icon={BookOpen} label="Product Manual" />
          <a href={manualUrl || (item.specs as InventorySpecs | undefined)?.manualUrl} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 font-mono text-xs text-primary hover:text-primary/80 transition-colors">
            <Download className="h-4 w-4" />
            <span>Open / Download Manual (PDF)</span>
            <ExternalLink className="h-3 w-3 ml-auto text-primary/40" />
          </a>
        </DetailCard>
      )}

      {!distilled && rawData && (
        <DetailCard className="border-warning/20 bg-warning/[0.03]">
          <p className="font-mono text-[11px] text-warning">AI distillation unavailable — showing raw results below.</p>
        </DetailCard>
      )}

      {/* Toggle raw sources */}
      {rawData && (
        <div className="flex items-center justify-between">
          <button onClick={() => setShowRaw(!showRaw)}
            className="font-mono text-[10px] text-primary/60 hover:text-primary transition-colors flex items-center gap-1.5">
            {showRaw ? "▼" : "►"} {showRaw ? "Hide" : "Show"} raw sources ({
              (rawData.searchResults?.length || 0) + (rawData.manualResults?.length || 0) + (rawData.reviews?.length || 0)
            } results)
          </button>
          <Button variant="outline" size="sm" onClick={handleResearch}
            className="font-mono text-[9px] gap-1 h-6 px-2">
            <Search className="h-2.5 w-2.5" /> Re-research
          </Button>
        </div>
      )}

      {/* Raw sources (collapsed by default) */}
      {showRaw && rawData && (
        <div className="space-y-3 border-l-2 border-border/30 pl-3">
          {rawData.productPage?.markdown && (
            <DetailCard>
              <SectionLabel icon={FileText} label="Product Page Content" />
              <div className="font-mono text-xs text-foreground/80 leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto pr-2">
                {rawData.productPage.markdown.slice(0, 2000)}
              </div>
            </DetailCard>
          )}

          {rawData.manualResults && rawData.manualResults.length > 0 && (
            <DetailCard>
              <SectionLabel icon={BookOpen} label="Manuals & Documentation" />
              <div className="divide-y divide-border/20">
                {rawData.manualResults.map((r, i) => <ResultLink key={i} result={r} icon={Download} />)}
              </div>
            </DetailCard>
          )}

          {rawData.productPage?.links && rawData.productPage.links.length > 0 && (
            <DetailCard>
              <SectionLabel icon={Link} label="Related Downloads" />
              <div className="flex flex-wrap gap-1.5">
                {rawData.productPage.links.map((link, i) => (
                  <a key={i} href={link} target="_blank" rel="noopener noreferrer"
                    className="px-2.5 py-1 rounded-md bg-primary/10 text-primary font-mono text-[10px] border border-primary/15 hover:bg-primary/20 transition-colors truncate max-w-full">
                    {link.split('/').pop() || link}
                  </a>
                ))}
              </div>
            </DetailCard>
          )}

          {rawData.searchResults && rawData.searchResults.length > 0 && (
            <DetailCard>
              <SectionLabel icon={Search} label="Web Results" />
              <div className="divide-y divide-border/20">
                {rawData.searchResults.map((r, i) => (
                  <div key={i}>
                    <ResultLink result={r} icon={ExternalLink} />
                    {r.markdown && (
                      <div className="pl-7 pr-3 pb-2">
                        <button onClick={() => setExpandedResult(expandedResult === i ? null : i)}
                          className="font-mono text-[9px] text-primary/60 hover:text-primary transition-colors">
                          {expandedResult === i ? "▼ Hide" : "► Show content"}
                        </button>
                        {expandedResult === i && (
                          <div className="mt-2 font-mono text-[10px] text-foreground/60 leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto bg-secondary/30 rounded-lg p-3">
                            {r.markdown.slice(0, 2000)}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </DetailCard>
          )}

          {rawData.reviews && rawData.reviews.length > 0 && (
            <DetailCard>
              <SectionLabel icon={MessageSquare} label="Reviews" />
              <div className="divide-y divide-border/20">
                {rawData.reviews.map((r, i) => <ResultLink key={i} result={r} icon={MessageSquare} />)}
              </div>
            </DetailCard>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Main Component ─── */

export function InventoryDetail({ item, meta, onSetRating, onAddTag, onRemoveTag, onEdit, onDelete }: InventoryDetailProps) {

  /* ─── Empty state ─── */
  if (!item) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-primary/[0.03] blur-3xl" />
          <div className="absolute bottom-1/4 left-1/3 w-64 h-64 rounded-full bg-accent/[0.02] blur-3xl" />
        </div>
        <div className="relative z-10 flex flex-col items-center gap-4 animate-fade-in">
          <div className="relative">
            <div className="w-24 h-24 rounded-2xl border border-border/30 bg-secondary/30 flex items-center justify-center backdrop-blur-sm">
              <Package className="h-10 w-10 opacity-15" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary/20 animate-pulse" />
          </div>
          <div className="text-center space-y-1.5">
            <p className="font-mono text-sm font-medium text-foreground/60">Select an item to inspect</p>
            <p className="font-mono text-[11px] text-muted-foreground/40">Click any item from your inventory</p>
          </div>
        </div>
      </div>
    );
  }

  const Icon = ecosystemIcons[item.ecosystem] || Package;
  const glow = ECOSYSTEM_GLOW[item.ecosystem] || "shadow-primary/10";
  const rating = meta?.rating || 0;
  const tags = meta?.tags || [];

  return (
    <div className="h-full flex overflow-hidden w-full">
      {/* Detail panel — constrained width */}
      <div className="h-full flex flex-col overflow-hidden w-1/2 shrink-0 border-r border-border/30">
        <Tabs defaultValue="overview" className="flex flex-col h-full">
          {/* ═══ STICKY HEADER ═══ */}
          <div className="shrink-0 p-5 pb-0 border-b border-border/30 bg-card/80 backdrop-blur-md">
            <div className="flex items-start gap-4 mb-4">
              <div className={`relative shrink-0 w-20 h-20 rounded-xl overflow-hidden bg-background border border-border/30 shadow-lg ${glow}`}>
                <img src={getCategoryFallbackIcon(item.category, item.ecosystem)} alt={item.category}
                  className="w-full h-full object-cover opacity-90 brightness-150" />
              </div>
              <div className="flex-1 min-w-0 pt-1">
                <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
                  <div className="p-1 rounded bg-primary/10"><Icon className="h-3.5 w-3.5 text-primary" /></div>
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-secondary text-muted-foreground">
                    {ecosystemLabels[item.ecosystem] || item.ecosystem}
                  </span>
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-secondary text-muted-foreground">{item.category}</span>
                </div>
                <h2 className="font-mono text-xl font-bold text-foreground leading-tight truncate">{item.product}</h2>
                <p className="font-mono text-xs text-muted-foreground mt-0.5">{item.vendor} — {item.type}</p>
                <div className="flex items-center gap-2 mt-2.5">
                  {item.url && (
                    <a href={item.url} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-mono text-[10px] text-primary hover:text-primary/80 transition-colors">
                      <ExternalLink className="h-3 w-3" />Link
                    </a>
                  )}
                  {item.yearReleased && (
                    <span className="flex items-center gap-1 font-mono text-[10px] text-muted-foreground">
                      <Calendar className="h-3 w-3" />{item.yearReleased}
                    </span>
                  )}
                  {item.msrp && (
                    <span className="flex items-center gap-1 font-mono text-[10px] text-muted-foreground">
                      <DollarSign className="h-3 w-3" />{item.msrp}
                    </span>
                  )}
                  <div className="flex-1" />
                  {onEdit && (
                    <Button variant="ghost" size="sm" className="h-7 px-2 font-mono text-[10px] gap-1 text-muted-foreground hover:text-foreground" onClick={() => onEdit(item)}>
                      <Pencil className="h-3 w-3" />Edit
                    </Button>
                  )}
                  {onDelete && (
                    <Button variant="ghost" size="sm" className="h-7 px-2 font-mono text-[10px] gap-1 text-destructive/70 hover:text-destructive" onClick={() => onDelete(item)}>
                      <Trash2 className="h-3 w-3" />Delete
                    </Button>
                  )}
                </div>
              </div>
            </div>
            <TabsList className="w-full bg-transparent h-auto p-0 gap-0 border-b-0 rounded-none justify-start">
              <TabsTrigger value="overview"
                className="font-mono text-[10px] uppercase tracking-wider rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-primary px-4 pb-2.5 pt-1 text-muted-foreground hover:text-foreground transition-colors">
                <Layers className="h-3 w-3 mr-1.5" />Overview
              </TabsTrigger>
              <TabsTrigger value="specs"
                className="font-mono text-[10px] uppercase tracking-wider rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-primary px-4 pb-2.5 pt-1 text-muted-foreground hover:text-foreground transition-colors">
                <Settings className="h-3 w-3 mr-1.5" />Specs & Research
              </TabsTrigger>
            </TabsList>
          </div>
          <div className="flex-1 overflow-y-auto p-5">
            <TabsContent value="overview" className="mt-0">
              <OverviewTab item={item} rating={rating} tags={tags} onSetRating={onSetRating} onAddTag={onAddTag} onRemoveTag={onRemoveTag} />
            </TabsContent>
            <TabsContent value="specs" className="mt-0">
              <SpecsTab item={item} />
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* Right panel — placeholder for future content */}
      <div className="flex-1 h-full flex flex-col items-center justify-center bg-secondary/10">
        <div className="flex flex-col items-center gap-3 text-muted-foreground/40">
          <div className="w-12 h-12 rounded-xl border border-border/20 flex items-center justify-center">
            <Layers className="h-5 w-5 opacity-30" />
          </div>
          <p className="font-mono text-[10px] tracking-wider uppercase">Context Panel</p>
        </div>
      </div>
    </div>
  );
}
