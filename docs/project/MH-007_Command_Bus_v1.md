# MH-007 Command Bus v1

## Purpose

Define the first concrete command bus contract for MusicHub.

This contract is the boundary that UI, Guide, templates, and AI should target when requesting Studio changes. It sits beside the host adapter layer defined in:

- `docs/project/MH-006_Host_Adapter_Design.md`

It operates against the target domain model defined in:

- `docs/MusicHub_Studio_Domain_Model_v2.md`
- `src/types/musicHubStudioDomain.ts`

## Design Goals

The command bus must:

1. provide one mutation interface for UI, Guide, templates, and AI
2. preserve native authority in connected mode
3. separate command intent from transport/host implementation details
4. support optimistic UI only where safe
5. provide enough acknowledgment structure for validation, debugging, and Guide progression

## Scope

v1 is a contract definition only. It does not require a full runtime bus implementation yet.

v1 covers five command families:

- Studio commands
- Transport commands
- Browser/content commands
- Lesson commands
- Assistant commands

## Core Rule

All product-side mutations should become commands.

This excludes only:

- transient pointer/hover state
- purely local visual state that does not change domain state
- passive observation of host events

## Command Envelope

Every command should share one envelope:

```ts
interface MusicHubCommandEnvelope<TType extends string, TPayload> {
  id: string;
  type: TType;
  source: "user" | "guide" | "template" | "assistant" | "system";
  createdAt: string;
  sessionId?: string;
  projectId?: string;
  correlationId?: string;
  optimistic?: boolean;
  payload: TPayload;
}
```

## Command Result

The bus should expose a structured result instead of ad hoc booleans:

```ts
interface MusicHubCommandAck {
  commandId: string;
  accepted: boolean;
  status:
    | "queued"
    | "applied_local"
    | "forwarded_to_host"
    | "confirmed"
    | "rejected";
  reason?: string;
  affectedIds?: string[];
}
```

## Command History

v1 should assume command history exists for:

- Guide validation
- debugging
- assistant explanation
- auditability of user-visible actions

At minimum, history entries should store:

- command envelope
- latest ack state
- timestamp

## Studio Command Family

These commands mutate product-facing Studio structure.

### Tracks

```ts
type StudioCreateTrackCommand = MusicHubCommandEnvelope<
  "studio.createTrack",
  {
    type: "midi" | "audio" | "group" | "return";
    role?: "standard" | "instrument" | "vocal" | "drum" | "bus";
    name?: string;
    parentGroupTrackId?: string;
    insertAfterTrackId?: string;
  }
>;

type StudioUpdateTrackCommand = MusicHubCommandEnvelope<
  "studio.updateTrack",
  {
    trackId: string;
    patch: Partial<{
      name: string;
      colorToken: string;
      muted: boolean;
      solo: boolean;
      monitoring: "off" | "auto" | "in";
      armed: boolean;
    }>;
  }
>;

type StudioDeleteTrackCommand = MusicHubCommandEnvelope<
  "studio.deleteTrack",
  { trackId: string }
>;
```

### Clips And Notes

```ts
type StudioCreateClipCommand = MusicHubCommandEnvelope<
  "studio.createClip",
  {
    trackId: string;
    laneId?: string;
    clipType: "midi" | "audio" | "pattern";
    startBeat: number;
    lengthBeats: number;
    sourceAssetId?: string;
  }
>;

type StudioUpdateClipCommand = MusicHubCommandEnvelope<
  "studio.updateClip",
  {
    clipId: string;
    patch: Partial<{
      startBeat: number;
      lengthBeats: number;
      offsetBeats: number;
      looped: boolean;
      muted: boolean;
      name: string;
    }>;
  }
>;

type StudioInsertMidiNotesCommand = MusicHubCommandEnvelope<
  "studio.insertMidiNotes",
  {
    clipId: string;
    notes: Array<{
      id?: string;
      pitch: number;
      startBeat: number;
      lengthBeats: number;
      velocity: number;
    }>;
  }
>;

type StudioUpdateMidiNotesCommand = MusicHubCommandEnvelope<
  "studio.updateMidiNotes",
  {
    clipId: string;
    notes: Array<{
      id: string;
      pitch?: number;
      startBeat?: number;
      lengthBeats?: number;
      velocity?: number;
    }>;
  }
>;

type StudioDeleteMidiNotesCommand = MusicHubCommandEnvelope<
  "studio.deleteMidiNotes",
  {
    clipId: string;
    noteIds: string[];
  }
>;
```

