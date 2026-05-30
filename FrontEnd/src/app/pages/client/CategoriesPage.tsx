import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { ArrowRight } from 'lucide-react';
import { getCategories, ApiCategory } from '../../lib/api';

export function CategoriesPage() {
  const [categories, setCategories] = useState<ApiCategory[]>([]);

  useEffect(() => { getCategories().then(setCategories).catch(() => {}); }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10 lg:py-14">
        <div className="mb-10">
          <h1 className="text-3xl lg:text-4xl font-bold text-foreground tracking-tight">Danh mục</h1>
          <p className="mt-2 text-muted-foreground">Khám phá các bộ sưu tập theo phong cách</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {categories.map((category) => (
            <Link
              key={category.categoryId}
              to={`/shop/${category.slug ?? category.categoryId}`}
              className="group bg-card rounded-2xl border border-border p-6 lg:p-8 hover:border-foreground/30 hover:shadow-lg transition-all"
            >
              <h3 className="text-lg font-semibold text-foreground group-hover:underline mb-2">
                {category.categoryName}
              </h3>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                <span>Xem sản phẩm</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
