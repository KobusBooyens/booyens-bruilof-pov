import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";

const display = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

const body = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Kobus & Simoné · Foto's",
  description: "Deel jou oomblikke van ons groot dag — 16 Oktober 2026.",
  openGraph: {
    title: "Kobus & Simoné · Foto's",
    description: "Deel jou oomblikke van ons groot dag — 16 Oktober 2026.",
    type: "website",
  },
};

// Mobile-native: fill the true viewport, draw under notches/rounded corners,
// and let the safe-area env() insets keep content clear of system UI.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#F4EEE2",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="af" className={`${display.variable} ${body.variable}`}>
      <body>{children}</body>
    </html>
  );
}
