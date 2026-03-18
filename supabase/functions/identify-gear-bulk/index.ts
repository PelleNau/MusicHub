import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const { text, imageBase64 } = await req.json();

    if (!text && !imageBase64) {
      return new Response(
        JSON.stringify({ error: "Provide text or an image" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const systemPrompt = `You are a music gear identification expert. You are looking at a screenshot or text from a software library manager (like Native Access, Reason Companion, Ableton's library, or similar). Your job is to identify ALL products/instruments/effects visible and return structured data for each one.

Look for product names, plugin names, instrument names, expansion packs, effects, and any other music production tools visible.

You MUST call the identify_gear_bulk tool with ALL items you can identify. Be thorough — capture everything visible.`;

    const userContent: any[] = [];
    if (text) {
      userContent.push({ type: "text", text: `Identify ALL music gear/software products from this:\n\n${text}` });
    }
    if (imageBase64) {
      userContent.push({
        type: "image_url",
        image_url: { url: imageBase64.startsWith("data:") ? imageBase64 : `data:image/jpeg;base64,${imageBase64}` },
      });
      if (!text) {
        userContent.push({ type: "text", text: "Identify ALL music gear/software products visible in this screenshot. This is likely from a library manager like Native Access, Reason Companion, or similar." });
      }
    }

    const body = {
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContent },
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "identify_gear_bulk",
            description: "Return structured data about ALL identified music gear/software products.",
            parameters: {
              type: "object",
              properties: {
                items: {
                  type: "array",
                  description: "Array of all identified gear items",
                  items: {
                    type: "object",
                    properties: {
                      ecosystem: {
                        type: "string",
                        enum: ["Hardware", "NI", "Kontakt", "Reaktor", "Reason", "Ableton"],
                        description: "Platform/ecosystem.",
                      },
                      category: { type: "string", description: "e.g. Synth, FX, Drum Machine, Controller, Library" },
                      vendor: { type: "string", description: "Manufacturer name" },
                      product: { type: "string", description: "Product/model name" },
                      type: { type: "string", description: "e.g. Virtual analog synth, Sample library, Effect plugin" },
                      synthesis: { type: "string", description: "Synthesis type if applicable" },
                      sonicRole: { type: "string", description: "Role in a studio setup" },
                      soundCategory: { type: "string", description: "e.g. Lead, Bass, Pad, FX, Keys, Drums" },
                      description: { type: "string", description: "Brief description" },
                      useCases: { type: "string", description: "Comma-separated use cases" },
                      yearReleased: { type: "number", description: "Year of release if known" },
                      msrp: { type: "string", description: "Retail price if known" },
                      keywords: { type: "string", description: "Space-separated keywords" },
                    },
                    required: ["ecosystem", "category", "vendor", "product", "type"],
                  },
                },
                source: {
                  type: "string",
                  description: "Detected source application (e.g. 'Native Access', 'Reason Companion', 'Ableton Library', 'Unknown')",
                },
              },
              required: ["items"],
              additionalProperties: false,
            },
          },
        },
      ],
      tool_choice: { type: "function", function: { name: "identify_gear_bulk" } },
    };

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded, please try again." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall) {
      throw new Error("AI did not return structured data");
    }

    const result = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify({ success: true, items: result.items || [], source: result.source || "Unknown" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("identify-gear-bulk error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
