import * as React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'success' | 'destructive' | 'outline' | 'glass';
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-none px-2.5 py-1 text-[10px] font-black tracking-[.15em] uppercase transition-colors',
        {
          'bg-yellow-300 text-zinc-900 border border-zinc-900': variant === 'default',
          'bg-emerald-50 text-emerald-700 border border-emerald-200': variant === 'success',
          'bg-red-50 text-red-600 border border-red-200 font-black': variant === 'destructive',
          'bg-zinc-100 text-zinc-500 border border-zinc-200': variant === 'outline',
          'bg-white border border-zinc-200 text-zinc-900': variant === 'glass',
        },
        className
      )}
      {...props}
    />
  );
}

export { Badge };
