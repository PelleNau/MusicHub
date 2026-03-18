import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { InventoryItem, HardwareSpecs } from "@/types/inventory";
import { inventoryData } from "@/data/inventory";
import { toast } from "sonner";
import type { Json } from "@/integrations/supabase/types";

type DbRow = {
  id: string;
  ecosystem: string;
  category: string;
  vendor: string;
  product: string;
  type: string;
  synthesis: string | null;
  sonic_role: string | null;
  sound_category: string | null;
  rating: number | null;
  description: string | null;
  use_cases: string | null;
  notes: string | null;
  year_released: number | null;
  msrp: string | null;
  url: string | null;
  quantity: number | null;
  serial_number: string | null;
  purchase_year: number | null;
  purchase_price: number | null;
  location: string | null;
  specs: unknown;
  keywords: string | null;
  image_url: string | null;
};

function rowToItem(row: DbRow): InventoryItem {
  return {
    id: row.id,
    ecosystem: row.ecosystem as InventoryItem["ecosystem"],
    category: row.category,
    vendor: row.vendor,
    product: row.product,
    type: row.type,
    synthesis: row.synthesis ?? undefined,
    sonicRole: row.sonic_role ?? undefined,
    soundCategory: row.sound_category ?? undefined,
    rating: row.rating ?? undefined,
    description: row.description ?? undefined,
    useCases: row.use_cases ?? undefined,
    notes: row.notes ?? undefined,
    yearReleased: row.year_released ?? undefined,
    msrp: row.msrp ?? undefined,
    url: row.url ?? undefined,
    quantity: row.quantity ?? undefined,
    serialNumber: row.serial_number ?? undefined,
    purchaseYear: row.purchase_year ?? undefined,
    purchasePrice: row.purchase_price ?? undefined,
    location: row.location ?? undefined,
    specs: row.specs as HardwareSpecs | undefined,
    keywords: row.keywords ?? undefined,
    imageUrl: row.image_url ?? undefined,
  };
}

function itemToRow(item: InventoryItem) {
  return {
    id: item.id,
    ecosystem: item.ecosystem,
    category: item.category,
    vendor: item.vendor,
    product: item.product,
    type: item.type,
    synthesis: item.synthesis ?? null,
    sonic_role: item.sonicRole ?? null,
    sound_category: item.soundCategory ?? null,
    rating: item.rating ?? null,
    description: item.description ?? null,
    use_cases: item.useCases ?? null,
    notes: item.notes ?? null,
    year_released: item.yearReleased ?? null,
    msrp: item.msrp ?? null,
    url: item.url ?? null,
    quantity: item.quantity ?? null,
    serial_number: item.serialNumber ?? null,
    purchase_year: item.purchaseYear ?? null,
    purchase_price: item.purchasePrice ?? null,
    location: item.location ?? null,
    specs: item.specs ? (item.specs as unknown as Json) : null,
    keywords: item.keywords ?? null,
    image_url: item.imageUrl ?? null,
  };
}

async function seedIfEmpty() {
  const { count, error } = await supabase
    .from("inventory_items")
    .select("*", { count: "exact", head: true });
  
  if (error) throw error;
  if (count && count > 0) return;

  // Seed in batches of 50
  const rows = inventoryData.map(itemToRow);
  for (let i = 0; i < rows.length; i += 50) {
    const batch = rows.slice(i, i + 50);
    const { error: insertError } = await supabase
      .from("inventory_items")
      .insert(batch);
    if (insertError) throw insertError;
  }
}

async function fetchInventory(): Promise<InventoryItem[]> {
  await seedIfEmpty();
  const { data, error } = await supabase
    .from("inventory_items")
    .select("*")
    .order("id");
  if (error) throw error;
  return (data as DbRow[]).map(rowToItem);
}

export function useInventory() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["inventory"],
    queryFn: fetchInventory,
  });

  const addItem = useMutation({
    mutationFn: async (item: InventoryItem) => {
      const row = itemToRow(item);
      const { error } = await supabase
        .from("inventory_items")
        .insert([row]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      toast.success("Item added");
    },
    onError: (e) => toast.error("Failed to add: " + e.message),
  });

  const updateItem = useMutation({
    mutationFn: async (item: InventoryItem) => {
      const { error } = await supabase
        .from("inventory_items")
        .update(itemToRow(item))
        .eq("id", item.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      toast.success("Item updated");
    },
    onError: (e) => toast.error("Failed to update: " + e.message),
  });

  const deleteItem = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("inventory_items")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      toast.success("Item deleted");
    },
    onError: (e) => toast.error("Failed to delete: " + e.message),
  });

  return {
    items: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    addItem,
    updateItem,
    deleteItem,
  };
}
