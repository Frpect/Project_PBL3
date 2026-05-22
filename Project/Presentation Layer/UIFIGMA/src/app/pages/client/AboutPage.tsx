import { Mail, MapPin, Phone, Clock } from 'lucide-react';

export function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-6 lg:px-8 py-10 lg:py-14">
        <div className="mb-10">
          <h1 className="text-3xl lg:text-4xl font-bold text-foreground tracking-tight">Về chúng tôi</h1>
          <p className="mt-2 text-muted-foreground">Tìm hiểu thêm về LEON và sứ mệnh của chúng tôi</p>
        </div>
        
        <div className="space-y-8">
          <div className="bg-card rounded-2xl border border-border p-6 lg:p-8">
            <p className="text-lg text-muted-foreground leading-relaxed">
              LEON là điểm đến lý tưởng cho những ai yêu thích thời trang hiện đại và chất lượng. 
              Chúng tôi mang đến những sản phẩm được chọn lọc kỹ lưỡng, kết hợp giữa phong cách đương đại 
              và chất lượng vượt trội.
            </p>
          </div>

          <div className="bg-card rounded-2xl border border-border p-6 lg:p-8">
            <h2 className="text-xl font-semibold text-foreground mb-4">Sứ mệnh của chúng tôi</h2>
            <p className="text-muted-foreground leading-relaxed">
              Chúng tôi cam kết mang đến những sản phẩm thời trang chất lượng cao với giá cả hợp lý,
              giúp mọi người tự tin thể hiện phong cách riêng của mình. Mỗi sản phẩm tại LEON đều được 
              thiết kế với sự chú ý đến từng chi tiết, đảm bảo sự thoải mái và phong cách cho người mặc.
            </p>
          </div>

          <div className="bg-card rounded-2xl border border-border p-6 lg:p-8">
            <h2 className="text-xl font-semibold text-foreground mb-6">Liên hệ</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-foreground/5 flex items-center justify-center flex-shrink-0">
                  <MapPin className="h-5 w-5 text-foreground" />
                </div>
                <div>
                  <p className="font-medium text-foreground mb-1">Địa chỉ</p>
                  <p className="text-sm text-muted-foreground">123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-foreground/5 flex items-center justify-center flex-shrink-0">
                  <Phone className="h-5 w-5 text-foreground" />
                </div>
                <div>
                  <p className="font-medium text-foreground mb-1">Điện thoại</p>
                  <p className="text-sm text-muted-foreground">1900 xxxx</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-foreground/5 flex items-center justify-center flex-shrink-0">
                  <Mail className="h-5 w-5 text-foreground" />
                </div>
                <div>
                  <p className="font-medium text-foreground mb-1">Email</p>
                  <p className="text-sm text-muted-foreground">support@leon.com</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-foreground/5 flex items-center justify-center flex-shrink-0">
                  <Clock className="h-5 w-5 text-foreground" />
                </div>
                <div>
                  <p className="font-medium text-foreground mb-1">Giờ làm việc</p>
                  <p className="text-sm text-muted-foreground">8:00 - 22:00 (Tất cả các ngày)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
