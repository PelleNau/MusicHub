import type { CommandSource, LayoutMode, MusicHubCommand, MusicHubCommandAck, PanelType } from "@/types/musicHubCommands";
import type { StudioAnchor } from "@/types/musicHubStudioDomain";

export type LessonDifficulty = LayoutMode;

export type LessonAnchorTargetType =
  | "panel"
  | "track"
  | "track-header"
  | "track-lane"
  | "clip"
  | "note"
  | "plugin-slot"
  | "plugin-param"
  | "mixer-strip"
  | "send"
  | "timeline-region"
  | "browser-asset"
  | "lesson-panel";

export interface LessonAnchorRef {
  targetType: LessonAnchorTargetType;
  targetId: string;
  highlight?: string;
  placement?: "top" | "right" | "bottom" | "left" | "center";
  fallbackText?: string;
}

export type LessonExpectedKind = "command" | "ack" | "selector" | "event";

export interface LessonExpectedCommand {
  kind: "command";
  type: MusicHubCommand["type"];
  source?: CommandSource;
}

export interface LessonExpectedAck {
  kind: "ack";
  type: MusicHubCommand["type"];
  status?: MusicHubCommandAck["status"];
}

export interface LessonExpectedSelector {
  kind: "selector";
  path: string;
}

export interface LessonExpectedEvent {
  kind: "event";
  type: string;
}

export type LessonExpected =
  | LessonExpectedCommand
  | LessonExpectedAck
  | LessonExpectedSelector
  | LessonExpectedEvent;

export type LessonValidationKind = "selector" | "ack" | "command" | "event";

export interface LessonValidationLeafBase {
  kind: LessonValidationKind;
}

export interface LessonSelectorValidation extends LessonValidationLeafBase {
  kind: "selector";
  path: string;
  equals?: string | number | boolean | null;
  notEquals?: string | number | boolean | null;
  exists?: boolean;
  in?: Array<string | number | boolean>;
  gt?: number;
  gte?: number;
  lt?: number;
  lte?: number;
  changed?: boolean;
  matches?: string;
  countGte?: number;
  countLte?: number;
}

export interface LessonAckValidation extends LessonValidationLeafBase {
  kind: "ack";
  type: MusicHubCommand["type"];
  status?: MusicHubCommandAck["status"];
  countGte?: number;
  countLte?: number;
}

export interface LessonCommandValidation extends LessonValidationLeafBase {
  kind: "command";
  type: MusicHubCommand["type"];
  source?: CommandSource;
  countGte?: number;
  countLte?: number;
}

export interface LessonEventValidation extends LessonValidationLeafBase {
  kind: "event";
  type: string;
  countGte?: number;
  countLte?: number;
}

export type LessonValidationLeaf =
  | LessonSelectorValidation
  | LessonAckValidation
  | LessonCommandValidation
  | LessonEventValidation;

export interface LessonValidationAll {
  all: LessonValidationNode[];
}

export interface LessonValidationAny {
  any: LessonValidationNode[];
}

export interface LessonValidationNot {
  not: LessonValidationNode;
}

export type LessonValidationNode =
  | LessonValidationLeaf
  | LessonValidationAll
  | LessonValidationAny
  | LessonValidationNot;

export interface LessonHint {
  id: string;
  text: string;
  anchorId?: string;
  showAfterSeconds?: number;
}

export interface LessonCommandRef<TType extends MusicHubCommand["type"] = MusicHubCommand["type"]> {
  type: TType;
  payload: Extract<MusicHubCommand, { type: TType }>["payload"];
}

export interface LessonReset {
  commands: LessonCommandRef[];
}

export interface LessonStepHook {
  commands: LessonCommandRef[];
}

export interface LessonNextConditional {
  when: LessonValidationNode;
  then: string;
  else?: string;
}

export type LessonNext = string | LessonNextConditional;

export interface LessonStepDefinition {
  stepId: string;
  title?: string;
  instruction: string;
  anchor: LessonAnchorRef;
  expected?: LessonExpected;
  validation: LessonValidationNode;
  hints?: LessonHint[];
  reset?: LessonReset;
  onSuccess?: LessonStepHook;
  onFailure?: LessonStepHook;
  timeoutSeconds?: number;
  next?: LessonNext;
  skippable?: boolean;
}

export interface LessonEntry {
  commands?: LessonCommandRef[];
}

export interface LessonDefinition {
  lessonId: string;
  title: string;
  moduleId: string;
  version: number;
  difficulty?: LessonDifficulty;
  estimatedMinutes?: number;
  layoutMode?: LayoutMode;
  objectives?: string[];
  prerequisites?: string[];
  tags?: string[];
  entry?: LessonEntry;
  steps: LessonStepDefinition[];
}

export interface LessonRuntimeObservation {
  commands: MusicHubCommand[];
  acknowledgments: MusicHubCommandAck[];
  selectors: Record<string, unknown>;
  events: Array<{
    type: string;
    payload?: unknown;
  }>;
}

export interface LessonRuntimeAnchorResolution {
  anchor: LessonAnchorRef;
  resolvedAnchorId?: string;
  studioAnchor?: StudioAnchor;
  resolvedPanel?: PanelType;
}
