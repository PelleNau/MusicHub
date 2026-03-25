import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

function resolveManualChunk(id: string): string | undefined {
  if (!id.includes("node_modules")) return undefined;

  if (
    id.includes("/react/") ||
    id.includes("/react-dom/") ||
    id.includes("/scheduler/") ||
    id.includes("/react-router/")
  ) {
    return "react-vendor";
  }

  if (
    id.includes("/@radix-ui/") ||
    id.includes("/cmdk/") ||
    id.includes("/vaul/") ||
    id.includes("/embla-carousel-react/")
  ) {
    return "ui-vendor";
  }

  if (
    id.includes("/@supabase/") ||
    id.includes("/@tanstack/") ||
    id.includes("/react-hook-form/") ||
    id.includes("/zod/")
  ) {
    return "data-vendor";
  }

  if (
    id.includes("/recharts/") ||
    id.includes("/wavesurfer.js/") ||
    id.includes("/@wavesurfer/")
  ) {
    return "media-vendor";
  }

  if (
    id.includes("/lucide-react/") ||
    id.includes("/date-fns/") ||
    id.includes("/react-markdown/")
  ) {
    return "content-vendor";
  }

  return "vendor";
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isTauriBuild = process.env.VITE_BUILD_TARGET === "tauri";

  return {
    base: isTauriBuild ? "./" : "/",
    server: {
      host: "::",
      port: 5173,
      hmr: {
        overlay: false,
      },
    },
    plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: resolveManualChunk,
        },
      },
    },
  };
});
