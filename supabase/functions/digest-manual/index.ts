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
    const { itemId, manualUrl } = await req.json();

    if (!itemId || !manualUrl) {
      return new Response(
        JSON.stringify({ success: false, error: 'itemId and manualUrl are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!LOVABLE_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return new Response(
        JSON.stringify({ success: false, error: 'Server configuration missing' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get item info for context
    const { data: item } = await supabase
      .from('inventory_items')
      .select('vendor, product, category, type, ecosystem')
      .eq('id', itemId)
      .single();

    if (!item) {
      return new Response(
        JSON.stringify({ success: false, error: 'Item not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Digesting manual for: ${item.vendor} ${item.product}`);

    // Download the PDF from storage
    const pathMatch = manualUrl.match(/\/storage\/v1\/object\/public\/manuals\/(.+)/);
    if (!pathMatch) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid manual URL format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const storagePath = decodeURIComponent(pathMatch[1]);
    const { data: fileData, error: storageErr } = await supabase
      .storage
      .from('manuals')
      .download(storagePath);

    if (storageErr || !fileData) {
      console.error('Storage download error:', storageErr);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to download manual from storage' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Convert PDF to base64 for multimodal AI reading
    const arrayBuf = await fileData.arrayBuffer();
    const bytes = new Uint8Array(arrayBuf);
    
    // Limit to ~10MB for API
    if (bytes.length > 10 * 1024 * 1024) {
      console.warn(`PDF too large (${bytes.length} bytes), will truncate`);
    }

    const base64Pdf = btoa(String.fromCharCode(...bytes.slice(0, 10 * 1024 * 1024)));
    console.log(`PDF size: ${bytes.length} bytes, base64: ${base64Pdf.length} chars`);

    const systemPrompt = `You are a technical documentation specialist for music gear. You will receive a product manual PDF and must produce a comprehensive, deeply structured digest.

Product: ${item.vendor} ${item.product}
Category: ${item.category} | Type: ${item.type} | Ecosystem: ${item.ecosystem}

Your digest will be the AI assistant's ONLY knowledge about this product. It must be thorough enough to answer ANY question.

Extract and organize ALL of the following:
1. OVERVIEW: Purpose, key features, selling points
2. SETUP & INSTALLATION: How to set up, connect, install, configure
3. CONTROLS & INTERFACE: Every knob, button, slider, menu, parameter — what each does
4. SIGNAL FLOW: How audio/MIDI flows through the device, routing options
5. CONNECTIVITY: All I/O — audio, MIDI, USB, CV, expression, etc. How to connect to other gear
6. PARAMETERS & SETTINGS: Every adjustable parameter with range and effect
7. PRESETS & PATCHES: How to use, save, organize presets
8. ADVANCED FEATURES: Modulation, sequencing, arpeggiators, effects, special modes
9. TROUBLESHOOTING: Common issues and solutions
10. TIPS & WORKFLOW: Best practices, creative techniques
11. SPECIFICATIONS: Tech specs, dimensions, power

Be exhaustive. Include specific parameter names, value ranges, menu paths, and signal routing details.`;

    // Use Gemini with PDF as inline data (multimodal)
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
          {
            role: 'user',
            content: [
              {
                type: 'file',
                file: {
                  filename: `${item.vendor}_${item.product}_manual.pdf`,
                  data: base64Pdf,
                  mime_type: 'application/pdf',
                },
              },
              {
                type: 'text',
                text: `Read this entire PDF manual for the ${item.vendor} ${item.product} and produce a comprehensive digest covering every section listed in the system prompt.`,
              },
            ],
          },
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'manual_digest',
              description: 'Store the comprehensive manual digest with structured sections.',
              parameters: {
                type: 'object',
                properties: {
                  fullDigest: {
                    type: 'string',
                    description: 'The complete manual digest in markdown format with ALL extracted information.',
                  },
                  sections: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        title: { type: 'string' },
                        summary: { type: 'string' },
                      },
                      required: ['title', 'summary'],
                      additionalProperties: false,
                    },
                  },
                  connectionGuide: {
                    type: 'string',
                    description: 'How to connect this product to other gear — all I/O details and routing.',
                  },
                  quickReference: {
                    type: 'string',
                    description: 'Quick-reference card with most important controls and functions.',
                  },
                },
                required: ['fullDigest', 'sections'],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: 'function', function: { name: 'manual_digest' } },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('AI error:', response.status, errText);

      if (response.status === 429) {
        return new Response(
          JSON.stringify({ success: false, error: 'Rate limit exceeded. Try again shortly.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ success: false, error: 'AI credits exhausted.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Fall back: store a note that manual exists but couldn't be digested
      await supabase.from('manual_texts').upsert({
        item_id: itemId,
        content: `[Manual PDF available at ${manualUrl} but AI digestion failed: ${response.status}]`,
        source_url: manualUrl,
        sections: [],
      }, { onConflict: 'item_id' });

      return new Response(
        JSON.stringify({ success: true, data: { extracted: false, aiDigested: false } }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiData = await response.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];

    let digestContent = `[Manual available at ${manualUrl}]`;
    let sections: any[] = [];

    if (toolCall?.function?.arguments) {
      try {
        const digest = JSON.parse(toolCall.function.arguments);

        const parts: string[] = [];
        parts.push(digest.fullDigest || '');
        if (digest.connectionGuide) {
          parts.push(`\n\n## CONNECTION GUIDE\n${digest.connectionGuide}`);
        }
        if (digest.quickReference) {
          parts.push(`\n\n## QUICK REFERENCE\n${digest.quickReference}`);
        }

        digestContent = parts.join('');
        sections = digest.sections || [];
        console.log(`AI digest complete: ${digestContent.length} chars, ${sections.length} sections`);
      } catch (parseErr) {
        console.error('Failed to parse AI digest:', parseErr);
      }
    }

    // Store in database
    const { error: upsertErr } = await supabase.from('manual_texts').upsert({
      item_id: itemId,
      content: digestContent,
      source_url: manualUrl,
      sections: sections,
    }, { onConflict: 'item_id' });

    if (upsertErr) {
      console.error('Upsert error:', upsertErr);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to store digest' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Manual digested and stored for ${item.vendor} ${item.product}`);

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          extracted: true,
          aiDigested: true,
          contentLength: digestContent.length,
          sectionCount: sections.length,
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Digest error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Digestion failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
