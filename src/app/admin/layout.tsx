import type { Metadata } from "next";
import type { ReactNode } from "react";

// Manifest próprio do painel (separado do cardápio público) — assim, quando a
// lojista adiciona o painel à Tela de Início, ele abre em tela cheia como um
// app, sem a barra de endereço do Safari, igual ao cardápio do cliente.
export const metadata: Metadata = {
  manifest: "/admin-manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Painel Lethícia",
  },
};

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return children;
}
