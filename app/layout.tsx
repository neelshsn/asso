import type { Metadata, Viewport } from "next";
import "./globals.css";
import { pally, satoshi } from "@/lib/fonts";

export const metadata: Metadata = {
  title: "N'GO Match",
  description: "Connecting the right volunteers with the right missions.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${satoshi.variable} ${pally.variable}`}
    >
      <body className="bg-cream text-ink antialiased">{children}</body>
    </html>
  );
}
