import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi, beforeEach } from "vitest";

import Studio from "@/pages/Studio";

const mockUseSettings = vi.fn();
const mockUseAuth = vi.fn();
const mockUseStudioPageRuntime = vi.fn();
const mockIsCaptureMode = vi.fn();
const mockGetCaptureScenario = vi.fn();
const mockGetCaptureOverlay = vi.fn();
const mockStudioArrangementWorkspace = vi.fn();
const mockStudioBottomWorkspace = vi.fn();

vi.mock("@/hooks/useSettings", () => ({
  useSettings: () => mockUseSettings(),
}));

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock("@/hooks/useStudioPageRuntime", () => ({
  useStudioPageRuntime: () => mockUseStudioPageRuntime(),
}));

vi.mock("@/lib/captureMode", () => ({
  isCaptureMode: () => mockIsCaptureMode(),
  getCaptureScenario: () => mockGetCaptureScenario(),
  getCaptureOverlay: () => mockGetCaptureOverlay(),
}));

vi.mock("@/components/studio/TransportBar", () => ({
  TransportBar: () => <div data-testid="transport-bar" />,
}));

vi.mock("@/components/studio/StudioArrangementWorkspace", () => ({
  StudioArrangementWorkspace: (props: {
    showBrowserPanel: boolean;
    displayTracks: Array<{
      id: string;
      automation_lanes?: Array<{ id: string; visible: boolean }>;
    }>;
  }) => {
    mockStudioArrangementWorkspace(props);
    return <div data-testid="arrangement-workspace" data-show-browser-panel={String(props.showBrowserPanel)} />;
  },
}));

vi.mock("@/components/studio/StudioBottomWorkspace", () => ({
  StudioBottomWorkspace: (props: { showMixer: boolean; showPianoRoll: boolean }) => {
    mockStudioBottomWorkspace(props);
    return (
      <div
        data-testid="bottom-workspace"
        data-show-mixer={String(props.showMixer)}
        data-show-piano-roll={String(props.showPianoRoll)}
      />
    );
  },
}));

vi.mock("@/components/studio/StudioHeaderBar", () => ({
  StudioHeaderBar: () => <div data-testid="studio-header" />,
}));

vi.mock("@/components/studio/StudioGuideSidebar", () => ({
  StudioGuideSidebar: () => <div data-testid="guide-sidebar" />,
}));

vi.mock("@/components/studio/StudioCaptureOverlays", () => ({
  PianoRollCaptureOverlay: () => <div data-testid="capture-overlay" />,
}));

vi.mock("@/components/studio/lesson/GuideAnchorHighlight", () => ({
  GuideAnchorHighlight: () => null,
}));

vi.mock("@/components/studio/SessionPicker", () => ({
  SessionPicker: () => <div data-testid="session-picker" />,
}));

vi.mock("@/components/studio/ConnectionAlert", () => ({
  ConnectionAlert: () => <div data-testid="connection-alert" />,
}));

vi.mock("@/components/studio/StudioStatusBar", () => ({
  StudioStatusBar: () => <div data-testid="status-bar" />,
}));

vi.mock("@/components/ui/resizable", () => ({
  ResizableHandle: () => <div data-testid="resizable-handle" />,
  ResizablePanel: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  ResizablePanelGroup: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/components/studio/StudioInfoContext", () => ({
  StudioInfoProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useInfoHover: () => ({}),
  STUDIO_INFO: { arrangement: {} },
}));

vi.mock("@/components/ui/skeleton", () => ({
  Skeleton: () => <div data-testid="skeleton" />,
}));

vi.mock("lucide-react", () => ({
  Package: () => <div data-testid="package-icon" />,
}));

