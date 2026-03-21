import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Known vendor domains for prioritizing results
const VENDOR_DOMAINS: Record<string, string[]> = {
  "native instruments": ["native-instruments.com"],
  "ni": ["native-instruments.com"],
  "arturia": ["arturia.com"],
  "moog": ["moogmusic.com"],
  "sequential": ["sequential.com"],
  "dave smith": ["sequential.com"],
  "roland": ["roland.com"],
  "korg": ["korg.com"],
  "yamaha": ["yamaha.com"],
  "nord": ["nordkeyboards.com"],
  "elektron": ["elektron.se"],
  "teenage engineering": ["teenage.engineering"],
  "novation": ["novationmusic.com"],
  "ableton": ["ableton.com"],
  "akai": ["akaipro.com"],
  "behringer": ["behringer.com"],
  "boss": ["boss.info"],
  "eventide": ["eventideaudio.com"],
  "strymon": ["strymon.net"],
  "universal audio": ["uaudio.com"],
  "waves": ["waves.com"],
  "fabfilter": ["fabfilter.com"],
  "izotope": ["izotope.com"],
  "spectrasonics": ["spectrasonics.net"],
  "output": ["output.com"],
  "spitfire audio": ["spitfireaudio.com"],
  "propellerhead": ["reasonstudios.com"],
  "reason studios": ["reasonstudios.com"],
  "u-he": ["u-he.com"],
  "xfer": ["xferrecords.com"],
  "serum": ["xferrecords.com"],
  "slate digital": ["slatedigital.com"],
  "softube": ["softube.com"],
  "cherry audio": ["cherryaudio.com"],
  "ik multimedia": ["ikmultimedia.com"],
};

function getVendorDomain(vendor: string): string | null {
  const v = vendor.toLowerCase();
  for (const [key, domains] of Object.entries(VENDOR_DOMAINS)) {
    if (v.includes(key) || key.includes(v)) return domains[0];
  }
  return null;
}

function isLikelyProductImage(imageUrl: string, vendor: string, product: string): boolean {
  const url = imageUrl.toLowerCase();
  // Reject generic/social/placeholder images
  const rejectPatterns = [
    "logo", "favicon", "icon", "banner", "social-share", "default",
    "placeholder", "avatar", "profile", "twitter_card", "facebook",
    "og-image", "share-image", "site-image", "generic",
    "1x1", "pixel", "spacer", "blank",
  ];
  if (rejectPatterns.some(p => url.includes(p))) return false;

  // Prefer images that mention the product name
  const productWords = product.toLowerCase().split(/[\s\-_]+/).filter(w => w.length > 2);
  const hasProductRef = productWords.some(w => url.includes(w));
  
  // Very small images are likely icons
  // (we can't check dimensions from URL alone, but common patterns)
  if (url.match(/\b(16|24|32|48|64)x\1\b/)) return false;
  
  return true;
}

