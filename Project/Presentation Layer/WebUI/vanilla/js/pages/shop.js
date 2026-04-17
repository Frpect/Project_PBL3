// ===== Shop Page =====
import { mockProducts, mockCategories } from '../data.js';
import { ProductCard } from '../components.js';
import { icon, initIcons } from '../utils.js';

export function renderShopPage(categorySlug) {
  const allSizes = [...new Set(mockProducts.flatMap(p => p.variants.map(v => v.size)))].sort();
  const allColors = [...new Set(mockProducts.flatMap(p => p.variants.map(v => v.color)))].sort();
  const parentCategories = mockCategories.filter(c => !c.parentId);

  return `
    <div class="py-8 bg-surface min-h-screen">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between mb-6">
          <h1 class="text-3xl font-bold">Sản phẩm</h1>
          <button id="mobile-filter-btn" class="md:hidden btn btn-outline btn-sm">
            ${icon('sliders-horizontal', 'w-4 h-4')}
            Bộ lọc
          </button>
        </div>

        <div class="flex gap-8">
          <!-- Sidebar Filters (Desktop) -->
          <aside class="hidden md:block w-64 flex-shrink-0">
            <div class="bg-white rounded-xl border border-border p-6 sticky top-24">
              <h3 class="font-semibold mb-4">Bộ lọc</h3>

              <!-- Category Filter -->
              <div class="mb-6">
                <h4 class="text-sm font-medium mb-3">Danh mục</h4>
                <div class="space-y-2">
                  <label class="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="radio" name="category" value="" checked class="accent-primary" data-filter="category" />
                    Tất cả
                  </label>
                  ${parentCategories.map(cat => `
                    <label class="flex items-center gap-2 text-sm cursor-pointer">
                      <input type="radio" name="category" value="${cat.slug}" ${categorySlug === cat.slug ? 'checked' : ''} class="accent-primary" data-filter="category" />
                      ${cat.name}
                    </label>
                  `).join('')}
                </div>
              </div>

              <!-- Price Filter -->
              <div class="mb-6">
                <h4 class="text-sm font-medium mb-3">Khoảng giá</h4>
                <div class="space-y-2">
                  <label class="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="radio" name="price" value="" checked class="accent-primary" data-filter="price" />
                    Tất cả
                  </label>
                  <label class="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="radio" name="price" value="0-300000" class="accent-primary" data-filter="price" />
                    Dưới 300.000đ
                  </label>
                  <label class="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="radio" name="price" value="300000-500000" class="accent-primary" data-filter="price" />
                    300.000đ - 500.000đ
                  </label>
                  <label class="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="radio" name="price" value="500000-99999999" class="accent-primary" data-filter="price" />
                    Trên 500.000đ
                  </label>
                </div>
              </div>

              <!-- Size Filter -->
              <div class="mb-6">
                <h4 class="text-sm font-medium mb-3">Size</h4>
                <div class="flex flex-wrap gap-2">
                  ${allSizes.map(size => `
                    <button class="px-3 py-1.5 border border-border rounded-lg text-sm hover:bg-surface transition-colors" data-filter-size="${size}">${size}</button>
                  `).join('')}
                </div>
              </div>

              <!-- Color Filter -->
              <div class="mb-6">
                <h4 class="text-sm font-medium mb-3">Màu sắc</h4>
                <div class="flex flex-wrap gap-2">
                  ${allColors.map(color => `
                    <button class="px-3 py-1.5 border border-border rounded-lg text-sm hover:bg-surface transition-colors" data-filter-color="${color}">${color}</button>
                  `).join('')}
                </div>
              </div>

              <button class="btn btn-outline w-full text-sm" id="clear-filters">Xóa bộ lọc</button>
            </div>
          </aside>

          <!-- Products Grid -->
          <div class="flex-1">
            <!-- Sort -->
            <div class="flex items-center justify-between mb-6">
              <p class="text-sm text-text-secondary" id="product-count"></p>
              <select class="custom-select w-48" id="sort-select">
                <option value="default">Mặc định</option>
                <option value="price-asc">Giá thấp đến cao</option>
                <option value="price-desc">Giá cao đến thấp</option>
                <option value="name-asc">Tên A-Z</option>
                <option value="newest">Mới nhất</option>
              </select>
            </div>

            <div class="grid grid-cols-2 md:grid-cols-3 gap-6" id="products-grid">
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile Filter Sheet -->
    <div id="mobile-filter-backdrop" class="sheet-backdrop hidden"></div>
    <div id="mobile-filter-sheet" class="sheet-content">
      <div class="flex items-center justify-between mb-6">
        <h3 class="font-semibold text-lg">Bộ lọc</h3>
        <button id="close-mobile-filter" class="p-2 hover:bg-surface rounded-lg">
          ${icon('x', 'w-5 h-5')}
        </button>
      </div>
      <div id="mobile-filter-content"></div>
    </div>
  `;
}

