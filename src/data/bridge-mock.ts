/**
 * Bridge — mock data conforming to the seven-entity relational model.
 */

import type {
  Plugin, PluginInstance, Track, ProjectManifest,
  PluginLibrary, PluginMatch,
  RenderJob, AnalysisResult, SuggestedReplacement,
  CompanionState, MissingPluginInfo, InstanceParam, PluginRole,
} from "@/types/bridge";

/* ── Companion state ─────────────────────────────────────── */

export const MOCK_COMPANION: CompanionState = {
  status: "connected",
  version: "0.4.1-beta",
  os: "macOS",
  cpuUsage: 12,
  sampleRate: 48000,
  bufferSize: 256,
  pluginCount: 47,
};

/* ── Plugin catalog ──────────────────────────────────────── */

const ts = "2026-03-11T10:00:00Z";

export const MOCK_PLUGINS: Plugin[] = [
  { id: "p1",  name: "Serum",            vendor: "Xfer Records",         version: "1.36b2",  format: "VST3", category: "Instrument", path: "/Library/Audio/Plug-Ins/VST3/Serum.vst3",       tags: ["Wavetable","Synth"],              installed: true,  latencySamples: 0,   supportsStateRestore: true,  lastScanned: ts },
  { id: "p2",  name: "Diva",             vendor: "u-he",                 version: "1.4.6",   format: "VST3", category: "Instrument", path: "/Library/Audio/Plug-Ins/VST3/Diva.vst3",        tags: ["Analog","Synth"],                 installed: true,  latencySamples: 0,   supportsStateRestore: true,  lastScanned: ts },
  { id: "p3",  name: "Massive X",        vendor: "Native Instruments",   version: "1.7.0",   format: "VST3", category: "Instrument", path: "/Library/Audio/Plug-Ins/VST3/Massive X.vst3",   tags: ["Wavetable","Synth"],              installed: true,  latencySamples: 0,   supportsStateRestore: true,  lastScanned: ts },
  { id: "p4",  name: "Pigments",         vendor: "Arturia",              version: "5.0.1",   format: "VST3", category: "Instrument", path: "/Library/Audio/Plug-Ins/VST3/Pigments.vst3",    tags: ["Hybrid","Synth"],                 installed: true,  latencySamples: 0,   supportsStateRestore: true,  lastScanned: ts },
  { id: "p5",  name: "Vital",            vendor: "Matt Tytel",           version: "1.5.5",   format: "VST3", category: "Instrument", path: "/Library/Audio/Plug-Ins/VST3/Vital.vst3",       tags: ["Wavetable","Synth","Free"],        installed: true,  latencySamples: 0,   supportsStateRestore: true,  lastScanned: ts },
  { id: "p6",  name: "Kontakt 7",        vendor: "Native Instruments",   version: "7.8.0",   format: "VST3", category: "Instrument", path: "/Library/Audio/Plug-Ins/VST3/Kontakt 7.vst3",   tags: ["Sampler"],                        installed: true,  latencySamples: 64,  supportsStateRestore: true,  lastScanned: ts },
  { id: "p7",  name: "Omnisphere 2",     vendor: "Spectrasonics",        version: "2.9.0",   format: "AU",   category: "Instrument", path: "/Library/Audio/Plug-Ins/Components/Omnisphere.component", tags: ["Hybrid","Synth","Sampler"], installed: true,  latencySamples: 0,   supportsStateRestore: true,  lastScanned: ts },
  { id: "p10", name: "Pro-Q 3",          vendor: "FabFilter",            version: "3.22",    format: "VST3", category: "Effect",     path: "/Library/Audio/Plug-Ins/VST3/Pro-Q 3.vst3",     tags: ["EQ"],                             installed: true,  latencySamples: 0,   supportsStateRestore: true,  lastScanned: ts },
  { id: "p11", name: "Pro-R 2",          vendor: "FabFilter",            version: "2.04",    format: "VST3", category: "Effect",     path: "/Library/Audio/Plug-Ins/VST3/Pro-R 2.vst3",     tags: ["Reverb"],                         installed: true,  latencySamples: 0,   supportsStateRestore: true,  lastScanned: ts },
  { id: "p12", name: "Pro-C 2",          vendor: "FabFilter",            version: "2.16",    format: "VST3", category: "Effect",     path: "/Library/Audio/Plug-Ins/VST3/Pro-C 2.vst3",     tags: ["Compressor","Dynamics"],           installed: true,  latencySamples: 0,   supportsStateRestore: true,  lastScanned: ts },
  { id: "p13", name: "Pro-L 2",          vendor: "FabFilter",            version: "2.08",    format: "VST3", category: "Effect",     path: "/Library/Audio/Plug-Ins/VST3/Pro-L 2.vst3",     tags: ["Limiter","Dynamics"],              installed: true,  latencySamples: 3,   supportsStateRestore: true,  lastScanned: ts },
  { id: "p14", name: "Valhalla Room",    vendor: "Valhalla DSP",         version: "1.6.5",   format: "AU",   category: "Effect",     path: "/Library/Audio/Plug-Ins/Components/ValhallaRoom.component",  tags: ["Reverb"],              installed: true,  latencySamples: 0,   supportsStateRestore: true,  lastScanned: ts },
  { id: "p15", name: "Valhalla Delay",   vendor: "Valhalla DSP",         version: "1.2.1",   format: "AU",   category: "Effect",     path: "/Library/Audio/Plug-Ins/Components/ValhallaDelay.component", tags: ["Delay"],               installed: true,  latencySamples: 0,   supportsStateRestore: true,  lastScanned: ts },
  { id: "p16", name: "Decapitator",      vendor: "Soundtoys",            version: "5.4.1",   format: "AU",   category: "Effect",     path: "/Library/Audio/Plug-Ins/Components/Decapitator.component",   tags: ["Saturation","Distortion"], installed: true,  latencySamples: 0,   supportsStateRestore: true,  lastScanned: ts },
  { id: "p17", name: "EchoBoy",          vendor: "Soundtoys",            version: "5.4.1",   format: "AU",   category: "Effect",     path: "/Library/Audio/Plug-Ins/Components/EchoBoy.component",       tags: ["Delay"],               installed: true,  latencySamples: 0,   supportsStateRestore: true,  lastScanned: ts },
  { id: "p18", name: "Replika XT",       vendor: "Native Instruments",   version: "1.5.0",   format: "VST3", category: "Effect",     path: "/Library/Audio/Plug-Ins/VST3/Replika XT.vst3",  tags: ["Delay"],                          installed: true,  latencySamples: 0,   supportsStateRestore: true,  lastScanned: ts },
  { id: "p19", name: "Ozone 11",         vendor: "iZotope",              version: "11.0.1",  format: "VST3", category: "Effect",     path: "/Library/Audio/Plug-Ins/VST3/Ozone 11.vst3",    tags: ["Mastering","EQ","Dynamics"],       installed: true,  latencySamples: 128, supportsStateRestore: true,  lastScanned: ts },
  { id: "p20", name: "Neutron 4",        vendor: "iZotope",              version: "4.5.0",   format: "VST3", category: "Effect",     path: "/Library/Audio/Plug-Ins/VST3/Neutron 4.vst3",   tags: ["Channel Strip","EQ","Dynamics"],   installed: true,  latencySamples: 64,  supportsStateRestore: true,  lastScanned: ts },
  { id: "p21", name: "Saturn 2",         vendor: "FabFilter",            version: "2.07",    format: "VST3", category: "Effect",     path: "/Library/Audio/Plug-Ins/VST3/Saturn 2.vst3",    tags: ["Saturation","Distortion"],         installed: true,  latencySamples: 0,   supportsStateRestore: true,  lastScanned: ts },
  { id: "p22", name: "RC-20 Retro Color",vendor: "XLN Audio",            version: "1.3.5",   format: "VST3", category: "Effect",     path: "/Library/Audio/Plug-Ins/VST3/RC-20.vst3",       tags: ["Lo-Fi","Texture"],                installed: true,  latencySamples: 0,   supportsStateRestore: true,  lastScanned: ts },
  { id: "p30", name: "Spire",            vendor: "Reveal Sound",         version: "1.5.16",  format: "VST3", category: "Instrument", path: "/Library/Audio/Plug-Ins/VST3/Spire.vst3",       tags: ["Synth"],                          installed: false, latencySamples: 0,   supportsStateRestore: true,  lastScanned: ts },
  { id: "p31", name: "Sylenth1",         vendor: "LennarDigital",        version: "3.073",   format: "VST3", category: "Instrument", path: "/Library/Audio/Plug-Ins/VST3/Sylenth1.vst3",    tags: ["Analog","Synth"],                 installed: false, latencySamples: 0,   supportsStateRestore: false, lastScanned: ts },
];

