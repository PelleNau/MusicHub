import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { gunzip } from "https://deno.land/x/compress@v0.4.5/gzip/gzip.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ── Helpers ──

function attr(xml: string, tag: string, a: string): string | null {
  const m = xml.match(new RegExp(`<${tag}[^>]*?\\s${a}="([^"]*)"`, "i"));
  return m ? m[1] : null;
}

function allAttr(xml: string, tag: string, a: string): string[] {
  const re = new RegExp(`<${tag}[^>]*?\\s${a}="([^"]*)"`, "gi");
  const out: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml)) !== null) out.push(m[1]);
  return out;
}

function unique(arr: string[]): string[] {
  return [...new Set(arr)].filter(Boolean).sort();
}

const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

// Known Ableton native instruments & effects for matching
// Native container instruments — these are just wrappers, the preset name is what matters
const CONTAINER_INSTRUMENTS = new Set([
  "MultiSampler", "Simpler", "OriginalSimpler", "InstrumentGroupDevice",
  "DrumGroupDevice", "InstrumentImpulse",
]);

const NATIVE_INSTRUMENTS = new Set([
  "Operator", "Simpler", "Sampler", "Wavetable", "Drift", "Analog", "Tension",
  "Collision", "ElectricInstrument", "StringStudio", "InstrumentImpulse",
  "OriginalSimpler", "MultiSampler", "UltraAnalog", "LoungeLizard",
  "DrumGroupDevice", "InstrumentGroupDevice",
]);

const NATIVE_EFFECTS = new Set([
  "Reverb", "Delay", "Chorus", "Compressor", "Eq8", "GlueCompressor",
  "Saturator", "AutoFilter", "AutoPan", "BeatRepeat", "Corpus", "ErosionDevice",
  "FilterDelay", "Flanger", "FrequencyShifter", "Gate", "GrainDelay", "Limiter",
  "Looper", "MultibandDynamics", "Overdrive", "Pedal", "Phaser", "PingPongDelay",
  "Redux", "Resonator", "Amp", "Cabinet", "Tuner", "Spectrum", "Utility",
  "Vocoder", "Vinyl", "Echo", "ChannelEq", "Hybrid", "PhaserNew", "ChorusNew",
  "StereoGain", "AudioEffectGroupDevice", "MidiEffectGroupDevice",
]);

// ── Device parameter extraction ──

interface DeviceInfo {
  name: string;
  type: "instrument" | "effect" | "unknown";
  isPlugin: boolean;
  nativeType?: string;
  pluginFormat?: string;
  presetName?: string;
  parameters: { name: string; value: string }[];
  sidechain?: SidechainInfo;
}

/**
 * Find the user-assigned preset name for a device block.
 * Ableton stores it as <UserName Value="MyPreset" /> inside the device tag.
 */
function extractPresetName(deviceXml: string): string | undefined {
  const m = deviceXml.match(/<UserName\s+Value="([^"]+)"/);
  if (m && m[1].length > 0) return m[1];
  return undefined;
}

/**
 * Extract "interesting" parameters from a device XML block.
 * We look for <Manual Value="..." /> inside recognisable parameter wrappers.
 * We keep it lightweight: only named params where the wrapper tag is descriptive.
 */
function extractParams(deviceXml: string, limit = 12): { name: string; value: string }[] {
  // Pattern: <SomeDescriptiveParam>\n  ... <Manual Value="X" />
  // We match the wrapper tag name + the Manual value inside it
  const re = /<([A-Z][A-Za-z0-9_]{2,})>\s*(?:<[^>]*\/>?\s*)*<Manual\s+Value="([^"]*?)"\s*\/>/g;
  const params: { name: string; value: string }[] = [];
  const seen = new Set<string>();
  let m: RegExpExecArray | null;
  while ((m = re.exec(deviceXml)) !== null) {
    const name = m[1];
    const value = m[2];
    // Skip internal / automation IDs
    if (name === "AutomationTarget" || name === "ModulationTarget" || name === "MidiControllerRange") continue;
    if (seen.has(name)) continue;
    seen.add(name);
    // Format numeric values nicely
    const num = parseFloat(value);
    const display = !isNaN(num) ? (Number.isInteger(num) ? String(num) : num.toFixed(2)) : value;
    params.push({ name: camelToLabel(name), value: display });
    if (params.length >= limit) break;
  }
  return params;
}

function camelToLabel(s: string): string {
  return s.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/_/g, " ");
}

// ── Track-level parsing ──

interface MidiNote {
  pitch: number;       // 0-127 MIDI note number
  velocity: number;    // 0-127
  start: number;       // in beats (relative to clip start)
  duration: number;    // in beats
  mute: boolean;
}

