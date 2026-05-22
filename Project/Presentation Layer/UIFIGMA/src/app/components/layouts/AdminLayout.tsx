import { Outlet, Link, useLocation, Navigate } from 'react-router';
import { useState, useEffect, useRef } from 'react';
import { getAdminOrders, ApiOrder, getInventory, ApiInventoryItem } from '../../lib/api';
import {
  Package,
  ShoppingBag,
  Users,
  Tag,
  Archive,
  UserCog,
  BarChart3,
  Grid3x3,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  ChevronRight,
  Store,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { useAuth } from '../../lib/auth';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Badge } from '../ui/badge';

export function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [pendingOrders, setPendingOrders] = useState<ApiOrder[]>([]);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const location = useLocation();
  const { user, isAdmin, isStaffOnly, logout } = useAuth();

  useEffect(() => {
    if (!isAdmin) return;
    getAdminOrders()
      .then(orders => setPendingOrders(orders.filter(o => (o.orderStatus || o.status) === 'pending').slice(0, 5)))
      .catch(() => {});
    getInventory()
      .then(items => setLowStockCount(items.filter((i: ApiInventoryItem) => (i.stock ?? 0) < 5).length))
      .catch(() => {});
  }, [isAdmin]);

  if (!isAdmin && location.pathname !== '/admin/login') {
    return <Navigate to="/admin/login" replace />;
  }

  const allNavigation = [
    { name: 'Tổng quan', href: '/admin', icon: BarChart3, badge: null, staffAllowed: true },
    { name: 'Sản phẩm', href: '/admin/products', icon: Package, badge: null, staffAllowed: true },
    { name: 'Danh mục', href: '/admin/categories', icon: Grid3x3, badge: null, staffAllowed: false },
    { name: 'Đơn hàng', href: '/admin/orders', icon: ShoppingBag, badge: '5', staffAllowed: true },
    { name: 'Khách hàng', href: '/admin/customers', icon: Users, badge: null, staffAllowed: true },
    { name: 'Kho hàng', href: '/admin/inventory', icon: Archive, badge: '3', staffAllowed: true },
    { name: 'Khuyến mãi', href: '/admin/promotions', icon: Tag, badge: null, staffAllowed: false },
    { name: 'Nhân viên', href: '/admin/staff', icon: UserCog, badge: null, staffAllowed: false },
  ];
  const navigation = isStaffOnly ? allNavigation.filter(n => n.staffAllowed) : allNavigation;

  const handleLogout = () => {
    logout();
    window.location.href = '/admin/login';
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar */}
      <header className="admin-topbar fixed top-0 left-0 right-0 bg-card border-b border-border z-50 flex items-center px-4 gap-4 shadow-sm">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="lg:hidden"
          aria-label="Toggle sidebar"
        >
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="hidden lg:flex"
          aria-label="Collapse sidebar"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <Link to="/admin" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">L</span>
          </div>
          <div className="hidden sm:block">
            <h1 className="text-lg font-bold tracking-wide text-foreground">
              LEON
            </h1>
            <span className="text-[10px] text-muted-foreground -mt-1 block">Admin Portal</span>
          </div>
        </Link>

        {/* Search */}
        <div className="flex-1 max-w-md mx-4 hidden md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm sản phẩm, đơn hàng..."
              className="pl-10 bg-secondary/50 border-0 focus-visible:ring-1"
            />
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2">
          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <Button variant="ghost" size="icon" className="relative" onClick={() => setNotifOpen(v => !v)}>
              <Bell className="h-5 w-5" />
              {(pendingOrders.length + (lowStockCount > 0 ? 1 : 0)) > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                  {pendingOrders.length + (lowStockCount > 0 ? 1 : 0)}
                </span>
              )}
            </Button>
            {notifOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-popover text-popover-foreground border border-border rounded-lg shadow-lg z-[200] overflow-hidden">
                <div className="px-4 py-3 font-semibold text-sm border-b border-border">Thông báo</div>
                {pendingOrders.length === 0 && lowStockCount === 0 ? (
                  <div className="p-6 text-sm text-center text-muted-foreground">
                    <ShoppingBag className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    Hệ thống hoạt động bình thường
                  </div>
                ) : (
                  <div className="max-h-72 overflow-y-auto divide-y divide-border">
                    {pendingOrders.map(order => (
                      <Link
                        key={order.orderId}
                        to={`/admin/orders/${order.orderId}`}
                        onClick={() => setNotifOpen(false)}
                        className="flex flex-col gap-1 px-4 py-3 hover:bg-muted transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-warning flex-shrink-0" />
                          <span className="font-medium text-sm">Đơn hàng chờ: {order.orderNumber || `ORD-${String(order.orderId).padStart(4, '0')}`}</span>
                        </div>
                        <span className="text-xs text-muted-foreground pl-4">
                          {order.createdAt ? new Date(order.createdAt).toLocaleString('vi-VN') : 'Vừa đặt'}
                        </span>
                      </Link>
                    ))}
                    {lowStockCount > 0 && (
                      <Link
                        to="/admin/inventory"
                        onClick={() => setNotifOpen(false)}
                        className="flex flex-col gap-1 px-4 py-3 hover:bg-muted transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-destructive flex-shrink-0" />
                          <span className="font-medium text-sm">{lowStockCount} sản phẩm sắp hết hàng</span>
                        </div>
                        <span className="text-xs text-muted-foreground pl-4">Kiểm tra kho hàng ngay</span>
                      </Link>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 px-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    {getInitials(user?.name || 'Admin')}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium leading-none">{user?.name || 'Admin User'}</p>
                  <p className="text-xs text-muted-foreground">{isStaffOnly ? 'Nhân viên' : 'Quản trị viên'}</p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Tài khoản của tôi</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Hồ sơ cá nhân</DropdownMenuItem>
              <DropdownMenuItem>Cài đặt</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                <LogOut className="h-4 w-4 mr-2" />
                Đăng xuất
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div className="flex pt-16">
        {/* Sidebar */}
        <aside
          className={`admin-sidebar fixed left-0 top-16 bottom-0 bg-sidebar border-r border-sidebar-border transition-all duration-300 overflow-y-auto ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } ${sidebarCollapsed ? 'lg:w-20' : 'lg:w-[260px]'} lg:translate-x-0`}
        >
          <nav className="p-3 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href ||
                (item.href !== '/admin' && location.pathname.startsWith(item.href));
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                    isActive
                      ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-md'
                      : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                  }`}
                >
                  <div className={`flex items-center justify-center w-9 h-9 rounded-lg transition-colors ${
                    isActive 
                      ? 'bg-sidebar-primary-foreground/20' 
                      : 'bg-sidebar-accent group-hover:bg-sidebar-accent'
                  }`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  {!sidebarCollapsed && (
                    <>
                      <span className="flex-1">{item.name}</span>
                      {item.badge && (
                        <Badge 
                          variant={item.badge === 'hot' ? 'destructive' : 'secondary'} 
                          className={`text-[10px] px-1.5 py-0 h-5 ${
                            item.badge === 'hot' 
                              ? 'bg-destructive text-destructive-foreground' 
                              : 'bg-sidebar-accent text-sidebar-foreground'
                          }`}
                        >
                          {item.badge === 'hot' ? 'Hot' : item.badge}
                        </Badge>
                      )}
                      {isActive && <ChevronRight className="h-4 w-4 opacity-50" />}
                    </>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Sidebar Footer */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-sidebar-border space-y-2">
            {!sidebarCollapsed && (
              <div className="bg-sidebar-accent/50 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg gradient-success flex items-center justify-center">
                    <Store className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-sidebar-foreground">Cửa hàng LEON</p>
                    <p className="text-xs text-sidebar-foreground/60">Hoạt động</p>
                  </div>
                </div>
                <Link to="/" target="_blank">
                  <Button variant="secondary" size="sm" className="w-full text-xs">
                    Xem cửa hàng
                  </Button>
                </Link>
              </div>
            )}
            <button
              onClick={handleLogout}
              className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors ${sidebarCollapsed ? 'justify-center' : ''}`}
            >
              <LogOut className="h-5 w-5 flex-shrink-0" />
              {!sidebarCollapsed && <span>Đăng xuất</span>}
            </button>
          </div>
        </aside>

        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main
          className={`flex-1 transition-all duration-300 ${
            sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-[260px]'
          }`}
        >
          <div className="p-4 lg:p-6 max-w-[1600px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
