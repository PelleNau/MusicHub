import type { ReactNode } from "react";

export interface TemplateGridProps {
  children?: ReactNode;
  emptyMessage?: string;
  className?: string;
}

export function TemplateGrid({
  children,
  emptyMessage = "No templates available",
  className = "",
}: TemplateGridProps) {
  return (
    <div className={className}>
      {children ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {children}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <svg className="mb-3 h-16 w-16 text-[var(--muted-foreground)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-[var(--muted-foreground)]">{emptyMessage}</p>
        </div>
      )}
    </div>
  );
}
