import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TransportBar } from "../TransportBar";

describe("TransportBar", () => {
  const defaultProps = {
    tempo: 120,
    timeSignature: "4/4",
    currentBeat: 0,
    playbackState: "stopped" as const,
    onPlay: vi.fn(),
    onPause: vi.fn(),
    onStop: vi.fn(),
    onTempoChange: vi.fn(),
  };

  it("renders position display as 1.1.1 at beat 0", () => {
    render(<TransportBar {...defaultProps} />);
    expect(screen.getByText("1.1.1")).toBeInTheDocument();
  });

  it("shows Play button when stopped", () => {
    render(<TransportBar {...defaultProps} playbackState="stopped" />);
    expect(screen.getByTitle("Play")).toBeInTheDocument();
  });

  it("shows Pause button when playing", () => {
    render(<TransportBar {...defaultProps} playbackState="playing" />);
    expect(screen.getByTitle("Pause")).toBeInTheDocument();
  });

  it("shows PLAY indicator when playing", () => {
    render(<TransportBar {...defaultProps} playbackState="playing" />);
    expect(screen.getByText("PLAY")).toBeInTheDocument();
  });

  it("does not show PLAY indicator when stopped", () => {
    render(<TransportBar {...defaultProps} playbackState="stopped" />);
    expect(screen.queryByText("PLAY")).not.toBeInTheDocument();
  });

  it("calls onPlay when play button clicked", () => {
    const onPlay = vi.fn();
    render(<TransportBar {...defaultProps} onPlay={onPlay} />);
    fireEvent.click(screen.getByTitle("Play"));
    expect(onPlay).toHaveBeenCalledTimes(1);
  });

  it("calls onPause when pause button clicked during playback", () => {
    const onPause = vi.fn();
    render(<TransportBar {...defaultProps} playbackState="playing" onPause={onPause} />);
    fireEvent.click(screen.getByTitle("Pause"));
    expect(onPause).toHaveBeenCalledTimes(1);
  });

  it("calls onStop when SkipBack button clicked", () => {
    const onStop = vi.fn();
    render(<TransportBar {...defaultProps} onStop={onStop} />);
    fireEvent.click(screen.getByTitle("Return to start"));
    expect(onStop).toHaveBeenCalledTimes(1);
  });

  it("Square button calls onStop (reset to start)", () => {
    const onStop = vi.fn();
    render(<TransportBar {...defaultProps} playbackState="playing" onStop={onStop} />);
    fireEvent.click(screen.getByTitle("Stop"));
    expect(onStop).toHaveBeenCalled();
  });

  it("renders tempo input with correct value", () => {
    render(<TransportBar {...defaultProps} tempo={140} />);
    const input = screen.getByDisplayValue("140");
    expect(input).toBeInTheDocument();
  });

  it("calls onTempoChange when tempo input changes", () => {
    const onTempoChange = vi.fn();
    render(<TransportBar {...defaultProps} onTempoChange={onTempoChange} />);
    const input = screen.getByDisplayValue("120");
    fireEvent.change(input, { target: { value: "150" } });
    expect(onTempoChange).toHaveBeenCalledWith(150);
  });

  it("renders time signature", () => {
    render(<TransportBar {...defaultProps} timeSignature="3/4" />);
    expect(screen.getByText("3/4")).toBeInTheDocument();
  });

  it("renders loop toggle when onLoopToggle provided", () => {
    const onLoopToggle = vi.fn();
    render(<TransportBar {...defaultProps} onLoopToggle={onLoopToggle} />);
    const loopBtn = screen.getByTitle("Toggle loop (⌘L)");
    expect(loopBtn).toBeInTheDocument();
    fireEvent.click(loopBtn);
    expect(onLoopToggle).toHaveBeenCalledTimes(1);
  });

  it("highlights loop button when loopEnabled", () => {
    render(<TransportBar {...defaultProps} loopEnabled={true} onLoopToggle={vi.fn()} />);
    const loopBtn = screen.getByTitle("Toggle loop (⌘L)");
    expect(loopBtn.className).toContain("text-primary");
  });

  it("disables undo button when canUndo is false", () => {
    render(<TransportBar {...defaultProps} onUndo={vi.fn()} canUndo={false} />);
    const undoBtn = screen.getByTitle("Undo (⌘Z)");
    expect(undoBtn).toBeDisabled();
  });

  it("enables undo button when canUndo is true", () => {
    render(<TransportBar {...defaultProps} onUndo={vi.fn()} canUndo={true} />);
    const undoBtn = screen.getByTitle("Undo (⌘Z)");
    expect(undoBtn).not.toBeDisabled();
  });

  // ── Beat display formatting ──

  it("displays correct bar.beat.sub for beat 4", () => {
    render(<TransportBar {...defaultProps} currentBeat={4} />);
    expect(screen.getByText("2.1.1")).toBeInTheDocument();
  });

  it("displays correct bar.beat.sub for beat 5.5", () => {
    render(<TransportBar {...defaultProps} currentBeat={5.5} />);
    expect(screen.getByText("2.2.3")).toBeInTheDocument();
  });
});
