import { useState } from 'react';
import { Link } from 'react-router';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { CheckCircle2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate sending reset email
    setTimeout(() => {
      setLoading(false);
      setSent(true);
      toast.success('Đã gửi email khôi phục mật khẩu');
    }, 1000);
  };

  if (sent) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="w-full max-w-sm text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="h-8 w-8 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-3">Kiểm tra email của bạn</h1>
          <p className="text-muted-foreground mb-8">
            Chúng tôi đã gửi hướng dẫn khôi phục mật khẩu đến <span className="font-medium text-foreground">{email}</span>
          </p>
          <Link to="/login">
            <Button className="w-full h-12 rounded-xl font-medium">Về trang đăng nhập</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <Link to="/login" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Quay lại đăng nhập
        </Link>

        <div className="mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">Quên mật khẩu?</h1>
          <p className="text-muted-foreground">
            Nhập email của bạn để nhận hướng dẫn khôi phục mật khẩu
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm text-muted-foreground">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="example@email.com"
              className="h-12 rounded-xl"
            />
          </div>

          <Button type="submit" className="w-full h-12 rounded-xl font-medium" disabled={loading}>
            {loading ? 'Đang gửi...' : 'Gửi hướng dẫn'}
          </Button>
        </form>
      </div>
    </div>
  );
}
