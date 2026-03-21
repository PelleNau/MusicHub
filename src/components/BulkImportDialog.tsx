import { useState, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { InventoryItem } from "@/types/inventory";
import {
  Loader2, Sparkles, Upload, Check, Package, AlertCircle,
  ArrowRight, ArrowLeft, Camera, Monitor, ChevronRight,
  CheckCircle2, Circle,
} from "lucide-react";
import { toast } from "sonner";

interface BulkGearItem {
  ecosystem: string;
  category: string;
  vendor: string;
  product: string;
  type: string;
  synthesis?: string;
  sonicRole?: string;
  soundCategory?: string;
  description?: string;
  useCases?: string;
  yearReleased?: number;
  msrp?: string;
  keywords?: string;
}

interface BulkImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (items: InventoryItem[]) => void;
  existingProducts: string[];
}

type LibrarySource = "native-access" | "reason-companion" | "ableton" | "other";
type WizardStep = "choose-source" | "instructions" | "upload" | "review";

const SOURCE_INFO: Record<LibrarySource, {
  label: string;
  icon: string;
  ecosystem: string;
  steps: string[];
}> = {
  "native-access": {
    label: "Native Access",
    icon: "NI",
    ecosystem: "NI / Kontakt / Reaktor",
    steps: [
      "Open Native Access on your computer",
      "Go to the \"Installed\" or \"Products\" tab",
      "Scroll to show the products you want to import",
      "Take a screenshot (Cmd+Shift+4 on Mac, Win+Shift+S on Windows)",
      "Paste or drop the screenshot here",
    ],
  },
  "reason-companion": {
    label: "Reason Companion",
    icon: "RE",
    ecosystem: "Reason",
    steps: [
      "Open Reason Companion on your computer",
      "Navigate to your installed instruments & effects",
      "Make sure product names are visible",
      "Take a screenshot (Cmd+Shift+4 on Mac, Win+Shift+S on Windows)",
      "Paste or drop the screenshot here",
    ],
  },
  "ableton": {
    label: "Ableton Live",
    icon: "AB",
    ecosystem: "Ableton",
    steps: [
      "Open Ableton Live",
      "Open the Browser panel (Cmd/Ctrl+Alt+B)",
      "Expand \"Packs\" or \"Instruments\" / \"Audio Effects\"",
      "Take a screenshot showing the items you want to import",
      "Paste or drop the screenshot here",
    ],
  },
  "other": {
    label: "Other Library Manager",
    icon: "···",
    ecosystem: "Auto-detected",
    steps: [
      "Open your plugin manager or DAW browser",
      "Navigate to your installed products",
      "Take a screenshot showing product names clearly",
      "Paste or drop the screenshot here",
    ],
  },
};

const STEP_LABELS: Record<WizardStep, string> = {
  "choose-source": "Choose Source",
  "instructions": "How To",
  "upload": "Scan",
  "review": "Review & Import",
};

const WIZARD_STEPS: WizardStep[] = ["choose-source", "instructions", "upload", "review"];

