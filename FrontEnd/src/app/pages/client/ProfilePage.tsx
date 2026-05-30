import { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router';
import { User, MapPin, ShoppingBag, Plus, Trash2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { useAuth } from '../../lib/auth';
import { updateProfileApi, getOrders, ApiOrder, getAddresses, createAddress, deleteAddress, ApiAddress, formatAddress } from '../../lib/api';
import { StatusBadge } from '../../components/StatusBadge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { toast } from 'sonner';

export function ProfilePage() {
  const { user, isAuthenticated, setUser } = useAuth();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });
  const [saving, setSaving] = useState(false);
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const [addrList, setAddrList] = useState<ApiAddress[]>([]);
  const [showAddrDialog, setShowAddrDialog] = useState(false);
  const [newAddr, setNewAddr] = useState({ streetAddress: '', ward: '', district: '', province: '' });
  const [savingAddr, setSavingAddr] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    setOrdersLoading(true);
    getOrders({ userId: user.id })
      .then(setOrders)
      .catch(() => {})
      .finally(() => setOrdersLoading(false));
    getAddresses(user.id).then(setAddrList).catch(() => {});
  }, [user?.id]);

  const handleAddAddr = async () => {
    if (!newAddr.streetAddress) { toast.error('Vui lòng nhập địa chỉ chi tiết'); return; }
    setSavingAddr(true);
    try {
      const created = await createAddress(user!.id, { ...newAddr, recipientName: user?.name || '', phone: user?.phone || '' });
      setAddrList(prev => [...prev, created]);
      setShowAddrDialog(false);
      setNewAddr({ streetAddress: '', ward: '', district: '', province: '' });
      toast.success('Đã thêm địa chỉ');
    } catch (e: any) { toast.error(e.message); }
    finally { setSavingAddr(false); }
  };

  const handleDeleteAddr = async (addressId: number) => {
    try {
      await deleteAddress(user!.id, addressId);
      setAddrList(prev => prev.filter(a => a.addressId !== addressId));
      toast.success('Đã xóa địa chỉ');
    } catch (e: any) {
      toast.error(e.message || 'Xóa địa chỉ thất bại');
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) { toast.error('Không tìm thấy thông tin người dùng'); return; }
    setSaving(true);
    try {
      await updateProfileApi(user.id, { fullName: formData.name, email: formData.email, phone: formData.phone });
      if (user) setUser({ ...user, name: formData.name, phone: formData.phone, email: formData.email });
      toast.success('Cập nhật thông tin thành công');
    } catch (err: any) {
      toast.error(err.message || 'Cập nhật thất bại');
    } finally {
      setSaving(false);
    }
  };

  if (!isAuthenticated) {
    return <Navigate to="/login?redirect=/profile" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-6 lg:px-8 py-10 lg:py-14">
        <div className="mb-10">
          <h1 className="text-3xl lg:text-4xl font-bold text-foreground tracking-tight">Tài khoản</h1>
          <p className="mt-2 text-muted-foreground">Quản lý thông tin cá nhân và đơn hàng của bạn</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-8">
          <TabsList className="h-auto p-1 bg-muted/50 rounded-xl">
            <TabsTrigger value="profile" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm px-4 py-2.5">
              <User className="h-4 w-4 mr-2" />
              Thông tin
            </TabsTrigger>
            <TabsTrigger value="addresses" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm px-4 py-2.5">
              <MapPin className="h-4 w-4 mr-2" />
              Địa chỉ
            </TabsTrigger>
            <TabsTrigger value="orders" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm px-4 py-2.5">
              <ShoppingBag className="h-4 w-4 mr-2" />
              Đơn hàng
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <div className="bg-card rounded-2xl border border-border p-6 lg:p-8">
              <h2 className="text-lg font-semibold text-foreground mb-6">Thông tin cá nhân</h2>
              <form onSubmit={handleSaveProfile} className="space-y-5 max-w-lg">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm text-muted-foreground">Họ và tên</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="h-11 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm text-muted-foreground">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="h-11 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm text-muted-foreground">Số điện thoại</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="h-11 rounded-xl"
                  />
                </div>
                <Button type="submit" disabled={saving} className="h-11 rounded-xl font-medium">
                  {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                </Button>
              </form>
            </div>
          </TabsContent>

          <TabsContent value="addresses">
            <div className="bg-card rounded-2xl border border-border p-6 lg:p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-foreground">Địa chỉ của tôi</h2>
                <Button onClick={() => setShowAddrDialog(true)} size="sm" className="rounded-lg">
                  <Plus className="h-4 w-4 mr-1.5" /> Thêm địa chỉ
                </Button>
              </div>
              {addrList.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                    <MapPin className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground mb-4">Bạn chưa có địa chỉ nào</p>
                  <Button variant="outline" onClick={() => setShowAddrDialog(true)} className="rounded-lg">
                    Thêm địa chỉ
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {addrList.map((address) => (
                    <div
                      key={address.addressId}
                      className="flex items-start justify-between gap-4 p-4 border border-border rounded-xl"
                    >
                      <div className="flex-1">
                        <p className="text-sm text-foreground">{formatAddress(address)}</p>
                        {address.isDefault && (
                          <span className="inline-block mt-2 text-xs px-2 py-0.5 rounded-full bg-foreground text-background font-medium">
                            Mặc định
                          </span>
                        )}
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleDeleteAddr(address.addressId)}
                        className="text-muted-foreground hover:text-destructive h-8 w-8"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="orders">
            <div className="bg-card rounded-2xl border border-border p-6 lg:p-8">
              <h2 className="text-lg font-semibold text-foreground mb-6">Đơn hàng của tôi</h2>
              {ordersLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-6 h-6 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" />
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                    <ShoppingBag className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground mb-4">Bạn chưa có đơn hàng nào</p>
                  <Link to="/shop">
                    <Button className="rounded-lg">Mua sắm ngay</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.orderId} className="border border-border rounded-xl p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="font-semibold text-foreground">{order.orderNumber || `#${order.orderId}`}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {new Date(order.createdAt || order.orderDate || '').toLocaleDateString('vi-VN')}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <StatusBadge status={(order.orderStatus || order.status || 'pending') as any} type="order" />
                          <Link to={`/orders/${order.orderId}`}>
                            <Button variant="outline" size="sm" className="rounded-lg">Chi tiết</Button>
                          </Link>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {(order.items || []).slice(0, 2).map((item, idx) => (
                          <div key={idx} className="flex gap-3">
                            <img src={item.image || item.thumbnail || 'https://placehold.co/40x40?text=?'} alt={item.productName} className="w-12 h-12 object-cover rounded-lg" />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm text-foreground truncate">{item.productName}</p>
                              <p className="text-xs text-muted-foreground">{item.variantLabel} x {item.quantity}</p>
                            </div>
                            <p className="font-semibold text-sm text-foreground whitespace-nowrap">{(item.price * item.quantity).toLocaleString('vi-VN')}đ</p>
                          </div>
                        ))}
                        {(order.items || []).length > 2 && (
                          <p className="text-xs text-muted-foreground">+{(order.items || []).length - 2} sản phẩm khác</p>
                        )}
                      </div>
                      <div className="mt-4 pt-4 border-t border-border flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Tổng cộng</span>
                        <span className="font-bold text-foreground">{(order.totalAmount || order.total || 0).toLocaleString('vi-VN')}đ</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={showAddrDialog} onOpenChange={setShowAddrDialog}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>Thêm địa chỉ mới</DialogTitle>
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
            <Button variant="outline" onClick={() => setShowAddrDialog(false)} className="rounded-lg">Hủy</Button>
            <Button onClick={handleAddAddr} disabled={savingAddr} className="rounded-lg">{savingAddr ? 'Đang lưu...' : 'Lưu'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
