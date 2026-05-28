import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { getCategories, createProduct, uploadToCloudinary, addProductImageUrl, ApiCategory } from "../../lib/api";
import { Plus, X, Upload } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../../lib/auth";

export function AddProductPage() {
  const navigate = useNavigate();
  const { isStaffOnly } = useAuth();
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    description: "",
    basePrice: "",
  });

  const [variants, setVariants] = useState([
    { size: "", color: "", stock: "", sku: "" },
  ]);
  const [pendingImages, setPendingImages] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);

  useEffect(() => { getCategories().then(setCategories).catch(() => {}); }, []);
  useEffect(() => { if (isStaffOnly) navigate('/admin/products', { replace: true }); }, [isStaffOnly, navigate]);

  const handleFilesAdd = (files: FileList | File[]) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    const valid = Array.from(files).filter(f => allowed.includes(f.type));
    if (valid.length === 0) { toast.error('Chỉ hỗ trợ JPG, PNG, WEBP, GIF'); return; }
    setPendingImages(prev => [...prev, ...valid]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.basePrice || !formData.category) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }
    try {
      const result = await createProduct({
        productName: formData.name,
        categoryId: Number(formData.category),
        description: formData.description,
        basePrice: Number(formData.basePrice),
        variants: variants.map(v => ({
          size: v.size,
          color: v.color,
          stock: Number(v.stock),
          sku: v.sku || `${formData.name.replace(/[^a-zA-Z0-9]/g, '').substring(0,4)}-${v.size}-${v.color}`.toUpperCase().replace(/\s+/g, '') || undefined,
        })),
      });
      if (pendingImages.length > 0) {
        setUploadingImages(true);
        try {
          const urls = await Promise.all(pendingImages.map(f => uploadToCloudinary(f)));
          await Promise.all(urls.map((url, i) => addProductImageUrl(result.productId, url, i === 0)));
        } catch {
          toast.error('Sản phẩm đã tạo nhưng upload ảnh thất bại. Vào chỉnh sửa để thêm ảnh lại.');
        } finally {
          setUploadingImages(false);
        }
      }
      toast.success('Thêm sản phẩm thành công');
      navigate('/admin/products');
    } catch (e: any) { toast.error(e.message); }
  };

  const addVariant = () => {
    setVariants([
      ...variants,
      { size: "", color: "", stock: "", sku: "" },
    ]);
  };

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold">
          Thêm sản phẩm mới
        </h1>
        <p className="text-text-secondary">
          Nhập đầy đủ thông tin sản phẩm
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl border border-border p-6 space-y-4">
          <h2 className="text-xl font-semibold">
            Thông tin cơ bản
          </h2>

          <div>
              <Label htmlFor="category">Danh mục *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData({ ...formData, category: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn danh mục" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.categoryId} value={String(cat.categoryId)}>
                      {cat.categoryName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
          </div>

          <div>
            <Label htmlFor="name">Tên sản phẩm *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  name: e.target.value,
                })
              }
              required
              placeholder="Áo thun cotton basic"
            />
          </div>

          <div>
            <Label htmlFor="description">Mô tả</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  description: e.target.value,
                })
              }
              rows={4}
              placeholder="Mô tả chi tiết sản phẩm..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="basePrice">Giá bán *</Label>
              <Input
                id="basePrice"
                type="number"
                value={formData.basePrice}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    basePrice: e.target.value,
                  })
                }
                required
                placeholder="299000"
              />
            </div>

          </div>
        </div>

        <div className="bg-white rounded-xl border border-border p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              Biến thể sản phẩm
            </h2>
            <Button
              type="button"
              variant="outline"
              onClick={addVariant}
            >
              <Plus className="h-4 w-4 mr-2" />
              Thêm biến thể
            </Button>
          </div>

          {variants.map((variant, index) => (
            <div
              key={index}
              className="grid grid-cols-5 gap-4 p-4 border border-border rounded-lg"
            >
              <div>
                <Label>Size *</Label>
                <Input
                  value={variant.size}
                  onChange={(e) => {
                    const newVariants = [...variants];
                    newVariants[index].size = e.target.value;
                    setVariants(newVariants);
                  }}
                  required
                  placeholder="M"
                />
              </div>

              <div>
                <Label>Màu *</Label>
                <Input
                  value={variant.color}
                  onChange={(e) => {
                    const newVariants = [...variants];
                    newVariants[index].color = e.target.value;
                    setVariants(newVariants);
                  }}
                  required
                  placeholder="Trắng"
                />
              </div>

              <div>
                <Label>Tồn kho *</Label>
                <Input
                  type="number"
                  value={variant.stock}
                  onChange={(e) => {
                    const newVariants = [...variants];
                    newVariants[index].stock = e.target.value;
                    setVariants(newVariants);
                  }}
                  required
                  placeholder="50"
                />
              </div>

              <div>
                <Label>SKU</Label>
                <Input
                  value={variant.sku}
                  onChange={(e) => {
                    const newVariants = [...variants];
                    newVariants[index].sku = e.target.value;
                    setVariants(newVariants);
                  }}
                  placeholder="TS001-M-W"
                />
              </div>

              <div className="flex items-end">
                {variants.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => removeVariant(index)}
                    className="text-error"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Image Upload */}
        <div className="bg-white rounded-xl border border-border p-6 space-y-4">
          <h2 className="text-xl font-semibold">Hình ảnh sản phẩm</h2>
          {pendingImages.length > 0 && (
            <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
              {pendingImages.map((file, i) => (
                <div key={i} className="relative group">
                  <img src={URL.createObjectURL(file)} alt="" className="w-full h-24 object-cover rounded-lg border" />
                  <button
                    type="button"
                    onClick={() => setPendingImages(prev => prev.filter((_, idx) => idx !== i))}
                    className="absolute top-1 right-1 w-5 h-5 bg-destructive text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >×</button>
                  {i === 0 && <span className="absolute bottom-1 left-1 text-[10px] bg-primary text-white px-1 rounded">Chính</span>}
                </div>
              ))}
            </div>
          )}
          <div
            onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={e => { e.preventDefault(); setIsDragging(false); handleFilesAdd(e.dataTransfer.files); }}
            onClick={() => document.getElementById('add-img-input')?.click()}
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
              isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-muted/30'
            }`}
          >
            <input id="add-img-input" type="file" accept="image/*" multiple className="hidden"
              onChange={e => e.target.files && handleFilesAdd(e.target.files)} />
            <Upload className="size-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm font-medium">Kéo ảnh vào đây hoặc click để chọn</p>
            <p className="text-xs text-muted-foreground mt-1">Hỗ trợ JPG, PNG, WEBP · Chọn nhiều ảnh cùng lúc</p>
          </div>
        </div>

        <div className="flex gap-4">
          <Button type="submit" size="lg" disabled={uploadingImages}>
            {uploadingImages ? 'Đang upload ảnh...' : 'Lưu sản phẩm'}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() => navigate("/admin/products")}
          >
            Hủy
          </Button>
        </div>
      </form>
    </div>
  );
}