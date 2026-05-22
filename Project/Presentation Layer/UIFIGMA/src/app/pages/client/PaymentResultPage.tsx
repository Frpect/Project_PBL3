import { Link, useSearchParams } from 'react-router';
import { CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import { Button } from '../../components/ui/button';

export function PaymentResultPage() {
  const [searchParams] = useSearchParams();
  const status = searchParams.get('status');
  const orderId = searchParams.get('orderId');

  const isSuccess = status === 'success';

  return (
    <div className="min-h-[80vh] bg-background flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        {isSuccess ? (
          <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="h-10 w-10 text-emerald-600" />
          </div>
        ) : (
          <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
            <XCircle className="h-10 w-10 text-red-600" />
          </div>
        )}

        <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-3">
          {isSuccess ? 'Đặt hàng thành công!' : 'Thanh toán thất bại'}
        </h1>
        
        <p className="text-muted-foreground mb-8 leading-relaxed">
          {isSuccess
            ? 'Cảm ơn bạn đã đặt hàng. Chúng tôi sẽ xử lý đơn hàng của bạn sớm nhất.'
            : 'Đã có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại.'}
        </p>

        {orderId && (
          <div className="bg-muted/50 p-4 rounded-xl mb-8">
            <p className="text-sm text-muted-foreground mb-1">Mã đơn hàng</p>
            <p className="font-semibold text-foreground text-lg">{orderId}</p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <Link to="/orders" className="flex-1">
            <Button className={`w-full h-12 rounded-xl font-medium ${isSuccess ? '' : 'bg-transparent border border-border text-foreground hover:bg-muted'}`}>
              Xem đơn hàng
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link to="/" className="flex-1">
            <Button variant="outline" className="w-full h-12 rounded-xl font-medium">
              Về trang chủ
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
