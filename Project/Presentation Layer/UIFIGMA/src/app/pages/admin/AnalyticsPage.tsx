import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { getDashboardSummary, getAdminOrders, getInventory, ApiOrder, ApiInventoryItem, DashboardSummary } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { DollarSign, ShoppingCart, Package, TrendingUp, Download, AlertTriangle, ArrowUpRight, ArrowDownRight, Users, Eye } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { toast } from 'sonner';
import { StatusBadge } from '../../components/StatusBadge';

type TimeRange = 'day' | 'week' | 'month' | 'year';

export function AnalyticsPage() {
  const navigate = useNavigate();
  const { isStaffOnly } = useAuth();
  const [timeRange, setTimeRange] = useState<TimeRange>('month');
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [recentOrders, setRecentOrders] = useState<ApiOrder[]>([]);
  const [allOrders, setAllOrders] = useState<ApiOrder[]>([]);
  const [revenueData, setRevenueData] = useState<{ date: string; revenue: number; orders: number }[]>([]);
  const [revenueChange, setRevenueChange] = useState<{ pct: string; type: 'up' | 'down' }>({ pct: '—', type: 'up' });
  const [ordersChange, setOrdersChange] = useState<{ pct: string; type: 'up' | 'down' }>({ pct: '—', type: 'up' });
  const [lowStockItems, setLowStockItems] = useState<ApiInventoryItem[]>([]);

  useEffect(() => {
    getDashboardSummary(timeRange).then(setSummary).catch(() => {});
    getAdminOrders().then((data: ApiOrder[]) => {
      setAllOrders(data);
      setRecentOrders(data.slice(0, 5));
      const now = new Date();
      const calcChange = (cur: number, prev: number) => {
        if (prev === 0) return cur > 0 ? { pct: '+' + cur.toFixed(0), type: 'up' as const } : { pct: '—', type: 'up' as const };
        const p = ((cur - prev) / prev) * 100;
        return { pct: (p >= 0 ? '+' : '') + p.toFixed(1) + '%', type: p >= 0 ? 'up' as const : 'down' as const };
      };

      // Determine current and previous period boundaries
      let curFrom: Date, curTo: Date, prevFrom: Date, prevTo: Date;
      if (timeRange === 'day') {
        curFrom = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        curTo = new Date(curFrom.getTime() + 86400000);
        prevFrom = new Date(curFrom.getTime() - 86400000);
        prevTo = curFrom;
      } else if (timeRange === 'week') {
        const dayOfWeek = now.getDay();
        curFrom = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek);
        curTo = new Date(curFrom.getTime() + 7 * 86400000);
        prevFrom = new Date(curFrom.getTime() - 7 * 86400000);
        prevTo = curFrom;
      } else if (timeRange === 'year') {
        curFrom = new Date(now.getFullYear(), 0, 1);
        curTo = new Date(now.getFullYear() + 1, 0, 1);
        prevFrom = new Date(now.getFullYear() - 1, 0, 1);
        prevTo = curFrom;
      } else {
        // month (default)
        curFrom = new Date(now.getFullYear(), now.getMonth(), 1);
        curTo = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        prevFrom = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        prevTo = curFrom;
      }

      let curRev = 0, curOrd = 0, prevRev = 0, prevOrd = 0;
      data.forEach(o => {
        const d = new Date(o.createdAt || o.orderDate || '');
        const isCancelled = (o.orderStatus || o.status) === 'cancelled';
        const amt = isCancelled ? 0 : (o.totalAmount || o.total || 0);
        if (d >= curFrom && d < curTo) { curRev += amt; curOrd++; }
        else if (d >= prevFrom && d < prevTo) { prevRev += amt; prevOrd++; }
      });
      setRevenueChange(calcChange(curRev, prevRev));
      setOrdersChange(calcChange(curOrd, prevOrd));

      // Build chart data for current period
      if (timeRange === 'day') {
        const hourly: Record<number, { revenue: number; orders: number }> = {};
        for (let h = 0; h < 24; h++) hourly[h] = { revenue: 0, orders: 0 };
        data.forEach(o => {
          const d = new Date(o.createdAt || o.orderDate || '');
          const isCancelled = (o.orderStatus || o.status) === 'cancelled';
          const rev = isCancelled ? 0 : (o.totalAmount || o.total || 0);
          if (d >= curFrom && d < curTo) {
            hourly[d.getHours()].revenue += rev;
            hourly[d.getHours()].orders += 1;
          }
        });
        setRevenueData(Object.entries(hourly).map(([h, v]) => ({ date: `${h}h`, revenue: v.revenue, orders: v.orders })));
      } else if (timeRange === 'week') {
        const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
        const weekly: Record<number, { revenue: number; orders: number }> = {};
        for (let d = 0; d < 7; d++) weekly[d] = { revenue: 0, orders: 0 };
        data.forEach(o => {
          const d = new Date(o.createdAt || o.orderDate || '');
          const isCancelled2 = (o.orderStatus || o.status) === 'cancelled';
          const rev = isCancelled2 ? 0 : (o.totalAmount || o.total || 0);
          if (d >= curFrom && d < curTo) {
            weekly[d.getDay()].revenue += rev;
            weekly[d.getDay()].orders += 1;
          }
        });
        setRevenueData(Object.entries(weekly).map(([dow, v]) => ({ date: days[Number(dow)], revenue: v.revenue, orders: v.orders })));
      } else if (timeRange === 'year') {
        const months = ['T1','T2','T3','T4','T5','T6','T7','T8','T9','T10','T11','T12'];
        const monthly: Record<number, { revenue: number; orders: number }> = {};
        for (let m = 0; m < 12; m++) monthly[m] = { revenue: 0, orders: 0 };
        data.forEach(o => {
          const d = new Date(o.createdAt || o.orderDate || '');
          const isCancelled3 = (o.orderStatus || o.status) === 'cancelled';
          const rev = isCancelled3 ? 0 : (o.totalAmount || o.total || 0);
          if (d >= curFrom && d < curTo) {
            monthly[d.getMonth()].revenue += rev;
            monthly[d.getMonth()].orders += 1;
          }
        });
        setRevenueData(Object.entries(monthly).map(([m, v]) => ({ date: months[Number(m)], revenue: v.revenue, orders: v.orders })));
      } else {
        // month
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        const daily: Record<number, { revenue: number; orders: number }> = {};
        for (let d = 1; d <= daysInMonth; d++) daily[d] = { revenue: 0, orders: 0 };
        data.forEach(o => {
          const d = new Date(o.createdAt || o.orderDate || '');
          const isCancelled4 = (o.orderStatus || o.status) === 'cancelled';
          const rev = isCancelled4 ? 0 : (o.totalAmount || o.total || 0);
          if (d >= curFrom && d < curTo) {
            daily[d.getDate()].revenue += rev;
            daily[d.getDate()].orders += 1;
          }
        });
        setRevenueData(Object.entries(daily).map(([day, v]) => ({
          date: `${String(day).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}`,
          revenue: v.revenue,
          orders: v.orders,
        })));
      }
    }).catch(() => {});
    getInventory().then((data: ApiInventoryItem[]) => setLowStockItems(data.filter(i => (i.stock ?? 0) < 10).slice(0, 5))).catch(() => {});
  }, [timeRange]);

  const totalRevenue = summary?.totalRevenue ?? 0;
  const totalOrders = summary?.totalOrders ?? 0;
  const totalProducts = summary?.totalProducts ?? 0;
  const lowStockCount = lowStockItems.length;


  const topProducts = recentOrders
    .flatMap(o => o.items || [])
    .reduce<Record<string, { name: string; sold: number }>>((acc, item) => {
      if (!acc[item.productName]) acc[item.productName] = { name: item.productName, sold: 0 };
      acc[item.productName].sold += item.quantity;
      return acc;
    }, {});
  const topProductsData = Object.values(topProducts).sort((a, b) => b.sold - a.sold).slice(0, 5);

  const handleExport = (format: 'pdf' | 'excel') => {
    toast.success(`Đang xuất báo cáo ${format.toUpperCase()}...`);
  };

  const prevPeriodLabel = timeRange === 'day' ? 'hôm qua' : timeRange === 'week' ? 'tuần trước' : timeRange === 'year' ? 'năm trước' : 'tháng trước';

  const StatCard = ({ 
    title, 
    value, 
    change, 
    changeType, 
    icon: Icon, 
    iconBg 
  }: { 
    title: string; 
    value: string; 
    change: string; 
    changeType: 'up' | 'down'; 
    icon: any; 
    iconBg: string;
  }) => (
    <Card className="card-hover border-0 shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold tracking-tight">{value}</p>
            <div className={`flex items-center gap-1 text-xs font-medium ${
              changeType === 'up' ? 'text-success' : 'text-destructive'
            }`}>
              {changeType === 'up' ? (
                <ArrowUpRight className="h-3 w-3" />
              ) : (
                <ArrowDownRight className="h-3 w-3" />
              )}
              <span>{change}</span>
              <span className="text-muted-foreground font-normal">so với {prevPeriodLabel}</span>
            </div>
          </div>
          <div className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (isStaffOnly) {
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const todayOrders = allOrders.filter(o => new Date(o.createdAt || o.orderDate || '') >= todayStart);
    const pendingCount = allOrders.filter(o => (o.orderStatus || o.status) === 'pending').length;
    const completedToday = todayOrders.filter(o => (o.orderStatus || o.status) === 'completed').length;

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tổng quan</h1>
          <p className="text-muted-foreground mt-1">Thông tin vận hành hôm nay</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Đơn hôm nay</p>
                  <p className="text-3xl font-bold mt-1">{todayOrders.length}</p>
                </div>
                <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
                  <ShoppingCart className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Cần xử lý</p>
                  <p className="text-3xl font-bold mt-1 text-yellow-600">{pendingCount}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Sắp hết hàng</p>
                  <p className="text-3xl font-bold mt-1 text-destructive">{lowStockItems.length}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-destructive/20 flex items-center justify-center">
                  <Package className="h-6 w-6 text-destructive" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Hoàn thành hôm nay</p>
                  <p className="text-3xl font-bold mt-1 text-green-600">{completedToday}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-green-500 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        {/* Recent orders for staff */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">Đơn hàng mới nhất</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate('/admin/orders')}>Xem tất cả</Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {allOrders.slice(0, 8).map((order: ApiOrder) => (
              <div key={order.orderId} className="flex items-center justify-between p-3 rounded-xl bg-muted/50 hover:bg-muted cursor-pointer transition-colors" onClick={() => navigate(`/admin/orders/${order.orderId}`)}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <ShoppingCart className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{order.orderNumber || `ORD-${String(order.orderId).padStart(4, '0')}`}</p>
                    <p className="text-xs text-muted-foreground">{order.customerName || 'Khách lẻ'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={(order.orderStatus || order.status || 'pending') as any} type="order" />
                  <span className="text-sm font-semibold">{(order.totalAmount || order.total || 0).toLocaleString('vi-VN')}đ</span>
                </div>
              </div>
            ))}
            {allOrders.length === 0 && <p className="text-sm text-center text-muted-foreground py-6">Chưa có đơn hàng</p>}
          </CardContent>
        </Card>
        {lowStockItems.length > 0 && (
          <Card className="border-0 shadow-sm border-l-4 border-l-destructive">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold text-destructive">Sản phẩm sắp hết hàng</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => navigate('/admin/inventory')}>Xem kho</Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {lowStockItems.map(item => (
                <div key={item.variantId || item.productId} className="flex items-center justify-between p-2 rounded-lg bg-destructive/5">
                  <span className="text-sm font-medium">{item.productName}</span>
                  <span className="text-sm font-bold text-destructive">{item.stock ?? 0} còn lại</span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tổng quan</h1>
          <p className="text-muted-foreground mt-1">Theo dõi hiệu suất kinh doanh của bạn</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={(value: TimeRange) => setTimeRange(value)}>
            <SelectTrigger className="w-36 bg-card">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Hôm nay</SelectItem>
              <SelectItem value="week">Tuần này</SelectItem>
              <SelectItem value="month">Tháng này</SelectItem>
              <SelectItem value="year">Năm nay</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={() => handleExport('pdf')}>
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Tổng doanh thu"
          value={`${(totalRevenue / 1000000).toFixed(1)}M ₫`}
          change={revenueChange.pct}
          changeType={revenueChange.type}
          icon={DollarSign}
          iconBg="gradient-success"
        />
        <StatCard
          title="Đơn hàng"
          value={totalOrders.toString()}
          change={ordersChange.pct}
          changeType={ordersChange.type}
          icon={ShoppingCart}
          iconBg="gradient-primary"
        />
        <StatCard
          title="Sản phẩm"
          value={totalProducts.toString()}
          change="+3"
          changeType="up"
          icon={Package}
          iconBg="gradient-info"
        />
        <StatCard
          title="Cần nhập hàng"
          value={lowStockCount.toString()}
          change={lowStockCount > 0 ? "Cần xử lý" : "Ổn định"}
          changeType={lowStockCount > 0 ? "down" : "up"}
          icon={AlertTriangle}
          iconBg="gradient-warning"
        />
      </div>

      {/* Charts Row */}
      <div>
        {/* Revenue Chart */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">Doanh thu</CardTitle>
                <CardDescription>
                  {timeRange === 'day' ? 'Theo giờ trong ngày' : timeRange === 'week' ? 'Theo ngày trong tuần' : timeRange === 'year' ? 'Theo tháng trong năm' : 'Theo ngày trong tháng'}
                </CardDescription>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-primary" />
                  <span className="text-muted-foreground">Doanh thu</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                  tickFormatter={(value) => {
                    const maxVal = Math.max(...revenueData.map(d => d.revenue), 1);
                    if (maxVal >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
                    if (maxVal >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
                    return value.toLocaleString('vi-VN');
                  }}
                />
                <Tooltip 
                  formatter={(value: number) => [`${value.toLocaleString('vi-VN')} ₫`, 'Doanh thu']}
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="var(--primary)" 
                  strokeWidth={2}
                  fill="url(#colorRevenue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Orders */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">Đơn hàng mới</CardTitle>
                <CardDescription>5 đơn hàng gần nhất</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate('/admin/orders')}>
                Xem tất cả
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentOrders.length > 0 ? (
              recentOrders.map((order) => (
                <div
                  key={order.orderId}
                  className="flex items-center justify-between p-3 rounded-xl bg-muted/50 hover:bg-muted cursor-pointer transition-colors"
                  onClick={() => navigate(`/admin/orders/${order.orderId}`)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <ShoppingCart className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">
                        {order.orderNumber || `ORD-${String(order.orderId).padStart(4, '0')}`}
                      </p>
                      <p className="text-xs text-muted-foreground">{order.customerName || 'Khách lẻ'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm">{(order.totalAmount || order.total || 0).toLocaleString('vi-VN')}đ</p>
                    <StatusBadge status={(order.orderStatus || order.status || 'pending') as any} type="order" showDot={false} />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <ShoppingCart className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p>Chưa có đơn hàng nào</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">Bán chạy nhất</CardTitle>
                <CardDescription>Top sản phẩm theo doanh số</CardDescription>
              </div>
              <TrendingUp className="h-5 w-5 text-success" />
            </div>
          </CardHeader>
          <CardContent>
            {topProductsData.length > 0 ? (
              <div className="space-y-3">
                {topProductsData.map((product, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-sm font-bold text-muted-foreground">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{product.name}</p>
                      <div className="w-full bg-muted rounded-full h-1.5 mt-1">
                        <div 
                          className="bg-primary h-1.5 rounded-full transition-all"
                          style={{ width: `${(product.sold / topProductsData[0].sold) * 100}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-muted-foreground">
                      {product.sold} đã bán
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p>Chưa có dữ liệu</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alert */}
      {lowStockCount > 0 && (
        <Card className="border-0 shadow-sm border-l-4 border-l-warning">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              <CardTitle className="text-base font-semibold">Cảnh báo tồn kho</CardTitle>
            </div>
            <CardDescription>{lowStockCount} sản phẩm cần nhập thêm hàng</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {lowStockItems.map((item) => (
                <div
                  key={item.variantId}
                  className="flex items-center gap-3 p-3 rounded-xl bg-warning/5 border border-warning/20"
                >
                  <img
                    src={item.imageUrl || item.thumbnail || 'https://placehold.co/48x48?text=?'}
                    alt={item.productName}
                    className="w-12 h-12 object-cover rounded-lg"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.productName}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.sizeName || item.size} / {item.colorName || item.color}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-warning">{item.stock}</p>
                    <p className="text-xs text-muted-foreground">còn lại</p>
                  </div>
                </div>
              ))}
            </div>
            <Button 
              variant="outline" 
              className="w-full mt-4"
              onClick={() => navigate('/admin/inventory')}
            >
              Quản lý kho hàng
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
