// ===== Reusable UI Components =====
import { icon, formatPrice } from './utils.js';

// ProductCard component
export function ProductCard(product) {
  const displayPrice = product.salePrice || product.basePrice;
  const hasDiscount = !!product.salePrice;
  const totalStock = product.variants.reduce((sum, v) => sum + v.stock, 0);
  const isOutOfStock = totalStock === 0;
  const discountPercent = hasDiscount ? Math.round((1 - displayPrice / product.basePrice) * 100) : 0;

  return `
    <div class="group bg-white rounded-xl border border-border overflow-hidden hover:shadow-lg transition-all">
      <a href="#/product/${product.id}" class="block">
        <div class="aspect-square relative overflow-hidden">
          <img src="${product.images[0]}" alt="${product.name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          <div class="absolute top-2 left-2 flex flex-col gap-1">
            ${hasDiscount ? `<span class="badge bg-accent text-white text-xs">-${discountPercent}%</span>` : ''}
            ${isOutOfStock ? `<span class="badge bg-gray-800 text-white text-xs">Hết hàng</span>` : ''}
            ${product.isNew ? `<span class="badge bg-info text-white text-xs">Mới</span>` : ''}
          </div>
        </div>
      </a>
      <div class="p-4">
        <a href="#/product/${product.id}">
          <p class="text-xs text-text-secondary mb-1">${product.category}</p>
          <h3 class="product-title mb-2">${product.name}</h3>
        </a>
        <div class="flex items-baseline gap-2 mb-3">
          <span class="${hasDiscount ? 'price-sale' : 'font-semibold'}">${formatPrice(displayPrice)}</span>
          ${hasDiscount ? `<span class="price-old text-sm">${formatPrice(product.basePrice)}</span>` : ''}
        </div>
        <button
          class="btn btn-default w-full text-sm"
          ${isOutOfStock ? 'disabled' : ''}
          onclick="event.preventDefault(); window.__addToCartQuick && window.__addToCartQuick('${product.id}')"
        >
          ${icon('shopping-cart', 'w-4 h-4')}
          ${isOutOfStock ? 'Hết hàng' : 'Thêm vào giỏ'}
        </button>
      </div>
    </div>
  `;
}

// StatusBadge component
export function StatusBadge(status, type = 'order', extraClass = '') {
  const orderStatusMap = {
    pending: { label: 'Chờ xử lý', class: 'bg-yellow-100 text-yellow-800' },
    confirmed: { label: 'Đã xác nhận', class: 'bg-blue-100 text-blue-800' },
    shipping: { label: 'Đang giao', class: 'bg-purple-100 text-purple-800' },
    completed: { label: 'Hoàn thành', class: 'bg-green-100 text-green-800' },
    cancelled: { label: 'Đã hủy', class: 'bg-red-100 text-red-800' },
  };

  const paymentStatusMap = {
    paid: { label: 'Đã thanh toán', class: 'bg-green-100 text-green-800' },
    unpaid: { label: 'Chưa thanh toán', class: 'bg-red-100 text-red-800' },
    pending: { label: 'Chờ thanh toán', class: 'bg-yellow-100 text-yellow-800' },
    refunded: { label: 'Đã hoàn tiền', class: 'bg-gray-100 text-gray-800' },
  };

  const map = type === 'payment' ? paymentStatusMap : orderStatusMap;
  const info = map[status] || { label: status, class: 'bg-gray-100 text-gray-800' };

  return `<span class="badge ${info.class} ${extraClass}">${info.label}</span>`;
}
