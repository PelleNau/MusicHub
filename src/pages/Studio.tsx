import { useNavigate } from "react-router-dom";
import { useSettings } from "@/hooks/useSettings";
import { useAuth } from "@/hooks/useAuth";
import { useStudioPageRuntime } from "@/hooks/useStudioPageRuntime";
import { TransportBar } from "@/components/studio/TransportBar";
import { StudioArrangementWorkspace } from "@/components/studio/StudioArrangementWorkspace";
import { StudioBottomWorkspace } from "@/components/studio/StudioBottomWorkspace";
import { StudioHeaderBar } from "@/components/studio/StudioHeaderBar";
import { StudioGuideSidebar } from "@/components/studio/StudioGuideSidebar";
import { GuideAnchorHighlight } from "@/components/studio/lesson/GuideAnchorHighlight";
import { SessionPicker } from "@/components/studio/SessionPicker";
import { ConnectionAlert } from "@/components/studio/ConnectionAlert";
import { StudioStatusBar } from "@/components/studio/StudioStatusBar";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { StudioInfoProvider, useStudioInfo, useInfoHover, STUDIO_INFO } from "@/components/studio/StudioInfoContext";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Package } from "lucide-react";

// Track height is now managed by grid.trackHeight (useTimelineGrid)

/* ── Small sub-components that live inside StudioInfoProvider ── */

