import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Search, ShoppingBag, Eye, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { StatusBadge } from '../../components/StatusBadge';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { getAdminOrders, ApiOrder } from '../../lib/api';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';

type PeriodFilter = 'all' | 'day' | 'week' | 'month';

export function OrdersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [allOrders, setAllOrders] = useState<ApiOrder[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getAdminOrders()
      .then(data => { setAllOrders(data); setLoading(false); })
      .catch(err => { setError(err?.message || 'Không thể tải danh sách đơn hàng'); setLoading(false); });
  }, []);

  const periodFrom = (() => {
    const now = new Date();
    if (periodFilter === 'day') return new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (periodFilter === 'week') { const d = now.getDay(); return new Date(now.getFullYear(), now.getMonth(), now.getDate() - d); }
    if (periodFilter === 'month') return new Date(now.getFullYear(), now.getMonth(), 1);
    return null;
  })();

  const periodOrders = periodFrom
    ? allOrders.filter(o => new Date(o.createdAt || o.orderDate || '') >= periodFrom)
    : allOrders;

  const filteredOrders = periodOrders.filter(order => {
    const matchesSearch =
      (order.orderNumber ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.customerName ?? '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || (order.orderStatus || order.status) === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingCount = periodOrders.filter(o => (o.orderStatus || o.status) === 'pending').length;
  const shippingCount = periodOrders.filter(o => (o.orderStatus || o.status) === 'shipping').length;
  const totalRevenue = periodOrders.filter(o => (o.orderStatus || o.status) === 'completed')
    .reduce((sum, o) => sum + (o.totalAmount || o.total || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Đơn hàng</h1>
        <p className="text-muted-foreground mt-1">Quản lý và theo dõi đơn hàng</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center">
                <ShoppingBag className="h-5 w-5 text-info" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingCount}</p>
                <p className="text-xs text-muted-foreground">Chờ xử lý</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <ShoppingBag className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{shippingCount}</p>
                <p className="text-xs text-muted-foreground">Đang giao</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                <ShoppingBag className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{(totalRevenue / 1000000).toFixed(1)}M</p>
                <p className="text-xs text-muted-foreground">Doanh thu</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Tìm theo mã đơn, tên khách hàng..." 
                className="pl-10 bg-muted/50 border-0"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={periodFilter} onValueChange={(v) => setPeriodFilter(v as PeriodFilter)}>
              <SelectTrigger className="w-full sm:w-36 bg-muted/50 border-0">
                <SelectValue placeholder="Kỳ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="day">Hôm nay</SelectItem>
                <SelectItem value="week">Tuần này</SelectItem>
                <SelectItem value="month">Tháng này</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40 bg-muted/50 border-0">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="pending">Chờ xử lý</SelectItem>
                <SelectItem value="confirmed">Đã xác nhận</SelectItem>
                <SelectItem value="shipping">Đang giao</SelectItem>
                <SelectItem value="completed">Hoàn thành</SelectItem>
                <SelectItem value="cancelled">Đã hủy</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Loading / Error */}
      {loading && (
        <div className="flex items-center justify-center py-16 text-muted-foreground gap-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Đang tải đơn hàng...</span>
        </div>
      )}
      {error && !loading && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="flex items-center gap-3 p-4">
            <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
            <div>
              <p className="font-medium text-destructive">Không thể tải đơn hàng</p>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
            <Button variant="outline" size="sm" className="ml-auto" onClick={() => { setLoading(true); setError(null); getAdminOrders().then(d => { setAllOrders(d); setLoading(false); }).catch(e => { setError(e?.message || 'Lỗi'); setLoading(false); }); }}>
              Thử lại
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Orders Table */}
      {!loading && !error && (
      <Card className="border-0 shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="font-semibold">Mã đơn</TableHead>
              <TableHead className="font-semibold">Phương thức TT</TableHead>
              <TableHead className="font-semibold">Khách hàng</TableHead>
              <TableHead className="font-semibold">Ngày đặt</TableHead>
              <TableHead className="font-semibold">Tổng tiền</TableHead>
              <TableHead className="font-semibold">Trạng thái</TableHead>
              <TableHead className="font-semibold">Thanh toán</TableHead>
              <TableHead className="font-semibold w-[80px]">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.map((order) => (
              <TableRow key={order.orderId} className="group">
                <TableCell>
                  <code className="text-sm font-medium bg-muted px-2 py-1 rounded">
                    {order.orderNumber || `ORD-${String(order.orderId).padStart(4, '0')}`}
                  </code>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize">
                    {order.paymentMethod === 'online' ? 'Online' : 'COD'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{order.customerName || 'Khách lẻ'}</p>
                    {order.customerPhone && (
                      <p className="text-xs text-muted-foreground">{order.customerPhone}</p>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(order.createdAt || order.orderDate || '').toLocaleDateString('vi-VN')}
                </TableCell>
                <TableCell>
                  <span className="font-semibold">
                    {(order.totalAmount || order.total || 0).toLocaleString('vi-VN')}đ
                  </span>
                </TableCell>
                <TableCell>
                  <StatusBadge status={(order.orderStatus || order.status || 'pending') as any} type="order" />
                </TableCell>
                <TableCell>
                  <StatusBadge status={(order.paymentStatus ?? 'unpaid') as any} type="payment" />
                </TableCell>
                <TableCell>
                  <Link to={`/admin/orders/${order.orderId}`}>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground">Không tìm thấy đơn hàng nào</p>
          </div>
        )}
      </Card>
      )}
    </div>
  );
}
