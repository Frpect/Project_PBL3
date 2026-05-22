import { Link } from 'react-router';
import { ShoppingCart, Heart, Eye } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import type { Product } from '../lib/mock-data';
import { cn } from './ui/utils';
import { useState } from 'react';

interface ProductCardProps {
  product: Product;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  
  const displayPrice = product.salePrice || product.basePrice;
  const hasDiscount = !!product.salePrice;
  const discountPercent = hasDiscount 
    ? Math.round((1 - displayPrice / product.basePrice) * 100)
    : 0;
  const totalStock = product.variants.reduce((sum, v) => sum + v.stock, 0);
  const isOutOfStock = totalStock === 0;
  const isNew = product.createdAt && (Date.now() - product.createdAt.getTime()) < 7 * 24 * 60 * 60 * 1000;

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Add to cart logic
  };

  return (
    <Link
      to={`/product/${product.id}`}
      className={cn(
        'group block bg-card rounded-2xl border border-border overflow-hidden transition-all duration-300',
        'hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1',
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="aspect-[4/5] overflow-hidden bg-muted relative">
        <img
          src={product.images[0]}
          alt={product.name}
          className={cn(
            'w-full h-full object-cover transition-transform duration-500',
            isHovered && 'scale-110'
          )}
        />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {hasDiscount && !isOutOfStock && (
            <Badge className="bg-destructive text-destructive-foreground font-bold text-xs px-2 py-1 shadow-lg">
              -{discountPercent}%
            </Badge>
          )}
          {isNew && !isOutOfStock && (
            <Badge className="bg-primary text-primary-foreground font-medium text-xs px-2 py-1 shadow-lg">
              Mới
            </Badge>
          )}
        </div>

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-foreground/70 backdrop-blur-sm flex items-center justify-center">
            <span className="text-background font-semibold text-sm px-4 py-2 rounded-full bg-foreground/90 border border-background/20">
              Hết hàng
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div className={cn(
          'absolute top-3 right-3 flex flex-col gap-2 transition-all duration-300',
          isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'
        )}>
          <Button
            size="icon"
            variant="secondary"
            className={cn(
              'h-9 w-9 rounded-full shadow-lg backdrop-blur-sm',
              isFavorite && 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
            )}
            onClick={handleFavorite}
            aria-label="Yêu thích"
          >
            <Heart className={cn('h-4 w-4', isFavorite && 'fill-current')} />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            className="h-9 w-9 rounded-full shadow-lg backdrop-blur-sm"
            aria-label="Xem nhanh"
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Quick Add to Cart */}
        {!isOutOfStock && (
          <div className={cn(
            'absolute bottom-0 left-0 right-0 p-3 transition-all duration-300',
            isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          )}>
            <Button
              className="w-full h-11 rounded-xl font-medium shadow-lg"
              onClick={handleAddToCart}
              aria-label="Thêm vào giỏ"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Thêm vào giỏ
            </Button>
          </div>
        )}
      </div>

      <div className="p-4">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
          {product.category}
        </p>
        <h3 className="font-semibold text-foreground mb-3 line-clamp-2 min-h-[44px] leading-snug group-hover:text-primary transition-colors">
          {product.name}
        </h3>
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-bold text-foreground">
            {displayPrice.toLocaleString('vi-VN')}
            <span className="text-sm font-normal">đ</span>
          </span>
          {hasDiscount && (
            <span className="text-sm text-muted-foreground line-through">
              {product.basePrice.toLocaleString('vi-VN')}đ
            </span>
          )}
        </div>
        
        {/* Stock Indicator */}
        {!isOutOfStock && totalStock <= 10 && (
          <p className="text-xs text-destructive mt-2 font-medium">
            Chỉ còn {totalStock} sản phẩm
          </p>
        )}
      </div>
    </Link>
  );
}
