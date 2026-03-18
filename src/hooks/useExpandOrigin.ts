import { RefObject, useEffect, useState } from "react";

/**
 * Computes transform-origin so a card always expands toward the center
 * of its container — anchoring the edge closest to the container boundary.
 */
export function useExpandOrigin(
  cardRef: RefObject<HTMLElement | null>,
  containerRef: RefObject<HTMLElement | null>,
): string {
  const [origin, setOrigin] = useState("center");

  useEffect(() => {
    const card = cardRef.current;
    const container = containerRef.current;
    if (!card || !container) return;

    function compute() {
      const cRect = container!.getBoundingClientRect();
      const eRect = card!.getBoundingClientRect();

      // Card center relative to container (0–1)
      const rx = (eRect.left + eRect.width / 2 - cRect.left) / cRect.width;
      const ry = (eRect.top + eRect.height / 2 - cRect.top) / cRect.height;

      const horizontal = rx < 0.35 ? "left" : rx > 0.65 ? "right" : "center";
      const vertical = ry < 0.35 ? "top" : ry > 0.65 ? "bottom" : "center";

      setOrigin(`${vertical} ${horizontal}`);
    }

    compute();

    const ro = new ResizeObserver(compute);
    ro.observe(container);
    return () => ro.disconnect();
  }, [cardRef, containerRef]);

  return origin;
}
