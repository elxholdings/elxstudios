export const orderStatuses = [
  'Submitted',
  'Awaiting quote',
  'Quote sent',
  'Awaiting payment',
  'Paid',
  'Assigned',
  'In progress',
  'Quality review',
  'Ready for delivery',
  'Delivered',
  'Revision requested',
  'Completed',
] as const;

export type OrderStatus = (typeof orderStatuses)[number];

export type LocalOrder = {
  id: string;
  title: string;
  category: string;
  subservice: string;
  purpose: string;
  deadline: string;
  outputFormat: string;
  brief: string;
  files: string[];
  status: OrderStatus;
  paymentStatus: string;
  createdAt: string;
  updatedAt: string;
};

const STORAGE_KEY = 'elx-studio-orders-v1';

export function readLocalOrders(): LocalOrder[] {
  if (typeof window === 'undefined') return [];
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return value ? (JSON.parse(value) as LocalOrder[]) : [];
  } catch {
    return [];
  }
}

export function saveLocalOrder(order: LocalOrder) {
  const orders = readLocalOrders().filter((item) => item.id !== order.id);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify([order, ...orders]));
}

export function updateLocalOrderStatus(id: string, status: OrderStatus) {
  const orders = readLocalOrders().map((order) => order.id === id ? { ...order, status, updatedAt: new Date().toISOString() } : order);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  return orders;
}