interface ClipInfo {
  name: string;
  startBeats: number;
  endBeats: number;
  color: number;
  isDisabled: boolean;
  isMidi: boolean;
  notes: MidiNote[];
  timeSignatureNumerator?: number;
  timeSignatureDenominator?: number;
}

interface SidechainInfo {
  enabled: boolean;
  source?: string;
  ratio?: string;
  threshold?: string;
  attack?: string;
  release?: string;
}

interface AutomationPoint {
  time: number;
  value: number;
}

interface AutomationEnvelope {
  paramName: string;
  deviceName?: string;
  points: AutomationPoint[];
}

interface TrackInfo {
  name: string;
  type: "midi" | "audio" | "return" | "master" | "group";
  color: number;
  devices: DeviceInfo[];
  volume: number | null;
  pan: number | null;
  isMuted: boolean;
  isSoloed: boolean;
  clipCount: number;
  sends: { returnName: string; level: number }[];
  clips: ClipInfo[];
  automationEnvelopes: AutomationEnvelope[];
}

/**
 * Extract only TOP-LEVEL devices from a track's device chain.
 * Instrument Racks / Audio Effect Racks contain nested chains with sub-devices
 * (e.g. velocity-layer MultiSamplers inside a Grand Piano preset).
 * We treat racks as single opaque items and do NOT recurse into them.
 */
/**
 * Find all top-level child element tags inside an XML string (non-recursive).
 * Returns array of { tagName, xml, pos }.
 */
function extractAllTopLevelElements(xml: string): { tagName: string; xml: string; pos: number }[] {
  const results: { tagName: string; xml: string; pos: number }[] = [];
  // Match any opening tag at the current nesting level
  const re = /<([A-Za-z][A-Za-z0-9_]*)([\s>/])/g;
  let m: RegExpExecArray | null;

  while ((m = re.exec(xml)) !== null) {
    const tagName = m[1];
    const start = m.index;

    // Check for self-closing tag
    const selfCloseCheck = xml.indexOf("/>", start);
    const nextClose = xml.indexOf(">", start + 1);
    if (selfCloseCheck === nextClose - 1 && selfCloseCheck < xml.indexOf(`</${tagName}>`, start)) {
      // self-closing, skip
      re.lastIndex = selfCloseCheck + 2;
      continue;
    }

    // Use balanced tag extraction from this position
    const openTag = `<${tagName}`;
    const closeTag = `</${tagName}>`;
    let depth = 1;
    let pos = start + m[0].length;

    while (depth > 0 && pos < xml.length) {
      const nextOpen = xml.indexOf(openTag, pos);
      const nc = xml.indexOf(closeTag, pos);

      if (nc === -1) break;

      if (nextOpen !== -1 && nextOpen < nc) {
        // Check it's actually an opening tag (followed by space or >)
        const charAfter = xml[nextOpen + openTag.length];
        if (charAfter === ' ' || charAfter === '>' || charAfter === '\n' || charAfter === '\r' || charAfter === '\t') {
          depth++;
        }
        pos = nextOpen + openTag.length;
      } else {
        depth--;
        if (depth === 0) {
          results.push({
            tagName,
            xml: xml.slice(start, nc + closeTag.length),
            pos: start,
          });
        }
        pos = nc + closeTag.length;
      }
    }

    re.lastIndex = pos;
  }

  return results;
}

function tryExtractDevicesFromChains(xml: string): DeviceInfo[] {
  const allDeviceBlocks = extractTagBlocks(xml, "Devices");
  for (let di = 0; di < allDeviceBlocks.length; di++) {
    const rawDevicesXml = allDeviceBlocks[di];
    const innerStart = rawDevicesXml.indexOf(">") + 1;
    const innerEnd = rawDevicesXml.lastIndexOf("</Devices>");
    const devicesXml = innerEnd > innerStart ? rawDevicesXml.slice(innerStart, innerEnd) : rawDevicesXml;
    const trimmed = devicesXml.trim();
    if (!trimmed || trimmed.length < 5) continue;
    const result = extractDevicesFromXml(devicesXml);
    if (result.length > 0) return result;
  }
  return [];
}

