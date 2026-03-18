import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const firecrawlKey = Deno.env.get('FIRECRAWL_API_KEY');
  const lovableKey = Deno.env.get('LOVABLE_API_KEY');

  if (!firecrawlKey || !lovableKey) {
    return new Response(
      JSON.stringify({ error: 'Missing API keys' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const supabase = createClient(supabaseUrl, serviceKey);

  // SSE stream for progress
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: Record<string, unknown>) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      try {
        // Fetch all hardware items
        const { data: items, error: fetchErr } = await supabase
          .from('inventory_items')
          .select('*')
          .eq('ecosystem', 'Hardware');

        if (fetchErr) { send({ error: fetchErr.message }); controller.close(); return; }

        // Filter to items without research data
        const needsResearch = (items || []).filter(item => {
          const notes = item.notes || '';
          return !notes.includes('--- AI Research ---');
        });

        send({ type: 'start', total: needsResearch.length, skipped: (items?.length || 0) - needsResearch.length });

        for (let i = 0; i < needsResearch.length; i++) {
          const item = needsResearch[i];
          send({ type: 'progress', current: i + 1, total: needsResearch.length, product: `${item.vendor} ${item.product}` });

          try {
            // Step 1: Research via Firecrawl
            const searchQuery = `${item.vendor} ${item.product} ${item.category || ''} specifications`;
            const searchRes = await fetch('https://api.firecrawl.dev/v1/search', {
              method: 'POST',
              headers: { 'Authorization': `Bearer ${firecrawlKey}`, 'Content-Type': 'application/json' },
              body: JSON.stringify({ query: searchQuery, limit: 6, scrapeOptions: { formats: ['markdown'] } }),
            });
            const searchData = await searchRes.json();

            const contentParts: string[] = [];
            if (searchRes.ok && searchData.success) {
              for (const r of (searchData.data || [])) {
                if (r.markdown) contentParts.push(`=== WEB: ${r.title || 'Result'} ===\n${r.markdown.slice(0, 3000)}`);
                else if (r.description) contentParts.push(`=== WEB: ${r.title || 'Result'} ===\n${r.description}`);
              }
            }

            // Scrape product URL if available
            if (item.url) {
              try {
                const scrapeRes = await fetch('https://api.firecrawl.dev/v1/scrape', {
                  method: 'POST',
                  headers: { 'Authorization': `Bearer ${firecrawlKey}`, 'Content-Type': 'application/json' },
                  body: JSON.stringify({ url: item.url, formats: ['markdown'], onlyMainContent: true }),
                });
                const scrapeData = await scrapeRes.json();
                if (scrapeRes.ok && scrapeData.success) {
                  const md = scrapeData.data?.markdown || scrapeData.markdown || '';
                  if (md) contentParts.unshift(`=== PRODUCT PAGE ===\n${md.slice(0, 5000)}`);
                }
              } catch (e) { console.warn('Scrape failed for', item.url, e); }
            }

            const rawContent = contentParts.join('\n\n');
            if (rawContent.trim().length < 50) {
              send({ type: 'skip', product: `${item.vendor} ${item.product}`, reason: 'insufficient data' });
              continue;
            }

            // Step 2: Distill with AI
            const distillRes = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
              method: 'POST',
              headers: { 'Authorization': `Bearer ${lovableKey}`, 'Content-Type': 'application/json' },
              body: JSON.stringify({
                model: 'google/gemini-3-flash-preview',
                messages: [
                  {
                    role: 'system',
                    content: `You are a music gear research analyst. Extract info about "${item.vendor} ${item.product}" (${item.category}, ${item.type}).`
                  },
                  {
                    role: 'user',
                    content: `Analyze and extract everything about "${item.vendor} ${item.product}":\n\n${rawContent.slice(0, 12000)}`
                  }
                ],
                tools: [{
                  type: 'function',
                  function: {
                    name: 'product_analysis',
                    description: 'Structured product analysis',
                    parameters: {
                      type: 'object',
                      properties: {
                        summary: { type: 'string', description: '2-3 sentence overview' },
                        keyFeatures: { type: 'array', items: { type: 'string' }, description: 'Key features (max 8)' },
                        technicalSpecs: {
                          type: 'array',
                          items: { type: 'object', properties: { label: { type: 'string' }, value: { type: 'string' } }, required: ['label', 'value'], additionalProperties: false },
                        },
                        bestUseCases: { type: 'array', items: { type: 'string' }, description: 'Best use cases (max 5)' },
                        pros: { type: 'array', items: { type: 'string' }, description: 'Strengths (max 5)' },
                        cons: { type: 'array', items: { type: 'string' }, description: 'Limitations (max 5)' },
                        tipsAndTricks: { type: 'array', items: { type: 'string' }, description: 'Tips (max 5)' },
                        relatedProducts: { type: 'array', items: { type: 'string' }, description: 'Related products (max 5)' },
                        signalFlow: { type: 'string', description: 'Signal flow description' },
                        manualHighlights: { type: 'string', description: 'Manual highlights' },
                      },
                      required: ['summary', 'keyFeatures', 'technicalSpecs', 'bestUseCases'],
                      additionalProperties: false,
                    },
                  },
                }],
                tool_choice: { type: 'function', function: { name: 'product_analysis' } },
              }),
            });

            if (!distillRes.ok) {
              const status = distillRes.status;
              if (status === 429) {
                send({ type: 'rate_limit', product: `${item.vendor} ${item.product}` });
                // Wait 15 seconds before retrying
                await new Promise(r => setTimeout(r, 15000));
                i--; // retry this item
                continue;
              }
              send({ type: 'error', product: `${item.vendor} ${item.product}`, reason: `AI error ${status}` });
              continue;
            }

            const aiData = await distillRes.json();
            const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
            if (!toolCall?.function?.arguments) {
              send({ type: 'error', product: `${item.vendor} ${item.product}`, reason: 'No structured data returned' });
              continue;
            }

            const analysis = JSON.parse(toolCall.function.arguments);

            // Step 3: Save to database
            const notesParts: string[] = [];
            if (analysis.signalFlow) notesParts.push(`Signal Flow: ${analysis.signalFlow}`);
            if (analysis.pros?.length) notesParts.push(`Strengths: ${analysis.pros.join('; ')}`);
            if (analysis.cons?.length) notesParts.push(`Limitations: ${analysis.cons.join('; ')}`);
            if (analysis.tipsAndTricks?.length) notesParts.push(`Tips: ${analysis.tipsAndTricks.join('; ')}`);
            if (analysis.manualHighlights) notesParts.push(`Manual: ${analysis.manualHighlights}`);
            if (analysis.relatedProducts?.length) notesParts.push(`Related: ${analysis.relatedProducts.join(', ')}`);

            const existingCustom = ((item.specs as any)?.custom || []) as { label: string; value: string }[];
            const newSpecLabels = new Set((analysis.technicalSpecs || []).map((s: any) => s.label.toLowerCase()));
            const mergedCustom = [
              ...existingCustom.filter((c: any) => !newSpecLabels.has(c.label.toLowerCase())),
              ...(analysis.technicalSpecs || []),
            ];

            const updatedSpecs = { ...(item.specs || {}), custom: mergedCustom };

            const updatePayload: Record<string, unknown> = {
              description: analysis.summary || item.description || null,
              use_cases: analysis.bestUseCases?.join(', ') || item.use_cases || null,
              notes: notesParts.length > 0
                ? [item.notes, notesParts.join('\n')].filter(Boolean).join('\n\n--- AI Research ---\n')
                : item.notes || null,
              specs: updatedSpecs,
              keywords: analysis.keyFeatures
                ? [item.keywords, analysis.keyFeatures.join(' ')].filter(Boolean).join(' ')
                : item.keywords || null,
            };

            const { error: updateErr } = await supabase
              .from('inventory_items')
              .update(updatePayload)
              .eq('id', item.id);

            if (updateErr) {
              send({ type: 'error', product: `${item.vendor} ${item.product}`, reason: updateErr.message });
            } else {
              send({ type: 'done', product: `${item.vendor} ${item.product}` });
            }

            // Rate limit protection - wait between items
            await new Promise(r => setTimeout(r, 2000));

          } catch (itemErr) {
            console.error(`Error processing ${item.vendor} ${item.product}:`, itemErr);
            send({ type: 'error', product: `${item.vendor} ${item.product}`, reason: itemErr instanceof Error ? itemErr.message : 'Unknown error' });
          }
        }

        send({ type: 'complete' });
      } catch (e) {
        send({ error: e instanceof Error ? e.message : 'Batch research failed' });
      } finally {
        controller.close();
      }
    }
  });

  return new Response(stream, {
    headers: { ...corsHeaders, 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' },
  });
});
