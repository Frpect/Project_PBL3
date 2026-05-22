import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Button } from '../../components/ui/button';
import { StatusBadge } from '../../components/StatusBadge';
import { getOrderById, updateOrderStatus, ApiOrder } from '../../lib/api';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { toast } from 'sonner';

export function AdminOrderDetailPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<ApiOrder | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) return;
    getOrderById(orderId)
      .then(setOrder)
      .catch(() => setOrder(null))
      .finally(() => setLoading(false));
  }, [orderId]);

  const handleUpdateStatus = async (newStatus: string) => {
    if (!order) return;
    try {
      await updateOrderStatus(order.orderId, newStatus);
      setOrder(prev => prev ? { ...prev, orderStatus: newStatus } : prev);
      toast.success('Cập nhật trạng thái thành công');
    } catch (e: any) { toast.error(e.message); }
  };

  if (loading) return <div className="p-6">Đang tải...</div>;
  if (!order) return <div className="p-6">Đơn hàng không tồn tại</div>;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{order.orderNumber ?? order.orderId}</h1>
          <p className="text-text-secondary">Chi tiết đơn hàng</p>
        </div>
        <Button variant="outline" onClick={() => navigate('/admin/orders')}>Quay lại</Button>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-border p-6">
          <h2 className="font-semibold mb-4">Thông tin đơn hàng</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-text-secondary">Khách hàng:</span>
              <span className="font-medium">{order.customerName || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">SĐT:</span>
              <span>{order.customerPhone || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Ngày đặt:</span>
              <span>{order.createdAt || order.orderDate ? new Date(order.createdAt || order.orderDate || '').toLocaleDateString('vi-VN') : '—'}</span>
            </div>
            {(order.recipientName || order.shippingAddress) && (
              <div className="pt-2 border-t border-border">
                <p className="text-text-secondary text-xs mb-1">Địa chỉ nhận hàng:</p>
                {order.recipientName && <p className="font-medium">{order.recipientName} {order.recipientPhone ? `— ${order.recipientPhone}` : ''}</p>}
                {order.shippingAddress && <p className="text-text-secondary text-xs mt-0.5">{typeof order.shippingAddress === 'string' ? order.shippingAddress : ''}</p>}
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-text-secondary">Phương thức TT:</span>
              <span>{order.paymentMethod === 'online' ? 'Online' : 'COD'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Trạng thái TT:</span>
              <span>{order.paymentStatus || '—'}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-border p-6">
          <h2 className="font-semibold mb-4">Cập nhật trạng thái</h2>
          <Select value={order.orderStatus ?? order.status} onValueChange={handleUpdateStatus}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Đã đặt</SelectItem>
              <SelectItem value="confirmed">Đã xác nhận</SelectItem>
              <SelectItem value="shipping">Đang giao</SelectItem>
              <SelectItem value="completed">Hoàn thành</SelectItem>
              <SelectItem value="cancelled">Hủy</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-border p-6">
        <h2 className="font-semibold mb-4">Sản phẩm</h2>
        <div className="space-y-4">
          {(order.items ?? []).map((item, idx) => (
            <div key={item.orderItemId ?? idx} className="flex gap-4 pb-4 border-b last:border-0">
              <img src={item.image} alt={item.productName} className="w-16 h-16 object-cover rounded" />
              <div className="flex-1">
                <p className="font-medium">{item.productName}</p>
                <p className="text-sm text-text-secondary">{item.variantLabel} x {item.quantity}</p>
              </div>
              <p className="font-semibold">{(item.price * item.quantity).toLocaleString('vi-VN')}đ</p>
            </div>
          ))}
        </div>
        <div className="pt-4 mt-4 border-t">
          <div className="flex justify-between text-lg font-bold">
            <span>Tổng cộng:</span>
            <span className="text-accent">{(order.total ?? order.totalAmount ?? 0).toLocaleString('vi-VN')}đ</span>
          </div>
        </div>
      </div>
    </div>
  );
}
