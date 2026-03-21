import { useState, useCallback } from "react";
import { InventoryItem } from "@/types/inventory";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

/**
 * Handles batch image finding for inventory items without images.
 */
export function useBatchImages(inventoryData: InventoryItem[]) {
  const queryClient = useQueryClient();
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);

  const findAllImages = useCallback(async () => {
    const missing = inventoryData.filter((i) => !i.imageUrl);
    if (missing.length === 0) {
      toast.info("All items already have images");
      return;
    }

    setProgress({ done: 0, total: missing.length });
    let found = 0;

    for (let i = 0; i < missing.length; i++) {
      const item = missing[i];
      try {
        const { data, error } = await supabase.functions.invoke("find-product-image", {
          body: { url: item.url, vendor: item.vendor, product: item.product },
        });
        if (!error && data?.success && data?.imageUrl) {
          await supabase.from("inventory_items").update({ image_url: data.imageUrl }).eq("id", item.id);
          found++;
        }
      } catch {
        // Ignore per-item failures and continue the batch.
      }
      setProgress({ done: i + 1, total: missing.length });
      if (i < missing.length - 1) await new Promise((r) => setTimeout(r, 500));
    }

    setProgress(null);
    queryClient.invalidateQueries({ queryKey: ["inventory"] });
    toast.success(`Found images for ${found} of ${missing.length} items`);
  }, [inventoryData, queryClient]);

  return { progress, findAllImages } as const;
}
