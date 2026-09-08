"use server";

import { redirect } from "next/navigation";
import { createSessionCookie, clearSessionCookie } from "@/lib/session";

export async function createSession(idToken: string): Promise<{ error?: string }> {
  try {
    await createSessionCookie(idToken);
  } catch {
    return { error: "Não foi possível iniciar a sessão. Tente novamente." };
  }
  redirect("/admin");
}

export async function logout(): Promise<void> {
  await clearSessionCookie();
  redirect("/admin/login");
}
