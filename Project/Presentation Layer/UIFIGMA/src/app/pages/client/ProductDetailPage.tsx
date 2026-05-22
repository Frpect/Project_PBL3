import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import { ShoppingCart, Minus, Plus, Heart, Share2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { ProductCard } from '../../components/ProductCard';
import { getProductById, getProducts, mapApiProduct } from '../../lib/api';
import { addToCart } from '../../lib/cart';
import type { Product, ProductVariant } from '../../lib/mock-data';
import { toast } from 'sonner';

export function ProductDetailPage() {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [isFavorite, setIsFavorite] = useState(() => {
    const saved: string[] = JSON.parse(localStorage.getItem('leon_wishlist') || '[]');
    return saved.includes(String(productId));
  });

  const toggleFavorite = () => {
    const saved: string[] = JSON.parse(localStorage.getItem('leon_wishlist') || '[]');
    const id = String(productId);
    const updated = saved.includes(id) ? saved.filter(x => x !== id) : [...saved, id];
    localStorage.setItem('leon_wishlist', JSON.stringify(updated));
    setIsFavorite(!isFavorite);
    toast.success(isFavorite ? 'Đã xóa khỏi yêu thích' : 'Đã thêm vào yêu thích');
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
      .then(() => toast.success('Đã sao chép link sản phẩm'))
      .catch(() => toast.error('Không thể sao chép link'));
  };

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (!productId) return;
    setLoadingProduct(true);
    getProductById(productId)
      .then(data => {
        const mapped = mapApiProduct(data);
        setProduct(mapped);
        return getProducts();
      })
      .then(all => {
        const mapped = all.map(mapApiProduct);
        setRelatedProducts(mapped.filter(p => p.id !== productId && product && p.category === product.category).slice(0, 4));
      })
      .catch(() => setProduct(null))
      .finally(() => setLoadingProduct(false));
  }, [productId]);

  if (loadingProduct) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Đang tải sản phẩm...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-semibold text-foreground mb-4">Sản phẩm không tồn tại</h2>
          <Link to="/shop">
            <Button className="rounded-full">Về trang sản phẩm</Button>
          </Link>
        </div>
      </div>
    );
  }

  const displayPrice = product.salePrice || product.basePrice;
  const hasDiscount = !!product.salePrice;

  // Get available sizes and colors
  const availableSizes = Array.from(new Set(product.variants.map(v => v.size))).sort();
  const availableColors = Array.from(new Set(product.variants.map(v => v.color))).sort();

  // Get selected variant
  const selectedVariant = product.variants.find(
    v => (!selectedSize || v.size === selectedSize) && (!selectedColor || v.color === selectedColor)
  );

  const maxQuantity = selectedVariant?.stock || 0;
  const isOutOfStock = maxQuantity === 0;

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast.error('Vui lòng chọn size');
      return;
    }
    if (!selectedColor) {
      toast.error('Vui lòng chọn màu');
      return;
    }
    if (!selectedVariant) {
      toast.error('Sản phẩm không khả dụng');
      return;
    }

    addToCart({
      variantId: selectedVariant.id,
      productId: product.id,
      productName: product.name,
      variantLabel: `${selectedVariant.size} / ${selectedVariant.color}`,
      quantity,
      price: selectedVariant.price || displayPrice,
      image: product.images[0],
      stock: selectedVariant.stock,
    });

    toast.success('Đã thêm vào giỏ hàng');
  };

  const handleBuyNow = () => {
    if (!selectedSize) { toast.error('Vui lòng chọn size'); return; }
    if (!selectedColor) { toast.error('Vui lòng chọn màu'); return; }
    if (!selectedVariant) { toast.error('Sản phẩm không khả dụng'); return; }
    navigate('/checkout', {
      state: {
        buyNowItems: [{
          variantId: selectedVariant.id,
          productId: product.id,
          productName: product.name,
          variantLabel: `${selectedVariant.size} / ${selectedVariant.color}`,
          quantity,
          price: selectedVariant.price || displayPrice,
          image: product.images[0],
          stock: selectedVariant.stock,
        }],
      },
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10 lg:py-14">
        {/* Breadcrumb */}
        <nav className="mb-8 flex items-center gap-2 text-sm">
          <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
            Trang chủ
          </Link>
          <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
          <Link to="/shop" className="text-muted-foreground hover:text-foreground transition-colors">
            Sản phẩm
          </Link>
          <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
          <span className="text-foreground font-medium truncate max-w-[200px]">{product.name}</span>
        </nav>

        {/* Product Detail */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 mb-20">
          {/* Images */}
          <div className="space-y-4">
            <div className="aspect-square rounded-2xl overflow-hidden bg-muted relative group">
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {hasDiscount && (
                <Badge className="absolute top-4 left-4 bg-foreground text-background font-medium">
                  -{Math.round((1 - displayPrice / product.basePrice) * 100)}%
                </Badge>
              )}
              {/* Image navigation for multiple images */}
              {product.images.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedImage(prev => prev > 0 ? prev - 1 : product.images.length - 1)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setSelectedImage(prev => prev < product.images.length - 1 ? prev + 1 : 0)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                      selectedImage === index ? 'border-foreground' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={image} alt={`${product.name} ${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <div className="mb-6">
              <Badge variant="outline" className="mb-3 text-xs font-medium">{product.category}</Badge>
              <h1 className="text-2xl lg:text-3xl font-bold text-foreground leading-tight mb-2">{product.name}</h1>
              <p className="text-sm text-muted-foreground">Mã: {product.code}</p>
            </div>

            <div className="flex items-baseline gap-3 mb-8">
              <span className="text-3xl font-bold text-foreground">
                {displayPrice.toLocaleString('vi-VN')}đ
              </span>
              {hasDiscount && (
                <span className="text-lg text-muted-foreground line-through">
                  {product.basePrice.toLocaleString('vi-VN')}đ
                </span>
              )}
            </div>

            <div className="pb-8 mb-8 border-b border-border">
              <p className="text-muted-foreground leading-relaxed">{product.description}</p>
            </div>

            {/* Size Selection */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-foreground">Chọn size</span>
                {selectedSize && selectedVariant && (
                  <span className="text-sm text-muted-foreground">
                    Còn {selectedVariant.stock} sản phẩm
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {availableSizes.map((size) => {
                  const hasStock = product.variants.some(
                    v => v.size === size && (!selectedColor || v.color === selectedColor) && v.stock > 0
                  );
                  return (
                    <button
                      key={size}
                      disabled={!hasStock}
                      onClick={() => setSelectedSize(s => s === size ? '' : size)}
                      className={`h-11 min-w-[48px] px-4 rounded-lg border text-sm font-medium transition-all ${
                        selectedSize === size
                          ? 'bg-foreground text-background border-foreground'
                          : hasStock
                            ? 'bg-background text-foreground border-border hover:border-foreground'
                            : 'bg-muted text-muted-foreground border-transparent cursor-not-allowed line-through'
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Color Selection */}
            <div className="mb-8">
              <span className="text-sm font-medium text-foreground block mb-3">Chọn màu</span>
              <div className="flex flex-wrap gap-2">
                {availableColors.map((color) => {
                  const hasStock = product.variants.some(
                    v => v.color === color && (!selectedSize || v.size === selectedSize) && v.stock > 0
                  );
                  return (
                    <button
                      key={color}
                      disabled={!hasStock}
                      onClick={() => setSelectedColor(c => c === color ? '' : color)}
                      className={`h-11 px-5 rounded-lg border text-sm font-medium transition-all ${
                        selectedColor === color
                          ? 'bg-foreground text-background border-foreground'
                          : hasStock
                            ? 'bg-background text-foreground border-border hover:border-foreground'
                            : 'bg-muted text-muted-foreground border-transparent cursor-not-allowed line-through'
                      }`}
                    >
                      {color}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quantity */}
            <div className="mb-8">
              <span className="text-sm font-medium text-foreground block mb-3">Số lượng</span>
              <div className="flex items-center gap-4">
                <div className="flex items-center rounded-lg border border-border bg-muted/30">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-11 w-11 rounded-l-lg rounded-r-none"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-14 text-center font-medium">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-11 w-11 rounded-r-lg rounded-l-none"
                    onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
                    disabled={quantity >= maxQuantity}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {maxQuantity > 0 && (
                  <span className="text-sm text-muted-foreground">
                    Tối đa {maxQuantity} sản phẩm
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mb-6">
              <Button
                size="lg"
                className="flex-1 h-12 rounded-xl font-medium"
                disabled={isOutOfStock || !selectedSize || !selectedColor}
                onClick={handleAddToCart}
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Thêm vào giỏ
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="flex-1 h-12 rounded-xl font-medium"
                disabled={isOutOfStock || !selectedSize || !selectedColor}
                onClick={handleBuyNow}
              >
                Mua ngay
              </Button>
            </div>

            <div className="flex gap-3">
              <Button
                variant="ghost"
                className={`flex-1 h-11 rounded-lg ${isFavorite ? 'text-red-500 hover:text-red-600' : ''}`}
                onClick={toggleFavorite}
              >
                <Heart className={`h-4 w-4 mr-2 ${isFavorite ? 'fill-current' : ''}`} />
                {isFavorite ? 'Đã yêu thích' : 'Yêu thích'}
              </Button>
              <Button variant="ghost" className="flex-1 h-11 rounded-lg" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Chia sẻ
              </Button>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mb-20">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="w-full justify-start h-auto p-0 bg-transparent border-b border-border rounded-none gap-8">
              <TabsTrigger 
                value="description" 
                className="px-0 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none"
              >
                Mô tả
              </TabsTrigger>
              <TabsTrigger 
                value="material" 
                className="px-0 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none"
              >
                Chất liệu
              </TabsTrigger>
              <TabsTrigger 
                value="care" 
                className="px-0 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none"
              >
                Hướng dẫn bảo quản
              </TabsTrigger>
            </TabsList>
            <TabsContent value="description" className="mt-8">
              <div className="max-w-3xl space-y-4 text-muted-foreground leading-relaxed">
                <p>{product.description}</p>
                <p>
                  Sản phẩm được thiết kế với form dáng hiện đại, phù hợp với nhiều phong cách khác nhau.
                  Chất liệu cao cấp đảm bảo sự thoải mái khi mặc.
                </p>
              </div>
            </TabsContent>
            <TabsContent value="material" className="mt-8">
              <div className="max-w-3xl space-y-6">
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Chất liệu</h3>
                  <p className="text-muted-foreground">{product.material}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-3">Đặc tính</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-foreground" />
                      Mềm mại, thoáng mát
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-foreground" />
                      Thấm hút mồ hôi tốt
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-foreground" />
                      Bền màu, không phai
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-foreground" />
                      Dễ giặt, dễ bảo quản
                    </li>
                  </ul>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="care" className="mt-8">
              <div className="max-w-3xl">
                <h3 className="font-semibold text-foreground mb-3">Hướng dẫn bảo quản</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-foreground" />
                    Giặt máy ở nhiệt độ thường
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-foreground" />
                    Không sử dụng chất tẩy mạnh
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-foreground" />
                    Phơi nơi thoáng mát, tránh ánh nắng trực tiếp
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-foreground" />
                    Ủi ở nhiệt độ thấp nếu cần
                  </li>
                </ul>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-8">Sản phẩm liên quan</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
              {relatedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
