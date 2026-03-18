import { useState, useRef, useEffect, useCallback } from "react";
import { X, Send, Loader2, Trash2, Sparkles, Cable } from "lucide-react";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import { CanvasNode, PatchCable } from "./types";

type Msg = { role: "user" | "assistant"; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/playground-chat`;

async function streamChat({
  messages,
  onDelta,
  onDone,
}: {
  messages: Msg[];
  onDelta: (t: string) => void;
  onDone: () => void;
}) {
  const resp = await fetch(CHAT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({ messages }),
  });

  if (!resp.ok) {
    const body = await resp.json().catch(() => ({}));
    throw new Error(body.error || `Request failed (${resp.status})`);
  }
  if (!resp.body) throw new Error("No response body");

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let buf = "";
  let done = false;

  while (!done) {
    const { done: d, value } = await reader.read();
    if (d) break;
    buf += decoder.decode(value, { stream: true });
    let nl: number;
    while ((nl = buf.indexOf("\n")) !== -1) {
      let line = buf.slice(0, nl);
      buf = buf.slice(nl + 1);
      if (line.endsWith("\r")) line = line.slice(0, -1);
      if (line.startsWith(":") || line.trim() === "") continue;
      if (!line.startsWith("data: ")) continue;
      const json = line.slice(6).trim();
      if (json === "[DONE]") { done = true; break; }
      try {
        const p = JSON.parse(json);
        const c = p.choices?.[0]?.delta?.content as string | undefined;
        if (c) onDelta(c);
      } catch {
        buf = line + "\n" + buf;
        break;
      }
    }
  }
  onDone();
}

// Parse signal-chain code blocks from markdown
function extractChains(content: string): string[][] {
  const regex = /```signal-chain\s*\n([\s\S]*?)```/g;
  const chains: string[][] = [];
  let match;
  while ((match = regex.exec(content)) !== null) {
    const lines = match[1].trim().split("\n").filter(Boolean);
    for (const line of lines) {
      const items = line.split("->").map(s => s.trim()).filter(Boolean);
      if (items.length >= 2) chains.push(items);
    }
  }
  return chains;
}

interface ChatPanelProps {
  isOpen: boolean;
  onToggle: () => void;
  canvasContext?: { nodes: CanvasNode[]; cables: PatchCable[] };
  onBuildChain?: (gearNames: string[]) => void;
}

export function ChatPanel({ isOpen, onToggle, canvasContext, onBuildChain }: ChatPanelProps) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = useCallback(async (text: string) => {
    if (!text.trim() || isStreaming) return;

    let enrichedText = text.trim();
    if (canvasContext && canvasContext.nodes.length > 0) {
      const nodeList = canvasContext.nodes.map(n => n.label).join(", ");
      const cableList = canvasContext.cables.map(c => {
        const from = canvasContext.nodes.find(n => n.id === c.fromNodeId)?.label;
        const to = canvasContext.nodes.find(n => n.id === c.toNodeId)?.label;
        return from && to ? `${from} → ${to}` : null;
      }).filter(Boolean).join(", ");
      enrichedText = `[Current patch canvas: Gear placed: ${nodeList || "none"}. Connections: ${cableList || "none"}]\n\n${enrichedText}`;
    }

    const userMsg: Msg = { role: "user", content: enrichedText };
    const displayMsg: Msg = { role: "user", content: text.trim() };
    const updated = [...messages, displayMsg];
    setMessages(updated);
    setInput("");
    setIsStreaming(true);

    let assistantSoFar = "";
    const upsert = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantSoFar } : m);
        }
        return [...prev, { role: "assistant", content: assistantSoFar }];
      });
    };

    try {
      const apiMessages = [...messages.map(m => ({ role: m.role, content: m.content })), userMsg];
      await streamChat({ messages: apiMessages, onDelta: upsert, onDone: () => setIsStreaming(false) });
    } catch (e: any) {
      toast.error(e.message || "Failed to get response");
      setIsStreaming(false);
    }
  }, [messages, isStreaming, canvasContext]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); }
  };

  // Custom renderer that replaces signal-chain code blocks with Build buttons
  const renderContent = (content: string, msgIndex: number) => {
    const chains = extractChains(content);
    // Remove signal-chain blocks from the displayed markdown
    const cleanContent = content.replace(/```signal-chain\s*\n[\s\S]*?```/g, "").trim();

    return (
      <>
        <ReactMarkdown>{cleanContent}</ReactMarkdown>
        {chains.length > 0 && !isStreaming && chains.map((chain, ci) => (
          <div key={ci} className="mt-3 p-2.5 rounded-lg border border-primary/30 bg-primary/5">
            <div className="font-mono text-[10px] text-muted-foreground mb-1.5">Signal Chain:</div>
            <div className="flex flex-wrap items-center gap-1 mb-2">
              {chain.map((name, i) => (
                <span key={i} className="flex items-center gap-1">
                  <span className="font-mono text-[11px] text-primary font-semibold">{name}</span>
                  {i < chain.length - 1 && <span className="text-muted-foreground text-[10px]">→</span>}
                </span>
              ))}
            </div>
            <Button
              size="sm"
              onClick={() => onBuildChain?.(chain)}
              className="w-full h-7 font-mono text-[11px] gap-1.5"
            >
              <Cable className="h-3 w-3" />
              Build on Canvas
            </Button>
          </div>
        ))}
      </>
    );
  };

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="absolute top-3 right-3 z-10 flex items-center gap-1.5 px-3 py-2 rounded-lg bg-card border border-border hover:border-primary/40 transition-colors shadow-lg"
      >
        <Sparkles className="h-3.5 w-3.5 text-primary" />
        <span className="font-mono text-[11px] text-foreground">AI Chat</span>
      </button>
    );
  }

  return (
    <div className="w-80 shrink-0 border-l border-border bg-card flex flex-col h-full animate-slide-in-right" style={{ animationDuration: "0.2s" }}>
      <div className="flex items-center justify-between px-3 py-2 border-b border-border shrink-0">
        <div className="flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span className="font-mono text-xs font-semibold text-foreground">AI ADVISOR</span>
        </div>
        <div className="flex items-center gap-0.5">
          {messages.length > 0 && (
            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive"
              onClick={() => setMessages([])}>
              <Trash2 className="h-3 w-3" />
            </Button>
          )}
          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground" onClick={onToggle}>
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center px-2 space-y-4">
            <Sparkles className="h-5 w-5 text-primary/40" />
            <p className="font-mono text-[11px] text-muted-foreground leading-relaxed">
              What do you want to create?
            </p>
            <div className="space-y-1.5 w-full">
              {[
                "Build me a signal chain",
                "Help me layer sounds",
                "Suggest a combo for a genre",
              ].map((s, i) => (
                <button key={i} onClick={() => send(s)}
                  className="w-full text-left px-2.5 py-2 rounded-md border border-border hover:border-primary/30 hover:bg-primary/5 transition-colors">
                  <span className="font-mono text-[10px] text-muted-foreground">{s}</span>
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i}>
            {msg.role === "user" ? (
              <div className="bg-primary/10 border border-primary/20 rounded-lg rounded-br-sm px-3 py-2 ml-6">
                <p className="font-mono text-[11px] text-foreground whitespace-pre-wrap">{msg.content}</p>
              </div>
            ) : (
              <div className="prose prose-invert prose-xs max-w-none font-mono
                prose-headings:text-foreground prose-headings:text-xs prose-headings:font-mono
                prose-p:text-muted-foreground prose-p:text-[11px] prose-p:leading-relaxed
                prose-strong:text-primary prose-strong:font-semibold
                prose-li:text-muted-foreground prose-li:text-[11px]
                prose-code:text-accent prose-code:bg-secondary prose-code:px-1 prose-code:rounded prose-code:text-[10px]
              ">
                {renderContent(msg.content, i)}
                {isStreaming && i === messages.length - 1 && (
                  <span className="inline-block w-1 h-3 bg-primary animate-pulse ml-0.5 align-middle" />
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="border-t border-border px-2 py-2 shrink-0">
        <div className="flex gap-1.5 items-end">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe a sound or vibe…"
            rows={1}
            disabled={isStreaming}
            className="flex-1 resize-none bg-secondary border border-border rounded-lg px-3 py-2 font-mono text-[11px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 min-h-[34px] max-h-[80px]"
            style={{ height: "34px" }}
            onInput={(e) => {
              const t = e.currentTarget;
              t.style.height = "34px";
              t.style.height = Math.min(t.scrollHeight, 80) + "px";
            }}
          />
          <Button
            onClick={() => send(input)}
            disabled={!input.trim() || isStreaming}
            size="icon"
            className="h-[34px] w-[34px] rounded-lg shrink-0"
          >
            {isStreaming ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
