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

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { parsedProject, matchReport, renderMetrics } = await req.json();
    if (!parsedProject) throw new Error("Missing parsedProject data");

    // Fetch user's full inventory
    const { data: inventory } = await supabase
      .from("inventory_items")
      .select("product, vendor, ecosystem, category, type, synthesis, sonic_role, sound_category, description, use_cases, keywords")
      .order("vendor");

    const inventoryList = (inventory || [])
      .map((i: any) => `${i.vendor} ${i.product} (${i.ecosystem} / ${i.category} / ${i.type}${i.sonic_role ? ` — ${i.sonic_role}` : ""})`)
      .join("\n");

    // Build a summary of what's in the parsed project
    const trackSummaries = (parsedProject.tracks || []).map((t: any) => {
      const devices = (t.devices || []).map((d: any) => {
        let desc = d.name;
        if (d.presetName) desc += ` [preset: ${d.presetName}]`;
        if (d.pluginFormat) desc += ` (${d.pluginFormat})`;
        if (d.parameters?.length > 0) {
          const params = d.parameters.slice(0, 6).map((p: any) => `${p.name}=${p.value}`).join(", ");
          desc += ` {${params}}`;
        }
        return `    ${d.type === "instrument" ? "🎹" : "🔧"} ${desc}`;
      }).join("\n");
      return `  Track "${t.name}" (${t.type}):\n${devices}`;
    }).join("\n\n");

    const projectSummary = [
      `Tempo: ${parsedProject.tempo || "unknown"} BPM`,
      `Time Signature: ${parsedProject.timeSignature || "unknown"}`,
      `Key: ${parsedProject.key || "unknown"}`,
      `Tracks: ${parsedProject.trackCount}`,
      `\nPlugins used: ${(parsedProject.plugins || []).join(", ") || "none"}`,
      `Ableton devices used: ${(parsedProject.abletonDevices || []).join(", ") || "none"}`,
      `\n--- Track Details ---\n${trackSummaries}`,
    ].join("\n");

    // Build match context if available
    let matchContext = "";
    if (matchReport) {
      matchContext = `\n\n--- Plugin Match Results ---
Total devices: ${matchReport.totalDevices}
Available (installed): ${matchReport.available}
Alternatives (from inventory): ${matchReport.alternatives}
Missing: ${matchReport.missing}

Per-track matches:
${(matchReport.tracks || []).map((t: any) =>
  `  ${t.trackName}: ${(t.matches || []).map((m: any) =>
    `${m.deviceName} → ${m.status}${m.matchedTo ? ` (${m.matchedTo}, ${(m.confidence * 100).toFixed(0)}%)` : ""}`
  ).join(", ")}`
).join("\n")}`;
    }

    // Build render metrics context if available
    let renderContext = "";
    if (renderMetrics && Array.isArray(renderMetrics)) {
      renderContext = `\n\n--- Render Diagnostics ---
${renderMetrics.map((r: any) =>
  `  ${r.trackName}: peak=${r.peakAmplitude?.toFixed(3) || "?"}, rms=${r.rmsLevel?.toFixed(3) || "?"}, clipped=${r.clipped || false}, silent=${r.silentOutput || false}`
).join("\n")}`;
    }

    const systemPrompt = `You are a music production advisor analyzing an Ableton Live project. You have access to the user's complete gear inventory, a parsed breakdown of their project, plugin match results from their local system, and diagnostic render metrics.

Your job is to provide insightful, actionable analysis in these areas:

1. **Project Overview** — Brief creative read of the project: what genre/vibe it likely targets based on the instruments, effects, and settings used.

2. **Instrument & Effect Choices** — For each track, assess whether the choices are strong or if there's a better option available IN THE USER'S INVENTORY. Be specific: name the alternative and explain why it might work better (e.g. "Your inventory has Diva which would give you warmer analog-modeled pads compared to Serum here").

3. **Signal Chain Analysis** — Comment on the effect chains: are they well-structured? Missing anything common (e.g. no EQ before reverb, no compression on vocals)? Suggest improvements using gear from their inventory.

4. **Plugin Availability** — If match results are provided, comment on missing plugins and suggest replacements from the user's available gear. Prioritize alternatives that are actually installed on their system.

5. **Render Diagnostics** — If render metrics are provided, flag any tracks with clipping, silence, or unusual levels. Suggest fixes.

6. **Unused Potential** — Highlight gear from the user's inventory that would be a great fit for this project but isn't being used. Focus on surprising or creative suggestions, not obvious ones.

7. **Settings Feedback** — Where you can see parameter values, comment on whether they seem reasonable or could be improved (e.g. "Reverb decay of 8s is very long for this tempo — consider 2-3s for tighter mix").

Keep it conversational but knowledgeable. Use markdown formatting. Be direct — don't hedge everything. If something is a questionable choice, say so.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `Here is my full gear inventory:\n\n${inventoryList}\n\n---\n\nHere is the Ableton project I want analyzed:\n\n${projectSummary}${matchContext}${renderContext}`,
          },
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded, please try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI analysis failed" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("analyze-project error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
