"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { resetTestData } from "@/lib/db/reset";

const CONFIRMATION_WORD = "APAGAR";

export async function resetTestDataAction(formData: FormData) {
  const confirmation = formData.get("confirmation")?.toString().trim().toUpperCase() ?? "";
  if (confirmation !== CONFIRMATION_WORD) {
    redirect("/admin/configuracoes?resetError=1");
  }

  await resetTestData();

  revalidatePath("/admin");
  revalidatePath("/admin/pedidos");
  revalidatePath("/admin/encomendas");
  revalidatePath("/admin/financeiro");
  revalidatePath("/admin/clientes");
  revalidatePath("/admin/configuracoes");
  redirect("/admin/configuracoes?reset=1");
}
