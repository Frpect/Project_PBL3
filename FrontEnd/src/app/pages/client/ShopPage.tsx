import { useState, useMemo, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router';
import { Filter, X, SlidersHorizontal } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Checkbox } from '../../components/ui/checkbox';
import { ProductCard } from '../../components/ProductCard';
import { getProducts, getCategories, getColors, mapApiProduct, ApiCategory } from '../../lib/api';
import type { Product } from '../../lib/mock-data';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../../components/ui/sheet';

interface FilterContentProps {
  apiCategories: ApiCategory[];
  selectedCategories: string[];
  toggleCategory: (slug: string) => void;
  priceRange: { min: string; max: string };
  setPriceRange: React.Dispatch<React.SetStateAction<{ min: string; max: string }>>;
  allColors: string[];
  selectedColors: string[];
  toggleColor: (color: string) => void;
  clearFilters: () => void;
}

function FilterContent({
  apiCategories, selectedCategories, toggleCategory,
  priceRange, setPriceRange,
  allColors, selectedColors, toggleColor,
  clearFilters,
}: FilterContentProps) {
  return (
    <div className="space-y-8">
      {/* Categories */}
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground mb-4">Danh mục</h3>
        <div className="space-y-3">
          {apiCategories.map((category) => {
            const slug = category.slug || String(category.categoryId);
            return (
              <div key={category.categoryId} className="flex items-center gap-3">
                <Checkbox
                  id={`cat-${slug}`}
                  checked={selectedCategories.includes(slug)}
                  onCheckedChange={() => toggleCategory(slug)}
                  className="rounded-[4px]"
                />
                <label htmlFor={`cat-${slug}`} className="text-sm cursor-pointer text-muted-foreground hover:text-foreground transition-colors">
                  {category.categoryName}
                </label>
              </div>
            );
          })}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground mb-4">Khoảng giá</h3>
        <div className="flex gap-3">
          <div className="flex-1">
            <Input
              type="number"
              placeholder="Từ"
              value={priceRange.min}
              className="h-10 rounded-lg"
              onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
            />
          </div>
          <span className="flex items-center text-muted-foreground">-</span>
          <div className="flex-1">
            <Input
              type="number"
              placeholder="Đến"
              value={priceRange.max}
              className="h-10 rounded-lg"
              onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
            />
          </div>
        </div>
      </div>

      {/* Colors */}
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground mb-4">Màu sắc</h3>
        <div className="space-y-3">
          {allColors.map((color) => (
            <div key={color} className="flex items-center gap-3">
              <Checkbox
                id={`color-${color}`}
                checked={selectedColors.includes(color)}
                onCheckedChange={() => toggleColor(color)}
                className="rounded-[4px]"
              />
              <label htmlFor={`color-${color}`} className="text-sm cursor-pointer text-muted-foreground hover:text-foreground transition-colors">
                {color}
              </label>
            </div>
          ))}
        </div>
      </div>

      <Button
        variant="outline"
        onClick={clearFilters}
        className="w-full h-11 rounded-lg font-medium"
      >
        <X className="h-4 w-4 mr-2" />
        Xóa bộ lọc
      </Button>
    </div>
  );
}

