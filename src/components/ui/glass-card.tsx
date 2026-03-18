import { useRef } from "react";
import { useExpandOrigin } from "@/hooks/useExpandOrigin";
import { useSettings } from "@/hooks/useSettings";

export type TextureVariant = "grunge" | "geo-blocks" | "geo-rays";

const textureFiles: Record<TextureVariant, string> = {
  grunge: "/textures/texture-grunge.webp",
  "geo-blocks": "/textures/texture-geo-blocks.jpg",
  "geo-rays": "/textures/texture-geo-rays.jpg",
};

export function GlassCard({
  className = "",
  children,
  onClick,
  staggerIndex = 0,
  expanded = false,
  containerRef,
  scaleFactor = 1.35,
  texture,
  textureOpacity,
}: {
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
  staggerIndex?: number;
  expanded?: boolean;
  containerRef?: React.RefObject<HTMLElement | null>;
  scaleFactor?: number;
  texture?: TextureVariant;
  textureOpacity?: 2 | 4 | 6 | 8 | 10 | 15;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const origin = useExpandOrigin(cardRef, containerRef ?? { current: null });
  const { settings } = useSettings();

  const texAlpha = texture ? settings.textureOpacity / 100 : 0;
  const bgAlpha = settings.cardBgAlpha / 100;

  return (
    <div
      ref={cardRef}
      onClick={onClick}
      style={{
        animationDelay: `${staggerIndex * 40}ms`,
        animationFillMode: "backwards",
        transformOrigin: origin,
        transform: expanded ? `scale(${scaleFactor})` : "scale(1)",
        zIndex: expanded ? 50 : 1,
        transition:
          "transform 0.4s cubic-bezier(0.16,1,0.3,1), box-shadow 0.4s cubic-bezier(0.16,1,0.3,1), background-color 0.3s ease",
        backgroundColor: `rgba(255, 255, 255, ${bgAlpha})`,
      }}
      className={`animate-fade-in backdrop-blur-xl border border-white/[0.08] rounded-2xl overflow-hidden relative
        hover:bg-white/[0.10] hover:border-white/[0.15]
        ${expanded ? "shadow-[0_0_60px_hsl(var(--primary)/0.2)] border-white/[0.2]" : "hover:shadow-[0_0_30px_hsl(var(--primary)/0.12)]"}
        ${onClick ? "cursor-pointer" : ""} ${className}`}
    >
      {texture && (
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.12)",
            backgroundImage: `url(${textureFiles[texture]})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundBlendMode: settings.blendMode,
            opacity: texAlpha,
          }}
        />
      )}
      <div className="relative z-[1]">{children}</div>
    </div>
  );
}
