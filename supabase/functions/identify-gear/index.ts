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

    const systemPrompt = `You are a music gear identification expert. Given text or an image describing musical equipment (synthesizers, effects, instruments, software plugins, sample libraries, etc.), extract structured information about the gear.

You MUST respond using the identify_gear tool.`;

    const userContent: any[] = [];
    if (text) {
      userContent.push({ type: "text", text: `Identify this gear:\n\n${text}` });
    }
    if (imageBase64) {
      userContent.push({
        type: "image_url",
        image_url: { url: imageBase64.startsWith("data:") ? imageBase64 : `data:image/jpeg;base64,${imageBase64}` },
      });
      if (!text) {
        userContent.push({ type: "text", text: "Identify the music gear shown in this image." });
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
            name: "identify_gear",
            description: "Return structured data about identified music gear.",
            parameters: {
              type: "object",
              properties: {
                ecosystem: {
                  type: "string",
                  enum: ["Hardware", "NI", "Kontakt", "Reaktor", "Reason", "Ableton"],
                  description: "Platform/ecosystem. Use Hardware for physical gear.",
                },
                category: { type: "string", description: "e.g. Synth, FX, Drum Machine, Controller, Audio Interface, Library" },
                vendor: { type: "string", description: "Manufacturer name" },
                product: { type: "string", description: "Product/model name" },
                type: { type: "string", description: "e.g. Analog poly synth, Digital reverb pedal" },
                synthesis: { type: "string", description: "Synthesis type if applicable" },
                sonicRole: { type: "string", description: "Role in a studio setup" },
                soundCategory: { type: "string", description: "e.g. Lead, Bass, Pad, FX, Keys" },
                description: { type: "string", description: "Brief description of the gear" },
                useCases: { type: "string", description: "Comma-separated use cases" },
                yearReleased: { type: "number", description: "Year of release if known" },
                msrp: { type: "string", description: "Retail price if known, e.g. $1,499" },
                keywords: { type: "string", description: "Space-separated keywords" },
              },
              required: ["ecosystem", "category", "vendor", "product", "type"],
              additionalProperties: false,
            },
          },
        },
      ],
      tool_choice: { type: "function", function: { name: "identify_gear" } },
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
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits." }), {
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

    const gear = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify({ success: true, gear }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("identify-gear error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
