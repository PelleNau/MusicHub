const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { vendor, product, category, url } = await req.json();

    if (!vendor || !product) {
      return new Response(
        JSON.stringify({ success: false, error: 'Vendor and product are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = Deno.env.get('FIRECRAWL_API_KEY');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'Firecrawl connector not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const results: Record<string, unknown> = {};

    // 1. Search for the product to find key pages
    const searchQuery = `${vendor} ${product} ${category || ''} specifications manual`;
    console.log('Searching:', searchQuery);

    const searchRes = await fetch('https://api.firecrawl.dev/v1/search', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: searchQuery,
        limit: 8,
        scrapeOptions: { formats: ['markdown'] },
      }),
    });

    const searchData = await searchRes.json();
    if (searchRes.ok && searchData.success) {
      results.searchResults = (searchData.data || []).map((r: any) => ({
        url: r.url,
        title: r.title || r.metadata?.title,
        description: r.description || '',
        markdown: r.markdown?.slice(0, 3000) || '',
      }));
    }

    // 2. Search specifically for the manual/user guide
    const manualQuery = `${vendor} ${product} user manual PDF`;
    console.log('Manual search:', manualQuery);

    const manualRes = await fetch('https://api.firecrawl.dev/v1/search', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: manualQuery,
        limit: 5,
      }),
    });

    const manualData = await manualRes.json();
    if (manualRes.ok && manualData.success) {
      results.manualResults = (manualData.data || []).map((r: any) => ({
        url: r.url,
        title: r.title || r.metadata?.title,
        description: r.description || '',
      }));
    }

    // 3. If we have a product URL, scrape it for detailed specs
    if (url) {
      console.log('Scraping product page:', url);
      const scrapeRes = await fetch('https://api.firecrawl.dev/v1/scrape', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url,
          formats: ['markdown', 'links'],
          onlyMainContent: true,
        }),
      });

      const scrapeData = await scrapeRes.json();
      if (scrapeRes.ok && scrapeData.success) {
        const md = scrapeData.data?.markdown || scrapeData.markdown || '';
        const links = scrapeData.data?.links || scrapeData.links || [];
        results.productPage = {
          markdown: md.slice(0, 5000),
          links: links.filter((l: string) =>
            /manual|pdf|spec|doc|guide|support|download/i.test(l)
          ).slice(0, 15),
        };
      }
    }

    // 4. Search for reviews/demos
    const reviewQuery = `${vendor} ${product} review`;
    const reviewRes = await fetch('https://api.firecrawl.dev/v1/search', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: reviewQuery,
        limit: 5,
      }),
    });

    const reviewData = await reviewRes.json();
    if (reviewRes.ok && reviewData.success) {
      results.reviews = (reviewData.data || []).map((r: any) => ({
        url: r.url,
        title: r.title || r.metadata?.title,
        description: r.description || '',
      }));
    }

    console.log('Research complete');
    return new Response(
      JSON.stringify({ success: true, data: results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Research error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Research failed';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