function extractDevices(trackXml: string, trackName?: string): DeviceInfo[] {
  // Find ALL <DeviceChain> blocks in this track
  const chainBlocks = extractTagBlocks(trackXml, "DeviceChain");
  if (chainBlocks.length === 0) {
    console.log(`[extractDevices] ${trackName}: no DeviceChain found`);
    return [];
  }

  // Search through all DeviceChain blocks for one containing <Devices>
  for (let ci = 0; ci < chainBlocks.length; ci++) {
    const chain = chainBlocks[ci];

    // Try direct <Devices> inside this DeviceChain
    let result = tryExtractDevicesFromChains(chain);
    if (result.length > 0) {
      console.log(`[extractDevices] ${trackName}: found ${result.length} devices (direct): ${result.map(d => d.name).join(", ")}`);
      return result;
    }

    // For MIDI tracks, Ableton nests devices inside <MainSequencer><DeviceChain><Devices>
    const seqBlocks = extractTagBlocks(chain, "MainSequencer");
    for (const seq of seqBlocks) {
      const innerChains = extractTagBlocks(seq, "DeviceChain");
      for (const innerChain of innerChains) {
        result = tryExtractDevicesFromChains(innerChain);
        if (result.length > 0) {
          console.log(`[extractDevices] ${trackName}: found ${result.length} devices (via MainSequencer): ${result.map(d => d.name).join(", ")}`);
          return result;
        }
      }
    }

    if (ci === 0) {
      // Dump top-level tag names inside this DeviceChain for debugging
      const tagRe = /<([A-Za-z][A-Za-z0-9_]*)([\s>])/g;
      const tags = new Set<string>();
      let tm;
      // Only scan first 2000 chars to find top-level children
      const scanArea = chain.substring(chain.indexOf(">") + 1, chain.indexOf(">") + 2000);
      while ((tm = tagRe.exec(scanArea)) !== null) tags.add(tm[1]);
      console.log(`[extractDevices] ${trackName}: DeviceChain[0] top-level tags: ${[...tags].join(", ")}`);
      
      // Also check if there's a nested structure we're missing
      const hasMainSeq = chain.includes("<MainSequencer");
      const hasDevices = chain.includes("<Devices");
      const devicesCount = (chain.match(/<Devices[\s>]/g) || []).length;
      console.log(`[extractDevices] ${trackName}: hasMainSequencer=${hasMainSeq}, hasDevices=${hasDevices}, devicesOccurrences=${devicesCount}, chainLength=${chain.length}`);
    }
  }

  console.log(`[extractDevices] ${trackName}: no devices found in any chain/block`);
  return [];
}
function extractDevicesFromXml(devicesXml: string): DeviceInfo[] {
  const devices: DeviceInfo[] = [];

  // Container/Rack types — show as single device, don't recurse
  const RACK_TYPES = new Set([
    "InstrumentGroupDevice", "AudioEffectGroupDevice", "MidiEffectGroupDevice",
    "DrumGroupDevice",
  ]);

  // Get ALL top-level elements inside <Devices>
  const topLevelDevices = extractAllTopLevelElements(devicesXml);
  // Build rack ranges to filter nested devices
  const rackRanges: { start: number; end: number }[] = [];
  for (const d of topLevelDevices) {
    if (RACK_TYPES.has(d.tagName)) {
      rackRanges.push({ start: d.pos, end: d.pos + d.xml.length });
    }
  }

  for (const d of topLevelDevices) {

    // Skip if nested inside a rack
    if (!RACK_TYPES.has(d.tagName)) {
      const isNested = rackRanges.some(r => d.pos > r.start && d.pos < r.end);
      if (isNested) continue;
    }

    if (d.tagName === "PluginDevice") {
      // Plugin handling
      let pluginName = attr(d.xml, "PlugName", "Value");
      if (!pluginName) {
        const auNameMatch = d.xml.match(/<AuPluginInfo>[\s\S]*?<Name\s+Value="([^"]*)"/);
        if (auNameMatch) pluginName = auNameMatch[1];
      }
      if (!pluginName || pluginName === "undefined") continue;

      let format: string | undefined;
      if (d.xml.includes("<Vst3PluginInfo")) format = "VST3";
      else if (d.xml.includes("<VstPluginInfo")) format = "VST2";
      else if (d.xml.includes("<AuPluginInfo")) format = "AU";

      // Check for sidechain on plugin compressors
      const sc = extractSidechain(d.xml);
      devices.push({
        name: pluginName,
        type: d.xml.includes("MIDI") || d.xml.includes("Instrument") ? "instrument" : "effect",
        isPlugin: true,
        pluginFormat: format,
        presetName: extractPresetName(d.xml),
        parameters: extractParams(d.xml, 6),
        ...(sc ? { sidechain: sc } : {}),
      });
    } else {
      // Native device (any tag that isn't PluginDevice)
      const isInstrument = NATIVE_INSTRUMENTS.has(d.tagName);
      const presetName = extractPresetName(d.xml);
      const displayName = (CONTAINER_INSTRUMENTS.has(d.tagName) && presetName)
        ? presetName
        : d.tagName;

      // Check for sidechain on native compressors (Compressor2, GlueCompressor)
      const isCompressor = d.tagName === "Compressor2" || d.tagName === "GlueCompressor" || d.tagName === "MultibandDynamics";
      const sc = isCompressor ? extractSidechain(d.xml) : undefined;

      devices.push({
        name: displayName,
        type: isInstrument ? "instrument" : "effect",
        isPlugin: false,
        nativeType: d.tagName,
        presetName: CONTAINER_INSTRUMENTS.has(d.tagName) ? undefined : presetName,
        parameters: extractParams(d.xml, 6),
        ...(sc ? { sidechain: sc } : {}),
      });
    }
  }

  return devices;
}

