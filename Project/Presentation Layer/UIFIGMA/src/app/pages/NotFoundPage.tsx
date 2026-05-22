import { Link } from 'react-router';
import { Home } from 'lucide-react';
import { Button } from '../components/ui/button';

export function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-4">Không tìm thấy trang</h2>
        <p className="text-text-secondary mb-8">
          Trang bạn đang tìm kiếm không tồn tại hoặc đã được di chuyển.
        </p>
        <Link to="/">
          <Button>
            <Home className="h-4 w-4 mr-2" />
            Về trang chủ
          </Button>
        </Link>
      </div>
    </div>
  );
}
