const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { vendor, product, category, type, ecosystem, rawContent } = await req.json();

    if (!vendor || !product || !rawContent) {
      return new Response(
        JSON.stringify({ success: false, error: 'vendor, product, and rawContent are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ success: false, error: 'LOVABLE_API_KEY not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const systemPrompt = `You are a music gear research analyst. You receive raw web content about a specific product and must extract only the information that is specifically about that exact product. Ignore general information, navigation text, ads, and unrelated content.

Product context:
- Vendor: ${vendor}
- Product: ${product}
- Category: ${category || 'unknown'}
- Type: ${type || 'unknown'}
- Ecosystem: ${ecosystem || 'unknown'}

Your job is to distill the raw content into a structured analysis. Be precise — only include facts you can confirm from the source material about THIS specific product.`;

    const userPrompt = `Analyze the following raw web content and extract everything valuable about "${vendor} ${product}". Return your analysis as a JSON object using the tool provided.

Raw content:
${rawContent.slice(0, 12000)}`;

    console.log(`Distilling info for: ${vendor} ${product}`);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'product_analysis',
              description: 'Return structured analysis of the product based on web research.',
              parameters: {
                type: 'object',
                properties: {
                  summary: {
                    type: 'string',
                    description: 'A concise 2-3 sentence overview of what this product is and what makes it notable.',
                  },
                  keyFeatures: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'List of key features or capabilities specific to this product (max 8).',
                  },
                  technicalSpecs: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        label: { type: 'string' },
                        value: { type: 'string' },
                      },
                      required: ['label', 'value'],
                      additionalProperties: false,
                    },
                    description: 'Technical specifications found (e.g. sample rate, bit depth, polyphony, dimensions, weight).',
                  },
                  signalFlow: {
                    type: 'string',
                    description: 'Description of the signal flow or audio processing chain if applicable. Leave empty if not relevant.',
                  },
                  bestUseCases: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Recommended use cases or scenarios where this product excels (max 5).',
                  },
                  pros: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Strengths or advantages mentioned in reviews/docs (max 5).',
                  },
                  cons: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Weaknesses or limitations mentioned (max 5).',
                  },
                  tipsAndTricks: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Useful tips, tricks, or workflow suggestions found in manuals or reviews (max 5).',
                  },
                  relatedProducts: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Similar or complementary products mentioned (max 5).',
                  },
                  manualHighlights: {
                    type: 'string',
                    description: 'Key excerpts or insights from the user manual if found. Leave empty if no manual content available.',
                  },
                },
                required: ['summary', 'keyFeatures', 'technicalSpecs', 'bestUseCases'],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: 'function', function: { name: 'product_analysis' } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ success: false, error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ success: false, error: 'AI credits exhausted. Please add credits in Settings.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errText = await response.text();
      console.error('AI gateway error:', response.status, errText);
      return new Response(
        JSON.stringify({ success: false, error: 'AI analysis failed' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiData = await response.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall?.function?.arguments) {
      console.error('No tool call in response:', JSON.stringify(aiData));
      return new Response(
        JSON.stringify({ success: false, error: 'AI did not return structured data' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const analysis = JSON.parse(toolCall.function.arguments);
    console.log('Distillation complete for:', vendor, product);

    return new Response(
      JSON.stringify({ success: true, data: analysis }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Distill error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Distillation failed';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
