import { Badge } from './ui/badge';
import { cn } from './ui/utils';

type OrderStatus = 'pending' | 'confirmed' | 'shipping' | 'completed' | 'cancelled';
type PaymentStatus = 'paid' | 'unpaid';

interface StatusBadgeProps {
  status: OrderStatus | PaymentStatus;
  type?: 'order' | 'payment';
  showDot?: boolean;
}

export function StatusBadge({ status, type = 'order', showDot = true }: StatusBadgeProps) {
  const statusConfig = {
    // Order statuses
    pending: {
      label: 'Chờ xử lý',
      variant: 'outline' as const,
      className: 'border-info text-info bg-info/10',
      dotClass: 'bg-info',
    },
    confirmed: {
      label: 'Đã xác nhận',
      variant: 'outline' as const,
      className: 'border-primary text-primary bg-primary/10',
      dotClass: 'bg-primary',
    },
    shipping: {
      label: 'Đang giao',
      variant: 'outline' as const,
      className: 'border-warning text-warning bg-warning/10',
      dotClass: 'bg-warning',
    },
    completed: {
      label: 'Hoàn thành',
      variant: 'outline' as const,
      className: 'border-success text-success bg-success/10',
      dotClass: 'bg-success',
    },
    cancelled: {
      label: 'Đã hủy',
      variant: 'outline' as const,
      className: 'border-destructive text-destructive bg-destructive/10',
      dotClass: 'bg-destructive',
    },
    // Payment statuses
    paid: {
      label: 'Đã thanh toán',
      variant: 'outline' as const,
      className: 'border-success text-success bg-success/10',
      dotClass: 'bg-success',
    },
    unpaid: {
      label: 'Chưa thanh toán',
      variant: 'outline' as const,
      className: 'border-destructive text-destructive bg-destructive/10',
      dotClass: 'bg-destructive',
    },
  };

  const key = (status ?? '').toLowerCase() as keyof typeof statusConfig;
  const config = statusConfig[key] ?? { 
    label: status || '—', 
    variant: 'outline' as const,
    className: 'border-muted-foreground text-muted-foreground bg-muted',
    dotClass: 'bg-muted-foreground',
  };

  return (
    <Badge 
      variant={config.variant}
      className={cn(
        'font-medium gap-1.5 px-2.5 py-0.5',
        config.className
      )}
    >
      {showDot && (
        <span className={cn('w-1.5 h-1.5 rounded-full', config.dotClass)} />
      )}
      {config.label}
    </Badge>
  );
}
