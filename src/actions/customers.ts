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
  street: z.string().default(""),
  number: z.string().default(""),
  neighborhood: z.string().default(""),
  zipCode: z.string().default(""),
  internalNote: z.string().default(""),
});

function composeAddress(fields: {
  street: string;
  number: string;
  neighborhood: string;
  zipCode: string;
}): string {
  const streetLine = [fields.street, fields.number && `nº ${fields.number}`]
    .filter(Boolean)
    .join(", ");
  const parts = [streetLine, fields.neighborhood, fields.zipCode && `CEP ${fields.zipCode}`].filter(
    Boolean
  );
  return parts.join(" - ");
}

export async function saveCustomerAction(formData: FormData) {
  const id = formData.get("id")?.toString();
  const parsed = customerSchema.parse({
    name: formData.get("name"),
    phone: formData.get("phone"),
    street: formData.get("street") || "",
    number: formData.get("number") || "",
    neighborhood: formData.get("neighborhood") || "",
    zipCode: formData.get("zipCode") || "",
    internalNote: formData.get("internalNote") || "",
  });

  const hasAddressInput = Boolean(
    parsed.street || parsed.number || parsed.neighborhood || parsed.zipCode
  );

  if (id) {
    const data: Partial<{ name: string; phone: string; address: string; internalNote: string }> = {
      name: parsed.name,
      phone: parsed.phone,
      internalNote: parsed.internalNote,
    };
    if (hasAddressInput) {
      data.address = composeAddress(parsed);
    }
    await updateCustomer(id, data);
  } else {
    await createCustomer({
      name: parsed.name,
      phone: parsed.phone,
      address: composeAddress(parsed),
      internalNote: parsed.internalNote,
    });
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
