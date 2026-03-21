import { useEffect, useState } from "react";
import { Maximize2, ZoomIn, ZoomOut } from "lucide-react";

interface ZoomControlProps {
  zoomLevel: number;
  onChange: (zoom: number) => void;
  compact?: boolean;
  className?: string;
}

export function ZoomControl({
  zoomLevel,
  onChange,
  compact = false,
  className = "",
}: ZoomControlProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(String(zoomLevel));

  useEffect(() => {
    setInputValue(String(zoomLevel));
  }, [zoomLevel]);

  const handleZoomChange = (next: number) => {
    const clamped = Math.max(50, Math.min(200, next));
    onChange(clamped);
    setInputValue(String(clamped));
  };

  const handleBlur = () => {
    handleZoomChange(parseInt(inputValue, 10) || 100);
    setIsEditing(false);
  };

  if (compact) {
    return (
      <div className={`flex items-center gap-1 ${className}`}>
        <IconButton title="Zoom out" onClick={() => handleZoomChange(zoomLevel - 10)} disabled={zoomLevel <= 50}>
          <ZoomOut className="h-3.5 w-3.5" />
        </IconButton>
        <EditableValue
          compact
          isEditing={isEditing}
          inputValue={inputValue}
          zoomLevel={zoomLevel}
          onInput={setInputValue}
          onStartEdit={() => setIsEditing(true)}
          onBlur={handleBlur}
          onCancel={() => {
            setInputValue(String(zoomLevel));
            setIsEditing(false);
          }}
        />
        <IconButton title="Zoom in" onClick={() => handleZoomChange(zoomLevel + 10)} disabled={zoomLevel >= 200}>
          <ZoomIn className="h-3.5 w-3.5" />
        </IconButton>
        <div className="mx-0.5 h-4 w-px bg-border" />
        <IconButton title="Reset zoom" onClick={() => handleZoomChange(100)}>
          <Maximize2 className="h-3.5 w-3.5" />
        </IconButton>
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <label className="text-xs font-medium text-foreground/70">UI Zoom</label>
      <div className="flex items-center gap-3">
        <IconButton title="Zoom out" onClick={() => handleZoomChange(zoomLevel - 10)} disabled={zoomLevel <= 50}>
          <ZoomOut className="h-4 w-4" />
        </IconButton>
        <div className="relative flex h-8 flex-1 items-center">
          <input
            type="range"
            min={50}
            max={200}
            step={5}
            value={zoomLevel}
            onChange={(event) => handleZoomChange(parseInt(event.target.value, 10))}
            className="h-1 w-full cursor-pointer appearance-none rounded-full bg-[var(--surface-2)] [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:transition-transform hover:[&::-webkit-slider-thumb]:scale-110 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-primary"
          />
        </div>
        <IconButton title="Zoom in" onClick={() => handleZoomChange(zoomLevel + 10)} disabled={zoomLevel >= 200}>
          <ZoomIn className="h-4 w-4" />
        </IconButton>
        <IconButton title="Reset zoom" onClick={() => handleZoomChange(100)}>
          <Maximize2 className="h-4 w-4" />
        </IconButton>
        <EditableValue
          isEditing={isEditing}
          inputValue={inputValue}
          zoomLevel={zoomLevel}
          onInput={setInputValue}
          onStartEdit={() => setIsEditing(true)}
          onBlur={handleBlur}
          onCancel={() => {
            setInputValue(String(zoomLevel));
            setIsEditing(false);
          }}
        />
      </div>
      <div className="flex justify-between text-xs text-foreground/50">
        <span>50%</span>
        <span>100%</span>
        <span>200%</span>
      </div>
    </div>
  );
}

function IconButton({
  children,
  title,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  title: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      className="flex h-[30px] w-[30px] items-center justify-center rounded text-foreground/70 transition-colors hover:bg-[var(--surface-2)] hover:text-foreground disabled:opacity-30"
    >
      {children}
    </button>
  );
}

function EditableValue({
  compact = false,
  isEditing,
  inputValue,
  zoomLevel,
  onInput,
  onStartEdit,
  onBlur,
  onCancel,
}: {
  compact?: boolean;
  isEditing: boolean;
  inputValue: string;
  zoomLevel: number;
  onInput: (value: string) => void;
  onStartEdit: () => void;
  onBlur: () => void;
  onCancel: () => void;
}) {
  return (
    <div
      className={`${compact ? "min-w-[3.5rem] h-[24px] px-2" : "min-w-[4rem] h-8 px-3"} flex items-center justify-center rounded border border-[var(--border)] bg-[var(--surface-1)] transition-colors hover:border-primary`}
      onClick={() => {
        if (!isEditing) onStartEdit();
      }}
      title="Click to edit zoom level"
    >
      {isEditing ? (
        <input
          type="number"
          autoFocus
          min={50}
          max={200}
          step={10}
          value={inputValue}
          onChange={(event) => onInput(event.target.value)}
          onBlur={onBlur}
          onKeyDown={(event) => {
            if (event.key === "Enter") onBlur();
            if (event.key === "Escape") onCancel();
          }}
          className={`${compact ? "text-xs" : "text-sm"} w-full bg-transparent text-center font-mono text-foreground outline-none`}
        />
      ) : (
        <span className={`${compact ? "text-xs" : "text-sm"} font-mono text-foreground/90`}>{zoomLevel}%</span>
      )}
    </div>
  );
}
