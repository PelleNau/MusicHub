import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const AMP_PROMPTS: Record<string, string> = {
  "british-highgain":
    "Stylized bold flat illustration of a vintage 1980s British high-gain guitar amplifier head. Dark black tolex covering, gold metal control panel with chunky silver knobs in a row, iconic rectangular shape. No text, no logos, no brand names. Dramatic dark stage background with subtle warm spotlight. Illustration style: bold outlines, flat colour fills, slight retro poster aesthetic.",
  "orange-british":
    "Stylized bold flat illustration of a vintage British tube guitar amplifier head with distinctive orange vinyl covering and a woven speaker grille pattern on the front. Chunky chrome knobs, boxy proportions. No text, no logos, no brand names. Dark moody stage background with warm amber light. Illustration style: bold outlines, flat colour fills, retro poster aesthetic.",
  "american-clean":
    "Stylized bold flat illustration of a classic American guitar combo amplifier. Blonde or tweed-coloured tolex, silver grille cloth, chrome control panel on top, open-back cab shape. No text, no logos, no brand names. Dark stage background with cool blue-white spotlight. Illustration style: bold outlines, flat colour fills, retro poster aesthetic.",
  "british-chimey":
    "Stylized bold flat illustration of a classic 1960s British guitar combo amplifier. Light fawn or cream-coloured vinyl, diamond-pattern grille cloth, top-mounted chrome panel with chicken-head knobs. No text, no logos, no brand names. Dark stage background with warm golden light. Illustration style: bold outlines, flat colour fills, vintage poster aesthetic.",
  "american-highgain":
    "Stylized bold flat illustration of a modern American high-gain guitar amplifier head. Black metal chassis with chrome accents, rows of glowing vacuum tubes visible, industrial aggressive look. No text, no logos, no brand names. Dark stage background with red/orange dramatic lighting. Illustration style: bold outlines, flat colour fills, retro poster aesthetic.",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check which images already exist in storage
    const { data: existingFiles } = await supabase.storage
      .from("amp-illustrations")
      .list("", { limit: 100 });

    const existingNames = new Set(
      (existingFiles ?? []).map((f: { name: string }) => f.name)
    );

    const results: Record<string, string> = {};
    const toGenerate: [string, string][] = [];

    for (const [key, prompt] of Object.entries(AMP_PROMPTS)) {
      const fileName = `${key}.png`;
      if (existingNames.has(fileName)) {
        // Already generated — return public URL
        const { data: urlData } = supabase.storage
          .from("amp-illustrations")
          .getPublicUrl(fileName);
        results[key] = urlData.publicUrl;
      } else {
        toGenerate.push([key, prompt]);
      }
    }

    // Generate missing images
    for (const [key, prompt] of toGenerate) {
      console.log(`Generating: ${key}`);
      const aiResp = await fetch(
        "https://ai.gateway.lovable.dev/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-3.1-flash-image-preview",
            messages: [{ role: "user", content: prompt }],
            modalities: ["image", "text"],
          }),
        }
      );

      if (!aiResp.ok) {
        const errText = await aiResp.text();
        console.error(`AI error for ${key}: ${aiResp.status} ${errText}`);
        if (aiResp.status === 429) {
          return new Response(
            JSON.stringify({ error: "Rate limited — try again in a minute", partial: results }),
            { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        continue; // skip this one
      }

      const aiData = await aiResp.json();
      const base64Url =
        aiData.choices?.[0]?.message?.images?.[0]?.image_url?.url as
          | string
          | undefined;

      if (!base64Url) {
        console.error(`No image returned for ${key}`);
        continue;
      }

      // Strip data URI prefix and decode
      const base64 = base64Url.replace(/^data:image\/\w+;base64,/, "");
      const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));

      const fileName = `${key}.png`;
      const { error: uploadErr } = await supabase.storage
        .from("amp-illustrations")
        .upload(fileName, bytes, {
          contentType: "image/png",
          upsert: true,
        });

      if (uploadErr) {
        console.error(`Upload error for ${key}:`, uploadErr);
        continue;
      }

      const { data: urlData } = supabase.storage
        .from("amp-illustrations")
        .getPublicUrl(fileName);
      results[key] = urlData.publicUrl;
      console.log(`Done: ${key} → ${urlData.publicUrl}`);
    }

    return new Response(JSON.stringify({ images: results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-amp-art error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