function ArrangementHover({ children }: { children: React.ReactNode }) {
  const hp = useInfoHover(STUDIO_INFO.arrangement);
  return <div className="contents" {...hp}>{children}</div>;
}
export default function Studio() {
  const navigate = useNavigate();
  const { settings } = useSettings();
  const { signOut } = useAuth();
  const {
    routeModel,
    sessions,
    session,
    tracks,
    isLoading,
    sessionMetrics,
    connectionSummary,
    guideBridge,
    studioModeModel,
    grid,
    presentation,
    lessonViewPolicy,
  } = useStudioPageRuntime({
    signOut,
    navigateToLab: () => navigate("/lab"),
    preferredMode: settings.studioModePreference,
  });

  // --- Session picker view ---
  if (!routeModel.activeSessionId) {
    return (
      <SessionPicker
        sessions={sessions}
        onNewSession={presentation.sessionPickerModel.onNewSession}
        onSelectSession={presentation.sessionPickerModel.onSelectSession}
        onSignOut={presentation.sessionPickerModel.onSignOut}
        onDeleteSession={presentation.sessionPickerModel.onDeleteSession}
        onRenameSession={presentation.sessionPickerModel.onRenameSession}
        isCreating={presentation.sessionPickerModel.isCreating}
      />
    );
  }

  // --- Loading state ---
  if (isLoading) {
    return (
      <div className="flex h-screen flex-col bg-background items-center justify-center gap-4">
        <Package className="h-6 w-6 text-primary animate-pulse" />
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-3 w-32" />
      </div>
    );
  }

  return (
    <StudioInfoProvider>
    <div
      className={`flex h-screen flex-col bg-background ${settings.theme === "ocean" ? "dawn-lagoon-bg" : ""}`}
      data-studio-mode={studioModeModel.mode}
      data-guide-lesson={guideBridge.lesson?.lessonId ?? ""}
      data-guide-status={guideBridge.runtime.state.lessonStatus}
      data-guide-step={guideBridge.runtime.state.currentStep?.stepId ?? ""}
      data-lesson-focus={studioModeModel.shell.focusTarget ?? lessonViewPolicy?.viewport?.focus ?? ""}
      data-lesson-dim={studioModeModel.shell.dimNonEssentialPanels ? "true" : "false"}
    >
      <StudioHeaderBar
        studioMode={studioModeModel.mode}
        sessionName={session?.name || "Loading…"}
        activeLessonId={routeModel.lessonId}
        guideVisible={presentation.headerModel.guide.visible}
        guideCollapsed={presentation.headerModel.guide.collapsed}
        guideLabel={presentation.headerModel.guide.label}
        onStartLesson={routeModel.startLesson}
        onToggleGuide={presentation.headerModel.toggleGuide}
        onOpenSessions={presentation.headerModel.openSessions}
        onOpenLab={presentation.headerModel.openLab}
        onSignOut={presentation.headerModel.signOut}
      />

      {/* Transport */}
      <TransportBar {...presentation.transportBarModel} />

      {/* Connection alert banner */}
      <ConnectionAlert {...presentation.connectionAlertModel} />

      {/* Browser + Timeline + Detail Panel */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        <ResizablePanelGroup
          direction="vertical"
          className="h-full min-h-0 flex-1 min-w-0"
        >
          <ResizablePanel defaultSize={studioModeModel.shell.arrangementDefaultSize} minSize={0} className="min-h-0 overflow-hidden">
            <StudioArrangementWorkspace
              mode={studioModeModel.mode}
              showBrowserPanel={studioModeModel.shell.showBrowserPanel}
              browserProps={presentation.arrangementWorkspaceModel.browserProps}
              gridProps={presentation.arrangementWorkspaceModel.gridProps}
              timelineContainerProps={presentation.arrangementWorkspaceModel.timelineContainerProps}
              timelineRef={presentation.arrangementWorkspaceModel.timelineRef}
              totalBeats={presentation.arrangementWorkspaceModel.totalBeats}
              pixelsPerBeat={presentation.arrangementWorkspaceModel.pixelsPerBeat}
              beatsPerBar={presentation.arrangementWorkspaceModel.beatsPerBar}
              activeDivision={presentation.arrangementWorkspaceModel.activeDivision}
              tripletMode={presentation.arrangementWorkspaceModel.tripletMode}
              playheadBeatGetter={presentation.arrangementWorkspaceModel.playheadBeatGetter}
              effectiveBeat={presentation.arrangementWorkspaceModel.effectiveBeat}
              onSeek={presentation.arrangementWorkspaceModel.onSeek}
              trackHeight={presentation.arrangementWorkspaceModel.trackHeight}
              onSetPixelsPerBeat={presentation.arrangementWorkspaceModel.onSetPixelsPerBeat}
              onSetTrackHeight={presentation.arrangementWorkspaceModel.onSetTrackHeight}
              loopRegionProps={presentation.arrangementWorkspaceModel.loopRegionProps}
              displayTracks={presentation.arrangementWorkspaceModel.displayTracks}
              displayReturnTracks={presentation.arrangementWorkspaceModel.displayReturnTracks}
              trackViewStateById={presentation.arrangementWorkspaceModel.trackViewStateById}
              selectedClipIds={presentation.arrangementWorkspaceModel.selectedClipIds}
              emptyStateInstruction={presentation.arrangementWorkspaceModel.emptyStateInstruction}
              trackLaneProps={presentation.arrangementWorkspaceModel.trackLaneProps}
              snapBeats={presentation.arrangementWorkspaceModel.snapBeats}
              arrangementWrapper={(children) => <ArrangementHover>{children}</ArrangementHover>}
              markerModel={presentation.arrangementWorkspaceModel.markerModel}
              timelineHeaderActions={presentation.arrangementWorkspaceModel.timelineHeaderActions}
              assetImportInputProps={presentation.arrangementWorkspaceModel.assetImportInputProps}
            />
          </ResizablePanel>

          {studioModeModel.shell.showBottomWorkspace ? (
            <>
              <ResizableHandle
                withHandle
                hitAreaMargins={{ coarse: 14, fine: 8 }}
                className="h-4 border-y border-border bg-card/80"
              />

              <ResizablePanel defaultSize={studioModeModel.shell.bottomDefaultSize} minSize={0} className="min-h-0 overflow-hidden">
                <StudioBottomWorkspace
                  mode={studioModeModel.mode}
                  showTabs={studioModeModel.shell.showBottomTabs}
                  bottomTab={presentation.bottomWorkspaceModel.bottomTab}
                  setBottomTab={presentation.bottomWorkspaceModel.setBottomTab}
                  showPianoRoll={presentation.bottomWorkspaceModel.showPianoRoll}
                  showMixer={presentation.bottomWorkspaceModel.showMixer}
                  showDetail={presentation.bottomWorkspaceModel.showDetail}
                  selectedTrackId={presentation.bottomWorkspaceModel.selectedTrackId}
                  mixerEmptyInstruction={presentation.bottomWorkspaceModel.mixerEmptyInstruction}
                  emptyInstruction={presentation.bottomWorkspaceModel.emptyInstruction}
                  mixerPanelProps={presentation.bottomWorkspaceModel.mixerPanelProps}
                  pianoRollProps={presentation.bottomWorkspaceModel.pianoRollProps}
                  detailPanelProps={presentation.bottomWorkspaceModel.detailPanelProps}
                />
              </ResizablePanel>
            </>
          ) : null}
        </ResizablePanelGroup>

      <StudioGuideSidebar
        mode={studioModeModel.mode}
        visible={studioModeModel.shell.showGuideSidebar}
        guideBridge={presentation.guideSidebarModel.guideBridge}
        lessonPanelModel={presentation.guideSidebarModel.lessonPanelModel}
        onDismissCompletion={presentation.guideSidebarModel.onDismissCompletion}
      />
      </div>

      {/* Guide anchor highlight overlay */}
      <GuideAnchorHighlight
        currentAnchor={guideBridge.runtime.state.currentStep?.anchor}
        resolvedAnchors={guideBridge.runtime.state.resolvedAnchors}
        lessonActive={guideBridge.runtime.state.lessonStatus === "active"}
      />

      {/* Status bar */}
      <StudioStatusBar
        trackCount={tracks.length}
        barCount={Math.ceil(sessionMetrics.totalBeats / sessionMetrics.beatsPerBar)}
        tempo={sessionMetrics.tempo}
        activeDivision={grid.activeDivision}
        tripletMode={grid.tripletMode}
        snapEnabled={grid.snapEnabled}
        pixelsPerBeat={grid.pixelsPerBeat}
        connectionSummary={connectionSummary}
        onToggleSnap={grid.toggleSnapEnabled}
        onZoomOut={grid.zoomOut}
        onZoomIn={grid.zoomIn}
      />
    </div>
    </StudioInfoProvider>
  );
}