/* ── Param helpers ───────────────────────────────────────── */

function param(label: string, value: number, display: string, automatable = true): InstanceParam {
  return { id: `${label.toLowerCase().replace(/\s/g,"-")}-${Math.random().toString(36).slice(2,6)}`, label, value, displayValue: display, automatable };
}

/* ── Instance helpers ────────────────────────────────────── */

let _instIdx = 0;
function inst(
  pluginId: string | null, trackId: string, chainIndex: number,
  name: string, opts: Partial<Pick<PluginInstance, "bypass" | "preset" | "missing" | "wet">> = {},
): PluginInstance {
  _instIdx++;
  return {
    id: `inst-${_instIdx}`,
    pluginId,
    trackId,
    chainIndex,
    name,
    bypass: opts.bypass ?? false,
    preset: opts.preset ?? null,
    params: [
      param("Mix", opts.wet ?? 1.0, `${Math.round((opts.wet ?? 1.0) * 100)}%`),
      param("Gain", 0.75, "−3 dB"),
    ],
    stateBlob: pluginId ? btoa(`mock-state-${pluginId}-${_instIdx}`) : null,
    wet: opts.wet ?? 1.0,
    missing: opts.missing ?? false,
  };
}

/* ── Project A tracks ────────────────────────────────────── */

