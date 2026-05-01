// ===== Admin Pages =====
import { mockProducts, mockOrders, mockCategories, customers, inventoryLogs, products, promotions, categories, staffAccounts, setCurrentUser } from '../data.js';
import { StatusBadge } from '../components.js';
import { icon, formatPrice, formatDate, showDialog, showConfirm, initIcons } from '../utils.js';
import { toast } from '../toast.js';
import { navigateTo } from '../router.js';

// ===== Admin Login =====
export function renderAdminLoginPage() {
  return `
    <div class="min-h-screen bg-surface flex items-center justify-center p-4">
      <div class="bg-white rounded-xl border border-border p-8 w-full max-w-md">
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold mb-2">Admin Login</h1>
          <p class="text-text-secondary">Đăng nhập vào trang quản trị</p>
        </div>
        <form id="admin-login-form" class="space-y-4">
          <div>
            <label class="label" for="admin-username">Tên đăng nhập</label>
            <input class="input" id="admin-username" required placeholder="admin" />
          </div>
          <div>
            <label class="label" for="admin-password">Mật khẩu</label>
            <input class="input" id="admin-password" type="password" required placeholder="••••••••" />
          </div>
          <button type="submit" class="btn btn-default w-full btn-lg" id="admin-login-btn">Đăng nhập</button>
        </form>
      </div>
    </div>
  `;
}

export function setupAdminLoginEvents() {
  document.getElementById('admin-login-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = document.getElementById('admin-login-btn');
    btn.disabled = true;
    btn.textContent = 'Đang đăng nhập...';
    setTimeout(() => {
      setCurrentUser({
        id: 'staff1', name: 'Nguyễn Quản Trị', username: 'admin',
        email: 'admin@fashionstore.com', phone: '0901111111', role: 'admin',
      });
      toast.success('Đăng nhập thành công');
      navigateTo('/admin');
    }, 1000);
  });
}

