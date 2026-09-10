import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { listOrders } from "@/lib/db/orders";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const orders = await listOrders();
  // Só conta pedidos feitos pelo cliente no cardápio — pedidos manuais que a
  // própria lojista cadastra não devem disparar o alerta de "novo pedido".
  const fromCardapio = orders.filter((order) => order.source === "cardapio");
  const pending = orders.filter((order) => order.status === "aguardando");

  return NextResponse.json({
    pendingCount: pending.length,
    latestId: fromCardapio[0]?.id ?? null,
    latestCreatedAt: fromCardapio[0]?.createdAt ?? null,
  });
}
