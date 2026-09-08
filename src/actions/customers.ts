"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  createCustomer,
  updateCustomer,
  deleteCustomer,
  registerFiadoPayment,
  getCustomer,
} from "@/lib/db/customers";

const customerSchema = z.object({
  name: z.string().min(1, "Informe o nome do cliente."),
  phone: z.string().min(1, "Informe o telefone."),
  address: z.string().default(""),
});

export async function saveCustomerAction(formData: FormData) {
  const id = formData.get("id")?.toString();
  const parsed = customerSchema.parse({
    name: formData.get("name"),
    phone: formData.get("phone"),
    address: formData.get("address") || "",
  });

  if (id) {
    await updateCustomer(id, parsed);
  } else {
    await createCustomer(parsed);
  }
  revalidatePath("/admin/clientes");
}

export async function deleteCustomerAction(formData: FormData) {
  const id = formData.get("id")?.toString();
  if (!id) return;
  await deleteCustomer(id);
  revalidatePath("/admin/clientes");
}

export async function registerFiadoPaymentAction(formData: FormData) {
  const customerId = formData.get("customerId")?.toString();
  const amount = Number(formData.get("amount") || 0);
  const note = formData.get("note")?.toString() || "Pagamento de fiado";
  if (!customerId || amount <= 0) return;

  const customer = await getCustomer(customerId);
  if (!customer) return;

  await registerFiadoPayment(customerId, customer.name, amount, note);
  revalidatePath(`/admin/clientes/${customerId}`);
  revalidatePath("/admin/clientes");
  revalidatePath("/admin/financeiro");
}