// ===== Analytics Page =====
export function renderAnalyticsPage() {
  const totalRevenue = mockOrders.reduce((sum, o) => sum + o.total, 0);
  const totalOrders = mockOrders.length;
  const totalProducts = mockProducts.length;
  const lowStockCount = mockProducts.reduce((count, p) => count + p.variants.filter(v => v.stock < 10).length, 0);

  return `
    <div>
      <div class="mb-6">
        <h1 class="text-3xl font-bold">Tổng quan</h1>
        <p class="text-text-secondary mt-2">Tổng quan hoạt động kinh doanh</p>
      </div>

      <!-- KPIs -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div class="card">
          <div class="card-content pt-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-text-secondary">Tổng doanh thu</p>
                <p class="text-2xl font-bold">${formatPrice(totalRevenue)}</p>
              </div>
              <div class="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center">
                ${icon('dollar-sign', 'w-6 h-6 text-success')}
              </div>
            </div>
          </div>
        </div>
        <div class="card">
          <div class="card-content pt-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-text-secondary">Tổng đơn hàng</p>
                <p class="text-2xl font-bold">${totalOrders}</p>
              </div>
              <div class="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
                ${icon('shopping-cart', 'w-6 h-6 text-info')}
              </div>
            </div>
          </div>
        </div>
        <div class="card">
          <div class="card-content pt-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-text-secondary">Tổng sản phẩm</p>
                <p class="text-2xl font-bold">${totalProducts}</p>
              </div>
              <div class="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center">
                ${icon('package', 'w-6 h-6 text-purple-600')}
              </div>
            </div>
          </div>
        </div>
        <div class="card">
          <div class="card-content pt-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-text-secondary">Sắp hết hàng</p>
                <p class="text-2xl font-bold">${lowStockCount}</p>
              </div>
              <div class="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center">
                ${icon('alert-triangle', 'w-6 h-6 text-error')}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Charts -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div class="card">
          <div class="card-header"><h3 class="card-title">Doanh thu theo tháng</h3></div>
          <div class="card-content"><canvas id="revenue-chart" height="250"></canvas></div>
        </div>
        <div class="card">
          <div class="card-header"><h3 class="card-title">Phân bổ đơn hàng</h3></div>
          <div class="card-content"><canvas id="orders-chart" height="250"></canvas></div>
        </div>
      </div>

      <!-- Recent Orders -->
      <div class="card">
        <div class="card-header"><h3 class="card-title">Đơn hàng gần đây</h3></div>
        <div class="card-content">
          <div class="table-wrapper">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Mã đơn</th>
                  <th>Khách hàng</th>
                  <th>Ngày</th>
                  <th>Tổng tiền</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                ${mockOrders.slice(0, 5).map(o => `
                  <tr>
                    <td class="font-mono">${o.orderNumber}</td>
                    <td>${o.customerName}</td>
                    <td>${formatDate(o.createdAt)}</td>
                    <td class="font-semibold">${formatPrice(o.total)}</td>
                    <td>${StatusBadge(o.status)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function setupAnalyticsEvents() {
  // Revenue chart
  const revenueCtx = document.getElementById('revenue-chart')?.getContext('2d');
  if (revenueCtx && window.Chart) {
    new Chart(revenueCtx, {
      type: 'line',
      data: {
        labels: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6'],
        datasets: [{
          label: 'Doanh thu',
          data: [15000000, 22000000, 18000000, 25000000, 30000000, 28000000],
          borderColor: '#E11D48',
          backgroundColor: 'rgba(225, 29, 72, 0.1)',
          tension: 0.4,
          fill: true,
        }],
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: { y: { ticks: { callback: (v) => (v / 1000000) + 'M' } } },
      },
    });
  }

  // Orders chart
  const ordersCtx = document.getElementById('orders-chart')?.getContext('2d');
  if (ordersCtx && window.Chart) {
    new Chart(ordersCtx, {
      type: 'doughnut',
      data: {
        labels: ['Online', 'Tại quầy'],
        datasets: [{
          data: [mockOrders.filter(o => o.type === 'online').length, mockOrders.filter(o => o.type === 'pos').length],
          backgroundColor: ['#E11D48', '#111827'],
        }],
      },
      options: { responsive: true },
    });
  }
}

// ===== Products List =====
export function renderProductsListPage() {
  return `
    <div>
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-3xl font-bold">Sản phẩm</h1>
          <p class="text-text-secondary mt-2">${mockProducts.length} sản phẩm</p>
        </div>
        <a href="#/admin/products/add" class="btn btn-default">${icon('plus', 'w-4 h-4')} Thêm sản phẩm</a>
      </div>

      <div class="card">
        <div class="card-header">
          <div class="flex justify-between items-center">
            <h3 class="card-title">Danh sách sản phẩm</h3>
            <div class="relative">
              ${icon('search', 'w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary')}
              <input class="input pl-10 w-80" placeholder="Tìm kiếm sản phẩm..." id="admin-product-search" />
            </div>
          </div>
        </div>
        <div class="card-content">
          <div class="table-wrapper">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Ảnh</th>
                  <th>Mã SP</th>
                  <th>Tên sản phẩm</th>
                  <th>Danh mục</th>
                  <th>Giá</th>
                  <th>Tồn kho</th>
                  <th>Trạng thái</th>
                  <th class="text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody id="admin-products-tbody">
                ${renderProductRows(mockProducts)}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderProductRows(prods) {
  return prods.map(p => {
    const totalStock = p.variants.reduce((s, v) => s + v.stock, 0);
    return `
      <tr>
        <td><img src="${p.images[0]}" alt="${p.name}" class="w-12 h-12 object-cover rounded-lg" /></td>
        <td class="font-mono text-sm">${p.code}</td>
        <td class="font-medium">${p.name}</td>
        <td>${p.category}</td>
        <td>${formatPrice(p.salePrice || p.basePrice)}</td>
        <td><span class="${totalStock < 10 ? 'text-error font-semibold' : ''}">${totalStock}</span></td>
        <td><span class="badge ${p.status === 'active' ? 'badge-default' : 'badge-outline'}">${p.status === 'active' ? 'Hoạt động' : 'Ngừng'}</span></td>
        <td class="text-right">
          <div class="flex justify-end gap-2">
            <a href="#/admin/products/edit/${p.id}" class="btn btn-outline btn-sm">${icon('pencil', 'w-4 h-4')}</a>
            <button class="btn btn-outline btn-sm" data-delete-product="${p.id}">${icon('trash-2', 'w-4 h-4 text-error')}</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

export function setupProductsListEvents() {
  document.getElementById('admin-product-search')?.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const filtered = mockProducts.filter(p => p.name.toLowerCase().includes(term) || p.code.toLowerCase().includes(term));
    document.getElementById('admin-products-tbody').innerHTML = renderProductRows(filtered);
    initIcons();
    setupDeleteButtons();
  });
  setupDeleteButtons();
}

function setupDeleteButtons() {
  document.querySelectorAll('[data-delete-product]').forEach(btn => {
    btn.addEventListener('click', () => {
      showConfirm('Xóa sản phẩm?', 'Bạn có chắc chắn muốn xóa sản phẩm này?', () => {
        toast.success('Đã xóa sản phẩm');
      });
    });
  });
}

// ===== Add Product Page =====
export function renderAddProductPage() {
  return `
    <div>
      <div class="mb-6">
        <a href="#/admin/products" class="text-primary hover:underline mb-4 inline-block">← Quay lại danh sách</a>
        <h1 class="text-3xl font-bold">Thêm sản phẩm mới</h1>
      </div>
      <form id="add-product-form">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div class="lg:col-span-2 space-y-6">
            <div class="card">
              <div class="card-header"><h3 class="card-title">Thông tin cơ bản</h3></div>
              <div class="card-content space-y-4">
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="label">Mã sản phẩm *</label>
                    <input class="input" id="ap-code" required placeholder="VD: TS002" />
                  </div>
                  <div>
                    <label class="label">Danh mục *</label>
                    <select class="custom-select" id="ap-category" required>
                      <option value="">Chọn danh mục</option>
                      ${mockCategories.filter(c => !c.parentId).map(c => `<option value="${c.name}">${c.name}</option>`).join('')}
                    </select>
                  </div>
                </div>
                <div>
                  <label class="label">Tên sản phẩm *</label>
                  <input class="input" id="ap-name" required placeholder="Tên sản phẩm" />
                </div>
                <div>
                  <label class="label">Mô tả</label>
                  <textarea class="input" id="ap-desc" rows="4" placeholder="Mô tả sản phẩm"></textarea>
                </div>
                <div>
                  <label class="label">Chất liệu</label>
                  <input class="input" id="ap-material" placeholder="VD: Cotton 100%" />
                </div>
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="label">Giá gốc *</label>
                    <input class="input" id="ap-base-price" type="number" required />
                  </div>
                  <div>
                    <label class="label">Giá sale</label>
                    <input class="input" id="ap-sale-price" type="number" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="space-y-6">
            <div class="card">
              <div class="card-header"><h3 class="card-title">Hành động</h3></div>
              <div class="card-content space-y-3">
                <button type="submit" class="btn btn-default w-full">${icon('save', 'w-4 h-4')} Lưu sản phẩm</button>
                <a href="#/admin/products" class="btn btn-outline w-full">Hủy</a>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  `;
}

export function setupAddProductEvents() {
  document.getElementById('add-product-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    toast.success('Đã thêm sản phẩm mới');
    navigateTo('/admin/products');
  });
}

