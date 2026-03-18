import { useState } from "react";
import { FileUp, Folder, Clock, Music, AlertTriangle, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { ProjectManifest } from "@/types/bridge";

interface ProjectImportViewProps {
  projects: ProjectManifest[];
  onSelectProject: (projectId: string) => void;
}

export function ProjectImportView({ projects, onSelectProject }: ProjectImportViewProps) {
  const [importing, setImporting] = useState(false);

  const handleImport = () => { setImporting(true); setTimeout(() => setImporting(false), 2500); };

  return (
    <div className="flex h-full flex-col">
      <div className="border-b px-4 py-4">
        <div
          className="flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-border bg-secondary/20 py-10 transition-colors hover:border-primary/40 hover:bg-secondary/40 cursor-pointer"
          onClick={handleImport}
        >
          <FileUp className={`h-8 w-8 text-muted-foreground ${importing ? "animate-bounce" : ""}`} />
          <div className="text-center">
            <p className="font-mono text-sm font-semibold text-foreground">
              {importing ? "Parsing project file…" : "Import DAW Project"}
            </p>
            <p className="font-mono text-[10px] text-muted-foreground mt-1">
              Drop an .als, .logicx, .bwproject, or .rpp file — or click to browse
            </p>
          </div>
          <div className="flex gap-2">
            {["Ableton", "Logic", "Bitwig", "Reaper"].map(d => (
              <Badge key={d} variant="outline" className="font-mono text-[10px]">{d}</Badge>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 border-b px-4 py-2">
        <Clock className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="font-mono text-xs font-semibold text-foreground">Recent Projects</span>
        <Badge variant="secondary" className="font-mono text-[10px]">{projects.length}</Badge>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-2">
          {projects.map(proj => (
            <button
              key={proj.id}
              onClick={() => onSelectProject(proj.id)}
              className="group w-full flex items-center gap-4 rounded-lg border border-border bg-card p-4 text-left transition-all hover:border-primary/40 hover:shadow-md hover:shadow-primary/5"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/15 text-primary shrink-0">
                <Music className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="font-mono text-sm font-semibold text-foreground truncate">{proj.name}</p>
                  <Badge variant="outline" className="font-mono text-[9px] shrink-0">{proj.daw}</Badge>
                </div>
                <div className="flex items-center gap-3 font-mono text-[10px] text-muted-foreground">
                  <span>{proj.trackCount} tracks</span>
                  <span>·</span>
                  <span>{proj.pluginCount} plugins</span>
                  <span>·</span>
                  <span>{proj.tempo} BPM</span>
                  <span>·</span>
                  <span>{proj.duration}</span>
                  {proj.missingCount > 0 && (
                    <>
                      <span>·</span>
                      <span className="flex items-center gap-1 text-destructive">
                        <AlertTriangle className="h-3 w-3" />
                        {proj.missingCount} missing
                      </span>
                    </>
                  )}
                </div>
                <p className="font-mono text-[9px] text-muted-foreground/60 mt-1 truncate">
                  <Folder className="inline h-2.5 w-2.5 mr-1" />{proj.filePath}
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
