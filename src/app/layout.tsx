import type { Metadata } from "next";
import { Poppins, Inter } from "next/font/google";
import "./globals.css";
import { Analytics } from "@/components/analytics/Analytics";
import { OwlWhatsApp } from "@/components/shared/OwlWhatsApp";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});
const inter = Inter({ subsets: ["latin"], variable: "--font-body", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: {
    default: "OWL PRINT — Cardápios Personalizados",
    template: "%s | OWL PRINT",
  },
  description:
    "Cardápios, cartas de vinho e acessórios em couro personalizados para restaurantes, bares, hotéis e motéis. Design exclusivo e acabamento premium.",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "OWL PRINT",
    title: "OWL PRINT — Cardápios que Contam Histórias",
    description: "Soluções personalizadas para restaurantes, bares, hotéis e motéis.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${poppins.variable} ${inter.variable}`}>
      <body>
        {children}
        <OwlWhatsApp />
        <Analytics />
      </body>
    </html>
  );
}
