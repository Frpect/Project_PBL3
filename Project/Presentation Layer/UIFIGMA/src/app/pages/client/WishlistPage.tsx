import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { getProducts, mapApiProduct } from '../../lib/api';
import { addToCart } from '../../lib/cart';
import type { Product } from '../../lib/mock-data';
import { toast } from 'sonner';

export function WishlistPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const getWishlistIds = (): string[] =>
    JSON.parse(localStorage.getItem('leon_wishlist') || '[]');

  useEffect(() => {
    const ids = getWishlistIds();
    if (ids.length === 0) { setLoading(false); return; }
    getProducts()
      .then(all => {
        const mapped = all.map(mapApiProduct).filter(p => ids.includes(String(p.id)));
        setProducts(mapped);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const removeFromWishlist = (productId: string) => {
    const updated = getWishlistIds().filter(id => id !== String(productId));
    localStorage.setItem('leon_wishlist', JSON.stringify(updated));
    setProducts(prev => prev.filter(p => String(p.id) !== String(productId)));
    toast.success('Đã xóa khỏi yêu thích');
  };

  const handleAddToCart = (product: Product) => {
    const variant = product.variants.find(v => v.stock > 0);
    if (!variant) { toast.error('Sản phẩm hết hàng'); return; }
    addToCart({ variantId: variant.id, productId: String(product.id), productName: product.name, variantLabel: `${variant.size || ''}${variant.color ? ` / ${variant.color}` : ''}`, price: product.salePrice ?? product.basePrice, image: product.images[0], quantity: 1, stock: variant.stock });
    toast.success('Đã thêm vào giỏ hàng');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-6 lg:px-8 py-10 lg:py-14">
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <Heart className="h-7 w-7 text-red-500 fill-red-500" />
            <h1 className="text-3xl lg:text-4xl font-bold text-foreground tracking-tight">Yêu thích</h1>
          </div>
          <p className="text-muted-foreground">
            {products.length > 0 ? `${products.length} sản phẩm` : 'Lưu các sản phẩm bạn thích để xem sau'}
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Đang tải...</p>
            </div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Heart className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Chưa có sản phẩm yêu thích</h3>
            <p className="text-muted-foreground mb-6">Nhấn icon tim trên trang sản phẩm để lưu vào đây</p>
            <Link to="/shop">
              <Button className="rounded-xl">Khám phá sản phẩm</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
            {products.map(product => {
              const displayPrice = product.salePrice ?? product.basePrice;
              const hasStock = product.variants.some(v => v.stock > 0);
              return (
                <div key={product.id} className="bg-card rounded-2xl border border-border overflow-hidden group">
                  <div className="relative aspect-square overflow-hidden">
                    <Link to={`/product/${product.id}`}>
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </Link>
                    <button
                      onClick={() => removeFromWishlist(String(product.id))}
                      className="absolute top-3 right-3 w-9 h-9 bg-background rounded-full shadow-lg flex items-center justify-center hover:bg-red-50 transition-colors"
                      title="Xóa khỏi yêu thích"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </button>
                    {!hasStock && (
                      <div className="absolute inset-0 bg-foreground/60 flex items-center justify-center">
                        <span className="text-background font-medium text-sm px-3 py-1.5 rounded-lg bg-foreground/80">Hết hàng</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <Link to={`/product/${product.id}`}>
                      <p className="font-medium text-sm text-foreground line-clamp-2 hover:underline mb-2 min-h-[40px]">
                        {product.name}
                      </p>
                    </Link>
                    <div className="flex items-center gap-2 mb-4">
                      <span className="font-bold text-foreground">
                        {displayPrice.toLocaleString('vi-VN')}đ
                      </span>
                      {product.salePrice && product.basePrice > product.salePrice && (
                        <span className="text-xs text-muted-foreground line-through">
                          {product.basePrice.toLocaleString('vi-VN')}đ
                        </span>
                      )}
                    </div>
                    <Button
                      size="sm"
                      className="w-full rounded-lg h-10"
                      disabled={!hasStock}
                      onClick={() => handleAddToCart(product)}
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      {hasStock ? 'Thêm vào giỏ' : 'Hết hàng'}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