### Devices And Chains

```ts
type StudioLoadPluginCommand = MusicHubCommandEnvelope<
  "studio.loadPlugin",
  {
    trackId: string;
    pluginId: string;
    slot?: number;
  }
>;

type StudioInsertPresetChainCommand = MusicHubCommandEnvelope<
  "studio.insertPresetChain",
  {
    trackId: string;
    presetId: string;
  }
>;

type StudioSetPluginParamCommand = MusicHubCommandEnvelope<
  "studio.setPluginParam",
  {
    chainId: string;
    pluginId: string;
    paramId: string;
    value: number | string | boolean;
  }
>;

type StudioOpenPluginEditorCommand = MusicHubCommandEnvelope<
  "studio.openPluginEditor",
  {
    pluginId: string;
  }
>;
```

### Selection And Panels

These remain commands because Guide, templates, and AI may need to drive them.

```ts
type StudioSelectCommand = MusicHubCommandEnvelope<
  "studio.select",
  {
    trackId?: string;
    clipId?: string;
    noteIds?: string[];
    panel?: "browser" | "mixer" | "pianoRoll" | "timeline" | "detail" | "inspector" | "lesson";
  }
>;

type StudioOpenPanelCommand = MusicHubCommandEnvelope<
  "studio.openPanel",
  {
    panel: "browser" | "mixer" | "pianoRoll" | "timeline" | "detail" | "inspector" | "lesson";
  }
>;

type StudioClosePanelCommand = MusicHubCommandEnvelope<
  "studio.closePanel",
  {
    panel: "browser" | "mixer" | "pianoRoll" | "timeline" | "detail" | "inspector" | "lesson";
  }
>;

type StudioSetLayoutModeCommand = MusicHubCommandEnvelope<
  "studio.setLayoutMode",
  {
    mode: "beginner" | "guided" | "pro";
  }
>;
```

## Transport Command Family

Transport commands should be routed to the authoritative engine for the current mode.

```ts
type TransportPlayCommand = MusicHubCommandEnvelope<"transport.play", {}>;
type TransportPauseCommand = MusicHubCommandEnvelope<"transport.pause", {}>;
type TransportStopCommand = MusicHubCommandEnvelope<"transport.stop", {}>;

type TransportSeekCommand = MusicHubCommandEnvelope<
  "transport.seek",
  { beat: number }
>;

type TransportSetLoopCommand = MusicHubCommandEnvelope<
  "transport.setLoop",
  {
    enabled: boolean;
    startBeat?: number;
    endBeat?: number;
  }
>;

type TransportSetTempoCommand = MusicHubCommandEnvelope<
  "transport.setTempo",
  { bpm: number }
>;

type TransportAuditionNotesCommand = MusicHubCommandEnvelope<
  "transport.auditionNotes",
  {
    trackId: string;
    notes: Array<{
      pitch: number;
      velocity: number;
      lengthBeats?: number;
    }>;
  }
>;
```

## Browser / Content Command Family

These commands mutate browser state or request content insertion into Studio.

```ts
type BrowserSearchCommand = MusicHubCommandEnvelope<
  "browser.search",
  { query: string }
>;

type BrowserFilterCommand = MusicHubCommandEnvelope<
  "browser.filter",
  {
    category?: string;
    tags?: string[];
  }
>;

type BrowserPreviewAssetCommand = MusicHubCommandEnvelope<
  "browser.previewAsset",
  { assetId: string }
>;

type ContentLoadTemplateCommand = MusicHubCommandEnvelope<
  "content.loadTemplate",
  { templateId: string }
>;

type ContentAddSampleToTrackCommand = MusicHubCommandEnvelope<
  "content.addSampleToTrack",
  {
    trackId?: string;
    assetId: string;
    startBeat?: number;
  }
>;
```