const projAId = "proj-1";

const projATracks: Track[] = [
  {
    id: "t1", projectId: projAId, name: "Kick", type: "Audio", color: "hsl(0,70%,55%)",
    isMuted: false, isSoloed: false, volume: 82, pan: 0, index: 0, inputSource: null, sourceAudioUrl: "/audio/kick-one-shot.wav",
    chain: [
      inst("p10", "t1", 0, "Pro-Q 3",  { preset: "Kick Scoop" }),
      inst("p12", "t1", 1, "Pro-C 2",  { preset: "Punch" }),
      inst("p21", "t1", 2, "Saturn 2", { preset: "Warm Tape" }),
    ],
    sends: [{ targetTrackId: "t-ret1", targetTrackName: "Room Verb", level: 15, preFader: false }],
  },
  {
    id: "t2", projectId: projAId, name: "Bass Synth", type: "Instrument", color: "hsl(200,70%,50%)",
    isMuted: false, isSoloed: false, volume: 75, pan: 0, index: 1, inputSource: null, sourceAudioUrl: null,
    chain: [
      inst("p1",  "t2", 0, "Serum",       { preset: "Deep Sub" }),
      inst("p16", "t2", 1, "Decapitator", { preset: "Warm Drive" }),
      inst("p10", "t2", 2, "Pro-Q 3"),
    ],
    sends: [],
  },
  {
    id: "t3", projectId: projAId, name: "Lead Synth", type: "Instrument", color: "hsl(280,70%,60%)",
    isMuted: false, isSoloed: false, volume: 68, pan: 12, index: 2, inputSource: null, sourceAudioUrl: null,
    chain: [
      inst("p31", "t3", 0, "Sylenth1",     { preset: "Bright Lead", missing: true }),
      inst("p17", "t3", 1, "EchoBoy",      { preset: "Ping Pong 1/8" }),
      inst("p14", "t3", 2, "Valhalla Room", { preset: "Large Hall" }),
    ],
    sends: [{ targetTrackId: "t-ret2", targetTrackName: "Delay Send", level: 40, preFader: false }],
  },
  {
    id: "t4", projectId: projAId, name: "Pad", type: "Instrument", color: "hsl(160,60%,45%)",
    isMuted: false, isSoloed: false, volume: 55, pan: -20, index: 3, inputSource: null, sourceAudioUrl: null,
    chain: [
      inst("p30", "t4", 0, "Spire",            { preset: "Ethereal Pad", missing: true }),
      inst("p22", "t4", 1, "RC-20 Retro Color", { preset: "Vinyl Warmth" }),
      inst("p11", "t4", 2, "Pro-R 2"),
    ],
    sends: [{ targetTrackId: "t-ret1", targetTrackName: "Room Verb", level: 55, preFader: false }],
  },
  {
    id: "t5", projectId: projAId, name: "Vocals", type: "Audio", color: "hsl(40,80%,55%)",
    isMuted: false, isSoloed: false, volume: 80, pan: 0, index: 4, inputSource: "Input 1", sourceAudioUrl: "/audio/vocals-take3.wav",
    chain: [
      inst("p20", "t5", 0, "Neutron 4",     { preset: "Vocal Chain" }),
      inst("p18", "t5", 1, "Replika XT",    { preset: "Slap Back" }),
      inst("p14", "t5", 2, "Valhalla Room", { preset: "Vocal Plate" }),
    ],
    sends: [
      { targetTrackId: "t-ret1", targetTrackName: "Room Verb", level: 30, preFader: false },
      { targetTrackId: "t-ret2", targetTrackName: "Delay Send", level: 25, preFader: false },
    ],
  },
  {
    id: "t6", projectId: projAId, name: "Hi-Hats", type: "Audio", color: "hsl(50,60%,50%)",
    isMuted: false, isSoloed: false, volume: 65, pan: 25, index: 5, inputSource: null, sourceAudioUrl: "/audio/hihats-loop.wav",
    chain: [
      inst("p10", "t6", 0, "Pro-Q 3", { preset: "Hat Shape" }),
      inst("p12", "t6", 1, "Pro-C 2", { preset: "Transient" }),
    ],
    sends: [{ targetTrackId: "t-ret1", targetTrackName: "Room Verb", level: 10, preFader: false }],
  },
  {
    id: "t7", projectId: projAId, name: "Clap / Snare", type: "Audio", color: "hsl(15,75%,55%)",
    isMuted: false, isSoloed: false, volume: 78, pan: 0, index: 6, inputSource: null, sourceAudioUrl: "/audio/clap-snare.wav",
    chain: [
      inst("p10", "t7", 0, "Pro-Q 3"),
      inst("p16", "t7", 1, "Decapitator", { preset: "Crunch" }),
    ],
    sends: [{ targetTrackId: "t-ret1", targetTrackName: "Room Verb", level: 35, preFader: false }],
  },
  {
    id: "t-ret1", projectId: projAId, name: "Room Verb", type: "Return", color: "hsl(220,50%,50%)",
    isMuted: false, isSoloed: false, volume: 70, pan: 0, index: 10, inputSource: null, sourceAudioUrl: null,
    chain: [inst("p14", "t-ret1", 0, "Valhalla Room", { preset: "Large Room" })],
    sends: [],
  },
  {
    id: "t-ret2", projectId: projAId, name: "Delay Send", type: "Return", color: "hsl(300,50%,50%)",
    isMuted: false, isSoloed: false, volume: 60, pan: 0, index: 11, inputSource: null, sourceAudioUrl: null,
    chain: [inst("p15", "t-ret2", 0, "Valhalla Delay", { preset: "Dotted 8th" })],
    sends: [],
  },
  {
    id: "t-master", projectId: projAId, name: "Master", type: "Master", color: "hsl(0,0%,50%)",
    isMuted: false, isSoloed: false, volume: 90, pan: 0, index: 99, inputSource: null, sourceAudioUrl: null,
    chain: [
      inst("p10", "t-master", 0, "Pro-Q 3",  { preset: "Master EQ" }),
      inst("p13", "t-master", 1, "Pro-L 2",  { preset: "Master Limit" }),
      inst("p19", "t-master", 2, "Ozone 11", { preset: "Mastering Suite" }),
    ],
    sends: [],
  },
];