function createRuntimeResult({
  showBottomWorkspace = true,
  showPianoRoll = true,
  displayTracks,
  onClipSelect,
  openPanel,
  setBottomTab,
}: {
  showBottomWorkspace?: boolean;
  showPianoRoll?: boolean;
  displayTracks?: Array<{
    id: string;
    type: string;
    clips?: Array<{ id: string; is_midi?: boolean }>;
  }>;
  onClipSelect?: (clipId: string, trackId: string) => void;
  openPanel?: (panel: "detail" | "pianoRoll" | "mixer") => void;
  setBottomTab?: (tab: "editor" | "mixer") => void;
}) {
  const tracks =
    displayTracks ??
    [
      {
        id: "track-1",
        type: "midi",
        clips: [{ id: "clip-1", is_midi: true }],
        automation_lanes: [
          {
            id: "lane-1",
            visible: true,
          },
        ],
      },
    ];

  return {
    routeModel: {
      activeSessionId: "session-1",
      lessonId: null,
      startLesson: vi.fn(),
      openSessions: vi.fn(),
      selectSession: vi.fn(),
      dismissLesson: vi.fn(),
    },
    sessions: [{ id: "session-1" }],
    session: { name: "Session 1" },
    tracks,
    isLoading: false,
    sessionMetrics: {
      beatsPerBar: 4,
      totalBeats: 16,
      tempo: 120,
      timeSignature: "4/4",
    },
    connectionSummary: {
      isMock: true,
      canUseNativeControls: false,
    },
    guideBridge: {
      lesson: undefined,
      runtime: {
        state: {
          lessonStatus: "idle",
          currentStep: null,
          resolvedAnchors: {},
        },
      },
    },
    studioModeModel: {
      mode: "standard",
      shell: {
        showGuideSidebar: false,
        showBrowserPanel: false,
        showBottomWorkspace,
        showBottomTabs: true,
        arrangementDefaultSize: 72,
        bottomDefaultSize: 28,
        focusTarget: null,
        dimNonEssentialPanels: false,
      },
    },
    grid: {
      activeDivision: "1/4",
      tripletMode: false,
      snapEnabled: true,
      pixelsPerBeat: 128,
      toggleSnapEnabled: vi.fn(),
      zoomOut: vi.fn(),
      zoomIn: vi.fn(),
    },
    presentation: {
      headerModel: {
        guide: { visible: false, collapsed: false, label: "" },
        toggleGuide: vi.fn(),
        openSessions: vi.fn(),
        openLab: vi.fn(),
        signOut: vi.fn(),
      },
      transportBarModel: {
        tempo: 120,
        timeSignature: "4/4",
        currentBeat: 0,
        playbackState: "stopped",
        onPlay: vi.fn(),
        onPause: vi.fn(),
        onStop: vi.fn(),
        onTempoChange: vi.fn(),
      },
      connectionAlertModel: {},
      arrangementWorkspaceModel: {
        browserProps: {},
        gridProps: {},
        timelineContainerProps: {},
        timelineRef: { current: null },
        totalBeats: 16,
        pixelsPerBeat: 128,
        beatsPerBar: 4,
        activeDivision: "1/4",
        tripletMode: false,
        playheadBeatGetter: () => 0,
        effectiveBeat: 0,
        onSeek: vi.fn(),
        trackHeight: 72,
        onSetPixelsPerBeat: vi.fn(),
        onSetTrackHeight: vi.fn(),
        loopRegionProps: {},
        displayTracks: tracks,
        displayReturnTracks: [],
        trackViewStateById: {},
        selectedClipIds: new Set<string>(),
        emptyStateInstruction: "",
        trackLaneProps: {
          onClipSelect: onClipSelect ?? vi.fn(),
        },
        snapBeats: 0.25,
        markerModel: {},
        timelineHeaderActions: {},
        assetImportInputProps: {},
      },
      bottomWorkspaceModel: {
        bottomTab: "editor",
        setBottomTab: setBottomTab ?? vi.fn(),
        showPianoRoll,
        showMixer: false,
        showDetail: false,
        selectedTrackId: "track-1",
        mixerEmptyInstruction: "",
        emptyInstruction: "",
        mixerPanelProps: { tracks: [] },
        pianoRollProps: showPianoRoll ? {} : null,
        detailPanelProps: {},
      },
      guideSidebarModel: {
        guideBridge: {
          lesson: undefined,
          runtime: { state: { lessonStatus: "idle", currentStep: null, resolvedAnchors: {} } },
        },
        lessonPanelModel: {
          lessonState: {
            visible: false,
            collapsed: false,
          },
        },
        onDismissCompletion: vi.fn(),
      },
    },
    lessonViewPolicy: undefined,
    commandDispatch: {
      openPanel: openPanel ?? vi.fn(),
      play: vi.fn(),
      pause: vi.fn(),
      seek: vi.fn(),
      setLoop: vi.fn(),
    },
    settingsRuntime: {
      bottomTab: "editor",
    },
  };
}

