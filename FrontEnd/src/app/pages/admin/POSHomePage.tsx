import { useState, useRef, useEffect } from 'react';
import { Search, Plus, Minus, Trash2, User, ShoppingCart, Receipt, Printer, CreditCard, Banknote, Building2, Package } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { RadioGroup, RadioGroupItem } from '../../components/ui/radio-group';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import type { CartItem } from '../../lib/mock-data';
import { getProducts, mapApiProduct, createOrder } from '../../lib/api';
import type { Product } from '../../lib/mock-data';
import { toast } from 'sonner';
import { cn } from '../../components/ui/utils';
import { Badge } from '../../components/ui/badge';
import { ScrollArea } from '../../components/ui/scroll-area';

interface Invoice {
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  items: CartItem[];
  subtotal: number;
  total: number;
  paymentMethod: string;
  createdAt: Date;
}

export function POSHomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [posCart, setPosCart] = useState<CartItem[]>([]);
  const [customerInfo, setCustomerInfo] = useState({ name: '', phone: '' });
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'transfer'>('cash');
  const [showInvoice, setShowInvoice] = useState(false);
  const [currentInvoice, setCurrentInvoice] = useState<Invoice | null>(null);
  const [amountPaid, setAmountPaid] = useState('');
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const invoiceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getProducts().then(data => setAllProducts(data.map(mapApiProduct))).catch(() => {});
  }, []);

  const filteredProducts = allProducts.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddToCart = (product: Product) => {
    const defaultVariant = product.variants[0];
    if (!defaultVariant || defaultVariant.stock === 0) {
      toast.error('Sản phẩm hết hàng');
      return;
    }

    const existingItem = posCart.find(item => item.variantId === defaultVariant.id);
    if (existingItem) {
      if (existingItem.quantity >= defaultVariant.stock) {
        toast.error('Không đủ hàng trong kho');
        return;
      }
      setPosCart(posCart.map(item =>
        item.variantId === defaultVariant.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setPosCart([...posCart, {
        variantId: defaultVariant.id,
        productId: product.id,
        productName: product.name,
        variantLabel: `${defaultVariant.size} / ${defaultVariant.color}`,
        quantity: 1,
        price: product.salePrice || product.basePrice,
        image: product.images[0],
        stock: defaultVariant.stock,
      }]);
    }
    toast.success('Đã thêm vào giỏ hàng');
  };

  const handleUpdateQuantity = (variantId: string, change: number) => {
    setPosCart(posCart.map(item => {
      if (item.variantId === variantId) {
        const newQuantity = item.quantity + change;
        if (newQuantity < 1) return item;
        if (newQuantity > item.stock) {
          toast.error('Không đủ hàng trong kho');
          return item;
        }
        return { ...item, quantity: newQuantity };
      }
      return item;
    }));
  };

  const handleRemoveItem = (variantId: string) => {
    setPosCart(posCart.filter(item => item.variantId !== variantId));
    toast.success('Đã xóa khỏi giỏ hàng');
  };

  const subtotal = posCart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = subtotal;
  const changeMoney = amountPaid ? parseFloat(amountPaid) - total : 0;

  const handleCheckout = async () => {
    if (posCart.length === 0) { toast.error('Giỏ hàng trống'); return; }
    if (!customerInfo.name || !customerInfo.phone) { toast.error('Vui lòng nhập thông tin khách hàng'); return; }
    if (paymentMethod === 'cash' && (!amountPaid || parseFloat(amountPaid) < total)) { toast.error('Số tiền nhận không đủ'); return; }
    try {
      const apiOrder = await createOrder({
        type: 'pos',
        customerName: customerInfo.name,
        customerPhone: customerInfo.phone,
        paymentMethod,
        items: posCart.map(i => ({ variantId: i.variantId, quantity: i.quantity, price: i.price })),
      });
      const invoice: Invoice = {
        orderNumber: apiOrder.orderNumber,
        customerName: customerInfo.name,
        customerPhone: customerInfo.phone,
        items: [...posCart],
        subtotal,
        total,
        paymentMethod: paymentMethod === 'cash' ? 'Tiền mặt' : paymentMethod === 'card' ? 'Thẻ' : 'Chuyển khoản',
        createdAt: new Date(),
      };
      setCurrentInvoice(invoice);
      setShowInvoice(true);
      toast.success('Thanh toán thành công!');
    } catch (e: any) { toast.error(e.message); return; }
  };

  const handlePrintInvoice = () => {
    const printContent = invoiceRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Hóa đơn ${currentInvoice?.orderNumber}</title>
          <style>
            body { font-family: 'Inter', system-ui, sans-serif; padding: 20px; }
            .invoice { max-width: 400px; margin: 0 auto; }
            .header { text-align: center; margin-bottom: 20px; border-bottom: 2px dashed #ddd; padding-bottom: 15px; }
            .header h2 { font-size: 24px; margin: 0 0 5px; letter-spacing: 2px; }
            .info { margin-bottom: 15px; font-size: 13px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 15px; font-size: 13px; }
            th, td { padding: 8px 4px; text-align: left; }
            th { border-bottom: 1px solid #ddd; font-weight: 600; }
            td { border-bottom: 1px dashed #eee; }
            .total { font-size: 16px; font-weight: bold; text-align: right; padding-top: 10px; border-top: 2px dashed #ddd; }
            .footer { margin-top: 20px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const handleNewOrder = () => {
    setPosCart([]);
    setCustomerInfo({ name: '', phone: '' });
    setAmountPaid('');
    setPaymentMethod('cash');
    setShowInvoice(false);
    setCurrentInvoice(null);
  };

  const paymentMethods = [
    { value: 'cash', label: 'Tiền mặt', icon: Banknote },
    { value: 'card', label: 'Thẻ', icon: CreditCard },
    { value: 'transfer', label: 'Chuyển khoản', icon: Building2 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Bán hàng</h1>
        <p className="text-muted-foreground mt-1">Tạo đơn hàng tại quầy</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product Selection */}
        <div className="lg:col-span-2 space-y-4">
          {/* Search */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm sản phẩm theo tên hoặc mã..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-muted/50 border-0 h-11"
                />
              </div>
            </CardContent>
          </Card>

          {/* Products Grid */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Sản phẩm</CardTitle>
              <CardDescription>{filteredProducts.length} sản phẩm</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[calc(100vh-350px)] pr-4">
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                  {filteredProducts.map((product) => {
                    const totalStock = product.variants.reduce((sum, v) => sum + v.stock, 0);
                    const isOutOfStock = totalStock === 0;
                    return (
                      <button
                        key={product.id}
                        onClick={() => handleAddToCart(product)}
                        disabled={isOutOfStock}
                        className={cn(
                          "text-left rounded-xl border border-border p-3 transition-all duration-200",
                          "hover:shadow-md hover:border-primary/50 hover:-translate-y-0.5",
                          "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:hover:translate-y-0",
                          "focus:outline-none focus:ring-2 focus:ring-primary/20"
                        )}
                      >
                        <div className="aspect-square overflow-hidden rounded-lg mb-2 relative bg-muted">
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                          {isOutOfStock && (
                            <div className="absolute inset-0 bg-foreground/60 flex items-center justify-center">
                              <span className="text-xs text-background font-medium">Hết hàng</span>
                            </div>
                          )}
                        </div>
                        <p className="font-medium text-sm line-clamp-2 mb-1 leading-tight">{product.name}</p>
                        <p className="text-sm font-bold text-primary">
                          {(product.salePrice || product.basePrice).toLocaleString('vi-VN')}đ
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">Còn: {totalStock}</p>
                      </button>
                    );
                  })}
                </div>
                {filteredProducts.length === 0 && (
                  <div className="text-center py-12">
                    <Package className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                    <p className="text-muted-foreground">Không tìm thấy sản phẩm</p>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Cart & Checkout */}
        <div className="space-y-4">
          {/* Customer Info */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <CardTitle className="text-base font-semibold">Khách hàng</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label htmlFor="customerName" className="text-xs font-medium text-muted-foreground">Tên khách hàng *</Label>
                <Input
                  id="customerName"
                  value={customerInfo.name}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                  placeholder="Nhập tên khách hàng"
                  className="mt-1.5 bg-muted/50 border-0"
                />
              </div>
              <div>
                <Label htmlFor="customerPhone" className="text-xs font-medium text-muted-foreground">Số điện thoại *</Label>
                <Input
                  id="customerPhone"
                  type="tel"
                  value={customerInfo.phone}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                  placeholder="0901234567"
                  className="mt-1.5 bg-muted/50 border-0"
                />
              </div>
            </CardContent>
          </Card>

          {/* Cart */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <ShoppingCart className="h-4 w-4 text-primary" />
                  </div>
                  <CardTitle className="text-base font-semibold">Giỏ hàng</CardTitle>
                  {posCart.length > 0 && (
                    <Badge variant="secondary" className="ml-1">{posCart.length}</Badge>
                  )}
                </div>
                {posCart.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setPosCart([]);
                      toast.success('Đã xóa toàn bộ giỏ hàng');
                    }}
                    className="text-destructive hover:text-destructive h-8 px-2"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[200px] pr-2">
                {posCart.length > 0 ? (
                  <div className="space-y-3">
                    {posCart.map((item) => (
                      <div key={item.variantId} className="flex gap-3 p-2 rounded-lg bg-muted/50">
                        <img
                          src={item.image}
                          alt={item.productName}
                          className="w-14 h-14 object-cover rounded-lg"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm line-clamp-1">{item.productName}</p>
                          <p className="text-xs text-muted-foreground">{item.variantLabel}</p>
                          <p className="text-sm font-semibold text-primary">{item.price.toLocaleString('vi-VN')}đ</p>
                          
                          <div className="flex items-center gap-2 mt-1.5">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => handleUpdateQuantity(item.variantId, -1)}
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => handleUpdateQuantity(item.variantId, 1)}
                              disabled={item.quantity >= item.stock}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 ml-auto text-destructive hover:text-destructive"
                              onClick={() => handleRemoveItem(item.variantId)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <ShoppingCart className="h-10 w-10 mx-auto mb-2 opacity-20" />
                    <p className="text-sm">Giỏ hàng trống</p>
                  </div>
                )}
              </ScrollArea>

              {/* Payment Method */}
              {posCart.length > 0 && (
                <div className="mt-4 pt-4 border-t space-y-4">
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground mb-2 block">Phương thức thanh toán</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {paymentMethods.map((method) => {
                        const Icon = method.icon;
                        const isSelected = paymentMethod === method.value;
                        return (
                          <button
                            key={method.value}
                            onClick={() => setPaymentMethod(method.value as any)}
                            className={cn(
                              "flex flex-col items-center gap-1 p-3 rounded-lg border transition-all",
                              isSelected 
                                ? "border-primary bg-primary/10 text-primary" 
                                : "border-border hover:border-primary/50"
                            )}
                          >
                            <Icon className="h-5 w-5" />
                            <span className="text-xs font-medium">{method.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Cash Payment Input */}
                  {paymentMethod === 'cash' && (
                    <div>
                      <Label htmlFor="amountPaid" className="text-xs font-medium text-muted-foreground">Tiền khách đưa *</Label>
                      <Input
                        id="amountPaid"
                        type="number"
                        value={amountPaid}
                        onChange={(e) => setAmountPaid(e.target.value)}
                        placeholder="0"
                        className="mt-1.5 text-right text-lg font-semibold bg-muted/50 border-0"
                      />
                      {amountPaid && parseFloat(amountPaid) >= total && (
                        <p className="text-sm text-success mt-2 font-medium">
                          Tiền thối: {changeMoney.toLocaleString('vi-VN')}đ
                        </p>
                      )}
                    </div>
                  )}

                  {/* Total */}
                  <div className="space-y-2 pt-4 border-t">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tạm tính:</span>
                      <span>{subtotal.toLocaleString('vi-VN')}đ</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold">
                      <span>Tổng cộng:</span>
                      <span className="text-primary">{total.toLocaleString('vi-VN')}đ</span>
                    </div>
                  </div>

                  {/* Checkout Button */}
                  <Button
                    className="w-full h-12 text-base font-semibold"
                    onClick={handleCheckout}
                    disabled={posCart.length === 0}
                  >
                    <Receipt className="h-5 w-5 mr-2" />
                    Thanh toán
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Invoice Dialog */}
      <Dialog open={showInvoice} onOpenChange={setShowInvoice}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">Thanh toán thành công</DialogTitle>
            <DialogDescription className="text-center">
              Đơn hàng đã được tạo thành công
            </DialogDescription>
          </DialogHeader>

          <div ref={invoiceRef} className="invoice">
            {currentInvoice && (
              <div className="space-y-4">
                <div className="text-center pb-4 border-b border-dashed">
                  <h2 className="text-2xl font-bold tracking-widest">LEON</h2>
                  <p className="text-xs text-muted-foreground mt-1">123 Nguyễn Huệ, Q1, TP.HCM</p>
                  <p className="text-xs text-muted-foreground">Hotline: 1900 xxxx</p>
                </div>

                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Mã đơn:</span>
                    <span className="font-medium">{currentInvoice.orderNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Ngày:</span>
                    <span>{currentInvoice.createdAt.toLocaleString('vi-VN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Khách hàng:</span>
                    <span>{currentInvoice.customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">SĐT:</span>
                    <span>{currentInvoice.customerPhone}</span>
                  </div>
                </div>

                <div className="border-t border-dashed pt-4">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 font-medium">Sản phẩm</th>
                        <th className="text-center py-2 font-medium">SL</th>
                        <th className="text-right py-2 font-medium">Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentInvoice.items.map((item, index) => (
                        <tr key={index} className="border-b border-dashed">
                          <td className="py-2">
                            <div className="font-medium">{item.productName}</div>
                            <div className="text-xs text-muted-foreground">{item.variantLabel}</div>
                          </td>
                          <td className="text-center">{item.quantity}</td>
                          <td className="text-right font-medium">{(item.price * item.quantity).toLocaleString('vi-VN')}đ</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="space-y-2 pt-4 border-t border-dashed">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tạm tính:</span>
                    <span>{currentInvoice.subtotal.toLocaleString('vi-VN')}đ</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold">
                    <span>Tổng cộng:</span>
                    <span className="text-primary">{currentInvoice.total.toLocaleString('vi-VN')}đ</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Thanh toán:</span>
                    <span className="font-medium">{currentInvoice.paymentMethod}</span>
                  </div>
                  {paymentMethod === 'cash' && amountPaid && (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Tiền nhận:</span>
                        <span>{parseFloat(amountPaid).toLocaleString('vi-VN')}đ</span>
                      </div>
                      <div className="flex justify-between text-sm text-success font-medium">
                        <span>Tiền thối:</span>
                        <span>{changeMoney.toLocaleString('vi-VN')}đ</span>
                      </div>
                    </>
                  )}
                </div>

                <div className="text-center text-xs text-muted-foreground pt-4 border-t border-dashed">
                  <p>Cảm ơn quý khách đã mua hàng!</p>
                  <p className="mt-1">LEON - All rights reserved</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3 mt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={handlePrintInvoice}
            >
              <Printer className="h-4 w-4 mr-2" />
              In hóa đơn
            </Button>
            <Button
              className="flex-1"
              onClick={handleNewOrder}
            >
              Đơn hàng mới
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
