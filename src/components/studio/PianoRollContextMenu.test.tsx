import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import React from "react";

vi.mock("@/components/ui/context-menu", () => {
  const passthrough = ({ children }: { children: React.ReactNode }) => <>{children}</>;
  const clickable = ({
    children,
    onClick,
    className,
    disabled,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    className?: string;
    disabled?: boolean;
  }) => (
    <button type="button" onClick={onClick} className={className} disabled={disabled}>
      {children}
    </button>
  );

  return {
    ContextMenuContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    ContextMenuItem: clickable,
    ContextMenuSeparator: () => <hr />,
    ContextMenuShortcut: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
    ContextMenuSub: passthrough,
    ContextMenuSubContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    ContextMenuSubTrigger: clickable,
  };
});

import { PianoRollContextMenu } from "@/components/studio/PianoRollContextMenu";

describe("PianoRollContextMenu", () => {
  it("keeps transform actions enabled when notes exist even without a selection", () => {
    render(
      <PianoRollContextMenu
        hasNotes
        hasSelection={false}
        hasMultipleSelection={false}
        hasClipboard={false}
        onSelectAll={vi.fn()}
        onDeselectAll={vi.fn()}
        onCut={vi.fn()}
        onCopy={vi.fn()}
        onPaste={vi.fn()}
        onDelete={vi.fn()}
        onQuantize={vi.fn()}
        onHumanize={vi.fn()}
        onTransposeOpen={vi.fn()}
        onStrummingOpen={vi.fn()}
        onChordToolsOpen={vi.fn()}
        onArpeggiatorOpen={vi.fn()}
        onLegato={vi.fn()}
        onReverse={vi.fn()}
        onInvert={vi.fn()}
        onSetLengthSixteenth={vi.fn()}
        onSetLengthEighth={vi.fn()}
        onSetLengthQuarter={vi.fn()}
        onStaccatoHalf={vi.fn()}
        onDoubleLength={vi.fn()}
        onHalfLength={vi.fn()}
        onVelocityAdd={vi.fn()}
        onVelocityRandomize={vi.fn()}
        onVelocityRampUp={vi.fn()}
        onVelocityRampDown={vi.fn()}
        onVelocityCompress={vi.fn()}
        onVelocityExpand={vi.fn()}
        onSplitAtPlayhead={vi.fn()}
        onSplitAtBars={vi.fn()}
        onSplitAtBeats={vi.fn()}
        onJoinConsecutive={vi.fn()}
        onRemoveShortNotes={vi.fn()}
        onRepeat2x={vi.fn()}
        onRepeat4x={vi.fn()}
      />,
    );

    expect(screen.getAllByRole("button", { name: /^Quantize(?:\sQ)?$/i })[0]).not.toBeDisabled();
    expect(screen.getAllByRole("button", { name: /^Humanize(?:\sH)?$/i })[0]).not.toBeDisabled();
    expect(screen.getAllByRole("button", { name: /^Transpose(?:\sT)?$/i })[0]).not.toBeDisabled();
    expect(screen.getByRole("button", { name: /^Repeat 2x$/i })).not.toBeDisabled();
    expect(screen.getAllByRole("button", { name: /^Split at Playhead$/i })[0]).not.toBeDisabled();
    expect(screen.getByRole("button", { name: /^Delete\sDel$/i })).toBeDisabled();
  });

  it("fires live actions from context menu items", () => {
    const onQuantize = vi.fn();
    const onArpeggiatorOpen = vi.fn();

    render(
      <PianoRollContextMenu
        hasNotes
        hasSelection
        hasMultipleSelection
        hasClipboard={false}
        onSelectAll={vi.fn()}
        onDeselectAll={vi.fn()}
        onCut={vi.fn()}
        onCopy={vi.fn()}
        onPaste={vi.fn()}
        onDelete={vi.fn()}
        onQuantize={onQuantize}
        onHumanize={vi.fn()}
        onTransposeOpen={vi.fn()}
        onStrummingOpen={vi.fn()}
        onChordToolsOpen={vi.fn()}
        onArpeggiatorOpen={onArpeggiatorOpen}
        onLegato={vi.fn()}
        onReverse={vi.fn()}
        onInvert={vi.fn()}
        onSetLengthSixteenth={vi.fn()}
        onSetLengthEighth={vi.fn()}
        onSetLengthQuarter={vi.fn()}
        onStaccatoHalf={vi.fn()}
        onDoubleLength={vi.fn()}
        onHalfLength={vi.fn()}
        onVelocityAdd={vi.fn()}
        onVelocityRandomize={vi.fn()}
        onVelocityRampUp={vi.fn()}
        onVelocityRampDown={vi.fn()}
        onVelocityCompress={vi.fn()}
        onVelocityExpand={vi.fn()}
        onSplitAtPlayhead={vi.fn()}
        onSplitAtBars={vi.fn()}
        onSplitAtBeats={vi.fn()}
        onJoinConsecutive={vi.fn()}
        onRemoveShortNotes={vi.fn()}
        onRepeat2x={vi.fn()}
        onRepeat4x={vi.fn()}
      />,
    );

    fireEvent.click(screen.getAllByRole("button", { name: /^Quantize(?:\sQ)?$/i })[0]);
    fireEvent.click(screen.getAllByRole("button", { name: /^Arpeggiator(?:\sA)?$/i })[0]);

    expect(onQuantize).toHaveBeenCalled();
    expect(onArpeggiatorOpen).toHaveBeenCalled();
  });
});
