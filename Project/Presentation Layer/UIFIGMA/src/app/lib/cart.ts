import type { CartItem } from './mock-data';

const CART_KEY = 'leon_cart';

export function getCart(): CartItem[] {
  try {
    const stored = localStorage.getItem(CART_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveCart(items: CartItem[]): void {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event('cart-updated'));
}

export function addToCart(item: CartItem): void {
  const cart = getCart();
  const idx = cart.findIndex(i => i.variantId === item.variantId);
  if (idx >= 0) {
    cart[idx].quantity += item.quantity;
  } else {
    cart.push(item);
  }
  saveCart(cart);
}

export function updateCartQuantity(variantId: string, quantity: number): void {
  const cart = getCart().map(i => (i.variantId === variantId ? { ...i, quantity } : i));
  saveCart(cart);
}

export function removeFromCart(variantId: string): void {
  saveCart(getCart().filter(i => i.variantId !== variantId));
}

export function clearCart(): void {
  saveCart([]);
}

export function getCartCount(): number {
  return getCart().reduce((sum, i) => sum + i.quantity, 0);
}