describe("Studio baseline workspace", () => {
  beforeEach(() => {
    mockUseSettings.mockReturnValue({ settings: { theme: "dark", studioModePreference: "auto" } });
    mockUseAuth.mockReturnValue({ signOut: vi.fn() });
    mockIsCaptureMode.mockReturnValue(false);
    mockGetCaptureScenario.mockReturnValue(null);
    mockGetCaptureOverlay.mockReturnValue(null);
    mockStudioArrangementWorkspace.mockReset();
    mockStudioBottomWorkspace.mockReset();
  });

  it("opens the mixer baseline on /studio", async () => {
    const setBottomTab = vi.fn();
    mockUseStudioPageRuntime.mockReturnValue(
      createRuntimeResult({ showBottomWorkspace: false, showPianoRoll: false, setBottomTab }),
    );

    render(
      <MemoryRouter initialEntries={["/studio"]}>
        <Routes>
          <Route path="*" element={<Studio />} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(setBottomTab).toHaveBeenCalledWith("mixer");
    });
  });

  it("renders the browser panel baseline on /studio/workspace", () => {
    mockUseStudioPageRuntime.mockReturnValue(createRuntimeResult({ showBottomWorkspace: true, showPianoRoll: false }));

    render(
      <MemoryRouter initialEntries={["/studio/workspace"]}>
        <Routes>
          <Route path="*" element={<Studio />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByTestId("arrangement-workspace")).toHaveAttribute("data-show-browser-panel", "true");
  });

  it("auto-seeds the piano roll/editor surface on /studio/workspace", async () => {
    const onClipSelect = vi.fn();
    const openPanel = vi.fn();
    const setBottomTab = vi.fn();
    mockUseStudioPageRuntime.mockReturnValue(
      createRuntimeResult({
        showBottomWorkspace: false,
        showPianoRoll: false,
        onClipSelect,
        openPanel,
        setBottomTab,
      }),
    );

    render(
      <MemoryRouter initialEntries={["/studio/workspace"]}>
        <Routes>
          <Route path="*" element={<Studio />} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(onClipSelect).toHaveBeenCalledWith("clip-1", "track-1");
    });

    expect(openPanel).toHaveBeenCalledWith("pianoRoll");
    expect(setBottomTab).not.toHaveBeenCalledWith("mixer");
  });

  it("preserves an already-open editor surface on /studio/workspace", () => {
    mockUseStudioPageRuntime.mockReturnValue(createRuntimeResult({ showBottomWorkspace: true, showPianoRoll: true }));

    render(
      <MemoryRouter initialEntries={["/studio/workspace"]}>
        <Routes>
          <Route path="*" element={<Studio />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByTestId("bottom-workspace")).toHaveAttribute("data-show-piano-roll", "true");
  });

  it("keeps at least one visible automation lane on the product workspace route", () => {
    mockUseStudioPageRuntime.mockReturnValue(createRuntimeResult({ showBottomWorkspace: true, showPianoRoll: false }));

    render(
      <MemoryRouter initialEntries={["/studio/workspace"]}>
        <Routes>
          <Route path="*" element={<Studio />} />
        </Routes>
      </MemoryRouter>,
    );

    const arrangementCall = mockStudioArrangementWorkspace.mock.calls.at(-1)?.[0] as
      | { displayTracks?: Array<{ automation_lanes?: Array<{ visible: boolean }> }> }
      | undefined;

    expect(arrangementCall?.displayTracks?.some((track) => track.automation_lanes?.some((lane) => lane.visible))).toBe(
      true,
    );
  });
});
