import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { useAuth } from '../../lib/auth';
import { toast } from 'sonner';

export function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/';
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(formData.email, formData.password);
      toast.success('Đăng nhập thành công');
      navigate(redirectTo);
    } catch (err: any) {
      toast.error(err.message || 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-10">
        <div className="w-full max-w-sm">
          <div className="mb-10">
            <Link to="/" className="inline-block mb-8">
              <span className="text-2xl font-bold tracking-wider">LEON</span>
            </Link>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">Đăng nhập</h1>
            <p className="text-muted-foreground">
              Chào mừng bạn quay trở lại
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm text-muted-foreground">Email hoặc số điện thoại</Label>
              <Input
                id="email"
                type="text"
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
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm text-muted-foreground">Mật khẩu</Label>
                <Link
                  to="/forgot-password"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Quên mật khẩu?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
                placeholder="Nhập mật khẩu"
                className="h-12 rounded-xl"
              />
            </div>

            <Button type="submit" className="w-full h-12 rounded-xl font-medium" disabled={loading}>
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Chưa có tài khoản?{' '}
              <Link to="/register" className="text-foreground hover:underline font-medium">
                Đăng ký ngay
              </Link>
            </p>
          </form>
        </div>
      </div>

      {/* Right side - Image */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <div className="absolute inset-0 bg-foreground">
          <img
            src="https://images.unsplash.com/photo-1713165678471-0335104539e4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYXNoaW9uJTIwY29sbGVjdGlvbiUyMGJhbm5lciUyMG1vZGVybnxlbnwxfHx8fDE3NzE4MTA3MDh8MA&ixlib=rb-4.1.0&q=80&w=1080"
            alt="Fashion"
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
          <div className="absolute bottom-12 left-12 right-12">
            <h2 className="text-3xl font-bold text-background mb-3">Khám phá phong cách mới</h2>
            <p className="text-background/80 text-lg">Thời trang hiện đại, chất lượng cao cho mọi dịp.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
