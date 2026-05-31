import { Link, Navigate } from 'react-router';
import { ShoppingBag } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { StatusBadge } from '../../components/StatusBadge';
import { cancelOrder, getOrders, ApiOrder } from '../../lib/api';
import { useState, useEffect } from 'react';
import { useAuth } from '../../lib/auth';
import { toast } from 'sonner';

export function OrdersListPage() {
  const { user, isAuthenticated } = useAuth();
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    getOrders({ userId: user.id }).then(data => { setOrders(data); setLoading(false); }).catch(() => setLoading(false));
  }, [user?.id]);

  if (!isAuthenticated) return <Navigate to="/login?redirect=/orders" replace />;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-6 lg:px-8 py-10 lg:py-14">
        <div className="mb-10">
          <h1 className="text-3xl lg:text-4xl font-bold text-foreground tracking-tight">Đơn hàng</h1>
          <p className="mt-2 text-muted-foreground">Theo dõi trạng thái các đơn hàng của bạn</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Đang tải...</p>
            </div>
          </div>
        ) : orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.orderId}
                className="bg-card rounded-2xl border border-border p-5"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="font-semibold text-lg text-foreground">{order.orderNumber}</p>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {new Date(order.createdAt || order.orderDate || '').toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <StatusBadge status={(order.orderStatus || order.status || '') as any} type="order" />
                    <StatusBadge
                      status={(order.paymentStatus ?? 'unpaid') as any}
                      type="payment"
                    />
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  {(order.items || []).map((item, idx) => (
                    <div key={item.orderItemId || idx} className="flex gap-4">
                      <img
                        src={item.image || item.thumbnail || 'https://placehold.co/64x64?text=?'}
                        alt={item.productName}
                        className="w-16 h-16 object-cover rounded-xl"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground">{item.productName}</p>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {item.variantLabel || `${item.sizeName || ''} / ${item.colorName || ''}`} x {item.quantity}
                        </p>
                      </div>
                      <p className="font-semibold text-foreground">
                        {(item.price * item.quantity).toLocaleString('vi-VN')}đ
                      </p>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <p className="text-lg font-semibold text-foreground">
                    Tổng: {(order.totalAmount || order.total || 0).toLocaleString('vi-VN')}đ
                  </p>
                  <div className="flex items-center gap-2">
                    {((order.orderStatus || order.status || '').toLowerCase() === 'pending') && (
                      <Button
                        variant="destructive"
                        className="rounded-lg"
                        disabled={cancellingOrderId === order.orderId}
                        onClick={async () => {
                          if (!confirm('Bạn muốn hủy đơn hàng này?')) return;
                          setCancellingOrderId(order.orderId);
                          try {
                            await cancelOrder(order.orderId);
                            setOrders(prev => prev.map(o => o.orderId === order.orderId ? { ...o, orderStatus: 'cancelled', status: 'cancelled' } : o));
                            toast.success('Đã hủy đơn hàng');
                          } catch (e: any) {
                            toast.error(e.message || 'Hủy đơn hàng thất bại');
                          } finally {
                            setCancellingOrderId(null);
                          }
                        }}
                      >
                        {cancellingOrderId === order.orderId ? 'Đang hủy...' : 'Hủy'}
                      </Button>
                    )}
                    <Link to={`/orders/${order.orderId}`}>
                      <Button variant="outline" className="rounded-lg">Xem chi tiết</Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-card rounded-2xl border border-border p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Chưa có đơn hàng</h3>
            <p className="text-muted-foreground mb-6">Bạn chưa đặt đơn hàng nào</p>
            <Link to="/shop">
              <Button className="rounded-xl">Mua sắm ngay</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
