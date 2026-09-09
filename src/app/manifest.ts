import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Lethícia Soares Doces",
    short_name: "Lethícia Doces",
    description: "Cardápio digital da Lethícia Soares Doces",
    start_url: "/",
    display: "standalone",
    background_color: "#faf3ec",
    theme_color: "#faf3ec",
    icons: [
      {
        src: "/logo-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/logo-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/logo-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
