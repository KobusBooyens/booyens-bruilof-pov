import type { MetadataRoute } from "next";

// Web App Manifest — lets guests "Add to Home Screen" and get a real app icon
// and standalone (chromeless) launch. Next serves this at /manifest.webmanifest
// and links it automatically. Icons live in /public.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Kobus & Simoné · Foto's",
    short_name: "K & S Foto's",
    description: "Deel jou oomblikke van ons groot dag — 16 Oktober 2026.",
    start_url: "/",
    display: "standalone",
    background_color: "#F4EEE2",
    theme_color: "#F4EEE2",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
