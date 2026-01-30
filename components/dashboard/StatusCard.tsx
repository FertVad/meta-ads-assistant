import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

interface StatusCardProps {
  status: 'ok' | 'warning' | 'critical';
  count: number;
  label: string;
}

const STATUS_CONFIG = {
  ok: {
    icon: CheckCircle,
    color: 'text-green-600',
    bg: 'bg-green-50',
    border: 'border-green-200',
  },
  warning: {
    icon: AlertTriangle,
    color: 'text-yellow-600',
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
  },
  critical: {
    icon: XCircle,
    color: 'text-red-600',
    bg: 'bg-red-50',
    border: 'border-red-200',
  },
};

export default function StatusCard({ status, count, label }: StatusCardProps) {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;

  return (
    <div
      className={`${config.bg} ${config.border} border rounded-lg p-6 flex items-center gap-4`}
    >
      <Icon className={`w-12 h-12 ${config.color}`} />
      <div>
        <div className={`text-3xl font-bold ${config.color}`}>{count}</div>
        <div className="text-sm text-gray-600">{label}</div>
      </div>
    </div>
  );
}
