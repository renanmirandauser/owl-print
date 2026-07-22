/* ══════════════════════════════════════════════════════════════════
   DADOS ESTRUTURADOS (Schema.org / JSON-LD) — OWL PRINT
   Renderizado no <head> pelo layout. Ajuda o Google a entender que a
   OWL PRINT é uma empresa local de São Paulo, o que ela fabrica e
   como contatá-la — deixando o resultado da busca mais rico.

   Edite apenas o bloco EMPRESA abaixo se algum dado mudar.
   ══════════════════════════════════════════════════════════════════ */

const SITE = process.env.NEXT_PUBLIC_APP_URL ?? "https://owlprintcardapios.com.br";
const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "5511953098258";

const EMPRESA = {
  nome: "OWL PRINT",
  slogan: "Cardápios que Contam Histórias",
  descricao:
    "Produção própria de cardápios, jogos americanos, porta-contas, porta-talheres e porta-copos personalizados em couro sintético para restaurantes, bares, hotéis, motéis e pubs. Design exclusivo e acabamento premium.",
  instagram: "https://www.instagram.com/owlprint",
  // Regiões onde a OWL PRINT atende (aparecem como área de cobertura)
  areasAtendidas: ["São Paulo", "Grande São Paulo", "Guarulhos", "Osasco", "ABC Paulista"],
  cidade: "São Paulo",
  estado: "SP",
  pais: "BR",
};

export function JsonLd() {
  const telefone = `+${WHATSAPP}`;

  const grafo = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE}/#organization`,
        name: EMPRESA.nome,
        url: SITE,
        logo: {
          "@type": "ImageObject",
          url: `${SITE}/owllogo.png`,
        },
        description: EMPRESA.descricao,
        sameAs: [EMPRESA.instagram],
        contactPoint: {
          "@type": "ContactPoint",
          telephone: telefone,
          contactType: "sales",
          areaServed: EMPRESA.pais,
          availableLanguage: ["Portuguese"],
        },
      },
      {
        "@type": "LocalBusiness",
        "@id": `${SITE}/#business`,
        name: EMPRESA.nome,
        image: `${SITE}/owllogo.png`,
        url: SITE,
        telephone: telefone,
        description: EMPRESA.descricao,
        slogan: EMPRESA.slogan,
        priceRange: "$$",
        parentOrganization: { "@id": `${SITE}/#organization` },
        address: {
          "@type": "PostalAddress",
          addressLocality: EMPRESA.cidade,
          addressRegion: EMPRESA.estado,
          addressCountry: EMPRESA.pais,
        },
        areaServed: EMPRESA.areasAtendidas.map((nome) => ({
          "@type": "City",
          name: nome,
        })),
        knowsAbout: [
          "Cardápios personalizados",
          "Cardápios em couro sintético",
          "Jogos americanos",
          "Porta-contas",
          "Porta-talheres",
          "Porta-copos",
          "Acessórios para restaurantes",
        ],
        makesOffer: {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Cardápios e acessórios de mesa personalizados em couro sintético",
            serviceType: "Produção sob medida para restaurantes, bares e hotéis",
          },
        },
      },
      {
        "@type": "WebSite",
        "@id": `${SITE}/#website`,
        url: SITE,
        name: EMPRESA.nome,
        inLanguage: "pt-BR",
        publisher: { "@id": `${SITE}/#organization` },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      // JSON estático e controlado — seguro para dangerouslySetInnerHTML
      dangerouslySetInnerHTML={{ __html: JSON.stringify(grafo) }}
    />
  );
}
