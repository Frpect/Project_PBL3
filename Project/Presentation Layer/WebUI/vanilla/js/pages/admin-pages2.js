// ===== Admin Pages Part 2 (Inventory, POS, Promotions, Staff) =====
import { products, mockProducts, inventoryLogs, promotions, categories, staffAccounts } from '../data.js';
import { icon, formatPrice, formatDate, showDialog, showConfirm, initIcons } from '../utils.js';
import { toast } from '../toast.js';
import { navigateTo } from '../router.js';

// ===== Inventory Page =====
export function renderInventoryPage() {
  const allVariants = [];
  products.forEach(product => {
    product.variants.forEach(variant => {
      allVariants.push({ ...variant, productName: product.name, productCode: product.code });
    });
  });

  return `
    <div>
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-3xl font-bold">Quản lý kho hàng</h1>
          <p class="text-text-secondary mt-2">Quản lý tồn kho và theo dõi nhập/xuất kho</p>
        </div>
        <button class="btn btn-default" id="add-transaction-btn">
          ${icon('package', 'w-4 h-4')} Thêm giao dịch kho
        </button>
      </div>

      <div class="tabs-list mb-6">
        <button class="tab-trigger active" data-tab="inventory">Tồn kho</button>
        <button class="tab-trigger" data-tab="logs">Lịch sử giao dịch</button>
      </div>

      <div class="tab-content active" id="tab-inventory">
        <div class="card">
          <div class="card-header">
            <div class="flex justify-between items-center">
              <h3 class="card-title">Danh sách tồn kho</h3>
              <div class="relative">
                ${icon('search', 'w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary')}
                <input class="input pl-10 w-80" placeholder="Tìm kiếm sản phẩm..." id="inventory-search" />
              </div>
            </div>
          </div>
          <div class="card-content">
            <div class="table-wrapper">
              <table class="data-table">
                <thead>
                  <tr><th>Mã SP</th><th>Tên sản phẩm</th><th>SKU</th><th>Size</th><th>Màu sắc</th><th>Tồn kho</th><th>Trạng thái</th></tr>
                </thead>
                <tbody id="inventory-tbody">
                  ${renderInventoryRows(allVariants)}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div class="tab-content" id="tab-logs">
        <div class="card">
          <div class="card-header"><h3 class="card-title">Lịch sử giao dịch kho (${inventoryLogs.length})</h3></div>
          <div class="card-content">
            <div class="table-wrapper">
              <table class="data-table">
                <thead>
                  <tr><th>Ngày giờ</th><th>Loại</th><th>Sản phẩm</th><th>Biến thể</th><th>Số lượng</th><th>Tồn kho</th><th>Lý do</th><th>Nhân viên</th></tr>
                </thead>
                <tbody>
                  ${inventoryLogs.map(log => `
                    <tr>
                      <td>
                        <div class="text-sm">
                          <div>${formatDate(log.createdAt)}</div>
                          <div class="text-text-secondary">${log.createdAt.toLocaleTimeString('vi-VN')}</div>
                        </div>
                      </td>
                      <td>${getTransactionBadge(log.type)}</td>
                      <td>${log.productName}</td>
                      <td>${log.variantLabel}</td>
                      <td><span class="${log.quantity > 0 ? 'text-success' : 'text-error'}">${log.quantity > 0 ? '+' : ''}${log.quantity}</span></td>
                      <td>
                        <div class="text-sm">
                          <div class="text-text-secondary">${log.previousStock} →</div>
                          <div class="text-lg">${log.newStock}</div>
                        </div>
                      </td>
                      <td>
                        <div class="text-sm">
                          <div>${log.reason}</div>
                          ${log.notes ? `<div class="text-text-secondary mt-1">${log.notes}</div>` : ''}
                        </div>
                      </td>
                      <td>${log.staffName}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function getStockStatus(stock) {
  if (stock === 0) return { label: 'Hết hàng', class: 'badge-destructive' };
  if (stock < 10) return { label: 'Sắp hết', class: 'badge-default' };
  return { label: 'Còn hàng', class: 'badge-default' };
}

function getTransactionBadge(type) {
  switch (type) {
    case 'stock-in': return '<span class="badge bg-success text-white">Nhập kho</span>';
    case 'stock-out': return '<span class="badge badge-destructive">Xuất kho</span>';
    case 'adjustment': return '<span class="badge badge-outline">Điều chỉnh</span>';
    default: return '';
  }
}

function renderInventoryRows(variants) {
  return variants.map(v => {
    const status = getStockStatus(v.stock);
    return `
      <tr>
        <td class="font-mono text-sm">${v.productCode}</td>
        <td>${v.productName}</td>
        <td class="font-mono text-sm">${v.sku}</td>
        <td>${v.size}</td>
        <td>${v.color}</td>
        <td><span class="text-lg">${v.stock}</span></td>
        <td><span class="badge ${status.class}">${status.label}</span></td>
      </tr>
    `;
  }).join('');
}

export function setupInventoryPageEvents() {
  // Tabs
  document.querySelectorAll('.tab-trigger').forEach(trigger => {
    trigger.addEventListener('click', () => {
      document.querySelectorAll('.tab-trigger').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      trigger.classList.add('active');
      document.getElementById(`tab-${trigger.dataset.tab}`)?.classList.add('active');
    });
  });

  // Search
  document.getElementById('inventory-search')?.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const allVariants = [];
    products.forEach(product => {
      product.variants.forEach(variant => {
        allVariants.push({ ...variant, productName: product.name, productCode: product.code });
      });
    });
    const filtered = allVariants.filter(v =>
      v.productName.toLowerCase().includes(term) || v.productCode.toLowerCase().includes(term) || v.sku.toLowerCase().includes(term)
    );
    document.getElementById('inventory-tbody').innerHTML = renderInventoryRows(filtered);
  });

  // Add transaction dialog
  document.getElementById('add-transaction-btn')?.addEventListener('click', () => {
    const content = `
      <div class="dialog-header"><h3 class="dialog-title">Thêm giao dịch kho</h3></div>
      <div class="space-y-4">
        <div>
          <label class="label">Loại giao dịch <span class="text-accent">*</span></label>
          <select class="custom-select" id="trans-type">
            <option value="stock-in">Nhập kho</option>
            <option value="stock-out">Xuất kho</option>
            <option value="adjustment">Điều chỉnh kiểm kê</option>
          </select>
        </div>
        <div>
          <label class="label">Sản phẩm <span class="text-accent">*</span></label>
          <select class="custom-select" id="trans-product">
            <option value="">Chọn sản phẩm</option>
            ${products.map(p => `<option value="${p.id}">${p.code} - ${p.name}</option>`).join('')}
          </select>
        </div>
        <div id="trans-variant-container" class="hidden">
          <label class="label">Biến thể <span class="text-accent">*</span></label>
          <select class="custom-select" id="trans-variant"><option value="">Chọn biến thể</option></select>
        </div>
        <div>
          <label class="label">Số lượng <span class="text-accent">*</span></label>
          <input class="input" type="number" id="trans-qty" min="0" value="0" />
        </div>
        <div>
          <label class="label">Lý do <span class="text-accent">*</span></label>
          <input class="input" id="trans-reason" placeholder="Nhập lý do" />
        </div>
        <div>
          <label class="label">Ghi chú (tùy chọn)</label>
          <textarea class="input" id="trans-notes" rows="3" placeholder="Thông tin bổ sung"></textarea>
        </div>
      </div>
      <div class="dialog-footer">
        <button class="btn btn-outline" data-close>Hủy</button>
        <button class="btn btn-default" id="trans-submit">Xác nhận</button>
      </div>
    `;

    const dialog = showDialog(content, { maxWidth: 'max-w-2xl' });

    // Product change -> load variants
    dialog.element.querySelector('#trans-product').addEventListener('change', (e) => {
      const product = products.find(p => p.id === e.target.value);
      const container = dialog.element.querySelector('#trans-variant-container');
      const select = dialog.element.querySelector('#trans-variant');
      if (product) {
        container.classList.remove('hidden');
        select.innerHTML = '<option value="">Chọn biến thể</option>' +
          product.variants.map(v => `<option value="${v.id}">${v.size} / ${v.color} - Tồn: ${v.stock}</option>`).join('');
      } else {
        container.classList.add('hidden');
      }
    });

    // Submit
    dialog.element.querySelector('#trans-submit').addEventListener('click', () => {
      const productId = dialog.element.querySelector('#trans-product').value;
      const variantId = dialog.element.querySelector('#trans-variant').value;
      const type = dialog.element.querySelector('#trans-type').value;
      const quantity = parseInt(dialog.element.querySelector('#trans-qty').value);
      const reason = dialog.element.querySelector('#trans-reason').value;
      const notes = dialog.element.querySelector('#trans-notes').value;

      if (!variantId) { toast.error('Vui lòng chọn sản phẩm và biến thể'); return; }
      if (quantity <= 0) { toast.error('Số lượng phải lớn hơn 0'); return; }
      if (!reason) { toast.error('Vui lòng nhập lý do'); return; }

      const product = products.find(p => p.id === productId);
      const variant = product?.variants.find(v => v.id === variantId);
      if (!variant) return;

      const previousStock = variant.stock;
      let newStock = previousStock;
      if (type === 'stock-in') newStock = previousStock + quantity;
      else if (type === 'stock-out') {
        if (previousStock < quantity) { toast.error('Số lượng tồn kho không đủ'); return; }
        newStock = previousStock - quantity;
      } else newStock = quantity;

      variant.stock = newStock;
      inventoryLogs.unshift({
        id: `log${Date.now()}`, variantId, productName: product.name,
        variantLabel: `${variant.size} / ${variant.color}`, type,
        quantity: type === 'adjustment' ? (newStock - previousStock) : quantity,
        previousStock, newStock, reason, notes: notes || undefined,
        staffId: 'staff1', staffName: 'Nguyễn Quản Trị', createdAt: new Date(),
      });

      dialog.close();
      toast.success('Cập nhật kho thành công!');
      navigateTo('/admin/inventory');
    });
  });
}