/* ── Projects ────────────────────────────────────────────── */

export const MOCK_PROJECTS: ProjectManifest[] = [
  {
    id: projAId, name: "Midnight Drive", daw: "Ableton",
    filePath: "~/Music/Ableton/Projects/Midnight Drive/Midnight Drive.als",
    importedAt: "2026-03-10T14:30:00Z",
    tempo: 124, timeSignature: "4/4", key: "F minor",
    duration: "4:32", sampleRate: 48000,
    tracks: projATracks,
    trackCount: 10, pluginCount: 24, missingCount: 2,
  },
  {
    id: "proj-2", name: "Golden Hour", daw: "Logic",
    filePath: "~/Music/Logic/Golden Hour.logicx",
    importedAt: "2026-03-08T09:15:00Z",
    tempo: 96, timeSignature: "4/4", key: "C major",
    duration: "5:18", sampleRate: 44100,
    tracks: [], trackCount: 8, pluginCount: 16, missingCount: 0,
  },
  {
    id: "proj-3", name: "Neon Pulse", daw: "Bitwig",
    filePath: "~/Music/Bitwig/Neon Pulse.bwproject",
    importedAt: "2026-03-05T18:45:00Z",
    tempo: 140, timeSignature: "4/4", key: null,
    duration: "3:45", sampleRate: 48000,
    tracks: [], trackCount: 12, pluginCount: 30, missingCount: 1,
  },
];