/** Extract mixer volume (0-1 linear) from track XML */
function extractVolume(trackXml: string): number | null {
  const m = trackXml.match(/<Volume>\s*(?:<[^>]*\/>\s*)*<Manual\s+Value="([^"]*?)"/);
  return m ? parseFloat(m[1]) : null;
}

/** Extract mixer pan (-1 to 1) from track XML */
function extractPan(trackXml: string): number | null {
  const m = trackXml.match(/<Pan>\s*(?:<[^>]*\/>\s*)*<Manual\s+Value="([^"]*?)"/);
  return m ? parseFloat(m[1]) : null;
}

/** Extract mute state */
function extractMute(trackXml: string): boolean {
  // Ableton tracks don't have a simple Mute tag — check DeviceChain/Mixer/Speaker
  // We look for <Speaker><Manual Value="false" /> which means muted
  const m = trackXml.match(/<Speaker>\s*(?:<[^>]*\/>\s*)*<Manual\s+Value="([^"]*?)"/);
  return m ? m[1] === "false" : false;
}

/** Extract solo state */
function extractSolo(trackXml: string): boolean {
  const m = trackXml.match(/<Solo\s+Value="([^"]*?)"/);
  return m ? m[1] === "true" : false;
}

/** Count clips in a track */
function countClips(trackXml: string): number {
  // Count MidiClip and AudioClip occurrences
  const midiClips = (trackXml.match(/<MidiClip\s/g) || []).length;
  const audioClips = (trackXml.match(/<AudioClip\s/g) || []).length;
  return midiClips + audioClips;
}

/** Extract MIDI notes from a MidiClip block */
function extractMidiNotes(clipXml: string, limit = 500): MidiNote[] {
  const notes: MidiNote[] = [];

  // Ableton stores notes in <KeyTracks><KeyTrack><MidiKey Value="pitch"/><Notes><MidiNoteEvent .../>
  const keyTrackBlocks = extractTagBlocks(clipXml, "KeyTrack");
  for (const kt of keyTrackBlocks) {
    if (notes.length >= limit) break;

    const pitchM = kt.match(/<MidiKey\s+Value="(\d+)"/);
    const pitch = pitchM ? parseInt(pitchM[1]) : -1;
    if (pitch < 0) continue;

    // Extract all MidiNoteEvent in this KeyTrack
    const noteRe = /<MidiNoteEvent[^>]*?\sTime="([^"]*)"[^>]*?\sDuration="([^"]*)"[^>]*?\sVelocity="([^"]*)"[^>]*?(?:\sIsEnabled="([^"]*)")?/g;
    let nm: RegExpExecArray | null;
    while ((nm = noteRe.exec(kt)) !== null) {
      if (notes.length >= limit) break;
      const start = parseFloat(nm[1]);
      const duration = parseFloat(nm[2]);
      const velocity = parseFloat(nm[3]);
      const isEnabled = nm[4] !== "false"; // defaults to true if not present
      if (isNaN(start) || isNaN(duration)) continue;

      notes.push({
        pitch,
        velocity: Math.round(velocity),
        start,
        duration,
        mute: !isEnabled,
      });
    }
  }

  // Also try the flat <Notes><MidiNoteEvent> format (Ableton 12+)
  if (notes.length === 0) {
    const noteRe = /<MidiNoteEvent[^>]*?\sTime="([^"]*)"[^>]*?\sDuration="([^"]*)"[^>]*?\sVelocity="([^"]*)"[^>]*?\sNoteId="[^"]*"[^>]*?(?:\sIsEnabled="([^"]*)")?/g;
    let nm: RegExpExecArray | null;
    while ((nm = noteRe.exec(clipXml)) !== null) {
      if (notes.length >= limit) break;
      const start = parseFloat(nm[1]);
      const duration = parseFloat(nm[2]);
      const velocity = parseFloat(nm[3]);
      const isEnabled = nm[4] !== "false";
      if (isNaN(start) || isNaN(duration)) continue;

      // Try to get pitch from nearby context
      const pitchM = clipXml.substring(Math.max(0, nm.index - 100), nm.index + nm[0].length).match(/\sPitch="(\d+)"/);
      const pitch = pitchM ? parseInt(pitchM[1]) : 60;

      notes.push({ pitch, velocity: Math.round(velocity), start, duration, mute: !isEnabled });
    }
  }

  // Sort by start time
  notes.sort((a, b) => a.start - b.start);
  return notes;
}

