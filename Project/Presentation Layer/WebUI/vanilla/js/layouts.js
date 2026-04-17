// ===== Layouts =====
import { icon, initIcons } from './utils.js';
import { getCart, getCurrentUser } from './data.js';
import { getCurrentPath } from './router.js';

// Client Layout
export function renderClientLayout(pageContent) {
  const cart = getCart();
  const user = getCurrentUser();
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const currentPath = getCurrentPath();

  const navLinks = [
    { href: '#/', label: 'Trang chủ', active: currentPath === '/' },
    { href: '#/shop', label: 'Sản phẩm', active: currentPath.startsWith('/shop') },
    { href: '#/categories', label: 'Danh mục', active: currentPath === '/categories' },
    { href: '#/promotions', label: 'Khuyến mãi', active: currentPath === '/promotions' },
    { href: '#/about', label: 'Giới thiệu', active: currentPath === '/about' },
  ];

  return `
    <!-- Header -->
    <header class="sticky top-0 z-50 bg-white border-b border-border">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <!-- Logo -->
          <a href="#/" class="text-2xl font-bold tracking-wider" style="font-family: 'Poppins', sans-serif;">
            LEON
          </a>

          <!-- Desktop Navigation -->
          <nav class="hidden md:flex items-center gap-8">
            ${navLinks.map(link => `
              <a href="${link.href}" class="text-sm font-medium ${link.active ? 'text-primary' : 'text-text-secondary hover:text-primary'} transition-colors">
                ${link.label}
              </a>
            `).join('')}
          </nav>

          <!-- Actions -->
          <div class="flex items-center gap-3">
            <a href="#/cart" class="relative p-2 hover:bg-surface rounded-lg transition-colors">
              ${icon('shopping-cart', 'w-5 h-5')}
              ${cartCount > 0 ? `<span class="absolute -top-1 -right-1 bg-accent text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">${cartCount}</span>` : ''}
            </a>
            ${user ? `
              <a href="#/profile" class="p-2 hover:bg-surface rounded-lg transition-colors">
                ${icon('user', 'w-5 h-5')}
              </a>
            ` : `
              <a href="#/login" class="btn btn-default btn-sm">Đăng nhập</a>
            `}
            <!-- Mobile menu toggle -->
            <button id="mobile-menu-toggle" class="md:hidden p-2 hover:bg-surface rounded-lg">
              ${icon('menu', 'w-5 h-5')}
            </button>
          </div>
        </div>
      </div>

      <!-- Mobile Navigation -->
      <div id="mobile-menu" class="hidden md:hidden border-t border-border bg-white">
        <div class="px-4 py-3 space-y-2">
          ${navLinks.map(link => `
            <a href="${link.href}" class="block py-2 px-3 rounded-lg text-sm font-medium ${link.active ? 'bg-surface text-primary' : 'text-text-secondary hover:bg-surface'}">
              ${link.label}
            </a>
          `).join('')}
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1">
      ${pageContent}
    </main>

    <!-- Footer -->
    <footer class="bg-primary text-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 class="text-xl font-bold tracking-wider mb-4" style="font-family: 'Poppins', sans-serif;">LEON</h3>
            <p class="text-gray-400 text-sm">Thời trang hiện đại cho giới trẻ</p>
          </div>
          <div>
            <h4 class="font-semibold mb-3">Liên kết</h4>
            <div class="space-y-2 text-sm text-gray-400">
              <a href="#/shop" class="block hover:text-white">Sản phẩm</a>
              <a href="#/categories" class="block hover:text-white">Danh mục</a>
              <a href="#/promotions" class="block hover:text-white">Khuyến mãi</a>
              <a href="#/about" class="block hover:text-white">Giới thiệu</a>
            </div>
          </div>
          <div>
            <h4 class="font-semibold mb-3">Hỗ trợ</h4>
            <div class="space-y-2 text-sm text-gray-400">
              <p>Chính sách đổi trả</p>
              <p>Chính sách vận chuyển</p>
              <p>Hướng dẫn mua hàng</p>
              <p>Câu hỏi thường gặp</p>
            </div>
          </div>
          <div>
            <h4 class="font-semibold mb-3">Liên hệ</h4>
            <div class="space-y-2 text-sm text-gray-400">
              <p>123 Nguyễn Huệ, Quận 1, TP.HCM</p>
              <p>Hotline: 1900 xxxx</p>
              <p>Email: support@fashionstore.com</p>
            </div>
          </div>
        </div>
        <div class="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>&copy; 2024 LEON. All rights reserved.</p>
        </div>
      </div>
    </footer>
  `;
}

