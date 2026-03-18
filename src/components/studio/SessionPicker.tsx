import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
} from "@/components/ui/context-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Package, Plus, Music2, Pencil, Trash2 } from "lucide-react";
import type { Session } from "@/types/studio";

interface SessionPickerProps {
  sessions: Session[];
  onNewSession: () => void;
  onSelectSession: (id: string) => void;
  onDeleteSession?: (id: string) => void;
  onRenameSession?: (id: string, name: string) => void;
  isCreating?: boolean;
}

const VISIBLE_LIMIT = 11;

export function SessionPicker({
  sessions,
  onNewSession,
  onSelectSession,
  onDeleteSession,
  onRenameSession,
  isCreating,
}: SessionPickerProps) {
  const [showAll, setShowAll] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Session | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  const sortedSessions = [...sessions].sort(
    (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  );
  const displayedSessions = showAll ? sortedSessions : sortedSessions.slice(0, VISIBLE_LIMIT);

  const handleStartRename = (s: Session) => {
    setRenamingId(s.id);
    setRenameValue(s.name);
  };

  const handleConfirmRename = () => {
    if (renamingId && renameValue.trim() && onRenameSession) {
      onRenameSession(renamingId, renameValue.trim());
    }
    setRenamingId(null);
  };

  const handleConfirmDelete = () => {
    if (deleteTarget && onDeleteSession) {
      onDeleteSession(deleteTarget.id);
    }
    setDeleteTarget(null);
  };

  return (
    <div className="flex h-screen flex-col bg-background">
      <header className="flex items-center justify-between border-b px-6 py-3">
        <div className="flex items-center gap-3">
          <Package className="h-5 w-5 text-primary" />
          <h1 className="text-lg font-mono font-semibold tracking-tight text-foreground">
            STUDIO
          </h1>
          <span className="text-xs font-mono text-muted-foreground border-l border-border pl-3 ml-1">
            {sessions.length} session{sessions.length !== 1 ? "s" : ""}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={onNewSession} size="sm" className="font-mono text-xs gap-1.5" disabled={isCreating}>
            <Plus className="h-3.5 w-3.5" /> New Session
          </Button>
        </div>
      </header>

      <div className="flex-1 overflow-auto p-6">
        {sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-6">
            <div className="w-16 h-16 rounded-xl bg-muted/30 flex items-center justify-center">
              <Music2 className="h-8 w-8 text-muted-foreground/70" />
            </div>
            <div className="text-center">
              <h2 className="text-xl font-mono font-bold text-foreground mb-1">No sessions yet</h2>
              <p className="text-muted-foreground font-mono text-sm">
                Create your first session to start arranging.
              </p>
            </div>
            <Button onClick={onNewSession} className="font-mono gap-2" disabled={isCreating}>
              <Plus className="h-4 w-4" /> New Session
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {/* New session card */}
              <button
                onClick={onNewSession}
                disabled={isCreating}
                className="group flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border/60 bg-card/30 p-6 transition-all hover:border-primary/40 hover:bg-primary/[0.03] min-h-[140px]"
              >
                <div className="w-10 h-10 rounded-lg bg-muted/40 group-hover:bg-primary/10 flex items-center justify-center transition-colors">
                  <Plus className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <span className="font-mono text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                  New Session
                </span>
              </button>

              {/* Session cards */}
              {displayedSessions.map((s) => (
                <SessionCard
                  key={s.id}
                  session={s}
                  onSelect={onSelectSession}
                  onStartRename={handleStartRename}
                  onStartDelete={setDeleteTarget}
                  isRenaming={renamingId === s.id}
                  renameValue={renameValue}
                  onRenameChange={setRenameValue}
                  onConfirmRename={handleConfirmRename}
                  onCancelRename={() => setRenamingId(null)}
                />
              ))}
            </div>

            {sortedSessions.length > VISIBLE_LIMIT && (
              <div className="flex justify-center mt-4">
                <button
                  onClick={() => setShowAll(!showAll)}
                  className="font-mono text-xs text-muted-foreground hover:text-foreground transition-colors px-4 py-1.5 rounded border border-border/40 hover:border-border"
                >
                  {showAll ? "Show less" : `Show all ${sortedSessions.length} sessions`}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-mono">Delete session?</AlertDialogTitle>
            <AlertDialogDescription className="font-mono text-sm">
              This will permanently delete <strong>"{deleteTarget?.name}"</strong> and all its tracks and clips. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="font-mono text-xs">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="font-mono text-xs bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/* ── Individual session card ── */
interface SessionCardProps {
  session: Session;
  onSelect: (id: string) => void;
  onStartRename: (s: Session) => void;
  onStartDelete: (s: Session) => void;
  isRenaming: boolean;
  renameValue: string;
  onRenameChange: (v: string) => void;
  onConfirmRename: () => void;
  onCancelRename: () => void;
}

function SessionCard({
  session: s,
  onSelect,
  onStartRename,
  onStartDelete,
  isRenaming,
  renameValue,
  onRenameChange,
  onConfirmRename,
  onCancelRename,
}: SessionCardProps) {
  const renameInputRef = useRef<HTMLInputElement>(null);
  const updatedDate = new Date(s.updated_at);
  const isToday = new Date().toDateString() === updatedDate.toDateString();
  const timeStr = isToday
    ? updatedDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : updatedDate.toLocaleDateString([], { month: "short", day: "numeric" });

  useEffect(() => {
    if (isRenaming) {
      renameInputRef.current?.focus();
      renameInputRef.current?.select();
    }
  }, [isRenaming]);

  const handleRenameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onConfirmRename();
    } else if (e.key === "Escape") {
      onCancelRename();
    }
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <button
          onClick={() => !isRenaming && onSelect(s.id)}
          className="group flex flex-col rounded-lg border border-border bg-card transition-all hover:border-primary/50 hover:shadow-md hover:shadow-primary/5 text-left overflow-hidden min-h-[140px]"
        >
          <div className="h-12 bg-muted/20 border-b border-border/50 flex items-end px-3 pb-1 gap-[2px] overflow-hidden">
            {Array.from({ length: 32 }, (_, i) => {
              const seed = s.id.charCodeAt(i % s.id.length) + i;
              const h = ((seed * 7 + 13) % 24) + 4;
              return (
                <div
                  key={i}
                  className="flex-1 min-w-[2px] rounded-t-sm bg-primary/20 group-hover:bg-primary/35 transition-colors"
                  style={{ height: h }}
                />
              );
            })}
          </div>
          <div className="flex-1 flex flex-col p-3 gap-1.5">
            {isRenaming ? (
              <Input
                ref={renameInputRef}
                value={renameValue}
                onChange={(e) => onRenameChange(e.target.value)}
                onBlur={onConfirmRename}
                onKeyDown={handleRenameKeyDown}
                onClick={(e) => e.stopPropagation()}
                className="h-6 text-sm font-mono font-medium px-1 py-0 border-primary"
              />
            ) : (
              <p className="text-sm font-mono font-medium text-foreground truncate leading-tight">
                {s.name}
              </p>
            )}
            <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground">
              <span>{s.tempo} BPM</span>
              <span className="text-border">·</span>
              <span>{s.time_signature}</span>
            </div>
            <p className="text-[10px] font-mono text-muted-foreground/80 mt-auto">
              {isToday ? "Today" : ""} {timeStr}
            </p>
          </div>
        </button>
      </ContextMenuTrigger>
      <ContextMenuContent className="font-mono text-xs">
        <ContextMenuItem onClick={() => onStartRename(s)} className="gap-2">
          <Pencil className="h-3 w-3" /> Rename
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={() => onStartDelete(s)} className="gap-2 text-destructive focus:text-destructive">
          <Trash2 className="h-3 w-3" /> Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}