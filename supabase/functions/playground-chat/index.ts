import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    // Use service role to bypass RLS for reading inventory
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { messages } = await req.json();

    // Fetch user's inventory to give the AI full context
    const { data: inventory, error: invErr } = await supabase
      .from("inventory_items")
      .select("product, vendor, ecosystem, category, type, synthesis, sonic_role, sound_category, description, use_cases, keywords, specs")
      .order("vendor");

    if (invErr) throw invErr;

    const gearSummary = inventory.map((g: any) => {
      const parts = [`${g.vendor} ${g.product} (${g.ecosystem}/${g.category}/${g.type})`];
      if (g.synthesis) parts.push(`synthesis: ${g.synthesis}`);
      if (g.sonic_role) parts.push(`role: ${g.sonic_role}`);
      if (g.sound_category) parts.push(`sound: ${g.sound_category}`);
      if (g.description) parts.push(`desc: ${g.description}`);
      if (g.use_cases) parts.push(`uses: ${g.use_cases}`);
      if (g.keywords) parts.push(`tags: ${g.keywords}`);
      if (g.specs) {
        const s = g.specs;
        const specParts: string[] = [];
        if (s.keys) specParts.push(`${s.keys} keys`);
        if (s.polyphony) specParts.push(`poly: ${s.polyphony}`);
        if (s.audioIn || s.audioOut) specParts.push(`I/O: ${s.audioIn ?? 0}in/${s.audioOut ?? 0}out`);
        if (specParts.length) parts.push(`specs: ${specParts.join(", ")}`);
      }
      return `- ${parts.join(" | ")}`;
    }).join("\n");

    const systemPrompt = `You are Sound Lab, an expert music production advisor embedded in a studio gear management app with a visual patching canvas. You have deep knowledge of synthesis, signal processing, sound design, and music production workflows.

The user owns the following gear (${inventory.length} items):

${gearSummary}

## CONVERSATION STYLE — CRITICAL

You are concise. You speak in short sentences. No essays. No long paragraphs.

## CONVERSATION FLOW — CRITICAL

When a user asks for a signal chain, sound design help, or gear combination:

### Step 1: Ask SHORT questions, one round at a time
Ask 2-3 quick, punchy questions. One line each. No preamble. Examples:
- What genre/vibe?
- Hardware, software, or both?
- What role — bass, lead, pad, texture?
- Warm or cold? Aggressive or ethereal?
- Any reference artist?
- Simple chain or deep/layered?

Do NOT explain why you're asking. Just ask.

### Step 2: Follow up if needed
Based on answers, ask 1-2 more to narrow down. Stay short.

### Step 3: Confirm briefly
One sentence: "Got it — [summary]. Building it." Then go.

### Step 4: Deliver the chain
Keep the explanation tight — bullet points with specific settings, not paragraphs.
Then include the buildable code block:

\`\`\`signal-chain
Vendor Product 1 {Setting: Value, Setting2: Value2} -> Vendor Product 2 {Mode: Chorus, Rate: Slow} -> Vendor Product 3 {Drive: 9 o'clock, Mix: 40%}
\`\`\`

Each gear name can optionally have {key: value} settings in curly braces.
Names MUST match exact "Vendor Product" from the gear list.
Settings should be the specific knob/parameter recommendations you're making.
You can include multiple chains as separate blocks. Keep settings to 3-5 most important per node.

## GENERAL RULES
- ONLY reference gear the user owns. Never suggest gear they don't have.
- Be specific — exact product names, not categories.
- Bold gear names. Use → arrows in prose.
- SHORT responses. Every word must earn its place.
- The signal-chain code block triggers the canvas builder — always include it with a chain recommendation.`;


    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please wait a moment and try again." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits in Settings → Workspace → Usage." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", status, t);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("playground-chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
