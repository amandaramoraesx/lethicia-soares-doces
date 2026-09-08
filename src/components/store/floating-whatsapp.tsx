export default function FloatingWhatsApp({ whatsapp }: { whatsapp: string }) {
  if (!whatsapp) return null;

  const href = `https://wa.me/${whatsapp}?text=${encodeURIComponent("Olá! Vim pelo cardápio digital 🍰")}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar no WhatsApp"
      className="fixed bottom-5 right-5 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-2xl text-white shadow-lg transition hover:scale-105"
    >
      💬
    </a>
  );
}
