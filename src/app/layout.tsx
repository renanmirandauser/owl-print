import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import { Analytics } from "@/components/analytics/Analytics";
import { OwlWhatsApp } from "@/components/shared/OwlWhatsApp";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: {
    default: "OWL PRINT — Cardápios Personalizados",
    template: "%s | OWL PRINT",
  },
  description:
    "Cardápios, cartas de vinho e acessórios de couro personalizados para restaurantes, bares, hotéis e motéis.",
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
    <html lang="pt-BR" className={`${playfair.variable} ${inter.variable}`}>
      <body>
        {children}
        <OwlWhatsApp />
        <Analytics />
      </body>
    </html>
  );
}
