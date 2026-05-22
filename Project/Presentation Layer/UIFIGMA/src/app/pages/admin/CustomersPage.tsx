import { useState, useEffect } from 'react';
import { getCustomers, getOrders, getAddresses, toggleCustomerLock, resetCustomerPassword, deleteAccountApi, ApiCustomer, ApiOrder, ApiAddress, formatAddress } from '../../lib/api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { Search, Eye, Mail, Phone, MapPin, Pencil, Save, X, ExternalLink, Lock, LockOpen, KeyRound, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '../../components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Label } from '../../components/ui/label';
import { toast } from 'sonner';
import { useAuth } from '../../lib/auth';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../../components/ui/alert-dialog';
import { useNavigate } from 'react-router';

export function CustomersPage() {
  const { isStaffOnly } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<ApiCustomer | null>(null);
  const [allCustomers, setAllCustomers] = useState<ApiCustomer[]>([]);
  const [customerOrders, setCustomerOrders] = useState<ApiOrder[]>([]);
  const [resetTarget, setResetTarget] = useState<ApiCustomer | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<ApiCustomer | null>(null);
  const [resetting, setResetting] = useState(false);
  const [customerAddresses, setCustomerAddresses] = useState<ApiAddress[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    getCustomers().then(setAllCustomers).catch(() => {});
  }, []);

  useEffect(() => {
    if (selectedCustomer) {
      getOrders({ userId: selectedCustomer }).then(data => setCustomerOrders(Array.isArray(data) ? data : [])).catch(() => setCustomerOrders([]));
      getAddresses(selectedCustomer).then(setCustomerAddresses).catch(() => setCustomerAddresses([]));
    } else {
      setCustomerOrders([]);
      setCustomerAddresses([]);
    }
  }, [selectedCustomer]);

  const filteredCustomers = allCustomers.filter(c =>
    (c.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.phone || '').includes(searchTerm)
  );

  const getCustomerId = (c: ApiCustomer) => c.userId ? String(c.userId) : c.customerId ?? '';
  const customer = allCustomers.find(c => getCustomerId(c) === selectedCustomer);

  const handleEditCustomer = () => {
    if (customer) {
      setEditingCustomer({ ...customer });
      setIsEditing(true);
    }
  };

  const handleSaveCustomer = () => {
    if (!editingCustomer) return;

    if (!editingCustomer.fullName || !editingCustomer.email || !editingCustomer.phone) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }
    setAllCustomers(prev => prev.map(c => c.customerId === editingCustomer.customerId ? editingCustomer : c));
    setIsEditing(false);
    toast.success('Cập nhật thông tin khách hàng thành công');
  };

  const handleDeleteCustomer = async () => {
    if (!deleteTarget) return;
    const uid = Number(deleteTarget.userId ?? deleteTarget.customerId);
    if (!uid) { toast.error('Không tìm thấy ID khách hàng'); return; }
    try {
      await deleteAccountApi(uid);
      setAllCustomers(prev => prev.filter(c => getCustomerId(c) !== getCustomerId(deleteTarget)));
      setDeleteTarget(null);
      if (selectedCustomer === getCustomerId(deleteTarget)) setSelectedCustomer(null);
      toast.success('Đã xóa tài khoản khách hàng');
    } catch (e: any) { toast.error(e.message || 'Xóa thất bại'); }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingCustomer(null);
  };

  const handleViewOrder = (orderId: string) => {
    navigate(`/admin/orders/${orderId}`);
  };

  const handleToggleLock = async (customer: ApiCustomer) => {
    try {
      const id = getCustomerId(customer);
      if (!id) throw new Error('Không tìm thấy ID khách hàng');
      const updated = await toggleCustomerLock(id);
      setAllCustomers(prev => prev.map(c => getCustomerId(c) === getCustomerId(updated) ? updated : c));
      toast.success(updated.status === 'active' ? 'Đã mở khóa tài khoản' : 'Đã khóa tài khoản');
    } catch (e: any) { toast.error(e?.message || 'Thao tác thất bại'); }
  };

  const handleResetPassword = async () => {
    if (!resetTarget) return;
    if (!newPassword || newPassword.length < 6) { toast.error('Mật khẩu phải có ít nhất 6 ký tự'); return; }
    setResetting(true);
    try {
      const id = getCustomerId(resetTarget);
      if (!id) throw new Error('Không tìm thấy ID khách hàng');
      await resetCustomerPassword(id, newPassword);
      toast.success('Đã đặt lại mật khẩu thành công');
      setResetTarget(null); setNewPassword('');
    } catch (e: any) { toast.error(e?.message || 'Đặt lại mật khẩu thất bại'); }
    finally { setResetting(false); }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl">Quản lý khách hàng</h1>
          <p className="text-text-secondary mt-2">Xem và quản lý thông tin khách hàng</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Danh sách khách hàng ({allCustomers.length})</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-text-secondary" />
              <Input
                placeholder="Tìm kiếm khách hàng..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-80"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Họ tên</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Số điện thoại</TableHead>
                <TableHead>Số đơn hàng</TableHead>
                <TableHead>Tổng chi tiêu</TableHead>
                <TableHead>Ngày đăng ký</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.map((customer) => (
                <TableRow key={getCustomerId(customer)}>
                  <TableCell>{customer.fullName}</TableCell>
                  <TableCell>{customer.email}</TableCell>
                  <TableCell>{customer.phone}</TableCell>
                  <TableCell>
                    <span>{customer.totalOrders ?? '—'}</span>
                  </TableCell>
                  <TableCell>{(customer.totalSpent || 0).toLocaleString('vi-VN')} ₫</TableCell>
                  <TableCell>{customer.createdAt ? new Date(customer.createdAt).toLocaleDateString('vi-VN') : '-'}</TableCell>
                  <TableCell>
                    <Badge variant={customer.status === 'active' ? 'default' : 'destructive'}>
                      {customer.status === 'active' ? 'Hoạt động' : 'Đã khóa'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => { setSelectedCustomer(getCustomerId(customer)); }}
                      >
                        <Eye className="size-4" />
                      </Button>

                      {!isStaffOnly && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleLock(customer)}
                          title={customer.status === 'active' ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                        >
                          {customer.status === 'active' ? (
                            <Lock className="size-4 text-destructive" />
                          ) : (
                            <LockOpen className="size-4 text-success" />
                          )}
                        </Button>
                      )}

                      {!isStaffOnly && (
                        <Button variant="outline" size="sm" onClick={() => { setResetTarget(customer); setNewPassword(''); }} title="Đặt lại mật khẩu">
                          <KeyRound className="size-4" />
                        </Button>
                      )}

                      {!isStaffOnly && (
                        <Button variant="outline" size="sm" onClick={() => setDeleteTarget(customer)} title="Xóa tài khoản">
                          <Trash2 className="size-4 text-destructive" />
                        </Button>
                      )}
                    </div>

                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>

    <Dialog open={!!selectedCustomer && !!customer} onOpenChange={(open) => { if (!open) { setSelectedCustomer(null); setIsEditing(false); setEditingCustomer(null); } }}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Thông tin khách hàng</DialogTitle>
          <DialogDescription>Xem và quản lý thông tin chi tiết về khách hàng</DialogDescription>
        </DialogHeader>
        {customer && (
          <Tabs defaultValue="info" className="mt-4">
            <TabsList>
              <TabsTrigger value="info">Thông tin cá nhân</TabsTrigger>
              <TabsTrigger value="orders">Lịch sử mua hàng</TabsTrigger>
              <TabsTrigger value="addresses">Địa chỉ</TabsTrigger>
            </TabsList>
            <TabsContent value="info" className="space-y-4">
              <div className="flex justify-end mb-4">
                {!isEditing ? (
                  <Button variant="outline" size="sm" onClick={handleEditCustomer}><Pencil className="size-4 mr-2" />Chỉnh sửa</Button>
                ) : (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleCancelEdit}><X className="size-4 mr-2" />Hủy</Button>
                    <Button size="sm" onClick={handleSaveCustomer}><Save className="size-4 mr-2" />Lưu</Button>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Họ tên</Label>{isEditing && editingCustomer ? (<Input value={editingCustomer.fullName} onChange={(e) => setEditingCustomer({ ...editingCustomer, fullName: e.target.value })} className="mt-1" />) : (<p className="text-lg mt-1">{customer.fullName}</p>)}</div>
                <div><Label>Ngày đăng ký</Label><p className="text-lg mt-1">{customer.createdAt ? new Date(customer.createdAt).toLocaleDateString('vi-VN') : '-'}</p></div>
                <div className="col-span-2"><Label className="flex items-center gap-2"><Mail className="size-4" /> Email</Label>{isEditing && editingCustomer ? (<Input type="email" value={editingCustomer.email} onChange={(e) => setEditingCustomer({ ...editingCustomer, email: e.target.value })} className="mt-1" />) : (<p className="text-lg mt-1">{customer.email}</p>)}</div>
                <div className="col-span-2"><Label className="flex items-center gap-2"><Phone className="size-4" /> Số điện thoại</Label>{isEditing && editingCustomer ? (<Input type="tel" value={editingCustomer.phone} onChange={(e) => setEditingCustomer({ ...editingCustomer, phone: e.target.value })} className="mt-1" />) : (<p className="text-lg mt-1">{customer.phone}</p>)}</div>
                <div><Label>Tổng đơn hàng</Label><p className="text-2xl mt-1">{customer.totalOrders ?? customerOrders.length}</p></div>
                <div><Label>Tổng chi tiêu</Label><p className="text-2xl mt-1">{(customer.totalSpent || 0).toLocaleString('vi-VN')} ₫</p></div>
              </div>
            </TabsContent>
            <TabsContent value="orders">
              <div className="space-y-4">
                {customerOrders.length > 0 ? customerOrders.map((order) => (
                  <Card key={order.orderId} className="cursor-pointer hover:border-accent transition-colors">
                    <CardContent className="p-4" onClick={() => handleViewOrder(order.orderId)}>
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2"><p className="font-semibold">{order.orderNumber || `ORD-${String(order.orderId).padStart(4, '0')}`}</p><ExternalLink className="size-4 text-text-secondary" /></div>
                          <p className="text-sm text-text-secondary">{order.createdAt ? new Date(order.createdAt).toLocaleDateString('vi-VN') : '-'}</p>
                          <div className="flex gap-2 mt-2 flex-wrap">
                            <Badge variant={(order.orderStatus || order.status) === 'completed' ? 'default' : 'outline'}>{order.orderStatus || order.status}</Badge>
                            <Badge variant="outline" className="capitalize">{order.paymentMethod === 'online' ? 'Online' : 'COD'}</Badge>
                          </div>
                        </div>
                        <div className="text-right"><p className="text-lg font-semibold">{(order.totalAmount || order.total || 0).toLocaleString('vi-VN')} ₫</p><p className="text-sm text-text-secondary">{(order.items || []).length} sản phẩm</p></div>
                      </div>
                    </CardContent>
                  </Card>
                )) : (<p className="text-center text-text-secondary py-8">Khách hàng chưa có đơn hàng nào</p>)}
              </div>
            </TabsContent>
            <TabsContent value="addresses">
              <div className="space-y-4">
                {customerAddresses.length === 0 ? (<p className="text-center text-text-secondary py-6">Không có địa chỉ nào</p>) : customerAddresses.map((address) => (
                  <Card key={address.addressId}><CardContent className="p-4"><div className="flex items-start gap-3"><MapPin className="size-5 text-text-secondary mt-1" /><div className="flex-1"><div className="flex items-center gap-2"><p className="font-semibold">{address.recipientName || customer?.fullName}</p>{address.isDefault && (<Badge variant="outline">Địa chỉ mặc định</Badge>)}</div><p className="text-sm text-text-secondary mt-1">{address.phone || customer?.phone}</p><p className="mt-2 text-sm">{formatAddress(address)}</p></div></div></CardContent></Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>

    <Dialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-destructive">Xóa tài khoản</DialogTitle>
          <DialogDescription>Tài khoản <strong>{deleteTarget?.fullName}</strong> sẽ bị xóa vĩnh viễn. Bạn chắc chắn không?</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setDeleteTarget(null)}>Hủy</Button>
          <Button variant="destructive" onClick={handleDeleteCustomer}>Xác nhận xóa</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <Dialog open={!!resetTarget} onOpenChange={(open) => { if (!open) { setResetTarget(null); setNewPassword(''); } }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Đặt lại mật khẩu</DialogTitle>
          <DialogDescription>Nhập mật khẩu mới cho <strong>{resetTarget?.fullName}</strong></DialogDescription>
        </DialogHeader>
        <div className="py-2">
          <Label>Mật khẩu mới (ít nhất 6 ký tự)</Label>
          <Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="••••••" className="mt-1" />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => { setResetTarget(null); setNewPassword(''); }}>Hủy</Button>
          <Button onClick={handleResetPassword} disabled={resetting}>{resetting ? 'Đang xử lý...' : 'Xác nhận'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
  );
}