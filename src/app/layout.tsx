import type { Metadata } from "next";
import { Poppins, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Analytics } from "@/components/analytics/Analytics";
import { OwlWhatsApp } from "@/components/shared/OwlWhatsApp";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-display",
  display: "swap",
});
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: {
    default: "OWL PRINT — Cardápios Personalizados",
    template: "%s | OWL PRINT",
  },
  description:
    "Cardápios, Jogos americanos, Porta-Contas, Porta-Talhares, Porta Copos para Restaurantes, bares, hotéis, motéis e PUB's. Design exclusivo e acabamento premium.",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "OWL PRINT",
    title: "OWL PRINT — Cardápios que Contam Histórias",
    description: "Soluções personalizadas para restaurantes, bares, hotéis, motéis e pubs.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${poppins.variable} ${jakarta.variable}`}>
      <body>
        {children}
        <OwlWhatsApp />
        <Analytics />
      </body>
    </html>
  );
}
