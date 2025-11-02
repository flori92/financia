import { Badge } from './badge';
import { CurrencyCode, CURRENCIES } from '@/lib/currency';

interface CurrencyBadgeProps {
  currency: CurrencyCode;
  showName?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function CurrencyBadge({ 
  currency, 
  showName = false, 
  size = 'md' 
}: CurrencyBadgeProps) {
  const currencyInfo = CURRENCIES[currency];
  
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  return (
    <div className={`flex items-center gap-2 ${sizeClasses[size]} bg-blue-100 text-blue-800 rounded-full font-medium`}>
      <span>{currencyInfo.symbol}</span>
      {showName && <span>{currencyInfo.name}</span>}
    </div>
  );
}
