import { forwardRef } from 'react';
import { cn } from '@/lib/helpers';

const Input = forwardRef(function Input({ className, error, ...props }, ref) {
  return (
    <input
      ref={ref}
      className={cn(
        'w-full bg-white border rounded-lg px-3.5 py-2.5 text-sm text-ink-900 placeholder:text-ink-400 transition-colors',
        error
          ? 'border-rose-300 focus:border-rose-500'
          : 'border-cream-200 focus:border-accent-600',
        className
      )}
      {...props}
    />
  );
});

export default Input;

export const Textarea = forwardRef(function Textarea({ className, error, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      className={cn(
        'w-full bg-white border rounded-lg px-3.5 py-2.5 text-sm text-ink-900 placeholder:text-ink-400 transition-colors resize-none',
        error
          ? 'border-rose-300 focus:border-rose-500'
          : 'border-cream-200 focus:border-accent-600',
        className
      )}
      {...props}
    />
  );
});

export const Select = forwardRef(function Select({ className, error, children, ...props }, ref) {
  return (
    <select
      ref={ref}
      className={cn(
        'w-full bg-white border rounded-lg px-3.5 py-2.5 text-sm text-ink-900 transition-colors',
        error
          ? 'border-rose-300 focus:border-rose-500'
          : 'border-cream-200 focus:border-accent-600',
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
});
