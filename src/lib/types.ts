export type OrderStatus = "aguardando" | "recebido" | "preparo" | "pronto" | "entregue" | "cancelado";
export type DeliveryType = "retirada" | "entrega";
export type PaymentMethod = "dinheiro" | "pix" | "cartao" | "fiado";
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
  pronto: "Pronto",
  entregue: "Entregue",
  cancelado: "Cancelado",
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  dinheiro: "Dinheiro",
  pix: "Pix",
  cartao: "Cartão",
  fiado: "Fiado",
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
