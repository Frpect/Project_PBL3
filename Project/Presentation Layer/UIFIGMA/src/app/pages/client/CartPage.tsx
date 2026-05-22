import { Link, useNavigate } from 'react-router';
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft, Truck, Shield, RotateCcw } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { getCart, updateCartQuantity, removeFromCart } from '../../lib/cart';
import { useAuth } from '../../lib/auth';
import { toast } from 'sonner';
import { useState } from 'react';

export function CartPage() {
  const navigate = useNavigate();
  const [cart, setCart] = useState(getCart());

  const handleUpdateQuantity = (variantId: string, newQuantity: number, maxStock: number) => {
    if (newQuantity < 1) return;
    if (newQuantity > maxStock) {
      toast.error('Không đủ hàng trong kho');
      return;
    }
    updateCartQuantity(variantId, newQuantity);
    setCart(getCart());
  };

  const handleRemoveItem = (variantId: string) => {
    removeFromCart(variantId);
    setCart(getCart());
    toast.success('Đã xóa sản phẩm khỏi giỏ hàng');
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal >= 500000 ? 0 : 30000;
  const total = subtotal + shipping;

  const { isAuthenticated } = useAuth();

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast.error('Giỏ hàng trống');
      return;
    }
    if (!isAuthenticated) {
      navigate('/login?redirect=/checkout');
    } else {
      navigate('/checkout');
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-[80vh] bg-background flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="h-10 w-10 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-semibold text-foreground mb-3">Giỏ hàng trống</h2>
          <p className="text-muted-foreground mb-8">
            Bạn chưa có sản phẩm nào trong giỏ hàng. Hãy khám phá các sản phẩm của chúng tôi.
          </p>
          <Link to="/shop">
            <Button size="lg" className="h-12 px-8 rounded-full font-medium">
              Mua sắm ngay
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10 lg:py-14">
        {/* Header */}
        <div className="mb-10">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)} 
            className="mb-4 -ml-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Tiếp tục mua sắm
          </Button>
          <h1 className="text-3xl lg:text-4xl font-bold text-foreground tracking-tight">Giỏ hàng</h1>
          <p className="mt-2 text-muted-foreground">{cart.length} sản phẩm</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <div
                key={item.variantId}
                className="bg-card p-5 rounded-2xl border border-border"
              >
                <div className="flex gap-5">
                  <Link
                    to={`/product/${item.productId}`}
                    className="flex-shrink-0"
                  >
                    <img
                      src={item.image}
                      alt={item.productName}
                      className="w-24 h-24 object-cover rounded-xl"
                    />
                  </Link>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <Link
                          to={`/product/${item.productId}`}
                          className="font-medium text-foreground hover:underline line-clamp-2"
                        >
                          {item.productName}
                        </Link>
                        <p className="text-sm text-muted-foreground mt-1">
                          {item.variantLabel}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveItem(item.variantId)}
                        className="text-muted-foreground hover:text-destructive h-8 w-8 flex-shrink-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex items-end justify-between mt-4">
                      {/* Quantity Control */}
                      <div className="flex items-center rounded-lg border border-border bg-muted/30">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 rounded-l-lg rounded-r-none"
                          onClick={() =>
                            handleUpdateQuantity(
                              item.variantId,
                              item.quantity - 1,
                              item.stock
                            )
                          }
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-10 text-center text-sm font-medium">
                          {item.quantity}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 rounded-r-lg rounded-l-none"
                          onClick={() =>
                            handleUpdateQuantity(
                              item.variantId,
                              item.quantity + 1,
                              item.stock
                            )
                          }
                          disabled={item.quantity >= item.stock}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>

                      <p className="text-lg font-semibold text-foreground">
                        {(item.price * item.quantity).toLocaleString('vi-VN')}đ
                      </p>
                    </div>

                    {item.quantity >= item.stock && (
                      <p className="text-sm text-amber-600 mt-3">
                        Chỉ còn {item.stock} sản phẩm
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-card p-6 rounded-2xl border border-border sticky top-24">
              <h2 className="text-lg font-semibold text-foreground mb-6">Tóm tắt đơn hàng</h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tạm tính</span>
                  <span className="font-medium text-foreground">
                    {subtotal.toLocaleString('vi-VN')}đ
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Phí vận chuyển</span>
                  <span className="font-medium text-foreground">
                    {shipping === 0 ? (
                      <span className="text-emerald-600">Miễn phí</span>
                    ) : (
                      `${shipping.toLocaleString('vi-VN')}đ`
                    )}
                  </span>
                </div>
                {subtotal < 500000 && (
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground">
                      Mua thêm <span className="font-medium text-foreground">{(500000 - subtotal).toLocaleString('vi-VN')}đ</span> để được miễn phí vận chuyển
                    </p>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-border mb-6">
                <div className="flex justify-between items-baseline">
                  <span className="text-base font-medium text-foreground">Tổng cộng</span>
                  <span className="text-2xl font-bold text-foreground">
                    {total.toLocaleString('vi-VN')}đ
                  </span>
                </div>
              </div>

              <Button 
                size="lg" 
                className="w-full h-12 rounded-xl font-medium mb-3" 
                onClick={handleCheckout}
              >
                Thanh toán
              </Button>

              <Link to="/shop" className="block">
                <Button variant="outline" size="lg" className="w-full h-12 rounded-xl font-medium">
                  Tiếp tục mua sắm
                </Button>
              </Link>

              {/* Trust Badges */}
              <div className="mt-6 pt-6 border-t border-border space-y-3">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Truck className="h-4 w-4 flex-shrink-0" />
                  <span>Miễn phí vận chuyển cho đơn từ 500k</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <RotateCcw className="h-4 w-4 flex-shrink-0" />
                  <span>Đổi trả trong 7 ngày</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Shield className="h-4 w-4 flex-shrink-0" />
                  <span>Thanh toán bảo mật</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
