import type { ReactNode } from "react";

export interface TemplatePreviewModalProps {
  templateName?: string;
  description?: string;
  trackCount?: number;
  devices?: string[];
  children?: ReactNode;
  onClose?: () => void;
  onUse?: () => void;
  isOpen?: boolean;
  className?: string;
}

export function TemplatePreviewModal({
  templateName = "Template",
  description = "",
  trackCount = 0,
  devices = [],
  children,
  onClose,
  onUse,
  isOpen = false,
  className = "",
}: TemplatePreviewModalProps) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div
        className={`max-h-[80vh] w-full max-w-2xl overflow-y-auto rounded-lg border border-[var(--border)] bg-[var(--surface-1)] ${className}`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="p-6">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <h2 className="mb-2 text-2xl font-bold">{templateName}</h2>
              <p className="text-[var(--muted-foreground)]">{description}</p>
            </div>
            <button type="button" onClick={onClose} className="rounded p-2 hover:bg-[var(--surface-2)]">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="mb-6 space-y-4">
            <div>
              <span className="text-sm text-[var(--muted-foreground)]">Tracks:</span>{" "}
              <span className="font-semibold">{trackCount}</span>
            </div>
            {devices.length > 0 ? (
              <div>
                <span className="mb-2 block text-sm text-[var(--muted-foreground)]">Devices:</span>
                <div className="flex flex-wrap gap-2">
                  {devices.map((device) => (
                    <span key={device} className="rounded bg-[var(--surface-2)] px-2 py-1 text-xs">
                      {device}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
            {children}
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 rounded bg-[var(--surface-2)] px-4 py-2 font-medium hover:bg-[var(--surface-3)]">
              Cancel
            </button>
            <button type="button" onClick={onUse} className="flex-1 rounded bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700">
              Use Template
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