// ===== POS Page =====
export function renderPOSPage() {
  return `
    <div>
      <div class="mb-6">
        <h1 class="text-3xl font-bold">Bán hàng tại quầy</h1>
        <p class="text-text-secondary">Tạo đơn hàng trực tiếp</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Products -->
        <div class="lg:col-span-2 space-y-4">
          <div class="relative">
            ${icon('search', 'w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary')}
            <input class="input pl-10" placeholder="Tìm sản phẩm theo tên hoặc mã..." id="pos-search" />
          </div>
          <div class="bg-white rounded-xl border border-border p-4">
            <h2 class="font-semibold mb-4">Sản phẩm</h2>
            <div class="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-[600px] overflow-y-auto" id="pos-products-grid">
              ${renderPOSProducts(mockProducts)}
            </div>
          </div>
        </div>

        <!-- Cart -->
        <div class="space-y-4">
          <div class="bg-white rounded-xl border border-border p-4">
            <div class="flex items-center gap-2 mb-4">
              ${icon('user', 'w-5 h-5')}
              <h2 class="font-semibold">Thông tin khách hàng</h2>
            </div>
            <div class="space-y-3">
              <div>
                <label class="label">Tên khách hàng *</label>
                <input class="input" id="pos-customer-name" placeholder="Khách lẻ" />
              </div>
              <div>
                <label class="label">Số điện thoại *</label>
                <input class="input" id="pos-customer-phone" type="tel" placeholder="0901234567" />
              </div>
            </div>
          </div>

          <div class="bg-white rounded-xl border border-border p-4">
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center gap-2">
                ${icon('shopping-cart', 'w-5 h-5')}
                <h2 class="font-semibold">Giỏ hàng (<span id="pos-cart-count">0</span>)</h2>
              </div>
              <button class="btn btn-ghost btn-sm text-error" id="pos-clear-cart">Xóa tất cả</button>
            </div>
            <div class="space-y-3 max-h-[250px] overflow-y-auto mb-4" id="pos-cart-items">
              <p class="text-center text-text-secondary py-8">Giỏ hàng trống</p>
            </div>

            <!-- Payment -->
            <div class="mb-4 pb-4 border-b" id="pos-payment-section" style="display:none;">
              <label class="label font-semibold mb-3">Phương thức thanh toán *</label>
              <div class="space-y-2">
                <label class="flex items-center gap-2 cursor-pointer"><input type="radio" name="pos-payment" value="cash" checked class="accent-primary" /> 💵 Tiền mặt</label>
                <label class="flex items-center gap-2 cursor-pointer"><input type="radio" name="pos-payment" value="card" class="accent-primary" /> 💳 Thẻ</label>
                <label class="flex items-center gap-2 cursor-pointer"><input type="radio" name="pos-payment" value="transfer" class="accent-primary" /> 🏦 Chuyển khoản</label>
              </div>
            </div>
            <div id="pos-cash-input" style="display:none;" class="mb-4">
              <label class="label">Tiền khách đưa *</label>
              <input class="input text-right" id="pos-amount-paid" type="number" placeholder="0" />
              <p class="text-sm text-success mt-1 hidden" id="pos-change-money"></p>
            </div>

            <div class="space-y-2 mb-4 pt-4 border-t">
              <div class="flex justify-between"><span>Tạm tính:</span><span id="pos-subtotal">0đ</span></div>
              <div class="flex justify-between text-lg font-bold"><span>Tổng cộng:</span><span class="text-accent" id="pos-total">0đ</span></div>
            </div>

            <button class="btn btn-default w-full btn-lg" id="pos-checkout-btn" disabled>
              ${icon('receipt', 'w-5 h-5')} Thanh toán
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderPOSProducts(prods) {
  return prods.map(p => {
    const totalStock = p.variants.reduce((s, v) => s + v.stock, 0);
    return `
      <button class="text-left border border-border rounded-lg p-3 hover:bg-surface transition-colors ${totalStock === 0 ? 'opacity-50 cursor-not-allowed' : ''}" ${totalStock === 0 ? 'disabled' : ''} data-pos-add="${p.id}">
        <img src="${p.images[0]}" alt="${p.name}" class="w-full aspect-square object-cover rounded mb-2" />
        <p class="font-medium text-sm line-clamp-2 mb-1">${p.name}</p>
        <p class="text-sm font-semibold text-primary">${formatPrice(p.salePrice || p.basePrice)}</p>
        <p class="text-xs text-text-secondary">Tồn: ${totalStock}</p>
      </button>
    `;
  }).join('');
}

export function setupPOSPageEvents() {
  let posCart = [];

  function updatePOSCart() {
    const cartEl = document.getElementById('pos-cart-items');
    const countEl = document.getElementById('pos-cart-count');
    const subtotalEl = document.getElementById('pos-subtotal');
    const totalEl = document.getElementById('pos-total');
    const checkoutBtn = document.getElementById('pos-checkout-btn');
    const paymentSection = document.getElementById('pos-payment-section');

    countEl.textContent = posCart.length;
    const subtotal = posCart.reduce((s, i) => s + i.price * i.quantity, 0);
    subtotalEl.textContent = formatPrice(subtotal);
    totalEl.textContent = formatPrice(subtotal);
    checkoutBtn.disabled = posCart.length === 0;
    paymentSection.style.display = posCart.length > 0 ? 'block' : 'none';

    if (posCart.length === 0) {
      cartEl.innerHTML = '<p class="text-center text-text-secondary py-8">Giỏ hàng trống</p>';
      return;
    }

    cartEl.innerHTML = posCart.map(item => `
      <div class="flex gap-3 pb-3 border-b last:border-0">
        <img src="${item.image}" alt="${item.productName}" class="w-16 h-16 object-cover rounded" />
        <div class="flex-1 min-w-0">
          <p class="font-medium text-sm line-clamp-2">${item.productName}</p>
          <p class="text-xs text-text-secondary">${item.variantLabel}</p>
          <p class="text-sm font-semibold">${formatPrice(item.price)}</p>
          <div class="flex items-center gap-2 mt-2">
            <button class="btn btn-outline btn-sm" data-pos-minus="${item.variantId}" ${item.quantity <= 1 ? 'disabled' : ''}>${icon('minus', 'w-3 h-3')}</button>
            <span class="text-sm font-medium w-8 text-center">${item.quantity}</span>
            <button class="btn btn-outline btn-sm" data-pos-plus="${item.variantId}" ${item.quantity >= item.stock ? 'disabled' : ''}>${icon('plus', 'w-3 h-3')}</button>
            <button class="btn btn-ghost btn-sm ml-auto text-error" data-pos-remove="${item.variantId}">${icon('trash-2', 'w-4 h-4')}</button>
          </div>
        </div>
      </div>
    `).join('');

    initIcons(cartEl);

    // Bind cart item events
    cartEl.querySelectorAll('[data-pos-minus]').forEach(btn => {
      btn.addEventListener('click', () => {
        const item = posCart.find(i => i.variantId === btn.dataset.posMinus);
        if (item && item.quantity > 1) { item.quantity--; updatePOSCart(); }
      });
    });
    cartEl.querySelectorAll('[data-pos-plus]').forEach(btn => {
      btn.addEventListener('click', () => {
        const item = posCart.find(i => i.variantId === btn.dataset.posPlus);
        if (item && item.quantity < item.stock) { item.quantity++; updatePOSCart(); }
      });
    });
    cartEl.querySelectorAll('[data-pos-remove]').forEach(btn => {
      btn.addEventListener('click', () => {
        posCart = posCart.filter(i => i.variantId !== btn.dataset.posRemove);
        updatePOSCart();
        toast.success('Đã xóa khỏi giỏ hàng');
      });
    });
  }

  // Search
  document.getElementById('pos-search')?.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const filtered = mockProducts.filter(p => p.name.toLowerCase().includes(term) || p.code.toLowerCase().includes(term));
    document.getElementById('pos-products-grid').innerHTML = renderPOSProducts(filtered);
    bindPOSAddButtons();
  });

  function bindPOSAddButtons() {
    document.querySelectorAll('[data-pos-add]').forEach(btn => {
      btn.addEventListener('click', () => {
        const product = mockProducts.find(p => p.id === btn.dataset.posAdd);
        if (!product) return;
        const variant = product.variants[0];
        if (!variant || variant.stock === 0) { toast.error('Sản phẩm hết hàng'); return; }

        const existing = posCart.find(i => i.variantId === variant.id);
        if (existing) {
          if (existing.quantity >= variant.stock) { toast.error('Không đủ hàng trong kho'); return; }
          existing.quantity++;
        } else {
          posCart.push({
            variantId: variant.id, productId: product.id, productName: product.name,
            variantLabel: `${variant.size} / ${variant.color}`, quantity: 1,
            price: product.salePrice || product.basePrice, image: product.images[0], stock: variant.stock,
          });
        }
        toast.success('Đã thêm vào giỏ hàng');
        updatePOSCart();
      });
    });
  }
  bindPOSAddButtons();

  // Clear cart
  document.getElementById('pos-clear-cart')?.addEventListener('click', () => {
    posCart = [];
    updatePOSCart();
    toast.success('Đã xóa toàn bộ giỏ hàng');
  });

  // Payment method toggle
  document.querySelectorAll('[name="pos-payment"]').forEach(radio => {
    radio.addEventListener('change', () => {
      document.getElementById('pos-cash-input').style.display = radio.value === 'cash' ? 'block' : 'none';
    });
  });

  // Cash change calculation
  document.getElementById('pos-amount-paid')?.addEventListener('input', (e) => {
    const total = posCart.reduce((s, i) => s + i.price * i.quantity, 0);
    const paid = parseFloat(e.target.value) || 0;
    const changeEl = document.getElementById('pos-change-money');
    if (paid >= total) {
      changeEl.textContent = `Tiền thối: ${formatPrice(paid - total)}`;
      changeEl.classList.remove('hidden');
    } else {
      changeEl.classList.add('hidden');
    }
  });

  // Checkout
  document.getElementById('pos-checkout-btn')?.addEventListener('click', () => {
    if (posCart.length === 0) { toast.error('Giỏ hàng trống'); return; }
    const name = document.getElementById('pos-customer-name').value;
    const phone = document.getElementById('pos-customer-phone').value;
    if (!name || !phone) { toast.error('Vui lòng nhập thông tin khách hàng'); return; }

    const payment = document.querySelector('[name="pos-payment"]:checked').value;
    const total = posCart.reduce((s, i) => s + i.price * i.quantity, 0);
    if (payment === 'cash') {
      const paid = parseFloat(document.getElementById('pos-amount-paid').value) || 0;
      if (paid < total) { toast.error('Số tiền nhận không đủ'); return; }
    }

    const orderNumber = `POS${Date.now().toString().slice(-8)}`;
    const paymentLabel = { cash: 'Tiền mặt', card: 'Thẻ', transfer: 'Chuyển khoản' }[payment];

    const invoiceContent = `
      <div class="dialog-header"><h3 class="dialog-title">Hóa đơn bán hàng</h3><p class="dialog-description">Giao dịch đã hoàn tất thành công</p></div>
      <div>
        <div class="text-center mb-6 pb-4 border-b-2 border-primary">
          <h2 class="text-2xl font-bold mb-2" style="font-family: 'Poppins', sans-serif; letter-spacing: 0.15em;">LEON</h2>
          <p class="text-sm">123 Nguyễn Huệ, Q1, TP.HCM</p>
        </div>
        <div class="mb-6">
          <h3 class="font-bold text-lg mb-3">HÓA ĐƠN BÁN HÀNG</h3>
          <div class="grid grid-cols-2 gap-2 text-sm">
            <div><p><strong>Mã đơn:</strong> ${orderNumber}</p><p><strong>Ngày:</strong> ${new Date().toLocaleString('vi-VN')}</p></div>
            <div><p><strong>Khách hàng:</strong> ${name}</p><p><strong>SĐT:</strong> ${phone}</p></div>
          </div>
        </div>
        <table class="data-table w-full mb-6">
          <thead><tr><th>Sản phẩm</th><th class="text-center">SL</th><th class="text-right">Đơn giá</th><th class="text-right">Thành tiền</th></tr></thead>
          <tbody>
            ${posCart.map(item => `
              <tr>
                <td><div class="font-medium">${item.productName}</div><div class="text-xs text-text-secondary">${item.variantLabel}</div></td>
                <td class="text-center">${item.quantity}</td>
                <td class="text-right">${formatPrice(item.price)}</td>
                <td class="text-right font-semibold">${formatPrice(item.price * item.quantity)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="space-y-2 mb-6 pb-6 border-b">
          <div class="flex justify-between text-xl font-bold"><span>Tổng cộng:</span><span class="text-accent">${formatPrice(total)}</span></div>
          <div class="flex justify-between font-semibold"><span>Thanh toán:</span><span>${paymentLabel}</span></div>
        </div>
        <div class="text-center text-sm text-text-secondary">
          <p class="mb-2">Cảm ơn quý khách đã mua hàng!</p>
        </div>
      </div>
      <div class="dialog-footer">
        <button class="btn btn-outline flex-1" id="pos-print-invoice">${icon('printer', 'w-4 h-4')} In hóa đơn</button>
        <button class="btn btn-default flex-1" id="pos-new-order">Đơn hàng mới</button>
      </div>
    `;

    const dialog = showDialog(invoiceContent, { maxWidth: 'max-w-2xl' });
    dialog.element.querySelector('#pos-new-order')?.addEventListener('click', () => {
      dialog.close();
      posCart = [];
      document.getElementById('pos-customer-name').value = '';
      document.getElementById('pos-customer-phone').value = '';
      document.getElementById('pos-amount-paid').value = '';
      updatePOSCart();
    });
    dialog.element.querySelector('#pos-print-invoice')?.addEventListener('click', () => {
      toast.info('Đang in hóa đơn...');
    });

    toast.success('Thanh toán thành công!');
  });
}