## Lesson Command Family

Lesson commands should never mutate core state directly. They orchestrate guidance, focus, and validation context.

```ts
type LessonStartCommand = MusicHubCommandEnvelope<
  "lesson.start",
  { lessonId: string }
>;

type LessonAdvanceCommand = MusicHubCommandEnvelope<
  "lesson.advance",
  { lessonId: string; stepId?: string }
>;

type LessonShowHintCommand = MusicHubCommandEnvelope<
  "lesson.showHint",
  {
    lessonId: string;
    hintId: string;
    text: string;
    anchorId?: string;
  }
>;

type LessonHighlightCommand = MusicHubCommandEnvelope<
  "lesson.highlight",
  {
    lessonId: string;
    anchorId: string;
  }
>;

type LessonExpectCommand = MusicHubCommandEnvelope<
  "lesson.expect",
  {
    lessonId: string;
    expectationId: string;
    condition: string;
  }
>;
```

## Assistant Command Family

The assistant must use the same bus, not bypass it.

```ts
type AssistantProposeCommand = MusicHubCommandEnvelope<
  "assistant.propose",
  {
    proposalId: string;
    title: string;
    summary: string;
    suggestedCommandTypes: string[];
  }
>;

type AssistantApplyProposalCommand = MusicHubCommandEnvelope<
  "assistant.applyProposal",
  {
    proposalId: string;
    commands: MusicHubCommand[];
  }
>;
```

## Union Type

The v1 union should be explicit and narrow:

```ts
type MusicHubCommand =
  | StudioCreateTrackCommand
  | StudioUpdateTrackCommand
  | StudioDeleteTrackCommand
  | StudioCreateClipCommand
  | StudioUpdateClipCommand
  | StudioInsertMidiNotesCommand
  | StudioUpdateMidiNotesCommand
  | StudioDeleteMidiNotesCommand
  | StudioLoadPluginCommand
  | StudioInsertPresetChainCommand
  | StudioSetPluginParamCommand
  | StudioOpenPluginEditorCommand
  | StudioSelectCommand
  | StudioOpenPanelCommand
  | StudioClosePanelCommand
  | StudioSetLayoutModeCommand
  | TransportPlayCommand
  | TransportPauseCommand
  | TransportStopCommand
  | TransportSeekCommand
  | TransportSetLoopCommand
  | TransportSetTempoCommand
  | TransportAuditionNotesCommand
  | BrowserSearchCommand
  | BrowserFilterCommand
  | BrowserPreviewAssetCommand
  | ContentLoadTemplateCommand
  | ContentAddSampleToTrackCommand
  | LessonStartCommand
  | LessonAdvanceCommand
  | LessonShowHintCommand
  | LessonHighlightCommand
  | LessonExpectCommand
  | AssistantProposeCommand
  | AssistantApplyProposalCommand;
```

## Handling Model

The bus should eventually split handling into:

- local UI/session reducers
- host-bound command forwarders
- lesson/runtime observers

Not every command requires host round-trips.

### Safe optimistic commands

Generally safe:

- panel open/close
- selection changes
- browser search/filter state
- local lesson UI state

### Host-confirmed commands

Must be confirmed by native host in connected mode:

- transport actions
- plugin load/editor actions
- parameter writes
- monitor/arm state that affects engine behavior
- note audition

### Persisted-session commands

May require persistence confirmation:

- clip creation/update
- note insertion/update/delete
- track creation/delete
- template insertion

## Initial Runtime Insertion Plan

v1 should be introduced in this order:

1. transport commands
2. panel/selection commands
3. clip and note commands
4. plugin/chain commands
5. lesson and assistant orchestration commands

This keeps the first insertion point small and directly useful.

## Completion Criteria

`MH-007` is complete when:

- the command families and envelope are defined
- acknowledgment expectations are explicit
- command sources are explicit
- the contract is narrow enough to type in code
- future runtime extraction can target this contract instead of adding new page-local handlers
