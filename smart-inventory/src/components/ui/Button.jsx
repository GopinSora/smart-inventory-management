import { cn } from '@/lib/helpers';

const baseClasses = 'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed';

const variants = {
  primary: 'bg-accent-700 hover:bg-accent-800 active:bg-accent-800 text-cream-50 shadow-soft',
  secondary: 'bg-cream-100 hover:bg-cream-200 text-ink-900 border border-cream-200',
  ghost: 'bg-transparent hover:bg-cream-100 text-ink-700 border border-cream-200 hover:border-cream-300',
  danger: 'bg-rose-600 hover:bg-rose-700 text-white',
  'danger-ghost': 'bg-transparent hover:bg-rose-50 text-rose-700 border border-rose-200 hover:border-rose-300',
  link: 'bg-transparent text-accent-700 hover:text-accent-800 underline-offset-4 hover:underline',
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