// ===== Edit Product Page =====
export function renderEditProductPage(productId) {
  const product = mockProducts.find(p => p.id === productId);
  if (!product) {
    return `<div class="text-center py-12"><h2 class="text-2xl font-semibold">Sản phẩm không tồn tại</h2><a href="#/admin/products" class="btn btn-default mt-4">Quay lại</a></div>`;
  }

  return `
    <div>
      <div class="mb-6">
        <a href="#/admin/products" class="text-primary hover:underline mb-4 inline-block">← Quay lại danh sách</a>
        <h1 class="text-3xl font-bold">Chỉnh sửa: ${product.name}</h1>
      </div>
      <form id="edit-product-form">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div class="lg:col-span-2 space-y-6">
            <div class="card">
              <div class="card-header"><h3 class="card-title">Thông tin cơ bản</h3></div>
              <div class="card-content space-y-4">
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="label">Mã sản phẩm</label>
                    <input class="input" value="${product.code}" id="ep-code" />
                  </div>
                  <div>
                    <label class="label">Danh mục</label>
                    <select class="custom-select" id="ep-category">
                      ${mockCategories.filter(c => !c.parentId).map(c => `<option value="${c.name}" ${c.name === product.category ? 'selected' : ''}>${c.name}</option>`).join('')}
                    </select>
                  </div>
                </div>
                <div>
                  <label class="label">Tên sản phẩm</label>
                  <input class="input" value="${product.name}" id="ep-name" />
                </div>
                <div>
                  <label class="label">Mô tả</label>
                  <textarea class="input" rows="4" id="ep-desc">${product.description}</textarea>
                </div>
                <div>
                  <label class="label">Chất liệu</label>
                  <input class="input" value="${product.material}" id="ep-material" />
                </div>
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="label">Giá gốc</label>
                    <input class="input" type="number" value="${product.basePrice}" id="ep-base-price" />
                  </div>
                  <div>
                    <label class="label">Giá sale</label>
                    <input class="input" type="number" value="${product.salePrice || ''}" id="ep-sale-price" />
                  </div>
                </div>
              </div>
            </div>

            <!-- Variants -->
            <div class="card">
              <div class="card-header">
                <div class="flex justify-between items-center">
                  <h3 class="card-title">Biến thể (${product.variants.length})</h3>
                </div>
              </div>
              <div class="card-content">
                <div class="table-wrapper">
                  <table class="data-table">
                    <thead>
                      <tr><th>SKU</th><th>Size</th><th>Màu</th><th>Tồn kho</th></tr>
                    </thead>
                    <tbody>
                      ${product.variants.map(v => `
                        <tr>
                          <td class="font-mono text-sm">${v.sku}</td>
                          <td>${v.size}</td>
                          <td>${v.color}</td>
                          <td>${v.stock}</td>
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <div class="space-y-6">
            <div class="card">
              <div class="card-header"><h3 class="card-title">Hành động</h3></div>
              <div class="card-content space-y-3">
                <button type="submit" class="btn btn-default w-full">${icon('save', 'w-4 h-4')} Lưu thay đổi</button>
                <a href="#/admin/products" class="btn btn-outline w-full">Hủy</a>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  `;
}

export function setupEditProductEvents() {
  document.getElementById('edit-product-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    toast.success('Đã cập nhật sản phẩm');
    navigateTo('/admin/products');
  });
}

// ===== Orders Page =====
export function renderOrdersPage() {
  return `
    <div>
      <div class="mb-6">
        <h1 class="text-3xl font-bold">Đơn hàng</h1>
        <p class="text-text-secondary mt-2">${mockOrders.length} đơn hàng</p>
      </div>
      <div class="card">
        <div class="card-header">
          <div class="flex justify-between items-center">
            <h3 class="card-title">Danh sách đơn hàng</h3>
            <div class="relative">
              ${icon('search', 'w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary')}
              <input class="input pl-10 w-80" placeholder="Tìm kiếm đơn hàng..." id="admin-order-search" />
            </div>
          </div>
        </div>
        <div class="card-content">
          <div class="table-wrapper">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Mã đơn</th>
                  <th>Loại</th>
                  <th>Khách hàng</th>
                  <th>Ngày</th>
                  <th>Tổng</th>
                  <th>Trạng thái</th>
                  <th class="text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody id="admin-orders-tbody">
                ${renderOrderRows(mockOrders)}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderOrderRows(orders) {
  return orders.map(o => `
    <tr>
      <td class="font-mono">${o.orderNumber}</td>
      <td><span class="badge ${o.type === 'online' ? 'badge-default' : 'badge-outline'}">${o.type === 'online' ? 'Online' : 'Tại quầy'}</span></td>
      <td>${o.customerName}</td>
      <td>${formatDate(o.createdAt)}</td>
      <td class="font-semibold">${formatPrice(o.total)}</td>
      <td>${StatusBadge(o.status)}</td>
      <td class="text-right">
        <a href="#/admin/orders/${o.id}" class="btn btn-outline btn-sm">${icon('eye', 'w-4 h-4')}</a>
      </td>
    </tr>
  `).join('');
}

export function setupOrdersPageEvents() {
  document.getElementById('admin-order-search')?.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const filtered = mockOrders.filter(o =>
      o.orderNumber.toLowerCase().includes(term) || o.customerName.toLowerCase().includes(term)
    );
    document.getElementById('admin-orders-tbody').innerHTML = renderOrderRows(filtered);
    initIcons();
  });
}

