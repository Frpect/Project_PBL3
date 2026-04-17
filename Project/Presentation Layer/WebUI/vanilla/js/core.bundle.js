// ===== Core: Router, Toast, Utils, Components, Layouts =====
(function() {
var App = window.App;

// ===== Icon Helper =====
App.icon = function(name, cls) {
  cls = cls || 'w-4 h-4';
  return '<i data-lucide="' + name + '" class="' + cls + '"></i>';
};
App.initIcons = function(container) {
  if (window.lucide) window.lucide.createIcons({ nodes: container ? [container] : undefined });
};
App.formatPrice = function(price) { return price.toLocaleString('vi-VN') + 'đ'; };
App.formatDate = function(date) {
  if (typeof date === 'string') date = new Date(date);
  return date.toLocaleDateString('vi-VN');
};

// ===== Toast =====
var toastId = 0;
function createToast(message, type) {
  var container = document.getElementById('toast-container');
  if (!container) return;
  var id = ++toastId;
  var el = document.createElement('div');
  el.className = 'toast toast-' + type;
  el.id = 'toast-' + id;
  var icons = {
    success: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>',
    error: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>',
    info: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>',
  };
  el.innerHTML = (icons[type] || icons.info) + '<span>' + message + '</span>';
  container.appendChild(el);
  setTimeout(function() { el.classList.add('toast-exit'); setTimeout(function() { el.remove(); }, 300); }, 3000);
}
App.toast = {
  success: function(msg) { createToast(msg, 'success'); },
  error: function(msg) { createToast(msg, 'error'); },
  info: function(msg) { createToast(msg, 'info'); },
};

// ===== Dialog =====
App.showDialog = function(content, options) {
  options = options || {};
  var maxWidth = options.maxWidth || '';
  var backdrop = document.createElement('div');
  backdrop.className = 'dialog-backdrop';
  backdrop.innerHTML = '<div class="dialog-content ' + maxWidth + '"><button class="dialog-close-btn" data-close>' + App.icon('x', 'w-5 h-5') + '</button>' + content + '</div>';
  document.body.appendChild(backdrop);
  App.initIcons(backdrop);
  var close = function() { backdrop.remove(); if (options.onClose) options.onClose(); };
  backdrop.querySelector('[data-close]').addEventListener('click', close);
  backdrop.addEventListener('click', function(e) { if (e.target === backdrop) close(); });
  return { close: close, element: backdrop };
};
App.showConfirm = function(title, description, onConfirm) {
  var content = '<div class="dialog-header"><h3 class="dialog-title">' + title + '</h3><p class="dialog-description">' + description + '</p></div><div class="dialog-footer"><button class="btn btn-outline" data-close>Hủy</button><button class="btn btn-default" data-confirm>Xác nhận</button></div>';
  var dialog = App.showDialog(content);
  dialog.element.querySelector('[data-confirm]').addEventListener('click', function() { dialog.close(); onConfirm(); });
};

// ===== Router =====
App.router = {
  routes: [],
  notFoundHandler: null,
  add: function(path, handler) { this.routes.push({ path: path, handler: handler }); return this; },
  resolve: function() {
    var hash = window.location.hash.slice(1) || '/';
    var parts = hash.split('?');
    var pathname = parts[0];
    var query = new URLSearchParams(parts[1] || '');
    for (var i = 0; i < this.routes.length; i++) {
      var match = this._match(this.routes[i].path, pathname);
      if (match) { match.query = query; this.routes[i].handler(match); return; }
    }
    if (this.notFoundHandler) this.notFoundHandler();
  },
  _match: function(pattern, pathname) {
    var pp = pattern.split('/').filter(Boolean);
    var up = pathname.split('/').filter(Boolean);
    if (pp.length !== up.length) return null;
    var params = {};
    for (var i = 0; i < pp.length; i++) {
      if (pp[i].charAt(0) === ':') params[pp[i].slice(1)] = up[i];
      else if (pp[i] !== up[i]) return null;
    }
    return params;
  },
  navigate: function(path) { window.location.hash = path; },
  notFound: function(handler) { this.notFoundHandler = handler; return this; },
};
window.addEventListener('hashchange', function() { App.router.resolve(); });

App.navigateTo = function(path) { App.router.navigate(path); };
App.getCurrentPath = function() { return (window.location.hash.slice(1) || '/').split('?')[0]; };

// ===== ProductCard =====
App.ProductCard = function(product) {
  var displayPrice = product.salePrice || product.basePrice;
  var hasDiscount = !!product.salePrice;
  var totalStock = product.variants.reduce(function(s, v) { return s + v.stock; }, 0);
  var isOutOfStock = totalStock === 0;
  var discountPercent = hasDiscount ? Math.round((1 - displayPrice / product.basePrice) * 100) : 0;
  return '<div class="group bg-white rounded-xl border border-border overflow-hidden hover:shadow-lg transition-all">' +
    '<a href="#/product/' + product.id + '" class="block"><div class="aspect-square relative overflow-hidden">' +
    '<img src="' + product.images[0] + '" alt="' + product.name + '" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />' +
    '<div class="absolute top-2 left-2 flex flex-col gap-1">' +
    (hasDiscount ? '<span class="badge bg-accent text-white text-xs">-' + discountPercent + '%</span>' : '') +
    (isOutOfStock ? '<span class="badge bg-gray-800 text-white text-xs">Hết hàng</span>' : '') +
    (product.isNew ? '<span class="badge bg-info text-white text-xs">Mới</span>' : '') +
    '</div></div></a>' +
    '<div class="p-4"><a href="#/product/' + product.id + '"><p class="text-xs text-text-secondary mb-1">' + product.category + '</p>' +
    '<h3 class="product-title mb-2">' + product.name + '</h3></a>' +
    '<div class="flex items-baseline gap-2 mb-3"><span class="' + (hasDiscount ? 'price-sale' : 'font-semibold') + '">' + App.formatPrice(displayPrice) + '</span>' +
    (hasDiscount ? '<span class="price-old text-sm">' + App.formatPrice(product.basePrice) + '</span>' : '') + '</div>' +
    '<button class="btn btn-default w-full text-sm" ' + (isOutOfStock ? 'disabled' : '') +
    ' onclick="event.preventDefault(); App.quickAddToCart(\'' + product.id + '\')">' +
    App.icon('shopping-cart', 'w-4 h-4') + (isOutOfStock ? ' Hết hàng' : ' Thêm vào giỏ') + '</button></div></div>';
};

App.quickAddToCart = function(productId) {
  var product = App.mockProducts.find(function(p) { return p.id === productId; });
  if (!product) return;
  var variant = product.variants.find(function(v) { return v.stock > 0; });
  if (!variant) { App.toast.error('Sản phẩm hết hàng'); return; }
  App.addToCart({ variantId: variant.id, productId: product.id, productName: product.name,
    variantLabel: variant.size + ' / ' + variant.color, quantity: 1,
    price: product.salePrice || product.basePrice, image: product.images[0], stock: variant.stock });
  App.toast.success('Đã thêm vào giỏ hàng');
};

// ===== StatusBadge =====
App.StatusBadge = function(status, type, extraClass) {
  var orderMap = { pending: { label: 'Chờ xử lý', cls: 'bg-yellow-100 text-yellow-800' }, confirmed: { label: 'Đã xác nhận', cls: 'bg-blue-100 text-blue-800' }, shipping: { label: 'Đang giao', cls: 'bg-purple-100 text-purple-800' }, completed: { label: 'Hoàn thành', cls: 'bg-green-100 text-green-800' }, cancelled: { label: 'Đã hủy', cls: 'bg-red-100 text-red-800' } };
  var paymentMap = { paid: { label: 'Đã thanh toán', cls: 'bg-green-100 text-green-800' }, unpaid: { label: 'Chưa thanh toán', cls: 'bg-red-100 text-red-800' }, pending: { label: 'Chờ thanh toán', cls: 'bg-yellow-100 text-yellow-800' }, refunded: { label: 'Đã hoàn tiền', cls: 'bg-gray-100 text-gray-800' } };
  var map = type === 'payment' ? paymentMap : orderMap;
  var info = map[status] || { label: status, cls: 'bg-gray-100 text-gray-800' };
  return '<span class="badge ' + info.cls + ' ' + (extraClass || '') + '">' + info.label + '</span>';
};

// ===== Client Layout =====
App.renderClientLayout = function(pageContent) {
  var cart = App.getCart();
  var user = App.getCurrentUser();
  var cartCount = cart.reduce(function(s, i) { return s + i.quantity; }, 0);
  var cp = App.getCurrentPath();
  var navLinks = [
    { href: '#/', label: 'Trang chủ', active: cp === '/' },
    { href: '#/shop', label: 'Sản phẩm', active: cp.indexOf('/shop') === 0 || cp.indexOf('/product') === 0 },
    { href: '#/categories', label: 'Danh mục', active: cp === '/categories' },
    { href: '#/promotions', label: 'Khuyến mãi', active: cp === '/promotions' },
    { href: '#/about', label: 'Giới thiệu', active: cp === '/about' },
  ];
  var navHtml = navLinks.map(function(l) {
    return '<a href="' + l.href + '" class="text-sm font-medium ' + (l.active ? 'text-primary' : 'text-text-secondary hover:text-primary') + ' transition-colors">' + l.label + '</a>';
  }).join('');
  var mobileNavHtml = navLinks.map(function(l) {
    return '<a href="' + l.href + '" class="block py-2 px-3 rounded-lg text-sm font-medium ' + (l.active ? 'bg-surface text-primary' : 'text-text-secondary hover:bg-surface') + '">' + l.label + '</a>';
  }).join('');
  return '<header class="sticky top-0 z-50 bg-white border-b border-border"><div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"><div class="flex items-center justify-between h-16">' +
    '<a href="#/" class="text-2xl font-bold tracking-wider" style="font-family:Poppins,sans-serif;">LEON</a>' +
    '<nav class="hidden md:flex items-center gap-8">' + navHtml + '</nav>' +
    '<div class="flex items-center gap-3">' +
    '<a href="#/cart" class="relative p-2 hover:bg-surface rounded-lg transition-colors">' + App.icon('shopping-cart', 'w-5 h-5') +
    (cartCount > 0 ? '<span class="absolute -top-1 -right-1 bg-accent text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">' + cartCount + '</span>' : '') + '</a>' +
    (user ? '<a href="#/profile" class="p-2 hover:bg-surface rounded-lg transition-colors">' + App.icon('user', 'w-5 h-5') + '</a>' : '<a href="#/login" class="btn btn-default btn-sm">Đăng nhập</a>') +
    '<button id="mobile-menu-toggle" class="md:hidden p-2 hover:bg-surface rounded-lg">' + App.icon('menu', 'w-5 h-5') + '</button>' +
    '</div></div></div>' +
    '<div id="mobile-menu" class="hidden md:hidden border-t border-border bg-white"><div class="px-4 py-3 space-y-2">' + mobileNavHtml + '</div></div></header>' +
    '<main class="flex-1">' + pageContent + '</main>' +
    '<footer class="bg-primary text-white"><div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"><div class="grid grid-cols-1 md:grid-cols-4 gap-8">' +
    '<div><h3 class="text-xl font-bold tracking-wider mb-4" style="font-family:Poppins,sans-serif;">LEON</h3><p class="text-gray-400 text-sm">Thời trang hiện đại cho giới trẻ</p></div>' +
    '<div><h4 class="font-semibold mb-3">Liên kết</h4><div class="space-y-2 text-sm text-gray-400"><a href="#/shop" class="block hover:text-white">Sản phẩm</a><a href="#/categories" class="block hover:text-white">Danh mục</a><a href="#/promotions" class="block hover:text-white">Khuyến mãi</a><a href="#/about" class="block hover:text-white">Giới thiệu</a></div></div>' +
    '<div><h4 class="font-semibold mb-3">Hỗ trợ</h4><div class="space-y-2 text-sm text-gray-400"><p>Chính sách đổi trả</p><p>Chính sách vận chuyển</p><p>Hướng dẫn mua hàng</p><p>Câu hỏi thường gặp</p></div></div>' +
    '<div><h4 class="font-semibold mb-3">Liên hệ</h4><div class="space-y-2 text-sm text-gray-400"><p>123 Nguyễn Huệ, Quận 1, TP.HCM</p><p>Hotline: 1900 xxxx</p><p>Email: support@fashionstore.com</p></div></div>' +
    '</div><div class="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400"><p>&copy; 2024 LEON. All rights reserved.</p></div></div></footer>';
};

// ===== Admin Layout =====
App.renderAdminLayout = function(pageContent) {
  var user = App.getCurrentUser();
  var cp = App.getCurrentPath();
  var links = [
    { href: '#/admin', label: 'Tổng quan', ico: 'bar-chart-3', active: cp === '/admin' },
    { href: '#/admin/products', label: 'Sản phẩm', ico: 'package', active: cp.indexOf('/admin/products') === 0 },
    { href: '#/admin/orders', label: 'Đơn hàng', ico: 'shopping-cart', active: cp.indexOf('/admin/orders') === 0 },
    { href: '#/admin/categories', label: 'Danh mục', ico: 'layers', active: cp === '/admin/categories' },
    { href: '#/admin/customers', label: 'Khách hàng', ico: 'users', active: cp === '/admin/customers' },
    { href: '#/admin/inventory', label: 'Kho hàng', ico: 'warehouse', active: cp === '/admin/inventory' },
    { href: '#/admin/pos', label: 'Bán tại quầy', ico: 'monitor', active: cp === '/admin/pos' },
    { href: '#/admin/promotions', label: 'Khuyến mãi', ico: 'tag', active: cp === '/admin/promotions' },
    { href: '#/admin/staff', label: 'Nhân viên', ico: 'user-cog', active: cp === '/admin/staff' },
  ];
  var sidebarHtml = links.map(function(l) {
    return '<a href="' + l.href + '" class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ' + (l.active ? 'bg-primary text-white' : 'text-text-secondary hover:bg-surface') + '">' + App.icon(l.ico, 'w-5 h-5') + l.label + '</a>';
  }).join('');
  return '<div class="flex h-screen bg-surface">' +
    '<aside class="w-64 bg-white border-r border-border flex-shrink-0 hidden lg:flex flex-col"><div class="p-4 border-b border-border"><a href="#/admin" class="text-xl font-bold tracking-wider" style="font-family:Poppins,sans-serif;">LEON Admin</a></div><nav class="flex-1 p-4 space-y-1 overflow-y-auto">' + sidebarHtml + '</nav><div class="p-4 border-t border-border"><a href="#/" class="flex items-center gap-2 text-sm text-text-secondary hover:text-primary">' + App.icon('external-link', 'w-4 h-4') + 'Xem trang chủ</a></div></aside>' +
    '<div class="flex-1 flex flex-col overflow-hidden"><header class="h-16 bg-white border-b border-border flex items-center justify-between px-6 flex-shrink-0"><button id="admin-sidebar-toggle" class="lg:hidden p-2 hover:bg-surface rounded-lg">' + App.icon('menu', 'w-5 h-5') + '</button><div class="flex-1"></div><div class="flex items-center gap-4"><span class="text-sm text-text-secondary">' + ((user && user.name) || 'Admin') + '</span><button onclick="App.adminLogout()" class="btn btn-outline btn-sm">' + App.icon('log-out', 'w-4 h-4') + ' Đăng xuất</button></div></header>' +
    '<main class="flex-1 overflow-y-auto p-6">' + pageContent + '</main></div></div>';
};

App.adminLogout = function() {
  App.setCurrentUser(null);
  App.navigateTo('/admin/login');
  App.toast.success('Đã đăng xuất');
};

// ===== Layout event setup =====
App.setupClientLayout = function() {
  var toggle = document.getElementById('mobile-menu-toggle');
  var menu = document.getElementById('mobile-menu');
  if (toggle && menu) toggle.addEventListener('click', function() { menu.classList.toggle('hidden'); });
};

App.setupAdminLayout = function() {
  // mobile admin sidebar not needed for MVP but can be added later
};

// ===== Render helpers =====
App.renderClient = function(content, setupFn) {
  var root = document.getElementById('root');
  root.innerHTML = App.renderClientLayout(content);
  App.initIcons();
  App.setupClientLayout();
  if (setupFn) setupFn();
};
App.renderAdmin = function(content, setupFn) {
  var root = document.getElementById('root');
  root.innerHTML = App.renderAdminLayout(content);
  App.initIcons();
  App.setupAdminLayout();
  if (setupFn) setupFn();
};
App.renderFullPage = function(content, setupFn) {
  var root = document.getElementById('root');
  root.innerHTML = content;
  App.initIcons();
  if (setupFn) setupFn();
};

})();
