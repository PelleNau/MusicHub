
-- Store digested manual text per inventory item
CREATE TABLE public.manual_texts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id text NOT NULL REFERENCES public.inventory_items(id) ON DELETE CASCADE,
  content text NOT NULL,
  source_url text,
  sections jsonb DEFAULT '[]',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(item_id)
);

ALTER TABLE public.manual_texts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read manual_texts"
ON public.manual_texts FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert manual_texts"
ON public.manual_texts FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update manual_texts"
ON public.manual_texts FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete manual_texts"
ON public.manual_texts FOR DELETE TO authenticated USING (true);

-- Persistent chat messages
CREATE TABLE public.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  item_context text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own messages"
ON public.chat_messages FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own messages"
ON public.chat_messages FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own messages"
ON public.chat_messages FOR DELETE TO authenticated
USING (auth.uid() = user_id);

-- Index for fast message loading
CREATE INDEX idx_chat_messages_user_created ON public.chat_messages(user_id, created_at);

-- Trigger for manual_texts updated_at
CREATE TRIGGER update_manual_texts_updated_at
  BEFORE UPDATE ON public.manual_texts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
