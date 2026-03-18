import { useState, useRef, useEffect, useCallback } from "react";
import { MessageSquare, X, Send, Loader2, Bot, User, Sparkles, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import ReactMarkdown from "react-markdown";

type ChatMessage = { role: "user" | "assistant"; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/gear-chat`;

async function streamChat({
  messages,
  itemId,
  userId,
  onDelta,
  onDone,
  onError,
}: {
  messages: ChatMessage[];
  itemId?: string;
  userId?: string;
  onDelta: (text: string) => void;
  onDone: () => void;
  onError: (err: string) => void;
}) {
  const resp = await fetch(CHAT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({ messages, itemId, userId }),
  });

  if (!resp.ok) {
    const data = await resp.json().catch(() => ({ error: "Request failed" }));
    onError(data.error || `Error ${resp.status}`);
    return;
  }

  if (!resp.body) {
    onError("No response stream");
    return;
  }

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let textBuffer = "";
  let streamDone = false;

  while (!streamDone) {
    const { done, value } = await reader.read();
    if (done) break;
    textBuffer += decoder.decode(value, { stream: true });

    let newlineIndex: number;
    while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
      let line = textBuffer.slice(0, newlineIndex);
      textBuffer = textBuffer.slice(newlineIndex + 1);

      if (line.endsWith("\r")) line = line.slice(0, -1);
      if (line.startsWith(":") || line.trim() === "") continue;
      if (!line.startsWith("data: ")) continue;

      const jsonStr = line.slice(6).trim();
      if (jsonStr === "[DONE]") {
        streamDone = true;
        break;
      }

      try {
        const parsed = JSON.parse(jsonStr);
        const content = parsed.choices?.[0]?.delta?.content as string | undefined;
        if (content) onDelta(content);
      } catch {
        textBuffer = line + "\n" + textBuffer;
        break;
      }
    }
  }

  // Final flush
  if (textBuffer.trim()) {
    for (let raw of textBuffer.split("\n")) {
      if (!raw) continue;
      if (raw.endsWith("\r")) raw = raw.slice(0, -1);
      if (raw.startsWith(":") || raw.trim() === "") continue;
      if (!raw.startsWith("data: ")) continue;
      const jsonStr = raw.slice(6).trim();
      if (jsonStr === "[DONE]") continue;
      try {
        const parsed = JSON.parse(jsonStr);
        const content = parsed.choices?.[0]?.delta?.content as string | undefined;
        if (content) onDelta(content);
      } catch { /* ignore */ }
    }
  }

  onDone();
}

interface GearChatProps {
  focusItemId?: string;
  focusItemName?: string;
}

export function GearChat({ focusItemId, focusItemName }: GearChatProps) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | undefined>();
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Get current user
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id);
    });
  }, []);

  // Load conversation history when chat opens
  useEffect(() => {
    if (open && userId && !historyLoaded) {
      supabase
        .from("chat_messages")
        .select("role, content")
        .eq("user_id", userId)
        .order("created_at", { ascending: true })
        .limit(100)
        .then(({ data }) => {
          if (data && data.length > 0) {
            setMessages(data.map(m => ({ role: m.role as "user" | "assistant", content: m.content })));
          }
          setHistoryLoaded(true);
        });
    }
  }, [open, userId, historyLoaded]);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Persist a message to DB
  const persistMessage = useCallback(async (role: "user" | "assistant", content: string) => {
    if (!userId) return;
    await supabase.from("chat_messages").insert({
      user_id: userId,
      role,
      content,
      item_context: focusItemId || null,
    });
  }, [userId, focusItemId]);

  // Clear conversation history
  const clearHistory = useCallback(async () => {
    if (!userId) return;
    await supabase.from("chat_messages").delete().eq("user_id", userId);
    setMessages([]);
    setError(null);
    setHistoryLoaded(false);
  }, [userId]);

  const send = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = { role: "user", content: text.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);
    setError(null);

    // Persist user message
    await persistMessage("user", userMsg.content);

    let assistantSoFar = "";
    const upsertAssistant = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
        }
        return [...prev, { role: "assistant", content: assistantSoFar }];
      });
    };

    try {
      await streamChat({
        messages: [...messages, userMsg],
        itemId: focusItemId,
        userId,
        onDelta: upsertAssistant,
        onDone: async () => {
          setIsLoading(false);
          // Persist assistant response
          if (assistantSoFar) {
            await persistMessage("assistant", assistantSoFar);
          }
        },
        onError: (err) => {
          setError(err);
          setIsLoading(false);
        },
      });
    } catch (e: any) {
      setError(e.message || "Chat failed");
      setIsLoading(false);
    }
  }, [messages, isLoading, focusItemId, userId, persistMessage]);

  return (
    <>
      {/* Floating chat button */}
      <button
        onClick={() => setOpen(!open)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-lg hover:shadow-xl ${
          open
            ? "bg-muted text-muted-foreground rotate-0"
            : "bg-primary text-primary-foreground hover:scale-105"
        }`}
      >
        {open ? <X className="h-5 w-5" /> : <MessageSquare className="h-5 w-5" />}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[420px] h-[600px] max-h-[80vh] rounded-2xl border border-border/50 bg-card/95 backdrop-blur-xl shadow-2xl flex flex-col overflow-hidden animate-fade-in">
          {/* Header */}
          <div className="shrink-0 px-5 py-4 border-b border-border/30 bg-card">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                <Bot className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-mono text-sm font-semibold text-foreground">Gear Assistant</h3>
                <p className="font-mono text-[10px] text-muted-foreground truncate">
                  {focusItemName ? `Focused on ${focusItemName}` : "Persistent memory • Knows your manuals"}
                </p>
              </div>
              <div className="flex items-center gap-1">
                {messages.length > 0 && (
                  <button
                    onClick={clearHistory}
                    className="font-mono text-[9px] text-muted-foreground hover:text-destructive px-2 py-1 rounded bg-secondary/60 transition-colors flex items-center gap-1"
                    title="Clear all conversation history"
                  >
                    <Trash2 className="h-3 w-3" />
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && !historyLoaded && (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-5 w-5 text-muted-foreground animate-spin" />
              </div>
            )}

            {messages.length === 0 && historyLoaded && (
              <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
                <div className="w-16 h-16 rounded-2xl bg-primary/5 border border-primary/15 flex items-center justify-center">
                  <Sparkles className="h-7 w-7 text-primary/30" />
                </div>
                <div className="space-y-1.5 max-w-xs">
                  <p className="font-mono text-sm text-foreground/60">Ask me anything about your gear</p>
                  <p className="font-mono text-[10px] text-muted-foreground/50">
                    I have persistent memory, know your full inventory, and have digested all downloaded manuals in detail
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5 justify-center">
                  {[
                    "How do I connect my gear together?",
                    "What synths do I have?",
                    focusItemName ? `Deep dive on ${focusItemName}` : "Suggest a signal chain",
                  ].filter(Boolean).map((q, i) => (
                    <button
                      key={i}
                      onClick={() => send(q)}
                      className="px-3 py-1.5 rounded-lg bg-secondary/60 border border-border/30 font-mono text-[10px] text-foreground/60 hover:text-foreground hover:bg-secondary transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-2.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "assistant" && (
                  <div className="shrink-0 w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center mt-0.5">
                    <Bot className="h-3.5 w-3.5 text-primary" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-xl px-3.5 py-2.5 ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary/60 border border-border/30"
                  }`}
                >
                  {msg.role === "assistant" ? (
                    <div className="prose prose-sm prose-invert max-w-none font-mono text-xs leading-relaxed [&_p]:my-1 [&_ul]:my-1 [&_ol]:my-1 [&_li]:my-0.5 [&_h1]:text-sm [&_h2]:text-xs [&_h3]:text-xs [&_code]:text-[10px] [&_code]:bg-background/30 [&_code]:px-1 [&_code]:rounded">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="font-mono text-xs">{msg.content}</p>
                  )}
                </div>
                {msg.role === "user" && (
                  <div className="shrink-0 w-7 h-7 rounded-lg bg-foreground/10 flex items-center justify-center mt-0.5">
                    <User className="h-3.5 w-3.5 text-foreground/60" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
              <div className="flex gap-2.5">
                <div className="shrink-0 w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Loader2 className="h-3.5 w-3.5 text-primary animate-spin" />
                </div>
                <div className="bg-secondary/60 border border-border/30 rounded-xl px-3.5 py-2.5">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 animate-pulse" />
                    <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 animate-pulse [animation-delay:150ms]" />
                    <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 animate-pulse [animation-delay:300ms]" />
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="px-3 py-2 rounded-lg bg-destructive/10 border border-destructive/20">
                <p className="font-mono text-[11px] text-destructive">{error}</p>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="shrink-0 p-3 border-t border-border/30 bg-card">
            <form
              onSubmit={(e) => { e.preventDefault(); send(input); }}
              className="flex items-center gap-2"
            >
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={focusItemName ? `Ask about ${focusItemName}...` : "Ask about your gear..."}
                className="flex-1 h-9 bg-secondary/40 border-border/30 font-mono text-xs placeholder:text-muted-foreground/40"
                disabled={isLoading}
              />
              <Button
                type="submit"
                size="sm"
                disabled={isLoading || !input.trim()}
                className="h-9 w-9 p-0 shrink-0"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
