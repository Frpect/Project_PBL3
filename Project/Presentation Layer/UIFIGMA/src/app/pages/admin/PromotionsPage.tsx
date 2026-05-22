import { useState, useEffect } from 'react';
import { getAdminDiscounts, createDiscount, updateDiscount, deleteDiscount, ApiDiscount } from '../../lib/api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { Plus, Pencil, Trash2, Tag } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Switch } from '../../components/ui/switch';
import { useAuth } from '../../lib/auth';
import { useNavigate } from 'react-router';

export function PromotionsPage() {
  const navigate = useNavigate();
  const { isStaffOnly } = useAuth();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<ApiDiscount | null>(null);
  const [discountList, setDiscountList] = useState<ApiDiscount[]>([]);

  useEffect(() => { if (isStaffOnly) navigate('/admin', { replace: true }); }, [isStaffOnly, navigate]);
  useEffect(() => {
    getAdminDiscounts().then(setDiscountList).catch(() => {});
  }, []);
  const [newPromotion, setNewPromotion] = useState({
    name: '',
    code: '',
    type: 'percentage' as 'percentage' | 'fixed',
    value: 0,
    minOrder: 0,
    maxDiscount: 0,
    startDate: '',
    endDate: '',
    status: 'active' as 'active' | 'inactive',
  });

  const handleAddPromotion = async () => {
    if (!newPromotion.name || !newPromotion.code || newPromotion.value <= 0 || !newPromotion.startDate || !newPromotion.endDate) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }
    try {
      const created = await createDiscount({ name: newPromotion.name, code: newPromotion.code, discountType: newPromotion.type === 'percentage' ? 'percent' : 'fixed', discountValue: newPromotion.value, minOrder: newPromotion.minOrder || undefined, maxDiscount: newPromotion.maxDiscount || undefined, startDate: newPromotion.startDate, endDate: newPromotion.endDate, status: newPromotion.status });
      setDiscountList(prev => [...prev, created]);
      setNewPromotion({ name: '', code: '', type: 'percentage', value: 0, minOrder: 0, maxDiscount: 0, startDate: '', endDate: '', status: 'active' });
      setShowAddDialog(false);
      toast.success('Thêm khuyến mãi thành công');
    } catch (e: any) { toast.error(e.message); }
  };

  const handleUpdatePromotion = async () => {
    if (!editingPromotion) return;
    try {
      const updated = await updateDiscount(editingPromotion.discountId, { name: editingPromotion.discountName, code: editingPromotion.code, discountType: editingPromotion.type === 'percentage' ? 'percent' : 'fixed', discountValue: editingPromotion.value, minOrder: editingPromotion.minOrder, maxDiscount: editingPromotion.maxDiscount, startDate: editingPromotion.startDate, endDate: editingPromotion.endDate, status: editingPromotion.isActive ? 'active' : 'inactive' });
      setDiscountList(prev => prev.map(d => d.discountId === updated.discountId ? updated : d));
      setEditingPromotion(null); setShowEditDialog(false);
      toast.success('Cập nhật khuyến mãi thành công');
    } catch (e: any) { toast.error(e.message); }
  };

  const handleDeletePromotion = async (promotionId: string) => {
    if (!confirm('Xóa khuyến mãi này?')) return;
    try {
      await deleteDiscount(promotionId);
      setDiscountList(prev => prev.filter(d => d.discountId !== promotionId));
      toast.success('Xóa khuyến mãi thành công');
    } catch (e: any) { toast.error(e.message); }
  };


  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl">Quản lý khuyến mãi</h1>
          <p className="text-text-secondary mt-2">Tạo và quản lý các chương trình khuyến mãi</p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="size-4 mr-2" />
              Thêm khuyến mãi
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Thêm khuyến mãi mới</DialogTitle>
              <DialogDescription>
                Tạo chương trình khuyến mãi mới cho sản phẩm hoặc danh mục
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="newName">
                    Tên chương trình <span className="text-accent">*</span>
                  </Label>
                  <Input
                    id="newName"
                    value={newPromotion.name}
                    onChange={(e) => setNewPromotion({ ...newPromotion, name: e.target.value })}
                    placeholder="Ví dụ: Giảm giá mùa hè"
                  />
                </div>
                <div>
                  <Label htmlFor="newCode">
                    Mã khuyến mãi <span className="text-accent">*</span>
                  </Label>
                  <Input
                    id="newCode"
                    value={newPromotion.code}
                    onChange={(e) => setNewPromotion({ ...newPromotion, code: e.target.value.toUpperCase() })}
                    placeholder="SUMMER20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="newType">Loại giảm giá</Label>
                  <Select value={newPromotion.type} onValueChange={(value: 'percentage' | 'fixed') => setNewPromotion({ ...newPromotion, type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Phần trăm (%)</SelectItem>
                      <SelectItem value="fixed">Số tiền cố định (VNĐ)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="newValue">
                    Giá trị giảm <span className="text-accent">*</span>
                  </Label>
                  <Input
                    id="newValue"
                    type="number"
                    value={newPromotion.value}
                    onChange={(e) => setNewPromotion({ ...newPromotion, value: Number(e.target.value) })}
                    placeholder={newPromotion.type === 'percentage' ? '20' : '50000'}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="newMinOrder">Đơn hàng tối thiểu (VNĐ)</Label>
                  <Input
                    id="newMinOrder"
                    type="number"
                    value={newPromotion.minOrder}
                    onChange={(e) => setNewPromotion({ ...newPromotion, minOrder: Number(e.target.value) })}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label htmlFor="newMaxDiscount">Giảm tối đa (VNĐ)</Label>
                  <Input
                    id="newMaxDiscount"
                    type="number"
                    value={newPromotion.maxDiscount}
                    onChange={(e) => setNewPromotion({ ...newPromotion, maxDiscount: Number(e.target.value) })}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="newStartDate">
                    Ngày bắt đầu <span className="text-accent">*</span>
                  </Label>
                  <Input
                    id="newStartDate"
                    type="date"
                    value={newPromotion.startDate}
                    onChange={(e) => setNewPromotion({ ...newPromotion, startDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="newEndDate">
                    Ngày kết thúc <span className="text-accent">*</span>
                  </Label>
                  <Input
                    id="newEndDate"
                    type="date"
                    value={newPromotion.endDate}
                    onChange={(e) => setNewPromotion({ ...newPromotion, endDate: e.target.value })}
                  />
                </div>
              </div>


              <div className="flex items-center space-x-2">
                <Switch
                  id="newStatus"
                  checked={newPromotion.status === 'active'}
                  onCheckedChange={(checked) => setNewPromotion({ ...newPromotion, status: checked ? 'active' : 'inactive' })}
                />
                <Label htmlFor="newStatus">Kích hoạt ngay</Label>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">Hủy</Button>
              </DialogClose>
              <Button type="button" onClick={handleAddPromotion}>Thêm</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách khuyến mãi ({discountList.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã / Tên</TableHead>
                <TableHead>Giảm giá</TableHead>
                <TableHead>Thời gian</TableHead>
                <TableHead>Áp dụng</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {discountList.map((promo) => (
                <TableRow key={promo.discountId}>
                    <TableCell>
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium text-sm">{promo.discountName || promo.code}</span>
                      <Badge variant="outline" className="font-mono w-fit text-xs">
                        <Tag className="size-3 mr-1" />
                        {promo.code}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    {promo.type === 'percentage' ? `${promo.value}%` : `${promo.value.toLocaleString('vi-VN')} ₫`}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{promo.startDate ? new Date(promo.startDate).toLocaleDateString('vi-VN') : '-'}</div>
                      <div className="text-text-secondary">→ {promo.endDate ? new Date(promo.endDate).toLocaleDateString('vi-VN') : '-'}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {promo.categoryNames && promo.categoryNames.length > 0
                      ? <div className="flex flex-wrap gap-1">
                          {promo.categoryNames.map(n => (
                            <Badge key={n} variant="secondary" className="text-xs">{n}</Badge>
                          ))}
                        </div>
                      : <span className="text-text-secondary text-sm">Tất cả</span>
                    }
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={!!promo.isActive}
                        onCheckedChange={async (checked) => {
                          try {
                            const updated = await updateDiscount(promo.discountId, {
                              name: promo.discountName, code: promo.code,
                              discountType: promo.type === 'percentage' ? 'percent' : 'fixed',
                              discountValue: promo.value, startDate: promo.startDate,
                              endDate: promo.endDate, status: checked ? 'active' : 'inactive'
                            });
                            setDiscountList(prev => prev.map(d => d.discountId === updated.discountId ? updated : d));
                            toast.success(checked ? 'Đã kích hoạt' : 'Đã tạm dừng');
                          } catch (e: any) { toast.error(e.message); }
                        }}
                      />
                      <span className="text-sm">{promo.isActive ? 'Hoạt động' : 'Tạm dừng'}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Dialog open={showEditDialog && editingPromotion?.discountId === promo.discountId} onOpenChange={(open) => {
                        setShowEditDialog(open);
                        if (!open) setEditingPromotion(null);
                      }}>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingPromotion({ ...promo });
                              setShowEditDialog(true);
                            }}
                          >
                            <Pencil className="size-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Chỉnh sửa khuyến mãi</DialogTitle>
                            <DialogDescription>
                              Cập nhật thông tin chương trình khuyến mãi
                            </DialogDescription>
                          </DialogHeader>
                          {editingPromotion && (
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="editCode">
                                  Tên / Mã khuyến mãi <span className="text-accent">*</span>
                                </Label>
                                <Input
                                  id="editCode"
                                  value={editingPromotion.code}
                                  onChange={(e) => setEditingPromotion({ ...editingPromotion, code: e.target.value, discountName: e.target.value })}
                                />
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label htmlFor="editType">Loại giảm giá</Label>
                                  <Select value={editingPromotion.type} onValueChange={(value: 'percentage' | 'fixed') => setEditingPromotion({ ...editingPromotion, type: value })}>
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="percentage">Phần trăm (%)</SelectItem>
                                      <SelectItem value="fixed">Số tiền cố định (VNĐ)</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <Label htmlFor="editValue">
                                    Giá trị giảm <span className="text-accent">*</span>
                                  </Label>
                                  <Input
                                    id="editValue"
                                    type="number"
                                    value={editingPromotion.value}
                                    onChange={(e) => setEditingPromotion({ ...editingPromotion, value: Number(e.target.value) })}
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label htmlFor="editMinOrder">Đơn hàng tối thiểu (VNĐ)</Label>
                                  <Input
                                    id="editMinOrder"
                                    type="number"
                                    value={editingPromotion.minOrder || 0}
                                    onChange={(e) => setEditingPromotion({ ...editingPromotion, minOrder: Number(e.target.value) || undefined })}
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="editMaxDiscount">Giảm tối đa (VNĐ)</Label>
                                  <Input
                                    id="editMaxDiscount"
                                    type="number"
                                    value={editingPromotion.maxDiscount || 0}
                                    onChange={(e) => setEditingPromotion({ ...editingPromotion, maxDiscount: Number(e.target.value) || undefined })}
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label htmlFor="editStartDate">
                                    Ngày bắt đầu <span className="text-accent">*</span>
                                  </Label>
                                  <Input
                                    id="editStartDate"
                                    type="date"
                                    value={editingPromotion.startDate ? String(editingPromotion.startDate).split('T')[0] : ''}
                                    onChange={(e) => setEditingPromotion({ ...editingPromotion, startDate: e.target.value })}
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="editEndDate">
                                    Ngày kết thúc <span className="text-accent">*</span>
                                  </Label>
                                  <Input
                                    id="editEndDate"
                                    type="date"
                                    value={editingPromotion.endDate ? String(editingPromotion.endDate).split('T')[0] : ''}
                                    onChange={(e) => setEditingPromotion({ ...editingPromotion, endDate: e.target.value })}
                                  />
                                </div>
                              </div>


                              <div className="flex items-center space-x-2">
                                <Switch
                                  id="editStatus"
                                  checked={editingPromotion.isActive}
                                  onCheckedChange={(checked) => setEditingPromotion({ ...editingPromotion, isActive: !!checked })}
                                />
                                <Label htmlFor="editStatus">Kích hoạt</Label>
                              </div>
                            </div>
                          )}
                          <DialogFooter>
                            <DialogClose asChild>
                              <Button type="button" variant="outline">Hủy</Button>
                            </DialogClose>
                            <Button type="button" onClick={handleUpdatePromotion}>Cập nhật</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeletePromotion(promo.discountId)}
                      >
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
    </div>
  );
}
