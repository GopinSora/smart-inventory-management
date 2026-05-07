import { forwardRef } from 'react';
import { cn } from '@/lib/helpers';

const Input = forwardRef(function Input({ className, error, ...props }, ref) {
  return (
    <input
      ref={ref}
      className={cn(
        'w-full bg-white dark:bg-[#1e1d1a] border rounded-lg px-3.5 py-2.5 text-sm text-ink-900 dark:text-[#f0ede6] placeholder:text-ink-400 dark:placeholder:text-[#7a7870] transition-colors',
        error
          ? 'border-rose-300 focus:border-rose-500'
          : 'border-cream-200 dark:border-[#38362f] focus:border-accent-600 dark:focus:border-orange-500',
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
        'w-full bg-white dark:bg-[#1e1d1a] border rounded-lg px-3.5 py-2.5 text-sm text-ink-900 dark:text-[#f0ede6] placeholder:text-ink-400 dark:placeholder:text-[#7a7870] transition-colors resize-none',
        error
          ? 'border-rose-300 focus:border-rose-500'
          : 'border-cream-200 dark:border-[#38362f] focus:border-accent-600 dark:focus:border-orange-500',
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
        'w-full bg-white dark:bg-[#1e1d1a] border rounded-lg px-3.5 py-2.5 text-sm text-ink-900 dark:text-[#f0ede6] transition-colors',
        error
          ? 'border-rose-300 focus:border-rose-500'
          : 'border-cream-200 dark:border-[#38362f] focus:border-accent-600 dark:focus:border-orange-500',
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
});
