import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { useAuth } from '../../lib/auth';
import { toast } from 'sonner';
import { Lock, User, ArrowRight, Store } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';

export function AdminLoginPage() {
  const navigate = useNavigate();
  const { adminLogin } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await adminLogin(formData.username, formData.password);
      toast.success('Đăng nhập thành công');
      navigate('/admin');
    } catch (err: any) {
      toast.error(err.message || 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center mx-auto mb-4">
            <Store className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-wider">LEON</h1>
          <p className="text-muted-foreground text-sm">Admin Portal</p>
        </div>

          <Card className="border-0 shadow-xl">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl font-bold">Chào mừng trở lại</CardTitle>
              <CardDescription>Đăng nhập để quản lý cửa hàng của bạn</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-sm font-medium">Tên đăng nhập</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="username"
                      value={formData.username}
                      onChange={(e) =>
                        setFormData({ ...formData, username: e.target.value })
                      }
                      required
                      placeholder="Nhập tên đăng nhập"
                      className="pl-10 h-11 bg-muted/50 border-0"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">Mật khẩu</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      required
                      placeholder="Nhập mật khẩu"
                      className="pl-10 h-11 bg-muted/50 border-0"
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full h-11 mt-6" disabled={loading}>
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Đang đăng nhập...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Đăng nhập
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  )}
                </Button>
              </form>

              <div className="mt-6 pt-6 border-t text-center">
                <p className="text-xs text-muted-foreground">
                  Cần hỗ trợ? Liên hệ{' '}
                  <a href="mailto:support@leon.vn" className="text-primary hover:underline">
                    support@leon.vn
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>

          <p className="text-center text-xs text-muted-foreground mt-6">
            &copy; 2026 LEON. All rights reserved.
          </p>
        </div>
    </div>
  );
}