/** Extract clips (MidiClip and AudioClip) with time positions and MIDI notes */
function extractClips(trackXml: string): ClipInfo[] {
  const clips: ClipInfo[] = [];
  for (const tag of ["MidiClip", "AudioClip"]) {
    const isMidi = tag === "MidiClip";
    for (const block of extractTagBlocks(trackXml, tag)) {
      const name = attr(block, "Name", "Value") || tag;
      const startM = block.match(/<CurrentStart\s+Value="([^"]*?)"/);
      const endM = block.match(/<CurrentEnd\s+Value="([^"]*?)"/);
      const colorM = attr(block, "Color", "Value");
      const disabledM = attr(block, "IsDisabled", "Value");
      
      const startBeats = startM ? parseFloat(startM[1]) : 0;
      const endBeats = endM ? parseFloat(endM[1]) : startBeats + 4;

      // Extract time signature if present
      const tsNumM = block.match(/<TimeSignatures>[\s\S]*?<Numerator\s+Value="(\d+)"/);
      const tsDenM = block.match(/<TimeSignatures>[\s\S]*?<Denominator\s+Value="(\d+)"/);

      const notes = isMidi ? extractMidiNotes(block) : [];

      clips.push({
        name,
        startBeats,
        endBeats,
        color: colorM ? parseInt(colorM) : -1,
        isDisabled: disabledM === "true",
        isMidi,
        notes,
        timeSignatureNumerator: tsNumM ? parseInt(tsNumM[1]) : undefined,
        timeSignatureDenominator: tsDenM ? parseInt(tsDenM[1]) : undefined,
      });
    }
  }
  // Sort by start position
  clips.sort((a, b) => a.startBeats - b.startBeats);
  return clips;
}

/** Extract send levels from a track (returns array of send levels) */
function extractSends(trackXml: string): number[] {
  const sends: number[] = [];
  const sendRe = /<TrackSendHolder[\s\S]*?<Send>\s*(?:<[^>]*\/>\s*)*<Manual\s+Value="([^"]*?)"/g;
  let m: RegExpExecArray | null;
  while ((m = sendRe.exec(trackXml)) !== null) {
    sends.push(parseFloat(m[1]));
  }
  return sends;
}

/** Extract sidechain info from a compressor device XML block */
function extractSidechain(deviceXml: string): SidechainInfo | undefined {
  // Check for Sidechain section
  const hasSidechain = deviceXml.includes("<Sidechain>");
  if (!hasSidechain) return undefined;

  // Check if sidechain is actually enabled (has a routed source)
  const sidechainBlock = extractTagBlocks(deviceXml, "Sidechain");
  if (sidechainBlock.length === 0) return undefined;

  const sc = sidechainBlock[0];

  // Check for external/sidechain routing
  const routingMatch = sc.match(/<UpperDisplayString\s+Value="([^"]*)"/);
  const source = routingMatch ? routingMatch[1] : undefined;
  
  // Only report sidechain if there's actually a source routed
  const isEnabled = source && source !== "None" && source !== "" && source !== "No Output";
  if (!isEnabled) return undefined;

  // Extract compressor params from the parent device
  const ratioMatch = deviceXml.match(/<Ratio>\s*(?:<[^>]*\/>\s*)*<Manual\s+Value="([^"]*?)"/);
  const thresholdMatch = deviceXml.match(/<Threshold>\s*(?:<[^>]*\/>\s*)*<Manual\s+Value="([^"]*?)"/);
  const attackMatch = deviceXml.match(/<Attack>\s*(?:<[^>]*\/>\s*)*<Manual\s+Value="([^"]*?)"/);
  const releaseMatch = deviceXml.match(/<Release>\s*(?:<[^>]*\/>\s*)*<Manual\s+Value="([^"]*?)"/);

  return {
    enabled: true,
    source,
    ratio: ratioMatch ? parseFloat(ratioMatch[1]).toFixed(1) : undefined,
    threshold: thresholdMatch ? parseFloat(thresholdMatch[1]).toFixed(1) + " dB" : undefined,
    attack: attackMatch ? parseFloat(attackMatch[1]).toFixed(1) + " ms" : undefined,
    release: releaseMatch ? parseFloat(releaseMatch[1]).toFixed(1) + " ms" : undefined,
  };
}

