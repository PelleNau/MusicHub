import { useNavigate } from "react-router-dom";
import { useMockPrototype } from "./MockPrototypeContext";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { ReactNode } from "react";

interface HotspotProps {
  to: string;
  label: string;
  children: ReactNode;
  className?: string;
}

export function Hotspot({ to, label, children, className = "" }: HotspotProps) {
  const navigate = useNavigate();
  const { showHotspots } = useMockPrototype();

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(to);
  };

  const content = (
    <div
      onClick={handleClick}
      className={`relative cursor-pointer transition-all duration-200 rounded-lg ${
        showHotspots
          ? "ring-2 ring-primary/60 ring-offset-1 ring-offset-background animate-pulse-ring"
          : "hover:ring-1 hover:ring-primary/30"
      } ${className}`}
    >
      {children}
      {showHotspots && (
        <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-primary shadow-[0_0_8px_hsl(var(--primary)/0.6)] z-10" />
      )}
    </div>
  );

  if (showHotspots) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent side="top" className="text-xs font-mono">
          → {label}
        </TooltipContent>
      </Tooltip>
    );
  }

  return content;
}
