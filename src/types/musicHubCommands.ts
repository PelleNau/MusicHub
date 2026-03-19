export type CommandSource =
  | "user"
  | "guide"
  | "template"
  | "assistant"
  | "system";

export type LayoutMode = "beginner" | "guided" | "pro";

export type PanelType =
  | "browser"
  | "mixer"
  | "pianoRoll"
  | "timeline"
  | "detail"
  | "inspector"
  | "lesson";

export type TrackType = "midi" | "audio" | "group" | "return";

export type TrackRole = "standard" | "instrument" | "vocal" | "drum" | "bus";

export type ClipType = "midi" | "audio" | "pattern";
export type SelectionMode = "replace" | "toggle" | "add" | "clear";

export interface MusicHubCommandEnvelope<TType extends string, TPayload> {
  id: string;
  type: TType;
  source: CommandSource;
  createdAt: string;
  sessionId?: string;
  projectId?: string;
  correlationId?: string;
  optimistic?: boolean;
  payload: TPayload;
}

export interface MusicHubCommandAck {
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

export type StudioCreateTrackCommand = MusicHubCommandEnvelope<
  "studio.createTrack",
  {
    type: TrackType;
    role?: TrackRole;
    name?: string;
    parentGroupTrackId?: string;
    insertAfterTrackId?: string;
  }
>;

export type StudioUpdateTrackCommand = MusicHubCommandEnvelope<
  "studio.updateTrack",
  {
    trackId: string;
    patch: Partial<{
      name: string;
      color: number;
      muted: boolean;
      solo: boolean;
      monitoring: "off" | "auto" | "in";
      armed: boolean;
    }>;
  }
>;

export type StudioDeleteTrackCommand = MusicHubCommandEnvelope<
  "studio.deleteTrack",
  { trackId: string }
>;

export type StudioCreateClipCommand = MusicHubCommandEnvelope<
  "studio.createClip",
  {
    trackId: string;
    laneId?: string;
    clipType: ClipType;
    startBeat: number;
    lengthBeats: number;
    sourceAssetId?: string;
  }
>;

export type StudioUpdateClipCommand = MusicHubCommandEnvelope<
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
      color: number;
      midiData: unknown;
    }>;
  }
>;

export type StudioDeleteClipCommand = MusicHubCommandEnvelope<
  "studio.deleteClip",
  {
    clipId: string;
  }
>;

export type StudioDuplicateClipCommand = MusicHubCommandEnvelope<
  "studio.duplicateClip",
  {
    clipId: string;
    linked?: boolean;
  }
>;

export type StudioInsertMidiNotesCommand = MusicHubCommandEnvelope<
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

export type StudioUpdateMidiNotesCommand = MusicHubCommandEnvelope<
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

export type StudioDeleteMidiNotesCommand = MusicHubCommandEnvelope<
  "studio.deleteMidiNotes",
  {
    clipId: string;
    noteIds: string[];
  }
>;

export type StudioReplaceMidiNotesCommand = MusicHubCommandEnvelope<
  "studio.replaceMidiNotes",
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

export type StudioLoadPluginCommand = MusicHubCommandEnvelope<
  "studio.loadPlugin",
  {
    trackId: string;
    pluginId: string;
    slot?: number;
  }
>;

export type StudioInsertPresetChainCommand = MusicHubCommandEnvelope<
  "studio.insertPresetChain",
  {
    trackId: string;
    presetId: string;
  }
>;

export type StudioSetPluginParamCommand = MusicHubCommandEnvelope<
  "studio.setPluginParam",
  {
    chainId: string;
    pluginId: string;
    paramId: string;
    value: number | string | boolean;
  }
>;

export type StudioOpenPluginEditorCommand = MusicHubCommandEnvelope<
  "studio.openPluginEditor",
  {
    pluginId: string;
  }
>;

export type StudioSelectCommand = MusicHubCommandEnvelope<
  "studio.select",
  {
    trackId?: string;
    clipId?: string;
    noteIds?: string[];
    panel?: PanelType;
    mode?: SelectionMode;
  }
>;

export type StudioOpenPanelCommand = MusicHubCommandEnvelope<
  "studio.openPanel",
  {
    panel: PanelType;
  }
>;

export type StudioClosePanelCommand = MusicHubCommandEnvelope<
  "studio.closePanel",
  {
    panel: PanelType;
  }
>;

export type StudioSetLayoutModeCommand = MusicHubCommandEnvelope<
  "studio.setLayoutMode",
  {
    mode: LayoutMode;
  }
>;

export type TransportPlayCommand = MusicHubCommandEnvelope<"transport.play", Record<string, never>>;
export type TransportPauseCommand = MusicHubCommandEnvelope<"transport.pause", Record<string, never>>;
export type TransportStopCommand = MusicHubCommandEnvelope<"transport.stop", Record<string, never>>;

