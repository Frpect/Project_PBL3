import { useState, useEffect } from 'react';
import { Tag, ShoppingBag, Calendar, ArrowRight } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { getDiscounts, ApiDiscount } from '../../lib/api';
import { Link } from 'react-router';

export function PromotionsPage() {
  const [promotions, setPromotions] = useState<ApiDiscount[]>([]);

  useEffect(() => { getDiscounts().then(setPromotions).catch(() => {}); }, []);

  const formatDate = (d?: string) => d ? new Date(d).toLocaleDateString('vi-VN') : null;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-6 lg:px-8 py-10 lg:py-14">
        <div className="mb-10">
          <h1 className="text-3xl lg:text-4xl font-bold text-foreground tracking-tight">Khuyến mãi</h1>
          <p className="mt-2 text-muted-foreground">Các mã giảm giá sẽ được tự động hiển thị và áp dụng khi bạn thanh toán</p>
        </div>

        {promotions.filter(p => p.isActive).length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Tag className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Chưa có khuyến mãi</h3>
            <p className="text-muted-foreground">Hãy quay lại sau để xem các ưu đãi mới</p>
          </div>
        ) : (
          <div className="space-y-4">
            {promotions.filter(p => p.isActive).map((promo) => (
              <div
                key={promo.discountId}
                className="bg-card rounded-2xl border border-border p-5 flex flex-col sm:flex-row sm:items-center gap-5"
              >
                <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-foreground/5 flex items-center justify-center">
                  <Tag className="h-6 w-6 text-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <Badge className="bg-foreground text-background font-mono tracking-wider text-xs">{promo.code}</Badge>
                    <Badge variant="outline" className="text-xs">
                      {promo.type === 'percentage'
                        ? `-${promo.value}%`
                        : `-${promo.value.toLocaleString('vi-VN')}đ`}
                    </Badge>
                  </div>
                  <p className="font-medium text-foreground mb-1">{promo.discountName}</p>
                  {promo.description && <p className="text-sm text-muted-foreground mb-2">{promo.description}</p>}
                  <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                    {promo.minOrder && (
                      <span>
                        Đơn tối thiểu: <span className="text-foreground">{promo.minOrder.toLocaleString('vi-VN')}đ</span>
                      </span>
                    )}
                    {(promo.startDate || promo.endDate) && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(promo.startDate) ?? 'Nay'} - {formatDate(promo.endDate) ?? 'Không giới hạn'}
                      </span>
                    )}
                  </div>
                </div>
                <Link to="/shop" className="flex-shrink-0">
                  <Button variant="outline" className="rounded-xl w-full sm:w-auto">
                    <ShoppingBag className="h-4 w-4 mr-2" />
                    Mua ngay
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