/**
 * Build a map of AutomationTarget Id → human-readable parameter name.
 * In Ableton XML the structure is:
 *   <Volume>
 *     <LomId Value="0"/>
 *     <Manual Value="0.85"/>
 *     <MidiControllerRange><Min .../><Max .../></MidiControllerRange>
 *     <AutomationTarget Id="123"/>
 *   </Volume>
 * We walk backwards through opening tags, skipping known sibling/structural tags.
 */
function buildParamIdMap(trackXml: string): Map<string, { paramName: string; deviceName?: string }> {
  const map = new Map<string, { paramName: string; deviceName?: string }>();

  // Tags to skip over (siblings and structural wrappers, not the param itself)
  const SKIP_TAGS = new Set([
    // Structural wrappers
    "ArrangerAutomation", "AutomationTarget", "Events", "Automation",
    "EnvelopeTarget", "AutomationEnvelope",
    // Common siblings inside parameter blocks
    "LomId", "LomIdView", "Manual", "AutomationNameInMidi",
    "MidiControllerRange", "Min", "Max",
    "ModulationTarget", "ModulatedParameters",
    // UI/View state tags that are siblings
    "IsAutoSelectEnabled", "IsTransformPending", "TimeAndValueTransforms",
    "AutomationTransformViewState",
  ]);

  // If we hit one of these, this AutomationTarget is for a non-musical param — discard
  const BLOCKLIST = new Set([
    "AreDevicesVisible", "IsContentSelected",
    "IsContentSelectedInDocument", "PreferModulationVisible",
    "LinkedParameterGroupId", "SelectedDevice", "SelectedEnvelope",
    "AutomationLanes", "AutomationLane", "LaneHeight",
    "AreAdditionalAutomationLanesFolded", "ClipEnvelopeChooserViewState",
    "IsFolded", "ShouldShowPresetName", "UserName",
    "Annotation", "SourceContext", "BranchSourceContext",
    "DevicesListWrapper",
  ]);

  const re = /<AutomationTarget\s+Id="(\d+)"/g;
  let m: RegExpExecArray | null;

  while ((m = re.exec(trackXml)) !== null) {
    const id = m[1];
    const before = trackXml.substring(Math.max(0, m.index - 600), m.index);

    // Extract all opening tags (not self-closing — we want containers)
    const tagMatches = [...before.matchAll(/<(\w+)[\s>]/g)].map(t => t[1]);

    let paramName = "";
    for (let i = tagMatches.length - 1; i >= 0; i--) {
      const tag = tagMatches[i];
      if (SKIP_TAGS.has(tag)) continue;
      if (BLOCKLIST.has(tag)) { paramName = ""; break; }
      paramName = tag;
      break;
    }

    if (!paramName) continue;

    // Make it human readable: CamelCase → spaced
    const readable = paramName.replace(/([a-z])([A-Z])/g, "$1 $2");

    map.set(id, { paramName: readable });
  }

  return map;
}

/** Common Ableton parameter name prettification */
function prettifyParamName(name: string): string {
  const PRETTY: Record<string, string> = {
    "Volume": "Volume",
    "Pan": "Pan",
    "Send A": "Send A",
    "Send B": "Send B",
    "Send C": "Send C",
    "Send D": "Send D",
    "Speaker On": "Track On/Off",
    "Device On": "Device On/Off",
    "Macro 1": "Macro 1",
    "Macro 2": "Macro 2",
    "Macro 3": "Macro 3",
    "Macro 4": "Macro 4",
    "Macro 5": "Macro 5",
    "Macro 6": "Macro 6",
    "Macro 7": "Macro 7",
    "Macro 8": "Macro 8",
    "Cross Fade State": "Crossfade",
    "Tempo Automation": "Tempo",
    "Sends Only": "Sends Only",
    "Threshold": "Threshold",
    "Ratio": "Ratio",
    "Attack": "Attack",
    "Release": "Release",
    "Output Gain": "Output Gain",
    "Dry Wet": "Dry/Wet",
    "Frequency": "Frequency",
    "Resonance": "Resonance",
    "Cutoff": "Cutoff",
    "Feedback": "Feedback",
    "Decay Time": "Decay Time",
  };
  return PRETTY[name] || name;
}

