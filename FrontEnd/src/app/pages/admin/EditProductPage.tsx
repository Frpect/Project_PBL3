import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { getProductById, getCategories, updateProduct, uploadToCloudinary, addProductImageUrl, ApiProduct, ApiCategory } from '../../lib/api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { ArrowLeft, Plus, Pencil, Trash2, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../lib/auth';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '../../components/ui/dialog';
import { Switch } from '../../components/ui/switch';

type LocalVariant = { id?: string; size: string; color: string; stock: number; price?: number; sku?: string; };

export function EditProductPage() {
  const { isStaffOnly } = useAuth();
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<ApiProduct | null>(null);
  const [catList, setCatList] = useState<ApiCategory[]>([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    category: '',
    status: 'active' as 'active' | 'inactive',
    images: [] as string[],
  });

  const [variants, setVariants] = useState<LocalVariant[]>([]);
  const [newVariant, setNewVariant] = useState({ size: '', color: '', stock: 0, price: 0 });
  const [editingVariant, setEditingVariant] = useState<LocalVariant | null>(null);
  const [showAddVariantDialog, setShowAddVariantDialog] = useState(false);
  const [showEditVariantDialog, setShowEditVariantDialog] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [uploadingImages, setUploadingImages] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    getCategories().then(setCatList).catch(() => {});
    if (!productId) { setLoading(false); return; }
    getProductById(productId)
      .then(p => {
        setProduct(p);
        setFormData({
          code: p.sku || '',
          name: p.productName,
          description: p.description ?? '',
          category: p.categoryId ? String(p.categoryId) : '',
          status: p.isActive ? 'active' : 'inactive',
          images: p.images ?? [],
        });
        setVariants((p.variants ?? []).map(v => ({ id: v.variantId, size: v.size ?? v.sizeName ?? '', color: v.color ?? v.colorName ?? '', stock: v.stock, price: v.price, sku: v.sku })));
      })
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [productId]);

  if (loading) return <div className="p-6">Đang tải...</div>;
  if (!product) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-2xl mb-4">Sản phẩm không tồn tại</h2>
          <Button onClick={() => navigate('/admin/products')}>
            <ArrowLeft className="size-4 mr-2" />
            Quay lại danh sách
          </Button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.category || variants.length === 0) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }
    try {
      await updateProduct(product!.productId, {
        productName: formData.name,
        categoryId: Number(formData.category),
        description: formData.description,
        isActive: formData.status === 'active',
        basePrice: variants.length > 0 ? (variants[0].price ?? 0) : 0,
        variants: variants.map(v => ({ id: v.id, size: v.size, color: v.color, stock: v.stock, price: v.price, sku: v.sku })),
      });
      toast.success('Cập nhật sản phẩm thành công!');
      navigate('/admin/products');
    } catch (err: any) { toast.error(err.message); }
  };

  const handleAddVariant = () => {
    if (!newVariant.size || !newVariant.color) {
      toast.error('Vui lòng nhập đầy đủ size và màu sắc');
      return;
    }

    if (newVariant.stock < 0) {
      toast.error('Số lượng tồn kho không được âm');
      return;
    }

    const sku = `${formData.name.replace(/[^a-zA-Z0-9]/g, '').substring(0,4)}-${newVariant.size}-${newVariant.color.substring(0, 1).toUpperCase()}`.toUpperCase();
    
    // Check duplicate
    if (variants.some(v => v.size === newVariant.size && v.color === newVariant.color)) {
      toast.error('Biến thể này đã tồn tại');
      return;
    }

    const variant: LocalVariant = {
      id: `v${Date.now()}`,
      size: newVariant.size,
      color: newVariant.color,
      stock: newVariant.stock,
      price: newVariant.price > 0 ? newVariant.price : undefined,
      sku: sku,
    };

    setVariants([...variants, variant]);
    setNewVariant({ size: '', color: '', stock: 0, price: 0 });
    setShowAddVariantDialog(false);
    toast.success('Thêm biến thể thành công');
  };

  const handleUpdateVariant = () => {
    if (!editingVariant) return;

    if (!editingVariant.size || !editingVariant.color) {
      toast.error('Vui lòng nhập đầy đủ size và màu sắc');
      return;
    }

    if (editingVariant.stock < 0) {
      toast.error('Số lượng tồn kho không được âm');
      return;
    }

    const updatedVariants = variants.map(v =>
      v.id === editingVariant.id ? { ...editingVariant } : v
    );

    setVariants(updatedVariants);
    setEditingVariant(null);
    setShowEditVariantDialog(false);
    toast.success('Cập nhật biến thể thành công');
  };

  const handleDeleteVariant = (variantId: string) => {
    if (variants.length === 1) {
      toast.error('Sản phẩm phải có ít nhất một biến thể');
      return;
    }

    setVariants(prev => prev.filter(v => v.id !== variantId));
    toast.success('Xóa biến thể thành công');
  };

  const handleAddImage = () => {
    if (!newImageUrl) { toast.error('Vui lòng nhập URL hình ảnh'); return; }
    setFormData({ ...formData, images: [...formData.images, newImageUrl] });
    setNewImageUrl('');
    toast.success('Thêm hình ảnh thành công');
  };

  const handleFilesUpload = async (files: FileList | File[]) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    const valid = Array.from(files).filter(f => allowed.includes(f.type));
    if (valid.length === 0) { toast.error('Chỉ hỗ trợ JPG, PNG, WEBP, GIF'); return; }
    if (!productId) { toast.error('Không tìm thấy ID sản phẩm'); return; }
    setUploadingImages(true);
    try {
      const urls = await Promise.all(valid.map(f => uploadToCloudinary(f)));
      const isFirst = formData.images.length === 0;
      await Promise.all(urls.map((url, i) => addProductImageUrl(productId, url, isFirst && i === 0)));
      setFormData(prev => ({ ...prev, images: [...prev.images, ...urls] }));
      toast.success(`Đã tải lên ${urls.length} ảnh`);
    } catch (err: any) {
      toast.error(err.message || 'Upload thất bại');
    } finally {
      setUploadingImages(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    if (formData.images.length === 1) {
      toast.error('Sản phẩm phải có ít nhất một hình ảnh');
      return;
    }

    const newImages = formData.images.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      images: newImages,
    });
    toast.success('Xóa hình ảnh thành công');
  };

  const mainCategories = catList;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate('/admin/products')} className="mb-4">
          <ArrowLeft className="size-4 mr-2" />
          Quay lại danh sách
        </Button>
        <h1 className="text-3xl">Chỉnh sửa sản phẩm</h1>
        <p className="text-text-secondary mt-2">Cập nhật thông tin sản phẩm {product.productName}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Thông tin cơ bản</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Mã sản phẩm</Label>
                <Input
                  value={product?.productId ?? ''}
                  readOnly
                  className="bg-muted cursor-not-allowed font-mono"
                />
              </div>

              <div>
                <Label htmlFor="category">
                  Danh mục <span className="text-accent">*</span>
                </Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn danh mục" />
                  </SelectTrigger>
                  <SelectContent>
                    {mainCategories.map((cat) => (
                      <SelectItem key={cat.categoryId} value={String(cat.categoryId)}>
                        {cat.categoryName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="name">
                Tên sản phẩm <span className="text-accent">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Mô tả</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="status"
                checked={formData.status === 'active'}
                onCheckedChange={(checked) => setFormData({ ...formData, status: checked ? 'active' : 'inactive' })}
              />
              <Label htmlFor="status">
                {formData.status === 'active' ? 'Đang bán' : 'Ngừng bán'}
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Images */}
        <Card>
          <CardHeader>
            <CardTitle>Hình ảnh sản phẩm</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {formData.images.map((image, index) => (
                <div key={index} className="relative group">
                  <img
                    src={image}
                    alt={`Product ${index + 1}`}
                    className="w-full h-40 object-cover rounded-lg border-2 border-border"
                  />
                  <div className="absolute top-2 right-2">
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="size-8 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleRemoveImage(index)}
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                  {index === 0 && (
                    <Badge className="absolute bottom-2 left-2">Ảnh đại diện</Badge>
                  )}
                </div>
              ))}
            </div>

            {/* Drag & Drop Zone */}
            <div
              onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={e => { e.preventDefault(); setIsDragging(false); handleFilesUpload(e.dataTransfer.files); }}
              onClick={() => document.getElementById('img-file-input')?.click()}
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-muted/30'
              } ${uploadingImages ? 'pointer-events-none opacity-60' : ''}`}
            >
              <input
                id="img-file-input"
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={e => e.target.files && handleFilesUpload(e.target.files)}
              />
              <Upload className="size-8 mx-auto mb-2 text-muted-foreground" />
              {uploadingImages ? (
                <p className="text-sm text-muted-foreground">Đang tải lên...</p>
              ) : (
                <>
                  <p className="text-sm font-medium">Kéo ảnh vào đây hoặc click để chọn</p>
                  <p className="text-xs text-muted-foreground mt-1">Hỗ trợ JPG, PNG, WEBP · Chọn nhiều ảnh cùng lúc</p>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Variants */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle>Biến thể sản phẩm</CardTitle>
            <Dialog open={showAddVariantDialog} onOpenChange={setShowAddVariantDialog}>
              <DialogTrigger asChild>
                <Button type="button" size="sm">
                  <Plus className="size-4 mr-2" />
                  Thêm biến thể
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Thêm biến thể mới</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="newSize">Size</Label>
                    <Input
                      id="newSize"
                      value={newVariant.size}
                      onChange={(e) => setNewVariant({ ...newVariant, size: e.target.value })}
                      placeholder="S, M, L, XL, ..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="newColor">Màu sắc</Label>
                    <Input
                      id="newColor"
                      value={newVariant.color}
                      onChange={(e) => setNewVariant({ ...newVariant, color: e.target.value })}
                      placeholder="Đen, Trắng, Xanh, ..."
                    />
                  </div>
                  {!isStaffOnly && (
                  <div>
                    <Label htmlFor="newPrice">Giá riêng (tùy chọn)</Label>
                    <Input
                      id="newPrice"
                      type="number"
                      value={newVariant.price}
                      onChange={(e) => setNewVariant({ ...newVariant, price: Number(e.target.value) })}
                      min="0"
                      placeholder="Để trống nếu dùng giá gốc"
                    />
                  </div>
                  )}
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="outline">Hủy</Button>
                  </DialogClose>
                  <Button type="button" onClick={handleAddVariant}>Thêm</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SKU</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Màu sắc</TableHead>
                  <TableHead>Tồn kho</TableHead>
                  <TableHead>Giá riêng</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {variants.map((variant) => (
                  <TableRow key={variant.id}>
                    <TableCell className="font-mono text-sm">{variant.sku}</TableCell>
                    <TableCell>{variant.size}</TableCell>
                    <TableCell>{variant.color}</TableCell>
                    <TableCell>
                      <Badge variant={variant.stock > 0 ? 'default' : 'destructive'}>
                        {variant.stock}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {variant.price ? variant.price.toLocaleString('vi-VN') + ' ₫' : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Dialog open={showEditVariantDialog && editingVariant?.id === variant.id} onOpenChange={(open) => {
                          setShowEditVariantDialog(open);
                          if (!open) setEditingVariant(null);
                        }}>
                          <DialogTrigger asChild>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingVariant({ ...variant })}
                            >
                              <Pencil className="size-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Chỉnh sửa biến thể</DialogTitle>
                            </DialogHeader>
                            {editingVariant && (
                              <div className="space-y-4">
                                <div>
                                  <Label htmlFor="editSize">Size</Label>
                                  <Input
                                    id="editSize"
                                    value={editingVariant.size}
                                    onChange={(e) => setEditingVariant({ ...editingVariant, size: e.target.value })}
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="editColor">Màu sắc</Label>
                                  <Input
                                    id="editColor"
                                    value={editingVariant.color}
                                    onChange={(e) => setEditingVariant({ ...editingVariant, color: e.target.value })}
                                  />
                                </div>
                                {!isStaffOnly && (
                                <div>
                                  <Label htmlFor="editPrice">Giá riêng (tùy chọn)</Label>
                                  <Input
                                    id="editPrice"
                                    type="number"
                                    value={editingVariant.price || 0}
                                    onChange={(e) => setEditingVariant({ ...editingVariant, price: Number(e.target.value) || undefined })}
                                    min="0"
                                  />
                                </div>
                                )}
                              </div>
                            )}
                            <DialogFooter>
                              <DialogClose asChild>
                                <Button type="button" variant="outline">Hủy</Button>
                              </DialogClose>
                              <Button type="button" onClick={handleUpdateVariant}>Cập nhật</Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => variant.id && handleDeleteVariant(variant.id)}
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

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => navigate('/admin/products')}>
            Hủy
          </Button>
          <Button type="submit">Lưu thay đổi</Button>
        </div>
      </form>
    </div>
  );
}
