
-- Drop old permissive public policies
DROP POLICY IF EXISTS "Allow public read" ON public.inventory_items;
DROP POLICY IF EXISTS "Allow public insert" ON public.inventory_items;
DROP POLICY IF EXISTS "Allow public update" ON public.inventory_items;
DROP POLICY IF EXISTS "Allow public delete" ON public.inventory_items;

-- Create authenticated-only policies
CREATE POLICY "Authenticated users can read" ON public.inventory_items
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert" ON public.inventory_items
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update" ON public.inventory_items
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete" ON public.inventory_items
  FOR DELETE TO authenticated USING (true);
