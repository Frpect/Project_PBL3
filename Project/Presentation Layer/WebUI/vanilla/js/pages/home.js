// ===== Home Page =====
import { mockProducts, mockCategories, heroBanners } from '../data.js';
import { ProductCard } from '../components.js';
import { icon, initIcons } from '../utils.js';

export function renderHomePage() {
  const bestSellers = mockProducts.filter(p => p.isBestSeller).slice(0, 4);
  const newArrivals = mockProducts.filter(p => p.isNew).slice(0, 4);

  return `
    <div>
      <!-- Hero Carousel -->
      <div class="relative overflow-hidden" id="hero-carousel">
        <div class="flex transition-transform duration-500" id="carousel-track">
          ${heroBanners.map(banner => `
            <div class="w-full flex-shrink-0 relative">
              <img src="${banner.image}" alt="${banner.title}" class="w-full h-[400px] md:h-[500px] object-cover" />
              <div class="absolute inset-0 bg-black/40 flex items-center justify-center">
                <div class="text-center text-white px-4">
                  <h2 class="text-3xl md:text-5xl font-bold mb-4">${banner.title}</h2>
                  <p class="text-lg md:text-xl mb-6">${banner.subtitle}</p>
                  <a href="#${banner.link}" class="btn btn-default bg-white text-primary hover:bg-gray-100 btn-lg">
                    ${banner.cta}
                  </a>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
        <button id="carousel-prev" class="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg">
          ${icon('chevron-left', 'w-6 h-6')}
        </button>
        <button id="carousel-next" class="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg">
          ${icon('chevron-right', 'w-6 h-6')}
        </button>
        <div class="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2" id="carousel-dots">
          ${heroBanners.map((_, i) => `
            <button class="w-3 h-3 rounded-full ${i === 0 ? 'bg-white' : 'bg-white/50'}" data-slide="${i}"></button>
          `).join('')}
        </div>
      </div>

      <!-- Categories -->
      <section class="py-12 bg-white">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 class="text-2xl font-bold text-center mb-8">Danh mục sản phẩm</h2>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            ${mockCategories.filter(c => !c.parentId).slice(0, 8).map(cat => `
              <a href="#/shop/${cat.slug}" class="group bg-surface rounded-xl p-6 text-center hover:shadow-md transition-all">
                <h3 class="font-semibold group-hover:text-accent transition-colors">${cat.name}</h3>
              </a>
            `).join('')}
          </div>
        </div>
      </section>

      <!-- Best Sellers -->
      <section class="py-12 bg-surface">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex items-center justify-between mb-8">
            <h2 class="text-2xl font-bold">Sản phẩm bán chạy</h2>
            <a href="#/shop" class="text-sm text-primary hover:underline font-medium">Xem tất cả →</a>
          </div>
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            ${bestSellers.map(p => ProductCard(p)).join('')}
          </div>
        </div>
      </section>

      <!-- Promotional Banner -->
      <section class="py-12 bg-accent text-white">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 class="text-3xl font-bold mb-4">Miễn phí vận chuyển</h2>
          <p class="text-lg mb-6">Cho đơn hàng từ 500.000đ</p>
          <a href="#/shop" class="btn bg-white text-accent hover:bg-gray-100 btn-lg">Mua sắm ngay</a>
        </div>
      </section>

      <!-- New Arrivals -->
      <section class="py-12 bg-white">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex items-center justify-between mb-8">
            <h2 class="text-2xl font-bold">Hàng mới về</h2>
            <a href="#/shop" class="text-sm text-primary hover:underline font-medium">Xem tất cả →</a>
          </div>
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            ${newArrivals.map(p => ProductCard(p)).join('')}
          </div>
        </div>
      </section>
    </div>
  `;
}

export function setupHomePageEvents() {
  let currentSlide = 0;
  const totalSlides = heroBanners.length;
  const track = document.getElementById('carousel-track');
  const dots = document.querySelectorAll('#carousel-dots button');

  function goToSlide(index) {
    currentSlide = (index + totalSlides) % totalSlides;
    if (track) track.style.transform = `translateX(-${currentSlide * 100}%)`;
    dots.forEach((dot, i) => {
      dot.className = `w-3 h-3 rounded-full ${i === currentSlide ? 'bg-white' : 'bg-white/50'}`;
    });
  }

  document.getElementById('carousel-prev')?.addEventListener('click', () => goToSlide(currentSlide - 1));
  document.getElementById('carousel-next')?.addEventListener('click', () => goToSlide(currentSlide + 1));
  dots.forEach(dot => {
    dot.addEventListener('click', () => goToSlide(parseInt(dot.dataset.slide)));
  });

  // Auto-play
  const interval = setInterval(() => goToSlide(currentSlide + 1), 5000);
  return () => clearInterval(interval);
}