export function ShopPage() {
  const { categorySlug } = useParams();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';

  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [apiCategories, setApiCategories] = useState<ApiCategory[]>([]);
  const [allColors, setAllColors] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    categorySlug ? [categorySlug] : []
  );
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [sortBy, setSortBy] = useState('newest');
  const [selectedColors, setSelectedColors] = useState<string[]>([]);

  useEffect(() => {
    Promise.all([getProducts(), getCategories(), getColors()]).then(
      ([prods, cats, colors]) => {
        setAllProducts(prods.map(mapApiProduct));
        setApiCategories(cats.filter(c => c.isVisible !== false));
        setAllColors(colors.map(c => c.colorName));
        setLoading(false);
      }
    );
  }, []);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let filtered = [...allProducts];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter (supports parent-child hierarchy)
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(p =>
        selectedCategories.some(slug => {
          const category = apiCategories.find(c => c.slug === slug || String(c.categoryId) === slug);
          if (!category) return false;
          if (p.category === category.categoryName) return true;
          // Also match child categories
          const children = apiCategories.filter(c => c.parentId === category.categoryId);
          return children.some(child => p.category === child.categoryName);
        })
      );
    }

    // Price filter
    if (priceRange.min) {
      filtered = filtered.filter(p =>
        (p.salePrice || p.basePrice) >= parseInt(priceRange.min)
      );
    }
    if (priceRange.max) {
      filtered = filtered.filter(p =>
        (p.salePrice || p.basePrice) <= parseInt(priceRange.max)
      );
    }

    // Color filter
    if (selectedColors.length > 0) {
      filtered = filtered.filter(p =>
        p.variants.some(v => selectedColors.includes(v.color) && v.stock > 0)
      );
    }

    // Sort
    switch (sortBy) {
      case 'price-asc':
        filtered.sort((a, b) => (a.salePrice ?? a.basePrice) - (b.salePrice ?? b.basePrice));
        break;
      case 'price-desc':
        filtered.sort((a, b) => (b.salePrice ?? b.basePrice) - (a.salePrice ?? a.basePrice));
        break;
      case 'newest':
        filtered.sort((a, b) => {
          const ta = a.createdAt instanceof Date ? a.createdAt.getTime() : 0;
          const tb = b.createdAt instanceof Date ? b.createdAt.getTime() : 0;
          return tb - ta;
        });
        break;
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    return filtered;
  }, [searchQuery, selectedCategories, priceRange, selectedColors, sortBy, allProducts, apiCategories]);

  const toggleCategory = (slug: string) => {
    setSelectedCategories(prev =>
      prev.includes(slug) ? prev.filter(s => s !== slug) : [...prev, slug]
    );
  };

  const toggleColor = (color: string) => {
    setSelectedColors(prev =>
      prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]
    );
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setPriceRange({ min: '', max: '' });
    setSelectedColors([]);
  };

  const filterProps: FilterContentProps = {
    apiCategories, selectedCategories, toggleCategory,
    priceRange, setPriceRange,
    allColors, selectedColors, toggleColor,
    clearFilters,
  };

  const activeFilterCount = selectedCategories.length + selectedColors.length + (priceRange.min ? 1 : 0) + (priceRange.max ? 1 : 0);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10 lg:py-14">
        {/* Page Header */}
        <div className="mb-10">
          <h1 className="text-3xl lg:text-4xl font-bold text-foreground tracking-tight">
            {searchQuery ? `Kết quả cho "${searchQuery}"` : 'Tất cả sản phẩm'}
          </h1>
          <p className="mt-2 text-muted-foreground">
            {loading ? 'Đang tải...' : `${filteredProducts.length} sản phẩm`}
          </p>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between gap-4 mb-8 pb-6 border-b border-border">
          <div className="flex items-center gap-3">
            {/* Mobile Filter Button */}
            <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="lg:hidden h-10 rounded-lg">
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  Bộ lọc
                  {activeFilterCount > 0 && (
                    <span className="ml-2 flex items-center justify-center w-5 h-5 rounded-full bg-foreground text-background text-xs">
                      {activeFilterCount}
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80">
                <SheetHeader>
                  <SheetTitle className="text-left">Bộ lọc</SheetTitle>
                </SheetHeader>
                <div className="mt-8">
                  <FilterContent {...filterProps} />
                </div>
              </SheetContent>
            </Sheet>

            {/* Active Filters */}
            {activeFilterCount > 0 && (
              <div className="hidden sm:flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{activeFilterCount} bộ lọc đang áp dụng</span>
                <button
                  onClick={clearFilters}
                  className="text-sm text-foreground hover:underline"
                >
                  Xóa tất cả
                </button>
              </div>
            )}
          </div>

          {/* Sort */}
          <div className="flex items-center gap-3">
            <Label htmlFor="sort" className="text-sm text-muted-foreground hidden sm:block">Sắp xếp:</Label>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger id="sort" className="w-[160px] h-10 rounded-lg">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Mới nhất</SelectItem>
                <SelectItem value="price-asc">Giá thấp - cao</SelectItem>
                <SelectItem value="price-desc">Giá cao - thấp</SelectItem>
                <SelectItem value="name">Tên A-Z</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-10">
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-foreground">Bộ lọc</h2>
                {activeFilterCount > 0 && (
                  <span className="text-xs px-2 py-1 rounded-full bg-foreground text-background">
                    {activeFilterCount}
                  </span>
                )}
              </div>
              <FilterContent {...filterProps} />
            </div>
          </aside>

          {/* Products Grid */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="w-8 h-8 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-muted-foreground">Đang tải sản phẩm...</p>
                </div>
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-5 lg:gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Filter className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Không tìm thấy sản phẩm</h3>
                <p className="text-muted-foreground mb-6">Thử thay đổi bộ lọc hoặc tìm kiếm khác</p>
                <Button variant="outline" onClick={clearFilters} className="rounded-lg">
                  Xóa bộ lọc
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
