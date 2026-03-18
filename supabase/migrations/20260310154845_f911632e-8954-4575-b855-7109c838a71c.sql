
-- Create inventory_items table
CREATE TABLE public.inventory_items (
  id TEXT PRIMARY KEY,
  ecosystem TEXT NOT NULL,
  category TEXT NOT NULL,
  vendor TEXT NOT NULL,
  product TEXT NOT NULL,
  type TEXT NOT NULL,
  synthesis TEXT,
  sonic_role TEXT,
  sound_category TEXT,
  rating INTEGER,
  description TEXT,
  use_cases TEXT,
  notes TEXT,
  year_released INTEGER,
  msrp TEXT,
  url TEXT,
  quantity INTEGER,
  serial_number TEXT,
  purchase_year INTEGER,
  purchase_price NUMERIC,
  location TEXT,
  specs JSONB,
  keywords TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;

-- Allow public read/write (no auth for this personal tool)
CREATE POLICY "Allow public read" ON public.inventory_items FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON public.inventory_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON public.inventory_items FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON public.inventory_items FOR DELETE USING (true);

-- Timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_inventory_items_updated_at
  BEFORE UPDATE ON public.inventory_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
