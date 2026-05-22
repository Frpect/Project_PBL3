import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router';
import { CreditCard, DollarSign, Plus, MapPin, Trash2, Tag, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { RadioGroup, RadioGroupItem } from '../../components/ui/radio-group';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { Badge } from '../../components/ui/badge';
import { getCart, clearCart } from '../../lib/cart';
import { useAuth } from '../../lib/auth';
import { createOrder, getDiscounts, ApiDiscount, getAddresses, createAddress, deleteAddress, ApiAddress, formatAddress } from '../../lib/api';
import { toast } from 'sonner';

export function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();

  const buyNowItems = ((location.state as any)?.buyNowItems ?? []) as ReturnType<typeof getCart>;
  const isBuyNow = buyNowItems.length > 0;
  const cart = getCart();
  const items = isBuyNow ? buyNowItems : cart;

  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');

  const [addresses, setAddresses] = useState<ApiAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newAddr, setNewAddr] = useState({ province: '', district: '', ward: '', streetAddress: '' });
  const [savingAddr, setSavingAddr] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'online'>('cod');
  const [appliedVoucher, setAppliedVoucher] = useState<ApiDiscount | null>(null);
  const [availablePromos, setAvailablePromos] = useState<ApiDiscount[]>([]);
  const [showAllPromos, setShowAllPromos] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    getAddresses(user.id).then(list => {
      setAddresses(list);
      const def = list.find(a => a.isDefault) || list[0];
      if (def) setSelectedAddressId(def.addressId);
    });
  }, [user?.id]);

  useEffect(() => {
    const now = new Date();
    getDiscounts().then(list => {
      setAvailablePromos(list.filter(p => {
        if (!p.isActive) return false;
        if (p.startDate && new Date(p.startDate) > now) return false;
        if (p.endDate && new Date(p.endDate) < now) return false;
        return true;
      }));
    }).catch(() => {});
  }, []);

  const handleAddAddress = async () => {
    if (!newAddr.streetAddress) {
      toast.error('Vui lòng nhập địa chỉ chi tiết');
      return;
    }
    setSavingAddr(true);
    try {
      const created = await createAddress(user!.id, {
        ...newAddr,
        recipientName: customerName || user?.name || '',
        phone: customerPhone || user?.phone || '',
      });
      setAddresses(prev => [...prev, created]);
      setSelectedAddressId(created.addressId);
      setShowAddDialog(false);
      setNewAddr({ province: '', district: '', ward: '', streetAddress: '' });
      toast.success('Đã thêm địa chỉ');
    } catch (e: any) { toast.error(e.message); }
    finally { setSavingAddr(false); }
  };

  const handleDeleteAddress = async (addressId: number) => {
    await deleteAddress(user!.id, addressId).catch(() => {});
    setAddresses(prev => prev.filter(a => a.addressId !== addressId));
    if (selectedAddressId === addressId) setSelectedAddressId(addresses.find(a => a.addressId !== addressId)?.addressId ?? null);
  };

  if (!isAuthenticated) {
    return <Navigate to="/login?redirect=/checkout" replace />;
  }

  if (items.length === 0) {
    return <Navigate to="/cart" replace />;
  }

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal >= 500000 ? 0 : 30000;
  
  let discount = 0;
  if (appliedVoucher) {
    if (appliedVoucher.type === 'percentage') {
      discount = (subtotal * appliedVoucher.value) / 100;
      if (appliedVoucher.maxDiscount && discount > appliedVoucher.maxDiscount) {
        discount = appliedVoucher.maxDiscount;
      }
    } else {
      discount = appliedVoucher.value;
    }
  }

  const total = subtotal + shipping - discount;

  const handleSelectPromo = (promo: ApiDiscount) => {
    if (appliedVoucher?.discountId === promo.discountId) {
      setAppliedVoucher(null);
    } else {
      setAppliedVoucher(promo);
      toast.success(`Đã áp dụng mã ${promo.code}`);
    }
  };

  const eligiblePromos = availablePromos.filter(p => !p.minOrder || subtotal >= p.minOrder);
  const ineligiblePromos = availablePromos.filter(p => p.minOrder && subtotal < p.minOrder);
  const displayPromos = showAllPromos ? [...eligiblePromos, ...ineligiblePromos] : eligiblePromos;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName || !customerPhone) {
      toast.error('Vui lòng nhập họ tên và số điện thoại');
      return;
    }
    if (!selectedAddressId) {
      toast.error('Vui lòng chọn hoặc thêm địa chỉ nhận hàng');
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        userId: Number(user?.id) || 0,
        shippingAddressId: selectedAddressId,
        customerName,
        customerPhone,
        paymentMethod,
        discountCode: appliedVoucher?.code,
        promotionId: appliedVoucher ? Number(appliedVoucher.discountId) : undefined,
        items: items.map(item => ({
          variantId: Number(item.variantId),
          quantity: item.quantity,
          price: item.price,
        })),
      };
      const order = await createOrder(orderData);
      if (!isBuyNow) clearCart();
      toast.success('Đặt hàng thành công');
      navigate(`/payment/result?status=success&orderId=${order.orderId || order.orderNumber}`);
    } catch (err: any) {
      toast.error(err.message || 'Đặt hàng thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10 lg:py-14">
        <div className="mb-10">
          <h1 className="text-3xl lg:text-4xl font-bold text-foreground tracking-tight">Thanh toán</h1>
          <p className="mt-2 text-muted-foreground">{items.length} sản phẩm</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Checkout Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Recipient Info */}
              <div className="bg-card p-6 rounded-2xl border border-border">
                <h2 className="text-lg font-semibold text-foreground mb-5">Thông tin người nhận</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">Họ và tên *</Label>
                    <Input 
                      value={customerName} 
                      onChange={e => setCustomerName(e.target.value)} 
                      placeholder="Nguyễn Văn A" 
                      className="h-11 rounded-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">Số điện thoại *</Label>
                    <Input 
                      value={customerPhone} 
                      onChange={e => setCustomerPhone(e.target.value)} 
                      placeholder="0901234567" 
                      className="h-11 rounded-lg"
                    />
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-card p-6 rounded-2xl border border-border">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg font-semibold text-foreground">Địa chỉ nhận hàng</h2>
                  <Button type="button" variant="outline" size="sm" onClick={() => setShowAddDialog(true)} className="rounded-lg">
                    <Plus className="h-4 w-4 mr-1.5" /> Thêm địa chỉ
                  </Button>
                </div>
                {addresses.length === 0 ? (
                  <div className="text-center py-10">
                    <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                      <MapPin className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground mb-4">Bạn chưa có địa chỉ nào</p>
                    <Button type="button" variant="outline" onClick={() => setShowAddDialog(true)} className="rounded-lg">
                      <Plus className="h-4 w-4 mr-1.5" /> Thêm địa chỉ mới
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {addresses.map(addr => (
                      <div
                        key={addr.addressId}
                        onClick={() => setSelectedAddressId(addr.addressId)}
                        className={`flex items-start gap-4 p-4 border rounded-xl cursor-pointer transition-all ${
                          selectedAddressId === addr.addressId 
                            ? 'border-foreground bg-foreground/5' 
                            : 'border-border hover:border-foreground/30'
                        }`}
                      >
                        <div className="mt-0.5">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                            selectedAddressId === addr.addressId ? 'border-foreground' : 'border-muted-foreground/30'
                          }`}>
                            {selectedAddressId === addr.addressId && <div className="w-2.5 h-2.5 rounded-full bg-foreground" />}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-foreground">{formatAddress(addr)}</p>
                          {addr.isDefault && (
                            <span className="inline-block mt-2 text-xs px-2 py-0.5 rounded-full bg-foreground text-background font-medium">
                              Mặc định
                            </span>
                          )}
                        </div>
                        <Button
                          type="button" 
                          variant="ghost" 
                          size="icon"
                          className="text-muted-foreground hover:text-destructive shrink-0 h-8 w-8"
                          onClick={e => { e.stopPropagation(); handleDeleteAddress(addr.addressId); }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Payment Method */}
              <div className="bg-card p-6 rounded-2xl border border-border">
                <h2 className="text-lg font-semibold text-foreground mb-5">Phương thức thanh toán</h2>
                <RadioGroup value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)}>
                  <div className="space-y-3">
                    <label 
                      htmlFor="cod" 
                      className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-all ${
                        paymentMethod === 'cod' ? 'border-foreground bg-foreground/5' : 'border-border hover:border-foreground/30'
                      }`}
                    >
                      <RadioGroupItem value="cod" id="cod" />
                      <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                        <DollarSign className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-foreground">Thanh toán khi nhận hàng (COD)</p>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          Thanh toán bằng tiền mặt khi nhận hàng
                        </p>
                      </div>
                    </label>

                    <label 
                      htmlFor="online" 
                      className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-all ${
                        paymentMethod === 'online' ? 'border-foreground bg-foreground/5' : 'border-border hover:border-foreground/30'
                      }`}
                    >
                      <RadioGroupItem value="online" id="online" />
                      <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                        <CreditCard className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-foreground">Thanh toán online</p>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          VNPay, Momo, Internet Banking
                        </p>
                      </div>
                    </label>
                  </div>
                </RadioGroup>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-card p-6 rounded-2xl border border-border sticky top-24">
                <h2 className="text-lg font-semibold text-foreground mb-5">Đơn hàng của bạn</h2>

                {/* Cart Items */}
                <div className="space-y-4 mb-6 max-h-56 overflow-y-auto pr-2">
                  {items.map((item) => (
                    <div key={item.variantId} className="flex gap-3">
                      <img
                        src={item.image}
                        alt={item.productName}
                        className="w-14 h-14 object-cover rounded-lg"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-foreground line-clamp-1">
                          {item.productName}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {item.variantLabel} x {item.quantity}
                        </p>
                        <p className="text-sm font-semibold text-foreground mt-1">
                          {(item.price * item.quantity).toLocaleString('vi-VN')}đ
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Voucher */}
                <div className="mb-6 pb-6 border-b border-border">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-foreground">Mã giảm giá</span>
                    {appliedVoucher && (
                      <button type="button" onClick={() => setAppliedVoucher(null)} className="text-xs text-destructive hover:underline">
                        Bỏ chọn
                      </button>
                    )}
                  </div>

                  {availablePromos.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Hiện không có mã giảm giá khả dụng</p>
                  ) : (
                    <div className="space-y-2">
                      {displayPromos.map(promo => {
                        const isApplied = appliedVoucher?.discountId === promo.discountId;
                        const isEligible = !promo.minOrder || subtotal >= promo.minOrder;
                        const shortfall = promo.minOrder ? promo.minOrder - subtotal : 0;
                        return (
                          <div
                            key={promo.discountId}
                            onClick={() => isEligible && handleSelectPromo(promo)}
                            className={`flex items-center gap-3 p-3 border rounded-xl transition-all ${
                              isApplied
                                ? 'border-emerald-500 bg-emerald-50'
                                : isEligible
                                  ? 'border-border hover:border-foreground/30 cursor-pointer'
                                  : 'border-border/50 opacity-50 cursor-not-allowed'
                            }`}
                          >
                            <Tag className={`h-4 w-4 shrink-0 ${isApplied ? 'text-emerald-600' : isEligible ? 'text-foreground' : 'text-muted-foreground'}`} />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-mono font-bold tracking-wider">{promo.code}</span>
                                <Badge variant="outline" className="text-xs py-0 h-5">
                                  {promo.type === 'percentage' ? `-${promo.value}%` : `-${promo.value.toLocaleString('vi-VN')}đ`}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground truncate mt-0.5">
                                {isEligible
                                  ? promo.discountName
                                  : `Cần thêm ${shortfall.toLocaleString('vi-VN')}đ để dùng mã này`}
                              </p>
                            </div>
                            {isApplied && <Check className="h-4 w-4 text-emerald-600 shrink-0" />}
                          </div>
                        );
                      })}

                      {ineligiblePromos.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setShowAllPromos(v => !v)}
                          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mt-2"
                        >
                          {showAllPromos ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                          {showAllPromos ? 'Ẩn bớt' : `Xem ${ineligiblePromos.length} mã chưa đủ điều kiện`}
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Summary */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tạm tính</span>
                    <span className="text-foreground">{subtotal.toLocaleString('vi-VN')}đ</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Phí vận chuyển</span>
                    <span className="text-foreground">
                      {shipping === 0 ? (
                        <span className="text-emerald-600">Miễn phí</span>
                      ) : (
                        `${shipping.toLocaleString('vi-VN')}đ`
                      )}
                    </span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Giảm giá</span>
                      <span className="text-emerald-600">
                        -{discount.toLocaleString('vi-VN')}đ
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-baseline pt-4 border-t border-border mb-6">
                  <span className="text-base font-medium text-foreground">Tổng cộng</span>
                  <span className="text-2xl font-bold text-foreground">
                    {total.toLocaleString('vi-VN')}đ
                  </span>
                </div>

                <Button type="submit" size="lg" className="w-full h-12 rounded-xl font-medium" disabled={loading}>
                  {loading ? 'Đang xử lý...' : 'Đặt hàng'}
                </Button>

                <p className="text-xs text-muted-foreground text-center mt-4">
                  Bằng việc đặt hàng, bạn đồng ý với{' '}
                  <a href="#" className="text-foreground hover:underline">
                    Điều khoản sử dụng
                  </a>
                </p>
              </div>
            </div>
          </div>
        </form>

        {/* Add Address Dialog */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent className="max-w-md rounded-2xl">
            <DialogHeader>
              <DialogTitle>Thêm địa chỉ nhận hàng</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Địa chỉ chi tiết (số nhà, đường) *</Label>
                <Input value={newAddr.streetAddress} onChange={e => setNewAddr({...newAddr, streetAddress: e.target.value})} placeholder="123 Nguyễn Huệ" className="h-11 rounded-lg" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Phường/Xã</Label>
                  <Input value={newAddr.ward} onChange={e => setNewAddr({...newAddr, ward: e.target.value})} placeholder="Phường Bến Nghé" className="h-11 rounded-lg" />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Quận/Huyện</Label>
                  <Input value={newAddr.district} onChange={e => setNewAddr({...newAddr, district: e.target.value})} placeholder="Quận 1" className="h-11 rounded-lg" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Tỉnh/Thành phố</Label>
                <Input value={newAddr.province} onChange={e => setNewAddr({...newAddr, province: e.target.value})} placeholder="TP. Hồ Chí Minh" className="h-11 rounded-lg" />
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setShowAddDialog(false)} className="rounded-lg">Hủy</Button>
              <Button onClick={handleAddAddress} disabled={savingAddr} className="rounded-lg">
                {savingAddr ? 'Đang lưu...' : 'Lưu địa chỉ'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
