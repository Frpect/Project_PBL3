import { Link } from 'react-router';
import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight, TrendingUp, Sparkles } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { ProductCard } from '../../components/ProductCard';
import { getFeaturedProducts, getCategories, mapApiProduct, ApiCategory } from '../../lib/api';
import type { Product } from '../../lib/mock-data';

export function HomePage() {
  // Carousel state
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const bannerSlides = [
    {
      image: 'https://images.unsplash.com/photo-1713165678471-0335104539e4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYXNoaW9uJTIwY29sbGVjdGlvbiUyMGJhbm5lciUyMG1vZGVybnxlbnwxfHx8fDE3NzE4MTA3MDh8MA&ixlib=rb-4.1.0&q=80&w=1080',
      title: 'Bộ sưu tập mùa xuân 2026',
      subtitle: 'Khám phá phong cách mới nhất',
      cta: 'Khám phá ngay',
      link: '/shop'
    },
    {
      image: 'https://images.unsplash.com/photo-1655191705791-da7e2244c6b9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cmVuZHklMjBjbG90aGluZyUyMHN0b3JlfGVufDF8fHx8MTc3MTgxMDcwOXww&ixlib=rb-4.1.0&q=80&w=1080',
      title: 'Ưu đãi đặc biệt',
      subtitle: 'Giảm giá đến 30% cho bộ sưu tập mới',
      cta: 'Mua ngay',
      link: '/promotions'
    },
    {
      image: 'https://images.unsplash.com/photo-1683290845409-280ec0dc39df?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBmYXNoaW9uJTIwYm91dGlxdWV8ZW58MXx8fHwxNzcxODEwNzA5fDA&ixlib=rb-4.1.0&q=80&w=1080',
      title: 'Thời trang cao cấp',
      subtitle: 'Phong cách sang trọng cho bạn',
      cta: 'Xem bộ sưu tập',
      link: '/shop'
    }
  ];

  // Auto-play carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % bannerSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % bannerSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + bannerSlides.length) % bannerSlides.length);
  };

  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ApiCategory[]>([]);

  useEffect(() => {
    getFeaturedProducts('bestseller', 4).then(data => setBestSellers(data.map(mapApiProduct)));
    getFeaturedProducts('new', 4).then(data => setNewArrivals(data.map(mapApiProduct)));
    getCategories().then(data => setCategories(data.filter(c => c.isVisible !== false)));
  }, []);

  // Category menu items
  const categoryMenu = [
    {
      name: 'Bộ sưu tập',
      image: 'https://images.unsplash.com/photo-1768225475498-6fc2085f0fbb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYXNoaW9uJTIwY29sbGVjdGlvbiUyMGRpc3BsYXl8ZW58MXx8fHwxNzcxODEwNzA5fDA&ixlib=rb-4.1.0&q=80&w=1080',
      link: '/shop'
    },
    {
      name: 'Hàng mới',
      image: 'https://images.unsplash.com/photo-1762588120781-dfd237626645?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuZXclMjBhcnJpdmFsJTIwZmFzaGlvbnxlbnwxfHx8fDE3NzE4MTA3MDl8MA&ixlib=rb-4.1.0&q=80&w=1080',
      link: '/shop'
    },
    {
      name: 'Áo',
      image: 'https://images.unsplash.com/photo-1642764873654-9eef0467b342?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzaGlydHMlMjBjbG90aGluZyUyMHN0b3JlfGVufDF8fHx8MTc3MTgxMDcxMHww&ixlib=rb-4.1.0&q=80&w=1080',
      link: '/shop/ao'
    },
    {
      name: 'Quần',
      image: 'https://images.unsplash.com/photo-1758018230837-89188346c36f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYW50cyUyMGplYW5zJTIwZmFzaGlvbnxlbnwxfHx8fDE3NzE4MTA3MTB8MA&ixlib=rb-4.1.0&q=80&w=1080',
      link: '/shop/quan'
    },
    {
      name: 'Phụ kiện',
      image: 'https://images.unsplash.com/photo-1559563458-527698bf5295?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYXNoaW9uJTIwYWNjZXNzb3JpZXMlMjBiYWd8ZW58MXx8fHwxNzcxNzE5NzE1fDA&ixlib=rb-4.1.0&q=80&w=1080',
      link: '/shop/phu-kien'
    }
  ];

  return (
    <div className="bg-background">
      {/* Hero Banner Carousel */}
      <section className="relative">
        <div className="relative h-[85vh] min-h-[600px] max-h-[900px] overflow-hidden">
          {/* Slides */}
          {bannerSlides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-all duration-1000 ease-out ${
                index === currentSlide 
                  ? 'opacity-100 scale-100' 
                  : 'opacity-0 scale-105'
              }`}
            >
              <img
                src={slide.image}
                alt={slide.title}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 via-foreground/50 to-transparent" />
              <div className="relative h-full max-w-7xl mx-auto px-6 lg:px-8 flex items-center">
                <div className="max-w-xl">
                  <span className="inline-block px-4 py-1.5 mb-6 text-xs font-medium tracking-widest uppercase bg-background/10 backdrop-blur-sm text-background rounded-full border border-background/20">
                    Mới ra mắt
                  </span>
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 text-background leading-tight tracking-tight">
                    {slide.title}
                  </h1>
                  <p className="text-lg lg:text-xl mb-10 text-background/80 leading-relaxed">
                    {slide.subtitle}
                  </p>
                  <Link to={slide.link}>
                    <Button 
                      size="lg" 
                      className="h-14 px-8 text-base font-medium bg-background text-foreground hover:bg-background/90 rounded-full shadow-lg shadow-foreground/20 transition-all hover:shadow-xl hover:scale-105"
                    >
                      {slide.cta}
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}

          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-background/10 hover:bg-background/20 backdrop-blur-md text-background rounded-full flex items-center justify-center transition-all hover:scale-110 border border-background/20 z-10"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-background/10 hover:bg-background/20 backdrop-blur-md text-background rounded-full flex items-center justify-center transition-all hover:scale-110 border border-background/20 z-10"
            aria-label="Next slide"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-10">
            {bannerSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentSlide 
                    ? 'bg-background w-10' 
                    : 'bg-background/40 w-2 hover:bg-background/60'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Category Menu */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground tracking-tight">Khám phá danh mục</h2>
            <p className="mt-4 text-muted-foreground text-lg">Tìm kiếm phong cách phù hợp với bạn</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
            {categoryMenu.map((category, index) => (
              <Link
                key={index}
                to={category.link}
                className="group relative overflow-hidden rounded-2xl aspect-[3/4] shadow-sm hover:shadow-xl transition-all duration-500"
              >
                <img
                  src={category.image}
                  alt={category.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <h3 className="text-lg font-semibold text-background mb-1">{category.name}</h3>
                  <div className="flex items-center gap-1.5 text-sm text-background/80 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                    <span>Xem thêm</span>
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Best Sellers */}
      <section className="py-20 lg:py-28 bg-muted/30">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-foreground/5">
                  <TrendingUp className="h-5 w-5 text-foreground" />
                </div>
                <h2 className="text-3xl lg:text-4xl font-bold text-foreground tracking-tight">Bán chạy nhất</h2>
              </div>
              <p className="text-muted-foreground text-lg">Được yêu thích nhất trong tháng</p>
            </div>
            <Link to="/shop">
              <Button variant="outline" className="rounded-full px-6 h-11 font-medium hover:bg-foreground hover:text-background transition-colors">
                Xem tất cả
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
            {bestSellers.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-foreground/5">
                  <Sparkles className="h-5 w-5 text-foreground" />
                </div>
                <h2 className="text-3xl lg:text-4xl font-bold text-foreground tracking-tight">Hàng mới về</h2>
              </div>
              <p className="text-muted-foreground text-lg">Cập nhật xu hướng thời trang mới nhất</p>
            </div>
            <Link to="/shop">
              <Button variant="outline" className="rounded-full px-6 h-11 font-medium hover:bg-foreground hover:text-background transition-colors">
                Xem tất cả
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
            {newArrivals.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Promo Banner */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-foreground px-8 py-16 lg:px-16 lg:py-24">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent_50%)]" />
            <div className="relative text-center max-w-2xl mx-auto">
              <span className="inline-block px-4 py-1.5 mb-6 text-xs font-medium tracking-widest uppercase bg-background/10 text-background rounded-full">
                Ưu đãi đặc biệt
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 text-background leading-tight">
                Giảm giá 20% cho đơn hàng đầu tiên
              </h2>
              <p className="text-lg text-background/80 mb-10 leading-relaxed">
                Mã giảm giá tự động áp dụng khi bạn thanh toán. Không cần nhập code!
              </p>
              <Link to="/promotions">
                <Button 
                  size="lg" 
                  className="h-14 px-10 text-base font-medium bg-background text-foreground hover:bg-background/90 rounded-full shadow-lg transition-all hover:shadow-xl hover:scale-105"
                >
                  Xem khuyến mãi
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