async function tryOgImage(pageUrl: string): Promise<string | null> {
  try {
    const pageResp = await fetch(pageUrl, {
      headers: { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" },
      redirect: "follow",
    });
    if (!pageResp.ok) return null;
    const html = await pageResp.text();

    // Try multiple meta image sources in priority order
    const patterns = [
      /<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i,
      /<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i,
      /<meta[^>]*name=["']twitter:image["'][^>]*content=["']([^"']+)["']/i,
      /<meta[^>]*content=["']([^"']+)["'][^>]*name=["']twitter:image["']/i,
    ];

    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match?.[1]) {
        let imageUrl = match[1];
        if (imageUrl.startsWith("//")) imageUrl = "https:" + imageUrl;
        if (!imageUrl.startsWith("http")) {
          const base = new URL(pageUrl);
          imageUrl = base.origin + (imageUrl.startsWith("/") ? "" : "/") + imageUrl;
        }
        return imageUrl;
      }
    }
  } catch {
    return null;
  }
}

async function verifyImage(imageUrl: string): Promise<boolean> {
  try {
    const resp = await fetch(imageUrl, { method: "HEAD", redirect: "follow" });
    if (!resp.ok) return false;
    const ct = resp.headers.get("content-type") || "";
    if (ct.startsWith("image")) return true;
    if (imageUrl.match(/\.(jpg|jpeg|png|webp|gif|avif)/i)) return true;
    return false;
  } catch {
    return false;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url, vendor, product } = await req.json();
    const json = (obj: any, status = 200) =>
      new Response(JSON.stringify(obj), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    // Strategy 1: Scrape og:image from the item's own product URL
    if (url) {
      const ogImage = await tryOgImage(url);
      if (ogImage && isLikelyProductImage(ogImage, vendor || "", product || "")) {
        if (await verifyImage(ogImage)) {
          console.log("Found og:image from product URL:", ogImage);
          return json({ success: true, imageUrl: ogImage });
        }
      }
    }

    // Strategy 2: Firecrawl search — targeted queries
    const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY");
    if (FIRECRAWL_API_KEY && vendor && product) {
      const vendorDomain = getVendorDomain(vendor);
      
      // Build targeted search queries
      const queries = [];
      // Query 1: site-specific if we know the vendor domain
      if (vendorDomain) {
        queries.push(`site:${vendorDomain} "${product}"`);
      }
      // Query 2: exact product name on vendor site
      queries.push(`"${vendor}" "${product}" product page`);
      // Query 3: broader fallback
      if (!vendorDomain) {
        queries.push(`${vendor} ${product} synthesizer plugin instrument`);
      }

      for (const searchQuery of queries) {
        try {
          console.log("Firecrawl search:", searchQuery);
          const searchResp = await fetch("https://api.firecrawl.dev/v1/search", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${FIRECRAWL_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ query: searchQuery, limit: 3 }),
          });

          if (!searchResp.ok) {
            console.log("Firecrawl search failed:", searchResp.status);
            continue;
          }

          const searchData = await searchResp.json();
          const results = searchData.data || [];

          // Sort results: prioritize vendor domain
          const sorted = [...results].sort((a: any, b: any) => {
            const aIsVendor = vendorDomain && a.url?.includes(vendorDomain) ? -1 : 0;
            const bIsVendor = vendorDomain && b.url?.includes(vendorDomain) ? -1 : 0;
            return aIsVendor - bIsVendor;
          });

          for (const result of sorted) {
            const resultUrl = result.url;
            if (!resultUrl) continue;

            // Skip aggregator/retailer sites
            const skip = ["amazon.", "ebay.", "reverb.com", "sweetwater.com", "thomann.", "musiciansfriend."];
            if (skip.some(s => resultUrl.includes(s))) continue;

            const ogImage = await tryOgImage(resultUrl);
            if (ogImage && isLikelyProductImage(ogImage, vendor, product)) {
              if (await verifyImage(ogImage)) {
                console.log("Found image via Firecrawl:", ogImage, "from", resultUrl);
                return json({ success: true, imageUrl: ogImage });
              }
            }
          }
        } catch (e) {
          console.log("Firecrawl query error:", e);
        }
      }
    }

    // Strategy 3: AI verification — ask AI to find the right URL from known patterns
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (LOVABLE_API_KEY && vendor && product) {
      try {
        const vendorDomain = getVendorDomain(vendor);
        const domainHint = vendorDomain ? ` The manufacturer's website is ${vendorDomain}.` : "";

        const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [
              {
                role: "system",
                content: `You are an expert at finding direct product image URLs for music gear. Given a vendor and product, return the EXACT direct URL to the product's official image on the manufacturer's website. The URL MUST be a real, working image URL (ending in .jpg, .png, .webp or served as image/jpeg etc).${domainHint} Return ONLY the URL. If unsure, respond with NONE.`,
              },
              {
                role: "user",
                content: `Find the product image URL for: ${vendor} ${product}`,
              },
            ],
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const suggestion = data.choices?.[0]?.message?.content?.trim();
          if (suggestion && suggestion !== "NONE" && suggestion.startsWith("http")) {
            if (isLikelyProductImage(suggestion, vendor, product) && await verifyImage(suggestion)) {
              console.log("Found image via AI:", suggestion);
              return json({ success: true, imageUrl: suggestion });
            }
          }
        }
      } catch (e) {
        console.log("AI image search failed:", e);
      }
    }

    return json({ success: false, error: "Could not find a product image" });
  } catch (e) {
    console.error("find-product-image error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
