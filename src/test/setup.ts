import "@testing-library/jest-dom";

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});

const domRectFromRect = ({ x = 0, y = 0, width = 0, height = 0 } = {}) =>
  new DOMRect(x, y, width, height);

if (typeof DOMRect !== "undefined" && !("fromRect" in DOMRect)) {
  Object.defineProperty(DOMRect, "fromRect", {
    writable: true,
    value: domRectFromRect,
  });
}

if (typeof window !== "undefined" && typeof window.DOMRect === "undefined") {
  Object.defineProperty(window, "DOMRect", {
    writable: true,
    value: DOMRect,
  });
}

if (typeof DOMRectReadOnly !== "undefined" && !("fromRect" in DOMRectReadOnly)) {
  Object.defineProperty(DOMRectReadOnly, "fromRect", {
    writable: true,
    value: domRectFromRect,
  });
}
