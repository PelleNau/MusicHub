import { useState, useCallback, useRef } from "react";
import { AbletonParseResult } from "@/types/ableton";
import { toast } from "sonner";

const ANALYZE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-project`;

/**
 * Streams AI analysis for a parsed Ableton project via SSE.
 * Returns reactive state and control functions.
 */
export function useStreamingAnalysis() {
  const [analysis, setAnalysis] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const run = useCallback(async (parsedResult: AbletonParseResult) => {
    setAnalysis("");
    setAnalyzing(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const resp = await fetch(ANALYZE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ parsedProject: parsedResult }),
        signal: controller.signal,
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: "Analysis failed" }));
        toast.error(err.error || "Analysis failed");
        setAnalyzing(false);
        return;
      }

      if (!resp.body) throw new Error("No response body");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });

        let newlineIdx: number;
        while ((newlineIdx = buf.indexOf("\n")) !== -1) {
          let line = buf.slice(0, newlineIdx);
          buf = buf.slice(newlineIdx + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              fullText += content;
              setAnalysis(fullText);
            }
          } catch {
            buf = line + "\n" + buf;
            break;
          }
        }
      }
    } catch (e: unknown) {
      if (!(e instanceof Error && e.name === "AbortError")) {
        console.error("Analysis error:", e);
        toast.error("Analysis failed");
      }
    } finally {
      setAnalyzing(false);
    }
  }, []);

  const abort = useCallback(() => {
    abortRef.current?.abort();
    setAnalyzing(false);
  }, []);

  const reset = useCallback(() => {
    setAnalysis("");
    abortRef.current?.abort();
    setAnalyzing(false);
  }, []);

  return { analysis, setAnalysis, analyzing, run, abort, reset } as const;
}