// ===== Admin Promotions Page =====
export function renderAdminPromotionsPage() {
  return `
    <div>
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-3xl font-bold">Quản lý khuyến mãi</h1>
          <p class="text-text-secondary mt-2">Tạo và quản lý các chương trình khuyến mãi</p>
        </div>
        <button class="btn btn-default" id="add-promo-btn">${icon('plus', 'w-4 h-4')} Thêm khuyến mãi</button>
      </div>
      <div class="card">
        <div class="card-header"><h3 class="card-title">Danh sách khuyến mãi (${promotions.length})</h3></div>
        <div class="card-content">
          <div class="table-wrapper">
            <table class="data-table">
              <thead><tr><th>Tên chương trình</th><th>Mã</th><th>Giảm giá</th><th>Thời gian</th><th>Trạng thái</th><th class="text-right">Thao tác</th></tr></thead>
              <tbody id="admin-promos-tbody">
                ${renderPromoRows()}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderPromoRows() {
  return promotions.map(p => `
    <tr>
      <td>${p.name}</td>
      <td><span class="badge badge-outline font-mono">${icon('tag', 'w-3 h-3')} ${p.code}</span></td>
      <td>${p.type === 'percentage' ? `${p.value}%` : formatPrice(p.value)}</td>
      <td><div class="text-sm"><div>${formatDate(p.startDate)}</div><div class="text-text-secondary">→ ${formatDate(p.endDate)}</div></div></td>
      <td><span class="badge ${p.status === 'active' ? 'badge-default' : 'badge-outline'}">${p.status === 'active' ? 'Hoạt động' : 'Tạm dừng'}</span></td>
      <td class="text-right">
        <div class="flex justify-end gap-2">
          <button class="btn btn-outline btn-sm">${icon('pencil', 'w-4 h-4')}</button>
          <button class="btn btn-outline btn-sm" data-delete-promo="${p.id}">${icon('trash-2', 'w-4 h-4 text-error')}</button>
        </div>
      </td>
    </tr>
  `).join('');
}

export function setupAdminPromotionsEvents() {
  document.querySelectorAll('[data-delete-promo]').forEach(btn => {
    btn.addEventListener('click', () => {
      showConfirm('Xóa khuyến mãi?', 'Hành động này không thể hoàn tác.', () => {
        const idx = promotions.findIndex(p => p.id === btn.dataset.deletePromo);
        if (idx >= 0) { promotions.splice(idx, 1); toast.success('Đã xóa khuyến mãi'); navigateTo('/admin/promotions'); }
      });
    });
  });

  document.getElementById('add-promo-btn')?.addEventListener('click', () => {
    const content = `
      <div class="dialog-header"><h3 class="dialog-title">Thêm khuyến mãi mới</h3></div>
      <div class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div><label class="label">Tên chương trình *</label><input class="input" id="np-name" placeholder="Giảm giá mùa hè" /></div>
          <div><label class="label">Mã khuyến mãi *</label><input class="input" id="np-code" placeholder="SUMMER20" style="text-transform:uppercase" /></div>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="label">Loại giảm giá</label>
            <select class="custom-select" id="np-type"><option value="percentage">Phần trăm (%)</option><option value="fixed">Số tiền cố định (VNĐ)</option></select>
          </div>
          <div><label class="label">Giá trị giảm *</label><input class="input" type="number" id="np-value" /></div>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div><label class="label">Ngày bắt đầu *</label><input class="input" type="date" id="np-start" /></div>
          <div><label class="label">Ngày kết thúc *</label><input class="input" type="date" id="np-end" /></div>
        </div>
        <div><label class="label">Mô tả</label><textarea class="input" id="np-desc" rows="3" placeholder="Mô tả chương trình"></textarea></div>
      </div>
      <div class="dialog-footer">
        <button class="btn btn-outline" data-close>Hủy</button>
        <button class="btn btn-default" id="np-submit">Thêm</button>
      </div>
    `;
    const dialog = showDialog(content, { maxWidth: 'max-w-2xl' });
    dialog.element.querySelector('#np-submit')?.addEventListener('click', () => {
      const name = dialog.element.querySelector('#np-name').value;
      const code = dialog.element.querySelector('#np-code').value.toUpperCase();
      const value = parseInt(dialog.element.querySelector('#np-value').value);
      if (!name || !code) { toast.error('Vui lòng nhập tên và mã khuyến mãi'); return; }
      if (!value || value <= 0) { toast.error('Giá trị phải lớn hơn 0'); return; }
      if (promotions.some(p => p.code === code)) { toast.error('Mã đã tồn tại'); return; }

      promotions.push({
        id: `promo${Date.now()}`, name, code,
        type: dialog.element.querySelector('#np-type').value,
        value, status: 'active', targets: [],
        startDate: new Date(dialog.element.querySelector('#np-start').value || Date.now()),
        endDate: new Date(dialog.element.querySelector('#np-end').value || Date.now()),
        description: dialog.element.querySelector('#np-desc').value,
      });
      dialog.close();
      toast.success('Thêm khuyến mãi thành công');
      navigateTo('/admin/promotions');
    });
  });
}

// ===== Staff Management Page =====
export function renderStaffPage() {
  return `
    <div>
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-3xl font-bold">Quản lý tài khoản nhân viên</h1>
          <p class="text-text-secondary mt-2">Quản lý tài khoản và quyền truy cập</p>
        </div>
        <button class="btn btn-default" id="add-staff-btn">${icon('plus', 'w-4 h-4')} Thêm nhân viên</button>
      </div>
      <div class="card">
        <div class="card-header"><h3 class="card-title">Danh sách nhân viên (${staffAccounts.length})</h3></div>
        <div class="card-content">
          <div class="table-wrapper">
            <table class="data-table">
              <thead><tr><th>Họ tên</th><th>Tên đăng nhập</th><th>Email</th><th>Số điện thoại</th><th>Ngày tạo</th><th>Trạng thái</th><th class="text-right">Thao tác</th></tr></thead>
              <tbody id="admin-staff-tbody">
                ${renderStaffRows()}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderStaffRows() {
  return staffAccounts.map(s => `
    <tr>
      <td>${s.name}</td>
      <td class="font-mono">${s.username}</td>
      <td>${s.email}</td>
      <td>${s.phone}</td>
      <td>${formatDate(s.createdAt)}</td>
      <td><span class="badge ${s.status === 'active' ? 'badge-default' : 'badge-destructive'}">${s.status === 'active' ? 'Hoạt động' : 'Đã khóa'}</span></td>
      <td class="text-right">
        <div class="flex justify-end gap-2">
          <button class="btn btn-outline btn-sm" data-edit-staff='${JSON.stringify(s)}'>${icon('pencil', 'w-4 h-4')}</button>
          <button class="btn btn-outline btn-sm" data-toggle-staff="${s.id}">
            ${s.status === 'active' ? icon('lock', 'w-4 h-4 text-error') : icon('lock-open', 'w-4 h-4 text-success')}
          </button>
          <button class="btn btn-outline btn-sm" data-reset-staff="${s.id}">${icon('key-round', 'w-4 h-4')}</button>
        </div>
      </td>
    </tr>
  `).join('');
}

export function setupStaffPageEvents() {
  // Toggle status
  document.querySelectorAll('[data-toggle-staff]').forEach(btn => {
    btn.addEventListener('click', () => {
      const staff = staffAccounts.find(s => s.id === btn.dataset.toggleStaff);
      if (!staff) return;
      const action = staff.status === 'active' ? 'Khóa' : 'Mở khóa';
      showConfirm(`${action} tài khoản?`, `${staff.name} sẽ ${staff.status === 'active' ? 'không' : ''} thể đăng nhập.`, () => {
        staff.status = staff.status === 'active' ? 'locked' : 'active';
        toast.success(`Đã ${action.toLowerCase()} tài khoản`);
        navigateTo('/admin/staff');
      });
    });
  });

  // Reset password
  document.querySelectorAll('[data-reset-staff]').forEach(btn => {
    btn.addEventListener('click', () => {
      const staff = staffAccounts.find(s => s.id === btn.dataset.resetStaff);
      if (!staff) return;
      showConfirm('Đặt lại mật khẩu?', `Mật khẩu của ${staff.name} sẽ được đặt lại.`, () => {
        toast.success(`Đã đặt lại mật khẩu cho ${staff.name}. Mật khẩu tạm: Password123`);
      });
    });
  });

  // Add staff
  document.getElementById('add-staff-btn')?.addEventListener('click', () => {
    const content = `
      <div class="dialog-header"><h3 class="dialog-title">Thêm tài khoản nhân viên mới</h3></div>
      <div class="space-y-4">
        <div><label class="label">Họ và tên *</label><input class="input" id="ns-name" placeholder="Nguyễn Văn A" /></div>
        <div><label class="label">Tên đăng nhập *</label><input class="input" id="ns-username" placeholder="nguyenvana" /></div>
        <div><label class="label">Email *</label><input class="input" type="email" id="ns-email" placeholder="email@store.com" /></div>
        <div><label class="label">Số điện thoại *</label><input class="input" id="ns-phone" placeholder="0901234567" /></div>
        <div><label class="label">Mật khẩu ban đầu *</label><input class="input" type="password" id="ns-password" placeholder="Tối thiểu 6 ký tự" /><p class="text-xs text-text-secondary mt-1">Nhân viên nên đổi mật khẩu sau khi đăng nhập lần đầu</p></div>
      </div>
      <div class="dialog-footer">
        <button class="btn btn-outline" data-close>Hủy</button>
        <button class="btn btn-default" id="ns-submit">Thêm</button>
      </div>
    `;
    const dialog = showDialog(content, { maxWidth: 'max-w-lg' });
    dialog.element.querySelector('#ns-submit')?.addEventListener('click', () => {
      const name = dialog.element.querySelector('#ns-name').value;
      const username = dialog.element.querySelector('#ns-username').value.toLowerCase();
      const email = dialog.element.querySelector('#ns-email').value;
      const phone = dialog.element.querySelector('#ns-phone').value;
      const password = dialog.element.querySelector('#ns-password').value;

      if (!name || !username || !email || !phone) { toast.error('Vui lòng điền đầy đủ thông tin'); return; }
      if (!password || password.length < 6) { toast.error('Mật khẩu phải có ít nhất 6 ký tự'); return; }
      if (staffAccounts.some(s => s.username === username)) { toast.error('Tên đăng nhập đã tồn tại'); return; }
      if (staffAccounts.some(s => s.email === email)) { toast.error('Email đã tồn tại'); return; }

      staffAccounts.push({
        id: `staff${Date.now()}`, name, username, email, phone,
        status: 'active', createdAt: new Date(), createdBy: 'admin',
      });
      dialog.close();
      toast.success('Thêm tài khoản nhân viên thành công');
      navigateTo('/admin/staff');
    });
  });
}
