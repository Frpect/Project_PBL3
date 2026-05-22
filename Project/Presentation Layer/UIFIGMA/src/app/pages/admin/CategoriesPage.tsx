import { useState, useEffect } from 'react';
import { getCategories, createCategory, updateCategory, deleteCategory, ApiCategory } from '../../lib/api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { Plus, Pencil, Trash2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Switch } from '../../components/ui/switch';
import { Textarea } from '../../components/ui/textarea';
import { useAuth } from '../../lib/auth';
import { useNavigate } from 'react-router';

type Category = ApiCategory;

export function CategoriesPage() {
  const navigate = useNavigate();
  const { isStaffOnly } = useAuth();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [newCategory, setNewCategory] = useState({
    name: '',
    slug: '',
    parentId: '',
    isVisible: true,
    description: '',
  });

  const [catList, setCatList] = useState<Category[]>([]);

  useEffect(() => { if (isStaffOnly) navigate('/admin', { replace: true }); }, [isStaffOnly, navigate]);
  useEffect(() => { getCategories().then(setCatList).catch(() => {}); }, []);

  const handleAddCategory = async () => {
    if (!newCategory.name) { toast.error('Vui lòng nhập tên danh mục'); return; }
    try {
      const created = await createCategory({ categoryName: newCategory.name, slug: newCategory.slug, description: newCategory.description, isVisible: newCategory.isVisible });
      setCatList(prev => [...prev, created]);
      setNewCategory({ name: '', slug: '', parentId: '', isVisible: true, description: '' });
      setShowAddDialog(false);
      toast.success('Thêm danh mục thành công');
    } catch (e: any) { toast.error(e.message); }
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory) return;
    try {
      await updateCategory(editingCategory.categoryId, { categoryName: editingCategory.categoryName, slug: editingCategory.slug, description: editingCategory.description, isVisible: editingCategory.isVisible, parentId: editingCategory.parentId });
      setCatList(prev => prev.map(c => c.categoryId === editingCategory.categoryId ? { ...editingCategory } : c));
      setEditingCategory(null); setShowEditDialog(false);
      toast.success('Cập nhật danh mục thành công');
    } catch (e: any) { toast.error(e.message); }
  };

  const handleDeleteCategory = async (categoryId: number) => {
    if (!confirm('Xóa danh mục này?')) return;
    try {
      await deleteCategory(categoryId);
      setCatList(prev => prev.filter(c => c.categoryId !== categoryId));
      toast.success('Xóa danh mục thành công');
    } catch (e: any) { toast.error(e.message); }
  };

  const handleToggleVisibility = async (cat: Category) => {
    try {
      await updateCategory(cat.categoryId, { categoryName: cat.categoryName, isVisible: !cat.isVisible });
      setCatList(prev => prev.map(c => c.categoryId === cat.categoryId ? { ...c, isVisible: !c.isVisible } : c));
      toast.success(`Đã ${!cat.isVisible ? 'hiển thị' : 'ẩn'} danh mục`);
    } catch (e: any) { toast.error(e.message); }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const parentCategories = catList.filter(c => !c.parentId);
  const getCategoryName = (id: string) => {
    return catList.find(c => String(c.categoryId) === id)?.categoryName || '';
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl">Quản lý danh mục</h1>
          <p className="text-text-secondary mt-2">Quản lý danh mục sản phẩm trên hệ thống</p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="size-4 mr-2" />
              Thêm danh mục
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Thêm danh mục mới</DialogTitle>
              <DialogDescription>
                Tạo danh mục sản phẩm mới cho cửa hàng của bạn
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="newName">
                  Tên danh mục <span className="text-accent">*</span>
                </Label>
                <Input
                  id="newName"
                  value={newCategory.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    setNewCategory({ 
                      ...newCategory, 
                      name,
                      slug: generateSlug(name)
                    });
                  }}
                  placeholder="Ví dụ: Áo thun nam"
                />
              </div>
              <div>
                <Label htmlFor="newSlug">
                  Slug <span className="text-accent">*</span>
                </Label>
                <Input
                  id="newSlug"
                  value={newCategory.slug}
                  onChange={(e) => setNewCategory({ ...newCategory, slug: e.target.value })}
                  placeholder="ao-thun-nam"
                />
              </div>
              <div>
                <Label htmlFor="newParent">Danh mục cha (tùy chọn)</Label>
                <Select value={newCategory.parentId || 'none'} onValueChange={(value) => setNewCategory({ ...newCategory, parentId: value === 'none' ? '' : value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn danh mục cha" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Không có</SelectItem>
                    {parentCategories.map((cat) => (
                      <SelectItem key={cat.categoryId} value={String(cat.categoryId)}>
                        {cat.categoryName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="newDescription">Mô tả (tùy chọn)</Label>
                <Textarea
                  id="newDescription"
                  value={newCategory.description}
                  onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                  placeholder="Mô tả về danh mục"
                  rows={3}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="newVisible"
                  checked={newCategory.isVisible}
                  onCheckedChange={(checked) => setNewCategory({ ...newCategory, isVisible: checked })}
                />
                <Label htmlFor="newVisible">Hiển thị cho khách hàng</Label>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">Hủy</Button>
              </DialogClose>
              <Button type="button" onClick={handleAddCategory}>Thêm</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách danh mục ({catList.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tên danh mục</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Danh mục cha</TableHead>
                <TableHead>Hiển thị</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {catList.map((category) => (
                <TableRow key={category.categoryId}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {category.parentId && <span className="text-text-secondary">↳</span>}
                      <span>{category.categoryName}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{category.slug}</TableCell>
                  <TableCell>
                    {category.parentId ? (
                      <Badge variant="outline">{getCategoryName(String(category.parentId))}</Badge>
                    ) : (
                      <span className="text-text-secondary">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleVisibility(category)}
                    >
                      {category.isVisible ? (
                        <>
                          <Eye className="size-4 mr-2 text-success" />
                          <span className="text-success">Hiển thị</span>
                        </>
                      ) : (
                        <>
                          <EyeOff className="size-4 mr-2 text-text-secondary" />
                          <span className="text-text-secondary">Ẩn</span>
                        </>
                      )}
                    </Button>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Dialog open={showEditDialog && editingCategory?.categoryId === category.categoryId} onOpenChange={(open) => {
                        setShowEditDialog(open);
                        if (!open) setEditingCategory(null);
                      }}>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingCategory({ ...category })}
                          >
                            <Pencil className="size-4 mr-2" />
                            Sửa
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-lg">
                          <DialogHeader>
                            <DialogTitle>Chỉnh sửa danh mục</DialogTitle>
                            <DialogDescription>
                              Cập nhật thông tin danh mục sản phẩm
                            </DialogDescription>
                          </DialogHeader>
                          {editingCategory && (
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="editName">
                                  Tên danh mục <span className="text-accent">*</span>
                                </Label>
                                <Input
                                  id="editName"
                                  value={editingCategory.categoryName}
                                  onChange={(e) => {
                                    const name = e.target.value;
                                    setEditingCategory({ 
                                      ...editingCategory, 
                                      categoryName: e.target.value,
                                      slug: generateSlug(name)
                                    });
                                  }}
                                />
                              </div>
                              <div>
                                <Label htmlFor="editSlug">
                                  Slug <span className="text-accent">*</span>
                                </Label>
                                <Input
                                  id="editSlug"
                                  value={editingCategory.slug}
                                  onChange={(e) => setEditingCategory({ ...editingCategory, slug: e.target.value })}
                                />
                              </div>
                              <div>
                                <Label htmlFor="editParent">Danh mục cha (tùy chọn)</Label>
                                <Select
                                  value={editingCategory.parentId ? String(editingCategory.parentId) : 'none'}
                                  onValueChange={(value) => setEditingCategory({
                                    ...editingCategory,
                                    parentId: value === 'none' ? undefined : Number(value)
                                  })}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Chọn danh mục cha" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="none">Không có</SelectItem>
                                    {parentCategories
                                      .filter(cat => cat.categoryId !== editingCategory.categoryId)
                                      .map((cat) => (
                                        <SelectItem key={cat.categoryId} value={String(cat.categoryId)}>
                                          {cat.categoryName}
                                        </SelectItem>
                                      ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label htmlFor="editDescription">Mô tả (tùy chọn)</Label>
                                <Textarea
                                  id="editDescription"
                                  value={editingCategory.description || ''}
                                  onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                                  rows={3}
                                />
                              </div>
                              <div className="flex items-center space-x-2">
                                <Switch
                                  id="editVisible"
                                  checked={editingCategory.isVisible}
                                  onCheckedChange={(checked) => setEditingCategory({ ...editingCategory, isVisible: checked })}
                                />
                                <Label htmlFor="editVisible">Hiển thị cho khách hàng</Label>
                              </div>
                            </div>
                          )}
                          <DialogFooter>
                            <DialogClose asChild>
                              <Button type="button" variant="outline">Hủy</Button>
                            </DialogClose>
                            <Button type="button" onClick={handleUpdateCategory}>Cập nhật</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteCategory(category.categoryId)}
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