/** Extract automation envelopes from a track */
function extractAutomation(trackXml: string, trackName?: string, limit = 20): AutomationEnvelope[] {
  const envelopes: AutomationEnvelope[] = [];
  const paramMap = buildParamIdMap(trackXml);

  // Ableton stores automation in <AutomationEnvelope> blocks
  const envBlocks = extractTagBlocks(trackXml, "AutomationEnvelope");

  for (let bi = 0; bi < envBlocks.length; bi++) {
    const block = envBlocks[bi];
    if (envelopes.length >= limit) break;

    // Get the automated parameter ID path
    const paramIdMatch = block.match(/<PointeeId\s+Value="(\d+)"/);
    if (!paramIdMatch) continue;

    // Extract the envelope events
    const events: { time: number; value: number }[] = [];
    const eventRe = /<(?:Float|Bool|Int)Event[^>]*?\sTime="([^"]*)"[^>]*?\sValue="([^"]*)"/g;
    let em: RegExpExecArray | null;
    while ((em = eventRe.exec(block)) !== null) {
      const time = parseFloat(em[1]);
      if (time < 0) continue;
      const rawVal = em[2];
      const value = rawVal === "true" ? 1 : rawVal === "false" ? 0 : parseFloat(rawVal);
      if (isNaN(value)) continue;
      events.push({ time, value });
    }

    if (events.length < 2) continue;

    // Resolve parameter name from the map
    const resolved = paramMap.get(paramIdMatch[1]);
    const paramName = resolved ? prettifyParamName(resolved.paramName) : `Param #${paramIdMatch[1]}`;
    const deviceName = resolved?.deviceName;

    envelopes.push({ paramName, deviceName, points: events });
  }

  // Also check for <Envelopes> inside clip envelopes
  const envelopeContainers = extractTagBlocks(trackXml, "Envelopes");
  for (const container of envelopeContainers) {
    if (envelopes.length >= limit) break;

    const clipEnvBlocks = extractTagBlocks(container, "ClipEnvelope");
    for (const clipEnv of clipEnvBlocks) {
      if (envelopes.length >= limit) break;

      const events: { time: number; value: number }[] = [];
      const eventRe = /<(?:Float|Bool|Int)Event[^>]*?\sTime="([^"]*)"[^>]*?\sValue="([^"]*)"/g;
      let em: RegExpExecArray | null;
      while ((em = eventRe.exec(clipEnv)) !== null) {
        const time = parseFloat(em[1]);
        if (time < 0) continue;
        const rawVal = em[2];
        const value = rawVal === "true" ? 1 : rawVal === "false" ? 0 : parseFloat(rawVal);
        if (isNaN(value)) continue;
        events.push({ time, value });
      }

      if (events.length < 2) continue;

      envelopes.push({ paramName: "Clip Envelope", points: events });
    }
  }

  return envelopes;
}

/**
 * Extract all top-level occurrences of <TagName ...>...</TagName> from XML.
 * Uses a balanced-tag counter instead of lazy regex to handle large/nested content.
 */
function extractTagBlocks(xml: string, tagName: string): string[] {
  const blocks: string[] = [];
  const openRe = new RegExp(`<${tagName}[\\s>]`, "g");
  let openMatch: RegExpExecArray | null;

  while ((openMatch = openRe.exec(xml)) !== null) {
    const start = openMatch.index;
    let depth = 1;
    let pos = start + openMatch[0].length;
    const closeTag = `</${tagName}>`;
    // Use a regex for nested opens to avoid partial tag name matches
    const nestedOpenRe = new RegExp(`<${tagName}[\\s>]`, "g");

    while (depth > 0 && pos < xml.length) {
      nestedOpenRe.lastIndex = pos;
      const nextOpenMatch = nestedOpenRe.exec(xml);
      const nextOpen = nextOpenMatch ? nextOpenMatch.index : -1;
      const nextClose = xml.indexOf(closeTag, pos);

      if (nextClose === -1) break; // malformed

      if (nextOpen !== -1 && nextOpen < nextClose) {
        depth++;
        pos = nextOpen + nextOpenMatch![0].length;
      } else {
        depth--;
        if (depth === 0) {
          blocks.push(xml.slice(start, nextClose + closeTag.length));
        }
        pos = nextClose + closeTag.length;
      }
    }

    // Advance the regex past what we consumed
    openRe.lastIndex = pos;
  }

  return blocks;
}

