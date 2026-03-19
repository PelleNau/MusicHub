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
import { StudioInfoProvider, useInfoHover, STUDIO_INFO } from "@/components/studio/StudioInfoContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Package } from "lucide-react";
import { cn } from "@/lib/utils";

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

  if (isLoading) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-background">
        <Package className="h-6 w-6 animate-pulse text-primary" />
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-3 w-32" />
      </div>
    );
  }

  return (
    <StudioInfoProvider>
      <div
        className={cn(
          "flex h-screen flex-col overflow-hidden bg-background",
          settings.theme === "ocean" && "dawn-lagoon-bg",
          studioModeModel.mode === "guided"
            ? "bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.12),transparent_28%),radial-gradient(circle_at_top_left,rgba(34,197,94,0.08),transparent_24%)]"
            : studioModeModel.mode === "focused"
              ? "bg-[radial-gradient(circle_at_top,rgba(148,163,184,0.06),transparent_18%),radial-gradient(circle_at_bottom_right,rgba(15,23,42,0.24),transparent_30%)]"
              : "bg-[radial-gradient(circle_at_top,rgba(148,163,184,0.08),transparent_32%)]",
        )}
        data-studio-mode={studioModeModel.mode}
        data-studio-shell={studioModeModel.mode}
        data-guide-lesson={guideBridge.lesson?.lessonId ?? ""}
        data-guide-status={guideBridge.runtime.state.lessonStatus}
        data-guide-step={guideBridge.runtime.state.currentStep?.stepId ?? ""}
        data-guide-visible={presentation.guideSidebarModel.lessonPanelModel.lessonState.visible ? "true" : "false"}
        data-guide-collapsed={presentation.guideSidebarModel.lessonPanelModel.lessonState.collapsed ? "true" : "false"}
        data-lesson-focus={studioModeModel.shell.focusTarget ?? lessonViewPolicy?.viewport?.focus ?? ""}
        data-lesson-dim={
          studioModeModel.shell.dimNonEssentialPanels ||
          guideBridge.runtime.state.currentStep?.viewPolicy?.focus?.dimNonTarget
            ? "true"
            : "false"
        }
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

        <TransportBar {...presentation.transportBarModel} />
        <ConnectionAlert {...presentation.connectionAlertModel} />

        <div
          className={cn(
            "flex min-h-0 flex-1 overflow-hidden pb-3",
            studioModeModel.mode === "focused" ? "px-2" : "px-3",
          )}
        >
          <ResizablePanelGroup
            direction="vertical"
            className={cn(
              "h-full min-h-0 min-w-0 flex-1 rounded-[24px] border backdrop-blur-xl",
              studioModeModel.mode === "focused"
                ? "border-border/60 bg-background/74 shadow-[0_20px_70px_-42px_rgba(15,23,42,0.58)]"
                : "border-border/70 bg-background/80 shadow-[0_24px_80px_-36px_rgba(15,23,42,0.75)]",
            )}
          >
            <ResizablePanel
              defaultSize={studioModeModel.shell.arrangementDefaultSize}
              minSize={0}
              className="min-h-0 overflow-hidden"
            >
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
                  className="h-4 border-y border-border/70 bg-card/60"
                />

                <ResizablePanel
                  defaultSize={studioModeModel.shell.bottomDefaultSize}
                  minSize={0}
                  className="min-h-0 overflow-hidden"
                >
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

        <GuideAnchorHighlight
          currentAnchor={guideBridge.runtime.state.currentStep?.anchor}
          resolvedAnchors={guideBridge.runtime.state.resolvedAnchors}
          lessonActive={guideBridge.runtime.state.lessonStatus === "active"}
        />

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