// ===== Admin Order Detail =====
export function renderAdminOrderDetailPage(orderId) {
  const order = mockOrders.find(o => o.id === orderId);
  if (!order) {
    return `<div class="text-center py-12"><h2 class="text-2xl font-semibold">Đơn hàng không tồn tại</h2><a href="#/admin/orders" class="btn btn-default mt-4">Quay lại</a></div>`;
  }

  const statusOptions = ['pending', 'confirmed', 'shipping', 'completed', 'cancelled'];
  const statusLabels = { pending: 'Chờ xử lý', confirmed: 'Đã xác nhận', shipping: 'Đang giao', completed: 'Hoàn thành', cancelled: 'Đã hủy' };

  return `
    <div>
      <div class="mb-6">
        <a href="#/admin/orders" class="text-primary hover:underline mb-4 inline-block">← Quay lại danh sách</a>
        <h1 class="text-3xl font-bold">Đơn hàng ${order.orderNumber}</h1>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 space-y-6">
          <!-- Order Items -->
          <div class="card">
            <div class="card-header"><h3 class="card-title">Sản phẩm</h3></div>
            <div class="card-content">
              <div class="table-wrapper">
                <table class="data-table">
                  <thead><tr><th>Sản phẩm</th><th>Biến thể</th><th>SL</th><th>Đơn giá</th><th>Thành tiền</th></tr></thead>
                  <tbody>
                    ${order.items.map(item => `
                      <tr>
                        <td><div class="flex items-center gap-3"><img src="${item.image}" alt="" class="w-12 h-12 object-cover rounded-lg" /><span class="font-medium">${item.productName}</span></div></td>
                        <td>${item.variantLabel}</td>
                        <td>${item.quantity}</td>
                        <td>${formatPrice(item.price)}</td>
                        <td class="font-semibold">${formatPrice(item.price * item.quantity)}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
              <div class="text-right mt-6 pt-4 border-t border-border">
                <p class="text-2xl font-bold text-accent">Tổng: ${formatPrice(order.total)}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="space-y-6">
          <!-- Status Update -->
          <div class="card">
            <div class="card-header"><h3 class="card-title">Cập nhật trạng thái</h3></div>
            <div class="card-content space-y-4">
              <div>${StatusBadge(order.status)}</div>
              <select class="custom-select" id="admin-order-status">
                ${statusOptions.map(s => `<option value="${s}" ${s === order.status ? 'selected' : ''}>${statusLabels[s]}</option>`).join('')}
              </select>
              <button class="btn btn-default w-full" id="update-order-status">Cập nhật</button>
            </div>
          </div>

          <!-- Customer Info -->
          <div class="card">
            <div class="card-header"><h3 class="card-title">Khách hàng</h3></div>
            <div class="card-content text-sm space-y-2">
              <p class="font-medium">${order.customerName}</p>
              <p class="text-text-secondary">${order.customerPhone}</p>
              <p class="text-text-secondary mt-2">${order.shippingAddress.address}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function setupAdminOrderDetailEvents(orderId) {
  document.getElementById('update-order-status')?.addEventListener('click', () => {
    const status = document.getElementById('admin-order-status').value;
    const order = mockOrders.find(o => o.id === orderId);
    if (order) {
      order.status = status;
      toast.success('Đã cập nhật trạng thái');
      navigateTo(`/admin/orders/${orderId}`);
    }
  });
}

// ===== Admin Categories =====
export function renderAdminCategoriesPage() {
  return `
    <div>
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-3xl font-bold">Danh mục</h1>
          <p class="text-text-secondary mt-2">${categories.length} danh mục</p>
        </div>
        <button class="btn btn-default" id="add-category-btn">${icon('plus', 'w-4 h-4')} Thêm danh mục</button>
      </div>
      <div class="card">
        <div class="card-content">
          <div class="table-wrapper">
            <table class="data-table">
              <thead><tr><th>Tên</th><th>Slug</th><th>Danh mục cha</th><th>Hiển thị</th><th class="text-right">Thao tác</th></tr></thead>
              <tbody id="admin-categories-tbody">
                ${renderCategoryRows()}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderCategoryRows() {
  return categories.map(c => {
    const parent = categories.find(p => p.id === c.parentId);
    return `
      <tr>
        <td class="font-medium">${c.name}</td>
        <td class="font-mono text-sm text-text-secondary">${c.slug}</td>
        <td>${parent ? parent.name : '—'}</td>
        <td>
          <label class="switch">
            <input type="checkbox" ${c.isVisible ? 'checked' : ''} data-toggle-cat="${c.id}" />
            <span class="switch-slider"></span>
          </label>
        </td>
        <td class="text-right">
          <div class="flex justify-end gap-2">
            <button class="btn btn-outline btn-sm" data-edit-cat='${JSON.stringify(c)}'>${icon('pencil', 'w-4 h-4')}</button>
            <button class="btn btn-outline btn-sm" data-delete-cat="${c.id}">${icon('trash-2', 'w-4 h-4 text-error')}</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

export function setupAdminCategoriesEvents() {
  document.querySelectorAll('[data-toggle-cat]').forEach(input => {
    input.addEventListener('change', () => {
      const cat = categories.find(c => c.id === input.dataset.toggleCat);
      if (cat) { cat.isVisible = input.checked; toast.success(`${cat.name} ${input.checked ? 'hiển thị' : 'ẩn'}`); }
    });
  });

  document.querySelectorAll('[data-delete-cat]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.deleteCat;
      const hasChildren = categories.some(c => c.parentId === id);
      if (hasChildren) { toast.error('Không thể xóa danh mục có danh mục con'); return; }
      showConfirm('Xóa danh mục?', 'Hành động này không thể hoàn tác.', () => {
        const idx = categories.findIndex(c => c.id === id);
        if (idx >= 0) { categories.splice(idx, 1); toast.success('Đã xóa danh mục'); navigateTo('/admin/categories'); }
      });
    });
  });

  document.getElementById('add-category-btn')?.addEventListener('click', () => {
    const content = `
      <div class="dialog-header"><h3 class="dialog-title">Thêm danh mục mới</h3></div>
      <div class="space-y-4">
        <div><label class="label">Tên danh mục *</label><input class="input" id="new-cat-name" placeholder="VD: Giày dép" /></div>
        <div><label class="label">Slug</label><input class="input" id="new-cat-slug" placeholder="giay-dep" /></div>
        <div>
          <label class="label">Danh mục cha</label>
          <select class="custom-select" id="new-cat-parent">
            <option value="">Không có</option>
            ${categories.filter(c => !c.parentId).map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
          </select>
        </div>
      </div>
      <div class="dialog-footer">
        <button class="btn btn-outline" data-close>Hủy</button>
        <button class="btn btn-default" id="save-new-cat">Thêm</button>
      </div>
    `;
    const dialog = showDialog(content, { maxWidth: 'max-w-lg' });
    dialog.element.querySelector('#save-new-cat')?.addEventListener('click', () => {
      const name = dialog.element.querySelector('#new-cat-name').value;
      if (!name) { toast.error('Vui lòng nhập tên danh mục'); return; }
      const slug = dialog.element.querySelector('#new-cat-slug').value || name.toLowerCase().replace(/\s+/g, '-');
      const parentId = dialog.element.querySelector('#new-cat-parent').value || undefined;
      categories.push({ id: `cat${Date.now()}`, name, slug, parentId, isVisible: true });
      dialog.close();
      toast.success('Đã thêm danh mục');
      navigateTo('/admin/categories');
    });
  });

  document.querySelectorAll('[data-edit-cat]').forEach(btn => {
    btn.addEventListener('click', () => {
      const cat = JSON.parse(btn.dataset.editCat);
      const content = `
        <div class="dialog-header"><h3 class="dialog-title">Chỉnh sửa danh mục</h3></div>
        <div class="space-y-4">
          <div><label class="label">Tên danh mục *</label><input class="input" id="ec-name" value="${cat.name}" /></div>
          <div><label class="label">Slug</label><input class="input" id="ec-slug" value="${cat.slug || ''}" /></div>
          <div>
            <label class="label">Danh mục cha</label>
            <select class="custom-select" id="ec-parent">
              <option value="">Không có</option>
              ${categories.filter(c => !c.parentId && c.id !== cat.id).map(c => `<option value="${c.id}" ${c.id === cat.parentId ? 'selected' : ''}>${c.name}</option>`).join('')}
            </select>
          </div>
          <div class="flex items-center gap-3">
            <label class="switch">
              <input type="checkbox" id="ec-visible" ${cat.isVisible ? 'checked' : ''} />
              <span class="switch-slider"></span>
            </label>
            <span class="text-sm">Hiển thị trên website</span>
          </div>
        </div>
        <div class="dialog-footer">
          <button class="btn btn-outline" data-close>Hủy</button>
          <button class="btn btn-default" id="ec-submit">Lưu thay đổi</button>
        </div>
      `;
      const dialog = showDialog(content, { maxWidth: 'max-w-lg' });
      dialog.element.querySelector('#ec-submit')?.addEventListener('click', () => {
        const name = dialog.element.querySelector('#ec-name').value.trim();
        if (!name) { toast.error('Vui lòng nhập tên danh mục'); return; }
        const idx = categories.findIndex(c => c.id === cat.id);
        if (idx >= 0) {
          categories[idx].name = name;
          categories[idx].slug = dialog.element.querySelector('#ec-slug').value.trim() || name.toLowerCase().replace(/\s+/g, '-');
          categories[idx].parentId = dialog.element.querySelector('#ec-parent').value || undefined;
          categories[idx].isVisible = dialog.element.querySelector('#ec-visible').checked;
        }
        dialog.close();
        toast.success('Đã cập nhật danh mục');
        navigateTo('/admin/categories');
      });
    });
  });
}

