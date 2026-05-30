import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import { Button } from '../../components/ui/button';
import { StatusBadge } from '../../components/StatusBadge';
import { getOrderById, ApiOrder } from '../../lib/api';
import { CheckCircle2, ArrowLeft } from 'lucide-react';

export function OrderDetailPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState<ApiOrder | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) return;
    getOrderById(orderId).then(setOrder).catch(() => setOrder(null)).finally(() => setLoading(false));
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-semibold text-foreground mb-4">Không tìm thấy đơn hàng</h2>
          <Link to="/orders">
            <Button className="rounded-xl">Về danh sách đơn hàng</Button>
          </Link>
        </div>
      </div>
    );
  }

  const statusSteps = ['pending', 'confirmed', 'shipping', 'completed'];
  const currentStepIndex = statusSteps.indexOf(order.orderStatus ?? order.status ?? '');

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-6 lg:px-8 py-10 lg:py-14">
        <div className="mb-10">
          <Link to="/orders" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Quay lại danh sách đơn hàng
          </Link>
          <h1 className="text-3xl lg:text-4xl font-bold text-foreground tracking-tight">Chi tiết đơn hàng</h1>
          <p className="mt-2 text-muted-foreground">{order.orderNumber}</p>
        </div>

        {/* Status Timeline */}
        <div className="bg-card rounded-2xl border border-border p-6 mb-6">
          <h2 className="font-semibold text-foreground mb-8">Trạng thái đơn hàng</h2>
          <div className="flex items-center justify-between relative">
            {/* Progress line */}
            <div className="absolute top-5 left-0 right-0 h-0.5 bg-border" />
            <div 
              className="absolute top-5 left-0 h-0.5 bg-emerald-500 transition-all"
              style={{ width: `${(currentStepIndex / (statusSteps.length - 1)) * 100}%` }}
            />
            
            {statusSteps.map((step, index) => {
              const isCompleted = index <= currentStepIndex;
              const labels = {
                pending: 'Đã đặt',
                confirmed: 'Đã xác nhận',
                shipping: 'Đang giao',
                completed: 'Hoàn thành',
              };

              return (
                <div key={step} className="flex flex-col items-center relative z-10">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                      isCompleted ? 'bg-emerald-500 text-white' : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="h-5 w-5" /> : <span className="text-sm font-medium">{index + 1}</span>}
                  </div>
                  <p className={`text-xs mt-3 font-medium ${isCompleted ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {labels[step as keyof typeof labels]}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Order Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-card rounded-2xl border border-border p-6">
            <h2 className="font-semibold text-foreground mb-4">Thông tin đơn hàng</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Mã đơn:</span>
                <span className="font-medium text-foreground">{order.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ngày đặt:</span>
                <span className="text-foreground">{order.createdAt ? new Date(order.createdAt).toLocaleDateString('vi-VN') : '-'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Thanh toán:</span>
                <StatusBadge status={(order.paymentStatus ?? 'unpaid') as 'paid' | 'unpaid'} type="payment" />
              </div>
            </div>
          </div>

          <div className="bg-card rounded-2xl border border-border p-6">
            <h2 className="font-semibold text-foreground mb-4">Địa chỉ nhận hàng</h2>
            {order.shippingAddress || order.recipientName ? (
              <div className="text-sm space-y-1.5">
                {order.recipientName && <p className="font-medium text-foreground">{order.recipientName}</p>}
                {order.recipientPhone && <p className="text-muted-foreground">{order.recipientPhone}</p>}
                {order.shippingAddress && <p className="text-muted-foreground">{typeof order.shippingAddress === 'string' ? order.shippingAddress : ''}</p>}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Không có thông tin địa chỉ</p>
            )}
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-card rounded-2xl border border-border p-6 mb-6">
          <h2 className="font-semibold text-foreground mb-5">Sản phẩm</h2>
          <div className="space-y-4">
            {(order.items ?? []).map((item, idx) => (
              <div key={item.orderItemId ?? idx} className="flex gap-4 pb-4 border-b border-border last:border-0 last:pb-0">
                <img
                  src={item.image}
                  alt={item.productName}
                  className="w-20 h-20 object-cover rounded-xl"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground">{item.productName}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">{item.variantLabel}</p>
                  <p className="text-sm text-muted-foreground">Số lượng: {item.quantity}</p>
                </div>
                <p className="font-semibold text-foreground">
                  {(item.price * item.quantity).toLocaleString('vi-VN')}đ
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <h2 className="font-semibold text-foreground mb-4">Tổng đơn hàng</h2>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tạm tính:</span>
              <span className="text-foreground">{(order.subtotal ?? order.totalAmount ?? 0).toLocaleString('vi-VN')}đ</span>
            </div>
            {(order.discount ?? 0) > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Giảm giá:</span>
                <span className="text-emerald-600">-{(order.discount ?? 0).toLocaleString('vi-VN')}đ</span>
              </div>
            )}
            <div className="flex justify-between pt-4 border-t border-border">
              <span className="font-semibold text-foreground">Tổng cộng:</span>
              <span className="font-bold text-xl text-foreground">
                {(order.total ?? order.totalAmount ?? 0).toLocaleString('vi-VN')}đ
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
