import type { MusicHubCommand, MusicHubCommandAck } from "@/types/musicHubCommands";
import type { MusicHubContinuousEdit } from "@/types/musicHubContinuousEdits";
import type {
  LessonAnchorRef,
  LessonDefinition,
  LessonStepDefinition,
  LessonValidationNode,
} from "@/types/musicHubLessonDsl";
import type {
  StudioConnectionSummary,
  StudioDetailPanelState,
  StudioPanelState,
  StudioPianoRollState,
  StudioSelectionSummary,
  StudioTrackViewState,
  StudioTransportSummary,
} from "@/domain/studio/studioViewContracts";

export type GuideLessonStatus =
  | "idle"
  | "active"
  | "completed"
  | "failed"
  | "aborted";

export type GuideStepStatus =
  | "idle"
  | "arming"
  | "awaiting_expected"
  | "awaiting_validation"
  | "completed"
  | "failed"
  | "skipped";

export interface GuideSelectorSnapshot {
  transport: StudioTransportSummary;
  connection: StudioConnectionSummary;
  panel: StudioPanelState;
  selection: StudioSelectionSummary;
  pianoRoll: StudioPianoRollState;
  detailPanel: StudioDetailPanelState;
  trackViewStateById: Record<string, StudioTrackViewState>;
}

export interface GuideRuntimeEvent {
  type: string;
  payload?: unknown;
  occurredAt: string;
}

export interface GuideObservationBuffer {
  commands: MusicHubCommand[];
  acknowledgments: MusicHubCommandAck[];
  continuousEdits: MusicHubContinuousEdit[];
  events: GuideRuntimeEvent[];
  selectors: GuideSelectorSnapshot;
}

export interface GuideResolvedAnchor {
  anchor: LessonAnchorRef;
  resolvedAnchorId?: string;
  available: boolean;
  owningPanel?: string;
  fallbackText?: string;
  metadata?: Record<string, unknown>;
}

export interface GuideAnchorRegistryEntry {
  id: string;
  targetType: LessonAnchorRef["targetType"];
  targetId: string;
  highlights?: string[];
  panel?: string;
  available: boolean;
  metadata?: Record<string, unknown>;
}

export interface GuideAnchorResolutionResult {
  resolved: boolean;
  anchor: GuideResolvedAnchor;
  reason?: "not_found" | "highlight_missing" | "temporarily_unavailable";
}

export interface GuideValidationContext {
  selectors: GuideSelectorSnapshot;
  recentCommands: MusicHubCommand[];
  recentAcks: MusicHubCommandAck[];
  recentContinuousEdits: MusicHubContinuousEdit[];
  recentEvents: GuideRuntimeEvent[];
  resolvedAnchors: Record<string, GuideResolvedAnchor>;
}

export interface GuideStepEvaluationResult {
  status: GuideStepStatus;
  validationSatisfied: boolean;
  expectedObserved: boolean;
  resolvedNextStepId?: string;
  reason?: string;
  failedValidation?: LessonValidationNode;
}

export interface GuideRuntimeState {
  lesson?: LessonDefinition;
  currentStep?: LessonStepDefinition;
  lessonStatus: GuideLessonStatus;
  stepStatus: GuideStepStatus;
  resolvedAnchors: Record<string, GuideResolvedAnchor>;
  lastEvaluation?: GuideStepEvaluationResult;
}

export interface GuideLessonRuntime {
  state: GuideRuntimeState;
  startLesson: (lesson: LessonDefinition) => void;
  abortLesson: (reason?: string) => void;
  skipStep: (stepId: string) => void;
  resetStep: (stepId: string) => void;
  applyObservation: (buffer: GuideObservationBuffer) => void;
}

export interface GuideAnchorResolver {
  resolveAnchor: (
    anchor: LessonAnchorRef,
    registry: GuideAnchorRegistryEntry[],
  ) => GuideAnchorResolutionResult;
}

export interface GuideStepEvaluator {
  evaluateStep: (
    step: LessonStepDefinition,
    context: GuideValidationContext,
  ) => GuideStepEvaluationResult;
}