/* ── Suggested replacements ──────────────────────────────── */

// Find missing instances
const sylenth1Instance = projATracks.flatMap(t => t.chain).find(i => i.pluginId === "p31")!;
const spireInstance = projATracks.flatMap(t => t.chain).find(i => i.pluginId === "p30")!;

export const MOCK_REPLACEMENTS: SuggestedReplacement[] = [
  { id: "sr1", instanceId: sylenth1Instance.id, replacementPluginId: "p5",  replacementName: "Vital",      replacementVendor: "Matt Tytel",       reason: "Free wavetable synth with similar sound shaping",           matchScore: 88, free: true,  url: "https://vital.audio", status: "pending" },
  { id: "sr2", instanceId: sylenth1Instance.id, replacementPluginId: "p2",  replacementName: "Diva",       replacementVendor: "u-he",             reason: "Premium analog modeling with classic filter emulations",    matchScore: 82, free: false, url: null,                  status: "pending" },
  { id: "sr3", instanceId: sylenth1Instance.id, replacementPluginId: "p1",  replacementName: "Serum",      replacementVendor: "Xfer Records",     reason: "Industry-standard wavetable synth, excellent for leads",    matchScore: 78, free: false, url: null,                  status: "pending" },
  { id: "sr4", instanceId: spireInstance.id,     replacementPluginId: "p4",  replacementName: "Pigments",   replacementVendor: "Arturia",          reason: "Versatile hybrid synth with excellent pad capabilities",    matchScore: 90, free: false, url: null,                  status: "pending" },
  { id: "sr5", instanceId: spireInstance.id,     replacementPluginId: "p5",  replacementName: "Vital",      replacementVendor: "Matt Tytel",       reason: "Powerful wavetable synth, great for evolving pads",         matchScore: 85, free: true,  url: "https://vital.audio", status: "pending" },
  { id: "sr6", instanceId: spireInstance.id,     replacementPluginId: "p3",  replacementName: "Massive X",  replacementVendor: "Native Instruments", reason: "Deep modulation routing for complex pads",               matchScore: 75, free: false, url: null,                  status: "pending" },
];

/* ── Missing plugin view models ──────────────────────────── */

export const MOCK_MISSING: MissingPluginInfo[] = [
  {
    name: "Sylenth1", vendor: "LennarDigital", format: "VST3",
    usedOnTracks: [{ trackId: "t3", trackName: "Lead Synth" }],
    replacements: MOCK_REPLACEMENTS.filter(r => r.instanceId === sylenth1Instance.id),
  },
  {
    name: "Spire", vendor: "Reveal Sound", format: "VST3",
    usedOnTracks: [{ trackId: "t4", trackName: "Pad" }],
    replacements: MOCK_REPLACEMENTS.filter(r => r.instanceId === spireInstance.id),
  },
];

