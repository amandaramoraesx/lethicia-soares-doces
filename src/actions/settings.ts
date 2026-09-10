"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getStoreSettings, updateStoreSettings, setManuallyClosed } from "@/lib/db/settings";
import { WEEKDAYS, type StoreSettings } from "@/lib/types";

export async function saveSettingsAction(formData: FormData) {
  const current = await getStoreSettings();

  const hours = {} as StoreSettings["hours"];
  for (const { key } of WEEKDAYS) {
    hours[key] = {
      closed: formData.get(`active_${key}`) !== "on",
      open: formData.get(`open_${key}`)?.toString() || "09:00",
      close: formData.get(`close_${key}`)?.toString() || "18:00",
    };
  }

  const settings: StoreSettings = {
    name: formData.get("name")?.toString() || "",
    logoUrl: current.logoUrl,
    whatsapp: formData.get("whatsapp")?.toString() || "",
    instagram: formData.get("instagram")?.toString() || "",
    address: formData.get("address")?.toString() || "",
    deliveryFee: Number(formData.get("deliveryFee") || 0),
    minOrder: Number(formData.get("minOrder") || 0),
    pixKey: formData.get("pixKey")?.toString() || "",
    hours,
    manuallyClosed: current.manuallyClosed,
  };

  await updateStoreSettings(settings);
  revalidatePath("/admin/configuracoes");
  revalidatePath("/admin/produtos");
  revalidatePath("/");
  redirect("/admin/configuracoes?saved=1");
}

export async function toggleStoreOpenAction(formData: FormData) {
  const closed = formData.get("closed") === "true";
  await setManuallyClosed(closed);
  revalidatePath("/admin/configuracoes");
  revalidatePath("/admin/produtos");
  revalidatePath("/");
}
