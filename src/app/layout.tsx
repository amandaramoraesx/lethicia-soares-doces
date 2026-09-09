import type { Metadata, Viewport } from "next";
import { Quicksand, Dancing_Script } from "next/font/google";
import "./globals.css";

const quicksand = Quicksand({
  variable: "--font-quicksand",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const dancingScript = Dancing_Script({
  variable: "--font-dancing-script",
  subsets: ["latin"],
  weight: ["600", "700"],
});

export const metadata: Metadata = {
  title: "Lethícia Soares Doces",
  description: "Cardápio digital e pedidos da Lethícia Soares Doces",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Lethícia Doces",
  },
};

export const viewport: Viewport = {
  themeColor: "#faf3ec",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${quicksand.variable} ${dancingScript.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-cream text-stone-800">{children}</body>
    </html>
  );
}
