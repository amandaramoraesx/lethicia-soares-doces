export function waLink(phone: string, message: string): string | null {
  const digits = phone.replace(/\D/g, "");
  if (!digits) return null;
  const withCountryCode = digits.startsWith("55") ? digits : `55${digits}`;
  return `https://wa.me/${withCountryCode}?text=${encodeURIComponent(message)}`;
}

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://lethicia-soares-doces.vercel.app";
