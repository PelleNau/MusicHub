import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Sparkles, Upload } from "lucide-react";

interface AiDropZoneProps {
  onIdentified: (gear: Record<string, any>) => void;
}

export function AiDropZone({ onIdentified }: AiDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const identify = useCallback(
    async ({ text, imageBase64 }: { text?: string; imageBase64?: string }) => {
      setIsLoading(true);
      setError(null);
      try {
        const { data, error: fnError } = await supabase.functions.invoke("identify-gear", {
          body: { text, imageBase64 },
        });
        if (fnError) throw fnError;
        if (data?.error) throw new Error(data.error);
        if (data?.gear) onIdentified(data.gear);
      } catch (e: any) {
        setError(e.message || "Failed to identify gear");
      } finally {
        setIsLoading(false);
      }
    },
    [onIdentified]
  );

  const readFile = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      if (file.type.startsWith("image/")) {
        reader.readAsDataURL(file);
      } else {
        reader.readAsText(file);
      }
    });

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      // Check for dropped text
      const droppedText = e.dataTransfer.getData("text/plain");
      if (droppedText?.trim()) {
        await identify({ text: droppedText.trim() });
        return;
      }

      // Check for files
      const file = e.dataTransfer.files?.[0];
      if (!file) return;

      const content = await readFile(file);
      if (file.type.startsWith("image/")) {
        await identify({ imageBase64: content });
      } else {
        await identify({ text: content });
      }
    },
    [identify]
  );

  const handlePaste = useCallback(
    async (e: React.ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (const item of Array.from(items)) {
        if (item.type.startsWith("image/")) {
          e.preventDefault();
          const file = item.getAsFile();
          if (!file) continue;
          const content = await readFile(file);
          await identify({ imageBase64: content });
          return;
        }
      }

      const text = e.clipboardData.getData("text/plain");
      if (text?.trim()) {
        e.preventDefault();
        await identify({ text: text.trim() });
      }
    },
    [identify]
  );

  const handleFileInput = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const content = await readFile(file);
      if (file.type.startsWith("image/")) {
        await identify({ imageBase64: content });
      } else {
        await identify({ text: content });
      }
      e.target.value = "";
    },
    [identify]
  );

  return (
    <div
      className={`relative border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
        isDragging
          ? "border-primary bg-primary/5"
          : "border-muted-foreground/25 hover:border-primary/50"
      }`}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onPaste={handlePaste}
      tabIndex={0}
    >
      <input
        type="file"
        accept="image/*,.txt,.md,.csv"
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        onChange={handleFileInput}
        disabled={isLoading}
      />

      {isLoading ? (
        <div className="flex flex-col items-center gap-2 py-2">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="font-mono text-xs text-muted-foreground">Identifying gear with AI…</span>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-1 py-2">
          <div className="flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-primary" />
            <Upload className="h-4 w-4 text-muted-foreground" />
          </div>
          <span className="font-mono text-xs text-muted-foreground">
            Drop text, image, or file here — AI will identify the gear
          </span>
          <span className="font-mono text-[10px] text-muted-foreground/60">
            or click to browse · paste also works
          </span>
        </div>
      )}

      {error && (
        <p className="font-mono text-xs text-destructive mt-2">{error}</p>
      )}
    </div>
  );
}
