import type { Metadata } from "next";
import { LinksClient } from "@/components/site/LinksClient";

export const metadata: Metadata = {
  title: "Links",
  description:
    "Links da OWL PRINT — orçamento, loja, produtos e portfólio de cardápios e acessórios em couro sintético.",
  // Página de bio não precisa ser indexada; ela só direciona o tráfego do Instagram
  robots: { index: false, follow: true },
};

export default function LinksPage() {
  return <LinksClient />;
}
