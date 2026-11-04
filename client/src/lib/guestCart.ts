export interface GuestCartItem {
  id: string;
  productId: number;
  productName: string;
  imageUrl?: string | null;
  quantity: number;
  selectedSize?: string;
  price: string;
}

const STORAGE_KEY = "omaluxe-guest-cart";
const CHANGE_EVENT = "omaluxe:guest-cart-changed";
const ORDER_KEY = "omaluxe-guest-order";

export function getGuestCart(): GuestCartItem[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const value: unknown = JSON.parse(stored);
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function saveGuestCart(items: GuestCartItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function addGuestCartItem(item: Omit<GuestCartItem, "id">) {
  const items = getGuestCart();
  const existing = items.find(
    (current) =>
      current.productId === item.productId &&
      current.selectedSize === item.selectedSize
  );
  if (existing) {
    existing.quantity += item.quantity;
  } else {
    items.push({
      ...item,
      id: `${item.productId}-${item.selectedSize ?? "default"}`,
    });
  }
  saveGuestCart(items);
}

export function updateGuestCartItem(id: string, quantity: number) {
  saveGuestCart(
    getGuestCart().map((item) => (item.id === id ? { ...item, quantity } : item))
  );
}

export function removeGuestCartItem(id: string) {
  saveGuestCart(getGuestCart().filter((item) => item.id !== id));
}

export function clearGuestCart() {
  saveGuestCart([]);
}

export function guestCartChangedEvent() {
  return CHANGE_EVENT;
}

export function saveGuestOrder(order: unknown) {
  localStorage.setItem(ORDER_KEY, JSON.stringify(order));
}

export function getGuestOrder<T>() {
  try {
    const stored = localStorage.getItem(ORDER_KEY);
    return stored ? (JSON.parse(stored) as T) : null;
  } catch {
    return null;
  }
}
