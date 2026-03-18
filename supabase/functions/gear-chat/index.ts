import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, itemId, userId } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: 'messages array is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'LOVABLE_API_KEY not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return new Response(
        JSON.stringify({ error: 'Database configuration missing' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Load data in parallel: inventory items, digested manual texts, and conversation history
    const [itemsResult, manualsResult, historyResult] = await Promise.all([
      supabase
        .from('inventory_items')
        .select('id, vendor, product, category, type, ecosystem, description, notes, specs, use_cases, synthesis, sonic_role, sound_category, year_released, msrp, url, keywords'),
      supabase
        .from('manual_texts')
        .select('item_id, content, sections'),
      userId
        ? supabase
            .from('chat_messages')
            .select('role, content')
            .eq('user_id', userId)
            .order('created_at', { ascending: true })
            .limit(50)
        : Promise.resolve({ data: null, error: null }),
    ]);

    if (itemsResult.error) {
      console.error('DB error:', itemsResult.error);
      return new Response(
        JSON.stringify({ error: 'Failed to load inventory data' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const items = itemsResult.data || [];
    const manualTexts = manualsResult.data || [];
    const priorMessages = historyResult?.data || [];

    // Build a map of item_id -> manual digest
    const manualMap = new Map<string, { content: string; sections: any[] }>();
    for (const mt of manualTexts) {
      manualMap.set(mt.item_id, { content: mt.content, sections: mt.sections || [] });
    }

    // Build inventory context (compact)
    const inventoryContext = items.map(item => {
      const parts: string[] = [`## ${item.vendor} ${item.product}`];
      parts.push(`ID: ${item.id} | Category: ${item.category} | Type: ${item.type} | Ecosystem: ${item.ecosystem}`);
      if (item.description) parts.push(`Description: ${item.description}`);
      if (item.synthesis) parts.push(`Synthesis: ${item.synthesis}`);
      if (item.sonic_role) parts.push(`Character: ${item.sonic_role}`);
      if (item.use_cases) parts.push(`Use Cases: ${item.use_cases}`);
      if (item.year_released) parts.push(`Released: ${item.year_released}`);
      if (item.msrp) parts.push(`MSRP: ${item.msrp}`);

      const specs = item.specs as any;
      if (specs) {
        if (specs.custom && Array.isArray(specs.custom)) {
          const specStr = specs.custom.map((s: any) => `${s.label}: ${s.value}`).join(', ');
          if (specStr) parts.push(`Specs: ${specStr}`);
        }
        if (specs.manualUrl) parts.push(`Manual: Downloaded & digested`);
      }

      if (item.notes) parts.push(`Notes: ${item.notes}`);
      if (item.keywords) parts.push(`Keywords: ${item.keywords}`);

      // Append digested manual content if available
      const manual = manualMap.get(item.id);
      if (manual && manual.content) {
        parts.push(`\n### DIGESTED MANUAL CONTENT\n${manual.content}`);
      }

      return parts.join('\n');
    }).join('\n\n---\n\n');

    const manualCount = manualTexts.length;
    const itemCount = items.length;

    const systemPrompt = `You are an expert music gear assistant with encyclopedic knowledge of synthesizers, audio interfaces, effects processors, controllers, software instruments, and music production workflows.

You have deep, persistent knowledge of the user's complete gear inventory (${itemCount} items) and have fully digested ${manualCount} product manuals.

## RESPONSE STYLE — CRITICAL
- Keep answers SHORT and punchy. 2-4 sentences max for simple questions. Use bullet points, not paragraphs.
- For broad or ambiguous questions, ALWAYS start by asking 2-3 short clarifying questions (one line each, no preamble) to narrow down scope before giving a full answer.
- Only give detailed, long answers when the user's question is very specific and technical (e.g. "what MIDI CC controls the filter cutoff on the Peak?").
- Never over-explain. Be direct. Think studio engineer, not textbook.

## KNOWLEDGE
- Every control, parameter, and setting from digested manuals
- Signal flow and routing for each device
- How to connect and link different pieces of gear together
- MIDI, audio, CV, USB, and digital connectivity details
- Creative techniques, tips, and advanced features

When answering specific technical questions:
- Reference actual parameter names, value ranges, connector types, and menu paths
- When explaining connections, specify EXACTLY which outputs connect to which inputs
- Use markdown for readability

You have PERSISTENT MEMORY — you remember all previous conversations with this user.

=== GEAR INVENTORY & MANUAL KNOWLEDGE ===
${inventoryContext}`;

    console.log(`Gear chat: ${itemCount} items, ${manualCount} manuals digested, ${priorMessages.length} prior messages, context ~${systemPrompt.length} chars`);

    // Build full message history: prior persisted messages + current messages
    // Avoid duplicating the current messages if they're already in history
    const allMessages: { role: string; content: string }[] = [];

    // Add prior conversation history for persistent memory
    if (priorMessages.length > 0) {
      for (const pm of priorMessages) {
        allMessages.push({ role: pm.role, content: pm.content });
      }
    }

    // Add the current messages (these are the ones not yet persisted)
    // The client sends the full current session, so we use those directly
    // If we have prior messages, only add the latest user message to avoid duplication
    const currentMessages = messages as { role: string; content: string }[];
    
    if (priorMessages.length > 0 && currentMessages.length > 0) {
      // Only add the last user message (the new one)
      const lastMsg = currentMessages[currentMessages.length - 1];
      if (lastMsg) {
        allMessages.push(lastMsg);
      }
    } else {
      // No prior history, use all current messages
      allMessages.push(...currentMessages);
    }

    // Stream AI response
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          ...allMessages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please wait a moment and try again.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please add credits in Settings.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errText = await response.text();
      console.error('AI gateway error:', response.status, errText);
      return new Response(
        JSON.stringify({ error: 'AI service unavailable' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, 'Content-Type': 'text/event-stream' },
    });
  } catch (error) {
    console.error('Gear chat error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Chat failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
