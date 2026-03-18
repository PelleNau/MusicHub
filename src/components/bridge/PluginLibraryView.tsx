import { useState, useMemo } from "react";
import { Search, Filter, HardDrive, RefreshCw, Eye } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PluginDetailView } from "@/components/bridge/PluginDetailView";
import type { HostPlugin } from "@/services/pluginHostClient";

interface PluginLibraryViewProps {
  plugins: HostPlugin[];
  loading: boolean;
  scanning: boolean;
  connected: boolean;
  onFetch: () => void;
  onScan: () => void;
}

export function PluginLibraryView({ plugins, loading, scanning, connected, onFetch, onScan }: PluginLibraryViewProps) {
  const [search, setSearch] = useState("");
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const [selectedPlugin, setSelectedPlugin] = useState<HostPlugin | null>(null);

  const allTags = useMemo(() => {
    const t = new Set<string>();
    plugins.forEach(p => p.tags.forEach(tag => t.add(tag)));
    return Array.from(t).sort();
  }, [plugins]);

  const filtered = useMemo(() => {
    let list = plugins;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(q) || p.vendor.toLowerCase().includes(q));
    }
    if (tagFilter) list = list.filter(p => p.tags.includes(tagFilter));
    return list;
  }, [plugins, search, tagFilter]);

  const instruments = filtered.filter(p => p.category === "Instrument");
  const effects = filtered.filter(p => p.category === "Effect");

  if (selectedPlugin) {
    return <PluginDetailView plugin={selectedPlugin} onBack={() => setSelectedPlugin(null)} />;
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b px-4 py-2.5">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search plugins…" className="h-8 pl-8 font-mono text-xs" />
        </div>
        <Button size="sm" variant="outline" className="h-8 gap-1.5 font-mono text-xs" onClick={onFetch}
          disabled={loading || !connected}>
          <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Loading…" : "Refresh"}
        </Button>
        <Button size="sm" variant="outline" className="h-8 gap-1.5 font-mono text-xs" onClick={onScan}
          disabled={scanning || !connected}>
          <RefreshCw className={`h-3 w-3 ${scanning ? "animate-spin" : ""}`} />
          {scanning ? "Scanning…" : "Rescan All"}
        </Button>
        <div className="ml-auto flex items-center gap-1.5 font-mono text-[10px] text-muted-foreground">
          <HardDrive className="h-3 w-3" />
          {plugins.length} plugins · {plugins.filter(p => !p.installed).length} missing
        </div>
      </div>

      {allTags.length > 0 && (
        <div className="flex items-center gap-1.5 border-b px-4 py-2 overflow-x-auto">
          <Filter className="h-3 w-3 text-muted-foreground shrink-0" />
          <Badge variant={tagFilter === null ? "default" : "outline"}
            className="font-mono text-[10px] cursor-pointer shrink-0"
            onClick={() => setTagFilter(null)}>All</Badge>
          {allTags.map(tag => (
            <Badge key={tag} variant={tagFilter === tag ? "default" : "outline"}
              className="font-mono text-[10px] cursor-pointer shrink-0"
              onClick={() => setTagFilter(tagFilter === tag ? null : tag)}>{tag}</Badge>
          ))}
        </div>
      )}

      {plugins.length === 0 && !loading ? (
        <div className="flex flex-col items-center justify-center flex-1 py-20 text-center">
          <HardDrive className="h-10 w-10 text-muted-foreground/30 mb-3" />
          <p className="font-mono text-sm text-muted-foreground">No plugins loaded</p>
          <p className="font-mono text-[10px] text-muted-foreground/60 mt-1">
            {connected ? "Click Refresh or Rescan to fetch the plugin library" : "Connect to the plugin host first"}
          </p>
        </div>
      ) : (
        <Tabs defaultValue="all" className="flex-1 flex flex-col min-h-0">
          <TabsList className="mx-4 mt-2 h-8 bg-secondary w-fit">
            <TabsTrigger value="all" className="font-mono text-[10px] px-3">All ({filtered.length})</TabsTrigger>
            <TabsTrigger value="instruments" className="font-mono text-[10px] px-3">Instruments ({instruments.length})</TabsTrigger>
            <TabsTrigger value="effects" className="font-mono text-[10px] px-3">Effects ({effects.length})</TabsTrigger>
          </TabsList>

          {["all", "instruments", "effects"].map(tab => (
            <TabsContent key={tab} value={tab} className="flex-1 m-0 min-h-0">
              <ScrollArea className="h-full">
                <div className="p-4">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b text-left">
                        <th className="font-mono text-[10px] text-muted-foreground font-medium pb-2 pr-4">Plugin</th>
                        <th className="font-mono text-[10px] text-muted-foreground font-medium pb-2 pr-4">Vendor</th>
                        <th className="font-mono text-[10px] text-muted-foreground font-medium pb-2 pr-4">Format</th>
                        <th className="font-mono text-[10px] text-muted-foreground font-medium pb-2 pr-4">Version</th>
                        <th className="font-mono text-[10px] text-muted-foreground font-medium pb-2 pr-4">Tags</th>
                        <th className="font-mono text-[10px] text-muted-foreground font-medium pb-2 pr-4">Latency</th>
                        <th className="font-mono text-[10px] text-muted-foreground font-medium pb-2 pr-4">Status</th>
                        <th className="font-mono text-[10px] text-muted-foreground font-medium pb-2 w-10"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {(tab === "instruments" ? instruments : tab === "effects" ? effects : filtered).map(p => (
                        <tr key={p.id}
                          className="group border-b border-border/50 hover:bg-secondary/30 transition-colors cursor-pointer"
                          onClick={() => setSelectedPlugin(p)}>
                          <td className="py-2 pr-4">
                            <span className="font-mono text-xs font-semibold text-foreground">{p.name}</span>
                          </td>
                          <td className="py-2 pr-4">
                            <span className="font-mono text-xs text-muted-foreground">{p.vendor}</span>
                          </td>
                          <td className="py-2 pr-4">
                            <Badge variant="outline" className="font-mono text-[10px]">{p.format}</Badge>
                          </td>
                          <td className="py-2 pr-4">
                            <span className="font-mono text-[10px] text-muted-foreground">{p.version}</span>
                          </td>
                          <td className="py-2 pr-4">
                            <div className="flex gap-1">
                              {p.tags.map(t => (
                                <Badge key={t} variant="secondary" className="font-mono text-[9px] px-1.5 py-0">{t}</Badge>
                              ))}
                            </div>
                          </td>
                          <td className="py-2 pr-4">
                            <span className="font-mono text-[10px] text-muted-foreground">
                              {p.latencySamples > 0 ? `${p.latencySamples} smp` : "—"}
                            </span>
                          </td>
                          <td className="py-2 pr-4">
                            {p.quarantined ? (
                              <span className="font-mono text-[10px] text-destructive">● Quarantined</span>
                            ) : p.installed ? (
                              <span className="font-mono text-[10px] text-primary">● Installed</span>
                            ) : (
                              <span className="font-mono text-[10px] text-destructive">● Missing</span>
                            )}
                          </td>
                          <td className="py-2">
                            <Eye className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </ScrollArea>
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
}