// Admin Layout
export function renderAdminLayout(pageContent) {
  const user = getCurrentUser();
  const currentPath = getCurrentPath();

  const sidebarLinks = [
    { href: '#/admin', label: 'Tổng quan', icon: 'bar-chart-3', active: currentPath === '/admin' },
    { href: '#/admin/products', label: 'Sản phẩm', icon: 'package', active: currentPath.startsWith('/admin/products') },
    { href: '#/admin/orders', label: 'Đơn hàng', icon: 'shopping-cart', active: currentPath.startsWith('/admin/orders') },
    { href: '#/admin/categories', label: 'Danh mục', icon: 'layers', active: currentPath === '/admin/categories' },
    { href: '#/admin/customers', label: 'Khách hàng', icon: 'users', active: currentPath === '/admin/customers' },
    { href: '#/admin/inventory', label: 'Kho hàng', icon: 'warehouse', active: currentPath === '/admin/inventory' },
    { href: '#/admin/pos', label: 'Bán tại quầy', icon: 'monitor', active: currentPath === '/admin/pos' },
    { href: '#/admin/promotions', label: 'Khuyến mãi', icon: 'tag', active: currentPath === '/admin/promotions' },
    { href: '#/admin/staff', label: 'Nhân viên', icon: 'user-cog', active: currentPath === '/admin/staff' },
  ];

  return `
    <div class="flex h-screen bg-surface">
      <!-- Sidebar -->
      <aside id="admin-sidebar" class="w-64 bg-white border-r border-border flex-shrink-0 hidden lg:flex flex-col">
        <div class="p-4 border-b border-border">
          <a href="#/admin" class="text-xl font-bold tracking-wider" style="font-family: 'Poppins', sans-serif;">
            LEON Admin
          </a>
        </div>
        <nav class="flex-1 p-4 space-y-1 overflow-y-auto">
          ${sidebarLinks.map(link => `
            <a href="${link.href}" class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${link.active ? 'bg-primary text-white' : 'text-text-secondary hover:bg-surface'}">
              ${icon(link.icon, 'w-5 h-5')}
              ${link.label}
            </a>
          `).join('')}
        </nav>
        <div class="p-4 border-t border-border">
          <a href="#/" class="flex items-center gap-2 text-sm text-text-secondary hover:text-primary">
            ${icon('external-link', 'w-4 h-4')}
            Xem trang chủ
          </a>
        </div>
      </aside>

      <!-- Main Content -->
      <div class="flex-1 flex flex-col overflow-hidden">
        <!-- Top Bar -->
        <header class="h-16 bg-white border-b border-border flex items-center justify-between px-6 flex-shrink-0">
          <button id="admin-sidebar-toggle" class="lg:hidden p-2 hover:bg-surface rounded-lg">
            ${icon('menu', 'w-5 h-5')}
          </button>
          <div class="flex-1"></div>
          <div class="flex items-center gap-4">
            <span class="text-sm text-text-secondary">${user?.name || 'Admin'}</span>
            <button onclick="window.__adminLogout && window.__adminLogout()" class="btn btn-outline btn-sm">
              ${icon('log-out', 'w-4 h-4')}
              Đăng xuất
            </button>
          </div>
        </header>

        <!-- Page Content -->
        <main class="flex-1 overflow-y-auto p-6">
          ${pageContent}
        </main>
      </div>
    </div>

    <!-- Mobile sidebar backdrop -->
    <div id="admin-sidebar-backdrop" class="hidden fixed inset-0 bg-black/50 z-40 lg:hidden"></div>
    <div id="admin-sidebar-mobile" class="fixed top-0 left-0 bottom-0 w-64 bg-white z-50 transform -translate-x-full transition-transform lg:hidden">
      <div class="p-4 border-b border-border flex items-center justify-between">
        <span class="text-xl font-bold tracking-wider" style="font-family: 'Poppins', sans-serif;">LEON</span>
        <button id="admin-sidebar-close" class="p-2 hover:bg-surface rounded-lg">
          ${icon('x', 'w-5 h-5')}
        </button>
      </div>
      <nav class="p-4 space-y-1">
        ${sidebarLinks.map(link => `
          <a href="${link.href}" class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${link.active ? 'bg-primary text-white' : 'text-text-secondary hover:bg-surface'}">
            ${icon(link.icon, 'w-5 h-5')}
            ${link.label}
          </a>
        `).join('')}
      </nav>
    </div>
  `;
}

// Setup layout event listeners
export function setupClientLayoutEvents() {
  const toggle = document.getElementById('mobile-menu-toggle');
  const menu = document.getElementById('mobile-menu');
  if (toggle && menu) {
    toggle.addEventListener('click', () => {
      menu.classList.toggle('hidden');
    });
  }
}

export function setupAdminLayoutEvents() {
  const toggle = document.getElementById('admin-sidebar-toggle');
  const backdrop = document.getElementById('admin-sidebar-backdrop');
  const mobileSidebar = document.getElementById('admin-sidebar-mobile');
  const close = document.getElementById('admin-sidebar-close');

  if (toggle && mobileSidebar) {
    toggle.addEventListener('click', () => {
      mobileSidebar.classList.remove('-translate-x-full');
      backdrop?.classList.remove('hidden');
    });
  }

  const closeSidebar = () => {
    mobileSidebar?.classList.add('-translate-x-full');
    backdrop?.classList.add('hidden');
  };

  close?.addEventListener('click', closeSidebar);
  backdrop?.addEventListener('click', closeSidebar);
}
