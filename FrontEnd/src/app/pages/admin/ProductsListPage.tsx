import { Link } from 'react-router';
import { Plus, Search, Edit, Eye, EyeOff, Trash2, Package } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { useState, useEffect } from 'react';
import { getProducts, deleteProduct, mapApiProduct, toggleProductStatus, getCategories, ApiCategory } from '../../lib/api';
import type { Product } from '../../lib/mock-data';
import { toast } from 'sonner';
import { useAuth } from '../../lib/auth';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';

export function ProductsListPage() {
  const { isStaffOnly } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [catList, setCatList] = useState<ApiCategory[]>([]);

  useEffect(() => {
    getProducts().then(data => { setAllProducts(data.map(mapApiProduct)); setLoading(false); }).catch(() => setLoading(false));
    getCategories().then(setCatList).catch(() => {});
  }, []);

  const getChildCategoryNames = (catName: string): string[] => {
    const cat = catList.find(c => c.categoryName === catName);
    if (!cat) return [catName];
    const children = catList.filter(c => c.parentId === cat.categoryId);
    return children.length > 0 ? children.map(c => c.categoryName) : [catName];
  };

  const categories = catList.length > 0
    ? catList.map(c => c.categoryName)
    : [...new Set(allProducts.map(p => p.category))];

  const filteredProducts = allProducts.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(p.id ?? '').includes(searchQuery);
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    const matchingNames = categoryFilter === 'all' ? [] : getChildCategoryNames(categoryFilter);
    const matchesCategory = categoryFilter === 'all' || matchingNames.includes(p.category) || p.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleToggleStatus = async (id: string) => {
    try {
      await toggleProductStatus(id);
      setAllProducts(prev => prev.map(p => p.id === id ? { ...p, status: p.status === 'active' ? 'inactive' : 'active' } : p));
      toast.success('Cập nhật trạng thái thành công');
    } catch (err: any) {
      toast.error(err?.message || 'Không thể cập nhật trạng thái');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Xóa sản phẩm này?')) return;
    try {
      await deleteProduct(id);
      setAllProducts(prev => prev.filter(p => p.id !== id));
      toast.success('Đã xóa sản phẩm');
    } catch (err: any) { toast.error(err.message); }
  };

  const activeCount = allProducts.filter(p => p.status === 'active').length;
  const totalStock = allProducts.reduce((sum, p) => sum + p.variants.reduce((s, v) => s + v.stock, 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Sản phẩm</h1>
          <p className="text-muted-foreground mt-1">Quản lý danh sách sản phẩm của cửa hàng</p>
        </div>
        {!isStaffOnly && (
          <Link to="/admin/products/add">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Thêm sản phẩm
            </Button>
          </Link>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{allProducts.length}</p>
                <p className="text-xs text-muted-foreground">Tổng sản phẩm</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                <Eye className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeCount}</p>
                <p className="text-xs text-muted-foreground">Đang bán</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center">
                <Package className="h-5 w-5 text-info" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalStock.toLocaleString('vi-VN')}</p>
                <p className="text-xs text-muted-foreground">Tổng tồn kho</p>
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
                placeholder="Tìm theo tên hoặc mã sản phẩm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-muted/50 border-0"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40 bg-muted/50 border-0">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="active">Đang bán</SelectItem>
                <SelectItem value="inactive">Ngừng bán</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-40 bg-muted/50 border-0">
                <SelectValue placeholder="Danh mục" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                {catList.length > 0
                  ? catList.filter(c => !c.parentId).map(parent => (
                      <SelectItem key={parent.categoryId} value={parent.categoryName}>
                        {parent.categoryName}
                      </SelectItem>
                    )).concat(
                      catList.filter(c => !!c.parentId).map(child => (
                        <SelectItem key={child.categoryId} value={child.categoryName}>
                          &nbsp;&nbsp;↳ {child.categoryName}
                        </SelectItem>
                      ))
                    )
                  : categories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))
                }
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card className="border-0 shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="font-semibold">Sản phẩm</TableHead>
              <TableHead className="font-semibold">Mã</TableHead>
              <TableHead className="font-semibold">Danh mục</TableHead>
              <TableHead className="font-semibold">Giá bán</TableHead>
              <TableHead className="font-semibold">Tồn kho</TableHead>
              <TableHead className="font-semibold">Trạng thái</TableHead>
              <TableHead className="font-semibold w-[100px]">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.map((product) => {
              const totalStock = product.variants.reduce((sum, v) => sum + v.stock, 0);
              return (
                <TableRow key={product.id} className="group">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-14 h-14 object-cover rounded-lg border border-border"
                        />
                        {totalStock === 0 && (
                          <div className="absolute inset-0 bg-foreground/60 rounded-lg flex items-center justify-center">
                            <span className="text-[10px] text-background font-medium">Hết</span>
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium truncate max-w-[200px]">{product.name}</p>
                        <p className="text-xs text-muted-foreground">{product.variants.length} biến thể</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <code className="text-xs bg-muted px-2 py-1 rounded">{product.id}</code>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="font-normal">
                      {product.category}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-semibold">
                        {(product.salePrice || product.basePrice).toLocaleString('vi-VN')}đ
                      </p>
                      {product.salePrice && (
                        <p className="text-xs text-muted-foreground line-through">
                          {product.basePrice.toLocaleString('vi-VN')}đ
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className={`font-semibold ${
                        totalStock === 0 ? 'text-destructive' :
                        totalStock < 20 ? 'text-warning' : 'text-foreground'
                      }`}>
                        {totalStock}
                      </span>
                      {totalStock < 20 && totalStock > 0 && (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-warning text-warning">
                          Sắp hết
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline"
                      className={product.status === 'active' 
                        ? 'border-success text-success bg-success/10' 
                        : 'border-muted-foreground text-muted-foreground bg-muted'
                      }
                    >
                      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                        product.status === 'active' ? 'bg-success' : 'bg-muted-foreground'
                      }`} />
                      {product.status === 'active' ? 'Đang bán' : 'Ngừng bán'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        title={product.status === 'active' ? 'Ẩn sản phẩm' : 'Hiện sản phẩm'}
                        onClick={() => handleToggleStatus(product.id)}
                      >
                        {product.status === 'active' ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Link to={`/admin/products/edit/${product.id}`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8" title="Chỉnh sửa">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      {!isStaffOnly && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          title="Xóa sản phẩm"
                          onClick={() => handleDelete(product.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        
        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <Package className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground">Không tìm thấy sản phẩm nào</p>
          </div>
        )}
      </Card>
    </div>
  );
}