/* ── Analysis result ─────────────────────────────────────── */

export const MOCK_ANALYSIS: AnalysisResult = {
  id: "analysis-1",
  projectId: projAId,
  createdAt: "2026-03-10T15:00:00Z",
  status: "complete",
  summary: "Overall chain health is good. Two missing plugins need attention. Consider reordering EQ/compressor on Kick and adding sidechain to Bass.",
  healthScore: 72,
  cpuEstimate: 34,
  pluginRoles: [
    { instanceId: projATracks[0].chain[0].id, role: "tonal shaping",      confidence: 0.95 },
    { instanceId: projATracks[0].chain[1].id, role: "dynamics control",   confidence: 0.92 },
    { instanceId: projATracks[0].chain[2].id, role: "harmonic saturation", confidence: 0.88 },
    { instanceId: projATracks[1].chain[0].id, role: "sound generation",   confidence: 0.99 },
    { instanceId: projATracks[1].chain[1].id, role: "harmonic saturation", confidence: 0.90 },
    { instanceId: projATracks[1].chain[2].id, role: "tonal shaping",      confidence: 0.93 },
    { instanceId: projATracks[4].chain[0].id, role: "channel strip",      confidence: 0.91 },
    { instanceId: projATracks[4].chain[1].id, role: "spatial processing",  confidence: 0.87 },
    { instanceId: projATracks[4].chain[2].id, role: "spatial processing",  confidence: 0.94 },
    { instanceId: projATracks[9].chain[2].id, role: "mastering suite",     confidence: 0.97 },
  ],
  suggestions: [
    {
      id: "s1", type: "chain_order", severity: "warning",
      title: "EQ before compression on Kick",
      description: "The Kick track has Pro-Q 3 followed by Pro-C 2. Consider placing the compressor first for a more natural response, then shape with EQ after — this reduces the compressor reacting to frequencies you'd remove anyway.",
      trackId: "t1", trackName: "Kick", instanceId: projATracks[0].chain[0].id, deviceName: "Pro-Q 3",
      action: "Reorder", dismissed: false,
    },
    {
      id: "s2", type: "redundant_plugin", severity: "info",
      title: "Duplicate Pro-Q 3 instances",
      description: "Pro-Q 3 appears 5 times across the project. Consider using a single instance per group bus for CPU savings — the Hat Shape and Master EQ instances could be consolidated on a drum bus.",
      action: "Review", dismissed: false,
    },
    {
      id: "s3", type: "missing_treatment", severity: "warning",
      title: "Bass Synth lacks sidechain compression",
      description: "The Bass Synth track has no sidechain to the Kick. Adding a compressor with sidechain input from the Kick can create better low-end clarity and the classic pumping effect.",
      trackId: "t2", trackName: "Bass Synth", instanceId: null,
      action: "Add Device", dismissed: false,
    },
    {
      id: "s4", type: "cpu_optimization", severity: "info",
      title: "Ozone 11 on Master may be heavy",
      description: "Ozone 11's full mastering suite uses significant CPU. Consider freezing the Master chain or using individual Ozone modules instead of the full suite during production.",
      trackId: "t-master", trackName: "Master", instanceId: projATracks[9].chain[2].id, deviceName: "Ozone 11",
      action: "Optimize", dismissed: false,
    },
    {
      id: "s5", type: "gain_staging", severity: "critical",
      title: "Vocals may be clipping before Neutron",
      description: "The Vocals track volume is at 80% with no gain utility before Neutron 4. If the source audio is hot, the first plugin could clip. Add a gain plugin or reduce input by −3 dB.",
      trackId: "t5", trackName: "Vocals", instanceId: projATracks[4].chain[0].id, deviceName: "Neutron 4",
      action: "Add Gain", dismissed: false,
    },
    {
      id: "s6", type: "alternative", severity: "info",
      title: "Sylenth1 → Vital as free alternative",
      description: "The Lead Synth track uses Sylenth1 which is missing. Vital (free) has comparable oscillators, wavetable support, and a modern modulation system that can recreate most Sylenth1 patches.",
      trackId: "t3", trackName: "Lead Synth", instanceId: sylenth1Instance.id, deviceName: "Sylenth1",
      action: "Swap", dismissed: false,
    },
  ],
};