export function BulkImportDialog({ open, onOpenChange, onImport, existingProducts }: BulkImportDialogProps) {
  const [wizardStep, setWizardStep] = useState<WizardStep>("choose-source");
  const [selectedSource, setSelectedSource] = useState<LibrarySource | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [detectedItems, setDetectedItems] = useState<BulkGearItem[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
  const [source, setSource] = useState<string>("Unknown");
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setWizardStep("choose-source");
    setSelectedSource(null);
    setDetectedItems([]);
    setSelectedIndices(new Set());
    setSource("Unknown");
    setError(null);
    setIsScanning(false);
  }, []);

  const handleClose = (val: boolean) => {
    if (!val) reset();
    onOpenChange(val);
  };

  const currentStepIndex = WIZARD_STEPS.indexOf(wizardStep);

  const scan = useCallback(async ({ text, imageBase64 }: { text?: string; imageBase64?: string }) => {
    setIsScanning(true);
    setError(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("identify-gear-bulk", {
        body: { text, imageBase64 },
      });
      if (fnError) throw fnError;
      if (data?.error) throw new Error(data.error);
      const items: BulkGearItem[] = data?.items || [];
      if (items.length === 0) {
        setError("No products detected. Try a clearer screenshot or a larger visible area.");
        return;
      }
      setDetectedItems(items);
      setSource(data?.source || selectedSource ? SOURCE_INFO[selectedSource!]?.label : "Unknown");
      const existingLower = new Set(existingProducts.map(p => p.toLowerCase()));
      const preSelected = new Set<number>();
      items.forEach((item, i) => {
        if (!existingLower.has(item.product.toLowerCase())) preSelected.add(i);
      });
      setSelectedIndices(preSelected);
      setWizardStep("review");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to scan library");
    } finally {
      setIsScanning(false);
    }
  }, [existingProducts, selectedSource]);

  const readFile = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      if (file.type.startsWith("image/")) reader.readAsDataURL(file);
      else reader.readAsText(file);
    });

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedText = e.dataTransfer.getData("text/plain");
    if (droppedText?.trim()) { await scan({ text: droppedText.trim() }); return; }
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    const content = await readFile(file);
    if (file.type.startsWith("image/")) await scan({ imageBase64: content });
    else await scan({ text: content });
  }, [scan]);

  const handlePaste = useCallback(async (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of Array.from(items)) {
      if (item.type.startsWith("image/")) {
        e.preventDefault();
        const file = item.getAsFile();
        if (!file) continue;
        const content = await readFile(file);
        await scan({ imageBase64: content });
        return;
      }
    }
    const text = e.clipboardData.getData("text/plain");
    if (text?.trim()) { e.preventDefault(); await scan({ text: text.trim() }); }
  }, [scan]);

  const handleFileInput = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const content = await readFile(file);
    if (file.type.startsWith("image/")) await scan({ imageBase64: content });
    else await scan({ text: content });
    e.target.value = "";
  }, [scan]);

  const toggleItem = (index: number) => {
    setSelectedIndices(prev => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedIndices.size === detectedItems.length) setSelectedIndices(new Set());
    else setSelectedIndices(new Set(detectedItems.map((_, i) => i)));
  };

  const handleImport = async () => {
    const toImport = detectedItems.filter((_, i) => selectedIndices.has(i));
    if (toImport.length === 0) return;
    setIsImporting(true);
    const inventoryItems: InventoryItem[] = toImport.map(item => ({
      id: crypto.randomUUID(),
      ecosystem: item.ecosystem as InventoryItem["ecosystem"],
      category: item.category,
      vendor: item.vendor,
      product: item.product,
      type: item.type,
      synthesis: item.synthesis,
      sonicRole: item.sonicRole,
      soundCategory: item.soundCategory,
      description: item.description,
      useCases: item.useCases,
      yearReleased: item.yearReleased,
      msrp: item.msrp,
      keywords: item.keywords,
    }));
    onImport(inventoryItems);
    setIsImporting(false);
    toast.success(`Imported ${inventoryItems.length} items`);
    handleClose(false);
  };

  const existingLower = new Set(existingProducts.map(p => p.toLowerCase()));
  const duplicateCount = detectedItems.filter(item => existingLower.has(item.product.toLowerCase())).length;

  const ecosystemColor = (eco: string) => {
    const map: Record<string, string> = {
      Hardware: "bg-chart-1/20 text-chart-1",
      NI: "bg-chart-2/20 text-chart-2",
      Kontakt: "bg-chart-3/20 text-chart-3",
      Reaktor: "bg-chart-4/20 text-chart-4",
      Reason: "bg-chart-5/20 text-chart-5",
      Ableton: "bg-primary/20 text-primary",
    };
    return map[eco] || "bg-muted text-muted-foreground";
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col gap-0">
        <DialogHeader className="pb-4">
          <DialogTitle className="font-mono flex items-center gap-2">
            <Package className="h-4 w-4" />
            Import Library
          </DialogTitle>
          <DialogDescription className="font-mono text-xs">
            Scan your software library and bulk-add everything to your inventory
          </DialogDescription>
        </DialogHeader>

        {/* Wizard progress */}
        <div className="flex items-center gap-1 pb-5 px-1">
          {WIZARD_STEPS.map((s, i) => {
            const isCompleted = i < currentStepIndex;
            const isCurrent = s === wizardStep;
            return (
              <div key={s} className="flex items-center gap-1 flex-1">
                <div className="flex items-center gap-1.5 min-w-0">
                  {isCompleted ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
                  ) : (
                    <Circle className={`h-3.5 w-3.5 shrink-0 ${isCurrent ? "text-primary" : "text-muted-foreground/40"}`} />
                  )}
                  <span className={`font-mono text-[10px] truncate ${isCurrent ? "text-foreground font-medium" : isCompleted ? "text-primary" : "text-muted-foreground/50"}`}>
                    {STEP_LABELS[s]}
                  </span>
                </div>
                {i < WIZARD_STEPS.length - 1 && (
                  <ChevronRight className="h-3 w-3 text-muted-foreground/30 shrink-0 ml-auto" />
                )}
              </div>
            );
          })}
        </div>

        {/* Step 1: Choose Source */}
        {wizardStep === "choose-source" && (
          <div className="space-y-3">
            <p className="font-mono text-xs text-muted-foreground">Where do you want to import from?</p>
            <div className="grid grid-cols-2 gap-3">
              {(Object.entries(SOURCE_INFO) as [LibrarySource, typeof SOURCE_INFO[LibrarySource]][]).map(([key, info]) => (
                <button
                  key={key}
                  onClick={() => { setSelectedSource(key); setWizardStep("instructions"); }}
                  className={`group relative flex flex-col items-start gap-2 rounded-lg border p-4 text-left transition-all hover:border-primary/50 hover:bg-primary/5 ${
                    selectedSource === key ? "border-primary bg-primary/5" : "border-border"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                      {info.icon}
                    </span>
                    <span className="font-mono text-sm font-medium text-foreground">{info.label}</span>
                  </div>
                  <span className="font-mono text-[10px] text-muted-foreground">
                    {info.ecosystem}
                  </span>
                  <ArrowRight className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/30 group-hover:text-primary transition-colors" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Instructions */}
        {wizardStep === "instructions" && selectedSource && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-1">
              <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                {SOURCE_INFO[selectedSource].icon}
              </span>
              <span className="font-mono text-sm font-medium">{SOURCE_INFO[selectedSource].label}</span>
            </div>

            <div className="space-y-1">
              {SOURCE_INFO[selectedSource].steps.map((step, i) => {
                const isScreenshotStep = step.toLowerCase().includes("screenshot");
                const isPasteStep = step.toLowerCase().includes("paste") || step.toLowerCase().includes("drop");
                return (
                  <div key={i} className="flex items-start gap-3 py-2">
                    <span className={`font-mono text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center shrink-0 mt-0.5 ${
                      isScreenshotStep ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    }`}>
                      {i + 1}
                    </span>
                    <div className="flex items-center gap-2">
                      {isScreenshotStep && <Camera className="h-3.5 w-3.5 text-primary shrink-0" />}
                      {isPasteStep && <Monitor className="h-3.5 w-3.5 text-primary shrink-0" />}
                      <span className={`font-mono text-xs ${isScreenshotStep || isPasteStep ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                        {step}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="rounded-md bg-secondary/50 border border-border p-3">
              <p className="font-mono text-[10px] text-muted-foreground leading-relaxed">
                <span className="text-primary font-medium">Tip:</span> For best results, make sure product names are clearly visible. 
                You can take multiple screenshots and import them one at a time. 
                The AI will detect all visible products automatically.
              </p>
            </div>

            <div className="flex items-center justify-between pt-2">
              <Button variant="ghost" size="sm" onClick={() => setWizardStep("choose-source")} className="font-mono text-xs gap-1.5">
                <ArrowLeft className="h-3.5 w-3.5" />
                Back
              </Button>
              <Button size="sm" onClick={() => setWizardStep("upload")} className="font-mono text-xs gap-1.5">
                I'm Ready
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Upload / Scan */}
        {wizardStep === "upload" && (
          <div className="space-y-4">
            <div
              className={`relative border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors ${
                isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"
              }`}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onPaste={handlePaste}
              tabIndex={0}
            >
              <input
                type="file"
                accept="image/*,.txt,.csv"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={handleFileInput}
                disabled={isScanning}
              />

              {isScanning ? (
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="font-mono text-sm text-muted-foreground">Scanning for products…</span>
                  <span className="font-mono text-[10px] text-muted-foreground/60">This may take a moment for large screenshots</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-6 w-6 text-primary" />
                    <Upload className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-mono text-sm text-foreground">
                      Drop your {selectedSource ? SOURCE_INFO[selectedSource].label : "library"} screenshot here
                    </p>
                    <p className="font-mono text-[11px] text-muted-foreground mt-1">
                      The AI will identify every product visible in the image
                    </p>
                  </div>
                  <p className="font-mono text-[10px] text-muted-foreground/60">
                    click to browse · drag & drop · Cmd/Ctrl+V to paste
                  </p>
                </div>
              )}

              {error && (
                <div className="flex items-center gap-2 mt-4 text-destructive justify-center">
                  <AlertCircle className="h-4 w-4" />
                  <p className="font-mono text-xs">{error}</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between">
              <Button variant="ghost" size="sm" onClick={() => setWizardStep("instructions")} className="font-mono text-xs gap-1.5">
                <ArrowLeft className="h-3.5 w-3.5" />
                Back
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Review */}
        {wizardStep === "review" && (
          <>
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs text-muted-foreground">
                  Detected from: <span className="text-foreground">{source}</span>
                </span>
                <span className="font-mono text-xs text-muted-foreground">
                  {detectedItems.length} items found
                </span>
                {duplicateCount > 0 && (
                  <span className="font-mono text-[10px] text-muted-foreground/60">
                    ({duplicateCount} already in inventory)
                  </span>
                )}
              </div>
              <Button variant="ghost" size="sm" onClick={toggleAll} className="font-mono text-xs">
                {selectedIndices.size === detectedItems.length ? "Deselect All" : "Select All"}
              </Button>
            </div>

            <ScrollArea className="flex-1 max-h-[45vh] border rounded-md">
              <div className="divide-y divide-border">
                {detectedItems.map((item, i) => {
                  const isDuplicate = existingLower.has(item.product.toLowerCase());
                  return (
                    <label
                      key={i}
                      className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-secondary/50 transition-colors ${
                        isDuplicate ? "opacity-50" : ""
                      }`}
                    >
                      <Checkbox
                        checked={selectedIndices.has(i)}
                        onCheckedChange={() => toggleItem(i)}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-medium truncate">{item.product}</span>
                          {isDuplicate && (
                            <span className="font-mono text-[9px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                              ALREADY IN INVENTORY
                            </span>
                          )}
                        </div>
                        <span className="font-mono text-[11px] text-muted-foreground">
                          {item.vendor} · {item.type}
                        </span>
                      </div>
                      <Badge variant="secondary" className={`font-mono text-[10px] ${ecosystemColor(item.ecosystem)}`}>
                        {item.ecosystem}
                      </Badge>
                    </label>
                  );
                })}
              </div>
            </ScrollArea>

            <div className="flex items-center justify-between pt-3">
              <Button variant="outline" size="sm" onClick={() => { setDetectedItems([]); setWizardStep("upload"); setError(null); }} className="font-mono text-xs">
                Scan Another
              </Button>
              <Button
                size="sm"
                onClick={handleImport}
                disabled={selectedIndices.size === 0 || isImporting}
                className="font-mono text-xs gap-1.5"
              >
                {isImporting ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Check className="h-3.5 w-3.5" />
                )}
                Import {selectedIndices.size} Items
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