// ===== Customers Page =====
export function renderCustomersPage() {
  return `
    <div>
      <div class="mb-6">
        <h1 class="text-3xl font-bold">Khách hàng</h1>
        <p class="text-text-secondary mt-2">${customers.length} khách hàng</p>
      </div>
      <div class="card">
        <div class="card-header">
          <div class="flex justify-between items-center">
            <h3 class="card-title">Danh sách khách hàng</h3>
            <div class="relative">
              ${icon('search', 'w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary')}
              <input class="input pl-10 w-80" placeholder="Tìm kiếm khách hàng..." id="admin-customer-search" />
            </div>
          </div>
        </div>
        <div class="card-content">
          <div class="table-wrapper">
            <table class="data-table">
              <thead>
                <tr><th>Tên</th><th>Email</th><th>Điện thoại</th><th>Đơn hàng</th><th>Tổng chi</th><th>Ngày tham gia</th><th class="text-right">Thao tác</th></tr>
              </thead>
              <tbody id="admin-customers-tbody">
                ${renderCustomerRows(customers)}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderCustomerRows(custs) {
  return custs.map(c => `
    <tr>
      <td class="font-medium">${c.name}</td>
      <td>${c.email}</td>
      <td>${c.phone}</td>
      <td>${c.totalOrders}</td>
      <td class="font-semibold">${formatPrice(c.totalSpent)}</td>
      <td>${formatDate(c.createdAt)}</td>
      <td class="text-right">
        <div class="flex justify-end gap-2">
          <button class="btn btn-outline btn-sm" title="Xem lịch sử mua hàng" data-orders-customer='${JSON.stringify(c)}'>${icon('shopping-bag', 'w-4 h-4')}</button>
          <button class="btn btn-outline btn-sm" title="Chỉnh sửa" data-edit-customer='${JSON.stringify(c)}'>${icon('pencil', 'w-4 h-4')}</button>
        </div>
      </td>
    </tr>
  `).join('');
}

export function setupCustomersPageEvents() {
  document.getElementById('admin-customer-search')?.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const filtered = customers.filter(c =>
      c.name.toLowerCase().includes(term) || c.email.toLowerCase().includes(term) || c.phone.includes(term)
    );
    document.getElementById('admin-customers-tbody').innerHTML = renderCustomerRows(filtered);
    initIcons();
    setupCustomerViewButtons();
  });
  setupCustomerViewButtons();
}

function setupCustomerViewButtons() {
  // Edit customer
  document.querySelectorAll('[data-edit-customer]').forEach(btn => {
    btn.addEventListener('click', () => {
      const customer = JSON.parse(btn.dataset.editCustomer);
      const content = `
        <div class="dialog-header">
          <h3 class="dialog-title">Chỉnh sửa khách hàng</h3>
          <p class="dialog-description">Cập nhật thông tin cho ${customer.name}</p>
        </div>
        <div class="space-y-4">
          <div>
            <label class="label">Họ tên</label>
            <input class="input" id="ec-name" value="${customer.name}" />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="label">Email</label>
              <input class="input" id="ec-email" type="email" value="${customer.email}" />
            </div>
            <div>
              <label class="label">Số điện thoại</label>
              <input class="input" id="ec-phone" value="${customer.phone}" />
            </div>
          </div>
          <div>
            <label class="label">Trạng thái</label>
            <select class="custom-select" id="ec-status">
              <option value="active" ${customer.status !== 'locked' ? 'selected' : ''}>Hoạt động</option>
              <option value="locked" ${customer.status === 'locked' ? 'selected' : ''}>Đã khóa</option>
            </select>
          </div>
        </div>
        <div class="dialog-footer">
          <button class="btn btn-outline" data-close>Hủy</button>
          <button class="btn btn-default" id="ec-submit">Lưu thay đổi</button>
        </div>
      `;
      const dialog = showDialog(content, { maxWidth: 'max-w-lg' });
      dialog.element.querySelector('#ec-submit')?.addEventListener('click', () => {
        const name = dialog.element.querySelector('#ec-name').value.trim();
        const email = dialog.element.querySelector('#ec-email').value.trim();
        const phone = dialog.element.querySelector('#ec-phone').value.trim();
        if (!name || !email) { toast.error('Vui lòng điền đầy đủ thông tin'); return; }
        const idx = customers.findIndex(c => c.id === customer.id);
        if (idx >= 0) {
          customers[idx].name = name;
          customers[idx].email = email;
          customers[idx].phone = phone;
          customers[idx].status = dialog.element.querySelector('#ec-status').value;
        }
        dialog.close();
        toast.success('Đã cập nhật thông tin khách hàng');
        document.getElementById('admin-customers-tbody').innerHTML = renderCustomerRows(customers);
        initIcons();
        setupCustomerViewButtons();
      });
    });
  });

  // Orders history
  document.querySelectorAll('[data-orders-customer]').forEach(btn => {
    btn.addEventListener('click', () => {
      const customer = JSON.parse(btn.dataset.ordersCustomer);
      const customerOrders = mockOrders.filter(o => o.customerId === customer.id || o.customerName === customer.name);
      const content = `
        <div class="dialog-header">
          <h3 class="dialog-title">Lịch sử mua hàng</h3>
          <p class="dialog-description">${customer.name} · ${customerOrders.length} đơn hàng</p>
        </div>
        <div class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div class="bg-surface p-4 rounded-lg text-center">
              <p class="text-2xl font-bold text-primary">${customerOrders.length}</p>
              <p class="text-sm text-text-secondary">Tổng đơn hàng</p>
            </div>
            <div class="bg-surface p-4 rounded-lg text-center">
              <p class="text-2xl font-bold text-success">${formatPrice(customer.totalSpent)}</p>
              <p class="text-sm text-text-secondary">Tổng chi tiêu</p>
            </div>
          </div>
          ${customerOrders.length === 0 ? `
            <div class="text-center py-8 text-text-secondary">
              ${icon('shopping-bag', 'w-12 h-12 mx-auto mb-3 opacity-30')}
              <p>Chưa có đơn hàng nào</p>
            </div>
          ` : `
            <div class="table-wrapper max-h-80 overflow-y-auto">
              <table class="data-table">
                <thead><tr><th>Mã đơn</th><th>Ngày</th><th>Tổng tiền</th><th>Trạng thái</th></tr></thead>
                <tbody>
                  ${customerOrders.map(o => `
                    <tr>
                      <td class="font-mono text-sm">${o.orderNumber}</td>
                      <td class="text-sm">${formatDate(o.createdAt)}</td>
                      <td class="font-semibold">${formatPrice(o.total)}</td>
                      <td><span class="badge ${o.status === 'delivered' ? 'badge-default' : o.status === 'cancelled' ? 'badge-destructive' : 'badge-outline'} text-xs">${
                        o.status === 'delivered' ? 'Đã giao' :
                        o.status === 'cancelled' ? 'Đã hủy' :
                        o.status === 'shipping' ? 'Đang giao' :
                        o.status === 'processing' ? 'Đang xử lý' : o.status
                      }</span></td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          `}
        </div>
        <div class="dialog-footer">
          <button class="btn btn-outline" data-close>Đóng</button>
        </div>
      `;
      showDialog(content, { maxWidth: 'max-w-2xl' });
      initIcons();
    });
  });
}
