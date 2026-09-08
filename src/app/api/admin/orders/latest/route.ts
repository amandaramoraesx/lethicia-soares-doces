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
  const pending = orders.filter((order) => order.status === "recebido");

  return NextResponse.json({
    pendingCount: pending.length,
    latestId: orders[0]?.id ?? null,
    latestCreatedAt: orders[0]?.createdAt ?? null,
  });
}
