"use client";

import { usePathname, useRouter } from "next/navigation";

export default function BackButton() {
  const router = useRouter();
  const pathname = usePathname();

  if (pathname === "/admin") return null;

  return (
    <button
      onClick={() => router.back()}
      className="mb-4 flex items-center gap-1 text-xs font-medium text-stone-400 transition hover:text-pink-deep"
    >
      ← Voltar
    </button>
  );
}