export function setupShopPageEvents(categorySlug) {
  let selectedCategory = categorySlug || '';
  let selectedPrice = '';
  let selectedSize = '';
  let selectedColor = '';
  let sortBy = 'default';

  function filterAndRender() {
    let filtered = [...mockProducts];

    // Category filter
    if (selectedCategory) {
      const cat = mockCategories.find(c => c.slug === selectedCategory);
      if (cat) filtered = filtered.filter(p => p.category === cat.name);
    }

    // Price filter
    if (selectedPrice) {
      const [min, max] = selectedPrice.split('-').map(Number);
      filtered = filtered.filter(p => {
        const price = p.salePrice || p.basePrice;
        return price >= min && price <= max;
      });
    }

    // Size filter
    if (selectedSize) {
      filtered = filtered.filter(p => p.variants.some(v => v.size === selectedSize));
    }

    // Color filter
    if (selectedColor) {
      filtered = filtered.filter(p => p.variants.some(v => v.color === selectedColor));
    }

    // Sort
    switch (sortBy) {
      case 'price-asc':
        filtered.sort((a, b) => (a.salePrice || a.basePrice) - (b.salePrice || b.basePrice));
        break;
      case 'price-desc':
        filtered.sort((a, b) => (b.salePrice || b.basePrice) - (a.salePrice || a.basePrice));
        break;
      case 'name-asc':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
    }

    const grid = document.getElementById('products-grid');
    const count = document.getElementById('product-count');
    if (grid) {
      grid.innerHTML = filtered.length > 0
        ? filtered.map(p => ProductCard(p)).join('')
        : '<p class="col-span-full text-center text-text-secondary py-12">Không tìm thấy sản phẩm phù hợp</p>';
      if (window.lucide) window.lucide.createIcons();
    }
    if (count) count.textContent = `${filtered.length} sản phẩm`;
  }

  // Category radios
  document.querySelectorAll('[data-filter="category"]').forEach(input => {
    input.addEventListener('change', () => { selectedCategory = input.value; filterAndRender(); });
  });

  // Price radios
  document.querySelectorAll('[data-filter="price"]').forEach(input => {
    input.addEventListener('change', () => { selectedPrice = input.value; filterAndRender(); });
  });

  // Size buttons
  document.querySelectorAll('[data-filter-size]').forEach(btn => {
    btn.addEventListener('click', () => {
      selectedSize = selectedSize === btn.dataset.filterSize ? '' : btn.dataset.filterSize;
      document.querySelectorAll('[data-filter-size]').forEach(b => {
        b.className = `px-3 py-1.5 border rounded-lg text-sm transition-colors ${b.dataset.filterSize === selectedSize ? 'bg-primary text-white border-primary' : 'border-border hover:bg-surface'}`;
      });
      filterAndRender();
    });
  });

  // Color buttons
  document.querySelectorAll('[data-filter-color]').forEach(btn => {
    btn.addEventListener('click', () => {
      selectedColor = selectedColor === btn.dataset.filterColor ? '' : btn.dataset.filterColor;
      document.querySelectorAll('[data-filter-color]').forEach(b => {
        b.className = `px-3 py-1.5 border rounded-lg text-sm transition-colors ${b.dataset.filterColor === selectedColor ? 'bg-primary text-white border-primary' : 'border-border hover:bg-surface'}`;
      });
      filterAndRender();
    });
  });

  // Sort
  document.getElementById('sort-select')?.addEventListener('change', (e) => {
    sortBy = e.target.value;
    filterAndRender();
  });

  // Clear filters
  document.getElementById('clear-filters')?.addEventListener('click', () => {
    selectedCategory = '';
    selectedPrice = '';
    selectedSize = '';
    selectedColor = '';
    document.querySelectorAll('[data-filter="category"]')[0]?.click();
    document.querySelectorAll('[data-filter="price"]')[0]?.click();
    document.querySelectorAll('[data-filter-size]').forEach(b => {
      b.className = 'px-3 py-1.5 border border-border rounded-lg text-sm hover:bg-surface transition-colors';
    });
    document.querySelectorAll('[data-filter-color]').forEach(b => {
      b.className = 'px-3 py-1.5 border border-border rounded-lg text-sm hover:bg-surface transition-colors';
    });
    filterAndRender();
  });

  // Mobile filter
  const mobileBtn = document.getElementById('mobile-filter-btn');
  const mobileBackdrop = document.getElementById('mobile-filter-backdrop');
  const mobileSheet = document.getElementById('mobile-filter-sheet');
  const mobileClose = document.getElementById('close-mobile-filter');

  const openMobileFilter = () => {
    mobileBackdrop?.classList.remove('hidden');
    mobileSheet?.classList.add('open');
  };
  const closeMobileFilter = () => {
    mobileBackdrop?.classList.add('hidden');
    mobileSheet?.classList.remove('open');
  };

  mobileBtn?.addEventListener('click', openMobileFilter);
  mobileClose?.addEventListener('click', closeMobileFilter);
  mobileBackdrop?.addEventListener('click', closeMobileFilter);

  // Initial render
  filterAndRender();
}
