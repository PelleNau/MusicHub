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
    const { url, itemId, fileName } = await req.json();

    if (!url || !itemId) {
      return new Response(
        JSON.stringify({ success: false, error: 'url and itemId are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return new Response(
        JSON.stringify({ success: false, error: 'Supabase configuration missing' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    console.log(`Attempting to download manual from: ${url}`);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    let response: Response;
    try {
      response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/pdf,application/octet-stream,*/*',
        },
        redirect: 'follow',
      });
    } finally {
      clearTimeout(timeout);
    }

    if (!response.ok) {
      console.error(`Download failed: ${response.status} ${response.statusText}`);
      return new Response(
        JSON.stringify({ success: false, error: `Download failed: ${response.status}` }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const contentType = response.headers.get('content-type') || '';

    if (contentType.includes('text/html') && !url.endsWith('.html')) {
      console.warn('Received HTML instead of document — likely blocked');
      return new Response(
        JSON.stringify({ success: false, error: 'Download returned HTML instead of a document — likely requires authentication or is blocked' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const fileData = await response.arrayBuffer();

    if (fileData.byteLength < 1000) {
      return new Response(
        JSON.stringify({ success: false, error: 'Downloaded file too small — likely an error page' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let ext = 'pdf';
    if (contentType.includes('pdf')) ext = 'pdf';
    else if (url.match(/\.(pdf|doc|docx|txt|html)(\?|$)/i)) {
      ext = url.match(/\.(pdf|doc|docx|txt|html)/i)![1].toLowerCase();
    }

    const sanitizedName = (fileName || 'manual')
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .substring(0, 80);
    const storagePath = `${itemId}/${sanitizedName}.${ext}`;

    console.log(`Uploading to storage: manuals/${storagePath} (${fileData.byteLength} bytes)`);

    const { error: uploadError } = await supabase.storage
      .from('manuals')
      .upload(storagePath, fileData, {
        contentType: contentType || 'application/pdf',
        upsert: true,
      });

    if (uploadError) {
      console.error('Storage upload failed:', uploadError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to store the file' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: publicUrlData } = supabase.storage
      .from('manuals')
      .getPublicUrl(storagePath);

    console.log('Manual stored successfully:', publicUrlData.publicUrl);

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          url: publicUrlData.publicUrl,
          originalUrl: url,
          fileName: `${sanitizedName}.${ext}`,
          size: fileData.byteLength,
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Download-manual error:', error);
    const msg = error instanceof Error ? error.message : 'Download failed';
    return new Response(
      JSON.stringify({ success: false, error: msg }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
