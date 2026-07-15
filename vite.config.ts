import { fileURLToPath, URL } from "node:url";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

const packageJson = JSON.parse(
  readFileSync(
    fileURLToPath(new URL("./package.json", import.meta.url)),
    "utf8",
  ),
) as {
  version: string;
};

function getAppVersion() {
  if (process.env.VITE_APP_VERSION) {
    return process.env.VITE_APP_VERSION.startsWith("v")
      ? process.env.VITE_APP_VERSION
      : `v${process.env.VITE_APP_VERSION}`;
  }

  try {
    const tag = execFileSync(
      "git",
      ["describe", "--tags", "--abbrev=0", "--match", "v[0-9]*"],
      {
        cwd: fileURLToPath(new URL(".", import.meta.url)),
        stdio: ["ignore", "pipe", "ignore"],
        encoding: "utf8",
      },
    ).trim();

    return tag;
  } catch {
    return `v${packageJson.version}`;
  }
}

export default defineConfig({
  build: {
    rolldownOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return undefined;
          if (/node_modules[\\/](@?react|react-dom|react-router)/.test(id))
            return "react-vendor";
          if (id.includes("@tanstack")) return "query-vendor";
          if (id.includes("@radix-ui")) return "radix-vendor";
          if (id.includes("framer-motion")) return "motion-vendor";
          if (id.includes("@supabase")) return "supabase-vendor";
          return undefined;
        },
      },
    },
  },
  define: {
    __APP_VERSION__: JSON.stringify(getAppVersion()),
  },
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: [
        "brand/nagy-logo.png",
        "brand/nagy-logo-transparent.png",
        "icons/icon-192.png",
        "icons/icon-512.png",
        "icons/icon-maskable-512.png",
      ],
      manifest: {
        name: "NAGY EVENTOS",
        short_name: "NAGY",
        description: "Gestao de aluguel de equipamentos para eventos.",
        theme_color: "#090605",
        background_color: "#090605",
        display: "standalone",
        display_override: ["window-controls-overlay", "standalone"],
        orientation: "portrait",
        scope: "/",
        start_url: "/",
        icons: [
          {
            src: "/icons/icon-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/icons/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/icons/icon-maskable-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,webp}"],
        navigateFallback: "/index.html",
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/images\.unsplash\.com\//,
            handler: "CacheFirst",
            options: {
              cacheName: "event-images",
              expiration: { maxEntries: 12, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
