import type {
  GuideAnchorRegistryEntry,
  GuideAnchorResolutionResult,
  GuideAnchorResolver,
  GuideResolvedAnchor,
} from "@/types/musicHubGuideRuntime";
import type { LessonAnchorRef } from "@/types/musicHubLessonDsl";

function toResolvedAnchor(
  anchor: LessonAnchorRef,
  entry?: GuideAnchorRegistryEntry,
): GuideResolvedAnchor {
  return {
    anchor,
    resolvedAnchorId: entry?.id,
    available: Boolean(entry?.available),
    owningPanel: entry?.panel,
    fallbackText: anchor.fallbackText,
    metadata: entry?.metadata,
  };
}

export const guideAnchorResolver: GuideAnchorResolver = {
  resolveAnchor(anchor, registry) {
    const entry = registry.find(
      (candidate) =>
        candidate.targetType === anchor.targetType &&
        candidate.targetId === anchor.targetId,
    );

    if (!entry) {
      return {
        resolved: false,
        anchor: toResolvedAnchor(anchor),
        reason: "not_found",
      };
    }

    if (!entry.available) {
      return {
        resolved: false,
        anchor: toResolvedAnchor(anchor, entry),
        reason: "temporarily_unavailable",
      };
    }

    if (anchor.highlight && !(entry.highlights || []).includes(anchor.highlight)) {
      return {
        resolved: false,
        anchor: toResolvedAnchor(anchor, entry),
        reason: "highlight_missing",
      };
    }

    return {
      resolved: true,
      anchor: toResolvedAnchor(anchor, entry),
    };
  },
};