function extractTracks(xml: string): TrackInfo[] {
  const tracks: TrackInfo[] = [];

  // First pass: collect return track names for send mapping
  const returnBlocks = extractTagBlocks(xml, "ReturnTrack");
  const returnNames = returnBlocks.map(b => attr(b, "EffectiveName", "Value") || "Return");

  function buildTrack(trackXml: string, type: "midi" | "audio" | "return" | "master" | "group", fallbackName: string): TrackInfo {
    const sendLevels = extractSends(trackXml);
    const sends = sendLevels.map((level, i) => ({
      returnName: returnNames[i] || `Return ${String.fromCharCode(65 + i)}`,
      level,
    }));

    const trackName = attr(trackXml, "EffectiveName", "Value") || fallbackName;
    return {
      name: trackName,
      type,
      color: parseInt(attr(trackXml, "Color", "Value") || "-1"),
      devices: extractDevices(trackXml, trackName),
      volume: extractVolume(trackXml),
      pan: extractPan(trackXml),
      isMuted: extractMute(trackXml),
      isSoloed: extractSolo(trackXml),
      clipCount: countClips(trackXml),
      clips: extractClips(trackXml),
      sends,
      automationEnvelopes: extractAutomation(trackXml, trackName),
    };
  }

  // MIDI tracks
  for (const block of extractTagBlocks(xml, "MidiTrack")) {
    tracks.push(buildTrack(block, "midi", "MIDI Track"));
  }

  // Audio tracks
  for (const block of extractTagBlocks(xml, "AudioTrack")) {
    tracks.push(buildTrack(block, "audio", "Audio Track"));
  }

  // Group tracks
  for (const block of extractTagBlocks(xml, "GroupTrack")) {
    tracks.push(buildTrack(block, "group", "Group Track"));
  }

  // Return tracks
  for (const block of returnBlocks) {
    tracks.push(buildTrack(block, "return", "Return Track"));
  }

  // Master track
  const masterBlocks = extractTagBlocks(xml, "MasterTrack");
  if (masterBlocks.length > 0) {
    const mt = buildTrack(masterBlocks[0], "master", "Master");
    if (mt.devices.length > 0) tracks.push(mt);
  }

  return tracks;
}

// ── Main handler ──

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const contentType = req.headers.get("content-type") || "";
    let fileBytes: Uint8Array;

    if (contentType.includes("application/json")) {
      const { file } = await req.json();
      if (!file) throw new Error("Missing 'file' field (base64-encoded .als)");
      fileBytes = Uint8Array.from(atob(file), (c) => c.charCodeAt(0));
    } else {
      fileBytes = new Uint8Array(await req.arrayBuffer());
    }

    if (fileBytes.length === 0) throw new Error("Empty file");

    let xml: string;
    try {
      const decompressed = gunzip(fileBytes);
      xml = new TextDecoder().decode(decompressed);
    } catch {
      xml = new TextDecoder().decode(fileBytes);
    }

    if (!xml.includes("<Ableton")) {
      throw new Error("Not a valid Ableton project file");
    }

    // ── Global metadata ──
    const tempoMatch = xml.match(
      /<Tempo>\s*(?:<[^>]*\/>\s*)*<Manual\s+Value="([^"]*?)"/
    );
    const tempo = tempoMatch ? parseFloat(tempoMatch[1]) : null;

    const timeSigMatch = xml.match(
      /<TimeSignatures>[\s\S]*?<Numerator\s+Value="(\d+)"[\s\S]*?<Denominator\s+Value="(\d+)"/
    );
    const timeSignature = timeSigMatch ? `${timeSigMatch[1]}/${timeSigMatch[2]}` : null;

    const keyNoteMatch = xml.match(/<KeySignature>[\s\S]*?<RootNote\s+Value="(\d+)"/);
    const scaleMatch = xml.match(/<KeySignature>[\s\S]*?<Name\s+Value="([^"]*)"/);
    const key = keyNoteMatch
      ? `${NOTE_NAMES[parseInt(keyNoteMatch[1]) % 12]}${scaleMatch ? ` ${scaleMatch[1]}` : ""}`
      : null;

    // ── Per-track extraction ──
    const tracks = extractTracks(xml);

    // ── Aggregated summaries (still useful for quick overview) ──
    const allPlugins: string[] = [];
    const allNativeDevices: string[] = [];
    for (const t of tracks) {
      for (const d of t.devices) {
        if (d.isPlugin) allPlugins.push(d.name);
        else allNativeDevices.push(d.name);
      }
    }

    const result = {
      tempo,
      timeSignature,
      key,
      plugins: unique(allPlugins),
      abletonDevices: unique(allNativeDevices),
      trackCount: tracks.length,
      tracks,
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
