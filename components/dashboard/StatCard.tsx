import { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/Card';

interface StatCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  color: string;
}

export function StatCard({ title, value, icon: Icon, color }: StatCardProps) {
  return (
    <Card className="p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs md:text-sm text-gray-500">{title}</p>
          <p className="text-2xl md:text-3xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div 
          className="w-10 h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${color}20` }}
        >
          <Icon className="w-5 h-5 md:w-6 md:h-6" style={{ color }} />
        </div>
      </div>
    </Card>
  );
}