/* ── Plugin library ──────────────────────────────────────── */

export const MOCK_LIBRARY: PluginLibrary = {
  id: "lib-1",
  userId: "user-1",
  name: "Studio Mac Pro",
  os: "macOS",
  scanPaths: [
    "/Library/Audio/Plug-Ins/VST3",
    "/Library/Audio/Plug-Ins/Components",
  ],
  plugins: MOCK_PLUGINS,
  lastScannedAt: "2026-03-11T10:05:00Z",
  pluginCount: MOCK_PLUGINS.length,
  installedCount: MOCK_PLUGINS.filter(p => p.installed).length,
  missingCount: MOCK_PLUGINS.filter(p => !p.installed).length,
  createdAt: "2026-01-15T08:00:00Z",
  updatedAt: "2026-03-11T10:05:00Z",
};

/* ── Plugin matches ─────────────────────────────────────── */

export const MOCK_MATCHES: PluginMatch[] = [
  {
    id: "pm-1",
    sourcePluginId: "p31", sourceName: "Sylenth1", sourceVendor: "LennarDigital",
    matchedPluginId: "p5", matchedName: "Vital", matchedVendor: "Matt Tytel",
    matchMethod: "ai", matchScore: 88, formatCompatible: true, versionCompatible: true,
    tagOverlap: ["Synth"], libraryId: "lib-1", verified: false,
    createdAt: "2026-03-10T15:00:00Z",
  },
  {
    id: "pm-2",
    sourcePluginId: "p31", sourceName: "Sylenth1", sourceVendor: "LennarDigital",
    matchedPluginId: "p2", matchedName: "Diva", matchedVendor: "u-he",
    matchMethod: "tag", matchScore: 82, formatCompatible: true, versionCompatible: true,
    tagOverlap: ["Analog", "Synth"], libraryId: "lib-1", verified: false,
    createdAt: "2026-03-10T15:00:00Z",
  },
  {
    id: "pm-3",
    sourcePluginId: "p30", sourceName: "Spire", sourceVendor: "Reveal Sound",
    matchedPluginId: "p4", matchedName: "Pigments", matchedVendor: "Arturia",
    matchMethod: "ai", matchScore: 90, formatCompatible: true, versionCompatible: true,
    tagOverlap: ["Synth"], libraryId: "lib-1", verified: true,
    createdAt: "2026-03-10T15:00:00Z",
  },
  {
    id: "pm-4",
    sourcePluginId: "p30", sourceName: "Spire", sourceVendor: "Reveal Sound",
    matchedPluginId: "p5", matchedName: "Vital", matchedVendor: "Matt Tytel",
    matchMethod: "category", matchScore: 85, formatCompatible: true, versionCompatible: true,
    tagOverlap: ["Synth"], libraryId: "lib-1", verified: false,
    createdAt: "2026-03-10T15:00:00Z",
  },
];

/* ── Render jobs ─────────────────────────────────────────── */

export const MOCK_RENDER_JOBS: RenderJob[] = [
  {
    id: "rj-1", projectId: projAId, trackId: "t1", chainRange: null,
    status: "done", progress: 100, startBeat: 0, endBeat: 64,
    outputFormat: "wav", outputUrl: "/renders/kick-preview.wav", error: null,
    createdAt: "2026-03-10T15:10:00Z", completedAt: "2026-03-10T15:10:12Z",
  },
  {
    id: "rj-2", projectId: projAId, trackId: "t5", chainRange: [0, 1],
    status: "rendering", progress: 45, startBeat: 0, endBeat: 32,
    outputFormat: "wav", outputUrl: null, error: null,
    createdAt: "2026-03-10T15:12:00Z", completedAt: null,
  },
  {
    id: "rj-3", projectId: projAId, trackId: null, chainRange: null,
    status: "queued", progress: 0, startBeat: 0, endBeat: 128,
    outputFormat: "mp3", outputUrl: null, error: null,
    createdAt: "2026-03-10T15:13:00Z", completedAt: null,
  },
];
