/** @type {import('next').NextConfig} */

// Cabeçalhos de segurança aplicados a todas as rotas.
// Obs.: NÃO usamos Content-Security-Policy estrita aqui de propósito,
// pois exigiria liberar manualmente Analytics, Meta Pixel, Cloudinary e
// Auth0 — e um erro de CSP derruba o site inteiro. Pode ser adicionada
// depois, com cuidado, em modo "report-only" primeiro.
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },
  experimental: { serverActions: { bodySizeLimit: "5mb" } },
  poweredByHeader: false, // remove o header "X-Powered-By: Next.js"
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
