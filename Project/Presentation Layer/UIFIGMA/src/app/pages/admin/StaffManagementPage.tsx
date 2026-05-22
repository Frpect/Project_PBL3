import { useState, useEffect } from 'react';
import { getStaff, createStaff, updateStaff, toggleStaffLock, resetStaffPassword, deleteAccountApi, ApiStaff } from '../../lib/api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { Plus, Pencil, Lock, LockOpen, KeyRound, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../lib/auth';
import { useNavigate } from 'react-router';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '../../components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../../components/ui/alert-dialog';

export function StaffManagementPage() {
  const navigate = useNavigate();
  const { isStaffOnly } = useAuth();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingStaff, setEditingStaff] = useState<ApiStaff | null>(null);
  useEffect(() => { if (isStaffOnly) navigate('/', { replace: true }); }, [isStaffOnly, navigate]);
  const [staffList, setStaffList] = useState<ApiStaff[]>([]);
  const [resetTarget, setResetTarget] = useState<ApiStaff | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [resetting, setResetting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ApiStaff | null>(null);

  useEffect(() => { getStaff().then(setStaffList).catch(() => {}); }, []);

  const handleDeleteStaff = async () => {
    if (!deleteTarget) return;
    const uid = Number(deleteTarget.userId ?? deleteTarget.staffId);
    if (!uid) { toast.error('Không tìm thấy ID nhân viên'); return; }
    try {
      await deleteAccountApi(uid);
      setStaffList(prev => prev.filter(s => getStaffId(s) !== getStaffId(deleteTarget)));
      setDeleteTarget(null);
      toast.success('Đã xóa tài khoản nhân viên');
    } catch (e: any) { toast.error(e.message || 'Xóa thất bại'); }
  };
  const [newStaff, setNewStaff] = useState({
    name: '',
    username: '',
    email: '',
    phone: '',
    password: '',
  });

  const handleAddStaff = async () => {
    if (!newStaff.name || !newStaff.username || !newStaff.email || !newStaff.phone) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }
    if (!newStaff.password || newStaff.password.length < 6) {
      toast.error('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }
    try {
      const created = await createStaff({ fullName: newStaff.name, username: newStaff.username, email: newStaff.email, phone: newStaff.phone, password: newStaff.password, roleId: 3 });
      setStaffList(prev => [...prev, created]);
      setNewStaff({ name: '', username: '', email: '', phone: '', password: '' });
      setShowAddDialog(false);
      toast.success('Thêm tài khoản nhân viên thành công');
    } catch (e: any) { toast.error(e.message); }
  };

  const handleUpdateStaff = async () => {
    if (!editingStaff) return;
    try {
      const id = getStaffId(editingStaff)!;
      const updated = await updateStaff(String(id), { fullName: editingStaff.fullName, email: editingStaff.email, phone: editingStaff.phone });
      setStaffList(prev => prev.map(s => getStaffId(s) === getStaffId(updated) ? updated : s));
      setEditingStaff(null); setShowEditDialog(false);
      toast.success('Cập nhật thông tin thành công');
    } catch (e: any) { toast.error(e.message); }
  };

  const getStaffId = (s: ApiStaff) => s.userId ?? s.staffId;

  const handleToggleStatus = async (staff: ApiStaff) => {
    try {
      const updated = await toggleStaffLock(getStaffId(staff)!);
      setStaffList(prev => prev.map(s => getStaffId(s) === getStaffId(updated) ? updated : s));
      toast.success(updated.status === 'active' ? 'Đã mở khóa tài khoản' : 'Đã khóa tài khoản');
    } catch (e: any) { toast.error(e.message); }
  };

  const handleResetPassword = async () => {
    if (!resetTarget) return;
    if (!newPassword || newPassword.length < 6) { toast.error('Mật khẩu phải có ít nhất 6 ký tự'); return; }
    setResetting(true);
    try {
      await resetStaffPassword(getStaffId(resetTarget)!, newPassword);
      toast.success('Đã đặt lại mật khẩu thành công');
      setResetTarget(null); setNewPassword('');
    } catch (e: any) { toast.error(e.message); }
    finally { setResetting(false); }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl">Quản lý tài khoản nhân viên</h1>
          <p className="text-text-secondary mt-2">Quản lý tài khoản và quyền truy cập của nhân viên</p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="size-4 mr-2" />
              Thêm nhân viên
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Thêm tài khoản nhân viên mới</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="newName">
                  Họ và tên <span className="text-accent">*</span>
                </Label>
                <Input
                  id="newName"
                  value={newStaff.name}
                  onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                  placeholder="Nguyễn Văn A"
                />
              </div>
              <div>
                <Label htmlFor="newUsername">
                  Tên đăng nhập <span className="text-accent">*</span>
                </Label>
                <Input
                  id="newUsername"
                  value={newStaff.username}
                  onChange={(e) => setNewStaff({ ...newStaff, username: e.target.value.toLowerCase() })}
                  placeholder="nguyenvana"
                />
              </div>
              <div>
                <Label htmlFor="newEmail">
                  Email <span className="text-accent">*</span>
                </Label>
                <Input
                  id="newEmail"
                  type="email"
                  value={newStaff.email}
                  onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                  placeholder="nguyenvana@store.com"
                />
              </div>
              <div>
                <Label htmlFor="newPhone">
                  Số điện thoại <span className="text-accent">*</span>
                </Label>
                <Input
                  id="newPhone"
                  value={newStaff.phone}
                  onChange={(e) => setNewStaff({ ...newStaff, phone: e.target.value })}
                  placeholder="0901234567"
                />
              </div>
              <div>
                <Label htmlFor="newPassword">
                  Mật khẩu ban đầu <span className="text-accent">*</span>
                </Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newStaff.password}
                  onChange={(e) => setNewStaff({ ...newStaff, password: e.target.value })}
                  placeholder="Tối thiểu 6 ký tự"
                />
                <p className="text-xs text-text-secondary mt-1">
                  Nhân viên nên đổi mật khẩu sau khi đăng nhập lần đầu
                </p>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">Hủy</Button>
              </DialogClose>
              <Button type="button" onClick={handleAddStaff}>Thêm</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách nhân viên ({staffList.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Họ tên</TableHead>
                <TableHead>Tên đăng nhập</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Số điện thoại</TableHead>
                <TableHead>Ngày tạo</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {staffList.map((staff) => (
                <TableRow key={staff.staffId}>
                  <TableCell>{staff.fullName}</TableCell>
                  <TableCell className="font-mono">{staff.username}</TableCell>
                  <TableCell>{staff.email}</TableCell>
                  <TableCell>{staff.phone}</TableCell>
                  <TableCell>{staff.createdAt ? new Date(staff.createdAt).toLocaleDateString('vi-VN') : '-'}</TableCell>
                  <TableCell>
                    <Badge variant={staff.status === 'active' ? 'default' : 'destructive'}>
                      {staff.status === 'active' ? 'Hoạt động' : 'Đã khóa'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => { setEditingStaff({ ...staff }); setShowEditDialog(true); }}
                      >
                        <Pencil className="size-4" />
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleStatus(staff)}
                        title={staff.status === 'active' ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                      >
                        {staff.status === 'active' ? (
                          <Lock className="size-4 text-destructive" />
                        ) : (
                          <LockOpen className="size-4 text-success" />
                        )}
                      </Button>

                      <Button variant="outline" size="sm" onClick={() => { setResetTarget(staff); setNewPassword(''); }} title="Đặt lại mật khẩu">
                        <KeyRound className="size-4" />
                      </Button>

                      <Button variant="outline" size="sm" onClick={() => setDeleteTarget(staff)} title="Xóa tài khoản">
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={showEditDialog} onOpenChange={(open) => { setShowEditDialog(open); if (!open) setEditingStaff(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa thông tin nhân viên</DialogTitle>
          </DialogHeader>
          {editingStaff && (
            <div className="space-y-4">
              <div>
                <Label>Họ và tên <span className="text-accent">*</span></Label>
                <Input value={editingStaff.fullName} onChange={(e) => setEditingStaff({ ...editingStaff, fullName: e.target.value })} />
              </div>
              <div>
                <Label>Tên đăng nhập</Label>
                <Input value={editingStaff.username} disabled className="bg-muted" />
              </div>
              <div>
                <Label>Email <span className="text-accent">*</span></Label>
                <Input type="email" value={editingStaff.email} onChange={(e) => setEditingStaff({ ...editingStaff, email: e.target.value })} />
              </div>
              <div>
                <Label>Số điện thoại</Label>
                <Input value={editingStaff.phone ?? ''} onChange={(e) => setEditingStaff({ ...editingStaff, phone: e.target.value })} />
              </div>
            </div>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">Hủy</Button>
            </DialogClose>
            <Button type="button" onClick={handleUpdateStaff}>Cập nhật</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-destructive">Xóa tài khoản nhân viên</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-text-secondary py-2">Tài khoản <strong>{deleteTarget?.fullName}</strong> sẽ bị xóa vĩnh viễn. Bạn chắc chắn không?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Hủy</Button>
            <Button variant="destructive" onClick={handleDeleteStaff}>Xác nhận xóa</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!resetTarget} onOpenChange={(open) => { if (!open) { setResetTarget(null); setNewPassword(''); } }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Đặt lại mật khẩu</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-text-secondary">Nhập mật khẩu mới cho <strong>{resetTarget?.fullName}</strong></p>
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
