import type {
  GuideStepEvaluationResult,
  GuideStepEvaluator,
  GuideValidationContext,
} from "@/types/musicHubGuideRuntime";
import type {
  LessonExpected,
  LessonNextConditional,
  LessonStepDefinition,
  LessonValidationNode,
} from "@/types/musicHubLessonDsl";

function getPathValue(target: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((current, segment) => {
    if (current == null) return undefined;

    const wantsArray = segment.endsWith("[]");
    const key = wantsArray ? segment.slice(0, -2) : segment;

    let next: unknown;

    if (Array.isArray(current)) {
      next = current.map((item) =>
        item && typeof item === "object"
          ? (item as Record<string, unknown>)[key]
          : undefined,
      );
    } else if (typeof current === "object") {
      next = (current as Record<string, unknown>)[key];
    } else {
      return undefined;
    }

    if (wantsArray) {
      if (Array.isArray(next)) return next;
      if (next && typeof next === "object" && Array.isArray((next as { items?: unknown[] }).items)) {
        return (next as { items: unknown[] }).items;
      }
      return [];
    }

    return next;
  }, target);
}

function countWhere<T>(values: T[], predicate: (value: T) => boolean): number {
  return values.reduce((count, value) => count + (predicate(value) ? 1 : 0), 0);
}

function evaluateCountConstraints(count: number, node: { countGte?: number; countLte?: number }) {
  if (typeof node.countGte === "number" && count < node.countGte) return false;
  if (typeof node.countLte === "number" && count > node.countLte) return false;
  return true;
}

function evaluateValidation(node: LessonValidationNode, context: GuideValidationContext): boolean {
  if ("all" in node) {
    return node.all.every((child) => evaluateValidation(child, context));
  }
  if ("any" in node) {
    return node.any.some((child) => evaluateValidation(child, context));
  }
  if ("not" in node) {
    return !evaluateValidation(node.not, context);
  }

  switch (node.kind) {
    case "selector": {
      const value = getPathValue(context.selectors, node.path);
      if (typeof node.exists === "boolean" && (value !== undefined) !== node.exists) return false;
      if (node.equals !== undefined) {
        if (Array.isArray(value)) {
          if (!value.includes(node.equals as never)) return false;
        } else if (value !== node.equals) {
          return false;
        }
      }
      if (node.notEquals !== undefined) {
        if (Array.isArray(value)) {
          if (value.some((entry) => entry === node.notEquals)) return false;
        } else if (value === node.notEquals) {
          return false;
        }
      }
      if (node.in && !node.in.includes(value as never)) return false;
      if (typeof node.gt === "number" && !(typeof value === "number" && value > node.gt)) return false;
      if (typeof node.gte === "number" && !(typeof value === "number" && value >= node.gte)) return false;
      if (typeof node.lt === "number" && !(typeof value === "number" && value < node.lt)) return false;
      if (typeof node.lte === "number" && !(typeof value === "number" && value <= node.lte)) return false;
      if (typeof node.matches === "string" && !(typeof value === "string" && new RegExp(node.matches).test(value))) return false;
      if (typeof node.countGte === "number" || typeof node.countLte === "number") {
        const count = Array.isArray(value)
          ? value.length
          : value && typeof value === "object"
            ? Object.keys(value as Record<string, unknown>).length
            : 0;
        return evaluateCountConstraints(count, node);
      }
      return true;
    }
    case "command": {
      const count = countWhere(context.recentCommands, (command) => {
        if (command.type !== node.type) return false;
        if (node.source && command.source !== node.source) return false;
        return true;
      });
      return evaluateCountConstraints(count, node);
    }
    case "ack": {
      const count = countWhere(context.recentAcks, (ack) => {
        const command = context.recentCommands.find((candidate) => candidate.id === ack.commandId);
        if (!command || command.type !== node.type) return false;
        if (node.status && ack.status !== node.status) return false;
        return true;
      });
      return evaluateCountConstraints(count, node);
    }
    case "event": {
      const count = countWhere(context.recentEvents, (event) => event.type === node.type);
      return evaluateCountConstraints(count, node);
    }
    default:
      return false;
  }
}

function expectedObserved(expected: LessonExpected | undefined, context: GuideValidationContext): boolean {
  if (!expected) return true;

  switch (expected.kind) {
    case "command":
      return context.recentCommands.some((command) => {
        if (command.type !== expected.type) return false;
        if (expected.source && command.source !== expected.source) return false;
        return true;
      });
    case "ack":
      return context.recentAcks.some((ack) => {
        const command = context.recentCommands.find((candidate) => candidate.id === ack.commandId);
        if (!command || command.type !== expected.type) return false;
        if (expected.status && ack.status !== expected.status) return false;
        return true;
      });
    case "selector":
      return getPathValue(context.selectors, expected.path) !== undefined;
    case "event":
      return context.recentEvents.some((event) => event.type === expected.type);
    default:
      return false;
  }
}

function resolveNext(step: LessonStepDefinition, context: GuideValidationContext): string | undefined {
  if (!step.next) return undefined;
  if (typeof step.next === "string") return step.next;

  const conditional = step.next as LessonNextConditional;
  return evaluateValidation(conditional.when, context)
    ? conditional.then
    : conditional.else;
}

export const guideStepEvaluator: GuideStepEvaluator = {
  evaluateStep(step, context) {
    const observed = expectedObserved(step.expected, context);
    const valid = evaluateValidation(step.validation, context);

    if (observed && valid) {
      return {
        status: "completed",
        expectedObserved: true,
        validationSatisfied: true,
        resolvedNextStepId: resolveNext(step, context),
      };
    }

    if (!observed) {
      return {
        status: "awaiting_expected",
        expectedObserved: false,
        validationSatisfied: valid,
        reason: "Expected action not yet observed",
      };
    }

    return {
      status: "awaiting_validation",
      expectedObserved: true,
      validationSatisfied: false,
      reason: "Validation not yet satisfied",
      failedValidation: step.validation,
      resolvedNextStepId: resolveNext(step, context),
    };
  },
};
