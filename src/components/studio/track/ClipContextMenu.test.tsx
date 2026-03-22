import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import React from "react";

vi.mock("@/components/ui/context-menu", () => {
  const passthrough = ({ children }: { children: React.ReactNode }) => <>{children}</>;
  const clickable = ({
    children,
    onClick,
    className,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    className?: string;
  }) => (
    <button type="button" onClick={onClick} className={className}>
      {children}
    </button>
  );

  return {
    ContextMenu: passthrough,
    ContextMenuTrigger: passthrough,
    ContextMenuContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    ContextMenuItem: clickable,
    ContextMenuSeparator: () => <hr />,
    ContextMenuSub: passthrough,
    ContextMenuSubTrigger: clickable,
    ContextMenuSubContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  };
});

import { ClipContextMenu } from "@/components/studio/track/ClipContextMenu";

describe("ClipContextMenu", () => {
  it("shows only runtime-owned clip actions in the live menu", async () => {
    render(
      <ClipContextMenu
        clipId="clip-1"
        clipName="Bass Loop"
        isMidi
        isMuted={false}
        onDelete={vi.fn()}
        onDuplicate={vi.fn()}
        onLinkedDuplicate={vi.fn()}
        onRename={vi.fn()}
        onColorChange={vi.fn()}
        onSplit={vi.fn()}
        onMuteToggle={vi.fn()}
        onSetAsLoop={vi.fn()}
      >
        <div data-testid="clip-target">Clip</div>
      </ClipContextMenu>,
    );

    fireEvent.contextMenu(screen.getByTestId("clip-target"));

    expect(await screen.findByText("Duplicate")).toBeInTheDocument();
    expect(screen.getByText("Linked Duplicate")).toBeInTheDocument();
    expect(screen.getByText("Split")).toBeInTheDocument();
    expect(screen.getByText("Set as Loop")).toBeInTheDocument();
    expect(screen.getByText("Mute")).toBeInTheDocument();
    expect(screen.getByText("Rename")).toBeInTheDocument();
    expect(screen.getByText("Delete")).toBeInTheDocument();

    expect(screen.queryByText("Add Fade In")).not.toBeInTheDocument();
    expect(screen.queryByText("Add Fade Out")).not.toBeInTheDocument();
    expect(screen.queryByText("Pointer Options")).not.toBeInTheDocument();
    expect(screen.queryByText("Add Automation")).not.toBeInTheDocument();
    expect(screen.queryByText("Show Automation")).not.toBeInTheDocument();
    expect(screen.queryByText("Hide Automation")).not.toBeInTheDocument();
  });
});
