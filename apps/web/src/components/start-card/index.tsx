import { cn } from '@/lib/utils';

type Props = {
  title: string;
  value: string | number;
  subtitle?: string;
  description?: string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
};

export default function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  description,
}: Props) {
  return (
    <div className="relative w-full overflow-hidden rounded-md bg-transparent p-6 shadow-md transition-all">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <div className="flex items-center gap-2">
            <div className="flex items-baseline space-x-2">
              <h3 className="text-2xl font-semibold text-gray-900">{value}</h3>
              {subtitle && (
                <span className="text-sm text-gray-500">{subtitle}</span>
              )}
            </div>

            {trend && (
              <p
                className={cn(
                  'text-sm font-medium',
                  trend.isPositive ? 'text-green-600' : 'text-red-600',
                )}
              >
                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
              </p>
            )}
          </div>
          {description && (
            <p className="mt-2 text-xs text-gray-500">{description}</p>
          )}
        </div>
        <div className="rounded-full bg-gray-100 p-3">{icon}</div>
      </div>
    </div>
  );
}
