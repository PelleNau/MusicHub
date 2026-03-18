import { Package } from "lucide-react";

interface TheoryHeaderProps {
  title?: string;
}

export function TheoryHeader({ title = "Theory Lab" }: TheoryHeaderProps) {
  return (
    <header className="flex flex-wrap items-center gap-3 border-b border-border px-4 sm:px-6 py-2 bg-chrome">
      <Package className="h-5 w-5 text-primary" />
      <h1 className="text-lg font-mono font-semibold tracking-tight text-foreground hidden sm:block">
        THE FLIGHT CASE
      </h1>
      {title && (
        <>
          <span className="text-muted-foreground/40 font-mono">/</span>
          <span className="text-sm font-mono text-muted-foreground">{title}</span>
        </>
      )}
    </header>
  );
}
