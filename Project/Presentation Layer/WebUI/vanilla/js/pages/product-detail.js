// ===== Product Detail Page =====
import { mockProducts, addToCart } from '../data.js';
import { ProductCard } from '../components.js';
import { icon, formatPrice, initIcons } from '../utils.js';
import { toast } from '../toast.js';
import { navigateTo } from '../router.js';

export function renderProductDetailPage(productId) {
  const product = mockProducts.find(p => p.id === productId);
  if (!product) {
    return `
      <div class="min-h-screen flex items-center justify-center">
        <div class="text-center">
          <h2 class="text-2xl font-semibold mb-4">Sản phẩm không tồn tại</h2>
          <a href="#/shop" class="btn btn-default">Về trang sản phẩm</a>
        </div>
      </div>
    `;
  }

  const displayPrice = product.salePrice || product.basePrice;
  const hasDiscount = !!product.salePrice;
  const availableSizes = [...new Set(product.variants.map(v => v.size))].sort();
  const availableColors = [...new Set(product.variants.map(v => v.color))].sort();
  const relatedProducts = mockProducts.filter(p => p.id !== product.id && p.category === product.category).slice(0, 4);

  return `
    <div class="py-8 bg-white min-h-screen">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Breadcrumb -->
        <nav class="mb-8 flex items-center gap-2 text-sm">
          <a href="#/" class="text-text-secondary hover:text-primary">Trang chủ</a>
          <span class="text-text-secondary">/</span>
          <a href="#/shop" class="text-text-secondary hover:text-primary">Sản phẩm</a>
          <span class="text-text-secondary">/</span>
          <span class="text-primary">${product.name}</span>
        </nav>

        <button class="btn btn-ghost mb-4" onclick="history.back()">
          ${icon('chevron-left', 'w-4 h-4')} Quay lại
        </button>

        <!-- Product Detail -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <!-- Images -->
          <div>
            <div class="aspect-square rounded-xl overflow-hidden bg-surface mb-4 relative">
              <img id="main-image" src="${product.images[0]}" alt="${product.name}" class="w-full h-full object-cover" />
              ${hasDiscount ? `<span class="badge bg-accent text-white absolute top-4 left-4">Sale ${Math.round((1 - displayPrice / product.basePrice) * 100)}%</span>` : ''}
            </div>
            ${product.images.length > 1 ? `
              <div class="grid grid-cols-4 gap-4">
                ${product.images.map((img, i) => `
                  <button class="aspect-square rounded-lg overflow-hidden border-2 transition-colors ${i === 0 ? 'border-primary' : 'border-transparent'}" data-thumb="${i}">
                    <img src="${img}" alt="${product.name} ${i + 1}" class="w-full h-full object-cover" />
                  </button>
                `).join('')}
              </div>
            ` : ''}
          </div>

          <!-- Product Info -->
          <div>
            <div class="mb-4">
              <span class="badge badge-outline mb-2">${product.category}</span>
              <h1 class="text-3xl font-bold mb-2">${product.name}</h1>
              <p class="text-text-secondary text-sm">Mã: ${product.code}</p>
            </div>

            <div class="flex items-baseline gap-4 mb-6">
              <span class="${hasDiscount ? 'price-sale text-3xl' : 'text-3xl font-bold'}">${formatPrice(displayPrice)}</span>
              ${hasDiscount ? `<span class="price-old text-xl">${formatPrice(product.basePrice)}</span>` : ''}
            </div>

            <div class="border-t border-b border-border py-6 mb-6">
              <p class="text-text-secondary">${product.description}</p>
            </div>

            <!-- Size Selection -->
            <div class="mb-6">
              <div class="flex items-center justify-between mb-3">
                <label class="font-medium">Chọn size:</label>
                <span class="text-sm text-text-secondary" id="stock-info"></span>
              </div>
              <div class="flex flex-wrap gap-2" id="size-options">
                ${availableSizes.map(size => `
                  <button class="btn btn-outline" data-size="${size}">${size}</button>
                `).join('')}
              </div>
            </div>

            <!-- Color Selection -->
            <div class="mb-6">
              <label class="font-medium block mb-3">Chọn màu:</label>
              <div class="flex flex-wrap gap-2" id="color-options">
                ${availableColors.map(color => `
                  <button class="btn btn-outline" data-color="${color}">${color}</button>
                `).join('')}
              </div>
            </div>

            <!-- Quantity -->
            <div class="mb-8">
              <label class="font-medium block mb-3">Số lượng:</label>
              <div class="flex items-center gap-4">
                <div class="flex items-center border border-border rounded-lg">
                  <button class="btn btn-ghost btn-icon" id="qty-minus">${icon('minus', 'w-4 h-4')}</button>
                  <span class="w-12 text-center font-medium" id="qty-display">1</span>
                  <button class="btn btn-ghost btn-icon" id="qty-plus">${icon('plus', 'w-4 h-4')}</button>
                </div>
                <span class="text-sm text-text-secondary" id="max-qty-info"></span>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex gap-4 mb-6">
              <button class="btn btn-default btn-lg flex-1" id="add-to-cart-btn" disabled>
                ${icon('shopping-cart', 'w-5 h-5')} Thêm vào giỏ
              </button>
              <button class="btn btn-outline btn-lg flex-1" id="buy-now-btn" disabled>
                Mua ngay
              </button>
            </div>

            <div class="flex gap-4">
              <button class="btn btn-outline btn-sm flex-1">${icon('heart', 'w-4 h-4')} Yêu thích</button>
              <button class="btn btn-outline btn-sm flex-1">${icon('share-2', 'w-4 h-4')} Chia sẻ</button>
            </div>
          </div>
        </div>

        <!-- Tabs -->
        <div class="mb-16">
          <div class="tabs-list mb-6">
            <button class="tab-trigger active" data-tab="description">Mô tả</button>
            <button class="tab-trigger" data-tab="material">Chất liệu</button>
            <button class="tab-trigger" data-tab="care">Hướng dẫn bảo quản</button>
          </div>
          <div class="tab-content active" id="tab-description">
            <div class="prose max-w-none">
              <p>${product.description}</p>
              <p class="mt-4">Sản phẩm được thiết kế với form dáng hiện đại, phù hợp với nhiều phong cách khác nhau. Chất liệu cao cấp đảm bảo sự thoải mái khi mặc.</p>
            </div>
          </div>
          <div class="tab-content" id="tab-material">
            <div class="prose max-w-none">
              <h3>Chất liệu</h3>
              <p>${product.material}</p>
              <h3 class="mt-4">Đặc tính</h3>
              <ul>
                <li>Mềm mại, thoáng mát</li>
                <li>Thấm hút mồ hôi tốt</li>
                <li>Bền màu, không phai</li>
                <li>Dễ giặt, dễ bảo quản</li>
              </ul>
            </div>
          </div>
          <div class="tab-content" id="tab-care">
            <div class="prose max-w-none">
              <h3>Hướng dẫn bảo quản</h3>
              <ul>
                <li>Giặt máy ở nhiệt độ thường</li>
                <li>Không sử dụng chất tẩy mạnh</li>
                <li>Phơi nơi thoáng mát, tránh ánh nắng trực tiếp</li>
                <li>Ủi ở nhiệt độ thấp nếu cần</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Related Products -->
        ${relatedProducts.length > 0 ? `
          <div>
            <h2 class="text-2xl font-bold mb-6">Sản phẩm liên quan</h2>
            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              ${relatedProducts.map(p => ProductCard(p)).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    </div>
  `;
}

export function setupProductDetailEvents(productId) {
  const product = mockProducts.find(p => p.id === productId);
  if (!product) return;

  let selectedSize = '';
  let selectedColor = '';
  let quantity = 1;
  const displayPrice = product.salePrice || product.basePrice;

  function getSelectedVariant() {
    return product.variants.find(
      v => (!selectedSize || v.size === selectedSize) && (!selectedColor || v.color === selectedColor)
    );
  }

  function updateUI() {
    const variant = getSelectedVariant();
    const maxQty = variant?.stock || 0;
    const isOutOfStock = maxQty === 0;

    // Update stock info
    const stockInfo = document.getElementById('stock-info');
    if (stockInfo && selectedSize && variant) {
      stockInfo.textContent = `Còn ${variant.stock} sản phẩm`;
    }

    // Update max qty info
    const maxQtyInfo = document.getElementById('max-qty-info');
    if (maxQtyInfo && maxQty > 0) maxQtyInfo.textContent = `Tối đa ${maxQty} sản phẩm`;

    // Update qty display
    if (quantity > maxQty && maxQty > 0) quantity = maxQty;
    document.getElementById('qty-display').textContent = quantity;

    // Update buttons
    const canAdd = selectedSize && selectedColor && !isOutOfStock;
    document.getElementById('add-to-cart-btn').disabled = !canAdd;
    document.getElementById('buy-now-btn').disabled = !canAdd;

    // Update size buttons appearance
    document.querySelectorAll('[data-size]').forEach(btn => {
      const size = btn.dataset.size;
      const hasStock = product.variants.some(
        v => v.size === size && (!selectedColor || v.color === selectedColor) && v.stock > 0
      );
      btn.disabled = !hasStock;
      btn.className = `btn ${selectedSize === size ? 'btn-default' : 'btn-outline'}`;
    });

    // Update color buttons appearance
    document.querySelectorAll('[data-color]').forEach(btn => {
      const color = btn.dataset.color;
      const hasStock = product.variants.some(
        v => v.color === color && (!selectedSize || v.size === selectedSize) && v.stock > 0
      );
      btn.disabled = !hasStock;
      btn.className = `btn ${selectedColor === color ? 'btn-default' : 'btn-outline'}`;
    });
  }

  // Size selection
  document.querySelectorAll('[data-size]').forEach(btn => {
    btn.addEventListener('click', () => { selectedSize = btn.dataset.size; updateUI(); });
  });

  // Color selection
  document.querySelectorAll('[data-color]').forEach(btn => {
    btn.addEventListener('click', () => { selectedColor = btn.dataset.color; updateUI(); });
  });

  // Quantity
  document.getElementById('qty-minus')?.addEventListener('click', () => {
    if (quantity > 1) { quantity--; updateUI(); }
  });
  document.getElementById('qty-plus')?.addEventListener('click', () => {
    const variant = getSelectedVariant();
    if (variant && quantity < variant.stock) { quantity++; updateUI(); }
  });

  // Thumbnails
  document.querySelectorAll('[data-thumb]').forEach(btn => {
    btn.addEventListener('click', () => {
      const index = parseInt(btn.dataset.thumb);
      document.getElementById('main-image').src = product.images[index];
      document.querySelectorAll('[data-thumb]').forEach(b => {
        b.className = `aspect-square rounded-lg overflow-hidden border-2 transition-colors ${b.dataset.thumb == index ? 'border-primary' : 'border-transparent'}`;
      });
    });
  });

  // Tabs
  document.querySelectorAll('.tab-trigger').forEach(trigger => {
    trigger.addEventListener('click', () => {
      document.querySelectorAll('.tab-trigger').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      trigger.classList.add('active');
      document.getElementById(`tab-${trigger.dataset.tab}`)?.classList.add('active');
    });
  });

  // Add to cart
  document.getElementById('add-to-cart-btn')?.addEventListener('click', () => {
    if (!selectedSize) { toast.error('Vui lòng chọn size'); return; }
    if (!selectedColor) { toast.error('Vui lòng chọn màu'); return; }
    const variant = getSelectedVariant();
    if (!variant) { toast.error('Sản phẩm không khả dụng'); return; }

    addToCart({
      variantId: variant.id,
      productId: product.id,
      productName: product.name,
      variantLabel: `${variant.size} / ${variant.color}`,
      quantity,
      price: variant.price || displayPrice,
      image: product.images[0],
      stock: variant.stock,
    });
    toast.success('Đã thêm vào giỏ hàng');
  });

  // Buy now
  document.getElementById('buy-now-btn')?.addEventListener('click', () => {
    document.getElementById('add-to-cart-btn')?.click();
    navigateTo('/cart');
  });

  updateUI();
}
