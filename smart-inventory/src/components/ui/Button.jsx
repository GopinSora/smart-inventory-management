import { cn } from '@/lib/helpers';

const baseClasses = 'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed';

const variants = {
  primary: 'bg-accent-700 hover:bg-accent-800 dark:bg-orange-600 dark:hover:bg-orange-500 active:bg-accent-800 text-cream-50 shadow-soft',
  secondary: 'bg-cream-100 dark:bg-[#2a2925] hover:bg-cream-200 dark:hover:bg-[#38362f] text-ink-900 dark:text-[#f0ede6] border border-cream-200 dark:border-[#38362f]',
  ghost: 'bg-transparent hover:bg-cream-100 dark:hover:bg-[#2a2925] text-ink-700 dark:text-[#b5b0a5] border border-cream-200 dark:border-[#38362f] hover:border-cream-300 dark:hover:border-[#6b6655]',
  danger: 'bg-rose-600 hover:bg-rose-700 text-white',
  'danger-ghost': 'bg-transparent hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900 hover:border-rose-300',
  link: 'bg-transparent text-accent-700 dark:text-orange-400 hover:text-accent-800 dark:hover:text-orange-300 underline-offset-4 hover:underline',
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-5 py-3 text-base',
  icon: 'p-2',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  className,
  ...props
}) {
  return (
    <button
      className={cn(baseClasses, variants[variant], sizes[size], className)}
      {...props}
    >
      {Icon && <Icon className={size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} strokeWidth={2.25} />}
      {children}
    </button>
  );
}
