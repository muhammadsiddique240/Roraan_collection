import * as React from 'react';
import { cn } from '@/lib/utils';
import { motion, HTMLMotionProps } from 'motion/react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'glass';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center whitespace-nowrap text-[11px] font-black ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 uppercase tracking-[0.1em]',
          {
            'bg-yellow-300 text-zinc-900 hover:bg-yellow-400 border-2 border-zinc-900 shadow-brutalist hover:shadow-brutalist-hover hover:-translate-y-0.5 hover:-translate-x-0.5': variant === 'default',
            'border-2 border-zinc-900 bg-white hover:bg-zinc-50 text-zinc-900 shadow-brutalist hover:shadow-brutalist-hover hover:-translate-y-0.5 hover:-translate-x-0.5': variant === 'outline',
            'hover:bg-zinc-100 text-zinc-600 hover:text-zinc-900': variant === 'ghost',
            'bg-white border border-zinc-200 text-zinc-900': variant === 'glass',
            'h-12 px-8': size === 'default',
            'h-9 rounded-none px-5 text-xs': size === 'sm',
            'h-16 rounded-none px-12 text-sm': size === 'lg',
            'h-10 w-10': size === 'icon',
          },
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button };
