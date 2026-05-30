import { Outlet, Link, useLocation, useNavigate } from 'react-router';
import { ShoppingCart, User, Search, Menu, X, LogOut, Heart } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { useState, useEffect } from 'react';
import { getCartCount } from '../../lib/cart';
import { useAuth } from '../../lib/auth';

export function ClientLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [cartCount, setCartCount] = useState(getCartCount);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    const update = () => setCartCount(getCartCount());
    window.addEventListener('cart-updated', update);
    return () => window.removeEventListener('cart-updated', update);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navigation = [
    { name: 'Trang chủ', href: '/' },
    { name: 'Sản phẩm', href: '/shop' },
    { name: 'Danh mục', href: '/categories' },
    { name: 'Khuyến mãi', href: '/promotions' },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/shop?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-background/95 backdrop-blur-md shadow-sm' : 'bg-background'
      }`}>
        <nav className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center">
              <span className="text-xl lg:text-2xl font-bold tracking-[0.2em] text-foreground">
                LEON
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-10 ml-16">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`text-sm font-medium transition-colors hover:text-foreground ${
                    location.pathname === item.href
                      ? 'text-foreground'
                      : 'text-muted-foreground'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>

            {/* Search Bar (Desktop) */}
            <form onSubmit={handleSearch} className="hidden lg:flex items-center flex-1 max-w-sm mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Tìm kiếm sản phẩm..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-10 rounded-full bg-muted/50 border-transparent focus:border-border focus:bg-background"
                />
              </div>
            </form>

            {/* Right Actions */}
            <div className="flex items-center gap-1 lg:gap-2">
              <Link to="/wishlist">
                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full" aria-label="Yêu thích">
                  <Heart className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/cart">
                <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-full" aria-label="Giỏ hàng">
                  <ShoppingCart className="h-5 w-5" />
                  {cartCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 h-5 w-5 rounded-full bg-foreground text-background text-xs font-medium flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </Button>
              </Link>
              {isAuthenticated ? (
                <div className="flex items-center gap-1">
                  <Link to="/profile">
                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full" aria-label="Tài khoản">
                      <User className="h-5 w-5" />
                    </Button>
                  </Link>
                  <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full" onClick={logout} aria-label="Đăng xuất">
                    <LogOut className="h-5 w-5" />
                  </Button>
                </div>
              ) : (
                <Link to="/login" className="hidden sm:block">
                  <Button variant="outline" size="sm" className="h-10 px-5 rounded-full font-medium">
                    Đăng nhập
                  </Button>
                </Link>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden h-10 w-10 rounded-full"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Menu"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Search */}
          <form onSubmit={handleSearch} className="lg:hidden pb-4">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Tìm kiếm sản phẩm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10 rounded-full bg-muted/50 border-transparent"
              />
            </div>
          </form>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden py-4 border-t border-border">
              <div className="flex flex-col gap-1">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      location.pathname === item.href
                        ? 'bg-muted text-foreground'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
                {!isAuthenticated && (
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    Đăng nhập
                  </Link>
                )}
              </div>
            </div>
          )}
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-foreground text-background mt-auto">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12 lg:py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            <div className="md:col-span-1">
              <Link to="/" className="inline-block mb-4">
                <span className="text-2xl font-bold tracking-[0.2em]">LEON</span>
              </Link>
              <p className="text-sm text-background/70 leading-relaxed">
                Thời trang hiện đại, chất lượng cao cho mọi phong cách.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Liên kết</h3>
              <ul className="space-y-3 text-sm text-background/70">
                <li><Link to="/shop" className="hover:text-background transition-colors">Sản phẩm</Link></li>
                <li><Link to="/categories" className="hover:text-background transition-colors">Danh mục</Link></li>
                <li><Link to="/promotions" className="hover:text-background transition-colors">Khuyến mãi</Link></li>
                <li><Link to="/about" className="hover:text-background transition-colors">Về chúng tôi</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Hỗ trợ</h3>
              <ul className="space-y-3 text-sm text-background/70">
                <li><Link to="/profile" className="hover:text-background transition-colors">Tài khoản</Link></li>
                <li><Link to="/orders" className="hover:text-background transition-colors">Đơn hàng</Link></li>
                <li><Link to="/cart" className="hover:text-background transition-colors">Giỏ hàng</Link></li>
                <li><Link to="/wishlist" className="hover:text-background transition-colors">Yêu thích</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Liên hệ</h3>
              <ul className="space-y-3 text-sm text-background/70">
                <li>Hotline: 1900 xxxx</li>
                <li>Email: support@leon.com</li>
                <li>123 Nguyễn Huệ, Q1, TP.HCM</li>
              </ul>
            </div>
          </div>
          <div className="mt-10 pt-8 border-t border-background/10 text-center text-sm text-background/50">
            &copy; 2026 LEON. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
