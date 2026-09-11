import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["firebase-admin", "jwks-rsa", "jose"],
  experimental: {
    serverActions: {
      // Padrão do Next.js é 1MB, insuficiente para o upload de várias
      // fotos de produto (formulário de cadastro/edição em /admin/produtos).
      bodySizeLimit: "20mb",
    },
  },
};

export default nextConfig;
