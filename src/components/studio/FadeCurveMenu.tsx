import type { ReactNode } from "react";

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

export type FadeCurveType = "linear" | "logarithmic" | "exponential" | "s-curve";

interface FadeCurveMenuProps {
  children: ReactNode;
  currentCurve: FadeCurveType;
  onCurveChange: (curveType: FadeCurveType) => void;
  fadeType: "in" | "out";
}

const curveTypes: FadeCurveType[] = ["linear", "logarithmic", "exponential", "s-curve"];

function getCurveName(curveType: FadeCurveType) {
  switch (curveType) {
    case "linear":
      return "Linear";
    case "logarithmic":
      return "Logarithmic";
    case "exponential":
      return "Exponential";
    case "s-curve":
      return "S-Curve";
  }
}

function getCurveIcon(curveType: FadeCurveType) {
  switch (curveType) {
    case "linear":
      return "╱";
    case "logarithmic":
      return "⤴";
    case "exponential":
      return "⤵";
    case "s-curve":
      return "∿";
  }
}

export function FadeCurveMenu({
  children,
  currentCurve,
  onCurveChange,
  fadeType,
}: FadeCurveMenuProps) {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-64 rounded-lg border-border/90 bg-[hsl(240_10%_16%)] p-1.5 text-foreground shadow-2xl">
        <ContextMenuLabel className="font-mono text-[11px]">
          Fade {fadeType === "in" ? "In" : "Out"} Curve
        </ContextMenuLabel>
        <ContextMenuSeparator />
        <ContextMenuRadioGroup
          value={currentCurve}
          onValueChange={(value) => onCurveChange(value as FadeCurveType)}
        >
          {curveTypes.map((curveType) => (
            <ContextMenuRadioItem
              key={curveType}
              value={curveType}
              className="flex items-center justify-between rounded-md text-xs font-mono"
            >
              <span>{getCurveName(curveType)}</span>
              <span className="ml-4 text-base text-foreground/55">{getCurveIcon(curveType)}</span>
            </ContextMenuRadioItem>
          ))}
        </ContextMenuRadioGroup>
      </ContextMenuContent>
    </ContextMenu>
  );
}