export type TransportSeekCommand = MusicHubCommandEnvelope<
  "transport.seek",
  { beat: number }
>;

export type TransportSetLoopCommand = MusicHubCommandEnvelope<
  "transport.setLoop",
  {
    enabled: boolean;
    startBeat?: number;
    endBeat?: number;
  }
>;

export type TransportSetTempoCommand = MusicHubCommandEnvelope<
  "transport.setTempo",
  { bpm: number }
>;

export type TransportToggleRecordCommand = MusicHubCommandEnvelope<
  "transport.toggleRecord",
  Record<string, never>
>;

export type TransportAuditionNotesCommand = MusicHubCommandEnvelope<
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

export type BrowserSearchCommand = MusicHubCommandEnvelope<
  "browser.search",
  { query: string }
>;

export type BrowserFilterCommand = MusicHubCommandEnvelope<
  "browser.filter",
  {
    category?: string;
    tags?: string[];
  }
>;

export type BrowserPreviewAssetCommand = MusicHubCommandEnvelope<
  "browser.previewAsset",
  { assetId: string }
>;

export type ContentLoadTemplateCommand = MusicHubCommandEnvelope<
  "content.loadTemplate",
  { templateId: string }
>;

export type ContentAddSampleToTrackCommand = MusicHubCommandEnvelope<
  "content.addSampleToTrack",
  {
    trackId?: string;
    assetId: string;
    startBeat?: number;
  }
>;

export type LessonStartCommand = MusicHubCommandEnvelope<
  "lesson.start",
  { lessonId: string }
>;

export type LessonAdvanceCommand = MusicHubCommandEnvelope<
  "lesson.advance",
  { lessonId: string; stepId?: string }
>;

export type LessonSkipStepCommand = MusicHubCommandEnvelope<
  "lesson.skipStep",
  { lessonId: string; stepId: string }
>;

export type LessonResetStepCommand = MusicHubCommandEnvelope<
  "lesson.resetStep",
  { lessonId: string; stepId: string }
>;

export type LessonAbortCommand = MusicHubCommandEnvelope<
  "lesson.abort",
  { lessonId: string; reason?: string }
>;

export type LessonCompleteCommand = MusicHubCommandEnvelope<
  "lesson.complete",
  { lessonId: string; stepId?: string }
>;

export type LessonFailCommand = MusicHubCommandEnvelope<
  "lesson.fail",
  { lessonId: string; stepId?: string; reason?: string }
>;

export type LessonShowHintCommand = MusicHubCommandEnvelope<
  "lesson.showHint",
  {
    lessonId: string;
    hintId: string;
    text: string;
    anchorId?: string;
  }
>;

export type LessonHighlightCommand = MusicHubCommandEnvelope<
  "lesson.highlight",
  {
    lessonId: string;
    anchorId: string;
  }
>;

export type LessonExpectCommand = MusicHubCommandEnvelope<
  "lesson.expect",
  {
    lessonId: string;
    expectationId: string;
    condition: string;
  }
>;

export type AssistantProposeCommand = MusicHubCommandEnvelope<
  "assistant.propose",
  {
    proposalId: string;
    title: string;
    summary: string;
    suggestedCommandTypes: string[];
  }
>;

export type AssistantApplyProposalCommand = MusicHubCommandEnvelope<
  "assistant.applyProposal",
  {
    proposalId: string;
    commands: MusicHubCommand[];
  }
>;

export type MusicHubCommand =
  | StudioCreateTrackCommand
  | StudioUpdateTrackCommand
  | StudioDeleteTrackCommand
  | StudioCreateClipCommand
  | StudioUpdateClipCommand
  | StudioDeleteClipCommand
  | StudioDuplicateClipCommand
  | StudioInsertMidiNotesCommand
  | StudioUpdateMidiNotesCommand
  | StudioDeleteMidiNotesCommand
  | StudioReplaceMidiNotesCommand
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
  | TransportToggleRecordCommand
  | TransportAuditionNotesCommand
  | BrowserSearchCommand
  | BrowserFilterCommand
  | BrowserPreviewAssetCommand
  | ContentLoadTemplateCommand
  | ContentAddSampleToTrackCommand
  | LessonStartCommand
  | LessonAdvanceCommand
  | LessonSkipStepCommand
  | LessonResetStepCommand
  | LessonAbortCommand
  | LessonCompleteCommand
  | LessonFailCommand
  | LessonShowHintCommand
  | LessonHighlightCommand
  | LessonExpectCommand
  | AssistantProposeCommand
  | AssistantApplyProposalCommand;
