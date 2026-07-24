import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Orçamentos",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#12273f",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function MobileLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-dvh bg-cream">{children}</div>;
}
