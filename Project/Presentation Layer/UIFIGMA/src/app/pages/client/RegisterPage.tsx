import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { useAuth } from '../../lib/auth';
import { toast } from 'sonner';

export function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp');
      return;
    }
    setLoading(true);
    try {
      await register({ fullName: formData.name, email: formData.email, phone: formData.phone, password: formData.password });
      toast.success('Đăng ký thành công');
      navigate('/');
    } catch (err: any) {
      toast.error(err.message || 'Đăng ký thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left side - Image */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <div className="absolute inset-0 bg-foreground">
          <img
            src="https://images.unsplash.com/photo-1683290845409-280ec0dc39df?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBmYXNoaW9uJTIwYm91dGlxdWV8ZW58MXx8fHwxNzcxODEwNzA5fDA&ixlib=rb-4.1.0&q=80&w=1080"
            alt="Fashion"
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
          <div className="absolute bottom-12 left-12 right-12">
            <h2 className="text-3xl font-bold text-background mb-3">Tham gia cùng chúng tôi</h2>
            <p className="text-background/80 text-lg">Nhận ngay ưu đãi 20% cho đơn hàng đầu tiên.</p>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-10">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <Link to="/" className="inline-block mb-8">
              <span className="text-2xl font-bold tracking-wider">LEON</span>
            </Link>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">Tạo tài khoản</h1>
            <p className="text-muted-foreground">
              Đăng ký để nhận nhiều ưu đãi hấp dẫn
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm text-muted-foreground">Họ và tên</Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
                placeholder="Nguyễn Văn A"
                className="h-12 rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm text-muted-foreground">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
                placeholder="example@email.com"
                className="h-12 rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm text-muted-foreground">Số điện thoại</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                required
                placeholder="0901234567"
                className="h-12 rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm text-muted-foreground">Mật khẩu</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
                placeholder="Tối thiểu 6 ký tự"
                minLength={6}
                className="h-12 rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm text-muted-foreground">Xác nhận mật khẩu</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
                required
                placeholder="Nhập lại mật khẩu"
                minLength={6}
                className="h-12 rounded-xl"
              />
            </div>

            <Button type="submit" className="w-full h-12 rounded-xl font-medium" disabled={loading}>
              {loading ? 'Đang đăng ký...' : 'Đăng ký'}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Đã có tài khoản?{' '}
              <Link to="/login" className="text-foreground hover:underline font-medium">
                Đăng nhập ngay
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
