export type OrderStatus = "aguardando" | "recebido" | "preparo" | "saiu_entrega" | "entregue" | "cancelado";
export type DeliveryType = "retirada" | "entrega";
export type PaymentMethod =
  | "dinheiro"
  | "pix"
  | "cartao"
  | "cartao_debito"
  | "cartao_credito"
  | "link_cartao"
  | "informar_depois"
  | "fiado";
export type FinancialEntryType = "entrada" | "saida";
export type FiadoEntryType = "venda" | "pagamento";
export type StockUnit = "un" | "kg" | "g" | "l" | "ml";

export interface WeekdayHours {
  closed: boolean;
  open: string;
  close: string;
}

export interface StoreSettings {
  name: string;
  logoUrl: string;
  whatsapp: string;
  instagram: string;
  address: string;
  deliveryFee: number;
  minOrder: number;
  pixKey: string;
  hours: Record<
    "seg" | "ter" | "qua" | "qui" | "sex" | "sab" | "dom",
    WeekdayHours
  >;
  manuallyClosed: boolean;
}

export interface RecipeItem {
  ingredientId: string;
  quantity: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrls: string[];
  active: boolean;
  featured: boolean;
  stockControl: boolean;
  stockQty: number;
  recipe: RecipeItem[];
  createdAt: string;
}

// Doces cadastrados antes do suporte a múltiplas fotos guardaram uma única
// `imageUrl` no Firestore. Normaliza os dois formatos para `imageUrls: string[]`.
export function normalizeProduct(id: string, data: Record<string, unknown>): Product {
  const legacyImageUrl = typeof data.imageUrl === "string" ? data.imageUrl : "";
  const imageUrls = Array.isArray(data.imageUrls)
    ? (data.imageUrls as string[])
    : legacyImageUrl
      ? [legacyImageUrl]
      : [];
  return { id, ...data, imageUrls } as Product;
}

export type OrderCatalogCategory = "bolo" | "docinho";

export interface OrderCatalogItem {
  id: string;
  name: string;
  description: string;
  category: OrderCatalogCategory;
  imageUrls: string[];
  active: boolean;
  createdAt: string;
}

export function normalizeOrderCatalogItem(id: string, data: Record<string, unknown>): OrderCatalogItem {
  const imageUrls = Array.isArray(data.imageUrls) ? (data.imageUrls as string[]) : [];
  return { id, ...data, imageUrls } as OrderCatalogItem;
}

export const ORDER_CATALOG_CATEGORY_LABELS: Record<OrderCatalogCategory, string> = {
  bolo: "Bolos",
  docinho: "Docinhos",
};

export interface Ingredient {
  id: string;
  name: string;
  unit: StockUnit;
  costPerUnit: number;
  stockQty: number;
  minStockQty: number;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  createdAt: string;
  status: OrderStatus;
  customerId: string | null;
  customerName: string;
  customerPhone: string;
  deliveryType: DeliveryType;
  address: string;
  paymentMethod: PaymentMethod;
  notes: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  deliveryFeePending: boolean;
  total: number;
  source: "cardapio" | "manual";
  rejectionReason: string | null;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  internalNote: string;
  createdAt: string;
  fiadoBalance: number;
}

export interface FiadoEntry {
  id: string;
  customerId: string;
  type: FiadoEntryType;
  amount: number;
  date: string;
  note: string;
  orderId: string | null;
  receivableId: string | null;
}

export interface FinancialEntry {
  id: string;
  type: FinancialEntryType;
  categoryId: string;
  categoryName: string;
  description: string;
  amount: number;
  date: string;
  orderId: string | null;
  customerId: string | null;
  paymentMethod: PaymentMethod | null;
}

export interface AccountReceivable {
  id: string;
  customerId: string;
  customerName: string;
  orderId: string | null;
  originalAmount: number;
  paidAmount: number;
  status: "aberta" | "quitada";
  createdAt: string;
}

export type CustomOrderUnit = "un" | "kg";
export type CustomOrderStatus = "pendente" | "entregue" | "cancelada";
export type CustomOrderItemType = "bolo" | "docinho" | "outro";

export interface CustomOrder {
  id: string;
  customerId: string | null;
  customerName: string;
  doceName: string;
  quantity: number;
  unit: CustomOrderUnit;
  deliveryDate: string;
  notes: string;
  status: CustomOrderStatus;
  createdAt: string;
  // Campos estruturados opcionais (pedidos criados a partir do seletor de
  // Bolo/Docinhos) — usados para exibir o card de forma organizada em vez de
  // depender de decompor `doceName`. Ausentes em pedidos antigos ou "Outro".
  itemType?: CustomOrderItemType;
  sabores?: string[];
  massa?: string;
  tamanho?: string;
}

export interface AccountPayable {
  id: string;
  description: string;
  categoryId: string;
  categoryName: string;
  amount: number;
  dueDate: string;
  status: "aberta" | "paga";
  paidAt: string | null;
  createdAt: string;
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  aguardando: "Aguardando confirmação",
  recebido: "Recebido",
  preparo: "Em preparo",
  saiu_entrega: "Saiu para entrega",
  entregue: "Entregue",
  cancelado: "Cancelado",
};

// Pedido de retirada não "sai para entrega" nem é "entregue" — usa o
// equivalente de balcão. O status salvo no banco continua o mesmo
// (saiu_entrega/entregue), só o texto exibido muda conforme o tipo do pedido.
export function getOrderStatusLabel(status: OrderStatus, deliveryType: DeliveryType): string {
  if (deliveryType === "retirada") {
    if (status === "saiu_entrega") return "Pronto para retirada";
    if (status === "entregue") return "Retirado";
  }
  return ORDER_STATUS_LABELS[status];
}

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  dinheiro: "Dinheiro",
  pix: "Pix",
  cartao: "Cartão",
  cartao_debito: "Cartão débito",
  cartao_credito: "Cartão crédito",
  link_cartao: "Link de cartão",
  informar_depois: "Informar depois",
  fiado: "Fiado",
};

export const CHECKOUT_PAYMENT_METHODS_BY_DELIVERY: Record<DeliveryType, PaymentMethod[]> = {
  entrega: ["link_cartao", "pix"],
  retirada: ["cartao_debito", "cartao_credito", "dinheiro", "pix", "informar_depois"],
};

export const WEEKDAYS: Array<{ key: keyof StoreSettings["hours"]; label: string }> = [
  { key: "seg", label: "Segunda" },
  { key: "ter", label: "Terça" },
  { key: "qua", label: "Quarta" },
  { key: "qui", label: "Quinta" },
  { key: "sex", label: "Sexta" },
  { key: "sab", label: "Sábado" },
  { key: "dom", label: "Domingo" },
];
