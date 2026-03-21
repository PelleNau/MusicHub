import { useState, useEffect, useCallback } from "react";
import { InventoryItem, Ecosystem } from "@/types/inventory";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AiDropZone } from "@/components/AiDropZone";

const ECOSYSTEMS: Ecosystem[] = ["Hardware", "NI", "Kontakt", "Reaktor", "Reason", "Ableton"];

const EMPTY_ITEM: Partial<InventoryItem> = {
  ecosystem: "Hardware",
  category: "",
  vendor: "",
  product: "",
  type: "",
};

interface InventoryFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: InventoryItem | null;
  onSave: (item: InventoryItem) => void;
  isSaving?: boolean;
}

function generateId(ecosystem: string): string {
  const prefix = ecosystem === "Hardware" ? "HW" : ecosystem.substring(0, 3).toUpperCase();
  return `${prefix}-${Date.now().toString(36).toUpperCase()}`;
}

export function InventoryFormDialog({ open, onOpenChange, item, onSave, isSaving }: InventoryFormDialogProps) {
  const isEdit = !!item;
  const [form, setForm] = useState<Partial<InventoryItem>>(EMPTY_ITEM);

  useEffect(() => {
    if (open) {
      setForm(item ? { ...item } : { ...EMPTY_ITEM });
    }
  }, [open, item]);

  const set = (field: keyof InventoryItem, value: unknown) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleAiIdentified = useCallback((gear: Partial<InventoryItem>) => {
    setForm((prev) => ({
      ...prev,
      ecosystem: gear.ecosystem || prev.ecosystem,
      category: gear.category || prev.category,
      vendor: gear.vendor || prev.vendor,
      product: gear.product || prev.product,
      type: gear.type || prev.type,
      synthesis: gear.synthesis || prev.synthesis,
      sonicRole: gear.sonicRole || prev.sonicRole,
      soundCategory: gear.soundCategory || prev.soundCategory,
      description: gear.description || prev.description,
      useCases: gear.useCases || prev.useCases,
      yearReleased: gear.yearReleased || prev.yearReleased,
      msrp: gear.msrp || prev.msrp,
      keywords: gear.keywords || prev.keywords,
    }));
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.vendor || !form.product || !form.type || !form.category) return;

    const finalItem: InventoryItem = {
      id: form.id || generateId(form.ecosystem || "Hardware"),
      ecosystem: (form.ecosystem || "Hardware") as Ecosystem,
      category: form.category!,
      vendor: form.vendor!,
      product: form.product!,
      type: form.type!,
      synthesis: form.synthesis || undefined,
      sonicRole: form.sonicRole || undefined,
      soundCategory: form.soundCategory || undefined,
      description: form.description || undefined,
      useCases: form.useCases || undefined,
      notes: form.notes || undefined,
      yearReleased: form.yearReleased || undefined,
      msrp: form.msrp || undefined,
      url: form.url || undefined,
      quantity: form.quantity || undefined,
      serialNumber: form.serialNumber || undefined,
      purchaseYear: form.purchaseYear || undefined,
      purchasePrice: form.purchasePrice || undefined,
      location: form.location || undefined,
      keywords: form.keywords || undefined,
      imageUrl: form.imageUrl || undefined,
    };

    onSave(finalItem);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="font-mono text-lg">
            {isEdit ? "Edit Item" : "Add New Item"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <ScrollArea className="max-h-[65vh] px-6">
            <div className="space-y-5 pb-4">
              {/* AI Drop Zone - only show for new items */}
              {!isEdit && (
                <AiDropZone onIdentified={handleAiIdentified} />
              )}

              {/* Core fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-mono text-xs">Ecosystem *</Label>
                  <Select
                    value={form.ecosystem || "Hardware"}
                    onValueChange={(v) => set("ecosystem", v)}
                  >
                    <SelectTrigger className="font-mono text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ECOSYSTEMS.map((e) => (
                        <SelectItem key={e} value={e} className="font-mono text-sm">{e}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="font-mono text-xs">Category *</Label>
                  <Input
                    value={form.category || ""}
                    onChange={(e) => set("category", e.target.value)}
                    placeholder="e.g. Synth, FX, Library"
                    className="font-mono text-sm"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-mono text-xs">Vendor *</Label>
                  <Input
                    value={form.vendor || ""}
                    onChange={(e) => set("vendor", e.target.value)}
                    placeholder="e.g. Sequential, Ableton"
                    className="font-mono text-sm"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-mono text-xs">Product *</Label>
                  <Input
                    value={form.product || ""}
                    onChange={(e) => set("product", e.target.value)}
                    placeholder="Product name"
                    className="font-mono text-sm"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-mono text-xs">Type *</Label>
                  <Input
                    value={form.type || ""}
                    onChange={(e) => set("type", e.target.value)}
                    placeholder="e.g. Analog poly synth"
                    className="font-mono text-sm"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-mono text-xs">Synthesis</Label>
                  <Input
                    value={form.synthesis || ""}
                    onChange={(e) => set("synthesis", e.target.value)}
                    placeholder="e.g. Analog subtractive"
                    className="font-mono text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-mono text-xs">Sonic Role</Label>
                  <Input
                    value={form.sonicRole || ""}
                    onChange={(e) => set("sonicRole", e.target.value)}
                    placeholder="e.g. Main reverb"
                    className="font-mono text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-mono text-xs">Sound Category</Label>
                  <Input
                    value={form.soundCategory || ""}
                    onChange={(e) => set("soundCategory", e.target.value)}
                    placeholder="e.g. Pad, Lead, FX"
                    className="font-mono text-sm"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label className="font-mono text-xs">Description</Label>
                <Textarea
                  value={form.description || ""}
                  onChange={(e) => set("description", e.target.value)}
                  placeholder="Describe this item..."
                  className="font-mono text-sm min-h-[80px]"
                />
              </div>

              <div className="space-y-2">
                <Label className="font-mono text-xs">Use Cases</Label>
                <Input
                  value={form.useCases || ""}
                  onChange={(e) => set("useCases", e.target.value)}
                  placeholder="Comma-separated use cases"
                  className="font-mono text-sm"
                />
              </div>

              {/* Metadata */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="font-mono text-xs">Year Released</Label>
                  <Input
                    type="number"
                    value={form.yearReleased || ""}
                    onChange={(e) => set("yearReleased", e.target.value ? Number(e.target.value) : undefined)}
                    className="font-mono text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-mono text-xs">MSRP</Label>
                  <Input
                    value={form.msrp || ""}
                    onChange={(e) => set("msrp", e.target.value)}
                    placeholder="e.g. $1,499"
                    className="font-mono text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-mono text-xs">URL</Label>
                  <Input
                    value={form.url || ""}
                    onChange={(e) => set("url", e.target.value)}
                    placeholder="https://..."
                    className="font-mono text-sm"
                  />
                </div>
              </div>

              {/* Hardware-specific */}
              {(form.ecosystem === "Hardware") && (
                <div className="grid grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label className="font-mono text-xs">Quantity</Label>
                    <Input
                      type="number"
                      value={form.quantity || ""}
                      onChange={(e) => set("quantity", e.target.value ? Number(e.target.value) : undefined)}
                      className="font-mono text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-mono text-xs">Serial #</Label>
                    <Input
                      value={form.serialNumber || ""}
                      onChange={(e) => set("serialNumber", e.target.value)}
                      className="font-mono text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-mono text-xs">Purchase Year</Label>
                    <Input
                      type="number"
                      value={form.purchaseYear || ""}
                      onChange={(e) => set("purchaseYear", e.target.value ? Number(e.target.value) : undefined)}
                      className="font-mono text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-mono text-xs">Location</Label>
                    <Input
                      value={form.location || ""}
                      onChange={(e) => set("location", e.target.value)}
                      className="font-mono text-sm"
                    />
                  </div>
                </div>
              )}

              {/* Notes & Keywords */}
              <div className="space-y-2">
                <Label className="font-mono text-xs">Notes</Label>
                <Textarea
                  value={form.notes || ""}
                  onChange={(e) => set("notes", e.target.value)}
                  className="font-mono text-sm min-h-[60px]"
                />
              </div>
              <div className="space-y-2">
                <Label className="font-mono text-xs">Keywords</Label>
                <Input
                  value={form.keywords || ""}
                  onChange={(e) => set("keywords", e.target.value)}
                  placeholder="Space-separated keywords"
                  className="font-mono text-sm"
                />
              </div>
            </div>
          </ScrollArea>

          <DialogFooter className="px-6 py-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="font-mono text-xs">
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving} className="font-mono text-xs">
              {isSaving ? "Saving..." : isEdit ? "Save Changes" : "Add Item"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
