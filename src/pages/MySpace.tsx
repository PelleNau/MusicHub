import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createSessionFromAbleton } from "@/hooks/useSession";
import { useAuth } from "@/hooks/useAuth";
import { useInventory } from "@/hooks/useInventory";
import { useProjectHistory, formatRelativeTime } from "@/hooks/useProjectHistory";
import { useStreamingAnalysis } from "@/hooks/useStreamingAnalysis";
import { AbletonParseResult } from "@/types/ableton";
import { ProjectParserPanel } from "@/components/ProjectParserPanel";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";
import { AnalysisDashboard } from "@/components/analysis/AnalysisDashboard";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Sparkles,
  FileAudio,
  BrainCircuit,
  Loader2,
  ChevronDown,
  ChevronUp,
  History,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

const DeepDive = () => {
  const { session: authSession } = useAuth();
  const navigate = useNavigate();
  const { items: inventoryData } = useInventory();

  const {
    history,
    currentFileName,
    setCurrentFileName,
    latestEntry,
    pushProject,
    updateAnalysis,
    deleteEntry,
  } = useProjectHistory();

  const { analysis, setAnalysis, analyzing, run, reset: resetAnalysis } = useStreamingAnalysis();
  const [parsedResult, setParsedResult] = useState<AbletonParseResult | null>(null);
  const [showAiText, setShowAiText] = useState(true);

  // Auto-load latest history entry on mount
  useEffect(() => {
    if (latestEntry && !parsedResult) {
      setParsedResult(latestEntry.result);
      setCurrentFileName(latestEntry.fileName);
      setAnalysis(latestEntry.analysis);
    }
  }, [latestEntry]); // eslint-disable-line react-hooks/exhaustive-deps

  // Persist analysis to history when streaming finishes
  useEffect(() => {
    if (!analyzing && currentFileName && analysis) {
      updateAnalysis(currentFileName, analysis);
    }
  }, [analyzing]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleParsed = useCallback(
    (result: AbletonParseResult, fileName?: string) => {
      const name = fileName || "Untitled Project.als";
      setParsedResult(result);
      setAnalysis("");
      pushProject(name, result);
    },
    [pushProject, setAnalysis],
  );

  const handleReset = useCallback(() => {
    setParsedResult(null);
    setCurrentFileName("");
    resetAnalysis();
  }, [setCurrentFileName, resetAnalysis]);

  const handleOpenInStudio = useCallback(async () => {
    if (!parsedResult || !authSession?.user?.id) return;
    try {
      const sessionId = await createSessionFromAbleton(
        authSession.user.id,
        parsedResult,
        currentFileName || "Untitled Project.als"
      );
      navigate(`/lab/studio?id=${sessionId}`);
    } catch {
      toast.error("Failed to create studio session");
    }
  }, [parsedResult, authSession, currentFileName, navigate]);

  const handleLoadEntry = useCallback(
    (entry: typeof latestEntry) => {
      if (!entry) return;
      setParsedResult(entry.result);
      setCurrentFileName(entry.fileName);
      setAnalysis(entry.analysis);
      resetAnalysis();
      // Re-set analysis after reset clears it
      setTimeout(() => setAnalysis(entry.analysis), 0);
    },
    [setCurrentFileName, setAnalysis, resetAnalysis],
  );

  const handleDeleteEntry = useCallback(
    (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      deleteEntry(id);
    },
    [deleteEntry],
  );

  const handleRunAnalysis = useCallback(() => {
    if (parsedResult) run(parsedResult);
  }, [parsedResult, run]);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background pb-20">
      {/* ── Header ── */}
      <header className="flex items-center justify-between border-b px-6 py-3 bg-chrome">
        <div className="flex items-center gap-3">
          <Sparkles className="h-5 w-5 text-primary" />
          <h1 className="text-lg font-mono font-semibold tracking-tight text-foreground">
            DEEP DIVE
          </h1>
          {currentFileName && (
            <span className="font-mono text-xs text-muted-foreground border-l border-border pl-3 ml-1 truncate max-w-[200px]">
              {currentFileName.replace(/\.als$/i, "")}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <HistoryDropdown
            history={history}
            currentFileName={currentFileName}
            onLoad={handleLoadEntry}
            onDelete={handleDeleteEntry}
          />
        </div>
      </header>

      {/* ── Main content ── */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left panel */}
        <div className="w-[420px] shrink-0 border-r flex flex-col">
          <ParserToolbar
            hasResult={!!parsedResult}
            hasAnalysis={!!analysis}
            analyzing={analyzing}
            onRunAnalysis={handleRunAnalysis}
          />
          <ScrollArea className="flex-1">
            <div className="p-4">
              <ProjectParserPanel
                inventoryItems={inventoryData}
                onParsed={handleParsed}
                result={parsedResult}
                onReset={handleReset}
                onOpenInStudio={parsedResult ? handleOpenInStudio : undefined}
              />
            </div>
            <AiDeepDiveSection
              analysis={analysis}
              analyzing={analyzing}
              showText={showAiText}
              onToggle={() => setShowAiText((v) => !v)}
            />
          </ScrollArea>
        </div>

        {/* Right panel */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex items-center gap-2 px-4 border-b h-12">
            <BrainCircuit className="h-4 w-4 text-primary" />
            <h2 className="font-mono text-xs font-semibold text-foreground">Analysis</h2>
          </div>
          <div className="flex-1 overflow-y-auto overflow-x-hidden">
            {!parsedResult && !analysis ? (
              <EmptyState />
            ) : parsedResult ? (
              <AnalysisDashboard parsedResult={parsedResult} inventoryItems={inventoryData} />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeepDive;

// ── Sub-components ──

function HistoryDropdown({
  history,
  currentFileName,
  onLoad,
  onDelete,
}: {
  history: { id: string; fileName: string; timestamp: number; analysis: string; result: AbletonParseResult }[];
  currentFileName: string;
  onLoad: (entry: (typeof history)[number]) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="font-mono text-xs gap-1.5 text-muted-foreground">
          <History className="h-3.5 w-3.5" />
          History
          {history.length > 0 && (
            <span className="font-mono text-[9px] bg-secondary px-1 rounded">{history.length}</span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72 max-h-80 overflow-y-auto">
        <DropdownMenuLabel className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
          Recent Projects
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {history.length === 0 ? (
          <div className="px-3 py-4 text-center">
            <p className="font-mono text-xs text-muted-foreground">No projects yet</p>
          </div>
        ) : (
          history.map((entry) => (
            <DropdownMenuItem
              key={entry.id}
              className="flex items-center gap-2 cursor-pointer group"
              onClick={() => onLoad(entry)}
            >
              <FileAudio className="h-3.5 w-3.5 text-primary shrink-0" />
              <div className="flex-1 min-w-0">
                <p
                  className={`font-mono text-xs truncate ${
                    entry.fileName === currentFileName ? "text-primary font-semibold" : "text-foreground"
                  }`}
                >
                  {entry.fileName.replace(/\.als$/i, "")}
                </p>
                <p className="font-mono text-[9px] text-muted-foreground">
                  {formatRelativeTime(entry.timestamp)}
                  {entry.analysis ? " · analyzed" : ""}
                </p>
              </div>
              <button
                onClick={(e) => onDelete(entry.id, e)}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-destructive/10 rounded"
              >
                <Trash2 className="h-3 w-3 text-destructive" />
              </button>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function ParserToolbar({
  hasResult,
  hasAnalysis,
  analyzing,
  onRunAnalysis,
}: {
  hasResult: boolean;
  hasAnalysis: boolean;
  analyzing: boolean;
  onRunAnalysis: () => void;
}) {
  return (
    <div className="flex items-center gap-2 px-4 border-b h-12">
      <FileAudio className="h-4 w-4 text-primary" />
      <h2 className="font-mono text-xs font-semibold text-foreground">Project Parser</h2>
      {hasResult && !analyzing && (
        <Button size="sm" className="font-mono text-xs gap-1.5 ml-auto" onClick={onRunAnalysis}>
          <Sparkles className="h-3.5 w-3.5" />
          {hasAnalysis ? "Re-analyze" : "AI Deep Dive"}
        </Button>
      )}
      {analyzing && (
        <div className="flex items-center gap-2 ml-auto">
          <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
          <span className="font-mono text-[10px] text-muted-foreground">Analyzing…</span>
        </div>
      )}
    </div>
  );
}

function AiDeepDiveSection({
  analysis,
  analyzing,
  showText,
  onToggle,
}: {
  analysis: string;
  analyzing: boolean;
  showText: boolean;
  onToggle: () => void;
}) {
  if (!analysis && !analyzing) return null;

  return (
    <div className="border-t border-border/30">
      <button
        className="flex items-center gap-2 px-4 py-3 w-full text-left hover:bg-secondary/30 transition-colors"
        onClick={onToggle}
      >
        <Sparkles className="h-3.5 w-3.5 text-primary" />
        <span className="font-mono text-xs font-semibold text-foreground">AI Deep Dive</span>
        {showText ? (
          <ChevronUp className="h-3.5 w-3.5 text-muted-foreground ml-auto" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground ml-auto" />
        )}
        {analyzing && <Loader2 className="h-3 w-3 animate-spin text-primary" />}
      </button>
      {showText && (
        <div className="p-4 pt-0">
          <div
            className="prose prose-sm prose-invert max-w-none font-mono
              prose-headings:text-foreground prose-headings:font-mono prose-headings:tracking-tight
              prose-p:text-muted-foreground prose-p:leading-relaxed
              prose-strong:text-foreground
              prose-li:text-muted-foreground
              prose-code:text-primary prose-code:bg-secondary/50 prose-code:px-1 prose-code:py-0.5 prose-code:rounded
              prose-hr:border-border/30"
          >
            <ReactMarkdown>{analysis}</ReactMarkdown>
          </div>
          {analyzing && (
            <div className="mt-4 flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span className="font-mono text-[10px] text-muted-foreground">Streaming…</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] gap-3">
      <BrainCircuit className="h-12 w-12 text-muted-foreground/30" />
      <p className="font-mono text-sm text-muted-foreground">Upload a project to get started</p>
      <p className="font-mono text-[10px] text-muted-foreground/60 max-w-sm text-center">
        Parse an Ableton .als file, then run AI analysis to get feedback on your instrument choices, effect chains, and
        suggestions from your own inventory
      </p>
    </div>
  );
}
